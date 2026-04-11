import Link from "next/link";
import { redirect } from "next/navigation";

import { acceptQuoteAction } from "@/actions/quotes/accept-quote.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestCard } from "@/components/cards/RequestCard";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pickText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function DashboardClientePage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const success = pickText(searchParams.success);
  const errorMessage = pickText(searchParams.error);
  const tab = pickText(searchParams.tab) || "attive";
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", authData.user.id)
    .maybeSingle();
  const displayName = profile?.full_name || authData.user.email?.split("@")[0] || "utente";

  const { data: requests, error } = await supabase
    .from("requests")
    .select("id, title, description, categoria, city, provincia, status, budget_min, created_at")
    .eq("client_id", authData.user.id)
    .in("status", tab === "archiviate" ? ["closed", "cancelled"] : ["open", "in_progress"])
    .order("created_at", { ascending: false });

  const requestIds = (requests ?? []).map((request) => request.id);
  const { data: receivedQuotes } =
    requestIds.length > 0
      ? await supabase
          .from("quotes")
          .select("id, request_id, professional_id, amount, message, status, created_at")
          .in("request_id", requestIds)
          .in("status", ["sent", "accepted"])
          .order("created_at", { ascending: false })
      : { data: [] };
  const professionalIds = (receivedQuotes ?? []).map((quote) => quote.professional_id);
  const { data: professionalProfiles } =
    professionalIds.length > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", professionalIds)
      : { data: [] };
  const professionalNameById = new Map(
    (professionalProfiles ?? []).map((profile) => [profile.id, profile.full_name ?? "Professionista"]),
  );

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10">
        <div className="mx-auto w-full max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard cliente</CardTitle>
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

  const requestsCount = requests?.length ?? 0;
  const quotesCount = receivedQuotes?.length ?? 0;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8">
      <div className="container-app flex max-w-5xl flex-col gap-4">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Ciao {displayName}, ecco le tue richieste 👋</h1>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--color-border)] p-4">
              <p className="text-sm text-[var(--color-muted)]">Richieste attive</p>
              <p className="text-2xl font-bold">{requestsCount}</p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] p-4">
              <p className="text-sm text-[var(--color-muted)]">Preventivi ricevuti</p>
              <p className="text-2xl font-bold">{quotesCount}</p>
            </div>
          </div>
        </section>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Le tue richieste attive</CardTitle>
            <Button asChild>
              <Link href="/dashboard/cliente/nuova-richiesta">Nuova richiesta</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button asChild size="sm" variant={tab === "attive" ? "default" : "outline"}>
                <Link href="/dashboard/cliente?tab=attive">Richieste attive</Link>
              </Button>
              <Button asChild size="sm" variant={tab === "archiviate" ? "default" : "outline"}>
                <Link href="/dashboard/cliente?tab=archiviate">Archiviate</Link>
              </Button>
            </div>
            {success ? (
              <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                {success}
              </p>
            ) : null}
            {errorMessage ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {errorMessage}
              </p>
            ) : null}

            {!requests || requests.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center">
                <svg className="mx-auto mb-3 size-12 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 3v18M3 12h18" strokeWidth="1.5" />
                </svg>
                <p className="text-sm text-zinc-600">Nessuna richiesta in questa sezione. Pubblica la prima richiesta per iniziare.</p>
              </div>
            ) : (
              requests.map((request) => (
                <RequestCard
                  key={request.id}
                  id={request.id}
                  categoria={request.categoria}
                  title={request.title}
                  description={request.description}
                  city={request.city}
                  provincia={request.provincia}
                  budget={request.budget_min}
                  createdAt={request.created_at}
                  status={request.status === "in_progress" ? "in_progress" : request.status === "closed" ? "closed" : "open"}
                  ctaLabel="Gestisci"
                  ctaHref={`/dashboard/cliente/richiesta/${request.id}`}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preventivi ricevuti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!receivedQuotes || receivedQuotes.length === 0 ? (
              <p className="text-sm text-zinc-600">Non hai ancora preventivi ricevuti.</p>
            ) : (
              receivedQuotes.map((quote) => (
                <div key={quote.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-medium text-zinc-900">Preventivo {quote.id.slice(0, 8)}</h3>
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700">{quote.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">
                    Professionista:{" "}
                    <Link href={`/professionisti/${quote.professional_id}`} className="font-medium text-zinc-900 hover:underline">
                      {professionalNameById.get(quote.professional_id) ?? "Professionista"}
                    </Link>
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">Importo: {quote.amount} EUR</p>
                  {quote.message ? <p className="mt-1 whitespace-pre-line text-sm text-zinc-600">{quote.message}</p> : null}

                  {quote.status === "sent" ? (
                    <form action={acceptQuoteAction} className="mt-3">
                      <input type="hidden" name="quote_id" value={quote.id} />
                      <Button type="submit" size="sm">
                        Accetta preventivo
                      </Button>
                    </form>
                  ) : (
                    <p className="mt-3 text-sm text-green-700">Preventivo accettato. Puoi lasciare la recensione dal profilo pubblico.</p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <Link
        href="/dashboard/cliente/nuova-richiesta"
        aria-label="Nuova richiesta"
        className="fixed bottom-6 right-6 flex size-14 items-center justify-center rounded-full bg-[var(--color-orange)] text-3xl text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl md:hidden"
      >
        +
      </Link>
    </main>
  );
}
