'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, Users, Store, ArrowLeftRight, TrendingUp, Sparkles, Map, PieChart } from 'lucide-react';
import { api, queryKeys } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell
} from 'recharts';

interface AdminStats {
  totalShops: number;
  totalOrders: number;
  totalRevenue: number;
  swapsCompleted: number;
  kgWasteDiverted: number;
  activeGroupBuys: number;
  totalCustomers: number;
  totalVendors: number;
}

interface AdminAnalytics {
  dailyRevenue: Array<{ _id: string; revenue: number; orders: number }>;
  topVendors: Array<{ shopName: string; revenue: number; orders: number }>;
  categoryBreakdown: Array<{ _id: string; revenue: number; units: number }>;
}

function StatCard({ title, value, icon: Icon, color, delay = 0 }: { title: string; value: string | number; icon: React.ElementType; color: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="card-premium p-6 bg-white"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-foreground/45 uppercase tracking-wider mb-1">{title}</p>
          <p className="font-display text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.adminStats(),
    queryFn: () => api.get<AdminStats>('/admin/stats'),
  });

  const { data: analyticsRes, isLoading: analyticsLoading } = useQuery({
    queryKey: queryKeys.adminAnalytics(),
    queryFn: () => api.get<AdminAnalytics>('/admin/analytics'),
  });

  const stats = statsRes?.data;
  const analytics = analyticsRes?.data;

  const COLORS = ['#0F5132', '#E8A33D', '#E76F51', '#C9A227', '#5F9C7C'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-sm text-foreground mb-1">Platform Control</h1>
        <p className="text-foreground/50">Overall health, analytics, and merchant collaboration metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={statsLoading ? '—' : formatCurrency(stats?.totalRevenue ?? 0)}
          icon={BarChart3}
          color="bg-primary-50 text-primary-600"
          delay={0}
        />
        <StatCard
          title="Completed Swaps"
          value={statsLoading ? '—' : stats?.swapsCompleted ?? 0}
          icon={ArrowLeftRight}
          color="bg-success/10 text-success"
          delay={0.06}
        />
        <StatCard
          title="Waste Diverted"
          value={statsLoading ? '—' : `${stats?.kgWasteDiverted ?? 0} kg`}
          icon={TrendingUp}
          color="bg-accent-gold/15 text-accent-gold"
          delay={0.12}
        />
        <StatCard
          title="Total Shops"
          value={statsLoading ? '—' : stats?.totalShops ?? 0}
          icon={Store}
          color="bg-accent-coral/10 text-accent-coral"
          delay={0.18}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="card-premium p-6 lg:col-span-2 bg-white"
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-6">
            Platform Revenue Trend
          </h2>
          {analyticsLoading ? (
            <div className="skeleton h-56 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={analytics?.dailyRevenue ?? []} margin={{ left: -10, right: 10 }}>
                <defs>
                  <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F5132" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0F5132" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F3ED" vertical={false} />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `₹${v > 999 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ border: '1px solid #C7E4D5', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0F5132" strokeWidth={2} fill="url(#adminRevenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Top Vendors */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-premium p-6 bg-white"
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-5">
            🏆 Top Performing Shops
          </h2>
          {analyticsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
            </div>
          ) : (
            <ul className="space-y-4" aria-label="Top performing shops list">
              {analytics?.topVendors.map((v, i) => (
                <li key={v.shopName} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{v.shopName}</p>
                    <p className="text-xs text-foreground/45">{v.orders} orders</p>
                  </div>
                  <span className="text-sm font-bold text-primary-600">{formatCurrency(v.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="card-premium p-6 bg-white"
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
            <PieChart size={18} className="text-primary-600" />
            Category Performance
          </h2>
          {analyticsLoading ? (
            <div className="skeleton h-48 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics?.categoryBreakdown ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F3ED" vertical={false} />
                <XAxis dataKey="_id" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ border: '1px solid #C7E4D5', borderRadius: '12px' }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {(analytics?.categoryBreakdown ?? []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Heat Map illustration */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="card-premium p-6 bg-white space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <Map size={18} className="text-primary-600" />
              Demand Spikes Heat Map
            </h2>
            <span className="text-xs font-bold text-success bg-success/15 px-2 py-0.5 rounded-full animate-pulse">
              Live
            </span>
          </div>

          <div className="h-44 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-300 relative flex items-center justify-center overflow-hidden border border-primary-100">
            {/* Map Grid Gridline Mock */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#C7E4D5_1px,transparent_1px),linear-gradient(to_bottom,#C7E4D5_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />

            {/* Glowing heat spots */}
            <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-accent-gold rounded-full filter blur-xl opacity-60 animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-20 h-20 bg-accent-coral rounded-full filter blur-2xl opacity-50 animate-pulse" />

            <div className="z-10 text-center space-y-1">
              <p className="font-semibold text-primary-900 text-sm">Spike Detected: Koramangala Area</p>
              <p className="text-xs text-primary-800/75">High demand for: "Sona Masoori Rice" & "Dahi"</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
