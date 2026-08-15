import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useCartStore } from "@/stores/cartStore";

export const Route = createFileRoute("/checkout/return")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — FaysKitchen" },
      {
        name: "description",
        content:
          "Thank you for your FaysKitchen order. Your jars are packed by hand and shipped across the United States.",
      },
      { property: "og:title", content: "Order Confirmed — FaysKitchen" },
      {
        property: "og:description",
        content: "Thank you for your FaysKitchen order — your jars are on their way.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search["session_id"] === "string" ? search["session_id"] : undefined,
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    if (sessionId) clearCart();
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 py-24 text-center">
        {sessionId ? (
          <>
            <CheckCircle2 className="mx-auto size-12 text-primary" />
            <h1 className="mt-6 text-4xl">Thank you — your order is in</h1>
            <p className="mt-4 text-muted-foreground">
              You&apos;ll get an email receipt from Stripe shortly. Jars are packed and
              shipped within two to three business days.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Order ref: {sessionId}</p>
          </>
        ) : (
          <>
            <h1 className="text-4xl">No order found</h1>
            <p className="mt-4 text-muted-foreground">
              We couldn&apos;t find checkout details for this page.
            </p>
          </>
        )}
        <Button asChild size="lg" className="mt-8">
          <Link to="/">Back to the shop</Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
}
