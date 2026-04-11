"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

function toText(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function upsertClientProfileAction(formData: FormData) {
  const fullName = toText(formData.get("full_name"));
  const phone = toText(formData.get("phone"));
  const city = toText(formData.get("city"));
  const provincia = toText(formData.get("provincia")).toUpperCase();
  const avatarFile = formData.get("avatar");

  if (!fullName) {
    redirect("/dashboard/cliente/profilo?error=Il%20nome%20completo%20%C3%A8%20obbligatorio.");
  }

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    redirect("/login?error=Sessione%20scaduta.%20Effettua%20nuovamente%20l'accesso.");
  }

  const { data: currentProfile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (currentProfile?.role === "professionista") {
    redirect("/dashboard/professionista/profilo?error=Questo%20profilo%20%C3%A8%20riservato%20ai%20clienti.");
  }

  let avatarUrl: string | null = null;
  if (avatarFile instanceof File && avatarFile.size > 0) {
    const extension = avatarFile.name.includes(".") ? avatarFile.name.split(".").pop() : "jpg";
    const objectPath = `${user.id}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(objectPath, avatarFile, { upsert: true, contentType: avatarFile.type || "image/jpeg" });

    if (uploadError) {
      redirect(`/dashboard/cliente/profilo?error=${encodeURIComponent("Upload foto fallito: " + uploadError.message)}`);
    }

    const { data: publicData } = supabase.storage.from("profile-images").getPublicUrl(objectPath);
    avatarUrl = publicData.publicUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
      city: city || null,
      provincia: provincia || null,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/dashboard/cliente/profilo?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/cliente");
  revalidatePath("/dashboard/cliente/profilo");
  redirect("/dashboard/cliente/profilo?success=Profilo%20cliente%20aggiornato%20con%20successo.");
}
