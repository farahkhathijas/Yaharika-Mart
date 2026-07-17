'use client';
import { motion } from 'framer-motion';
import { Mic, Eye, Type, RotateCcw } from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Voice Ordering',
    description: 'Say "add rice to cart" or "go to checkout." Full voice control via Web Speech API.',
    demo: '🎤 "Add Sona Masoori rice to cart"',
  },
  {
    icon: Eye,
    title: 'High Contrast Mode',
    description: 'WCAG AAA-compliant contrast ratios. Near-black on near-white. Toggle instantly.',
    demo: 'Toggle in Account → Accessibility',
  },
  {
    icon: Type,
    title: 'Adjustable Text Size',
    description: 'Scale text from 75% to 150% via slider. Changes apply across the entire app instantly.',
    demo: '75% ←─────────────● 150%',
  },
  {
    icon: RotateCcw,
    title: 'One-Tap Reorder',
    description: 'Your last order. One button. Straight to checkout. For every past order.',
    demo: '⚡ Reorder: Kirana Essentials (₹487)',
  },
];

export function AccessibilitySection() {
  return (
    <section className="py-24 bg-foreground text-secondary-50" aria-label="Accessibility features">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <p className="text-primary-300 font-semibold mb-3 tracking-wider text-sm uppercase">Built for Everyone</p>
              <h2 className="font-display text-display-md text-secondary-50 mb-4">
                Accessibility is a core feature, not a plugin
              </h2>
              <p className="text-secondary-300 text-lg leading-relaxed">
                Yaharika Mart is designed for every customer — including those who rely on voice commands,
                need high contrast, or prefer larger text. Every feature works with keyboard navigation,
                screen readers, and mobile touch.
              </p>
            </div>

            <ul className="space-y-4" aria-label="Accessibility features list">
              {[
                'Full keyboard navigation with visible focus rings',
                'Screen reader support with aria-live regions for cart/stock updates',
                'Minimum 44×44px touch targets in accessibility mode',
                'Skip-to-content link for keyboard users',
                'Modal focus trapping via Radix UI',
                'Vendor image uploads require alt text (form validation)',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-secondary-200">
                  <span className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="p-2.5 rounded-xl bg-primary-500/20 w-fit mb-4">
                  <feature.icon size={20} className="text-primary-300" />
                </div>
                <h3 className="font-semibold text-secondary-100 mb-2">{feature.title}</h3>
                <p className="text-sm text-secondary-400 mb-4">{feature.description}</p>
                <div className="text-xs font-mono text-primary-400 bg-black/20 px-3 py-2 rounded-lg">
                  {feature.demo}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
