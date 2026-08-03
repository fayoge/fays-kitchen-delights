import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, ArrowLeft, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useCart } from "@/lib/cart";
import { findProduct, formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/products";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout — FaysKitchen" },
      {
        name: "description",
        content:
          "Complete your FaysKitchen order. Handmade Haitian pikliz, pepper sauce and epis shipped across the United States.",
      },
      { property: "og:title", content: "Secure Checkout — FaysKitchen" },
      {
        property: "og:description",
        content: "Complete your FaysKitchen order — shipped anywhere in the U.S.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const checkoutSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  address1: z.string().trim().min(3, "Enter your street address").max(200),
  address2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2, "Enter your city").max(100),
  state: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "Use the 2-letter state code"),
  zip: z
    .string()
    .trim()
    .regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code"),
  phone: z.string().trim().max(25).optional(),
});

type FieldName = keyof z.infer<typeof checkoutSchema>;

function Checkout() {
  const cart = useCart();
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const result = checkoutSchema.safeParse(raw);
    if (!result.success) {
      const next: Partial<Record<FieldName, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as FieldName;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      toast.error("Please check the highlighted fields");
      return;
    }
    setErrors({});
    toast.info("Payment isn't connected yet — your details look good.");
  };

  const field = (
    name: FieldName,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} aria-invalid={!!errors[name]} {...props} />
      {errors[name] && <p className="text-xs text-destructive">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to the shop
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <h1 className="text-4xl">Secure checkout</h1>
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Lock className="size-3" /> Encrypted
          </span>
        </div>

        {cart.count === 0 ? (
          <div className="mt-10 rounded-xl border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">Your basket is empty.</p>
            <Button asChild className="mt-4">
              <Link to="/">Browse the jars</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
            <form onSubmit={onSubmit} noValidate className="space-y-8">
              <section className="space-y-4 rounded-xl border border-border bg-card p-6">
                <h2 className="text-2xl">Contact</h2>
                {field("email", "Email", { type: "email", autoComplete: "email" })}
                {field("phone", "Phone (optional)", { type: "tel", autoComplete: "tel" })}
              </section>

              <section className="space-y-4 rounded-xl border border-border bg-card p-6">
                <h2 className="text-2xl">Shipping address</h2>
                <p className="text-sm text-muted-foreground">
                  We ship to United States addresses only.
                </p>
                {field("fullName", "Full name", { autoComplete: "name" })}
                {field("address1", "Street address", { autoComplete: "address-line1" })}
                {field("address2", "Apt, suite (optional)", {
                  autoComplete: "address-line2",
                })}
                <div className="grid gap-4 sm:grid-cols-3">
                  {field("city", "City", { autoComplete: "address-level2" })}
                  {field("state", "State", {
                    autoComplete: "address-level1",
                    placeholder: "FL",
                    maxLength: 2,
                  })}
                  {field("zip", "ZIP code", {
                    autoComplete: "postal-code",
                    inputMode: "numeric",
                  })}
                </div>
              </section>

              <section className="space-y-3 rounded-xl border border-dashed border-border bg-secondary/50 p-6">
                <h2 className="text-2xl">Payment</h2>
                <p className="text-sm text-muted-foreground">
                  Card payment is being connected. Once it&apos;s live, card details are
                  entered on an encrypted payment form and never touch this site.
                </p>
                <Button type="submit" size="lg" className="w-full">
                  <Lock className="size-4" /> Continue to payment ·{" "}
                  {formatPrice(cart.total)}
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5" /> Your information is transmitted
                  over a secure connection.
                </p>
              </section>
            </form>

            <aside className="h-fit space-y-4 rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24">
              <h2 className="text-2xl">Order summary</h2>
              <ul className="space-y-4">
                {cart.lines.map((line) => {
                  const product = findProduct(line.productId);
                  const size = product?.sizes.find((s) => s.id === line.sizeId);
                  if (!product || !size) return null;
                  return (
                    <li key={`${line.productId}-${line.sizeId}`} className="flex gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="size-14 rounded-md object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {size.label} × {line.qty}
                        </p>
                      </div>
                      <p className="text-sm tabular-nums">
                        {formatPrice(size.price * line.qty)}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="tabular-nums">
                    {cart.shipping === 0 ? "Free" : formatPrice(cart.shipping)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-medium">
                  <span>Total</span>
                  <span className="tabular-nums">{formatPrice(cart.total)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}.
              </p>
            </aside>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
