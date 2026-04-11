"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

function toText(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function acceptQuoteAction(formData: FormData) {
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
    .select("id, request_id, professional_id, status")
    .eq("id", quoteId)
    .single();

  if (quoteError || !quote) {
    redirect(`${redirectTo}?error=Preventivo%20non%20trovato.`);
  }

  const { data: requestOwner, error: requestOwnerError } = await supabase
    .from("requests")
    .select("client_id")
    .eq("id", quote.request_id)
    .single();

  if (requestOwnerError || !requestOwner || requestOwner.client_id !== user.id) {
    redirect(`${redirectTo}?error=Non%20sei%20autorizzato%20ad%20accettare%20questo%20preventivo.`);
  }

  const { error: acceptError } = await supabase.from("quotes").update({ status: "accepted" }).eq("id", quote.id);

  if (acceptError) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Errore durante l'accettazione: " + acceptError.message)}`);
  }

  await supabase
    .from("quotes")
    .update({ status: "rejected" })
    .eq("request_id", quote.request_id)
    .neq("id", quote.id)
    .in("status", ["sent"]);

  await supabase.from("requests").update({ status: "in_progress" }).eq("id", quote.request_id);

  const { data: conversation } = await supabase
    .from("conversations")
    .upsert(
      {
        client_id: requestOwner.client_id,
        professional_id: quote.professional_id,
        request_id: quote.request_id,
      },
      { onConflict: "client_id,professional_id,request_id" },
    )
    .select("id")
    .single();

  revalidatePath("/dashboard/cliente");
  revalidatePath("/dashboard/cliente/richiesta");
  revalidatePath("/dashboard/messaggi");
  revalidatePath("/professionisti");

  if (conversation?.id) {
    redirect(
      `/dashboard/messaggi?conversation=${conversation.id}&success=${encodeURIComponent("Preventivo accettato. Apri la chat per organizzare il lavoro.")}`,
    );
  }

  redirect(`${redirectTo}?success=Preventivo%20accettato.%20Contatta%20il%20professionista%20per%20organizzare%20il%20lavoro.`);
}
