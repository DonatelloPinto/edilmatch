import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AnnunciFeedClient } from "@/app/(public)/annunci/AnnunciFeedClient";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pickText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AnnunciPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const categoria = pickText(searchParams.categoria);
  const provincia = pickText(searchParams.provincia).toUpperCase();

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  const { data: myProfile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };
  const role = (myProfile?.role as "cliente" | "professionista" | null) ?? null;

  return <AnnunciFeedClient initialCategoria={categoria} initialProvincia={provincia} isLoggedIn={!!user} role={role} />;
}
