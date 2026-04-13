import Link from "next/link";

import { HeroSearchBar } from "@/components/home/HeroSearchBar";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { HomeStatsSection } from "@/components/home/HomeStatsSection";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/config/constants";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const CATEGORY_CARDS = [
  { emoji: "🛁", name: "Ristrutturazione", pros: "220+" },
  { emoji: "🎨", name: "Imbiancatura", pros: "340+" },
  { emoji: "💡", name: "Elettricista", pros: "190+" },
  { emoji: "🚰", name: "Idraulica", pros: "260+" },
  { emoji: "🪟", name: "Infissi", pros: "175+" },
  { emoji: "🏗️", name: "Muratura", pros: "210+" },
  { emoji: "📐", name: "Cartongesso", pros: "155+" },
  { emoji: "❄️", name: "Climatizzazione", pros: "140+" },
] as const;

const PARTNERS = ["CNA", "Confartigianato", "ANAEPA", "Confindustria", "CasArtigiani"] as const;

const TESTIMONIALS = [
  {
    name: "Laura Bianchi",
    city: "Bologna",
    role: "Cliente · ristrutturazione",
    text: "Ho ricevuto tre preventivi in 24 ore, scelto in base a recensioni e tempi. Lavoro finito nei tempi previsti, interfaccia chiara.",
    initials: "LB",
  },
  {
    name: "Giuseppe Ferrero",
    city: "Torino",
    role: "Idraulico · professionista",
    text: "Finalmente richieste filtrate per zona. Meno tempo perso e clienti più seri rispetto agli annunci generici.",
    initials: "GF",
  },
  {
    name: "Elena Martini",
    city: "Firenze",
    role: "Cliente · bagno",
    text: "App intuitiva, chat utile per i dettagli. Consigliata a chi non ha tempo di cercare artigiani a caso.",
    initials: "EM",
  },
] as const;

const PLACEHOLDER_WORKS = [
  {
    title: "Open space e cucina",
    category: "Ristrutturazione",
    city: "Milano",
    proName: "Team EdilMatch",
    gradient: "from-orange-400 via-orange-500 to-amber-600",
  },
  {
    title: "Impianto bagno completo",
    category: "Idraulica",
    city: "Roma",
    proName: "Professionisti in zona",
    gradient: "from-slate-600 via-slate-700 to-slate-900",
  },
  {
    title: "Rifacimento tetti locali",
    category: "Muratura",
    city: "Padova",
    proName: "Rete certificata",
    gradient: "from-teal-500 via-emerald-600 to-cyan-700",
  },
] as const;

export default async function PublicHomePage() {
  const supabase = await getSupabaseServerClient();
  const { data: showcaseRows } = await supabase
    .from("portfolio_projects")
    .select("id, title, category, after_images, professional_id")
    .order("created_at", { ascending: false })
    .limit(3);

  const proIds = [...new Set((showcaseRows ?? []).map((r) => r.professional_id))];
  const { data: proProfiles } =
    proIds.length > 0
      ? await supabase.from("profiles").select("id, full_name, city, provincia").in("id", proIds)
      : { data: [] };

  const proById = new Map((proProfiles ?? []).map((p) => [p.id, p]));

  const works = [0, 1, 2].map((i) => {
    const row = showcaseRows?.[i];
    const ph = PLACEHOLDER_WORKS[i];
    if (row) {
      const p = proById.get(row.professional_id);
      return {
        key: row.id,
        title: row.title,
        category: row.category ?? "Lavori edili",
        city: p?.city ?? p?.provincia ?? "Italia",
        proName: p?.full_name ?? "Professionista",
        img: row.after_images?.[0] ?? null,
        gradient: ph.gradient,
        href: `/professionisti/${row.professional_id}`,
      };
    }
    return {
      key: `ph-${i}`,
      title: ph.title,
      category: ph.category,
      city: ph.city,
      proName: ph.proName,
      img: null as string | null,
      gradient: ph.gradient,
      href: "/registrazione",
    };
  });

  const quickCats = CATEGORIES.slice(0, 6);

  return (
    <main className="overflow-x-hidden">
      {/* 2 — Hero */}
      <ScrollReveal>
        <section
          className="relative overflow-hidden pt-6 pb-20 md:pt-10 md:pb-28"
          style={{ background: "linear-gradient(165deg, #0f2444 0%, #1a3a6b 55%, #152f52 100%)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="container-app relative">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/95 backdrop-blur-sm">
                  Nuovo · La piattaforma edile italiana
                </span>
                <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-[3.25rem]">
                  Trova il professionista giusto. Senza stress.
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">
                  Mettiamo in contatto chi ha un progetto con artigiani e imprese edili verificati, nella tua provincia, con preventivi
                  trasparenti e chat integrata.
                </p>

                <HeroSearchBar />

                <div className="mt-6 flex flex-wrap gap-2">
                  {quickCats.map((c) => (
                    <Link
                      key={c}
                      href={`/annunci?categoria=${encodeURIComponent(c)}`}
                      className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/95 transition hover:bg-white/20"
                    >
                      {c}
                    </Link>
                  ))}
                </div>

                <p className="mt-8 flex flex-wrap items-center gap-2 text-sm font-medium text-white/80">
                  <span className="text-amber-300">★★★★★</span>
                  <span>4.8/5</span>
                  <span className="text-white/50">·</span>
                  <span>Già usato da 1.200+ professionisti</span>
                </p>
              </div>

              <div className="relative flex justify-center lg:justify-end">
                <div className="animate-home-float relative w-full max-w-md">
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[var(--color-orange)]/20 blur-2xl" />
                  <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                  <div className="relative rounded-2xl border border-white/20 bg-white p-5 shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
                    <div className="flex items-start gap-4">
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-orange)] text-lg font-bold text-white">
                        MR
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Nuovo preventivo ricevuto</p>
                        <p className="mt-1 truncate font-bold text-[#0f2444]">Mario R. · Idraulico</p>
                        <p className="mt-1 text-sm text-amber-600">⭐ 4.9</p>
                        <p className="mt-3 text-2xl font-extrabold text-[#0f2444]">€ 280</p>
                        <p className="mt-1 text-xs text-slate-500">Risposta media · 2h</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 3 — Partner trust */}
      <ScrollReveal>
        <section className="border-y border-slate-200/80 bg-white py-10">
          <div className="container-app text-center">
            <p className="text-sm font-medium text-slate-500">Utilizzato da professionisti iscritti a:</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-14">
              {PARTNERS.map((name) => (
                <span
                  key={name}
                  className="text-lg font-black tracking-tight text-slate-300 md:text-xl"
                  style={{ fontStretch: "condensed" }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 4 — Come funziona */}
      <HomeHowItWorks />

      {/* 5 — Numeri */}
      <HomeStatsSection />

      {/* 6 — Categorie */}
      <ScrollReveal>
        <section id="categorie" className="scroll-mt-28 bg-[var(--color-bg)] py-20">
          <div className="container-app">
            <h2 className="text-center font-heading text-3xl font-bold text-[#0f2444] md:text-4xl">Categorie popolari</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-[var(--color-muted)]">
              Scegli il settore: ti mostriamo professionisti attivi e richieste nella tua zona.
            </p>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CATEGORY_CARDS.map((item) => (
                <Link
                  key={item.name}
                  href={`/annunci?categoria=${encodeURIComponent(item.name)}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--color-orange)] hover:shadow-lg"
                >
                  <p className="text-4xl">{item.emoji}</p>
                  <h3 className="mt-4 font-heading text-lg font-bold text-[#0f2444]">{item.name}</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">{item.pros} professionisti</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 7 — Portfolio */}
      <ScrollReveal>
        <section className="bg-white py-20">
          <div className="container-app">
            <h2 className="text-center font-heading text-3xl font-bold text-[#0f2444] md:text-4xl">
              Guarda cosa hanno realizzato i nostri professionisti
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-[var(--color-muted)]">
              Una selezione di progetti reali pubblicati dai professionisti sulla piattaforma.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {works.map((w) => (
                <Link
                  key={w.key}
                  href={w.href}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--color-orange)]/40 hover:shadow-xl"
                >
                  <div className={`relative aspect-[4/3] bg-gradient-to-br ${w.gradient}`}>
                    {w.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={w.img} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-white">
                        <span className="text-4xl opacity-90">🏗️</span>
                        <p className="mt-3 text-sm font-semibold opacity-95">Progetto esempio</p>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-orange)]">{w.category}</p>
                    <p className="mt-1 font-heading text-lg font-bold text-[#0f2444]">{w.title}</p>
                    <p className="mt-3 text-sm text-[var(--color-muted)]">
                      {w.city} · {w.proName}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 8 — Testimonianze */}
      <ScrollReveal>
        <section className="bg-[var(--color-bg)] py-20">
          <div className="container-app">
            <h2 className="text-center font-heading text-3xl font-bold text-[#0f2444] md:text-4xl">Cosa dicono di noi</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <article
                  key={t.name}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-[var(--color-orange-light)] text-sm font-bold text-[var(--color-orange)]">
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-[#0f2444]">{t.name}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {t.city} · {t.role}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-amber-500" aria-hidden>
                    ★★★★★
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">{`"${t.text}"`}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 9 — Prezzi */}
      <ScrollReveal>
        <section id="prezzi" className="scroll-mt-24 bg-white py-20">
          <div className="container-app max-w-5xl">
            <h2 className="text-center font-heading text-3xl font-bold text-[#0f2444] md:text-4xl">Piani semplici, zero sorprese</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-[var(--color-muted)]">Per i clienti è sempre gratuito. I professionisti scelgono come crescere.</p>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-8 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Free</p>
                <p className="mt-2 font-heading text-4xl font-extrabold text-[#0f2444]">€0</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">per sempre · base</p>
                <ul className="mt-8 space-y-3 text-sm text-[var(--color-muted)]">
                  <li className="flex gap-2">
                    <span className="text-emerald-500">✓</span> Richieste nella tua provincia
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500">✓</span> Profilo e recensioni
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500">✓</span> Crediti per rispondere alle richieste
                  </li>
                  <li className="flex gap-2">
                    <span className="text-slate-300">·</span> Visibilità standard
                  </li>
                </ul>
                <Button asChild className="mt-8 w-full bg-[#0f2444] text-white hover:bg-[#1a3a6b]">
                  <Link href="/registrazione">Inizia gratis</Link>
                </Button>
              </div>
              <div className="relative rounded-2xl border-2 border-[var(--color-orange)] bg-white p-8 shadow-[0_20px_60px_rgba(249,115,22,0.15)]">
                <span className="absolute -top-3 left-6 rounded-full bg-[var(--color-orange)] px-3 py-1 text-xs font-bold text-white">
                  Consigliato
                </span>
                <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-orange)]">Pro</p>
                <p className="mt-2 font-heading text-4xl font-extrabold text-[#0f2444]">
                  €29<span className="text-lg font-semibold text-[var(--color-muted)]">/mese</span>
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">offerta lancio · primi 100 iscritti</p>
                <ul className="mt-8 space-y-3 text-sm text-[var(--color-muted)]">
                  <li className="flex gap-2">
                    <span className="text-emerald-500">✓</span> Più crediti e priorità nelle zone
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500">✓</span> Accesso alle gare d&apos;appalto
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500">✓</span> Badge Pro e strumenti di crescita
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500">✓</span> Supporto dedicato in rollout
                  </li>
                </ul>
                <Button asChild className="mt-8 w-full bg-[var(--color-orange)] text-white hover:bg-orange-600">
                  <Link href="/dashboard/professionista/abbonamento">Passa a Pro</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 10 — FAQ */}
      <HomeFAQ />

      {/* 11 — CTA finale */}
      <ScrollReveal>
        <section
          className="relative overflow-hidden py-20"
          style={{ background: "linear-gradient(120deg, #ea580c 0%, #f97316 45%, #fb923c 100%)" }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_30%_20%,white_0,transparent_50%)]" />
          <div className="container-app relative text-center">
            <h2 className="font-heading text-3xl font-extrabold text-white md:text-4xl">Pronto a iniziare?</h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-white/95">
              Unisciti a migliaia di utenti che scelgono EdilMatch per lavori edili più semplici e trasparenti.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white px-8 text-[#0f2444] hover:bg-slate-100">
                <Link href="/registrazione">Registrati come cliente</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white bg-transparent px-8 text-white hover:bg-white/10"
              >
                <Link href="/registrazione">Sono un professionista</Link>
              </Button>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
