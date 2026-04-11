import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[var(--color-bg)] px-4 text-center">
      <p className="text-6xl font-black text-[var(--color-navy)]">404</p>
      <h1 className="text-xl font-semibold text-[var(--color-text)]">Pagina non trovata</h1>
      <p className="max-w-md text-sm text-[var(--color-muted)]">Il contenuto che cerchi non esiste o è stato spostato.</p>
      <Button asChild className="bg-[var(--color-orange)] text-white">
        <Link href="/">Torna alla home</Link>
      </Button>
    </main>
  );
}
