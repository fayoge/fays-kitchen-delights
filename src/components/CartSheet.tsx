import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Minus, Plus, X, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney } from "@/lib/products";

export function CartSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem } = useCartStore();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.amount * item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative rounded-full">
          <ShoppingBag className="size-4" />
          <span className="hidden sm:inline">Basket</span>
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Your basket</SheetTitle>
          <SheetDescription>
            {totalItems === 0
              ? "Nothing in here yet."
              : `${totalItems} jar${totalItems !== 1 ? "s" : ""} ready to ship`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          {items.map((item) => (
            <div
              key={item.priceId}
              className="flex gap-3 rounded-lg border border-border bg-card p-3"
            >
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="size-16 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.sizeLabel} · {formatMoney(item.amount)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    aria-label="Decrease quantity"
                    onClick={() => updateQuantity(item.priceId, item.quantity - 1)}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-6 text-center text-sm tabular-nums">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    aria-label="Increase quantity"
                    onClick={() => updateQuantity(item.priceId, item.quantity + 1)}
                  >
                    <Plus className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto size-7 text-muted-foreground"
                    aria-label="Remove item"
                    onClick={() => removeItem(item.priceId)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="flex-col gap-3 sm:flex-col sm:space-x-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium tabular-nums">{formatMoney(totalPrice)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Shipping and taxes are calculated at checkout.
          </p>
          <Button
            className="w-full"
            size="lg"
            disabled={items.length === 0}
            onClick={() => {
              setIsOpen(false);
              navigate({ to: "/checkout" });
            }}
          >
            <Lock className="size-4" /> Secure checkout
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
