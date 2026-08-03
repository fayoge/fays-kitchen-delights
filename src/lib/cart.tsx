import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { findProduct, FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT } from "./products";

export type CartLine = {
  productId: string;
  sizeId: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  add: (productId: string, sizeId: string, qty?: number) => void;
  setQty: (productId: string, sizeId: string, qty: number) => void;
  remove: (productId: string, sizeId: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
};

const STORAGE_KEY = "fayskitchen.cart.v1";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines]);

  const add = useCallback((productId: string, sizeId: string, qty = 1) => {
    setLines((prev) => {
      const found = prev.find((l) => l.productId === productId && l.sizeId === sizeId);
      if (found) {
        return prev.map((l) => (l === found ? { ...l, qty: Math.min(l.qty + qty, 99) } : l));
      }
      return [...prev, { productId, sizeId, qty }];
    });
  }, []);

  const setQty = useCallback((productId: string, sizeId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.productId === productId && l.sizeId === sizeId))
        : prev.map((l) =>
            l.productId === productId && l.sizeId === sizeId
              ? { ...l, qty: Math.min(qty, 99) }
              : l,
          ),
    );
  }, []);

  const remove = useCallback((productId: string, sizeId: string) => {
    setLines((prev) => prev.filter((l) => !(l.productId === productId && l.sizeId === sizeId)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = lines.reduce((sum, line) => {
      const product = findProduct(line.productId);
      const size = product?.sizes.find((s) => s.id === line.sizeId);
      return sum + (size ? size.price * line.qty : 0);
    }, 0);
    const count = lines.reduce((sum, l) => sum + l.qty, 0);
    const shipping =
      subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
    return {
      lines,
      add,
      setQty,
      remove,
      clear,
      count,
      subtotal,
      shipping,
      total: subtotal + shipping,
    };
  }, [lines, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
