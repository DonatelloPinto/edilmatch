"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AnnunciMapView, type MapMarker } from "@/app/(public)/annunci/AnnunciMapView";
import { Button } from "@/components/ui/button";
import { CATEGORIES, ITALIAN_PROVINCES } from "@/lib/config/constants";
import { detectLocationWithGoogle } from "@/lib/geolocation-client";

type Role = "cliente" | "professionista" | null;

type FeedItem = {
  id: string;
  categoria: string | null;
  title: string;
  description: string | null;
  city: string | null;
  provincia: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
  quote_count: number;
};

const categoryEmoji: Record<string, string> = {
  Ristrutturazione: "🏗️",
  Idraulica: "🚰",
  Elettricista: "💡",
  Imbiancatura: "🎨",
  Pavimenti: "🧱",
  Infissi: "🪟",
  Muratura: "🧱",
  Cartongesso: "🪚",
  Climatizzazione: "❄️",
  Fotovoltaico: "☀️",
};

const categoryColors: Record<string, string> = {
  Ristrutturazione: "#f97316",
  Idraulica: "#0ea5e9",
  Elettricista: "#eab308",
  Imbiancatura: "#a855f7",
  Pavimenti: "#16a34a",
  Infissi: "#ef4444",
  Muratura: "#9333ea",
  Cartongesso: "#06b6d4",
  Climatizzazione: "#3b82f6",
  Fotovoltaico: "#f59e0b",
};

function timeAgo(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime();
  const hours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
  if (hours < 24) return `${hours} ore fa`;
  const days = Math.floor(hours / 24);
  return `${days} giorni fa`;
}

function buildRequestHref(isLoggedIn: boolean, role: Role, requestId: string) {
  if (!isLoggedIn) {
    return "/login?message=Accedi%20per%20vedere%20i%20dettagli%20e%20inviare%20un%20preventivo";
  }
  if (role === "professionista") {
    return `/dashboard/professionista/invia-preventivo/${requestId}`;
  }
  return "/dashboard/cliente";
}

export function AnnunciFeedClient({
  initialCategoria,
  initialProvincia,
  isLoggedIn,
  role,
}: {
  initialCategoria: string;
  initialProvincia: string;
  isLoggedIn: boolean;
  role: Role;
}) {
  const [categoria, setCategoria] = useState(initialCategoria);
  const [provincia, setProvincia] = useState(initialProvincia);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [items, setItems] = useState<FeedItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [latestTimestamp, setLatestTimestamp] = useState<string | null>(null);
  const [stats, setStats] = useState({ requestsToday: 0, activeProfessionals: 0 });
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [mapLoading, setMapLoading] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  const fetchBatch = useCallback(
    async (reset = false) => {
      if (loading) return;
      setLoading(true);
      const currentOffset = reset ? 0 : offset;
      const params = new URLSearchParams();
      params.set("offset", String(currentOffset));
      params.set("limit", "10");
      if (categoria) params.set("categoria", categoria);
      if (provincia) params.set("provincia", provincia);
      if (latestTimestamp) params.set("since", latestTimestamp);

      const response = await fetch(`/api/annunci/feed?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as {
        items: FeedItem[];
        total: number;
        latestCreatedAt: string | null;
        newCount: number;
        stats: { requestsToday: number; activeProfessionals: number };
      };

      const incoming = payload.items ?? [];
      setStats(payload.stats ?? { requestsToday: 0, activeProfessionals: 0 });
      setNewCount(payload.newCount ?? 0);
      setLatestTimestamp((prev) => prev ?? payload.latestCreatedAt);
      setItems((prev) => (reset ? incoming : [...prev, ...incoming]));
      setOffset((prev) => (reset ? incoming.length : prev + incoming.length));
      const nextTotal = payload.total ?? 0;
      const nextLoaded = (reset ? 0 : offset) + incoming.length;
      setHasMore(nextLoaded < nextTotal);
      setLoading(false);
    },
    [categoria, provincia, offset, loading, latestTimestamp],
  );

  useEffect(() => {
    void fetchBatch(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria, provincia]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading && viewMode === "list") {
          void fetchBatch(false);
        }
      },
      { rootMargin: "250px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchBatch, hasMore, loading, viewMode]);

  useEffect(() => {
    if (viewMode !== "map") return;
    setMapLoading(true);
    const params = new URLSearchParams();
    if (categoria) params.set("categoria", categoria);
    if (provincia) params.set("provincia", provincia);
    void fetch(`/api/annunci/map?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(
        (data: {
          markers: Array<{
            id: string;
            lat: number | null;
            lng: number | null;
            title: string;
            categoria: string | null;
            city: string | null;
            provincia: string | null;
          }>;
        }) => {
          const markers: MapMarker[] = (data.markers ?? [])
            .filter((m) => m.lat != null && m.lng != null)
            .map((m) => ({
              id: m.id,
              lat: m.lat as number,
              lng: m.lng as number,
              title: m.title,
              categoria: m.categoria,
              city: m.city,
              provincia: m.provincia,
              detailHref: buildRequestHref(isLoggedIn, role, m.id),
            }));
          setMapMarkers(markers);
        },
      )
      .finally(() => setMapLoading(false));
  }, [viewMode, categoria, provincia, isLoggedIn, role]);

  useEffect(() => {
    const timer = setInterval(async () => {
      const params = new URLSearchParams();
      params.set("offset", "0");
      params.set("limit", "1");
      if (categoria) params.set("categoria", categoria);
      if (provincia) params.set("provincia", provincia);
      if (latestTimestamp) params.set("since", latestTimestamp);
      const response = await fetch(`/api/annunci/feed?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as { newCount: number };
      setNewCount(payload.newCount ?? 0);
    }, 30000);
    return () => clearInterval(timer);
  }, [categoria, provincia, latestTimestamp]);

  async function useMyLocation() {
    try {
      setLoadingLocation(true);
      setLocationMessage("");
      const location = await detectLocationWithGoogle();
      setProvincia(location.provincia);
      setLocationMessage(`Provincia impostata: ${location.provincia}`);
    } catch (error) {
      setLocationMessage(error instanceof Error ? error.message : "Errore geolocalizzazione.");
    } finally {
      setLoadingLocation(false);
    }
  }

  const leftFilters = (
    <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-white p-4">
      <h3 className="font-semibold text-[var(--color-text)]">Filtri</h3>
      <select
        value={categoria}
        onChange={(event) => setCategoria(event.target.value)}
        className="w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
      >
        <option value="">Tutte le categorie</option>
        {CATEGORIES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select
        value={provincia}
        onChange={(event) => setProvincia(event.target.value)}
        className="w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
      >
        <option value="">Tutte le province</option>
        {ITALIAN_PROVINCES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <Button type="button" variant="outline" onClick={useMyLocation} disabled={loadingLocation} className="w-full">
        {loadingLocation ? "Rilevamento..." : "Usa la mia posizione"}
      </Button>
      {locationMessage ? <p className="text-xs text-[var(--color-muted)]">{locationMessage}</p> : null}
    </div>
  );

  const showSkeleton = loading && items.length === 0;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-6">
      <div className="container-app grid gap-4 lg:grid-cols-[260px_minmax(0,680px)_300px]">
        <aside className="hidden lg:block">
          <div className="sticky top-20">{leftFilters}</div>
        </aside>

        <section className="mx-auto w-full max-w-[680px]">
          <div className="mb-3 lg:hidden">
            <Button variant="outline" onClick={() => setMobileFiltersOpen((prev) => !prev)} className="w-full">
              {mobileFiltersOpen ? "Nascondi filtri" : "Mostra filtri"}
            </Button>
            {mobileFiltersOpen ? <div className="mt-3">{leftFilters}</div> : null}
          </div>

          {newCount > 0 ? (
            <button
              type="button"
              onClick={() => {
                setItems([]);
                setOffset(0);
                setLatestTimestamp(null);
                setNewCount(0);
                void fetchBatch(true);
              }}
              className="mb-3 w-full rounded-xl bg-[var(--color-orange-light)] px-3 py-2 text-sm font-medium text-[var(--color-orange)] transition-all duration-200 hover:bg-orange-100"
            >
              {newCount} nuovi annunci
            </button>
          ) : null}

          <div className="mb-4 flex justify-center gap-1 rounded-xl border border-[var(--color-border)] bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-[var(--color-navy)] text-white"
                  : "text-[var(--color-muted)] hover:bg-slate-50"
              }`}
            >
              Lista
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                viewMode === "map"
                  ? "bg-[var(--color-navy)] text-white"
                  : "text-[var(--color-muted)] hover:bg-slate-50"
              }`}
            >
              Mappa
            </button>
          </div>

          {viewMode === "map" ? (
            <div className="space-y-2">
              {mapLoading ? (
                <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-[var(--color-border)] bg-white">
                  <p className="text-sm text-[var(--color-muted)]">Caricamento mappa...</p>
                </div>
              ) : (
                <AnnunciMapView
                  key={`${categoria}-${provincia}-${mapMarkers.length}`}
                  markers={mapMarkers}
                  apiKey={mapsApiKey}
                />
              )}
            </div>
          ) : null}

          <div className={`space-y-2 ${viewMode === "map" ? "hidden" : ""}`}>
            {items.map((item) => {
              const href = buildRequestHref(isLoggedIn, role, item.id);
              const color = categoryColors[item.categoria ?? ""] ?? "#0f2444";
              const expanded = !!expandedIds[item.id];
              return (
                <article
                  key={item.id}
                  className="animate-[fadeIn_300ms_ease] border-b border-[var(--color-border)] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  style={{ borderLeft: `4px solid ${color}` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-full bg-[var(--color-orange-light)] text-xs font-bold text-[var(--color-orange)]">
                        {(item.categoria ?? "A").slice(0, 2).toUpperCase()}
                      </div>
                      <p className="font-semibold text-[var(--color-text)]">{item.categoria ?? "Lavori edili"}</p>
                      <p className="text-xs text-[var(--color-muted)]">{timeAgo(item.created_at)}</p>
                    </div>
                    <span className="rounded-full bg-[var(--color-orange-light)] px-2 py-1 text-xs font-medium text-[var(--color-orange)]">
                      {item.provincia ?? "--"}
                    </span>
                  </div>
                  <h3 className="mt-2 text-xl font-bold text-[var(--color-text)]">{item.title}</h3>
                  <p className={`mt-1 text-sm text-[var(--color-muted)] ${expanded ? "" : "line-clamp-3"}`}>
                    {item.description ?? "-"}
                  </p>
                  {item.description && item.description.length > 120 ? (
                    <button
                      type="button"
                      onClick={() => setExpandedIds((prev) => ({ ...prev, [item.id]: !expanded }))}
                      className="mt-1 text-xs font-medium text-[var(--color-navy)] hover:underline"
                    >
                      {expanded ? "Mostra meno" : "Leggi di più"}
                    </button>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted)]">
                    <span>💬 {item.quote_count} preventivi</span>
                    <Link href={href} className="transition-all duration-200 hover:text-[var(--color-navy)]">
                      👁 Visualizza
                    </Link>
                    <span>
                      📍 {item.city ?? "-"} ({item.provincia ?? "--"})
                    </span>
                  </div>
                </article>
              );
            })}

            {showSkeleton
              ? [1, 2, 3].map((idx) => (
                  <div key={idx} className="animate-pulse rounded-xl border border-[var(--color-border)] bg-white p-4">
                    <div className="h-4 w-1/3 rounded bg-slate-200" />
                    <div className="mt-3 h-5 w-2/3 rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-full rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-4/5 rounded bg-slate-200" />
                  </div>
                ))
              : null}

            {!showSkeleton && loading
              ? [1, 2, 3].map((idx) => (
                  <div key={`more-${idx}`} className="animate-pulse rounded-xl border border-[var(--color-border)] bg-white p-4">
                    <div className="h-4 w-1/3 rounded bg-slate-200" />
                    <div className="mt-3 h-5 w-2/3 rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-full rounded bg-slate-200" />
                  </div>
                ))
              : null}

            <div ref={loadMoreRef} className="h-1" />
            {!hasMore ? <p className="py-4 text-center text-xs text-[var(--color-muted)]">Hai raggiunto la fine del feed.</p> : null}
          </div>
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-3">
            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
              <h3 className="font-semibold">Hai un lavoro da fare?</h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">Pubblica in pochi minuti e ricevi preventivi.</p>
              <Button asChild className="mt-3 w-full bg-[var(--color-orange)] text-white hover:bg-orange-500">
                <Link href="/dashboard/cliente/nuova-richiesta">Pubblica gratis</Link>
              </Button>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
              <h3 className="font-semibold">Sei un professionista?</h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">Ricevi nuove richieste nella tua zona ogni giorno.</p>
              <Button asChild className="mt-3 w-full bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-mid)]">
                <Link href="/registrazione">Ricevi richieste</Link>
              </Button>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
              <h3 className="font-semibold">Statistiche piattaforma</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">Richieste oggi: {stats.requestsToday}</p>
              <p className="text-sm text-[var(--color-muted)]">Professionisti attivi: {stats.activeProfessionals}</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
