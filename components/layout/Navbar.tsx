"use client";

import Link from "next/link";
import { useState } from "react";

import { logoutAction } from "@/actions/auth/logout.action";
import { Button } from "@/components/ui/button";

type NavbarProps = {
  isLoggedIn?: boolean;
  userName?: string;
  userRole?: "cliente" | "professionista";
  unreadMessages?: number;
};

export function Navbar({ isLoggedIn = false, userName = "", userRole, unreadMessages = 0 }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileHref = userRole === "professionista" ? "/dashboard/professionista/profilo" : "/dashboard/cliente/profilo";
  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase())
      .join("") || "U";

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 shadow-[0_1px_3px_rgba(0,0,0,0.08)] backdrop-blur-[8px]">
        <nav className="container-app flex h-[72px] items-center justify-between gap-3">
          <Link href="/" className="text-2xl font-black leading-none">
            <span className="text-[var(--color-navy)]">Edil</span>
            <span className="text-[var(--color-orange)]">Match</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <div className="group relative">
              <Link
                href="/come-funziona"
                className="relative inline-flex items-center gap-1 pb-1 text-[15px] font-medium text-[#0f2444] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[var(--color-orange)] after:transition-all after:duration-200 group-hover:after:w-full"
              >
                <span aria-hidden>🔧</span>
                <span>Come funziona</span>
              </Link>
              <div className="invisible absolute left-0 top-full z-50 mt-2 w-52 rounded-md border border-[var(--color-border)] bg-white p-1 opacity-0 shadow-md transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <Link href="/come-funziona#clienti" className="block rounded px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-orange-light)]">
                  Per i clienti
                </Link>
                <Link
                  href="/come-funziona#professionisti"
                  className="block rounded px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-orange-light)]"
                >
                  Per i professionisti
                </Link>
                <Link href="/#categorie" className="block rounded px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-orange-light)]">
                  Categorie
                </Link>
              </div>
            </div>

            <Link
              href="/professionisti"
              className="relative inline-flex items-center gap-1 pb-1 text-[15px] font-medium text-[#0f2444] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[var(--color-orange)] after:transition-all after:duration-200 hover:after:w-full"
            >
              <span aria-hidden>👷</span>
              <span>Professionisti</span>
            </Link>
            <Link
              href="/annunci"
              className="relative inline-flex items-center gap-1 pb-1 text-[15px] font-medium text-[#0f2444] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[var(--color-orange)] after:transition-all after:duration-200 hover:after:w-full"
            >
              <span aria-hidden>📋</span>
              <span>Annunci</span>
            </Link>
            <Link
              href="/appalti"
              className="relative inline-flex items-center gap-1 pb-1 text-[15px] font-medium text-[#0f2444] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[var(--color-orange)] after:transition-all after:duration-200 hover:after:w-full"
            >
              <span aria-hidden>📑</span>
              <span>Appalti</span>
            </Link>
            <Link
              href="/dashboard/professionista/abbonamento"
              className="relative inline-flex items-center gap-1 pb-1 text-[15px] font-medium text-[#0f2444] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[var(--color-orange)] after:transition-all after:duration-200 hover:after:w-full"
            >
              <span aria-hidden>💰</span>
              <span>Prezzi</span>
            </Link>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard/messaggi"
                  className="relative inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[15px] font-medium text-[#0f2444] transition-colors hover:bg-[var(--color-orange-light)]"
                >
                  <span aria-hidden>💬</span>
                  Messaggi
                  {unreadMessages > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-orange)] px-1 text-[10px] font-bold leading-none text-white">
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  ) : null}
                </Link>
                <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-2 py-1.5 transition-all duration-200 hover:bg-[var(--color-orange-light)]"
                  onClick={() => setProfileMenuOpen((value) => !value)}
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-[var(--color-navy)] text-xs font-bold text-white">
                    {initials}
                  </span>
                  <span className="max-w-32 truncate text-sm font-medium text-[var(--color-navy)]">{userName}</span>
                </button>
                {profileMenuOpen ? (
                  <div className="absolute right-0 z-50 mt-2 w-44 rounded-md border border-[var(--color-border)] bg-white p-1 shadow-md">
                    <Link
                      href="/dashboard/messaggi"
                      className="flex items-center justify-between rounded px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-orange-light)]"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Messaggi
                      {unreadMessages > 0 ? (
                        <span className="rounded-full bg-[var(--color-orange)] px-2 py-0.5 text-xs font-bold text-white">
                          {unreadMessages > 99 ? "99+" : unreadMessages}
                        </span>
                      ) : null}
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block rounded px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-orange-light)]"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={profileHref}
                      className="block rounded px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-orange-light)]"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Profilo
                    </Link>
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="block w-full rounded px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-orange-light)]"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Logout
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="transition-all duration-200">
                  <Link href="/login">Accedi</Link>
                </Button>
                <Button asChild className="bg-[var(--color-orange)] text-white transition-all duration-200 hover:bg-[var(--color-navy-mid)]">
                  <Link href="/registrazione">Registrati gratis</Link>
                </Button>
              </>
            )}
          </div>

          <button
            aria-label={open ? "Chiudi menu" : "Apri menu"}
            className="rounded-md border border-[var(--color-border)] p-2 md:hidden"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            {open ? "✕" : "☰"}
          </button>
        </nav>
      </header>

      {open ? (
        <>
          <button type="button" aria-label="Chiudi menu" className="fixed inset-0 z-40 bg-black/45 md:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed right-0 top-0 z-50 h-full w-80 max-w-[90vw] bg-white p-5 shadow-2xl md:hidden">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-lg font-bold text-[var(--color-navy)]">Menu</p>
              <button type="button" aria-label="Chiudi menu" onClick={() => setOpen(false)} className="rounded-md border px-2 py-1">
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <Link href="/come-funziona" onClick={() => setOpen(false)} className="rounded px-2 py-2 text-sm font-medium text-[#0f2444] hover:bg-slate-50">
                🔧 Come funziona
              </Link>
              <Link href="/appalti" onClick={() => setOpen(false)} className="rounded px-2 py-2 text-sm font-medium text-[#0f2444] hover:bg-slate-50">
                📑 Appalti
              </Link>
              <Link
                href="/professionisti"
                onClick={() => setOpen(false)}
                className="rounded px-2 py-2 text-sm font-medium text-[#0f2444] hover:bg-slate-50"
              >
                👷 Professionisti
              </Link>
              <Link href="/annunci" onClick={() => setOpen(false)} className="rounded px-2 py-2 text-sm font-medium text-[#0f2444] hover:bg-slate-50">
                📋 Annunci
              </Link>
              <Link
                href="/dashboard/professionista/abbonamento"
                onClick={() => setOpen(false)}
                className="rounded px-2 py-2 text-sm font-medium text-[#0f2444] hover:bg-slate-50"
              >
                💰 Prezzi
              </Link>
            </div>

            {isLoggedIn ? (
              <div className="mt-6 space-y-2 border-t border-[var(--color-border)] pt-4">
                <p className="text-sm text-[var(--color-navy)]">Ciao {userName}!</p>
                <Button asChild variant="outline" className="relative w-full">
                  <Link href="/dashboard/messaggi" onClick={() => setOpen(false)}>
                    💬 Messaggi
                    {unreadMessages > 0 ? (
                      <span className="absolute right-3 top-1/2 flex min-h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-orange)] text-xs font-bold text-white">
                        {unreadMessages > 99 ? "99+" : unreadMessages}
                      </span>
                    ) : null}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={profileHref} onClick={() => setOpen(false)}>
                    Profilo
                  </Link>
                </Button>
                <form action={logoutAction} className="w-full">
                  <Button type="submit" variant="outline" className="w-full">
                    Logout
                  </Button>
                </form>
              </div>
            ) : (
              <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-2 border-t border-[var(--color-border)] pt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Accedi
                  </Link>
                </Button>
                <Button asChild className="w-full bg-[var(--color-orange)] text-white">
                  <Link href="/registrazione" onClick={() => setOpen(false)}>
                    Registrati gratis
                  </Link>
                </Button>
              </div>
            )}
          </aside>
        </>
      ) : null}
    </>
  );
}
