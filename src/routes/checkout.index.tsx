import { createFileRoute, Link } from "@tanstack/react-router";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";

import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useCartStore } from "@/stores/cartStore";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCartCheckoutSession } from "@/utils/payments.functions";

export const Route = createFileRoute("/checkout/")({
  head: () => ({
    meta: [
      { title: "Secure Checkout — FaysKitchen" },
      {
        name: "description",
        content:
          "Complete your FaysKitchen order securely. Handmade Haitian pikliz, pepper sauce and epis shipped across the United States.",
      },
      { property: "og:title", content: "Secure Checkout — FaysKitchen" },
      {
        property: "og:description",
        content: "Complete your FaysKitchen order on a secure, encrypted checkout page.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { items?: string } =>
    typeof search["items"] === "string" ? { items: search["items"] } : {},
  component: CheckoutPage,
});

/** Parses `?items=price_id:qty,price_id:qty` (used by the standalone storefront). */
function parseItemsParam(raw: string | undefined) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((part) => {
      const [priceId, qty] = part.split(":");
      const quantity = Number(qty ?? 1);
      if (!priceId || !/^[a-zA-Z0-9_-]+$/.test(priceId)) return null;
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return null;
      return { priceId, quantity };
    })
    .filter((v): v is { priceId: string; quantity: number } => v !== null);
}

function CheckoutPage() {
  const { items: itemsParam } = Route.useSearch();
  const paramItems = parseItemsParam(itemsParam);
  const cartItems = useCartStore((s) => s.items);
  const items = paramItems.length > 0 ? paramItems : cartItems;

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    const fromParam = parseItemsParam(itemsParam);
    const result = await createCartCheckoutSession({
      data: {
        items:
          fromParam.length > 0
            ? fromParam
            : useCartStore
                .getState()
                .items.map((i) => ({ priceId: i.priceId, quantity: i.quantity })),
        returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        environment: getStripeEnvironment(),
      },
    });
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("Stripe did not return a client secret");
    return result.clientSecret;
  }, [itemsParam]);

  return (
    <div className="min-h-screen">
      <PaymentTestModeBanner />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Keep shopping
        </Link>
        <h1 className="mt-6 text-4xl">Secure checkout</h1>
        <p className="mt-2 text-muted-foreground">
          Payment is processed by Stripe. Domestic U.S. shipping is a flat $9.50 — free on
          orders over $75.
        </p>

        {items.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">Your basket is empty.</p>
        ) : (
          <div id="checkout" className="mt-8">
            <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
