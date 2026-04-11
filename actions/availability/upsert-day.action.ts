"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function upsertAvailabilityDayAction(formData: FormData) {
  const date = String(formData.get("date") ?? "").trim();
  const slotsRaw = String(formData.get("slots_json") ?? "[]");

  let slots: string[] = [];
  try {
    slots = JSON.parse(slotsRaw) as string[];
  } catch {
    redirect("/dashboard/professionista/disponibilita?error=Formato%20non%20valido.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    redirect("/dashboard/professionista/disponibilita?error=Data%20non%20valida.");
  }

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "professionista") {
    redirect("/dashboard/professionista/disponibilita?error=Accesso%20negato.");
  }

  const allowed = new Set(["morning", "afternoon", "evening"]);
  const cleaned = slots.filter((s) => allowed.has(s));

  if (cleaned.length === 0) {
    await supabase.from("professional_availability").delete().eq("professional_id", user.id).eq("date", date);
  } else {
    const { error } = await supabase.from("professional_availability").upsert(
      {
        professional_id: user.id,
        date,
        time_slots: cleaned,
      },
      { onConflict: "professional_id,date" },
    );
    if (error) {
      redirect(`/dashboard/professionista/disponibilita?error=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath("/dashboard/professionista/disponibilita");
  revalidatePath(`/professionisti/${user.id}`);
  redirect("/dashboard/professionista/disponibilita?success=Disponibilita%20salvata.");
}
