import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/app/dashboard/professionista/profilo/ProfileForm";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pickText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ProfiloProfessionistaPage(props: { searchParams: SearchParams }) {
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

  if (profile?.role === "cliente") {
    redirect("/dashboard/cliente/profilo");
  }
  const { data: professional } = await supabase
    .from("professional_profiles")
    .select(
      "company_name, vat_number, business_address, business_city, business_provincia, services, provinces_covered, bio, years_experience, website_url",
    )
    .eq("user_id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profilo professionista</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <p className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{success}</p>
            ) : null}
            {error ? (
              <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
            ) : null}

            <ProfileForm
              initial={{
                fullName: profile?.full_name ?? "",
                email: profile?.email ?? user.email ?? "",
                phone: profile?.phone ?? "",
                avatarUrl: profile?.avatar_url ?? "",
                companyName: professional?.company_name ?? "",
                vatNumber: professional?.vat_number ?? "",
                businessAddress: professional?.business_address ?? "",
                businessCity: professional?.business_city ?? profile?.city ?? "",
                businessProvincia: professional?.business_provincia ?? profile?.provincia ?? "",
                provincia: profile?.provincia ?? "",
                services: professional?.services ?? [],
                provincesCovered: professional?.provinces_covered ?? [],
                bio: professional?.bio ?? "",
                yearsExperience: professional?.years_experience ? String(professional.years_experience) : "",
                websiteUrl: professional?.website_url ?? "",
              }}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href="/dashboard/professionista">Torna dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/professionista/portfolio">Portfolio lavori</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
