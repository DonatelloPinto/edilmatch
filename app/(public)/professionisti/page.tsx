import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ProfessionalCard } from "@/components/cards/ProfessionalCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pickText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

type ProfessionalItem = {
  id: string;
  full_name: string | null;
  provincia: string | null;
  bio: string | null;
  categories: string[];
  rating: number;
};

export default async function ProfessionistiPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const categoriaFilter = pickText(searchParams.categoria).toLowerCase();
  const provinciaFilter = pickText(searchParams.provincia).toUpperCase();
  const supabase = await getSupabaseServerClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, provincia, role")
    .eq("role", "professionista");

  const professionalIds = (profiles ?? []).map((profile) => profile.id);
  const { data: professionalProfiles } =
    professionalIds.length > 0
      ? await supabase
          .from("professional_profiles")
          .select("user_id, bio, services")
          .in("user_id", professionalIds)
      : { data: [] };

  const { data: reviews } =
    professionalIds.length > 0
      ? await supabase.from("reviews").select("professional_id, rating").in("professional_id", professionalIds)
      : { data: [] };

  const profByUserId = new Map((professionalProfiles ?? []).map((item) => [item.user_id, item]));
  const reviewGroups = new Map<string, number[]>();
  for (const review of reviews ?? []) {
    const list = reviewGroups.get(review.professional_id) ?? [];
    list.push(review.rating);
    reviewGroups.set(review.professional_id, list);
  }

  const items: ProfessionalItem[] = (profiles ?? []).map((profile) => {
    const extra = profByUserId.get(profile.id);
    const ratings = reviewGroups.get(profile.id) ?? [];
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    return {
      id: profile.id,
      full_name: profile.full_name,
      provincia: profile.provincia,
      bio: extra?.bio ?? null,
      categories: extra?.services ?? [],
      rating: avg,
    };
  });

  const filteredItems = items.filter((item) => {
    const byProvincia = !provinciaFilter || (item.provincia ?? "").toUpperCase() === provinciaFilter;
    const byCategoria =
      !categoriaFilter || item.categories.some((category) => category.toLowerCase().includes(categoriaFilter));
    return byProvincia && byCategoria;
  });

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Professionisti</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 sm:grid-cols-3" method="GET">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input id="categoria" name="categoria" placeholder="Es. idraulica" defaultValue={categoriaFilter} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provincia">Provincia</Label>
                <Input id="provincia" name="provincia" placeholder="Es. MI" defaultValue={provinciaFilter} />
              </div>
              <div className="flex items-end">
                <Button type="submit">Filtra</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm text-zinc-600">
              <div className="py-8 text-center">
                <svg className="mx-auto mb-3 size-12 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="7" strokeWidth="1.5" />
                  <path d="m21 21-4.3-4.3" strokeWidth="1.5" />
                </svg>
                Nessun professionista trovato con questi filtri.
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                id={professional.id}
                name={professional.full_name ?? "Professionista"}
                categories={professional.categories}
                rating={professional.rating}
                reviewsCount={reviewGroups.get(professional.id)?.length ?? 0}
                provincia={professional.provincia}
              />
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/professionisti">Carica altri professionisti</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
