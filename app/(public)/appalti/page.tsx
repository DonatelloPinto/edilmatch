import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppaltiPage() {
  const supabase = await getSupabaseServerClient();
  const { data: tenders } = await supabase
    .from("tenders")
    .select("id, title, category, budget, deadline, location, province, status")
    .eq("status", "open")
    .order("deadline", { ascending: true });

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-10">
      <div className="container-app max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-navy)]">Gare d&apos;appalto</h1>
          <p className="mt-2 text-[var(--color-muted)]">Opportunità per imprese: solo account Pro possono inviare un&apos;offerta.</p>
        </div>

        <div className="grid gap-4">
          {(tenders ?? []).length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-[var(--color-muted)]">Nessuna gara aperta al momento.</CardContent>
            </Card>
          ) : (
            (tenders ?? []).map((t) => (
              <Card key={t.id} className="card-investor">
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{t.title}</CardTitle>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {t.category ?? "Edilizia"} · {t.location ?? "-"} ({t.province ?? "--"})
                    </p>
                  </div>
                  <Button asChild size="sm" className="bg-[var(--color-navy)] text-white">
                    <Link href={`/appalti/${t.id}`}>Dettaglio</Link>
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4 text-sm text-[var(--color-muted)]">
                  <span>Budget max: {t.budget != null ? `€ ${Number(t.budget).toLocaleString("it-IT")}` : "—"}</span>
                  <span>
                    Scadenza: {t.deadline ? new Date(t.deadline).toLocaleDateString("it-IT") : "—"}
                  </span>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
