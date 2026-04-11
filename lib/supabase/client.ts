import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { env, assertRequiredEnv } from "@/lib/config/env";
import type { Database } from "@/types/db/supabase.types";

let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  assertRequiredEnv();

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }

  return browserClient;
}
