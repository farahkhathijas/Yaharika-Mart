'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Map, Navigation, ArrowRightLeft, Handshake, Zap,
  Play, Pause, Award, Sparkles, MapPin, Truck, ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useUIStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency, triggerConfetti } from '@/lib/utils';

// Haversine formula implementation helper
function calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const mockStores = [
  { id: '1', name: 'Patel Kirana', category: 'grocery', lat: 12.9347, lng: 77.6249, emoji: '🏪' },
  { id: '2', name: "Sunita's Dairy", category: 'dairy', lat: 12.9355, lng: 77.6238, emoji: '🥛' },
  { id: '3', name: 'Mohan Medicals', category: 'pharmacy', lat: 12.9325, lng: 77.6285, emoji: '💊' },
  { id: '4', name: "Priya's Bake House", category: 'bakery', lat: 12.9388, lng: 77.6210, emoji: '🥐' },
];

export default function DemoPage() {
  const { user } = useUIStore();
  const [activeTab, setActiveTab] = useState<'walkthrough' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5'>('walkthrough');
  
  // Geolocation state for Q1
  const [coords, setCoords] = useState({ lat: 12.9348, lng: 77.6246 }); // Default center Koramangala
  const [geoStatus, setGeoStatus] = useState<'default' | 'loading' | 'success' | 'denied'>('default');
  const [haversineLogs, setHaversineLogs] = useState<string[]>([]);

  // Presentation slides state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: 'The Hyperlocal Pain Point',
      subtitle: 'Lost Sales & Fragmented Inventory',
      content: 'In standard hyperlocal apps, if a store runs out of an item, the sale is lost, the order is cancelled, and the customer is unhappy. Merchants operate in isolation, competing aggressively for margins.',
      emoji: '❌',
    },
    {
      title: 'The Yaharika Solution',
      subtitle: 'One Neighborhood, Many Stores',
      content: 'Yaharika Mart creates a cooperative mesh network of local merchants. When Shop A runs out of basmati rice, Shop B’s surplus automatically fulfills the customer’s request behind the scenes, splitting the margin.',
      emoji: '🤝',
    },
    {
      title: 'Platform Architecture',
      subtitle: 'Turborepo, Express, Next.js & Sockets',
      content: 'Built on a modern monorepo. Sockets handle real-time inventory updates and instant stock swap proposals. Cron jobs check loan due dates, while checkout logic enforces walk-in stock locks.',
      emoji: '🏗️',
    },
    {
      title: 'Customer Journey',
      subtitle: 'Browse, Filter, Place Order & Track',
      content: 'A customer signs up, looks up nearby stores sorted by proximity, adds fresh groceries to their cart, selects accessibility preferences, places an order, and tracks live status in real time.',
      emoji: '🛍️',
    },
    {
      title: 'Vendor Journey',
      subtitle: 'Manage stock, swap requests & dashboards',
      content: 'Vendors list products, adjust walk-in reserve thresholds, approve incoming emergency loan requests, fulfill customer orders, and analyze revenue statistics.',
      emoji: '🏪',
    },
    {
      title: 'Admin Journey',
      subtitle: 'Platform analytics & demand spikes maps',
      content: 'Administrators verify registered stores, analyze platform-wide transaction summaries, and monitor live hot spot demand spikes to coordinate neighborhood supply logistics.',
      emoji: '👑',
    },
    {
      title: 'Nearby Store Discovery',
      subtitle: 'Haversine formula & location mapping',
      content: 'Using browser GPS geolocation coordinates, the server calculates real-time store distances in meters using the Haversine formula and sorts the discovery grid dynamically.',
      emoji: '🗺️',
    },
    {
      title: 'Cross Vendor Stock Swap',
      subtitle: 'Atomic updates during out-of-stock events',
      content: 'If Patel Kirana runs out of a customer ordered item, our engine automatically matches nearby cooperating shops, triggers a swap request, and updates inventories atomically.',
      emoji: '🔄',
    },
    {
      title: 'Emergency Stock Loan',
      subtitle: 'Peer-to-peer inventory sharing ledger',
      content: 'Shops borrow items from neighbors to meet unexpected demand. Features due date tracking, return indicators, and a platform-wide merchant trust scorecard.',
      emoji: '💰',
    },
    {
      title: 'Recipe to Cart',
      subtitle: 'Smart cooking lists mapping tools',
      content: 'Select a dish (e.g. Paneer Butter Masala) or paste instructions. Our engine parses the text, finds ingredients at nearby shops, matches organic substitutions, and updates the cart.',
      emoji: '🍳',
    },
    {
      title: 'Flash Demand Routing',
      subtitle: 'Spike protection & rerouting gateways',
      content: 'When search frequencies spike for a category in an area within a 10-minute window, checkout operations are routed to the deepest stocked cooperating shop to prevent crashes.',
      emoji: '⚡',
    },
    {
      title: 'Deals Radar',
      subtitle: 'Scan immediate neighborhood for bargains',
      content: 'A range-sorted radar scanning local shops for flash discounts, surplus promotions, and active merchant-created zero waste listings.',
      emoji: '📡',
    },
    {
      title: 'Group Buying',
      subtitle: 'Neighborhood collective orders pooling',
      content: 'Neighbors pool purchases to hit bulk wholesale discounts. When the target is reached before the deadline, orders are placed automatically.',
      emoji: '👥',
    },
    {
      title: 'Accessibility Mode',
      subtitle: 'Vocal search, synthesizers & contrast',
      content: 'A first-class feature offering Web Speech navigation controls, audio synthesizers, screen reader ARIA labels, one-tap reordering, and font scaling.',
      emoji: '👁️',
    },
    {
      title: 'Cloud Deployment',
      subtitle: 'Vercel, Render & MongoDB Atlas',
      content: 'Frontend is optimized on Vercel. API service gateway runs on Render. Storage is hosted on Atlas with secure env configurations and GitHub Actions check pipelines.',
      emoji: '☁️',
    },
    {
      title: 'Technology Stack',
      subtitle: 'Next.js 14, Express, Mongoose & Recast',
      content: 'Next.js App Router, Tailwind design systems, Zustand stores, Express router, Socket.io rooms, Node-cron schedulers, and hosted Mongo instances.',
      emoji: '💻',
    },
    {
      title: 'Impact',
      subtitle: 'Zero lost sales & food waste reduction',
      content: 'Merchants recover ₹2,000–3,000 lost daily on out-of-stock items, customers get faster delivery with zero cancellations, and zero-waste markets save tons of fresh food.',
      emoji: '🌱',
    },
    {
      title: 'Future Scope',
      subtitle: 'AI demand prediction & route models',
      content: 'Integrating local event calendars to predict demand spikes before they happen and automated delivery agent path optimization models.',
      emoji: '🔮',
    },
  ];

  // Q2 Order tracking state
  const [orderStep, setOrderStep] = useState(0);
  const [orderEta, setOrderEta] = useState(25);
  const steps = ['Order Placed', 'Preparing', 'Packed', 'Carrier Assigned', 'On the Way', 'Delivered'];
  const riderPath = [
    { x: 300, y: 100 }, // Start at Shop
    { x: 260, y: 130 },
    { x: 220, y: 160 },
    { x: 180, y: 190 }, // Moving toward User
    { x: 100, y: 220 }, // User Location
  ];

  // Q3 Stock Swap Simulation
  const [swapState, setSwapState] = useState<'idle' | 'failed' | 'matching' | 'matched' | 'transferring' | 'completed'>('idle');
  const [swapLogs, setSwapLogs] = useState<string[]>([]);

  // Q4 P2P Loans state
  const [loans, setLoans] = useState([
    { id: 'L1', borrower: 'Mohan Medicals', lender: 'Patel Kirana', item: 'Paracetamol Strip', qty: 10, status: 'pending', date: '2026-07-17' },
  ]);

  // Q5 Flash demand state
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [demandHeatMap, setDemandHeatMap] = useState<number[]>([12, 18, 5, 22, 14, 45, 9, 32, 16]);

  // Request location for Q1
  const requestLocation = () => {
    setGeoStatus('loading');
    setHaversineLogs(['Initiating Web Geolocation request...']);
    
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      setHaversineLogs((l) => [...l, '❌ Web Geolocation API not supported by browser. Falling back to default Koramangala coordinates.']);
      calculateDistances(coords.lat, coords.lng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(newCoords);
        setGeoStatus('success');
        setHaversineLogs((l) => [...l, `✅ Got user location: Lat: ${newCoords.lat.toFixed(5)}, Lng: ${newCoords.lng.toFixed(5)}`]);
        calculateDistances(newCoords.lat, newCoords.lng);
      },
      (err) => {
        setGeoStatus('denied');
        setHaversineLogs((l) => [...l, `❌ Geolocation denied (${err.message}). Falling back to Koramangala coordinates.`]);
        calculateDistances(coords.lat, coords.lng);
      }
    );
  };

  const calculateDistances = (userLat: number, userLng: number) => {
    const logs: string[] = [];
    mockStores.forEach((store) => {
      const dist = calculateHaversine(userLat, userLng, store.lat, store.lng);
      logs.push(`Distance to [${store.name}]: Haversine((${userLat.toFixed(4)}, ${userLng.toFixed(4)}) ➔ (${store.lat.toFixed(4)}, ${store.lng.toFixed(4)})) = ${dist.toFixed(3)} km`);
    });
    setHaversineLogs((l) => [...l, ...logs]);
  };

  // Run initial distances on default coordinates
  useEffect(() => {
    calculateDistances(coords.lat, coords.lng);
  }, []);

  // Q2 tracking interval simulation
  useEffect(() => {
    if (orderStep > 0 && orderStep < steps.length - 1) {
      const t = setTimeout(() => {
        setOrderStep((s) => s + 1);
        setOrderEta((e) => Math.max(0, e - 5));
        toast.info(`Order updated to: ${steps[orderStep + 1]}`);
      }, 6000);
      return () => clearTimeout(t);
    } else if (orderStep === steps.length - 1) {
      triggerConfetti();
    }
  }, [orderStep]);

  // Q3 Swap simulation triggers
  const startSwapSimulation = () => {
    setSwapState('matching');
    setSwapLogs(['[Engine] Out of stock detected on: Sona Masoori Rice (Req: Patel Kirana)', '[Engine] Querying neighborhood shops within 3km...']);
    
    setTimeout(() => {
      setSwapState('matched');
      setSwapLogs((l) => [
        ...l,
        '[Engine] MATCH FOUND: Sunita\'s Dairy has 80 units surplus!',
        '[Socket] Dispatching swap proposal request to Sunita\'s Dairy owner terminal...'
      ]);
    }, 2000);
  };

  const acceptSwap = () => {
    setSwapState('transferring');
    setSwapLogs((l) => [...l, '[UI] Sunita Verma approved swap request!', '[Engine] Commencing atomic inventory update...']);
    
    setTimeout(() => {
      setSwapState('completed');
      setSwapLogs((l) => [
        ...l,
        '[Atomic] Patel Kirana stock: +10 units | Sunita\'s Dairy stock: -10 units (Version increment locked)',
        '[Engine] Customer order checkout completed successfully. Zero lost sales!'
      ]);
      toast.success('Swap completed! Inventory synchronized.');
    }, 2500);
  };

  // Q5 Flash demand simulator
  const toggleFlashDemand = () => {
    setIsFlashActive((a) => !a);
    if (!isFlashActive) {
      // Simulate spike in Jayanagar area
      setDemandHeatMap([12, 18, 5, 22, 98, 45, 9, 32, 16]); // Grid element 4 gets spike (98 score)
      toast.warning('⚠️ Flash demand spike triggered in Central Area!');
    } else {
      setDemandHeatMap([12, 18, 5, 22, 14, 45, 9, 32, 16]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-primary-50 pb-6">
        <div>
          <h1 className="font-display text-display-md text-foreground flex items-center gap-2">
            <Award className="text-accent-gold" />
            Judge Demonstration Panel
          </h1>
          <p className="text-foreground/50">Interactive verification environment for the Code to Cloud '26 Challenge</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 bg-white border border-primary-50 rounded-2xl p-1.5 shadow-sm">
          {[
            { id: 'walkthrough', label: 'Walkthrough', icon: Sparkles },
            { id: 'q1', label: 'Q1: Locator', icon: Navigation },
            { id: 'q2', label: 'Q2: Tracking', icon: Truck },
            { id: 'q3', label: 'Q3: Stock Swap', icon: ArrowRightLeft },
            { id: 'q4', label: 'Q4: P2P Loan', icon: Handshake },
            { id: 'q5', label: 'Q5: Flash Demand', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {/* Walkthrough Slideshow */}
        {activeTab === 'walkthrough' && (
          <motion.div
            key="walkthrough"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center py-6"
          >
            <div className="md:col-span-2 space-y-6">
              <div className="card-premium p-8 bg-white min-h-[300px] flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-5xl">{slides[currentSlide].emoji}</div>
                  <div>
                    <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">{slides[currentSlide].subtitle}</span>
                    <h2 className="font-display text-2xl font-bold text-foreground mt-1">{slides[currentSlide].title}</h2>
                  </div>
                  <p className="text-foreground/75 leading-relaxed">{slides[currentSlide].content}</p>
                </div>

                {/* Slides navigation */}
                <div className="flex justify-between items-center pt-6 border-t border-primary-50/50">
                  <span className="text-xs text-foreground/40 font-medium">Slide {currentSlide + 1} of {slides.length}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
                      disabled={currentSlide === 0}
                      className="w-8 h-8 rounded-lg border border-primary-100 flex items-center justify-center hover:bg-primary-50 transition-colors disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setCurrentSlide((s) => Math.min(slides.length - 1, s + 1))}
                      disabled={currentSlide === slides.length - 1}
                      className="w-8 h-8 rounded-lg border border-primary-100 flex items-center justify-center hover:bg-primary-50 transition-colors disabled:opacity-40"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-1 space-y-4">
              <div className="card-premium p-6 bg-primary-900 text-white space-y-4">
                <h3 className="font-display text-lg font-bold">Code to Cloud '26</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Yaharika Mart was built with one goal: proving that local neighborhood store collaboration is highly viable, scalable, and completely accessible.
                </p>
                <div className="text-xs font-bold text-accent-gold">
                  🚀 Status: Checked and Hackathon Ready!
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Q1 Store Finder */}
        {activeTab === 'q1' && (
          <motion.div
            key="q1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Map representation */}
            <div className="card-premium p-6 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <MapPin size={18} className="text-primary-600" />
                  Hyperlocal Proximity Map
                </h2>
                <button onClick={requestLocation} className="btn-primary text-xs py-1.5 px-3">
                  {geoStatus === 'loading' ? 'Locating...' : 'Scan GPS'}
                </button>
              </div>

              {/* Styled Mock SVG Map */}
              <div className="h-64 bg-gradient-to-br from-primary-50 to-secondary-300 rounded-xl relative overflow-hidden border border-primary-100 flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#C7E4D5_1px,transparent_1px),linear-gradient(to_bottom,#C7E4D5_1px,transparent_1px)] bg-[size:32px_32px] opacity-25" />
                
                {/* Geolocation radius circle */}
                <div className="absolute w-48 h-48 rounded-full border-2 border-primary-500/20 bg-primary-500/5 animate-pulse" />

                {/* Customer pin */}
                <div className="absolute z-20 text-center space-y-1">
                  <span className="text-3xl animate-bounce inline-block">👤</span>
                  <span className="block text-[10px] font-bold text-primary-900 bg-white/90 border border-primary-200 px-2 py-0.5 rounded-full shadow-sm">
                    You (Koramangala)
                  </span>
                </div>

                {/* Nearby store pins */}
                {mockStores.map((store, i) => {
                  const offsets = [
                    { top: '20%', left: '30%' },
                    { top: '35%', left: '70%' },
                    { top: '75%', left: '20%' },
                    { top: '80%', left: '60%' },
                  ];
                  return (
                    <div key={store.id} className="absolute z-10 text-center space-y-1" style={offsets[i]}>
                      <span className="text-2xl">{store.emoji}</span>
                      <span className="block text-[8px] font-bold bg-white border border-primary-100 px-1 py-0.5 rounded-md shadow-xs text-foreground/80">
                        {store.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="bg-primary-50/50 p-4 rounded-xl text-xs text-primary-950/80 leading-relaxed border border-primary-100">
                <strong>Why selection matters:</strong> Distance and inventory stocks are analyzed dynamically. When a search matches multiple shops, orders are routed to the closest capable merchant automatically to minimize delivery delays.
              </div>
            </div>

            {/* Calculations logs */}
            <div className="card-premium p-6 bg-white space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-foreground mb-4">Haversine Calculation Logs</h3>
                <div className="bg-primary-950 text-secondary-100 font-mono text-[10px] p-4 rounded-xl space-y-2 overflow-y-auto max-h-[220px]">
                  {haversineLogs.map((log, i) => (
                    <div key={i} className="border-b border-white/5 pb-1">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-foreground/45 mt-4">
                *The Haversine formula is evaluated server-side in the backend database gateway query layer.
              </p>
            </div>
          </motion.div>
        )}

        {/* Q2 Order Tracking */}
        {activeTab === 'q2' && (
          <motion.div
            key="q2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Live Progress timeline */}
            <div className="card-premium p-6 bg-white space-y-6">
              <div className="flex justify-between items-center border-b border-primary-50 pb-4">
                <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <Truck size={18} className="text-primary-600" />
                  Status Progress Pipeline
                </h2>
                {orderStep === 0 && (
                  <button onClick={() => setOrderStep(1)} className="btn-primary text-xs py-1.5 px-3">
                    Start Simulation
                  </button>
                )}
                {orderStep === steps.length - 1 && (
                  <button onClick={() => { setOrderStep(0); setOrderEta(25); }} className="px-3 py-1.5 rounded-xl border border-primary-100 text-xs text-foreground/70 hover:bg-primary-50">
                    Reset
                  </button>
                )}
              </div>

              {/* Progress Stepper */}
              <div className="space-y-4">
                {steps.map((st, i) => (
                  <div key={st} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      i <= orderStep ? 'bg-success text-white' : 'bg-primary-50 text-primary-500'
                    }`}>
                      {i < orderStep ? '✓' : i + 1}
                    </div>
                    <span className={`text-sm font-medium ${i === orderStep ? 'text-primary-600 font-bold' : 'text-foreground/60'}`}>
                      {st}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated map view */}
            <div className="card-premium p-6 bg-white space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-semibold text-foreground">Rider Location Tracking</h3>
                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                  ETA: {orderEta} mins
                </span>
              </div>

              {/* Mock map path representation */}
              <div className="h-64 bg-gradient-to-br from-primary-50 to-secondary-300 rounded-xl relative overflow-hidden border border-primary-100 flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#C7E4D5_1px,transparent_1px),linear-gradient(to_bottom,#C7E4D5_1px,transparent_1px)] bg-[size:32px_32px] opacity-25" />
                
                {/* Shop node */}
                <div className="absolute top-12 right-20 text-center">
                  <span className="text-3xl">🏪</span>
                  <span className="block text-[8px] font-bold bg-white px-1 py-0.5 rounded">Store</span>
                </div>

                {/* Customer node */}
                <div className="absolute bottom-12 left-16 text-center">
                  <span className="text-3xl">🏠</span>
                  <span className="block text-[8px] font-bold bg-white px-1 py-0.5 rounded">Home</span>
                </div>

                {/* Animated Rider */}
                <motion.div
                  animate={{
                    x: riderPath[Math.min(orderStep, riderPath.length - 1)].x - 200,
                    y: riderPath[Math.min(orderStep, riderPath.length - 1)].y - 120,
                  }}
                  transition={{ duration: 1.5 }}
                  className="absolute z-20 text-3xl"
                >
                  🚴
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Q3 Stock Swap Simulation */}
        {activeTab === 'q3' && (
          <motion.div
            key="q3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Simulation console */}
            <div className="card-premium p-6 bg-white space-y-6">
              <div className="flex justify-between items-center border-b border-primary-50 pb-4">
                <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <ArrowRightLeft size={18} className="text-primary-600" />
                  Stock Swap Simulator
                </h2>
                {swapState === 'idle' && (
                  <button onClick={startSwapSimulation} className="btn-primary text-xs py-1.5 px-3">
                    Trigger Out-Of-Stock
                  </button>
                )}
                {swapState === 'matched' && (
                  <button onClick={acceptSwap} className="btn-gold text-xs py-1.5 px-3">
                    Accept Swap Proposal
                  </button>
                )}
                {swapState === 'completed' && (
                  <button onClick={() => { setSwapState('idle'); setSwapLogs([]); }} className="px-3 py-1.5 rounded-xl border border-primary-100 text-xs text-foreground/70 hover:bg-primary-50">
                    Reset Simulator
                  </button>
                )}
              </div>

              {/* Graphic animation representation */}
              <div className="h-44 border border-dashed border-primary-100 rounded-xl relative flex items-center justify-around overflow-hidden bg-primary-50/20">
                <div className="text-center space-y-2">
                  <div className="text-4xl">🏪</div>
                  <div className="text-xs font-bold text-foreground">Patel Kirana</div>
                  <div className="text-[10px] text-danger font-semibold">
                    {swapState === 'idle' ? 'Stock: 0 units' : swapState === 'completed' ? 'Stock: +10 (Swapped)' : 'Out of Stock!'}
                  </div>
                </div>

                {/* Transfer animation arrow */}
                <div className="flex flex-col items-center">
                  {swapState === 'transferring' ? (
                    <motion.span
                      animate={{ x: [-50, 50], opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-2xl"
                    >
                      📦
                    </motion.span>
                  ) : swapState === 'completed' ? (
                    <span className="text-success text-2xl">✔ Match Done</span>
                  ) : (
                    <span className="text-foreground/20 text-3xl">➔</span>
                  )}
                </div>

                <div className="text-center space-y-2">
                  <div className="text-4xl">🥛</div>
                  <div className="text-xs font-bold text-foreground">Sunita's Dairy</div>
                  <div className="text-[10px] text-success font-semibold">
                    {swapState === 'completed' ? 'Stock: -10' : 'Surplus: 80 units'}
                  </div>
                </div>
              </div>
            </div>

            {/* Calculations logs console */}
            <div className="card-premium p-6 bg-white space-y-4">
              <h3 className="font-display font-semibold text-foreground">Engine Matching Terminal Output</h3>
              <div className="bg-primary-950 text-secondary-100 font-mono text-[10px] p-4 rounded-xl space-y-2 overflow-y-auto max-h-[220px]">
                {swapLogs.length === 0 ? (
                  <div className="text-white/40 italic">Terminal idle. Click "Trigger Out-Of-Stock" above to begin...</div>
                ) : (
                  swapLogs.map((log, i) => (
                    <div key={i} className="border-b border-white/5 pb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Q4 Emergency Stock Loans */}
        {activeTab === 'q4' && (
          <motion.div
            key="q4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Active approvals list */}
            <div className="card-premium p-6 bg-white space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Handshake size={18} className="text-primary-600" />
                P2P Loan Request Panel
              </h2>

              <div className="space-y-3">
                {loans.map((ln) => (
                  <div key={ln.id} className="p-4 bg-primary-50/50 border border-primary-100 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{ln.borrower} requests {ln.qty}x {ln.item}</p>
                      <p className="text-xs text-foreground/45">Lender target: {ln.lender}</p>
                    </div>
                    {ln.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setLoans((ls) => ls.map((l) => l.id === ln.id ? { ...l, status: 'approved' } : l));
                            toast.success('Loan request approved successfully! 🎉');
                          }}
                          className="bg-success text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-success/90"
                        >
                          Approve
                        </button>
                      </div>
                    ) : (
                      <span className="text-success text-xs font-bold bg-success/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> Approved
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Collaboration ledger */}
            <div className="card-premium p-6 bg-white space-y-4">
              <h3 className="font-display font-semibold text-foreground">Neighborhood Trust Scorecard</h3>
              <div className="space-y-4 text-sm text-foreground/70">
                <p>
                  Trust scores determine search visibility placement across the customer marketplace portal:
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-foreground/5 rounded-xl text-center">
                    <span className="text-xs font-bold text-foreground/50 uppercase">Loans Repaid On Time</span>
                    <p className="font-display text-2xl font-bold text-primary-600 mt-1">98%</p>
                  </div>
                  <div className="p-4 bg-foreground/5 rounded-xl text-center">
                    <span className="text-xs font-bold text-foreground/50 uppercase">Collaboration Score</span>
                    <p className="font-display text-2xl font-bold text-accent-gold mt-1">92/100</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Q5 Flash Demand Routing */}
        {activeTab === 'q5' && (
          <motion.div
            key="q5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Heatmap spike grid */}
            <div className="card-premium p-6 bg-white space-y-4">
              <div className="flex justify-between items-center border-b border-primary-50 pb-4">
                <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <Zap size={18} className="text-primary-600" />
                  Flash Demand Simulation
                </h2>
                <button onClick={toggleFlashDemand} className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
                  isFlashActive ? 'bg-danger text-white border-danger hover:bg-danger/90' : 'border-primary-100 hover:bg-primary-50 text-foreground/70'
                }`}>
                  {isFlashActive ? 'Stop Spike' : 'Simulate Spike'}
                </button>
              </div>

              {/* Heat map block overlay */}
              <div className="grid grid-cols-3 gap-2 p-2 bg-foreground/5 rounded-xl">
                {demandHeatMap.map((val, i) => (
                  <div
                    key={i}
                    className={`h-16 rounded-lg flex flex-col items-center justify-center transition-all duration-500 ${
                      val > 50
                        ? 'bg-danger text-white shadow-glow font-bold animate-pulse'
                        : val > 20
                        ? 'bg-warning/20 text-warning border border-warning/30 font-semibold'
                        : 'bg-white border border-primary-50 text-foreground/40'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-foreground/30">Grid {i + 1}</span>
                    <span className="text-sm mt-0.5">{val} index</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart routing logs ledger */}
            <div className="card-premium p-6 bg-white space-y-4">
              <h3 className="font-display font-semibold text-foreground">Flash demand smart routing log</h3>
              <div className="bg-primary-950 text-secondary-100 font-mono text-[10px] p-4 rounded-xl space-y-2 overflow-y-auto max-h-[220px]">
                {isFlashActive ? (
                  <>
                    <div className="text-danger font-semibold">[Alert] Spike detected in Grid 5! (Koramangala 3rd Block)</div>
                    <div className="text-white/60">[Router] Trigger threshold exceeded! Activates flash routing redirect logic...</div>
                    <div className="text-success">[Redirect] Routed order #5524 to Singh General Store (Deepest inventory available)</div>
                  </>
                ) : (
                  <div className="text-white/40 italic">System quiet. Click "Simulate Spike" to trigger demand event...</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
