'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap, ShoppingBag, TrendingUp, Gift, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { IShop, IProduct } from '@yaharika/shared-types';

interface DashboardData {
  nearbyShops: IShop[];
  recentOrders: any[];
  featuredProducts: IProduct[];
  dealsRadar: any[];
}

export default function CustomerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch shops
        const shopsRes = await apiClient.get('/shops');
        const productsRes = await apiClient.get('/products');
        
        setData({
          nearbyShops: shopsRes.data || [],
          recentOrders: [],
          featuredProducts: productsRes.data?.slice(0, 6) || [],
          dealsRadar: [],
        });
      } catch (err) {
        setError('Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-skeleton rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-display-lg font-display font-bold mb-2">Welcome to Yaharika</h1>
        <p className="text-foreground-muted">Shop from nearby vendors, get deals, and help reduce waste</p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 flex items-center gap-3 bg-danger/10 border border-danger/20 rounded-lg p-4"
        >
          <AlertCircle className="w-5 h-5 text-danger" />
          <p className="text-danger">{error}</p>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-4 gap-4 mb-12"
      >
        {[
          { icon: MapPin, label: 'Nearby Shops', href: '/dashboard/shops', color: 'bg-primary-50' },
          { icon: ShoppingBag, label: 'Browse Products', href: '/dashboard/products', color: 'bg-accent-gold/10' },
          { icon: Zap, label: 'Flash Deals', href: '/dashboard/deals', color: 'bg-accent-coral/10' },
          { icon: Gift, label: 'Group Buying', href: '/dashboard/group-buy', color: 'bg-accent-amber/10' },
        ].map((action, i) => (
          <motion.a
            key={i}
            href={action.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className={`${action.color} card-premium p-6 text-center hover:shadow-card-hover transition-all cursor-pointer`}
          >
            <action.icon className="w-8 h-8 mx-auto mb-3 text-primary-600" />
            <p className="font-medium text-sm">{action.label}</p>
          </motion.a>
        ))}
      </motion.div>

      {/* Nearby Shops */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary-600" />
          Nearby Shops
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.nearbyShops.slice(0, 6).map((shop, i) => (
            <motion.a
              key={shop._id}
              href={`/dashboard/shop/${shop._id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="card-premium overflow-hidden hover:shadow-card-hover transition-all cursor-pointer group"
            >
              <div className="h-32 bg-gradient-to-br from-primary-100 to-primary-50 relative overflow-hidden">
                {shop.logoUrl && (
                  <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 group-hover:text-primary-600 transition-colors">{shop.name}</h3>
                <p className="text-sm text-foreground-muted mb-3">{shop.category}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-primary-600">{shop.rating}</span>
                    <span className="text-xs text-foreground-muted">★</span>
                  </div>
                  <span className="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded-full font-medium">
                    {shop.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* Featured Products */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary-600" />
          Featured Products
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.featuredProducts.slice(0, 6).map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="card-premium overflow-hidden hover:shadow-card-hover transition-all group"
            >
              <div className="h-40 bg-gradient-to-br from-primary-100 to-primary-50 relative overflow-hidden">
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-xs text-foreground-muted mb-3">{product.category}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-lg font-bold text-primary-600">₹{product.price}</p>
                    {product.mrp > product.price && (
                      <p className="text-xs line-through text-foreground-muted">₹{product.mrp}</p>
                    )}
                  </div>
                  <button className="btn-gold py-2 px-3 text-sm">Add</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
