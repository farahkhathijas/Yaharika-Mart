'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Printer, Store, MapPin, CircleCheck as CheckCircle2, Clock } from 'lucide-react';
import { api, queryKeys } from '@/lib/api-client';
import { IOrder } from '@yaharika/shared-types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

const statusSteps: Array<{ key: string; label: string }> = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderInvoicePage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.order(id as string),
    queryFn: () => api.get<{ order: IOrder }>(`/orders/${id}`),
  });

  const order = data?.data?.order;

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h1 className="font-display text-2xl text-foreground mb-2">Order not found</h1>
        <Link href="/orders" className="btn-primary inline-flex mt-4">Back to Orders</Link>
      </div>
    );
  }

  const shop = order.shopId as any;
  const customer = order.customerId as any;
  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8 no-print">
        <Link href="/orders" className="flex items-center gap-2 text-sm text-foreground/60 hover:text-primary-600 transition-colors">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Printer size={15} />
          Print / Save PDF
        </button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .card-premium { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium p-8 bg-white"
      >
        {/* Invoice Header */}
        <div className="flex items-start justify-between border-b border-primary-50 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
                <Store size={18} className="text-white" />
              </div>
              <span className="font-display text-xl font-bold text-primary-700">Yaharika Mart</span>
            </div>
            <p className="text-xs text-foreground/50">Collaborative Neighborhood Commerce</p>
          </div>
          <div className="text-right">
            <h1 className="font-display text-2xl font-bold text-foreground">INVOICE</h1>
            <p className="text-sm text-foreground/50 mt-1">#{order._id.slice(-8).toUpperCase()}</p>
            <p className="text-xs text-foreground/40">{formatDate(order.placedAt, { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        {/* Status Timeline */}
        {!isCancelled && (
          <div className="mb-8 no-print">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, i) => {
                const completed = i <= currentStepIndex;
                const isLast = i === statusSteps.length - 1;
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                        completed ? 'bg-success text-white' : 'bg-primary-50 text-primary-400'
                      )}>
                        {completed ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      </div>
                      <span className={cn('text-[10px] font-medium text-center', completed ? 'text-foreground' : 'text-foreground/40')}>
                        {step.label}
                      </span>
                    </div>
                    {!isLast && (
                      <div className={cn('flex-1 h-0.5 mx-1 -mt-4', i < currentStepIndex ? 'bg-success' : 'bg-primary-100')} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="mb-6 bg-danger/5 border border-danger/20 rounded-xl p-4 text-center text-danger font-semibold text-sm no-print">
            This order was cancelled.
          </div>
        )}

        {/* Parties */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">Billed To</p>
            <p className="font-semibold text-foreground">{customer?.name ?? 'Customer'}</p>
            <p className="text-sm text-foreground/60">{customer?.email}</p>
            <p className="text-sm text-foreground/60">{order.deliveryAddress?.line1}</p>
            <p className="text-sm text-foreground/60">{order.deliveryAddress?.area}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">Fulfilled By</p>
            <p className="font-semibold text-foreground">{shop?.name ?? 'Shop'}</p>
            <p className="text-sm text-foreground/60 flex items-center gap-1">
              <MapPin size={11} /> {shop?.area ?? 'Bengaluru'}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left border-collapse mb-6">
          <thead>
            <tr className="border-b-2 border-primary-100">
              <th className="py-3 text-xs font-bold text-foreground/60 uppercase tracking-wider">Item</th>
              <th className="py-3 text-xs font-bold text-foreground/60 uppercase tracking-wider text-center">Qty</th>
              <th className="py-3 text-xs font-bold text-foreground/60 uppercase tracking-wider text-right">Price</th>
              <th className="py-3 text-xs font-bold text-foreground/60 uppercase tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it, i) => (
              <tr key={i} className="border-b border-primary-50">
                <td className="py-3 text-sm text-foreground">{it.name}</td>
                <td className="py-3 text-sm text-foreground/70 text-center">{it.qty}</td>
                <td className="py-3 text-sm text-foreground/70 text-right">{formatCurrency(it.price)}</td>
                <td className="py-3 text-sm font-medium text-foreground text-right">{formatCurrency(it.price * it.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-foreground/70">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-foreground/70">
              <span>Delivery</span>
              <span className="text-success font-medium">Free</span>
            </div>
            <div className="border-t border-primary-100 pt-2 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment status */}
        <div className="mt-8 pt-6 border-t border-primary-50 flex items-center justify-between">
          <div>
            <p className="text-xs text-foreground/40 uppercase tracking-wider">Payment Status</p>
            <p className={cn(
              'text-sm font-semibold',
              order.paymentStatus === 'paid' ? 'text-success' : order.paymentStatus === 'refunded' ? 'text-danger' : 'text-warning'
            )}>
              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-foreground/40">Thank you for shopping local!</p>
            <p className="text-xs text-foreground/40">Yaharika Mart — One Neighborhood. Many Stores.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
