'use client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShoppingCart, Minus, Plus, Star, MapPin, Package, Store, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { api, queryKeys } from '@/lib/api-client';
import { IProduct, IShop } from '@yaharika/shared-types';
import { useCartStore } from '@/stores/cartStore';
import { getSocket } from '@/lib/socket-client';
import { formatCurrency, discountPercent, getStockStatus, cn, triggerConfetti } from '@/lib/utils';
import { toast } from 'sonner';

function LiveStockBadge({ stock, threshold }: { stock: number; threshold: number }) {
  const status = getStockStatus(stock, threshold);
  const [highlighted, setHighlighted] = useState(false);

  useEffect(() => {
    setHighlighted(true);
    const t = setTimeout(() => setHighlighted(false), 600);
    return () => clearTimeout(t);
  }, [stock]);

  return (
    <div className={cn('flex items-center gap-2 text-sm', highlighted && 'stock-flash rounded px-1')}>
      <span className={cn(
        'w-2 h-2 rounded-full',
        status === 'out' ? 'bg-danger' : status === 'low' ? 'bg-warning' : 'bg-success'
      )} aria-hidden="true" />
      <span className={cn(
        'font-medium',
        status === 'out' ? 'text-danger' : status === 'low' ? 'text-warning' : 'text-foreground/70'
      )}>
        {status === 'out' ? 'Out of stock' : `${stock} in stock`}
        {status === 'low' && stock > 0 && ' — low'}
      </span>
    </div>
  );
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { addItem, hasItem, getItemQty, updateQty } = useCartStore();
  const [liveStock, setLiveStock] = useState<number | null>(null);
  const [qty, setQty] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.product(productId as string),
    queryFn: () => api.get<{ product: IProduct }>(`/products/${productId}`),
  });

  const product = data?.data?.product;
  const shop = product?.shopId as unknown as IShop | undefined;
  const currentStock = liveStock ?? product?.stock ?? 0;
  const inCart = product ? hasItem(product._id) : false;
  const cartQty = product ? getItemQty(product._id) : 0;

  // Subscribe to live stock updates
  useEffect(() => {
    if (!productId) return;
    const socket = getSocket();
    socket.emit('join:product', productId);

    socket.on('stock:updated', (payload: { productId: string; newStock: number }) => {
      if (payload.productId === productId) {
        setLiveStock(payload.newStock);
      }
    });

    return () => {
      socket.emit('leave:product', productId);
      socket.off('stock:updated');
    };
  }, [productId]);

  const handleAddToCart = () => {
    if (!product || currentStock <= 0) return;

    addItem({
      productId: product._id,
      shopId: typeof product.shopId === 'string' ? product.shopId : (product.shopId as IShop)._id,
      name: product.name,
      price: product.price,
      qty,
      image: product.images[0],
      unit: product.unit,
      stock: currentStock,
      version: product.version,
    });

    toast.success(`${product.name} added to cart!`, { duration: 2000 });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-6 w-1/2 rounded" />
            <div className="skeleton h-12 w-1/3 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h1 className="font-display text-2xl text-foreground mb-2">Product not found</h1>
        <Link href="/shops" className="btn-primary inline-flex mt-4">Browse Shops</Link>
      </div>
    );
  }

  const discount = discountPercent(product.price, product.mrp);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-foreground/50 mb-8">
        <Link href="/shops" className="hover:text-primary-600 transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Shops
        </Link>
        {shop && (
          <>
            <span>/</span>
            <Link href={`/shops/${typeof shop === 'string' ? shop : shop._id}`} className="hover:text-primary-600 transition-colors">
              {typeof shop === 'string' ? 'Shop' : shop.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          <div className="aspect-square rounded-2xl overflow-hidden bg-secondary-50 relative">
            {product.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">🛒</div>
            )}
            {discount > 0 && (
              <div className="absolute top-3 left-3 bg-danger text-white text-sm font-bold px-3 py-1 rounded-full">
                {discount}% OFF
              </div>
            )}
            {product.isZeroWasteItem && (
              <div className="absolute bottom-3 left-3 zero-waste-tag">
                🌱 Zero Waste
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.slice(0, 4).map((img, i) => (
                <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-primary-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Shop info */}
          {shop && typeof shop !== 'string' && (
            <Link
              href={`/shops/${shop._id}`}
              className="flex items-center gap-2 text-sm text-foreground/60 hover:text-primary-600 transition-colors"
            >
              <Store size={14} />
              {shop.name}
              <span>·</span>
              <MapPin size={12} />
              {shop.area}
            </Link>
          )}

          <div>
            <h1 className="font-display text-display-sm text-foreground mb-1">{product.name}</h1>
            <p className="text-foreground/50 text-sm">{product.unit}</p>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="font-display text-4xl font-bold text-primary-600">
              {formatCurrency(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-foreground/40 line-through text-xl">
                {formatCurrency(product.mrp)}
              </span>
            )}
          </div>

          {/* Live stock */}
          <div className="flex items-center gap-2" aria-live="polite" aria-atomic="true">
            <LiveStockBadge stock={currentStock} threshold={product.lowStockThreshold} />
            <div className="flex items-center gap-1 text-xs text-foreground/40">
              <span className="animate-pulse-green w-1.5 h-1.5 rounded-full bg-success inline-block" />
              Live
            </div>
          </div>

          {product.description && (
            <p className="text-foreground/65 leading-relaxed">{product.description}</p>
          )}

          {/* Quantity + Cart */}
          {currentStock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-foreground">Quantity</label>
                <div className="flex items-center gap-2 border border-primary-100 rounded-xl p-1">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-primary-50 transition-colors tap-target"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(currentStock, q + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-primary-50 transition-colors tap-target"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.97 }}
                className="w-full btn-primary flex items-center justify-center gap-2 text-base"
                aria-label={`Add ${qty} ${product.name} to cart`}
              >
                <ShoppingCart size={18} />
                {inCart ? `In Cart (${cartQty}) — Add More` : 'Add to Cart'}
              </motion.button>
            </div>
          )}

          {currentStock <= 0 && (
            <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 text-sm text-danger">
              This item is currently out of stock. Nearby shops may have it — check the{' '}
              <Link href="/deals-radar" className="underline font-semibold">Deals Radar</Link>.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
