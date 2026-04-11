import Link from "next/link";

const social = [
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: "in" },
  { label: "Instagram", href: "https://www.instagram.com", icon: "◎" },
  { label: "Facebook", href: "https://www.facebook.com", icon: "f" },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto bg-[#0a1628] text-white">
      <div className="container-app grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xl font-extrabold tracking-tight">
            <span className="text-white">Edil</span>
            <span className="text-[var(--color-orange)]">Match</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
            La piattaforma italiana che connette clienti e professionisti edili con strumenti moderni, trasparenza e supporto dedicato.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-xs font-bold text-slate-300 transition hover:border-[var(--color-orange)]/50 hover:text-white"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Prodotto</p>
          <ul className="space-y-3 text-sm text-slate-300">
            <li>
              <Link href="/come-funziona" className="transition hover:text-white">
                Come funziona
              </Link>
            </li>
            <li>
              <Link href="/annunci" className="transition hover:text-white">
                Annunci
              </Link>
            </li>
            <li>
              <Link href="/professionisti" className="transition hover:text-white">
                Professionisti
              </Link>
            </li>
            <li>
              <Link href="/appalti" className="transition hover:text-white">
                Appalti
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Professionisti</p>
          <ul className="space-y-3 text-sm text-slate-300">
            <li>
              <Link href="/registrazione" className="transition hover:text-white">
                Registrati
              </Link>
            </li>
            <li>
              <Link href="/dashboard/professionista" className="transition hover:text-white">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/dashboard/professionista/abbonamento" className="transition hover:text-white">
                Piani e prezzi
              </Link>
            </li>
            <li>
              <Link href="/dashboard/professionista/referral" className="transition hover:text-white">
                Programma referral
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Legale &amp; supporto</p>
          <ul className="space-y-3 text-sm text-slate-300">
            <li>
              <Link href="/privacy" className="transition hover:text-white">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/termini" className="transition hover:text-white">
                Termini di servizio
              </Link>
            </li>
            <li>
              <a href="mailto:support@edilmatch.it" className="transition hover:text-white">
                support@edilmatch.it
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-app flex flex-col items-center justify-between gap-3 py-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} EdilMatch S.r.l. · P.IVA e dati societari su richiesta · Tutti i diritti riservati.</p>
          <p className="text-slate-600">Made with care in Italy 🇮🇹</p>
        </div>
      </div>
    </footer>
  );
}
