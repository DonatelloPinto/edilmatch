import { redirect } from "next/navigation";

import { createQuoteAction } from "@/actions/quotes/create-quote.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ requestId: string }>;
};

export default async function InviaPreventivoPage(props: PageProps) {
  const { requestId } = await props.params;
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login?message=Accedi%20per%20vedere%20i%20dettagli%20e%20inviare%20un%20preventivo");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
  if (profile?.role !== "professionista") {
    redirect("/dashboard");
  }

  const { data: request } = await supabase
    .from("requests")
    .select("id, title, description, categoria, city, provincia, status")
    .eq("id", requestId)
    .eq("status", "open")
    .single();

  if (!request) {
    redirect("/annunci");
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8">
      <div className="container-app max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Invia preventivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 rounded-lg border border-[var(--color-border)] bg-white p-4">
              <p className="text-sm text-[var(--color-muted)]">{request.categoria ?? "Lavori edili"}</p>
              <h3 className="mt-1 font-semibold text-[var(--color-text)]">{request.title}</h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{request.city} {request.provincia}</p>
              <p className="mt-2 text-sm text-[var(--color-muted)] line-clamp-3">{request.description ?? "-"}</p>
            </div>

            <form action={createQuoteAction} className="space-y-4">
              <input type="hidden" name="request_id" value={request.id} />
              <div className="space-y-2">
                <Label htmlFor="amount">Importo preventivo (EUR)</Label>
                <Input id="amount" name="amount" type="number" min="1" step="0.01" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Messaggio</Label>
                <textarea
                  id="message"
                  name="message"
                  className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                  placeholder="Descrivi tempi, materiali e condizioni del preventivo..."
                />
              </div>
              <SubmitButton label="Invia preventivo" pendingLabel="Invio in corso..." className="bg-[var(--color-orange)] text-white hover:bg-[var(--color-navy-mid)]" />
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
