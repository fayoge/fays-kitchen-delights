import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  priceId: string;
  handle: string;
  name: string;
  sizeLabel: string;
  amount: number;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (priceId: string, quantity: number) => void;
  removeItem: (priceId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        const existing = get().items.find((i) => i.priceId === item.priceId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.priceId === item.priceId ? { ...i, quantity: i.quantity + quantity } : i,
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity }] });
        }
      },

      updateQuantity: (priceId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.priceId !== priceId) });
          return;
        }
        set({
          items: get().items.map((i) => (i.priceId === priceId ? { ...i, quantity } : i)),
        });
      },

      removeItem: (priceId) =>
        set({ items: get().items.filter((i) => i.priceId !== priceId) }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "fayskitchen-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
