'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Users, Timer, ShoppingBag, Plus } from 'lucide-react';
import { api, queryKeys } from '@/lib/api-client';
import { IGroupBuyDeal } from '@yaharika/shared-types';
import { formatCurrency, timeUntil, cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { toast } from 'sonner';

function GroupBuyCard({ deal }: { deal: IGroupBuyDeal }) {
  const queryClient = useQueryClient();
  const { user } = useUIStore();
  const [joinQty, setJoinQty] = useState(1);
  const timeLeft = timeUntil(deal.expiresAt);
  const percentFilled = Math.min(100, Math.round((deal.currentQty / deal.targetQty) * 100));

  const joinMutation = useMutation({
    mutationFn: () => api.post(`/group-buys/${deal._id}/join`, { qty: joinQty }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groupBuys() });
      toast.success('Joined group buy deal successfully! 🎉');
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'Failed to join group buy.');
    },
  });

  const productName = (deal.productId as any)?.name ?? 'Product';
  const originalPrice = (deal.productId as any)?.price ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="card-premium overflow-hidden flex flex-col justify-between"
    >
      <div>
        <div className="bg-gradient-to-r from-accent-amber to-accent-gold p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span className="text-sm font-semibold">Group Buying</span>
            </div>
            <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">
              {percentFilled}% Filled
            </span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="font-display font-semibold text-foreground text-lg mb-1">{productName}</h3>
            <p className="text-xs text-foreground/50">Target quantity: {deal.targetQty} units</p>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <span className="font-display text-2xl font-bold text-primary-600">
                {formatCurrency(deal.pricePerUnitAtTarget)}
              </span>
              <span className="text-foreground/45 line-through text-sm ml-2">
                {formatCurrency(originalPrice)}
              </span>
              <span className="text-xs text-foreground/40 block">Price at target</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-foreground/50 bg-foreground/5 px-2.5 py-1 rounded-full">
              <Timer size={12} />
              <span>{timeLeft}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span>Progress</span>
              <span>{deal.currentQty} / {deal.targetQty} units</span>
            </div>
            <div className="h-2 w-full bg-primary-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-amber to-accent-gold rounded-full transition-all duration-500"
                style={{ width: `${percentFilled}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 border-t border-primary-50/50">
        {user?.role === 'customer' && deal.status === 'active' && (
          <div className="flex gap-2 mt-4">
            <input
              type="number"
              min="1"
              max={deal.targetQty - deal.currentQty}
              value={joinQty}
              onChange={(e) => setJoinQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-2 rounded-xl border border-primary-100 text-center text-sm font-semibold focus:outline-none"
              aria-label="Quantity to join"
            />
            <button
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending}
              className="flex-1 btn-gold flex items-center justify-center gap-1.5 text-sm py-2"
            >
              <ShoppingBag size={14} />
              Join Deal
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function GroupBuysPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.groupBuys(),
    queryFn: () => api.get<{ deals: IGroupBuyDeal[] }>('/group-buys'),
  });

  const deals = data?.data?.deals ?? [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-amber/15 text-accent-amber text-sm font-semibold mb-4">
          <Users size={14} />
          Collaborative Buying
        </div>
        <h1 className="font-display text-display-md text-foreground mb-3">
          Join forces with <span className="text-accent-amber">your neighbors</span>
        </h1>
        <p className="text-foreground/60 text-lg max-w-xl mx-auto">
          Combine demand with your neighborhood to unlock wholesale prices directly from local suppliers.
          When the target is met, the deal goes live automatically.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-72 rounded-2xl" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="font-display text-xl text-foreground mb-2">No active group buys</h3>
          <p className="text-foreground/50">Create one or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {deals.map((deal) => (
            <GroupBuyCard key={deal._id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
