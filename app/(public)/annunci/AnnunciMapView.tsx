"use client";

import { useEffect, useRef, useState } from "react";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  categoria: string | null;
  city: string | null;
  provincia: string | null;
  detailHref: string;
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

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    const w = window as Window & { google?: { maps?: unknown } };
    if (w.google?.maps) {
      resolve();
      return;
    }

    const existing = document.getElementById("google-maps-js");
    if (existing) {
      const started = Date.now();
      const t = setInterval(() => {
        const win = window as Window & { google?: { maps?: unknown } };
        if (win.google?.maps) {
          clearInterval(t);
          resolve();
        } else if (Date.now() - started > 20000) {
          clearInterval(t);
          reject(new Error("Timeout caricamento mappa"));
        }
      }, 50);
      return;
    }

    const cbName = `__initGm_${Date.now()}`;
    (window as unknown as Record<string, () => void>)[cbName] = () => resolve();

    const script = document.createElement("script");
    script.id = "google-maps-js";
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=${cbName}`;
    script.onerror = () => reject(new Error("Impossibile caricare Google Maps"));
    document.head.appendChild(script);
  });
}

export function AnnunciMapView({ markers, apiKey }: { markers: MapMarker[]; apiKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setError("Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY per la mappa.");
      return;
    }
    let cancelled = false;

    void (async () => {
      try {
        await loadGoogleMaps(apiKey);
        if (cancelled || !containerRef.current) return;

        type MapsNs = {
          Map: new (el: HTMLElement, opts: object) => unknown;
          LatLngBounds: new () => { extend: (p: { lat: number; lng: number }) => void };
          Marker: new (opts: object) => { addListener: (ev: string, fn: () => void) => void };
          InfoWindow: new (opts: { content: HTMLElement | string }) => { open: (opts: object) => void };
          SymbolPath: { CIRCLE: unknown };
        };

        const maps = (window as unknown as { google: { maps: MapsNs } }).google.maps;

        const map = new maps.Map(containerRef.current, {
          center: { lat: 42.5, lng: 12.5 },
          zoom: 6,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        const bounds = new maps.LatLngBounds();

        for (const m of markers) {
          const color = categoryColors[m.categoria ?? ""] ?? "#0f2444";
          const marker = new maps.Marker({
            position: { lat: m.lat, lng: m.lng },
            map,
            title: m.title,
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: color,
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          });

          const html = document.createElement("div");
          html.className = "max-w-xs p-2 text-sm";
          html.innerHTML = `
            <p class="font-semibold text-slate-900">${escapeHtml(m.title)}</p>
            <p class="text-slate-600">${escapeHtml(m.categoria ?? "Lavori edili")}</p>
            <p class="text-slate-500">${escapeHtml([m.city, m.provincia].filter(Boolean).join(" · ") || "")}</p>
            <p class="mt-2"><a class="font-medium text-orange-600 hover:underline" href="${escapeHtml(m.detailHref)}">Vedi dettagli</a></p>
          `;

          const info = new maps.InfoWindow({ content: html });
          marker.addListener("click", () => {
            info.open({ map, anchor: marker });
          });
          bounds.extend({ lat: m.lat, lng: m.lng });
        }

        if (markers.length > 1) {
          (map as { fitBounds: (b: unknown, padding?: number) => void }).fitBounds(bounds, 48);
        } else if (markers.length === 1) {
          (map as { setCenter: (p: object) => void; setZoom: (z: number) => void }).setCenter({
            lat: markers[0].lat,
            lng: markers[0].lng,
          });
          (map as { setZoom: (z: number) => void }).setZoom(12);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Errore mappa");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiKey, markers]);

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-900">
        <p>{error}</p>
        <p className="mt-2 text-xs text-amber-800">Puoi comunque usare la vista lista.</p>
      </div>
    );
  }

  if (markers.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-[var(--color-border)] bg-white p-6 text-center text-sm text-[var(--color-muted)]">
        Nessuna richiesta con coordinate nella zona selezionata. Pubblica una nuova richiesta con città e provincia, oppure allarga i filtri.
      </div>
    );
  }

  return <div ref={containerRef} className="h-[min(70vh,560px)] w-full rounded-xl border border-[var(--color-border)] bg-slate-100" />;
}
