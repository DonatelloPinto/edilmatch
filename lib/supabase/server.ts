import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { env, assertRequiredEnv } from "@/lib/config/env";
import type { Database } from "@/types/db/supabase.types";

export async function getSupabaseServerClient(): Promise<SupabaseClient<Database>> {
  assertRequiredEnv();

  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const cookie of cookiesToSet) {
              cookieStore.set(cookie.name, cookie.value, cookie.options);
            }
          } catch {
            // No-op in contexts where cookies are read-only (e.g. Server Components).
          }
        },
      },
    },
  );
}
