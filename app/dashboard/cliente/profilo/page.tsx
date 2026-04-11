import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ClientProfileForm } from "@/app/dashboard/cliente/profilo/ClientProfileForm";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pickText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ProfiloClientePage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const success = pickText(searchParams.success);
  const error = pickText(searchParams.error);

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const user = authData.user;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email, phone, city, provincia, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "professionista") {
    redirect("/dashboard/professionista/profilo");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profilo cliente</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <p className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{success}</p>
            ) : null}
            {error ? (
              <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
            ) : null}

            <ClientProfileForm
              initial={{
                fullName: profile?.full_name ?? "",
                email: profile?.email ?? user.email ?? "",
                phone: profile?.phone ?? "",
                city: profile?.city ?? "",
                provincia: profile?.provincia ?? "",
                avatarUrl: profile?.avatar_url ?? "",
              }}
            />

            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/dashboard/cliente">Torna dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
