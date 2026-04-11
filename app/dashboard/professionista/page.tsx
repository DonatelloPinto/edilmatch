import { redirect } from "next/navigation";

import { createQuoteAction } from "@/actions/quotes/create-quote.action";
import { withdrawQuoteAction } from "@/actions/quotes/withdraw-quote.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequestCard } from "@/components/cards/RequestCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pickText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function DashboardProfessionistaPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const errorMessage = pickText(searchParams.error);
  const successMessage = pickText(searchParams.success);
  const tab = pickText(searchParams.tab) || "richieste";
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", authData.user.id).single();
  const { data: professionalProfile } = await supabase
    .from("professional_profiles")
    .select("credits_remaining, subscription_plan, business_provincia, provinces_covered")
    .eq("user_id", authData.user.id)
    .single();
  const userProvincia = String(
    (profile as { provincia?: string | null } | null)?.provincia ??
      professionalProfile?.business_provincia ??
      professionalProfile?.provinces_covered?.[0] ??
      "",
  )
    .trim()
    .toUpperCase();
  const creditsRemaining = professionalProfile?.credits_remaining ?? 0;
  const plan = professionalProfile?.subscription_plan ?? "free";
  const displayName =
    (profile as { full_name?: string | null } | null)?.full_name || authData.user.email?.split("@")[0] || "utente";

  if (!userProvincia) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10">
        <div className="mx-auto w-full max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard professionista</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-700">
                Per vedere le richieste della tua zona, imposta prima la provincia nel tuo profilo.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const { data: requests, error } = await supabase
    .from("requests")
    .select("id, title, description, categoria, city, provincia, budget_min, created_at, status")
    .eq("status", "open")
    .eq("provincia", userProvincia)
    .order("created_at", { ascending: false });
  const { data: sentQuotes } = await supabase
    .from("quotes")
    .select("id, amount, message, status, request_id, created_at")
    .eq("professional_id", authData.user.id)
    .order("created_at", { ascending: false });
  const sentRequestIds = (sentQuotes ?? []).map((quote) => quote.request_id);
  const { data: quoteRequests } =
    sentRequestIds.length > 0
      ? await supabase
          .from("requests")
          .select("id, title, client_id, city, provincia")
          .in("id", sentRequestIds)
      : { data: [] };
  const clientIds = (quoteRequests ?? []).map((request) => request.client_id);
  const { data: clients } =
    clientIds.length > 0
      ? await supabase.from("profiles").select("id, full_name, email, phone").in("id", clientIds)
      : { data: [] };
  const requestById = new Map((quoteRequests ?? []).map((request) => [request.id, request]));
  const clientById = new Map((clients ?? []).map((client) => [client.id, client]));

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10">
        <div className="mx-auto w-full max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard professionista</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                Errore nel caricamento richieste: {error.message}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8">
      <div className="container-app flex max-w-5xl flex-col gap-4">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">Ciao {displayName}, ecco i lavori nella tua zona 👋</h1>
            <StatusBadge status={plan === "pro" ? "pro" : "closed"} />
          </div>
          {creditsRemaining <= 2 ? (
            <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
              Ti rimangono solo {creditsRemaining} crediti.{" "}
              <Link href="/dashboard/professionista/abbonamento" className="font-semibold underline">
                Passa a Pro →
              </Link>
            </div>
          ) : null}
          <div className="mt-4 rounded-xl border border-[var(--color-border)] p-3">
            <p className="text-sm text-[var(--color-muted)]">{creditsRemaining} crediti disponibili</p>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-[var(--color-orange)]" style={{ width: `${Math.min(100, (creditsRemaining / 5) * 100)}%` }} />
            </div>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Richieste aperte in provincia di {userProvincia}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700">
              Crediti disponibili: <strong>{creditsRemaining}</strong>
            </p>
            <div>
              <Button asChild variant="outline">
                <Link href="/dashboard/professionista/abbonamento">Gestisci abbonamento</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href="/dashboard/professionista/profilo">Modifica profilo</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/professionista/disponibilita">Disponibilità</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/professionista/portfolio">Portfolio</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/professionista/referral">Referral</Link>
              </Button>
            </div>
            {successMessage ? (
              <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                {successMessage}
              </p>
            ) : null}
            {errorMessage ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {errorMessage}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant={tab === "richieste" ? "default" : "outline"}>
                <Link href="/dashboard/professionista?tab=richieste">Richieste nella tua zona</Link>
              </Button>
              <Button asChild size="sm" variant={tab === "preventivi" ? "default" : "outline"}>
                <Link href="/dashboard/professionista?tab=preventivi">Preventivi inviati</Link>
              </Button>
            </div>

            {tab === "richieste" && (!requests || requests.length === 0) ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center">
                <svg className="mx-auto mb-3 size-12 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 3v18M3 12h18" strokeWidth="1.5" />
                </svg>
                <p className="text-sm text-zinc-600">Nessuna richiesta aperta nella tua provincia al momento.</p>
              </div>
            ) : (
              tab === "richieste" &&
              requests?.map((request) => (
                <div key={request.id}>
                  <RequestCard
                    id={request.id}
                    categoria={request.categoria}
                    title={request.title}
                    description={request.description}
                    city={request.city}
                    provincia={request.provincia}
                    budget={request.budget_min}
                    createdAt={request.created_at}
                    status="open"
                    ctaLabel="Invia preventivo"
                  />
                  <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-medium text-zinc-900">Invia preventivo</h3>
                  </div>
                  {creditsRemaining <= 0 ? <p className="mt-2 text-sm text-orange-700">Crediti terminati. Passa a Pro per continuare.</p> : null}
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-[var(--color-navy)]">Apri modal preventivo</summary>
                    <form action={createQuoteAction} className="mt-3 grid gap-3 rounded-md border border-zinc-200 p-3">
                    <input type="hidden" name="request_id" value={request.id} />

                    <div className="space-y-2">
                      <Label htmlFor={`amount-${request.id}`}>Importo preventivo (EUR)</Label>
                      <Input id={`amount-${request.id}`} name="amount" type="number" min="1" step="0.01" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`message-${request.id}`}>Messaggio</Label>
                      <textarea
                        id={`message-${request.id}`}
                        name="message"
                        className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                        placeholder="Dettaglia tempi, materiali e note del preventivo..."
                      />
                    </div>

                      <div>
                        <Button type="submit">Invia preventivo</Button>
                      </div>
                    </form>
                  </details>
                </div>
                </div>
              ))
            )}
            {tab === "preventivi" ? (
              !sentQuotes || sentQuotes.length === 0 ? (
                <p className="text-sm text-zinc-600">Non hai ancora inviato preventivi.</p>
              ) : (
                sentQuotes.map((quote) => (
                  <div key={quote.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                    {(() => {
                      const request = requestById.get(quote.request_id);
                      const client = request ? clientById.get(request.client_id) : null;
                      const statusLabel =
                        quote.status === "accepted"
                          ? "Accettato"
                          : quote.status === "rejected"
                            ? "Non selezionato"
                            : quote.status === "withdrawn"
                              ? "Ritirato"
                              : "Inviato";
                      const statusClass =
                        quote.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : quote.status === "rejected" || quote.status === "withdrawn"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-blue-100 text-blue-800";

                      return (
                        <>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium text-zinc-900">
                              {request ? (
                                <Link href={`/dashboard/professionista/invia-preventivo/${request.id}`} className="hover:underline">
                                  {request.title}
                                </Link>
                              ) : (
                                `Richiesta ${quote.request_id.slice(0, 8)}`
                              )}
                            </p>
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass}`}>{statusLabel}</span>
                          </div>
                          <p className="mt-2 text-sm text-zinc-600">Importo offerto: {quote.amount} EUR</p>
                          <p className="text-sm text-zinc-600">Messaggio: {quote.message || "-"}</p>
                          <p className="text-sm text-zinc-600">
                            Zona richiesta: {request?.city ?? "-"} {request?.provincia ?? ""}
                          </p>
                          <p className="text-sm text-zinc-600">
                            Data invio: {new Date(quote.created_at).toLocaleDateString("it-IT")}
                          </p>
                          <p className="mt-1 text-sm">
                            <Link href={`/dashboard/professionista/invia-preventivo/${quote.request_id}`} className="font-medium text-[var(--color-navy)] hover:underline">
                              Vai alla richiesta originale
                            </Link>
                          </p>

                          {quote.status === "accepted" ? (
                            <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                              <p className="font-semibold">Preventivo accettato!</p>
                              <p className="mt-1">Nome cliente: {client?.full_name ?? "Cliente"}</p>
                              <p>Email: {client?.email ?? "-"}</p>
                              <p>Telefono: {client?.phone ?? "-"}</p>
                            </div>
                          ) : null}

                          {quote.status === "sent" ? (
                            <form action={withdrawQuoteAction} className="mt-3">
                              <input type="hidden" name="quote_id" value={quote.id} />
                              <Button type="submit" size="sm" variant="outline">
                                Ritira preventivo
                              </Button>
                            </form>
                          ) : null}
                        </>
                      );
                    })()}
                  </div>
                ))
              )
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
