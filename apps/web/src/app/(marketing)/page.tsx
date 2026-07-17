'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, MapPin, Zap, Users, Leaf, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const features = [
    {
      icon: MapPin,
      title: 'Hyperlocal Shops',
      description: 'Discover neighborhood stores within walking distance',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Real-time inventory. Never out of stock.',
    },
    {
      icon: Users,
      title: 'Vendor Collaboration',
      description: 'Cross-vendor stock sharing for zero lost sales',
    },
    {
      icon: Leaf,
      title: 'Zero Waste',
      description: 'Reduce food waste with smart deals',
    },
    {
      icon: ShoppingBag,
      title: 'Smart Shopping',
      description: 'Voice search, recipes to cart, group buying',
    },
    {
      icon: Smartphone,
      title: 'Accessible Design',
      description: 'Voice commands, large text, high contrast',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold">
              ᴋ
            </div>
            <span className="font-display text-xl font-bold text-gradient-primary">Yaharika</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-4 py-2 text-primary-600 font-medium hover:text-primary-700">
              Login
            </Link>
            <Link href="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center"
      >
        <h1 className="text-display-2xl font-display font-bold text-foreground mb-6">
          One Neighborhood.<br />Many Stores.<br />
          <span className="text-gradient-primary">Zero Lost Sales.</span>
        </h1>
        <p className="text-lg text-foreground-muted max-w-2xl mx-auto mb-8">
          Yaharika connects neighborhood vendors and customers through collaborative commerce.
          When one shop runs out, others have your back. Shop local. Save more.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register?role=customer" className="btn-primary">
            Shop Now
          </Link>
          <Link href="/register?role=vendor" className="btn-gold">
            Become a Vendor
          </Link>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <h2 className="text-display-lg font-display font-bold text-center mb-16">Why Yaharika?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="card-premium p-6"
            >
              <feature.icon className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="font-display font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-foreground-muted">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center"
      >
        <div className="card-premium p-12 bg-gradient-primary text-white">
          <h2 className="text-display-md font-display font-bold mb-6">Ready to Shop Local?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of neighborhood shoppers saving time and money with Yaharika.
          </p>
          <Link href="/register?role=customer" className="inline-block bg-white text-primary-600 font-bold py-3 px-8 rounded-xl hover:shadow-lg transition-all">
            Start Shopping Now
          </Link>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-primary-100 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-foreground-muted">
          <p>&copy; 2026 Yaharika Mart. All rights reserved.</p>
          <p className="text-sm mt-2">Built for Code to Cloud '26</p>
        </div>
      </footer>
    </div>
  );
}