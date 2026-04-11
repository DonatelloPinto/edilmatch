import Link from "next/link";

import { loginAction } from "@/actions/auth/login.action";
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

export default async function LoginPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const message = pickText(searchParams.message);
  const error = pickText(searchParams.error);

  return (
    <main className="relative flex min-h-[calc(100vh-64px)] items-center justify-center bg-[var(--color-bg)] px-4 py-10">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(135deg,#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]" />
      <Card className="relative w-full max-w-[480px] card-investor border border-[var(--color-border)] bg-white">
        <CardHeader className="text-center">
          <p className="text-2xl font-extrabold">
            <span className="text-[var(--color-navy)]">Edil</span>
            <span className="text-[var(--color-orange)]">Match</span>
          </p>
          <CardTitle className="mt-2 text-2xl">Accedi</CardTitle>
        </CardHeader>
        <CardContent>
          {message ? <p className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{message}</p> : null}
          {error ? <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}

          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
              <p className="text-right text-xs text-[var(--color-muted)]">Hai dimenticato la password?</p>
            </div>
            <Button type="submit" className="w-full bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-mid)] transition-all duration-200">
              Entra
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-[var(--color-muted)]">
            <span className="h-px flex-1 bg-[var(--color-border)]" />
            oppure
            <span className="h-px flex-1 bg-[var(--color-border)]" />
          </div>
          <p className="text-center text-sm text-zinc-600">
            Non hai un account?{" "}
            <Link href="/registrazione" className="font-medium text-[var(--color-navy)] hover:underline">
              Registrati
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
