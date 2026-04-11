"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

function toText(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function createQuoteAction(formData: FormData) {
  const requestId = toText(formData.get("request_id"));
  const amount = Number(toText(formData.get("amount")).replace(",", "."));
  const message = toText(formData.get("message"));

  if (!requestId || !Number.isFinite(amount) || amount <= 0) {
    redirect("/dashboard/professionista?error=Dati%20preventivo%20non%20validi.");
  }

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    redirect("/login?error=Sessione%20non%20valida.%20Effettua%20di%20nuovo%20l'accesso.");
  }

  const { data: professionalProfile } = await supabase
    .from("professional_profiles")
    .select("credits_remaining")
    .eq("user_id", user.id)
    .single();

  const availableCredits = professionalProfile?.credits_remaining ?? 0;

  if (availableCredits <= 0) {
    redirect(
      "/dashboard/professionista?error=Crediti%20esauriti.%20Passa%20al%20piano%20Pro%20per%20inviare%20altri%20preventivi.",
    );
  }

  const { data: updatedCredits, error: debitError } = await supabase
    .from("professional_profiles")
    .update({ credits_remaining: availableCredits - 1 })
    .eq("user_id", user.id)
    .eq("credits_remaining", availableCredits)
    .select("credits_remaining")
    .single();

  if (debitError || !updatedCredits) {
    redirect(
      "/dashboard/professionista?error=Impossibile%20scalare%20i%20crediti.%20Riprova%20tra%20pochi%20secondi.",
    );
  }

  const { error } = await supabase.from("quotes").insert({
    request_id: requestId,
    professional_id: user.id,
    amount,
    message: message || null,
    status: "sent",
  });

  if (error) {
    // Best-effort credit rollback when quote insert fails after debit.
    await supabase
      .from("professional_profiles")
      .update({ credits_remaining: availableCredits })
      .eq("user_id", user.id);

    redirect(
      `/dashboard/professionista?error=${encodeURIComponent(
        "Impossibile inviare il preventivo: " + error.message,
      )}`,
    );
  }

  revalidatePath("/dashboard/professionista");
  redirect(
    `/dashboard/professionista?success=${encodeURIComponent(
      `Preventivo inviato con successo. Crediti rimasti: ${updatedCredits.credits_remaining}.`,
    )}`,
  );
}
