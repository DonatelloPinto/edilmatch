import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl;
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const redirectPath = next && next.startsWith("/") ? next : "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=Callback%20OAuth%20non%20valido.", request.url));
  }

  const supabase = await getSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url));
  }

  try {
    const { data: authData } = await supabase.auth.getUser();
    const role = authData.user?.user_metadata?.role as string | undefined;
    const userId = authData.user?.id;

    if (role === "professionista" && userId) {
      await supabase.from("professional_profiles").upsert(
        {
          user_id: userId,
          credits_remaining: 5,
        },
        { onConflict: "user_id", ignoreDuplicates: true },
      );
    }
  } catch {
    return NextResponse.redirect(new URL("/login?error=Errore%20durante%20la%20creazione%20sessione.", request.url));
  }

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
