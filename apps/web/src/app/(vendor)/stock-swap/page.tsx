'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowLeftRight, Plus, CheckCircle, Truck, XCircle, Clock } from 'lucide-react';
import { api, queryKeys } from '@/lib/api-client';
import { IStockSwapRequest } from '@yaharika/shared-types';
import { getSocket } from '@/lib/socket-client';
import { useUIStore } from '@/stores/uiStore';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: 'Open', color: 'bg-primary-50 text-primary-600', icon: Clock },
  matched: { label: 'Matched', color: 'bg-accent-amber/10 text-accent-amber', icon: CheckCircle },
  in_transit: { label: 'In Transit', color: 'bg-info/10 text-info', icon: Truck },
  completed: { label: 'Completed', color: 'bg-success/10 text-success', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-danger/10 text-danger', icon: XCircle },
};

function SwapCard({ swap, shopId }: { swap: IStockSwapRequest; shopId: string }) {
  const queryClient = useQueryClient();
  const isRequesting = swap.requestingShopId?.toString() === shopId;
  const isFulfilling = swap.fulfillingShopId?.toString() === shopId;
  const cfg = statusConfig[swap.status];
  const StatusIcon = cfg.icon;

  const acceptMutation = useMutation({
    mutationFn: () => api.patch(`/stock-swap/${swap._id}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.swaps() });
      toast.success('Swap accepted! Stock transfer initiated.');
    },
    onError: () => toast.error('Failed to accept swap.'),
  });

  const completeMutation = useMutation({
    mutationFn: () => api.patch(`/stock-swap/${swap._id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.swaps() });
      toast.success('Swap marked as complete!');
    },
    onError: () => toast.error('Failed to complete swap.'),
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="card-premium p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{swap.productName}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
              <StatusIcon size={10} className="inline mr-1" />{cfg.label}
            </span>
          </div>
          <p className="text-sm text-foreground/60 capitalize mb-1">{swap.category} • {swap.qtyNeeded} units needed</p>
          <p className="text-xs text-foreground/40">{formatDate(swap.createdAt)}</p>
        </div>

        <div className="flex flex-col gap-2">
          {swap.status === 'open' && isFulfilling && (
            <button
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="btn-primary text-xs px-3 py-1.5"
            >
              Accept
            </button>
          )}
          {swap.status === 'in_transit' && isRequesting && (
            <button
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              className="px-3 py-1.5 rounded-xl text-xs bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors"
            >
              Mark Received
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function StockSwapPage() {
  const { user } = useUIStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productName: '', category: '', qtyNeeded: '' });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.swaps(),
    queryFn: () => api.get<{ swaps: IStockSwapRequest[] }>('/stock-swap'),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/stock-swap', { ...form, qtyNeeded: parseInt(form.qtyNeeded) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.swaps() });
      setShowForm(false);
      setForm({ productName: '', category: '', qtyNeeded: '' });
      toast.success('Swap request posted!');
    },
    onError: () => toast.error('Failed to create swap request.'),
  });

  // Real-time swap updates
  useEffect(() => {
    const socket = getSocket(localStorage.getItem('yaharika-token') ?? undefined);
    socket.on('swap:matched', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.swaps() });
      toast.info('🔔 New swap match found!');
    });
    return () => { socket.off('swap:matched'); };
  }, [queryClient]);

  const swaps = data?.data?.swaps ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-sm text-foreground mb-1">Stock Swap Board</h1>
          <p className="text-foreground/50">Share or request stock with nearby vendors</p>
        </div>
        <button
          onClick={() => setShowForm((o) => !o)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          New Request
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card-premium p-6 overflow-hidden"
          >
            <h2 className="font-display font-semibold text-foreground mb-4">Post Swap Request</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-foreground/70 mb-1.5 block" htmlFor="productName">Product Name</label>
                <input
                  id="productName"
                  type="text"
                  value={form.productName}
                  onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="e.g. Tata Salt"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/70 mb-1.5 block" htmlFor="category">Category</label>
                <input
                  id="category"
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="grocery"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/70 mb-1.5 block" htmlFor="qtyNeeded">Quantity Needed</label>
                <input
                  id="qtyNeeded"
                  type="number"
                  min="1"
                  value={form.qtyNeeded}
                  onChange={(e) => setForm((f) => ({ ...f, qtyNeeded: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-primary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="10"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !form.productName || !form.category || !form.qtyNeeded}
                className="btn-primary disabled:opacity-50"
              >
                Post Request
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm text-foreground/60 border border-primary-100 hover:bg-primary-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swap list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : swaps.length === 0 ? (
        <div className="text-center py-24">
          <ArrowLeftRight size={48} className="text-primary-200 mx-auto mb-4" />
          <h3 className="font-display text-xl text-foreground mb-2">No swap requests yet</h3>
          <p className="text-foreground/50 mb-6">Post your first swap request to get started.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Post Request</button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {swaps.map((swap) => (
              <SwapCard key={swap._id} swap={swap} shopId={user?._id ?? ''} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
