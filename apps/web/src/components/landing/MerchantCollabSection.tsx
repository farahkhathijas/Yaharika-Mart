'use client';
import { motion } from 'framer-motion';

// SVG diagram showing shops in a cooperative mesh
function CollabMeshDiagram() {
  const shops = [
    { x: 200, y: 80, name: 'Patel Kirana', emoji: '🏪', color: '#0F5132' },
    { x: 360, y: 160, name: "Sunita's Dairy", emoji: '🥛', color: '#2E7A55' },
    { x: 320, y: 300, name: "Ahmed's Meat", emoji: '🥩', color: '#5F9C7C' },
    { x: 80, y: 300, name: 'Lakshmi Veggies', emoji: '🥬', color: '#0F5132' },
    { x: 40, y: 160, name: 'Mohan Pharma', emoji: '💊', color: '#2E7A55' },
    { x: 200, y: 210, name: "Priya's Bakery", emoji: '🥐', color: '#C9A227' },
  ];

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 5], [1, 5], [2, 5], [3, 5], [4, 5],
  ];

  return (
    <svg viewBox="0 0 400 380" className="w-full max-w-sm mx-auto" aria-label="Merchant collaboration mesh showing shops connected in a cooperative network">
      {/* Connection lines */}
      {connections.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={shops[a].x} y1={shops[a].y}
          x2={shops[b].x} y2={shops[b].y}
          stroke={i < 5 ? '#C7E4D5' : '#C9A227'}
          strokeWidth={i < 5 ? '1.5' : '2'}
          strokeDasharray={i >= 5 ? '6 3' : 'none'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.1 }}
        />
      ))}

      {/* Shop nodes */}
      {shops.map((shop, i) => (
        <motion.g
          key={shop.name}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
        >
          <circle cx={shop.x} cy={shop.y} r={i === 5 ? 36 : 30} fill={shop.color} />
          <text x={shop.x} y={shop.y - 4} textAnchor="middle" fontSize={i === 5 ? '20' : '16'}>
            {shop.emoji}
          </text>
          <text x={shop.x} y={shop.y + 48} textAnchor="middle" fontSize="8" fill="#4A5D50" fontFamily="Inter">
            {shop.name}
          </text>
        </motion.g>
      ))}

      {/* Animated swap indicator */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ delay: 1.5, duration: 2, repeat: Infinity, repeatDelay: 2 }}
      >
        <rect x="150" y="100" width="90" height="24" rx="12" fill="#C9A227" />
        <text x="195" y="116" textAnchor="middle" fontSize="9" fill="white" fontFamily="Inter" fontWeight="600">
          📦 Swap: 10kg Rice
        </text>
      </motion.g>
    </svg>
  );
}

export function MerchantCollabSection() {
  return (
    <section className="py-24 bg-secondary-50" aria-label="Merchant collaboration model">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <CollabMeshDiagram />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <p className="text-primary-500 font-semibold mb-3 tracking-wider text-sm uppercase">The Cooperative Model</p>
              <h2 className="font-display text-display-md text-foreground mb-4">
                Merchants as partners, not competitors
              </h2>
              <p className="text-foreground/65 text-lg leading-relaxed">
                In a typical hyperlocal app, when Shop A runs out of rice, the sale is lost.
                On Yaharika Mart, Shop A's stock swap request reaches Shop B — who still has 50kg —
                in seconds. The sale happens. The customer is happy. Both shops earn.
              </p>
            </div>

            {/* Testimonial */}
            <div className="card-premium p-6 border-l-4 border-primary-300">
              <p className="text-foreground/80 italic text-lg leading-relaxed mb-4">
                "I used to lose ₹2,000–3,000 on days I ran out of rice. Now I just post a swap request
                and Sunita aunty's shop sends it over. We split the margin. Nobody loses."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-xl">🏪</div>
                <div>
                  <div className="font-semibold text-foreground">Ravi Patel</div>
                  <div className="text-sm text-foreground/50">Owner, Patel Kirana — Koramangala</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
