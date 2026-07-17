'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Store, Star, MapPin } from 'lucide-react';
import Link from 'next/link';
import { api, queryKeys } from '@/lib/api-client';
import { IShop } from '@yaharika/shared-types';
import { formatCurrency, cn } from '@/lib/utils';

function ShopCard({ shop }: { shop: IShop }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="card-premium overflow-hidden group"
    >
      <Link href={`/shops/${shop._id}`} aria-label={`View ${shop.name}`}>
        {/* Banner */}
        <div className="h-40 bg-gradient-to-br from-primary-50 to-secondary-300 relative overflow-hidden">
          {shop.bannerUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shop.bannerUrl}
              alt={`${shop.name} banner`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          {/* Status badge */}
          <div className={cn(
            'absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full',
            shop.isOpen ? 'bg-success text-white' : 'bg-foreground/60 text-white'
          )}>
            {shop.isOpen ? 'Open' : 'Closed'}
          </div>

          {/* Logo */}
          <div className="absolute -bottom-5 left-4">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-card flex items-center justify-center overflow-hidden border border-primary-100">
              {shop.logoUrl
                ? <img src={shop.logoUrl} alt={`${shop.name} logo`} className="w-full h-full object-cover" />
                : <Store size={22} className="text-primary-500" />
              }
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-8">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-display font-semibold text-foreground text-base leading-tight">{shop.name}</h3>
            <div className="flex items-center gap-1 text-accent-gold text-sm font-semibold flex-shrink-0 ml-2">
              <Star size={12} className="fill-accent-gold" />
              {shop.rating.toFixed(1)}
            </div>
          </div>

          <div className="flex items-center gap-1 text-foreground/50 text-xs mb-2">
            <MapPin size={11} />
            <span>{shop.area}</span>
            <span className="mx-1">·</span>
            <span className="capitalize">{shop.category}</span>
          </div>

          {shop.description && (
            <p className="text-foreground/60 text-xs line-clamp-2 leading-relaxed">{shop.description}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function ShopCardSkeleton() {
  return (
    <div className="card-premium overflow-hidden">
      <div className="skeleton h-40" />
      <div className="p-4 pt-8 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-full rounded" />
      </div>
    </div>
  );
}

const categories = ['All', 'grocery', 'pharmacy', 'bakery', 'dairy', 'vegetables', 'meat', 'stationery', 'general'];
const areas = ['All Areas', 'Koramangala', 'Indiranagar', 'Jayanagar'];

export default function ShopsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.shops({ search, category, area }),
    queryFn: () => api.get<{ items: IShop[]; total: number }>('/shops', { search, category, area }),
  });

  const shops = data?.data?.items ?? [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-display-sm text-foreground mb-2">Shops Near You</h1>
        <p className="text-foreground/60">Browse local merchants in your neighborhood</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="search"
            placeholder="Search shops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 transition-shadow"
            aria-label="Search shops"
          />
        </div>

        <select
          value={area}
          onChange={(e) => setArea(e.target.value === 'All Areas' ? '' : e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-primary-100 bg-white text-sm text-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary-300"
          aria-label="Filter by area"
        >
          {areas.map((a) => <option key={a} value={a === 'All Areas' ? '' : a}>{a}</option>)}
        </select>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-thin" role="group" aria-label="Filter by category">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat === 'All' ? '' : cat)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
              (cat === 'All' && !category) || category === cat
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white border border-primary-100 text-foreground/70 hover:bg-primary-50'
            )}
            aria-pressed={(cat === 'All' && !category) || category === cat}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Results info */}
      {!isLoading && (
        <p className="text-sm text-foreground/50 mb-6" aria-live="polite">
          {shops.length} shop{shops.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <ShopCardSkeleton key={i} />)
          : shops.map((shop) => <ShopCard key={shop._id} shop={shop} />)
        }
      </div>

      {/* Empty state */}
      {!isLoading && shops.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <div className="text-6xl">🏪</div>
          <h3 className="font-display text-xl text-foreground">No shops found</h3>
          <p className="text-foreground/50">Try adjusting your filters or search terms.</p>
          <button
            onClick={() => { setSearch(''); setCategory(''); setArea(''); }}
            className="btn-primary inline-flex"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
