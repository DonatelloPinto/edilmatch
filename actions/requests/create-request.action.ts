"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { geocodeAddressIt } from "@/lib/geocode-server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function toText(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

function parseBudget(value: string): number | null {
  if (!value) return null;
  const normalized = value.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export async function createRequestAction(formData: FormData) {
  const title = toText(formData.get("title"));
  const description = toText(formData.get("description"));
  const categoria = toText(formData.get("categoria"));
  const city = toText(formData.get("city"));
  const provincia = toText(formData.get("provincia")).toUpperCase();
  const addressLine = toText(formData.get("address_line"));
  const budgetIndicativo = parseBudget(toText(formData.get("budget_indicativo")));

  if (!title || !description || !categoria || !city || !provincia) {
    redirect("/dashboard/cliente/nuova-richiesta?error=Compila%20tutti%20i%20campi%20obbligatori.");
  }

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    redirect("/login?error=Sessione%20non%20valida.%20Effettua%20di%20nuovo%20l'accesso.");
  }

  const geoQuery = addressLine
    ? `${addressLine}, ${city}, ${provincia}, Italia`
    : `${city}, ${provincia}, Italia`;
  const coords = await geocodeAddressIt(geoQuery);

  const { error } = await supabase.from("requests").insert({
    client_id: user.id,
    title,
    description,
    categoria,
    city,
    provincia,
    address: addressLine || null,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    budget_min: budgetIndicativo,
    budget_max: budgetIndicativo,
    status: "open",
  });

  if (error) {
    redirect(
      `/dashboard/cliente/nuova-richiesta?error=${encodeURIComponent(
        "Errore durante la creazione della richiesta: " + error.message,
      )}`,
    );
  }

  revalidatePath("/dashboard/cliente");
  redirect("/dashboard/cliente?success=Richiesta%20pubblicata%20con%20successo.");
}
