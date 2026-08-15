import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [priceId, setPriceId] = useState(product.sizes[0]!.priceId);
  const size = product.sizes.find((s) => s.priceId === priceId) ?? product.sizes[0]!;

  const handleAddToCart = () => {
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
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift">
      <Link
        to="/product/$handle"
        params={{ handle: product.handle }}
        className="aspect-4/5 overflow-hidden bg-muted"
      >
        <img
          src={product.image}
          alt={product.imageAlt}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link to="/product/$handle" params={{ handle: product.handle }}>
          <h3 className="text-xl">{product.name}</h3>
        </Link>
        <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-auto space-y-3 pt-2">
          <div className="flex gap-2">
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
          <Button className="w-full" onClick={handleAddToCart}>
            Add to basket · {formatMoney(size.amount)}
          </Button>
        </div>
      </div>
    </article>
  );
}
