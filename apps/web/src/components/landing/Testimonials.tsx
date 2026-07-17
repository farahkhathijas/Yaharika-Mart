'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Ananya Krishnan',
    role: 'Regular Customer, Koramangala',
    avatar: '👩',
    rating: 5,
    text: "I used to get 'out of stock' constantly with other apps. Yaharika Mart has never failed me — it's like the whole neighborhood is one big store. The voice ordering feature means I can shop while cooking!",
    tag: 'Customer',
    tagColor: 'bg-primary-50 text-primary-600',
  },
  {
    name: 'Ravi Patel',
    role: 'Vendor, Patel Kirana — Koramangala',
    avatar: '🧑‍🤝‍🧑',
    rating: 5,
    text: "The stock swap feature has transformed my business. I've completed 40+ swaps this month and my revenue is up 22%. The collaboration score on my dashboard is something I genuinely compete to improve.",
    tag: 'Vendor',
    tagColor: 'bg-accent-amber/10 text-accent-amber',
  },
  {
    name: 'Arjun Sharma',
    role: 'Platform Admin',
    avatar: '👨‍💼',
    rating: 5,
    text: "From the admin dashboard I can see exactly which areas have demand spikes and which shops are over-stocked. The analytics are beautiful and actionable. This is what neighborhood commerce should look like.",
    tag: 'Admin',
    tagColor: 'bg-success/10 text-success',
  },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="py-24 bg-background" aria-label="Customer testimonials">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary-500 font-semibold mb-3 tracking-wider text-sm uppercase">Community Voice</p>
          <h2 className="font-display text-display-md text-foreground">From our neighborhood</h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="relative min-h-64">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="card-premium p-8 lg:p-10"
              >
                <div className="flex items-start gap-6">
                  <div className="text-5xl flex-shrink-0">{testimonials[current].avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${testimonials[current].tagColor}`}>
                        {testimonials[current].tag}
                      </span>
                      <div className="flex gap-0.5" aria-label={`${testimonials[current].rating} out of 5 stars`}>
                        {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                          <Star key={i} size={14} className="text-accent-gold fill-accent-gold" />
                        ))}
                      </div>
                    </div>
                    <blockquote className="text-foreground/80 text-lg leading-relaxed mb-6 italic">
                      "{testimonials[current].text}"
                    </blockquote>
                    <div>
                      <div className="font-semibold text-foreground">{testimonials[current].name}</div>
                      <div className="text-sm text-foreground/50">{testimonials[current].role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-primary-200 flex items-center justify-center hover:bg-primary-50 transition-colors tap-target"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} className="text-primary-600" />
            </button>

            <div className="flex gap-2" role="tablist" aria-label="Testimonial navigation">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Testimonial ${i + 1} of ${testimonials.length}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === current ? 'bg-primary-500 w-6' : 'bg-primary-200 hover:bg-primary-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-primary-200 flex items-center justify-center hover:bg-primary-50 transition-colors tap-target"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} className="text-primary-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
