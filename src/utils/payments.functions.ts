import { createServerFn } from "@tanstack/react-start";

import {
  type StripeEnv,
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";

type CheckoutSessionResult = { clientSecret: string } | { error: string };

interface CheckoutInput {
  items: Array<{ priceId: string; quantity: number }>;
  returnUrl: string;
  environment: StripeEnv;
}

export const createCartCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: CheckoutInput) => {
    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("Your basket is empty");
    }
    for (const item of data.items) {
      if (!/^[a-zA-Z0-9_-]+$/.test(item.priceId)) throw new Error("Invalid priceId");
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
        throw new Error("Invalid quantity");
      }
    }
    return data;
  })
  .handler(async ({ data }): Promise<CheckoutSessionResult> => {
    try {
      const stripe = createStripeClient(data.environment);

      const lineItems = [];
      let subtotal = 0;
      for (const item of data.items) {
        const prices = await stripe.prices.list({ lookup_keys: [item.priceId] });
        const price = prices.data[0];
        if (!price) throw new Error(`Price not found: ${item.priceId}`);
        subtotal += (price.unit_amount ?? 0) * item.quantity;
        lineItems.push({ price: price.id, quantity: item.quantity });
      }

      // Free U.S. shipping on orders of $75 or more.
      const freeShipping = subtotal >= 7500;

      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        shipping_address_collection: { allowed_countries: ["US"] },
        phone_number_collection: { enabled: true },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              display_name: "Standard U.S. shipping",
              fixed_amount: { amount: 950, currency: "usd" },
              delivery_estimate: {
                minimum: { unit: "business_day", value: 3 },
                maximum: { unit: "business_day", value: 7 },
              },
            },
          },
        ],
        payment_intent_data: { description: "FaysKitchen order" },
      });

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
