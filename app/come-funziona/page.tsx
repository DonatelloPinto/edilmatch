import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Come funziona | EdilMatch",
  description: "Scopri come EdilMatch connette clienti e professionisti edili in Italia.",
};

export default function ComeFunzionaPage() {
  return (
    <main className="bg-[var(--color-bg)] py-12">
      <div className="container-app max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-navy)]">Come funziona EdilMatch</h1>
          <p className="mt-2 text-[var(--color-muted)]">Un processo semplice per clienti e professionisti.</p>
        </div>

        <section id="clienti" className="scroll-mt-24 rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <h2 className="text-xl font-semibold text-[var(--color-navy)]">Per i clienti</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[var(--color-muted)]">
            <li>Registrati e pubblica una richiesta con categoria, zona e dettagli.</li>
            <li>Ricevi preventivi dai professionisti della tua provincia.</li>
            <li>Confronta, accetta il preventivo scelto e organizza il lavoro (anche via chat).</li>
            <li>Al termine puoi lasciare una recensione sul profilo pubblico.</li>
          </ol>
        </section>

        <section id="professionisti" className="scroll-mt-24 rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <h2 className="text-xl font-semibold text-[var(--color-navy)]">Per i professionisti</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[var(--color-muted)]">
            <li>Crea il profilo con zone coperte e servizi.</li>
            <li>Usa i crediti per inviare preventivi alle richieste in zona.</li>
            <li>Passa a Pro per più visibilità e partecipazione alle gare d&apos;appalto.</li>
            <li>Gestisci i lavori e la reputazione con le recensioni.</li>
          </ol>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-[var(--color-orange)] text-white">
            <Link href="/registrazione">Registrati</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/annunci">Vedi annunci</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
