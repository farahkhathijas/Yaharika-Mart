import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IProduct } from '@yaharika/shared-types';

export interface CartItem {
  productId: string;
  shopId: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  unit: string;
  stock: number;
  version: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
  hasItem: (productId: string) => boolean;
  getItemQty: (productId: string) => number;
  // Optimistic rollback
  rollback: (snapshot: CartItem[]) => void;
  getSnapshot: () => CartItem[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, qty: Math.min(i.qty + item.qty, i.stock) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, qty: Math.min(item.qty, item.stock) }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
      },

      updateQty: (productId, qty) => {
        set((state) => {
          if (qty <= 0) {
            return { items: state.items.filter((i) => i.productId !== productId) };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, qty: Math.min(qty, i.stock) } : i
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),
      setCartOpen: (open) => set({ isOpen: open }),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.qty, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.qty, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
      },

      hasItem: (productId) => get().items.some((i) => i.productId === productId),

      getItemQty: (productId) => {
        const item = get().items.find((i) => i.productId === productId);
        return item?.qty ?? 0;
      },

      rollback: (snapshot) => set({ items: snapshot }),
      getSnapshot: () => [...get().items],
    }),
    {
      name: 'yaharika-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
