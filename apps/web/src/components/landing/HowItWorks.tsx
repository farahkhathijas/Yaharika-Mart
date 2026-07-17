'use client';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, ArrowRight, Users } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Browse Your Neighborhood',
    description: 'Discover shops within walking distance. Filter by category, deals, or proximity. Every listing is from a real local merchant you can trust.',
    color: 'bg-primary-50 text-primary-600',
    accent: 'border-primary-200',
  },
  {
    number: '02',
    icon: ShoppingBag,
    title: 'Order with Confidence',
    description: 'Add to cart, track stock live, and checkout knowing your order is guaranteed. Voice ordering, one-tap reorder, and accessibility modes built in.',
    color: 'bg-accent-amber/10 text-accent-amber',
    accent: 'border-accent-amber/20',
  },
  {
    number: '03',
    icon: Users,
    title: 'Vendors Collaborate Behind the Scenes',
    description: 'If your primary shop runs low, our stock swap network automatically routes your order to the nearest cooperating merchant. You get your item. The vendor keeps the sale.',
    color: 'bg-success/10 text-success',
    accent: 'border-success/20',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-background" aria-label="How Yaharika Mart works">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary-500 font-semibold mb-3 tracking-wider text-sm uppercase">The Process</p>
          <h2 className="font-display text-display-md text-foreground mb-4">How It Works</h2>
          <p className="text-foreground/60 max-w-xl mx-auto text-lg">Simple for customers. Powerful for merchants.</p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-100 via-accent-amber/30 to-success/30" aria-hidden="true" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className={`card-premium p-8 border-l-4 ${step.accent} h-full`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-2xl ${step.color}`}>
                      <step.icon size={24} />
                    </div>
                    <span className="font-display text-4xl font-bold text-foreground/10">{step.number}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-foreground/65 leading-relaxed">{step.description}</p>
                </div>

                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-primary-100 items-center justify-center shadow-card" aria-hidden="true">
                    <ArrowRight size={14} className="text-primary-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
