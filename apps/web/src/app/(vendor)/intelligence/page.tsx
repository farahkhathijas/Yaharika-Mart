'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { api, queryKeys } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

interface IntelligenceData {
  restockSuggestions: Array<{ productId: string; name: string; suggestedQty: number }>;
  collaborationScore: number;
}

export default function MerchantIntelligencePage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.vendorInsights(),
    queryFn: () => api.get<IntelligenceData>('/vendor/insights'),
  });

  const insights = data?.data;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-display-sm text-foreground mb-1">Merchant Intelligence</h1>
        <p className="text-foreground/50">Smart insights and low-stock demand predictions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Restock suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-primary-700 font-semibold">
            <Lightbulb size={18} className="text-accent-amber" />
            <h2>Restock Recommendations</h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : (insights?.restockSuggestions ?? []).length === 0 ? (
            <p className="text-sm text-foreground/50">All items are perfectly stocked! No actions required.</p>
          ) : (
            <ul className="space-y-3" aria-label="Restock recommendations list">
              {insights?.restockSuggestions.map((s) => (
                <li key={s.productId} className="p-3 bg-primary-50/40 border border-primary-100 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{s.name}</p>
                    <p className="text-xs text-foreground/45">Based on 7-day sales avg</p>
                  </div>
                  <span className="text-xs font-bold bg-primary-600 text-white px-2.5 py-1 rounded-full">
                    +{s.suggestedQty} units
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Collaboration scorecard */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-premium p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-primary-700 font-semibold">
            <Sparkles size={18} className="text-accent-gold" />
            <h2>Cooperative Scorecard</h2>
          </div>

          <div className="space-y-4 text-sm text-foreground/75 leading-relaxed">
            <p>
              Your collaboration score is calculated based on how active your store is in supporting the neighborhood
              via stock swaps and loans. High scores increase search placement.
            </p>

            <div className="flex justify-between items-center bg-accent-gold/10 border border-accent-gold/20 p-4 rounded-xl">
              <span className="font-semibold text-accent-gold-dark">Collaboration Rating</span>
              <span className="text-2xl font-bold text-accent-gold">{insights?.collaborationScore ?? 0}/100</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
