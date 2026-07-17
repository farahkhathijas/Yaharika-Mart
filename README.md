# 🏪 Yaharika Mart — Collaborative Neighborhood Commerce Platform

> **"One Neighborhood. Many Stores. Zero Lost Sales."**

Yaharika Mart is a hyperlocal collaborative neighborhood commerce platform designed for the **Code to Cloud '26 Challenge**. Instead of standard, isolated e-commerce layouts, Yaharika Mart connects local merchants (groceries, dairies, bakeries, pharmacies, stationery) in a cooperative mesh network. If one shop runs out of an item, nearby merchants automatically fill the order behind the scenes. This increases total sales, prevents out-of-stock cancellations, and supports local community growth.

---

## 🌟 Key Hackathon Features

### 1. Cross-Vendor Stock Swap
When a customer orders an item that is low in stock or out of stock at their primary selected shop, the platform's backend matching engine auto-matches the request with the nearest merchant in the neighborhood. Stock is swapped seamlessly so that the customer is fulfilled, while the primary vendor retains a portion of the margin rather than losing the sale.

### 2. Emergency Stock Loan Network
A peer-to-peer inventory sharing gateway for merchants. Vendors can borrow inventory from nearby cooperating shops with flexible options (free loans, margin-splitting, or direct item replacement). Overdue loan alerts are processed daily via cron-jobs.

### 3. Walk-In vs Online Stock Lock
Avoid online order cancellations by locking a portion of shelf stock exclusively for walk-in customers. Vendors adjust this ratio in real-time via simple dashboard sliders.

### 4. Flash Demand Smart Routing
During high-traffic demand spikes (tracked in-memory using a rolling 10-minute window), order checkout queries are dynamically rerouted to the deepest-stocked cooperating shop in the area, distributing pressure and ensuring high platform stability.

### 5. Group Buying
Neighborhood customers can join forces to unlock wholesale discounts on items. When the cumulative order quantity reaches the merchant's target before the expiry window, orders are processed automatically.

### 6. Deals Radar & Zero Waste Marketplace
An interactive range-based map scanner finding surplus promotions, near-expiry discounts, and zero-waste items. Reduces food waste while offering bargain rates to shoppers.

### 7. Core Accessibility Mode (First-Class Feature)
Designed for elderly and differently-abled users:
- **Voice Commands**: Full navigation ("go to shops"), search, and ordering ("add rice to cart") using Web Speech Recognition.
- **Audio Feedback**: Text-to-speech synthesis confirmations.
- **WCAG Contrast & Font Scaling**: Toggle high contrast mode or adjust size dynamically from 75% to 150%.

---

## 🏗️ Technical Stack

- **Monorepo**: Turborepo, NPM workspaces.
- **Backend**: Express, Socket.IO (real-time stock synchronizations & order tracking), Node-Cron (workers), Mongoose.
- **Database**: MongoDB (with automated `mongodb-memory-server` local fallback & seeder).
- **Frontend**: Next.js 14 App Router, Tailwind CSS, Zustand (persisted state management), Framer Motion (animations), TanStack Query, Radix UI.
- **Deployment**: Docker, GitHub Actions, Vercel, Render.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Verify Typings
```bash
npm run typecheck
```

### 3. Start Development Environment
```bash
# Runs API server (port 5000) & Next.js frontend (port 3000)
npm run dev
```

*Note: The backend API includes an automatic **in-memory database fallback**. If no MongoDB connection is found, it downloads and starts a local in-memory DB and runs the seeder automatically.*

---

## 👥 Demo Logins
- **Customer**: `ananya@example.com` / `Customer@12345`
- **Vendor**: `ravi@yaharika.in` / `Vendor@12345` (Owner of *Patel Kirana*)
- **Admin**: `admin@yaharika.in` / `Admin@12345`
