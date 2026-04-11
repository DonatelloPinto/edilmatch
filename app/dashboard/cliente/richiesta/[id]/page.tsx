import Link from "next/link";
import { redirect } from "next/navigation";

import { acceptQuoteAction } from "@/actions/quotes/accept-quote.action";
import { rejectQuoteAction } from "@/actions/quotes/reject-quote.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function RichiestaDetailPage(props: PageProps) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const success = pickText(searchParams.success);
  const error = pickText(searchParams.error);

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const { data: request } = await supabase
    .from("requests")
    .select("id, title, description, categoria, city, provincia, status, created_at")
    .eq("id", id)
    .eq("client_id", authData.user.id)
    .single();

  if (!request) {
    redirect("/dashboard/cliente?error=Richiesta%20non%20trovata.");
  }

  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, professional_id, amount, message, status, created_at")
    .eq("request_id", request.id)
    .order("created_at", { ascending: false });

  const professionalIds = (quotes ?? []).map((q) => q.professional_id);
  const { data: professionals } =
    professionalIds.length > 0
      ? await supabase.from("profiles").select("id, full_name, email, phone, avatar_url").in("id", professionalIds)
      : { data: [] };
  const professionalById = new Map((professionals ?? []).map((p) => [p.id, p]));

  const { data: reviews } =
    professionalIds.length > 0
      ? await supabase.from("reviews").select("professional_id, rating").in("professional_id", professionalIds)
      : { data: [] };
  const ratingsMap = new Map<string, number[]>();
  for (const review of reviews ?? []) {
    const list = ratingsMap.get(review.professional_id) ?? [];
    list.push(review.rating);
    ratingsMap.set(review.professional_id, list);
  }

  const today = new Date().toISOString().slice(0, 10);
  const availEnd = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const { data: availabilityRows } =
    professionalIds.length > 0
      ? await supabase
          .from("professional_availability")
          .select("professional_id, date, time_slots")
          .in("professional_id", professionalIds)
          .gte("date", today)
          .lte("date", availEnd)
          .order("date", { ascending: true })
      : { data: [] };

  const availabilityByProfessional = new Map<string, { date: string; time_slots: string[] | null }[]>();
  for (const row of availabilityRows ?? []) {
    const list = availabilityByProfessional.get(row.professional_id) ?? [];
    list.push({ date: row.date, time_slots: row.time_slots });
    availabilityByProfessional.set(row.professional_id, list);
  }

  const acceptedQuote = (quotes ?? []).find((quote) => quote.status === "accepted");
  const acceptedProfessional = acceptedQuote ? professionalById.get(acceptedQuote.professional_id) : null;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8">
      <div className="container-app max-w-5xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Dettaglio richiesta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {success ? <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{success}</p> : null}
            {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
            <h2 className="text-xl font-bold text-[var(--color-text)]">{request.title}</h2>
            <p className="text-sm text-[var(--color-muted)]">
              {request.categoria ?? "Lavori edili"} · {request.city ?? "-"} ({request.provincia ?? "--"}) ·{" "}
              {new Date(request.created_at).toLocaleDateString("it-IT")}
            </p>
            <p className="whitespace-pre-line text-sm text-[var(--color-muted)]">{request.description ?? "-"}</p>
            <p className="text-sm">
              Stato: <span className="font-semibold">{request.status}</span>
            </p>
          </CardContent>
        </Card>

        {(quotes ?? []).length > 1 ? (
          <p className="text-sm font-medium text-[var(--color-navy)]">Confronto preventivi</p>
        ) : null}
        <div className={`grid gap-4 ${(quotes ?? []).length > 1 ? "md:grid-cols-2" : ""}`}>
          {(quotes ?? []).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-sm text-[var(--color-muted)]">Non hai ancora ricevuto preventivi per questa richiesta.</CardContent>
            </Card>
          ) : (
            (quotes ?? []).map((quote) => {
              const professional = professionalById.get(quote.professional_id);
              const ratings = ratingsMap.get(quote.professional_id) ?? [];
              const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
              return (
                <Card key={quote.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-[var(--color-orange-light)] text-sm font-bold text-[var(--color-orange)]">
                          {professional?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={professional.avatar_url} alt="Avatar professionista" className="h-full w-full object-cover" />
                          ) : (
                            (professional?.full_name ?? "P").slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <Link href={`/professionisti/${quote.professional_id}`} className="font-semibold text-[var(--color-text)] hover:underline">
                            {professional?.full_name ?? "Professionista"}
                          </Link>
                          <p className="text-xs text-[var(--color-muted)]">
                            {avgRating > 0 ? `⭐ ${avgRating.toFixed(1)} (${ratings.length} recensioni)` : "Nessuna recensione"}
                          </p>
                        </div>
                      </div>
                      <span className="text-xl font-extrabold text-[var(--color-navy)]">{quote.amount} EUR</span>
                    </div>
                    <p className="mt-3 text-sm text-[var(--color-muted)] whitespace-pre-line">{quote.message || "-"}</p>
                    <p className="mt-2 text-xs text-[var(--color-muted)]">Inviato il {new Date(quote.created_at).toLocaleDateString("it-IT")}</p>
                    {(() => {
                      const slots = availabilityByProfessional.get(quote.professional_id) ?? [];
                      return (
                        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-[var(--color-muted)]">
                          <p className="font-semibold text-[var(--color-navy)]">Disponibilità dichiarata (prossime settimane)</p>
                          {slots.length === 0 ? (
                            <p className="mt-1">Il professionista non ha ancora compilato il calendario. Contattalo per concordare le date.</p>
                          ) : (
                            <ul className="mt-2 list-inside list-disc space-y-0.5">
                              {slots.slice(0, 8).map((slot) => (
                                <li key={slot.date}>
                                  {new Date(slot.date).toLocaleDateString("it-IT")}: {slot.time_slots?.join(", ") || "—"}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })()}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {quote.status === "sent" ? (
                        <>
                          <form action={acceptQuoteAction}>
                            <input type="hidden" name="quote_id" value={quote.id} />
                            <input type="hidden" name="redirect_to" value={`/dashboard/cliente/richiesta/${request.id}`} />
                            <Button type="submit" className="bg-green-600 text-white hover:bg-green-700">
                              Accetta
                            </Button>
                          </form>
                          <form action={rejectQuoteAction}>
                            <input type="hidden" name="quote_id" value={quote.id} />
                            <input type="hidden" name="redirect_to" value={`/dashboard/cliente/richiesta/${request.id}`} />
                            <Button type="submit" variant="outline">
                              Rifiuta
                            </Button>
                          </form>
                        </>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                          Stato: {quote.status}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {acceptedQuote && acceptedProfessional ? (
          <Card>
            <CardContent className="pt-6">
              <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                Contatta {acceptedProfessional.full_name ?? "il professionista"} per organizzare il lavoro.
              </p>
              <div className="mt-3 text-sm text-[var(--color-muted)]">
                <p>Nome: {acceptedProfessional.full_name ?? "-"}</p>
                <p>Email: {acceptedProfessional.email ?? "-"}</p>
                <p>Telefono: {acceptedProfessional.phone ?? "-"}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
