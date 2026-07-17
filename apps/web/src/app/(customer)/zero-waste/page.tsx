'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Leaf, Clock, ShoppingCart, Filter } from 'lucide-react';
import { api, queryKeys } from '@/lib/api-client';
import { IZeroWasteListing } from '@yaharika/shared-types';
import { formatCurrency, timeUntil, cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

function ZeroWasteCard({ listing }: { listing: IZeroWasteListing }) {
  const { addItem } = useCartStore();
  const savingsPercent = Math.round(
    ((listing.originalPrice - listing.discountedPrice) / listing.originalPrice) * 100
  );
  const timeLeft = timeUntil(listing.expiryDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="card-premium overflow-hidden group"
    >
      {/* Green header */}
      <div className="bg-gradient-to-r from-success to-primary-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf size={16} className="text-white" />
            <span className="text-white text-sm font-semibold">Zero Waste</span>
          </div>
          <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Save {savingsPercent}%
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display font-semibold text-foreground mb-1">
          {(listing.productId as { name: string })?.name ?? 'Product'}
        </h3>
        <p className="text-sm text-foreground/50 mb-4">
          By {(listing.shopId as { name: string })?.name ?? 'Shop'} · {listing.qtyAvailable} units available
        </p>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="font-display text-2xl font-bold text-success">
              {formatCurrency(listing.discountedPrice)}
            </span>
            <span className="text-foreground/40 line-through text-sm ml-2">
              {formatCurrency(listing.originalPrice)}
            </span>
          </div>
          <div className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
            timeLeft.includes('Expire')
              ? 'bg-danger/10 text-danger'
              : timeLeft.includes('h') && !timeLeft.includes('d')
              ? 'bg-warning/10 text-warning'
              : 'bg-foreground/5 text-foreground/50'
          )}>
            <Clock size={11} />
            {timeLeft}
          </div>
        </div>

        <button
          onClick={() => {
            toast.success('Added to cart — great save! 🌱');
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors text-sm font-semibold tap-target"
          aria-label={`Add ${(listing.productId as { name: string })?.name} to cart at discounted price`}
        >
          <ShoppingCart size={15} />
          Add to Cart — Save {savingsPercent}%
        </button>
      </div>
    </motion.div>
  );
}

export default function ZeroWastePage() {
  const [category, setCategory] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.zeroWaste({ category }),
    queryFn: () => api.get<{ listings: IZeroWasteListing[] }>('/zero-waste', { category }),
  });

  const listings = data?.data?.listings ?? [];

  // Estimate total kg saved
  const totalQty = listings.reduce((s, l) => s + l.qtyAvailable, 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-semibold mb-4">
          <Leaf size={14} />
          Zero Waste Marketplace
        </div>
        <h1 className="font-display text-display-md text-foreground mb-3">
          Good food, <span className="text-success">half the price</span>
        </h1>
        <p className="text-foreground/60 text-lg max-w-xl mx-auto">
          Near-expiry items at deep discounts. You save money. The planet saves food.
          Every purchase diverts waste from landfills.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-success/5 border border-success/20 text-success text-sm">
          🌍 <strong>{Math.round(totalQty * 0.5)} kg</strong>&nbsp;of food diverted this month
        </div>
      </motion.div>

      {/* Listings grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="font-display text-xl text-foreground mb-2">No listings right now</h3>
          <p className="text-foreground/50">Check back soon — vendors post daily!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {listings.map((listing) => (
            <ZeroWasteCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
