'use client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Clock, ShieldCheck, Truck, Package } from 'lucide-react';
import { api, queryKeys } from '@/lib/api-client';
import { IOrder } from '@yaharika/shared-types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import Link from 'next/link';

const orderStatusMetadata: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  placed: { label: 'Placed', color: 'bg-primary-50 text-primary-700', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-info/10 text-info', icon: ShieldCheck },
  preparing: { label: 'Preparing', color: 'bg-accent-amber/10 text-accent-amber', icon: Package },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-accent-gold/15 text-accent-gold', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-success/10 text-success', icon: ShieldCheck },
  cancelled: { label: 'Cancelled', color: 'bg-danger/10 text-danger', icon: Clock },
};

function OrderCard({ order }: { order: IOrder }) {
  const shop = order.shopId as any;
  const statusMeta = orderStatusMetadata[order.status] || { label: order.status, color: 'bg-foreground/5 text-foreground/50', icon: Clock };
  const StatusIcon = statusMeta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium p-6 space-y-4"
    >
      <div className="flex items-center justify-between border-b border-primary-50/50 pb-4">
        <div>
          <span className="text-xs text-foreground/45">Order ID</span>
          <p className="font-semibold text-sm text-foreground truncate max-w-[140px] sm:max-w-none">#{order._id}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-foreground/45">Placed On</span>
          <p className="font-medium text-sm text-foreground">{formatDate(order.placedAt)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-foreground text-base mb-1">{shop?.name ?? 'Shop'}</h3>
          <p className="text-xs text-foreground/50">{order.items.length} item{order.items.length !== 1 ? 's' : ''} • {formatCurrency(order.total)}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${statusMeta.color}`}>
          <StatusIcon size={12} />
          {statusMeta.label}
        </span>
      </div>

      <div className="bg-foreground/5 rounded-xl p-3">
        <ul className="space-y-1.5" aria-label="Order items">
          {order.items.map((it) => (
            <li key={typeof it.productId === 'string' ? it.productId : (it.productId as any)?._id || String(it.productId)} className="flex justify-between text-xs text-foreground/75">
              <span>{it.name} <span className="text-foreground/40">x{it.qty}</span></span>
              <span className="font-medium">{formatCurrency(it.price * it.qty)}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function CustomerOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.orders(),
    queryFn: () => api.get<{ items: IOrder[] }>('/orders'),
  });

  const orders = data?.data?.items ?? [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-display-sm text-foreground mb-2">Your Orders</h1>
        <p className="text-foreground/50">Track and manage your order history</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-44 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <div className="text-6xl">🛍️</div>
          <h3 className="font-display text-xl text-foreground">No orders yet</h3>
          <p className="text-foreground/50">Browse shops near you and place your first order.</p>
          <Link href="/shops" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag size={16} />
            Browse Shops
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
