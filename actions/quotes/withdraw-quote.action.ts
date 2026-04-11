"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

function toText(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function withdrawQuoteAction(formData: FormData) {
  const quoteId = toText(formData.get("quote_id"));

  if (!quoteId) {
    redirect("/dashboard/professionista?tab=preventivi&error=Preventivo%20non%20valido.");
  }

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    redirect("/login?error=Sessione%20non%20valida.%20Effettua%20di%20nuovo%20l'accesso.");
  }

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("id, professional_id, status")
    .eq("id", quoteId)
    .single();

  if (quoteError || !quote) {
    redirect("/dashboard/professionista?tab=preventivi&error=Preventivo%20non%20trovato.");
  }

  if (quote.professional_id !== user.id) {
    redirect("/dashboard/professionista?tab=preventivi&error=Non%20autorizzato.");
  }

  if (quote.status !== "sent") {
    redirect("/dashboard/professionista?tab=preventivi&error=Puoi%20ritirare%20solo%20preventivi%20inviati.");
  }

  const { error } = await supabase.from("quotes").update({ status: "withdrawn" }).eq("id", quote.id);
  if (error) {
    redirect(`/dashboard/professionista?tab=preventivi&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/professionista");
  redirect("/dashboard/professionista?tab=preventivi&success=Preventivo%20ritirato%20con%20successo.");
}
