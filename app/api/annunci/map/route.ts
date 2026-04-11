import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/config/env";
import type { Database } from "@/types/db/supabase.types";

export async function GET(request: Request) {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Missing Supabase admin configuration" }, { status: 500 });
  }

  const admin = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { searchParams } = new URL(request.url);
  const categoria = (searchParams.get("categoria") ?? "").trim();
  const provincia = (searchParams.get("provincia") ?? "").trim().toUpperCase();

  let query = admin
    .from("requests")
    .select("id, categoria, title, city, provincia, lat, lng")
    .eq("status", "open")
    .not("lat", "is", null)
    .not("lng", "is", null)
    .limit(500);

  if (categoria) query = query.eq("categoria", categoria);
  if (provincia) query = query.eq("provincia", provincia);

  const { data: rows, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ markers: rows ?? [] });
}
