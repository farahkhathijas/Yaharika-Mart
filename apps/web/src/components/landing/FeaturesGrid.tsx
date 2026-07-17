'use client';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight, Handshake, Lock, Zap, Users2, Radar,
  Leaf, Radio, Accessibility, BarChart3,
} from 'lucide-react';

const features = [
  {
    icon: ArrowLeftRight,
    title: 'Cross-Vendor Stock Swap',
    description: 'Out of stock? Nearby vendors automatically fill your shelf. Kanban board, real-time updates.',
    tag: 'Unique',
    color: 'text-primary-600 bg-primary-50',
  },
  {
    icon: Handshake,
    title: 'Emergency Stock Loan Network',
    description: 'Borrow stock from trusted merchants. Multiple interest models. Overdue alerts built in.',
    tag: 'Unique',
    color: 'text-accent-amber bg-accent-amber/10',
  },
  {
    icon: Lock,
    title: 'Walk-In vs Online Stock Lock',
    description: 'Reserve shelf stock for in-store customers. Slider control. Never over-sell online.',
    tag: 'Unique',
    color: 'text-accent-coral bg-accent-coral/10',
  },
  {
    icon: Zap,
    title: 'Flash Demand Smart Routing',
    description: '10-min rolling demand window. Auto-routes orders to deepest-stocked shop. Notifies vendors.',
    tag: 'Unique',
    color: 'text-accent-gold bg-accent-gold/10',
  },
  {
    icon: Users2,
    title: 'Group Buying',
    description: 'Customers unite for bulk discounts. Auto-converts to orders when target hits. Live progress bar.',
    tag: 'Unique',
    color: 'text-primary-600 bg-primary-50',
  },
  {
    icon: Radar,
    title: 'Deals Radar',
    description: 'Map + list of all active deals nearby. Filter by discount %, distance, expiry. Never miss a save.',
    tag: 'Unique',
    color: 'text-success bg-success/10',
  },
  {
    icon: Leaf,
    title: 'Zero Waste Marketplace',
    description: 'Near-expiry stock at deep discounts. Countdown urgency. Waste-diverted metric on landing page.',
    tag: 'Unique',
    color: 'text-success bg-success/10',
  },
  {
    icon: Radio,
    title: 'Live Inventory',
    description: 'Every product card shows real-time stock. Socket.IO powered. Highlight animation on change.',
    tag: 'Real-time',
    color: 'text-primary-600 bg-primary-50',
  },
  {
    icon: Accessibility,
    title: 'Accessibility Mode',
    description: 'Voice ordering, high contrast, large text, one-tap reorder. First-class, not an afterthought.',
    tag: 'Inclusive',
    color: 'text-accent-amber bg-accent-amber/10',
  },
  {
    icon: BarChart3,
    title: 'Merchant Intelligence',
    description: 'Best sellers, restock suggestions, collaboration score, nearby demand trends. Data-driven cooperation.',
    tag: 'Analytics',
    color: 'text-accent-coral bg-accent-coral/10',
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-24 bg-gradient-hero" aria-label="Platform features">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary-500 font-semibold mb-3 tracking-wider text-sm uppercase">What Makes Us Different</p>
          <h2 className="font-display text-display-md text-foreground mb-4">
            10 features you won't find anywhere else
          </h2>
          <p className="text-foreground/60 max-w-xl mx-auto text-lg">
            Every feature is purpose-built for the cooperative neighborhood commerce model.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="card-premium p-6 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${feature.color}`}>
                  <feature.icon size={20} />
                </div>
                <span className="text-xs font-semibold text-foreground/40 bg-foreground/5 px-2 py-0.5 rounded-full">
                  {feature.tag}
                </span>
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2 leading-snug">{feature.title}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
