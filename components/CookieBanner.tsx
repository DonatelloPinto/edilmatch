"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const KEY = "edilmatch_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && !localStorage.getItem(KEY)) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(KEY, "accepted");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  function decline() {
    try {
      localStorage.setItem(KEY, "declined");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-[var(--color-border)] bg-white p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] md:flex md:items-center md:justify-between md:gap-4">
      <p className="text-sm text-[var(--color-text)]">
        Utilizziamo cookie tecnici e, con il tuo consenso, strumenti di analisi. Leggi la{" "}
        <Link href="/privacy" className="font-medium text-[var(--color-navy)] underline">
          privacy policy
        </Link>
        .
      </p>
      <div className="mt-3 flex gap-2 md:mt-0">
        <Button type="button" variant="outline" size="sm" onClick={decline}>
          Rifiuta
        </Button>
        <Button type="button" size="sm" className="bg-[var(--color-orange)] text-white" onClick={accept}>
          Accetta
        </Button>
      </div>
    </div>
  );
}
