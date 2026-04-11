"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "edilmatch-launch-banner-dismissed";

export function AnnouncementBar() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  if (!mounted || dismissed) return null;

  return (
    <div className="relative z-[60] flex min-h-10 items-center justify-center gap-2 bg-[var(--color-orange)] px-10 py-2 text-center text-xs font-medium text-white sm:px-12 sm:text-sm">
      <p className="flex flex-wrap items-center justify-center gap-x-1">
        <span aria-hidden>🎉</span>
        <span>
          Offerta lancio: Piano Pro a €29/mese per i primi 100 professionisti ·{" "}
          <Link href="/dashboard/professionista/abbonamento" className="font-semibold underline underline-offset-2 hover:text-white/95">
            Scopri →
          </Link>
        </span>
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-lg leading-none text-white/90 transition hover:bg-white/15"
        aria-label="Chiudi banner"
      >
        ×
      </button>
    </div>
  );
}
