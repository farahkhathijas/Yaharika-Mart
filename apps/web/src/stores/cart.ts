import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  shopId: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  setShop: (shopId: string) => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>(
  persist(
    (set, get) => ({
      items: [],
      shopId: null,
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },
      updateQty: (productId, qty) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, qty } : i
          ),
        }));
      },
      clearCart: () => set({ items: [], shopId: null }),
      setShop: (shopId) => set({ shopId }),
      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.qty, 0);
      },
    }),
    {
      name: 'cart-store',
    }
  )
);
