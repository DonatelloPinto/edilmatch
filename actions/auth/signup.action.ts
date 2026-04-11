"use server";

import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { env } from "@/lib/config/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type Role = "cliente" | "professionista";

function toMessage(value: string) {
  return encodeURIComponent(value);
}

function getRole(value: FormDataEntryValue | null): Role {
  if (value === "cliente" || value === "professionista") {
    return value;
  }
  return "cliente";
}

function randomReferralCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "EDIL-";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = getRole(formData.get("role"));
  const referralCodeInput = String(formData.get("referral_code") ?? "")
    .trim()
    .toUpperCase();

  if (!email || !password) {
    redirect(`/registrazione?error=${toMessage("Email e password sono obbligatorie.")}`);
  }

  const supabase = await getSupabaseServerClient();
  const emailRedirectTo = env.NEXT_PUBLIC_APP_URL ? `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback` : undefined;

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        role,
      },
    },
  });

  if (error) {
    redirect(`/registrazione?error=${toMessage(error.message)}`);
  }

  const newUser = signUpData.user;

  if (role === "professionista" && newUser) {
    let credits = 5;
    let referrerId: string | null = null;

    if (referralCodeInput) {
      const { data: refProfile } = await supabase
        .from("professional_profiles")
        .select("user_id")
        .eq("referral_code", referralCodeInput)
        .maybeSingle();
      if (refProfile?.user_id && refProfile.user_id !== newUser.id) {
        referrerId = refProfile.user_id;
        credits = 3;
      }
    }

    let code = randomReferralCode();
    for (let i = 0; i < 5; i++) {
      const { data: clash } = await supabase.from("professional_profiles").select("user_id").eq("referral_code", code).maybeSingle();
      if (!clash) break;
      code = randomReferralCode();
    }

    await supabase.from("professional_profiles").upsert(
      {
        user_id: newUser.id,
        credits_remaining: credits,
        referral_code: code,
      },
      { onConflict: "user_id" },
    );

    if (referrerId && env.SUPABASE_SERVICE_ROLE_KEY && env.NEXT_PUBLIC_SUPABASE_URL) {
      const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
      const { data: refRow } = await admin.from("professional_profiles").select("credits_remaining").eq("user_id", referrerId).single();
      const nextCredits = (refRow?.credits_remaining ?? 0) + 2;
      await admin.from("professional_profiles").update({ credits_remaining: nextCredits }).eq("user_id", referrerId);
      await admin.from("referrals").insert({
        referrer_id: referrerId,
        referred_email: email,
        status: "completed",
        reward_credited: true,
      });
    }
  }

  redirect(
    `/login?message=${toMessage("Registrazione completata. Controlla la tua email per confermare l'account.")}`,
  );
}
