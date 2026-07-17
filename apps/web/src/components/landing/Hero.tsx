'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, ShoppingBag } from 'lucide-react';

// Animated SVG illustration for stock flowing between shops
function StockFlowIllustration() {
  return (
    <svg viewBox="0 0 480 400" className="w-full max-w-lg mx-auto" aria-label="Stock flowing between neighborhood shops illustration">
      <defs>
        <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F5132" />
          <stop offset="100%" stopColor="#2E7A55" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#E8A33D" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background circles */}
      <circle cx="240" cy="200" r="160" fill="#E8F3ED" opacity="0.5" />
      <circle cx="240" cy="200" r="100" fill="#C7E4D5" opacity="0.3" />

      {/* Shop icons — 5 shops in a circle */}
      {[
        { x: 240, y: 80, label: 'Kirana', emoji: '🏪' },
        { x: 380, y: 180, label: 'Dairy', emoji: '🥛' },
        { x: 330, y: 320, label: 'Bakery', emoji: '🥐' },
        { x: 150, y: 320, label: 'Pharmacy', emoji: '💊' },
        { x: 100, y: 180, label: 'Veggies', emoji: '🥬' },
      ].map((shop, i) => (
        <motion.g
          key={shop.label}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.15, type: 'spring', stiffness: 200 }}
        >
          <circle cx={shop.x} cy={shop.y} r="40" fill="url(#greenGrad)" filter="url(#glow)" />
          <text x={shop.x} y={shop.y - 5} textAnchor="middle" fontSize="22" role="img" aria-label={shop.emoji}>{shop.emoji}</text>
          <text x={shop.x} y={shop.y + 15} textAnchor="middle" fontSize="9" fill="white" fontFamily="Inter" fontWeight="600">{shop.label}</text>
        </motion.g>
      ))}

      {/* Animated flow arrows between shops */}
      {[
        { x1: 270, y1: 100, x2: 365, y2: 165 },
        { x1: 370, y1: 205, x2: 345, y2: 300 },
        { x1: 305, y1: 330, x2: 175, y2: 330 },
        { x1: 140, y1: 300, x2: 115, y2: 205 },
        { x1: 130, y1: 165, x2: 215, y2: 100 },
      ].map((line, i) => (
        <motion.line
          key={i}
          x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
          stroke="url(#goldGrad)"
          strokeWidth="2"
          strokeDasharray="8 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.8 + i * 0.1, duration: 0.6 }}
        />
      ))}

      {/* Center badge */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: 'spring' }}
      >
        <circle cx="240" cy="200" r="32" fill="url(#goldGrad)" />
        <text x="240" y="196" textAnchor="middle" fontSize="14" fill="white" fontFamily="Fraunces" fontWeight="700">Zero</text>
        <text x="240" y="210" textAnchor="middle" fontSize="10" fill="white" fontFamily="Inter">Lost Sales</text>
      </motion.g>

      {/* Floating stock boxes */}
      {[{ x: 290, y: 140, delay: 1.8 }, { x: 185, y: 260, delay: 2.1 }, { x: 340, y: 250, delay: 2.4 }].map((box, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
          transition={{ delay: box.delay, duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          <rect x={box.x} y={box.y} width="28" height="20" rx="4" fill="#C9A227" />
          <text x={box.x + 14} y={box.y + 13} textAnchor="middle" fontSize="10">📦</text>
        </motion.g>
      ))}
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-hero pt-20">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-secondary-300 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-1/2 right-10 w-64 h-64 bg-accent-gold/10 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-sm font-semibold"
            >
              <Zap size={14} className="text-accent-gold" />
              Code to Cloud '26 Full Stack Challenge
            </motion.div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="font-display text-display-lg lg:text-display-xl text-foreground leading-tight text-balance">
                One Neighborhood.{' '}
                <span className="text-gradient-primary">Many Stores.</span>{' '}
                <span className="italic text-accent-gold/90">Zero</span> Lost Sales.
              </h1>
              <p className="text-lg lg:text-xl text-foreground/70 leading-relaxed max-w-xl">
                Yaharika Mart is not a Blinkit, Amazon, Zepto, or Instamart clone. It is a{' '}
                <strong className="text-primary-600">collaborative neighborhood commerce platform</strong>{' '}
                where merchants cooperate — sharing stock, absorbing demand spikes, and jointly serving
                customers so that no sale is ever lost to an "out of stock" screen.
              </p>
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/shops"
                className="btn-primary flex items-center justify-center gap-2 text-base"
              >
                <ShoppingBag size={18} />
                Shop Your Neighborhood
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/register-vendor"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-primary-200 text-primary-600 font-semibold hover:bg-primary-50 transition-all duration-200 text-base"
              >
                List Your Store
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-6 pt-2"
            >
              {[
                { label: '8 Shops', sub: 'in 3 areas' },
                { label: '10 Features', sub: 'unique to us' },
                { label: 'Zero clones', sub: 'built different' },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-400" />
                  <span className="font-semibold text-foreground">{badge.label}</span>
                  <span className="text-foreground/50 text-sm">{badge.sub}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <StockFlowIllustration />

            {/* Floating stats cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute top-8 -left-4 card-premium p-3 text-sm"
            >
              <div className="text-xs text-foreground/50 font-medium">Stock Swap</div>
              <div className="text-primary-600 font-bold text-lg">247 done</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute bottom-8 -right-4 card-premium p-3 text-sm"
            >
              <div className="text-xs text-foreground/50 font-medium">Waste Saved</div>
              <div className="text-success font-bold text-lg">1.2 tonnes</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
