import Link from "next/link";
import { redirect } from "next/navigation";

import { AvailabilityEditor } from "@/app/dashboard/professionista/disponibilita/AvailabilityEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pickText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function DisponibilitaPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const success = pickText(searchParams.success);
  const error = pickText(searchParams.error);

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
  if (profile?.role !== "professionista") redirect("/dashboard/cliente");

  const { data: rows } = await supabase
    .from("professional_availability")
    .select("date, time_slots")
    .eq("professional_id", authData.user.id)
    .order("date", { ascending: true });

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8">
      <div className="container-app max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Disponibilità</CardTitle>
            <p className="text-sm text-[var(--color-muted)]">Indica in quali giorni e fasce sei reperibile per nuovi lavori.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {success ? (
              <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{success}</p>
            ) : null}
            {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
            <AvailabilityEditor initialRows={rows ?? []} />
            <Link href="/dashboard/professionista" className="text-sm text-[var(--color-muted)] hover:underline">
              Torna alla dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
