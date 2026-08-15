import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney, getProduct } from "@/lib/products";

export const Route = createFileRoute("/product/$handle")({
  head: ({ params }) => {
    const product = getProduct(params.handle);
    const name = product?.name ?? "Product";
    const description =
      product?.description ??
      "Handmade Haitian pikliz, pepper sauce and epis from FaysKitchen, shipped across the U.S.";
    return {
      meta: [
        { title: `${name} — FaysKitchen` },
        { name: "description", content: description },
        { property: "og:title", content: `${name} — FaysKitchen` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const product = getProduct(handle);
  const addItem = useCartStore((s) => s.addItem);
  const [priceId, setPriceId] = useState(product?.sizes[0]?.priceId ?? "");

  const size = product?.sizes.find((s) => s.priceId === priceId) ?? product?.sizes[0];

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

        {!product || !size ? (
          <p className="py-24 text-center text-muted-foreground">Product not found.</p>
        ) : (
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl bg-muted">
              <img
                src={product.image}
                alt={product.imageAlt}
                className="w-full object-cover"
              />
            </div>

            <div>
              <p className="eyebrow text-primary">{product.tagline}</p>
              <h1 className="mt-2 text-4xl">{product.name}</h1>
              <p className="mt-3 text-2xl tabular-nums text-primary">
                {formatMoney(size.amount)}
              </p>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              <div className="mt-6 flex gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.priceId}
                    type="button"
                    onClick={() => setPriceId(s.priceId)}
                    aria-pressed={s.priceId === size.priceId}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                      s.priceId === size.priceId
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <span className="block font-medium">{s.label}</span>
                    <span className="block text-xs tabular-nums">
                      {formatMoney(s.amount)}
                    </span>
                  </button>
                ))}
              </div>

              <Button
                size="lg"
                className="mt-6 w-full"
                onClick={() => {
                  addItem({
                    priceId: size.priceId,
                    handle: product.handle,
                    name: product.name,
                    sizeLabel: size.label,
                    amount: size.amount,
                    image: product.image,
                  });
                  toast.success(`${product.name} (${size.label}) added to your basket`, {
                    position: "top-center",
                  });
                }}
              >
                Add to basket · {formatMoney(size.amount)}
              </Button>

              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="size-4" /> Ships anywhere in the U.S. · calculated at
                checkout
              </p>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
