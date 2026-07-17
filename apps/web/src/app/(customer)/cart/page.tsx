'use client';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api-client';
import { formatCurrency, triggerConfetti, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, getTotal, getSnapshot, rollback } = useCartStore();
  const { user } = useUIStore();
  const router = useRouter();

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!user || !user.address) throw new Error('Please add a delivery address in your account.');

      // Group items by shop (simplified: assume single shop per cart for MVP)
      const shopId = items[0]?.shopId;
      if (!shopId) throw new Error('Cart is empty.');

      const response = await api.post<{ order: unknown }>('/orders', {
        shopId,
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        deliveryAddress: user.address,
      });

      if (!response.success) {
        throw new Error(response.error?.message ?? 'Checkout failed.');
      }

      return response.data;
    },
    onSuccess: async () => {
      clearCart();
      await triggerConfetti();
      toast.success('🎉 Order placed successfully!', { duration: 4000 });
      router.push('/orders');
    },
    onError: (err: Error) => {
      // Rollback is not needed for checkout — cart remains
      toast.error(err.message, { duration: 5000 });
    },
  });

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="text-8xl">🛒</div>
          <h1 className="font-display text-2xl text-foreground">Your cart is empty</h1>
          <p className="text-foreground/50">Add items from your neighborhood shops to get started.</p>
          <Link href="/shops" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag size={16} />
            Browse Shops
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    );
  }

  const total = getTotal();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <h1 className="font-display text-display-sm text-foreground mb-8">
        Your Cart <span className="text-foreground/40 text-2xl">({items.length} item{items.length !== 1 ? 's' : ''})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                className="card-premium p-4 flex gap-4"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary-50 flex-shrink-0">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🛒</div>
                  }
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                  <p className="text-xs text-foreground/50 mb-2">{item.unit}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary-600">{formatCurrency(item.price)}</span>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        className="w-7 h-7 rounded-lg border border-primary-100 flex items-center justify-center hover:bg-primary-50 transition-colors tap-target"
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        disabled={item.qty >= item.stock}
                        className="w-7 h-7 rounded-lg border border-primary-100 flex items-center justify-center hover:bg-primary-50 transition-colors disabled:opacity-40 tap-target"
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-foreground/30 hover:text-danger transition-colors self-start mt-1 tap-target"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card-premium p-6 sticky top-24 space-y-5">
            <h2 className="font-display text-lg font-semibold text-foreground">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-foreground/70">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-foreground/70">
                <span>Delivery</span>
                <span className="text-success font-medium">Free</span>
              </div>
              <div className="border-t border-primary-100 pt-3 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="text-primary-600">{formatCurrency(total)}</span>
              </div>
            </div>

            {!user && (
              <div className="bg-primary-50 rounded-xl p-3 text-sm text-primary-700 text-center">
                <Link href="/login" className="font-semibold underline">Log in</Link> to place your order
              </div>
            )}

            <motion.button
              onClick={() => checkoutMutation.mutate()}
              disabled={!user || checkoutMutation.isPending}
              whileTap={{ scale: 0.97 }}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              aria-label={`Checkout — ${formatCurrency(total)}`}
            >
              {checkoutMutation.isPending ? (
                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <>
                  Checkout <ArrowRight size={16} />
                </>
              )}
            </motion.button>

            <button
              onClick={clearCart}
              className="w-full text-sm text-foreground/40 hover:text-danger transition-colors"
            >
              Clear cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
