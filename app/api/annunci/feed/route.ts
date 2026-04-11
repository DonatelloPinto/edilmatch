import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/config/env";
import type { Database } from "@/types/db/supabase.types";

type AnnuncioRow = {
  id: string;
  categoria: string | null;
  title: string;
  description: string | null;
  city: string | null;
  provincia: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
};

export async function GET(request: Request) {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Missing Supabase admin configuration" }, { status: 500 });
  }

  const admin = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { searchParams } = new URL(request.url);

  const categoria = (searchParams.get("categoria") ?? "").trim();
  const provincia = (searchParams.get("provincia") ?? "").trim().toUpperCase();
  const offset = Math.max(0, Number(searchParams.get("offset") ?? "0"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "10")));
  const since = (searchParams.get("since") ?? "").trim();

  let countQuery = admin.from("requests").select("id", { count: "exact", head: true }).eq("status", "open");
  if (categoria) countQuery = countQuery.eq("categoria", categoria);
  if (provincia) countQuery = countQuery.eq("provincia", provincia);
  const { count: totalCount } = await countQuery;

  let requestsQuery = admin
    .from("requests")
    .select("id, categoria, title, description, city, provincia, lat, lng, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (categoria) requestsQuery = requestsQuery.eq("categoria", categoria);
  if (provincia) requestsQuery = requestsQuery.eq("provincia", provincia);
  const { data: rows, error } = await requestsQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const requestIds = (rows ?? []).map((item) => item.id);
  const { data: quotes } =
    requestIds.length > 0
      ? await admin.from("quotes").select("id, request_id").in("request_id", requestIds)
      : { data: [] };

  const quoteCountMap = new Map<string, number>();
  for (const quote of quotes ?? []) {
    quoteCountMap.set(quote.request_id, (quoteCountMap.get(quote.request_id) ?? 0) + 1);
  }

  const items = (rows ?? []).map((row: AnnuncioRow) => ({
    ...row,
    quote_count: quoteCountMap.get(row.id) ?? 0,
  }));

  let newCount = 0;
  if (since) {
    let newQuery = admin
      .from("requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "open")
      .gt("created_at", since);
    if (categoria) newQuery = newQuery.eq("categoria", categoria);
    if (provincia) newQuery = newQuery.eq("provincia", provincia);
    const { count } = await newQuery;
    newCount = count ?? 0;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const { count: requestsToday } = await admin
    .from("requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "open")
    .gte("created_at", startOfToday.toISOString());

  const { count: activeProfessionals } = await admin
    .from("professional_profiles")
    .select("user_id", { count: "exact", head: true })
    .gt("credits_remaining", 0);

  return NextResponse.json({
    items,
    total: totalCount ?? 0,
    newCount,
    latestCreatedAt: items[0]?.created_at ?? null,
    stats: {
      requestsToday: requestsToday ?? 0,
      activeProfessionals: activeProfessionals ?? 0,
    },
  });
}
