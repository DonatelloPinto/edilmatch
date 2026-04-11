"use client";

import { useCallback, useEffect, useState } from "react";

export type PortfolioWorkPublic = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  before_images: string[] | null;
  after_images: string[] | null;
};

export function PortfolioPublicGrid({ works }: { works: PortfolioWorkPublic[] }) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    },
    [],
  );

  useEffect(() => {
    if (!lightbox) return;
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, onKey]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {works.map((work) => (
          <div key={work.id} className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
            <div className="grid grid-cols-2 gap-0.5">
              {work.before_images?.[0] ? (
                <button
                  type="button"
                  className="relative block aspect-video w-full overflow-hidden p-0"
                  onClick={() => setLightbox({ src: work.before_images![0], alt: "Prima" })}
                  aria-label="Apri immagine prima ingrandita"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={work.before_images[0]} alt="Prima" className="h-full w-full object-cover" />
                </button>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-slate-100 text-xs">Prima</div>
              )}
              {work.after_images?.[0] ? (
                <button
                  type="button"
                  className="relative block aspect-video w-full overflow-hidden p-0"
                  onClick={() => setLightbox({ src: work.after_images![0], alt: "Dopo" })}
                  aria-label="Apri immagine dopo ingrandita"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={work.after_images[0]} alt="Dopo" className="h-full w-full object-cover" />
                </button>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-slate-100 text-xs">Dopo</div>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-[var(--color-orange)]">{work.category ?? "Lavori edili"}</p>
              <p className="font-semibold">{work.title}</p>
              {work.description ? <p className="mt-1 line-clamp-2 text-xs text-[var(--color-muted)]">{work.description}</p> : null}
            </div>
          </div>
        ))}
      </div>

      {lightbox ? (
        <button
          type="button"
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center border-0 bg-black/85 p-4"
          onClick={() => setLightbox(null)}
          aria-label="Chiudi anteprima"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox.src} alt={lightbox.alt} className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl" />
        </button>
      ) : null}
    </>
  );
}
