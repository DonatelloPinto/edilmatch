import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pickText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AbbonamentoPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const success = pickText(searchParams.success);
  const error = pickText(searchParams.error);
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const { data: professionalProfile } = await supabase
    .from("professional_profiles")
    .select("subscription_plan, credits_remaining")
    .eq("user_id", authData.user.id)
    .single();

  const currentPlan = professionalProfile?.subscription_plan ?? "free";
  const credits = professionalProfile?.credits_remaining ?? 0;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-10">
      <div className="container-app max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold">Scegli il tuo piano</h1>
        {success ? <p className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{success}</p> : null}
        {error ? <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="card-investor border border-[var(--color-border)] bg-slate-50">
            <CardHeader>
              <CardTitle>FREE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-4xl font-bold">0€/mese</p>
              <ul className="space-y-1 text-sm text-[var(--color-muted)]">
                <li>✓ Accesso base alla piattaforma</li>
                <li>✓ 5 crediti iniziali</li>
                <li>✗ Priorita nei risultati</li>
                <li>✗ Supporto dedicato</li>
              </ul>
              <Button disabled variant="outline">
                {currentPlan === "free" ? "Piano attuale" : "Piano base"}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-investor border-2 border-[var(--color-orange)] bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                PRO <span className="rounded-full bg-[var(--color-orange-light)] px-2 py-1 text-xs text-[var(--color-orange)]">Piu popolare</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-4xl font-bold">49€/mese</p>
              <ul className="space-y-1 text-sm text-[var(--color-muted)]">
                <li>✓ Preventivi illimitati</li>
                <li>✓ Badge verificato</li>
                <li>✓ Priorita nei risultati</li>
                <li>✓ Supporto dedicato</li>
              </ul>
              {currentPlan === "pro" ? (
                <Button disabled className="bg-[var(--color-navy)] text-white">
                  Piano attuale
                </Button>
              ) : (
                <form action="/api/stripe/checkout" method="POST">
                  <Button type="submit" className="bg-[var(--color-orange)] text-white hover:bg-[var(--color-navy-mid)]">
                    Passa a Pro
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
        <p className="mt-6 text-center text-sm text-[var(--color-muted)]">Cancella quando vuoi · Nessun vincolo · Crediti attuali: {credits}</p>
      </div>
    </main>
  );
}
