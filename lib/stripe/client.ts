import Stripe from "stripe";

import { env } from "@/lib/config/env";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}
