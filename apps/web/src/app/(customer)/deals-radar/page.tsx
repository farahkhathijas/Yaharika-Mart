'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Radar, Compass, ShoppingCart, MapPin, Tag } from 'lucide-react';
import { api, queryKeys } from '@/lib/api-client';
import { IDealsRadarEntry } from '@yaharika/shared-types';
import { formatCurrency, discountPercent, cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

function DealCard({ deal }: { deal: IDealsRadarEntry }) {
  const { addItem } = useCartStore();
  const product = deal.productId as any;
  const shop = deal.shopId as any;

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="card-premium p-5 flex flex-col justify-between"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-accent-gold bg-accent-gold/15 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Tag size={12} />
            {deal.discountPercent}% Off
          </span>
          <span className="text-xs text-foreground/40 capitalize font-medium">{deal.reason}</span>
        </div>

        <div>
          <h3 className="font-display font-semibold text-foreground text-base mb-1">{product.name}</h3>
          <div className="flex items-center gap-1 text-xs text-foreground/50">
            <MapPin size={11} />
            <span>{shop?.name ?? 'Shop'} · {shop?.area ?? 'Area'}</span>
          </div>
        </div>

        <div className="flex items-end gap-2">
          <span className="font-display text-2xl font-bold text-primary-600">
            {formatCurrency(Math.round(product.price * (1 - deal.discountPercent / 100)))}
          </span>
          <span className="text-foreground/40 line-through text-sm">
            {formatCurrency(product.price)}
          </span>
        </div>
      </div>

      <button
        onClick={() => {
          addItem({
            productId: product._id,
            shopId: shop?._id ?? '',
            name: product.name,
            price: Math.round(product.price * (1 - deal.discountPercent / 100)),
            qty: 1,
            unit: product.unit,
            stock: product.stock,
            version: product.version,
          });
          toast.success('Deal added to cart! 🎯');
        }}
        className="w-full btn-gold text-sm font-semibold py-2 mt-4 flex items-center justify-center gap-1.5"
      >
        <ShoppingCart size={14} />
        Grab Deal
      </button>
    </motion.div>
  );
}

export default function DealsRadarPage() {
  const [maxDistance, setMaxDistance] = useState(5);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.dealsRadar({ maxDistance }),
    queryFn: () => api.get<{ deals: IDealsRadarEntry[] }>('/deals-radar', { maxDistance }),
  });

  const deals = data?.data?.deals ?? [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-gold/15 text-accent-gold text-sm font-semibold mb-4">
          <Radar size={14} className="animate-pulse" />
          Deals Radar Active
        </div>
        <h1 className="font-display text-display-md text-foreground mb-3">
          Instant neighborhood <span className="text-accent-gold">deals radar</span>
        </h1>
        <p className="text-foreground/60 text-lg max-w-xl mx-auto">
          Scan your immediate surroundings for surplus promotions, near-expiry discounts, and flash sales.
        </p>

        {/* Distance Slider */}
        <div className="max-w-xs mx-auto mt-8 p-4 bg-white border border-primary-50 rounded-2xl shadow-sm space-y-3">
          <div className="flex justify-between text-sm font-medium">
            <span>Scan Radius</span>
            <span className="text-primary-600 font-semibold">{maxDistance} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            value={maxDistance}
            onChange={(e) => setMaxDistance(parseInt(e.target.value))}
            className="w-full accent-primary-500"
            aria-label="Scan radius in kilometers"
          />
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-60 rounded-2xl" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-24">
          <Compass size={48} className="text-primary-200 mx-auto mb-4" />
          <h3 className="font-display text-xl text-foreground mb-2">Radar sweep returned empty</h3>
          <p className="text-foreground/50">Try increasing your scan radius.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {deals.map((deal) => (
            <DealCard key={deal._id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
