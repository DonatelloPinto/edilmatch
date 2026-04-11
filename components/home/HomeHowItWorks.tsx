"use client";

import { useState } from "react";

import { ScrollReveal } from "@/components/home/ScrollReveal";

type Tab = "cliente" | "professionista";

const clienteSteps = [
  {
    icon: "📝",
    title: "Descrivi il lavoro",
    text: "Categoria, zona e dettagli in pochi click. Ricevi solo professionisti pertinenti.",
  },
  {
    icon: "💬",
    title: "Confronta i preventivi",
    text: "Più offerte trasparenti con importi, tempi e note. Nessun impegno fino all’accettazione.",
  },
  {
    icon: "✅",
    title: "Scegli e monitora",
    text: "Accetta il preventivo migliore, chatta in app e tieni tutto sotto controllo.",
  },
];

const professionistaSteps = [
  {
    icon: "🎯",
    title: "Ricevi richieste mirate",
    text: "Solo lavori nella tua zona e nelle categorie che scegli tu.",
  },
  {
    icon: "⚡",
    title: "Rispondi in velocità",
    text: "Invia preventivi con crediti chiari e costruisci la tua reputazione.",
  },
  {
    icon: "📈",
    title: "Scala con Pro",
    text: "Più visibilità, appalti e strumenti per far crescere l’attività.",
  },
];

export function HomeHowItWorks() {
  const [tab, setTab] = useState<Tab>("cliente");
  const steps = tab === "cliente" ? clienteSteps : professionistaSteps;

  return (
    <ScrollReveal>
      <section className="bg-white py-20">
        <div className="container-app">
          <h2 className="text-center font-heading text-3xl font-bold text-[#0f2444] md:text-4xl">Come funziona</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[var(--color-muted)]">
            Due percorsi, un’unica piattaforma pensata per clienti e professionisti edili in Italia.
          </p>

          <div className="mx-auto mt-10 flex max-w-md justify-center rounded-full border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setTab("cliente")}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${tab === "cliente" ? "bg-[#0f2444] text-white shadow-md" : "text-slate-600 hover:text-[#0f2444]"}`}
            >
              Sono un Cliente
            </button>
            <button
              type="button"
              onClick={() => setTab("professionista")}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${tab === "professionista" ? "bg-[#0f2444] text-white shadow-md" : "text-slate-600 hover:text-[#0f2444]"}`}
            >
              Sono un Professionista
            </button>
          </div>

          <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-orange-light)] text-3xl shadow-sm">
                    <span aria-hidden>{step.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-orange)]">Step {i + 1}</p>
                    <h3 className="mt-1 font-heading text-xl font-bold text-[#0f2444]">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative flex justify-center lg:justify-end">
              {tab === "cliente" ? (
                <div className="animate-home-float w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,36,68,0.12)]">
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">Dashboard · Le tue richieste</div>
                  <div className="space-y-3 p-4">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                      <p className="text-xs text-slate-500">Ristrutturazione bagno</p>
                      <p className="font-semibold text-[#0f2444]">Milano · 3 preventivi ricevuti</p>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                        <div className="h-2 w-2/3 rounded-full bg-[var(--color-orange)]" />
                      </div>
                    </div>
                    <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">+ Nuova richiesta</div>
                  </div>
                </div>
              ) : (
                <div className="animate-home-float w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,36,68,0.12)]">
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">Notifiche</div>
                  <div className="p-4">
                    <div className="rounded-xl border border-[var(--color-orange)]/40 bg-[var(--color-orange-light)] p-4">
                      <p className="text-xs font-semibold text-[var(--color-orange)]">Nuova richiesta in zona</p>
                      <p className="mt-1 font-bold text-[#0f2444]">Idraulico · Roma</p>
                      <p className="mt-2 text-xs text-slate-600">Budget indicato · entro 48h</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
