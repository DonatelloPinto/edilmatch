import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Pass-through minimo: niente Supabase né protezione route (da ripristinare in produzione stabile). */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
