"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

function toText(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function createReviewAction(formData: FormData) {
  const professionalId = toText(formData.get("professional_id"));
  const quoteId = toText(formData.get("quote_id"));
  const requestId = toText(formData.get("request_id"));
  const rating = Number(toText(formData.get("rating")));
  const comment = toText(formData.get("comment"));

  if (!professionalId || !quoteId || !requestId || !Number.isFinite(rating) || rating < 1 || rating > 5) {
    redirect(`/professionisti/${professionalId}?error=Recensione%20non%20valida.`);
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

  if (quoteError || !quote || quote.status !== "accepted") {
    redirect(`/professionisti/${professionalId}?error=Puoi%20recensire%20solo%20preventivi%20accettati.`);
  }

  const { data: requestOwner, error: requestOwnerError } = await supabase
    .from("requests")
    .select("client_id")
    .eq("id", quote.request_id)
    .single();

  if (
    requestOwnerError ||
    !requestOwner ||
    requestOwner.client_id !== user.id ||
    quote.professional_id !== professionalId ||
    quote.request_id !== requestId
  ) {
    redirect(`/professionisti/${professionalId}?error=Non%20puoi%20lasciare%20questa%20recensione.`);
  }

  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("quote_id", quoteId)
    .eq("client_id", user.id)
    .maybeSingle();

  if (existingReview) {
    redirect(`/professionisti/${professionalId}?error=Hai%20gia%20recensito%20questo%20preventivo.`);
  }

  const { error } = await supabase.from("reviews").insert({
    professional_id: professionalId,
    client_id: user.id,
    quote_id: quoteId,
    request_id: requestId,
    rating,
    comment: comment || null,
  });

  if (error) {
    redirect(`/professionisti/${professionalId}?error=${encodeURIComponent("Errore durante il salvataggio: " + error.message)}`);
  }

  revalidatePath(`/professionisti/${professionalId}`);
  revalidatePath("/professionisti");
  redirect(`/professionisti/${professionalId}?success=Recensione%20inviata%20con%20successo.`);
}
