import Link from "next/link";
import { notFound } from "next/navigation";

import { submitTenderOfferAction } from "@/actions/tenders/submit-offer.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AppaltoDetailPage(props: PageProps) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const success = pickText(searchParams.success);
  const error = pickText(searchParams.error);

  const supabase = await getSupabaseServerClient();
  const { data: tender } = await supabase.from("tenders").select("*").eq("id", id).single();

  if (!tender) notFound();

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  let isPro = false;
  let isProPlan = false;
  if (user) {
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    isPro = prof?.role === "professionista";
    if (isPro) {
      const { data: pp } = await supabase.from("professional_profiles").select("subscription_plan").eq("user_id", user.id).maybeSingle();
      isProPlan = pp?.subscription_plan === "pro";
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-10">
      <div className="container-app max-w-2xl space-y-6">
        <Link href="/appalti" className="text-sm text-[var(--color-muted)] hover:underline">
          ← Tutte le gare
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>{tender.title}</CardTitle>
            <p className="text-sm text-[var(--color-muted)]">
              {tender.category ?? "—"} · {tender.location ?? ""} ({tender.province ?? "--"})
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {success ? <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-800">{success}</p> : null}
            {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-800">{error}</p> : null}
            <p className="whitespace-pre-line text-[var(--color-muted)]">{tender.description ?? ""}</p>
            <p>
              <strong>Budget massimo:</strong>{" "}
              {tender.budget != null ? `€ ${Number(tender.budget).toLocaleString("it-IT")}` : "—"}
            </p>
            <p>
              <strong>Scadenza:</strong> {tender.deadline ? new Date(tender.deadline).toLocaleString("it-IT") : "—"}
            </p>
          </CardContent>
        </Card>

        {tender.status === "open" && isPro && isProPlan ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invia offerta</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={submitTenderOfferAction} className="space-y-4">
                <input type="hidden" name="tender_id" value={tender.id} />
                <div className="space-y-2">
                  <Label htmlFor="offer_amount">Importo offerta (€)</Label>
                  <Input id="offer_amount" name="offer_amount" type="number" step="0.01" min="0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Note</Label>
                  <textarea id="notes" name="notes" className="min-h-24 w-full rounded-md border border-input px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document_url">Link documento PDF (opzionale, es. URL da Storage)</Label>
                  <Input id="document_url" name="document_url" type="url" placeholder="https://..." />
                </div>
                <SubmitButton label="Invia offerta" pendingLabel="Invio..." className="bg-[var(--color-orange)] text-white" />
              </form>
            </CardContent>
          </Card>
        ) : tender.status === "open" && isPro && !isProPlan ? (
          <Card>
            <CardContent className="py-6 text-sm text-[var(--color-muted)]">
              Passa al piano Pro per partecipare alle gare.{" "}
              <Link href="/dashboard/professionista/abbonamento" className="font-medium text-[var(--color-orange)] hover:underline">
                Abbonamento
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
