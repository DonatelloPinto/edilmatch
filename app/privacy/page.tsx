import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy | EdilMatch",
  description: "Informativa privacy e trattamento dati personali (GDPR).",
};

export default function PrivacyPage() {
  return (
    <main className="container-app max-w-3xl py-12">
      <h1 className="text-3xl font-bold text-[var(--color-navy)]">Privacy policy</h1>
      <div className="prose prose-sm mt-6 max-w-none text-[var(--color-muted)]">
        <p>
          Il titolare tratta i dati personali forniti in fase di registrazione e utilizzo della piattaforma (es. nome, email, contenuti delle
          richieste) per finalità di erogazione del servizio, sicurezza e obblighi di legge, in conformità al Regolamento (UE) 2016/679 (GDPR).
        </p>
        <p className="mt-4">
          I dati possono essere trattati con strumenti informatici e comunicati a fornitori strettamente necessari (es. hosting, email
          transazionale). L&apos;utente può esercitare i diritti di accesso, rettifica, cancellazione e opposizione contattando il titolare.
        </p>
        <p className="mt-4">Questa informativa è generica e va adattata al tuo titolare effettivo e ai tuoi DPA con i fornitori.</p>
      </div>
    </main>
  );
}
