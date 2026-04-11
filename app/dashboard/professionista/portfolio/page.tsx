import Link from "next/link";
import { redirect } from "next/navigation";

import { createPortfolioProjectAction } from "@/actions/portfolio/create-project.action";
import { deletePortfolioProjectAction } from "@/actions/portfolio/delete-project.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pickText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function PortfolioProfessionistaPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const success = pickText(searchParams.success);
  const error = pickText(searchParams.error);

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
  if (profile?.role !== "professionista") redirect("/dashboard/cliente");

  const { data: projects } = await supabase
    .from("portfolio_projects")
    .select("id, title, description, category, before_images, after_images, created_at")
    .eq("professional_id", authData.user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8">
      <div className="container-app max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-[var(--color-navy)]">Portfolio lavori</h1>
          <Button asChild variant="outline">
            <Link href="/dashboard/professionista">← Dashboard</Link>
          </Button>
        </div>

        {success ? (
          <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{success}</p>
        ) : null}
        {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}

        <Card>
          <CardHeader>
            <CardTitle>Nuovo progetto</CardTitle>
            <p className="text-sm text-[var(--color-muted)]">
              Carica fino a 5 immagini in totale tra “prima” e “dopo”. Mostrate sul tuo profilo pubblico e in homepage.
            </p>
          </CardHeader>
          <CardContent>
            <form action={createPortfolioProjectAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titolo</Label>
                <Input id="title" name="title" required placeholder="Es. Ristrutturazione bagno" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria (opzionale)</Label>
                <Input id="category" name="category" placeholder="Es. Idraulica, Ristrutturazione" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrizione (opzionale)</Label>
                <textarea
                  id="description"
                  name="description"
                  className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                  placeholder="Breve descrizione del lavoro..."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="before_images">Foto “prima”</Label>
                  <Input id="before_images" name="before_images" type="file" accept="image/*" multiple />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="after_images">Foto “dopo”</Label>
                  <Input id="after_images" name="after_images" type="file" accept="image/*" multiple />
                </div>
              </div>
              <SubmitButton
                label="Pubblica progetto"
                pendingLabel="Caricamento..."
                className="bg-[var(--color-orange)] text-white hover:bg-[var(--color-navy-mid)]"
              />
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>I tuoi progetti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!projects?.length ? (
              <p className="text-sm text-[var(--color-muted)]">Non hai ancora pubblicato progetti.</p>
            ) : (
              projects.map((p) => (
                <div key={p.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[var(--color-border)] p-4">
                  <div className="flex gap-3">
                    <div className="flex gap-1">
                      {p.before_images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.before_images[0]} alt="" className="size-16 rounded-md object-cover" />
                      ) : null}
                      {p.after_images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.after_images[0]} alt="" className="size-16 rounded-md object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-semibold">{p.title}</p>
                      {p.category ? <p className="text-xs text-[var(--color-orange)]">{p.category}</p> : null}
                      <p className="text-xs text-[var(--color-muted)]">
                        {new Date(p.created_at).toLocaleDateString("it-IT")}
                      </p>
                    </div>
                  </div>
                  <form action={deletePortfolioProjectAction}>
                    <input type="hidden" name="project_id" value={p.id} />
                    <Button type="submit" size="sm" variant="outline" className="text-red-700">
                      Elimina
                    </Button>
                  </form>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
