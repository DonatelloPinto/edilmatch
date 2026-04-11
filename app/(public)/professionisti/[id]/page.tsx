import { notFound } from "next/navigation";

import { createReviewAction } from "@/actions/reviews/create-review.action";
import { PortfolioPublicGrid } from "@/components/PortfolioPublicGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ProfessionistaProfilePage(props: PageProps) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const success = pickText(searchParams.success);
  const error = pickText(searchParams.error);
  const supabase = await getSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, provincia, role")
    .eq("id", id)
    .eq("role", "professionista")
    .single();

  if (!profile) {
    notFound();
  }

  const { data: professionalProfile } = await supabase
    .from("professional_profiles")
    .select("user_id, bio, services, years_experience, is_verified")
    .eq("user_id", id)
    .single();

  const today = new Date().toISOString().slice(0, 10);
  const availEnd = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const { data: availabilityRows } = await supabase
    .from("professional_availability")
    .select("date, time_slots")
    .eq("professional_id", id)
    .gte("date", today)
    .lte("date", availEnd)
    .order("date", { ascending: true });

  const { data: portfolioWorks } = await supabase
    .from("portfolio_projects")
    .select("id, title, description, category, before_images, after_images")
    .eq("professional_id", id)
    .order("created_at", { ascending: false })
    .limit(12);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, client_id, quote_id, request_id")
    .eq("professional_id", id)
    .order("created_at", { ascending: false });

  const clientIds = (reviews ?? []).map((review) => review.client_id);
  const { data: clientProfiles } =
    clientIds.length > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", clientIds)
      : { data: [] };
  const clientNameById = new Map((clientProfiles ?? []).map((client) => [client.id, client.full_name ?? "Cliente"]));

  const ratings = (reviews ?? []).map((review) => review.rating);
  const averageRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  let eligibleQuote: { id: string; request_id: string } | null = null;

  if (user) {
    const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (myProfile?.role === "cliente") {
      const { data: acceptedQuotes } = await supabase
        .from("quotes")
        .select("id, request_id, professional_id, status")
        .eq("professional_id", id)
        .eq("status", "accepted")
        .order("created_at", { ascending: false });

      const requestIds = (acceptedQuotes ?? []).map((quote) => quote.request_id);
      const { data: myRequests } =
        requestIds.length > 0
          ? await supabase.from("requests").select("id").in("id", requestIds).eq("client_id", user.id)
          : { data: [] };

      const myRequestIds = new Set((myRequests ?? []).map((request) => request.id));
      const firstEligibleQuote = (acceptedQuotes ?? []).find((quote) => myRequestIds.has(quote.request_id));

      if (firstEligibleQuote) {
        const { data: existingReview } = await supabase
          .from("reviews")
          .select("id")
          .eq("quote_id", firstEligibleQuote.id)
          .eq("client_id", user.id)
          .maybeSingle();

        if (!existingReview) {
          eligibleQuote = {
            id: firstEligibleQuote.id,
            request_id: firstEligibleQuote.request_id,
          };
        }
      }
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-10">
      <div className="container-app grid max-w-6xl gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="card-investor border border-[var(--color-border)]">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-[var(--color-orange-light)] text-2xl font-bold text-[var(--color-navy)]">
                  {(profile.full_name ?? "P").slice(0, 1)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>{profile.full_name ?? "Professionista"}</CardTitle>
                    {professionalProfile?.is_verified ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Verificato</span>
                    ) : null}
                  </div>
                  <p className="text-sm text-[var(--color-muted)]">Provincia: {profile.provincia ?? "-"}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-700">Bio: {professionalProfile?.bio ?? "-"}</p>
              <p className="text-sm text-zinc-700">
                Categorie: {professionalProfile?.services?.length ? professionalProfile.services.join(", ") : "-"}
              </p>
              <p className="text-sm text-zinc-700">Anni esperienza: {professionalProfile?.years_experience ?? "-"}</p>
              {(availabilityRows ?? []).length > 0 ? (
                <div className="rounded-xl border border-[var(--color-border)] bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-[var(--color-navy)]">Disponibilità (prossime settimane)</p>
                  <ul className="mt-2 space-y-1 text-xs text-[var(--color-muted)]">
                    {(availabilityRows ?? []).map((row) => (
                      <li key={row.date}>
                        {new Date(row.date).toLocaleDateString("it-IT")}: {row.time_slots?.join(", ") || "—"}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="space-y-4">
                <p className="text-sm font-semibold text-[var(--color-navy)]">Portfolio lavori</p>
                {!portfolioWorks?.length ? (
                  <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-6 text-center text-sm text-[var(--color-muted)]">
                    Nessun progetto in portfolio.
                  </div>
                ) : (
                  <PortfolioPublicGrid works={portfolioWorks} />
                )}
              </div>
            </CardContent>
          </Card>

          {success ? (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{success}</p>
          ) : null}
          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
          ) : null}

          {eligibleQuote ? (
            <Card>
              <CardHeader>
                <CardTitle>Lascia una recensione</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={createReviewAction} className="space-y-3">
                  <input type="hidden" name="professional_id" value={id} />
                  <input type="hidden" name="quote_id" value={eligibleQuote.id} />
                  <input type="hidden" name="request_id" value={eligibleQuote.request_id} />

                  <div className="space-y-2">
                    <Label htmlFor="rating">Voto (1-5)</Label>
                    <Input id="rating" name="rating" type="number" min="1" max="5" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment">Commento</Label>
                    <textarea
                      id="comment"
                      name="comment"
                      className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                      placeholder="Descrivi la tua esperienza..."
                    />
                  </div>
                  <Button type="submit" className="bg-[var(--color-orange)] text-white hover:bg-[var(--color-navy-mid)]">
                    Invia recensione
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Recensioni</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!reviews || reviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center">
                  <p className="text-sm text-zinc-600">Ancora nessuna recensione.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-zinc-900">{clientNameById.get(review.client_id) ?? "Cliente"}</p>
                      <p className="text-sm text-zinc-700">⭐ {review.rating}/5</p>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600">{review.comment ?? "-"}</p>
                    <p className="mt-2 text-xs text-zinc-500">{new Date(review.created_at).toLocaleDateString("it-IT")}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <Card className="card-investor border border-[var(--color-border)]">
            <CardHeader>
              <CardTitle>Profilo rapido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-[var(--color-muted)]">Rating medio</p>
              <p className="text-3xl font-bold">⭐ {averageRating.toFixed(1)}</p>
              <p className="text-sm text-[var(--color-muted)]">{reviews?.length ?? 0} recensioni</p>
              <p className="text-sm text-[var(--color-muted)]">Provincia: {profile.provincia ?? "-"}</p>
              <Button className="w-full bg-[var(--color-orange)] text-white hover:bg-[var(--color-navy-mid)]">Richiedi preventivo</Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
