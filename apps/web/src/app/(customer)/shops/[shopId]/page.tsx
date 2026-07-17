'use client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Store, Star, MapPin, Search, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { api, queryKeys } from '@/lib/api-client';
import { IProduct, IShop } from '@yaharika/shared-types';
import { useCartStore } from '@/stores/cartStore';
import { getSocket } from '@/lib/socket-client';
import { formatCurrency, getStockStatus, cn } from '@/lib/utils';
import { toast } from 'sonner';

function ShopProductCard({ product, shopId }: { product: IProduct; shopId: string }) {
  const { addItem, getItemQty } = useCartStore();
  const [liveStock, setLiveStock] = useState<number | null>(null);
  const stock = liveStock ?? product.stock;
  const inCartQty = getItemQty(product._id);

  // Subscribe to live stock updates
  useEffect(() => {
    const socket = getSocket();
    socket.emit('join:product', product._id);

    socket.on('stock:updated', (payload: { productId: string; newStock: number }) => {
      if (payload.productId === product._id) {
        setLiveStock(payload.newStock);
      }
    });

    return () => {
      socket.emit('leave:product', product._id);
      socket.off('stock:updated');
    };
  }, [product._id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (stock <= 0) return;

    addItem({
      productId: product._id,
      shopId,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.images[0],
      unit: product.unit,
      stock,
      version: product.version,
    });

    toast.success(`${product.name} added to cart!`);
  };

  const status = getStockStatus(stock, product.lowStockThreshold);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-premium overflow-hidden flex flex-col justify-between"
    >
      <Link href={`/products/${product._id}`} aria-label={`View ${product.name} details`}>
        <div className="h-44 bg-gradient-to-br from-primary-50/50 to-secondary-200/50 flex items-center justify-center relative overflow-hidden">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl">📦</span>
          )}

          {product.isZeroWasteItem && (
            <div className="absolute top-2 left-2 zero-waste-tag">
              🌱 Save {product.zeroWasteDiscountPercent}%
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
            <p className="text-xs text-foreground/50">{product.unit}</p>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold text-primary-600">
              {formatCurrency(product.price)}
            </span>
            <span className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              status === 'out' ? 'bg-danger/10 text-danger' : status === 'low' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
            )}>
              {status === 'out' ? 'Out of stock' : `${stock} left`}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className="w-full btn-primary py-2 text-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
        >
          <ShoppingBag size={13} />
          Add to Cart {inCartQty > 0 && `(${inCartQty})`}
        </button>
      </div>
    </motion.div>
  );
}

export default function ShopDetailPage() {
  const { shopId } = useParams();
  const [search, setSearch] = useState('');

  // 1. Get shop details
  const { data: shopRes, isLoading: shopLoading } = useQuery({
    queryKey: queryKeys.shop(shopId as string),
    queryFn: () => api.get<{ shop: IShop }>(`/shops/${shopId}`),
  });

  const shop = shopRes?.data?.shop;

  // 2. Get shop products
  const { data: productsRes, isLoading: productsLoading } = useQuery({
    queryKey: queryKeys.shopProducts(shopId as string),
    queryFn: () => api.get<{ products: IProduct[] }>(`/shops/${shopId}/products`),
  });

  const products = productsRes?.data?.products ?? [];
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (shopLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-6">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-8 w-1/4 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-60 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">🏪</div>
        <h1 className="font-display text-2xl text-foreground">Shop not found</h1>
        <Link href="/shops" className="btn-primary inline-flex mt-4">Browse Shops</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl space-y-8">
      {/* Shop Banner Header */}
      <div className="card-premium overflow-hidden bg-white">
        <div className="h-48 bg-gradient-to-r from-primary-600 to-primary-800 relative">
          {shop.bannerUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shop.bannerUrl} alt="" className="w-full h-full object-cover opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-card flex items-center justify-center overflow-hidden border border-primary-100">
              {shop.logoUrl
                ? <img src={shop.logoUrl} alt="" className="w-full h-full object-cover" />
                : <Store size={36} className="text-primary-500" />
              }
            </div>
            <div className="text-white space-y-1">
              <h1 className="font-display text-2xl font-bold leading-tight">{shop.name}</h1>
              <div className="flex items-center gap-3 text-xs text-white/80">
                <span className="flex items-center gap-1"><MapPin size={12} /> {shop.area}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5"><Star size={12} className="fill-accent-gold text-accent-gold" /> {shop.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-foreground/75 leading-relaxed">{shop.description}</p>
        </div>
      </div>

      {/* Search within shop */}
      <div className="flex items-center justify-between border-b border-primary-50 pb-4">
        <h2 className="font-display text-xl font-bold text-foreground">Available Products</h2>
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/45" />
          <input
            type="search"
            placeholder="Search this shop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-primary-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300"
            aria-label="Search within this shop"
          />
        </div>
      </div>

      {/* Products list */}
      {productsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-60 rounded-xl" />)}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-foreground/50">
          No products matched your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredProducts.map((prod) => (
              <ShopProductCard key={prod._id} product={prod} shopId={shop._id} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
