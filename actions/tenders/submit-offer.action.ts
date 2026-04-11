"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

function toText(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function submitTenderOfferAction(formData: FormData) {
  const tenderId = toText(formData.get("tender_id"));
  const amountRaw = toText(formData.get("offer_amount"));
  const notes = toText(formData.get("notes"));
  const documentUrl = toText(formData.get("document_url"));

  const amount = Number(amountRaw.replace(",", "."));
  if (!tenderId || !Number.isFinite(amount) || amount <= 0) {
    redirect(`/appalti/${tenderId}?error=Importo%20non%20valido.`);
  }

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) redirect("/login?next=/appalti");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "professionista") {
    redirect("/appalti?error=Solo%20i%20professionisti%20possono%20offrire.");
  }

  const { data: pro } = await supabase
    .from("professional_profiles")
    .select("subscription_plan")
    .eq("user_id", user.id)
    .single();

  if (pro?.subscription_plan !== "pro") {
    redirect(`/appalti/${tenderId}?error=Serve%20il%20piano%20Pro%20per%20partecipare%20alle%20gare.`);
  }

  const { error } = await supabase.from("tender_offers").insert({
    tender_id: tenderId,
    professional_id: user.id,
    offer_amount: amount,
    notes: notes || null,
    document_url: documentUrl || null,
  });

  if (error) {
    redirect(`/appalti/${tenderId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/appalti");
  revalidatePath(`/appalti/${tenderId}`);
  redirect(`/appalti/${tenderId}?success=Offerta%20inviata.`);
}
