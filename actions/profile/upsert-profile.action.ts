"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

function toText(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizeUrl(value: string): string | null {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

export async function upsertProfileAction(formData: FormData) {
  const fullName = toText(formData.get("full_name"));
  const phone = toText(formData.get("phone"));
  const provincia = toText(formData.get("provincia")).toUpperCase();
  const city = toText(formData.get("business_city"));
  const companyName = toText(formData.get("company_name"));
  const vatNumber = toText(formData.get("vat_number"));
  const businessAddress = toText(formData.get("business_address"));
  const businessCity = toText(formData.get("business_city"));
  const businessProvincia = toText(formData.get("business_provincia")).toUpperCase();
  const bio = toText(formData.get("bio"));
  const yearsExperience = Number(toText(formData.get("years_experience")));
  const websiteUrl = sanitizeUrl(toText(formData.get("website_url")));
  const categories = splitCsv(toText(formData.get("services")));
  const provincesCovered = splitCsv(toText(formData.get("provinces_covered"))).map((item) => item.toUpperCase());
  const avatarFile = formData.get("avatar");

  if (!fullName || !provincia) {
    redirect("/dashboard/professionista/profilo?error=Nome%20e%20provincia%20sono%20obbligatori.");
  }

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    redirect("/login?error=Sessione%20scaduta.%20Effettua%20nuovamente%20l'accesso.");
  }

  const { data: currentProfile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (currentProfile?.role === "cliente") {
    redirect("/dashboard/cliente/profilo?error=Questo%20profilo%20%C3%A8%20riservato%20ai%20professionisti.");
  }

  let avatarUrl: string | null = null;
  if (avatarFile instanceof File && avatarFile.size > 0) {
    const extension = avatarFile.name.includes(".") ? avatarFile.name.split(".").pop() : "jpg";
    const objectPath = `${user.id}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(objectPath, avatarFile, { upsert: true, contentType: avatarFile.type || "image/jpeg" });

    if (uploadError) {
      redirect(`/dashboard/professionista/profilo?error=${encodeURIComponent("Upload foto fallito: " + uploadError.message)}`);
    }

    const { data: publicData } = supabase.storage.from("profile-images").getPublicUrl(objectPath);
    avatarUrl = publicData.publicUrl;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
      city: city || null,
      provincia,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", user.id);

  if (profileError) {
    redirect(`/dashboard/professionista/profilo?error=${encodeURIComponent(profileError.message)}`);
  }

  const { error: professionalError } = await supabase.from("professional_profiles").upsert(
    {
      user_id: user.id,
      company_name: companyName || null,
      vat_number: vatNumber || null,
      business_address: businessAddress || null,
      business_city: businessCity || null,
      business_provincia: businessProvincia || null,
      bio: bio || null,
      years_experience: Number.isFinite(yearsExperience) ? yearsExperience : null,
      website_url: websiteUrl,
      services: categories,
      provinces_covered: provincesCovered.length ? provincesCovered : [provincia],
    },
    { onConflict: "user_id" },
  );

  if (professionalError) {
    redirect(`/dashboard/professionista/profilo?error=${encodeURIComponent(professionalError.message)}`);
  }

  revalidatePath("/dashboard/professionista");
  revalidatePath(`/professionisti/${user.id}`);
  redirect("/dashboard/professionista/profilo?success=Profilo%20aggiornato%20con%20successo.");
}
