"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

function toText(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function rejectQuoteAction(formData: FormData) {
  const quoteId = toText(formData.get("quote_id"));
  const redirectTo = toText(formData.get("redirect_to")) || "/dashboard/cliente";

  if (!quoteId) {
    redirect(`${redirectTo}?error=Preventivo%20non%20valido.`);
  }

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    redirect("/login?error=Sessione%20non%20valida.%20Effettua%20di%20nuovo%20l'accesso.");
  }

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("id, request_id, status")
    .eq("id", quoteId)
    .single();

  if (quoteError || !quote) {
    redirect(`${redirectTo}?error=Preventivo%20non%20trovato.`);
  }

  const { data: requestOwner } = await supabase.from("requests").select("client_id").eq("id", quote.request_id).single();

  if (!requestOwner || requestOwner.client_id !== user.id) {
    redirect(`${redirectTo}?error=Non%20autorizzato.`);
  }

  const { error } = await supabase.from("quotes").update({ status: "rejected" }).eq("id", quote.id).eq("status", "sent");

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/cliente");
  revalidatePath("/dashboard/cliente/richiesta");
  redirect(`${redirectTo}?success=Preventivo%20rifiutato.`);
}
