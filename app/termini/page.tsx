import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termini di servizio | EdilMatch",
  description: "Termini e condizioni d'uso della piattaforma EdilMatch.",
};

export default function TerminiPage() {
  return (
    <main className="container-app max-w-3xl py-12">
      <h1 className="text-3xl font-bold text-[var(--color-navy)]">Termini di servizio</h1>
      <div className="prose prose-sm mt-6 max-w-none text-[var(--color-muted)]">
        <p>
          I presenti termini regolano l&apos;uso di EdilMatch come marketplace di incontro tra clienti e professionisti edili. L&apos;utente
          si impegna a fornire informazioni veritiere e a utilizzare la piattaforma in conformità alle leggi vigenti.
        </p>
        <p className="mt-4">
          EdilMatch non è parte dei contratti tra utenti e non garantisce l&apos;esito dei lavori. I pagamenti tra le parti restano di
          esclusiva responsabilità degli utenti salvo diversa integrazione futura del servizio.
        </p>
        <p className="mt-4">Per richieste: contattare il supporto tramite i canali indicati sul sito.</p>
      </div>
    </main>
  );
}
