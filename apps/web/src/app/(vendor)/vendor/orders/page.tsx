'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Truck, Package, XCircle, ShieldCheck } from 'lucide-react';
import { api, queryKeys } from '@/lib/api-client';
import { IOrder } from '@yaharika/shared-types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusFlows: Record<string, { nextStatus: string; label: string; icon: React.ElementType; color: string }> = {
  placed: { nextStatus: 'confirmed', label: 'Confirm Order', icon: CheckCircle, color: 'bg-primary-500 text-white' },
  confirmed: { nextStatus: 'preparing', label: 'Start Preparing', icon: Package, color: 'bg-info text-white hover:bg-info/90' },
  preparing: { nextStatus: 'out_for_delivery', label: 'Ship Order', icon: Truck, color: 'bg-accent-amber text-white hover:bg-accent-amber/90' },
  out_for_delivery: { nextStatus: 'delivered', label: 'Mark Delivered', icon: ShieldCheck, color: 'bg-success text-white hover:bg-success/90' },
};

function VendorOrderCard({ order }: { order: IOrder }) {
  const queryClient = useQueryClient();
  const nextFlow = statusFlows[order.status];

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => api.patch(`/orders/${order._id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders() });
      toast.success(`Order status updated successfully!`);
    },
    onError: () => {
      toast.error('Failed to update status.');
    },
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="card-premium p-6 space-y-4 bg-white"
    >
      <div className="flex justify-between items-start border-b border-primary-50/50 pb-4">
        <div>
          <span className="text-xs text-foreground/45">Order ID</span>
          <p className="font-semibold text-sm">#{order._id}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-foreground/45 font-medium">Placed On</span>
          <p className="text-sm font-medium text-foreground">{formatDate(order.placedAt)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-foreground/45">Customer</p>
          <p className="font-semibold text-foreground">{(order.customerId as any)?.name ?? 'Customer'}</p>
        </div>
        <div>
          <p className="text-xs text-foreground/45 text-right">Total Amount</p>
          <p className="font-bold text-primary-600 text-lg">{formatCurrency(order.total)}</p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-background-sand/20 rounded-xl p-3">
        <ul className="space-y-1.5" aria-label="Order items list">
          {order.items.map((it) => (
            <li key={typeof it.productId === 'string' ? it.productId : (it.productId as any)?._id || String(it.productId)} className="flex justify-between text-xs text-foreground/85">
              <span>{it.name} <span className="text-foreground/45 font-medium">x{it.qty}</span></span>
              <span className="font-semibold">{formatCurrency(it.price * it.qty)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <button
            onClick={() => updateStatusMutation.mutate('cancelled')}
            disabled={updateStatusMutation.isPending}
            className="px-3.5 py-2 rounded-xl border border-danger/20 text-danger hover:bg-danger/5 transition-colors text-xs font-semibold"
          >
            Cancel
          </button>
        )}

        {nextFlow && (
          <button
            onClick={() => updateStatusMutation.mutate(nextFlow.nextStatus)}
            disabled={updateStatusMutation.isPending}
            className={cn('px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors', nextFlow.color)}
          >
            <nextFlow.icon size={13} />
            {nextFlow.label}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function VendorOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.orders(),
    queryFn: () => api.get<{ items: IOrder[] }>('/orders'),
  });

  const orders = data?.data?.items ?? [];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-display-sm text-foreground mb-1">Incoming Orders</h1>
        <p className="text-foreground/50">Manage fulfillment of customer orders placed at your shop</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="font-display text-xl text-foreground">No orders yet</h3>
          <p className="text-foreground/50">Incoming customer orders will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => (
              <VendorOrderCard key={order._id} order={order} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
