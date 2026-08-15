import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney } from "@/lib/products";
import { getStripeEnvironment } from "@/lib/stripe";
import { getCheckoutSummary } from "@/utils/payments.functions";

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
  validateSearch: (search: Record<string, unknown>): { session_id?: string } =>
    typeof search["session_id"] === "string" ? { session_id: search["session_id"] } : {},
  component: CheckoutReturn,
});

type Summary = Awaited<ReturnType<typeof getCheckoutSummary>>;

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();
  const clearCart = useCartStore((s) => s.clearCart);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId));

  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    setLoading(true);
    getCheckoutSummary({
      data: { sessionId, environment: getStripeEnvironment() },
    })
      .then((result) => {
        if (!active) return;
        setSummary(result);
        if (!("error" in result) && result.paymentStatus !== "unpaid") {
          clearCart();
          try {
            localStorage.removeItem("fayskitchen-cart");
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {
        if (active) setSummary({ error: "Could not load your order summary" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sessionId, clearCart]);

  const paid = summary && !("error" in summary) && summary.paymentStatus !== "unpaid";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 py-24">
        {!sessionId ? (
          <div className="text-center">
            <h1 className="text-4xl">No order found</h1>
            <p className="mt-4 text-muted-foreground">
              We couldn&apos;t find checkout details for this page.
            </p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <p>Confirming your order…</p>
          </div>
        ) : summary && "error" in summary ? (
          <div className="text-center">
            <h1 className="text-4xl">Order received</h1>
            <p className="mt-4 text-muted-foreground">
              We couldn&apos;t load the full summary right now, but your payment went
              through and Stripe has emailed your receipt.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Order ref: {sessionId}</p>
          </div>
        ) : summary && !("error" in summary) ? (
          <div>
            <div className="text-center">
              <CheckCircle2 className="mx-auto size-12 text-primary" />
              <h1 className="mt-6 text-4xl">
                {paid ? "Thank you — your order is in" : "Payment processing"}
              </h1>
              <p className="mt-4 text-muted-foreground">
                {paid
                  ? `A receipt is on its way${summary.email ? ` to ${summary.email}` : ""}. Jars are packed and shipped within two to three business days.`
                  : "Your payment is still processing. We'll email you as soon as it clears."}
              </p>
            </div>

            <div className="mt-10 rounded-xl border border-border bg-card p-6 text-left">
              <h2 className="font-display text-2xl">Order summary</h2>
              <ul className="mt-4 divide-y divide-border">
                {summary.lineItems.map((li, i) => (
                  <li key={i} className="flex justify-between gap-4 py-3 text-sm">
                    <span>
                      {li.description}
                      <span className="text-muted-foreground"> × {li.quantity}</span>
                    </span>
                    <span className="tabular-nums">
                      {formatMoney(li.amountTotal / 100)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">
                    {formatMoney(summary.amountSubtotal / 100)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="tabular-nums">
                    {summary.shippingAmount === 0
                      ? "Free"
                      : formatMoney(summary.shippingAmount / 100)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-base font-medium">
                  <span>Total</span>
                  <span className="tabular-nums">
                    {formatMoney(summary.amountTotal / 100)}
                  </span>
                </div>
              </div>

              {summary.shippingAddress?.address ? (
                <div className="mt-6 border-t border-border pt-4 text-sm">
                  <p className="font-medium">Shipping to</p>
                  <p className="mt-1 text-muted-foreground">
                    {[
                      summary.shippingAddress.name,
                      summary.shippingAddress.address["line1"],
                      summary.shippingAddress.address["line2"],
                      [
                        summary.shippingAddress.address["city"],
                        summary.shippingAddress.address["state"],
                        summary.shippingAddress.address["postal_code"],
                      ]
                        .filter(Boolean)
                        .join(", "),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              ) : null}

              <p className="mt-6 text-xs text-muted-foreground">Order ref: {sessionId}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-8 text-center">
          <Button asChild size="lg">
            <Link to="/">Back to the shop</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
