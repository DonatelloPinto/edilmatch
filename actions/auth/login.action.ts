"use server";

import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

function toMessage(value: string) {
  return encodeURIComponent(value);
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(`/login?error=${toMessage("Email e password sono obbligatorie.")}`);
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${toMessage(error.message)}`);
  }

  redirect("/dashboard");
}
