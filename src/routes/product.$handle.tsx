import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2, Truck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useCartStore } from "@/stores/cartStore";
import { fetchProductByHandle, formatMoney } from "@/lib/shopify";

export const Route = createFileRoute("/product/$handle")({
  head: ({ params }) => {
    const name = params.handle
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${name} — FaysKitchen` },
        {
          name: "description",
          content: `${name} from FaysKitchen — handmade Haitian pikliz, pepper sauce and epis, shipped across the U.S.`,
        },
        { property: "og:title", content: `${name} — FaysKitchen` },
        {
          property: "og:description",
          content: `${name} from FaysKitchen, handmade in small batches and shipped across the U.S.`,
        },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const [variantId, setVariantId] = useState<string | null>(null);

  const { data: product, isPending } = useQuery({
    queryKey: ["shopify-product", handle],
    queryFn: async () => {
      const result = await fetchProductByHandle(handle);
      if (!result) throw notFound();
      return result;
    },
  });

  const variants = product?.node.variants.edges.map((e) => e.node) ?? [];
  const selectedVariant = variants.find((v) => v.id === variantId) ?? variants[0];
  const image = product?.node.images.edges[0]?.node;

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

        {isPending ? (
          <div className="flex justify-center py-24">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : !product ? (
          <p className="py-24 text-center text-muted-foreground">Product not found.</p>
        ) : (
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl bg-muted">
              {image && (
                <img
                  src={image.url}
                  alt={image.altText ?? product.node.title}
                  className="w-full object-cover"
                />
              )}
            </div>

            <div>
              <h1 className="text-4xl">{product.node.title}</h1>
              <p className="mt-3 text-2xl tabular-nums text-primary">
                {selectedVariant &&
                  formatMoney(
                    selectedVariant.price.amount,
                    selectedVariant.price.currencyCode,
                  )}
              </p>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                {product.node.description}
              </p>

              {variants.length > 1 && (
                <div className="mt-6 flex gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVariantId(v.id)}
                      aria-pressed={v.id === selectedVariant?.id}
                      className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                        v.id === selectedVariant?.id
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <span className="block font-medium">{v.title}</span>
                      <span className="block text-xs tabular-nums">
                        {formatMoney(v.price.amount, v.price.currencyCode)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <Button
                size="lg"
                className="mt-6 w-full"
                disabled={isLoading || !selectedVariant?.availableForSale}
                onClick={async () => {
                  if (!selectedVariant) return;
                  await addItem({
                    product,
                    variantId: selectedVariant.id,
                    variantTitle: selectedVariant.title,
                    price: selectedVariant.price,
                    quantity: 1,
                    selectedOptions: selectedVariant.selectedOptions || [],
                  });
                  toast.success(`${product.node.title} added to your basket`, {
                    position: "top-center",
                  });
                }}
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : selectedVariant?.availableForSale ? (
                  "Add to basket"
                ) : (
                  "Sold out"
                )}
              </Button>

              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="size-4 text-primary" /> Ships anywhere in the United
                States.
              </p>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
