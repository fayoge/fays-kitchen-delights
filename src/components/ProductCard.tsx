import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const variants = product.node.variants.edges.map((e) => e.node);
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const selectedVariant = variants.find((v) => v.id === variantId) ?? variants[0];
  const image = product.node.images.edges[0]?.node;

  const handleAddToCart = async () => {
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
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift">
      <Link
        to="/product/$handle"
        params={{ handle: product.node.handle }}
        className="aspect-4/5 overflow-hidden bg-muted"
      >
        {image && (
          <img
            src={image.url}
            alt={image.altText ?? product.node.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link to="/product/$handle" params={{ handle: product.node.handle }}>
          <h3 className="text-xl">{product.node.title}</h3>
        </Link>
        <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
          {product.node.description}
        </p>

        <div className="mt-auto space-y-3 pt-2">
          {variants.length > 1 && (
            <div className="flex gap-2">
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
            className="w-full"
            onClick={handleAddToCart}
            disabled={isLoading || !selectedVariant?.availableForSale}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : selectedVariant?.availableForSale ? (
              <>
                Add to basket ·{" "}
                {formatMoney(
                  selectedVariant.price.amount,
                  selectedVariant.price.currencyCode,
                )}
              </>
            ) : (
              "Sold out"
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
