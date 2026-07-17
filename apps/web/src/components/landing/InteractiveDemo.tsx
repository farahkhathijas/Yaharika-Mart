'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, TrendingDown, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const demoProduct = {
  name: 'Sona Masoori Rice',
  shop: 'Patel Kirana',
  price: 75,
  mrp: 85,
  unit: '1 kg',
  initialStock: 24,
};

export function InteractiveDemo() {
  const [stock, setStock] = useState(demoProduct.initialStock);
  const [cartCount, setCartCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  const handleAddToCart = () => {
    if (stock <= 0 || isAnimating) return;
    setIsAnimating(true);
    setStock((s) => s - 1);
    setCartCount((c) => c + 1);
    setPulseKey((k) => k + 1);

    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleReset = () => {
    setStock(demoProduct.initialStock);
    setCartCount(0);
  };

  const stockPercent = (stock / demoProduct.initialStock) * 100;
  const stockColor = stock <= 5 ? 'bg-danger' : stock <= 10 ? 'bg-warning' : 'bg-success';

  return (
    <section className="py-24 bg-secondary-50" aria-label="Interactive product demo">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary-500 font-semibold mb-3 tracking-wider text-sm uppercase">See It Live</p>
          <h2 className="font-display text-display-md text-foreground mb-4">
            Watch stock update in real time
          </h2>
          <p className="text-foreground/60 text-lg max-w-xl mx-auto">
            Every add-to-cart immediately reflects in the stock count — live, across all connected devices. Try it.
          </p>
        </motion.div>

        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card-premium overflow-hidden"
          >
            {/* Product image placeholder */}
            <div className="h-56 bg-gradient-to-br from-primary-50 to-secondary-300 flex items-center justify-center relative">
              <div className="text-8xl">🌾</div>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-primary-600 text-xs font-bold px-3 py-1 rounded-full">
                {Math.round(((demoProduct.mrp - demoProduct.price) / demoProduct.mrp) * 100)}% OFF
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Product info */}
              <div>
                <p className="text-xs text-foreground/50 font-medium mb-1">{demoProduct.shop}</p>
                <h3 className="font-display text-xl font-semibold text-foreground">{demoProduct.name}</h3>
                <p className="text-sm text-foreground/50 mt-0.5">{demoProduct.unit}</p>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="font-display text-2xl font-bold text-primary-600">
                  {formatCurrency(demoProduct.price)}
                </span>
                <span className="text-foreground/40 line-through text-sm">
                  {formatCurrency(demoProduct.mrp)}
                </span>
              </div>

              {/* Live stock indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <motion.div
                      key={pulseKey}
                      className="w-2 h-2 rounded-full bg-success"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="font-medium text-foreground">Live Stock</span>
                  </div>
                  <motion.span
                    key={stock}
                    initial={{ scale: 1.3, color: '#C9A227' }}
                    animate={{ scale: 1, color: '#1C2B22' }}
                    className="font-bold tabular-nums"
                  >
                    {stock} units
                  </motion.span>
                </div>
                <div className="h-2 rounded-full bg-primary-50 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${stockColor} transition-colors duration-300`}
                    animate={{ width: `${stockPercent}%` }}
                    transition={{ type: 'spring', stiffness: 100 }}
                  />
                </div>
                <AnimatePresence>
                  {stock <= 5 && stock > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-danger font-semibold flex items-center gap-1"
                    >
                      <TrendingDown size={12} />
                      Only {stock} left — order soon!
                    </motion.p>
                  )}
                  {stock === 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-foreground/60 flex items-center gap-1"
                    >
                      <Sparkles size={12} className="text-accent-gold" />
                      In a real scenario, nearby shops would fulfill this — zero lost sale!
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={stock <= 0}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Add ${demoProduct.name} to cart. ${stock} units available.`}
                >
                  <ShoppingCart size={16} />
                  {stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  {cartCount > 0 && (
                    <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </motion.button>
                {cartCount > 0 && (
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl border border-primary-200 text-primary-600 text-sm font-medium hover:bg-primary-50 transition-colors"
                    aria-label="Reset demo"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Demo note */}
              <p className="text-xs text-foreground/40 text-center">
                This is a live demo — no login required. Stock updates are real-time.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
