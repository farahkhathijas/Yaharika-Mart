'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart3, Package, ShoppingBag, ArrowLeftRight, TrendingUp, Leaf,
  Star, Zap, Users, AlertTriangle
} from 'lucide-react';
import { api, queryKeys } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

interface InsightsData {
  totalRevenue: number;
  totalOrders: number;
  collaborationScore: number;
  topProducts: Array<{ name: string; sold: number; revenue: number }>;
  dailyRevenue: Array<{ _id: string; revenue: number; orders: number }>;
  restockSuggestions: Array<{ name: string; suggestedQty: number }>;
  swapsGiven: number;
  swapsReceived: number;
}

function MetricCard({
  title, value, sub, icon: Icon, color, delay = 0,
}: {
  title: string; value: string; sub?: string; icon: React.ElementType; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card-premium p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-foreground/50 font-medium mb-1">{title}</p>
          <p className="font-display text-2xl font-bold text-foreground">{value}</p>
          {sub && <p className="text-xs text-foreground/40 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
}

export default function VendorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.vendorInsights(),
    queryFn: () => api.get<InsightsData>('/vendor/insights'),
  });

  const insights = data?.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-sm text-foreground mb-1">Dashboard</h1>
        <p className="text-foreground/50">Your store's performance at a glance</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={isLoading ? '—' : formatCurrency(insights?.totalRevenue ?? 0)}
          sub="All time"
          icon={BarChart3}
          color="bg-primary-50 text-primary-600"
          delay={0}
        />
        <MetricCard
          title="Orders Fulfilled"
          value={isLoading ? '—' : String(insights?.totalOrders ?? 0)}
          sub="Successful orders"
          icon={ShoppingBag}
          color="bg-accent-amber/10 text-accent-amber"
          delay={0.08}
        />
        <MetricCard
          title="Swaps Completed"
          value={isLoading ? '—' : String((insights?.swapsGiven ?? 0) + (insights?.swapsReceived ?? 0))}
          sub="Stock shared"
          icon={ArrowLeftRight}
          color="bg-success/10 text-success"
          delay={0.16}
        />
        <MetricCard
          title="Collab Score"
          value={isLoading ? '—' : `${insights?.collaborationScore ?? 0}/100`}
          sub="Cooperation rating"
          icon={Star}
          color="bg-accent-coral/10 text-accent-coral"
          delay={0.24}
        />
      </div>

      {/* Revenue chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="card-premium p-6"
      >
        <h2 className="font-display text-lg font-semibold text-foreground mb-6">
          Revenue — Last 30 Days
        </h2>

        {isLoading ? (
          <div className="skeleton h-52 rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={insights?.dailyRevenue ?? []} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F5132" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0F5132" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F3ED" vertical={false} />
              <XAxis
                dataKey="_id"
                tick={{ fontSize: 11, fill: '#4A5D50' }}
                tickFormatter={(v: string) => v.slice(5)} // Show MM-DD
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#4A5D50' }}
                tickFormatter={(v: number) => `₹${v > 999 ? `${(v / 1000).toFixed(1)}k` : v}`}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                labelFormatter={(label: string) => `Date: ${label}`}
                contentStyle={{ border: '1px solid #C7E4D5', borderRadius: '12px', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0F5132"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-premium p-6"
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-5">
            🏆 Top Products
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
            </div>
          ) : (
            <ol className="space-y-3" aria-label="Top selling products">
              {(insights?.topProducts ?? []).map((p, i) => (
                <li key={p.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                    <div className="text-xs text-foreground/50">{p.sold} units sold</div>
                  </div>
                  <span className="text-sm font-semibold text-primary-600">{formatCurrency(p.revenue)}</span>
                </li>
              ))}
            </ol>
          )}
        </motion.div>

        {/* Restock Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48 }}
          className="card-premium p-6"
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-5">
            ⚡ Restock Suggestions
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : (insights?.restockSuggestions ?? []).length === 0 ? (
            <p className="text-foreground/50 text-sm">All items are well stocked! 🎉</p>
          ) : (
            <ul className="space-y-3" aria-label="Restock suggestions">
              {(insights?.restockSuggestions ?? []).map((s) => (
                <li key={s.name} className="flex items-center gap-3 p-3 bg-warning/5 border border-warning/20 rounded-xl">
                  <AlertTriangle size={16} className="text-warning flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{s.name}</div>
                    <div className="text-xs text-foreground/50">Order {s.suggestedQty} units</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
}
