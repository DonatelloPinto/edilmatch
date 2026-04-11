import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

type Role = "cliente" | "professionista";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", authData.user.id).single();
  const profileRole = (profile as { role?: Role } | null)?.role;
  const fallbackRole = authData.user.user_metadata?.role as Role | undefined;
  const role = profileRole ?? fallbackRole ?? "cliente";

  if (role === "professionista") {
    redirect("/dashboard/professionista");
  }

  redirect("/dashboard/cliente");
}
