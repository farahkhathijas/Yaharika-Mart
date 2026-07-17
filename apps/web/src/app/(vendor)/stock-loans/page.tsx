'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Handshake, Plus, HelpCircle, CheckCircle } from 'lucide-react';
import { api, queryKeys } from '@/lib/api-client';
import { IStockLoan } from '@yaharika/shared-types';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { toast } from 'sonner';

function LoanCard({ loan, shopId }: { loan: IStockLoan; shopId: string }) {
  const queryClient = useQueryClient();
  const isBorrower = loan.borrowingShopId?.toString() === shopId;
  const isLender = loan.lendingShopId?.toString() === shopId;

  const returnMutation = useMutation({
    mutationFn: () => api.patch(`/stock-loans/${loan._id}/return`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans() });
      toast.success('Stock marked as returned successfully!');
    },
    onError: () => toast.error('Failed to process return.'),
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="card-premium p-5 bg-white"
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{(loan.productId as any)?.name ?? 'Product'}</h3>
            <span className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              loan.returnStatus === 'returned'
                ? 'bg-success/10 text-success'
                : loan.returnStatus === 'overdue'
                ? 'bg-danger/10 text-danger'
                : 'bg-warning/10 text-warning'
            )}>
              {loan.returnStatus}
            </span>
          </div>
          <p className="text-sm text-foreground/60">{loan.qtyBorrowed} units borrowed</p>
          <p className="text-xs text-foreground/40 mt-1">
            Return agreed date: {formatDate(loan.agreedReturnDate)}
          </p>
        </div>

        {loan.returnStatus === 'pending' && isBorrower && (
          <button
            onClick={() => returnMutation.mutate()}
            disabled={returnMutation.isPending}
            className="btn-primary text-xs px-3.5 py-1.5"
          >
            Return Stock
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function StockLoansPage() {
  const { user } = useUIStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ lendingShopId: '', productId: '', qtyBorrowed: '', agreedReturnDate: '', interestType: 'free' });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.loans(),
    queryFn: () => api.get<{ loans: IStockLoan[] }>('/stock-loans'),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/stock-loans', {
      ...form,
      qtyBorrowed: parseInt(form.qtyBorrowed),
      agreedReturnDate: new Date(form.agreedReturnDate),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans() });
      setShowForm(false);
      setForm({ lendingShopId: '', productId: '', qtyBorrowed: '', agreedReturnDate: '', interestType: 'free' });
      toast.success('Stock loan request created!');
    },
    onError: () => toast.error('Failed to request stock loan.'),
  });

  const loans = data?.data?.loans ?? [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-display-sm text-foreground mb-1">Stock Loan Directory</h1>
          <p className="text-foreground/50">Manage inventory loans with neighborhood shops</p>
        </div>
        <button
          onClick={() => setShowForm((o) => !o)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Request Loan
        </button>
      </div>

      {/* Request Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card-premium p-6 overflow-hidden space-y-4"
          >
            <h2 className="font-display font-semibold text-foreground">Request Stock Loan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground/75 mb-1 block" htmlFor="lendShop">Lending Shop ID</label>
                <input
                  id="lendShop"
                  type="text"
                  value={form.lendingShopId}
                  onChange={(e) => setForm((f) => ({ ...f, lendingShopId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-primary-100 text-sm focus:outline-none"
                  placeholder="Paste shop ID"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground/75 mb-1 block" htmlFor="prodId">Product ID</label>
                <input
                  id="prodId"
                  type="text"
                  value={form.productId}
                  onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-primary-100 text-sm focus:outline-none"
                  placeholder="Paste product ID"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground/75 mb-1 block" htmlFor="qtyBorr">Quantity</label>
                <input
                  id="qtyBorr"
                  type="number"
                  value={form.qtyBorrowed}
                  onChange={(e) => setForm((f) => ({ ...f, qtyBorrowed: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-primary-100 text-sm focus:outline-none"
                  placeholder="20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground/75 mb-1 block" htmlFor="retDate">Return Date</label>
                <input
                  id="retDate"
                  type="date"
                  value={form.agreedReturnDate}
                  onChange={(e) => setForm((f) => ({ ...f, agreedReturnDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-primary-100 text-sm focus:outline-none bg-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !form.lendingShopId || !form.productId || !form.qtyBorrowed || !form.agreedReturnDate}
                className="btn-primary py-2 disabled:opacity-50"
              >
                Submit Request
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl border border-primary-100 text-sm hover:bg-primary-50 text-foreground/60"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loans list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : loans.length === 0 ? (
        <div className="text-center py-24">
          <Handshake size={48} className="text-primary-200 mx-auto mb-4" />
          <h3 className="font-display text-xl text-foreground mb-2">No active loans</h3>
          <p className="text-foreground/50">Lend or borrow items to optimize neighborhood inventory.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {loans.map((loan) => (
              <LoanCard key={loan._id} loan={loan} shopId={user?._id ?? ''} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
