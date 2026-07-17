'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { motion } from 'framer-motion';

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);

  return count;
}

const stats = [
  { label: 'Shops Onboarded', value: 847, suffix: '+', description: 'neighborhood stores' },
  { label: 'Orders Fulfilled', value: 24680, suffix: '+', description: 'with zero lost sales' },
  { label: 'Stock Swaps', value: 3247, suffix: '+', description: 'cross-vendor transfers' },
  { label: 'Kg Waste Diverted', value: 1240, suffix: ' kg', description: 'saved from landfills' },
];

function StatCard({ stat, started }: { stat: typeof stats[number]; started: boolean }) {
  const count = useCountUp(stat.value, 2000, started);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="card-premium p-8 text-center group cursor-default"
    >
      <div className="font-display text-5xl lg:text-6xl font-bold text-primary-600 mb-2 tabular-nums">
        {count.toLocaleString('en-IN')}{stat.suffix}
      </div>
      <div className="font-semibold text-foreground text-lg mb-1">{stat.label}</div>
      <div className="text-foreground/50 text-sm">{stat.description}</div>
    </motion.div>
  );
}

export function AnimatedStats() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 bg-gradient-hero" aria-label="Platform statistics">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary-500 font-semibold mb-3 tracking-wider text-sm uppercase">The Numbers</p>
          <h2 className="font-display text-display-md text-foreground">
            A neighborhood united
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} started={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}
