import Link from "next/link";

import { signupAction } from "@/actions/auth/signup.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pickText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export default async function RegistrazionePage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const error = pickText(searchParams.error);

  return (
    <main className="grid min-h-[calc(100vh-64px)] lg:grid-cols-2">
      <section className="hidden bg-[var(--color-navy)] p-10 text-white lg:flex lg:flex-col lg:justify-center">
        <h1 className="text-4xl font-bold">Crea il tuo account EdilMatch</h1>
        <p className="mt-4 max-w-md text-slate-200">Unisciti alla piattaforma italiana che connette clienti e professionisti con processi affidabili.</p>
        <ul className="mt-8 space-y-3 text-sm text-slate-200">
          <li>✓ Lead verificati e geolocalizzati</li>
          <li>✓ Preventivi digitali in pochi click</li>
          <li>✓ Gestione completa del ciclo di lavoro</li>
        </ul>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-xl card-investor border border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="text-2xl text-[var(--color-text)]">Registrazione</CardTitle>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="rounded-full bg-[var(--color-orange-light)] px-2 py-1 font-medium text-[var(--color-orange)]">1 Ruolo</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">2 Dati</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">3 Conferma</span>
            </div>
          </CardHeader>
          <CardContent>
            {error ? <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}

            <form action={signupAction} className="space-y-5">
              <fieldset className="grid gap-3 sm:grid-cols-2">
                <label className="cursor-pointer rounded-2xl border border-[var(--color-border)] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 has-[:checked]:border-[var(--color-orange)] has-[:checked]:bg-[var(--color-orange-light)]">
                  <input type="radio" name="role" value="cliente" defaultChecked className="sr-only" />
                  <p className="text-xl">🏠</p>
                  <p className="mt-2 font-semibold">Cliente</p>
                  <p className="text-sm text-[var(--color-muted)]">Cerco professionisti per i miei lavori</p>
                </label>
                <label className="cursor-pointer rounded-2xl border border-[var(--color-border)] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 has-[:checked]:border-[var(--color-orange)] has-[:checked]:bg-[var(--color-orange-light)]">
                  <input type="radio" name="role" value="professionista" className="sr-only" />
                  <p className="text-xl">🛠️</p>
                  <p className="mt-2 font-semibold">Professionista</p>
                  <p className="text-sm text-[var(--color-muted)]">Voglio ricevere richieste di lavoro</p>
                </label>
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" minLength={6} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referral_code">Codice invito professionista (opzionale)</Label>
                <Input id="referral_code" name="referral_code" placeholder="Es. EDIL-XXXXX" className="uppercase" />
                <p className="text-xs text-[var(--color-muted)]">Se un collega ti ha invitato, inserisci il codice per crediti bonus.</p>
              </div>

              <Button type="submit" className="w-full bg-[var(--color-orange)] text-white hover:bg-[var(--color-navy-mid)] transition-all duration-200">
                Crea account
              </Button>
            </form>

            <p className="mt-5 text-sm text-zinc-600">
              Hai gia un account?{" "}
              <Link href="/login" className="font-medium text-[var(--color-navy)] hover:underline">
                Accedi
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
