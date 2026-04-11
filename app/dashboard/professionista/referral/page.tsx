import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { env } from "@/lib/config/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function ReferralPage() {
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", authData.user.id).maybeSingle();
  if (profile?.role !== "professionista") redirect("/dashboard/cliente");

  const { data: proRow } = await supabase.from("professional_profiles").select("referral_code, credits_remaining").eq("user_id", authData.user.id).maybeSingle();

  let displayCode = proRow?.referral_code ?? null;
  if (!displayCode && env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    const code = `EDIL-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    await admin.from("professional_profiles").update({ referral_code: code }).eq("user_id", authData.user.id);
    displayCode = code;
  }

  const { data: invites } = await supabase
    .from("referrals")
    .select("referred_email, status, reward_credited, created_at")
    .eq("referrer_id", authData.user.id)
    .order("created_at", { ascending: false });

  const baseUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const shareUrl = `${baseUrl}/registrazione`;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8">
      <div className="container-app max-w-2xl space-y-4">
        <Card className="border-[var(--color-orange)] bg-[var(--color-orange-light)]">
          <CardContent className="pt-6 text-sm font-medium text-[var(--color-navy)]">
            Invita un collega e guadagna 2 crediti gratis quando si registra con il tuo codice!
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Il tuo codice referral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="rounded-lg bg-slate-100 px-4 py-3 font-mono text-xl font-bold tracking-wider">{displayCode ?? "—"}</p>
            <p className="text-xs text-[var(--color-muted)]">
              Link: {shareUrl} — chiedi al collega di inserire il codice in registrazione (campo opzionale).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inviti</CardTitle>
          </CardHeader>
          <CardContent>
            {!invites?.length ? (
              <p className="text-sm text-[var(--color-muted)]">Nessun invito ancora.</p>
            ) : (
              <ul className="divide-y divide-[var(--color-border)] text-sm">
                {invites.map((row) => (
                  <li key={`${row.referred_email}-${row.created_at}`} className="flex justify-between py-2">
                    <span>{row.referred_email}</span>
                    <span className="text-[var(--color-muted)]">{row.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Link href="/dashboard/professionista" className="text-sm text-[var(--color-muted)] hover:underline">
          Torna alla dashboard
        </Link>
      </div>
    </main>
  );
}
