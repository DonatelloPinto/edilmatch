import { NextResponse } from "next/server";

import { env } from "@/lib/config/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";

export async function POST() {
  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login?error=Effettua%20l'accesso%20prima%20di%20procedere.`,
      { status: 303 },
    );
  }

  if (!env.STRIPE_PRICE_PRO_MONTHLY_ID) {
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/professionista/abbonamento?error=Price%20Stripe%20non%20configurato.`,
      { status: 303 },
    );
  }

  const stripe = getStripeClient();
  const baseUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: env.STRIPE_PRICE_PRO_MONTHLY_ID,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/dashboard/professionista/abbonamento?success=Pagamento%20completato%20con%20successo.`,
    cancel_url: `${baseUrl}/dashboard/professionista/abbonamento?error=Checkout%20annullato.`,
    customer_email: user.email,
    metadata: {
      user_id: user.id,
    },
  });

  if (!session.url) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/professionista/abbonamento?error=Impossibile%20avviare%20il%20checkout.`,
      { status: 303 },
    );
  }

  return NextResponse.redirect(session.url, { status: 303 });
}
