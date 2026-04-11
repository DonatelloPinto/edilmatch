"use client";

import { useState } from "react";

import { ScrollReveal } from "@/components/home/ScrollReveal";

const items = [
  {
    q: "EdilMatch è gratuito per i clienti?",
    a: "Sì. Pubblicare una richiesta e ricevere preventivi non ha costi: paghi solo il professionista che scegli per il lavoro.",
  },
  {
    q: "Come funziona il Piano Pro?",
    a: "Il Pro offre più crediti per rispondere alle richieste, accesso alle gare d’appalto e maggiore visibilità. In lancio a €29/mese per i primi 100 iscritti.",
  },
  {
    q: "I professionisti sono verificati?",
    a: "Supportiamo profili con informazioni complete e badge Verificato dove applicabile. Ti consigliamo sempre di valutare recensioni e preventivi.",
  },
  {
    q: "Posso parlare con il professionista prima di accettare?",
    a: "Sì. Dopo aver ricevuto i preventivi puoi chiarire i dettagli via chat sulla piattaforma.",
  },
  {
    q: "In quali zone operate?",
    a: "EdilMatch è pensata per il mercato italiano: le richieste sono organizzate per provincia e categoria.",
  },
];

export function HomeFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ScrollReveal>
      <section className="bg-[var(--color-bg)] py-20">
        <div className="container-app max-w-3xl">
          <h2 className="text-center font-heading text-3xl font-bold text-[#0f2444] md:text-4xl">Domande frequenti</h2>
          <p className="mt-3 text-center text-[var(--color-muted)]">Le risposte alle curiosità più comuni.</p>
          <div className="mt-10 space-y-3">
            {items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-[#0f2444] transition hover:bg-slate-50"
                    aria-expanded={isOpen}
                  >
                    {item.q}
                    <span className="text-lg text-[var(--color-muted)]" aria-hidden>
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen ? <div className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-[var(--color-muted)]">{item.a}</div> : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
