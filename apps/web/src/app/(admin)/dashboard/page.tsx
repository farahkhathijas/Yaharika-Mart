'use client';

import { motion } from 'framer-motion';
import { BarChart3, Users, ShoppingCart, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-display-lg font-display font-bold mb-2">Admin Dashboard</h1>
        <p className="text-foreground-muted">Platform analytics and management</p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {[
          { icon: TrendingUp, label: 'Total Revenue', value: '₹2,45,600', color: 'bg-accent-gold/10' },
          { icon: Users, label: 'Active Vendors', value: '42', color: 'bg-primary-50' },
          { icon: ShoppingCart, label: 'Total Orders', value: '1,284', color: 'bg-accent-coral/10' },
          { icon: BarChart3, label: 'Avg Order Value', value: '₹591', color: 'bg-accent-amber/10' },
        ].map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className={`${metric.color} card-premium p-6`}
          >
            <metric.icon className="w-8 h-8 text-primary-600 mb-3" />
            <p className="text-foreground-muted text-sm mb-1">{metric.label}</p>
            <p className="text-2xl font-bold">{metric.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Management Sections */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {[
          { label: 'Manage Vendors', href: '/admin/vendors', color: 'bg-primary-50' },
          { label: 'View Analytics', href: '/admin/analytics', color: 'bg-accent-gold/10' },
          { label: 'Platform Health', href: '/admin/health', color: 'bg-accent-amber/10' },
        ].map((action, i) => (
          <motion.a
            key={i}
            href={action.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className={`${action.color} card-premium p-6 text-center hover:shadow-card-hover transition-all cursor-pointer`}
          >
            <p className="font-bold text-lg">{action.label}</p>
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
}
