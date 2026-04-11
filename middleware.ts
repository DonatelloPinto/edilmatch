import type { NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/middleware";

/**
 * Esegue su Vercel Edge Runtime: niente API Node (fs, child_process, …).
 * La logica Supabase è in `lib/supabase/middleware.ts` con `@supabase/ssr` + `process.env`.
 */
export async function middleware(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
