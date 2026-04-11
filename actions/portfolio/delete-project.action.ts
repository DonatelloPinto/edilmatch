"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

function toText(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function deletePortfolioProjectAction(formData: FormData) {
  const projectId = toText(formData.get("project_id"));
  if (!projectId) {
    redirect("/dashboard/professionista/portfolio?error=Progetto%20non%20valido.");
  }

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) redirect("/login");

  const { error } = await supabase.from("portfolio_projects").delete().eq("id", projectId).eq("professional_id", user.id);

  if (error) {
    redirect(`/dashboard/professionista/portfolio?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/professionista/portfolio");
  revalidatePath(`/professionisti/${user.id}`);
  revalidatePath("/");
  redirect("/dashboard/professionista/portfolio?success=Progetto%20rimosso.");
}
