import { Link } from "@tanstack/react-router";
import { ShoppingBag, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { findProduct, formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/products";

export function CartSheet() {
  const cart = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative rounded-full">
          <ShoppingBag className="size-4" />
          <span className="hidden sm:inline">Basket</span>
          {cart.count > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {cart.count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Your basket</SheetTitle>
          <SheetDescription>
            Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          {cart.lines.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing in here yet.
            </p>
          )}
          {cart.lines.map((line) => {
            const product = findProduct(line.productId);
            const size = product?.sizes.find((s) => s.id === line.sizeId);
            if (!product || !size) return null;
            return (
              <div
                key={`${line.productId}-${line.sizeId}`}
                className="flex gap-3 rounded-lg border border-border bg-card p-3"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="size-16 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {size.label} · {formatPrice(size.price)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      aria-label="Decrease quantity"
                      onClick={() => cart.setQty(line.productId, line.sizeId, line.qty - 1)}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-6 text-center text-sm tabular-nums">{line.qty}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      aria-label="Increase quantity"
                      onClick={() => cart.setQty(line.productId, line.sizeId, line.qty + 1)}
                    >
                      <Plus className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto size-7 text-muted-foreground"
                      aria-label="Remove item"
                      onClick={() => cart.remove(line.productId, line.sizeId)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <SheetFooter className="gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium tabular-nums">{formatPrice(cart.subtotal)}</span>
          </div>
          <SheetClose asChild>
            <Button asChild disabled={cart.count === 0} className="w-full">
              <Link to="/checkout">Secure checkout</Link>
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
