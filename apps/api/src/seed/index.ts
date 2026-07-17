import 'dotenv/config';
import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

import { User } from '../models/User';
import { Shop } from '../models/Shop';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { StockSwapRequest } from '../models/StockSwapRequest';
import { StockLoan } from '../models/StockLoan';
import { GroupBuyDeal } from '../models/GroupBuyDeal';
import { DealsRadarEntry } from '../models/DealsRadarEntry';
import { ZeroWasteListing } from '../models/ZeroWasteListing';
import { Notification } from '../models/Notification';

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/yaharika-mart';

// ─── Placeholder image URLs (public domain / Unsplash) ────────────────────────
const IMAGES = {
  grocery: [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400',
  ],
  pharmacy: [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
  ],
  bakery: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=400',
  ],
  dairy: [
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400',
  ],
  vegetables: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
  ],
  meat: [
    'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
    'https://images.unsplash.com/photo-1544025162-d76538b2a681?w=400',
  ],
  stationery: [
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400',
    'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400',
  ],
  general: [
    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=400',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
  ],
};

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function seedDatabase() {
  console.log('🗑️  Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Shop.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    StockSwapRequest.deleteMany({}),
    StockLoan.deleteMany({}),
    GroupBuyDeal.deleteMany({}),
    DealsRadarEntry.deleteMany({}),
    ZeroWasteListing.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('👤 Creating admin...');
  const admin = await User.create({
    name: 'Arjun Sharma',
    email: 'admin@yaharika.in',
    passwordHash: 'Admin@12345',
    role: 'admin',
    phone: '9876500000',
    address: { line1: '1 Admin Lane', area: 'Koramangala', city: 'Bengaluru', pincode: '560034', lat: 12.9352, lng: 77.6245 },
  });

  console.log('🏪 Creating vendors & shops...');
  const vendorData = [
    { name: 'Ravi Patel', email: 'ravi@yaharika.in', shopName: 'Patel Kirana', category: 'grocery', area: 'Koramangala', lat: 12.9347, lng: 77.6249 },
    { name: 'Sunita Verma', email: 'sunita@yaharika.in', shopName: "Sunita's Fresh Dairy", category: 'dairy', area: 'Koramangala', lat: 12.9355, lng: 77.6238 },
    { name: 'Mohan Kumar', email: 'mohan@yaharika.in', shopName: 'Mohan Medicals', category: 'pharmacy', area: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
    { name: 'Priya Nair', email: 'priya@yaharika.in', shopName: "Priya's Bake House", category: 'bakery', area: 'Indiranagar', lat: 12.9776, lng: 77.6412 },
    { name: 'Deepak Singh', email: 'deepak@yaharika.in', shopName: 'Singh General Store', category: 'general', area: 'Jayanagar', lat: 12.9250, lng: 77.5833 },
    { name: 'Lakshmi Iyer', email: 'lakshmi@yaharika.in', shopName: 'Lakshmi Vegetables', category: 'vegetables', area: 'Jayanagar', lat: 12.9258, lng: 77.5840 },
    { name: 'Ahmed Khan', email: 'ahmed@yaharika.in', shopName: "Ahmed's Meat Shop", category: 'meat', area: 'Koramangala', lat: 12.9360, lng: 77.6260 },
    { name: 'Kavya Reddy', email: 'kavya@yaharika.in', shopName: 'Reddy Stationery World', category: 'stationery', area: 'Indiranagar', lat: 12.9779, lng: 77.6420 },
  ];

  const vendors: mongoose.Document[] = [];
  const shops: mongoose.Document[] = [];

  for (const vd of vendorData) {
    const vendor = await User.create({
      name: vd.name,
      email: vd.email,
      passwordHash: 'Vendor@12345',
      role: 'vendor',
      phone: `98765${randomBetween(10000, 99999)}`,
      address: { line1: `${randomBetween(1, 99)} Market St`, area: vd.area, city: 'Bengaluru', pincode: '560034', lat: vd.lat, lng: vd.lng },
    });
    vendors.push(vendor);

    const shop = await Shop.create({
      ownerId: vendor._id,
      name: vd.shopName,
      description: `Your trusted neighborhood ${vd.category} store in ${vd.area}.`,
      category: vd.category,
      logoUrl: IMAGES[vd.category as keyof typeof IMAGES][0],
      bannerUrl: IMAGES[vd.category as keyof typeof IMAGES][1],
      area: vd.area,
      lat: vd.lat,
      lng: vd.lng,
      isOpen: true,
      rating: parseFloat((4.0 + Math.random()).toFixed(1)),
      walkInStockLockEnabled: Math.random() > 0.5,
    });
    shops.push(shop);
  }

  console.log('📦 Creating products...');
  const productDefs: Array<{ shopIdx: number; products: Array<Partial<import('../models/Product').IProductDocument>> }> = [
    {
      shopIdx: 0, // Patel Kirana
      products: [
        { name: 'Sona Masoori Rice', category: 'grocery', price: 75, mrp: 85, unit: '1 kg', stock: 120, lowStockThreshold: 20 },
        { name: 'Toor Dal', category: 'grocery', price: 110, mrp: 130, unit: '500 g', stock: 80, lowStockThreshold: 15 },
        { name: 'Aashirvaad Atta', category: 'grocery', price: 280, mrp: 310, unit: '5 kg', stock: 45, lowStockThreshold: 10 },
        { name: 'Sunflower Cooking Oil', category: 'grocery', price: 160, mrp: 180, unit: '1 L', stock: 60, lowStockThreshold: 10 },
        { name: 'Maggi Noodles', category: 'grocery', price: 14, mrp: 15, unit: '70 g pack', stock: 200, lowStockThreshold: 30 },
        { name: 'Amul Butter', category: 'grocery', price: 55, mrp: 60, unit: '100 g', stock: 35, walkInReserve: 10 },
        { name: 'Bru Coffee Powder', category: 'grocery', price: 95, mrp: 105, unit: '100 g', stock: 50, lowStockThreshold: 8 },
        { name: 'Tata Salt', category: 'grocery', price: 20, mrp: 22, unit: '1 kg', stock: 90, lowStockThreshold: 15 },
      ],
    },
    {
      shopIdx: 1, // Sunita's Fresh Dairy
      products: [
        { name: 'Full Cream Milk', category: 'dairy', price: 30, mrp: 32, unit: '500 ml', stock: 150, walkInReserve: 30, lowStockThreshold: 20 },
        { name: 'Amul Dahi', category: 'dairy', price: 45, mrp: 50, unit: '400 g', stock: 60, lowStockThreshold: 10 },
        { name: 'Paneer Fresh', category: 'dairy', price: 120, mrp: 140, unit: '200 g', stock: 25, lowStockThreshold: 5 },
        { name: 'Mango Lassi', category: 'dairy', price: 40, mrp: 45, unit: '300 ml', stock: 40, isZeroWasteItem: true, zeroWasteDiscountPercent: 20 },
        { name: 'Cheddar Cheese', category: 'dairy', price: 200, mrp: 220, unit: '200 g', stock: 20, lowStockThreshold: 5 },
        { name: 'Ghee Pure', category: 'dairy', price: 450, mrp: 500, unit: '500 g', stock: 30, lowStockThreshold: 5 },
        { name: 'Butter Milk', category: 'dairy', price: 20, mrp: 22, unit: '200 ml', stock: 80, walkInReserve: 20 },
      ],
    },
    {
      shopIdx: 2, // Mohan Medicals
      products: [
        { name: 'Paracetamol 500mg', category: 'pharmacy', price: 12, mrp: 15, unit: 'strip of 10', stock: 500, lowStockThreshold: 50 },
        { name: 'Vicks VapoRub', category: 'pharmacy', price: 55, mrp: 65, unit: '25 g', stock: 80, lowStockThreshold: 15 },
        { name: 'Dettol Antiseptic', category: 'pharmacy', price: 85, mrp: 95, unit: '200 ml', stock: 60, lowStockThreshold: 10 },
        { name: 'Band-Aid Classic', category: 'pharmacy', price: 40, mrp: 45, unit: 'pack of 10', stock: 120, lowStockThreshold: 20 },
        { name: 'Vitamin C Tablets', category: 'pharmacy', price: 180, mrp: 210, unit: '60 tablets', stock: 40, lowStockThreshold: 8 },
        { name: 'Cough Syrup Benadryl', category: 'pharmacy', price: 90, mrp: 100, unit: '100 ml', stock: 55, lowStockThreshold: 10 },
        { name: 'Glucon-D Orange', category: 'pharmacy', price: 50, mrp: 55, unit: '200 g', stock: 70, lowStockThreshold: 12 },
      ],
    },
    {
      shopIdx: 3, // Priya's Bake House
      products: [
        { name: 'Whole Wheat Bread', category: 'bakery', price: 45, mrp: 50, unit: 'loaf (400 g)', stock: 30, walkInReserve: 10, isZeroWasteItem: true, zeroWasteDiscountPercent: 30 },
        { name: 'Butter Croissant', category: 'bakery', price: 35, mrp: 40, unit: '1 piece', stock: 24, lowStockThreshold: 6 },
        { name: 'Chocolate Brownie', category: 'bakery', price: 60, mrp: 70, unit: '1 piece', stock: 18, lowStockThreshold: 4 },
        { name: 'Veg Puff', category: 'bakery', price: 25, mrp: 30, unit: '1 piece', stock: 40, walkInReserve: 15 },
        { name: 'Black Forest Cake', category: 'bakery', price: 350, mrp: 400, unit: '500 g', stock: 8, lowStockThreshold: 2 },
        { name: 'Coconut Ladoo', category: 'bakery', price: 80, mrp: 90, unit: 'box of 6', stock: 15, lowStockThreshold: 4 },
        { name: 'Multigrain Rusk', category: 'bakery', price: 70, mrp: 80, unit: '200 g', stock: 25, lowStockThreshold: 5 },
      ],
    },
    {
      shopIdx: 4, // Singh General Store
      products: [
        { name: 'Colgate Toothpaste', category: 'general', price: 78, mrp: 90, unit: '200 g', stock: 60, lowStockThreshold: 10 },
        { name: 'Dove Soap', category: 'general', price: 55, mrp: 65, unit: '75 g', stock: 80, lowStockThreshold: 15 },
        { name: 'Ariel Detergent', category: 'general', price: 130, mrp: 150, unit: '500 g', stock: 45, lowStockThreshold: 8 },
        { name: 'Prestige Pressure Cooker', category: 'general', price: 1200, mrp: 1500, unit: '3 litre', stock: 5, lowStockThreshold: 1 },
        { name: 'Lizol Disinfectant', category: 'general', price: 120, mrp: 140, unit: '500 ml', stock: 35, lowStockThreshold: 7 },
        { name: 'Lay\'s Classic Chips', category: 'general', price: 20, mrp: 22, unit: '26 g', stock: 150, lowStockThreshold: 25 },
        { name: 'Scotch Tape', category: 'general', price: 30, mrp: 35, unit: '1 roll', stock: 40, lowStockThreshold: 8 },
      ],
    },
    {
      shopIdx: 5, // Lakshmi Vegetables
      products: [
        { name: 'Tomatoes', category: 'vegetables', price: 30, mrp: 35, unit: '500 g', stock: 200, walkInReserve: 50, lowStockThreshold: 30 },
        { name: 'Onions', category: 'vegetables', price: 25, mrp: 30, unit: '1 kg', stock: 180, lowStockThreshold: 30 },
        { name: 'Potatoes', category: 'vegetables', price: 22, mrp: 28, unit: '1 kg', stock: 250, lowStockThreshold: 40 },
        { name: 'Spinach (Palak)', category: 'vegetables', price: 20, mrp: 25, unit: '250 g', stock: 60, isZeroWasteItem: true, zeroWasteDiscountPercent: 25 },
        { name: 'Green Capsicum', category: 'vegetables', price: 40, mrp: 50, unit: '250 g', stock: 70, lowStockThreshold: 10 },
        { name: 'Carrot', category: 'vegetables', price: 35, mrp: 40, unit: '500 g', stock: 90, lowStockThreshold: 15 },
        { name: 'Ginger Fresh', category: 'vegetables', price: 60, mrp: 70, unit: '100 g', stock: 50, lowStockThreshold: 8 },
        { name: 'Garlic', category: 'vegetables', price: 80, mrp: 90, unit: '100 g', stock: 45, lowStockThreshold: 8 },
      ],
    },
    {
      shopIdx: 6, // Ahmed's Meat Shop
      products: [
        { name: 'Chicken Breast', category: 'meat', price: 180, mrp: 200, unit: '500 g', stock: 40, walkInReserve: 15, lowStockThreshold: 8 },
        { name: 'Mutton Keema', category: 'meat', price: 350, mrp: 400, unit: '500 g', stock: 20, lowStockThreshold: 4 },
        { name: 'Fish Rohu', category: 'meat', price: 200, mrp: 230, unit: '500 g', stock: 25, lowStockThreshold: 5 },
        { name: 'Eggs (Farm Fresh)', category: 'meat', price: 90, mrp: 100, unit: 'tray of 12', stock: 60, walkInReserve: 20 },
        { name: 'Prawn Medium', category: 'meat', price: 350, mrp: 400, unit: '500 g', stock: 15, lowStockThreshold: 3 },
        { name: 'Chicken Liver', category: 'meat', price: 120, mrp: 140, unit: '250 g', stock: 18, isZeroWasteItem: true, zeroWasteDiscountPercent: 20 },
      ],
    },
    {
      shopIdx: 7, // Reddy Stationery
      products: [
        { name: 'Classmate Notebook', category: 'stationery', price: 45, mrp: 55, unit: '200 pages', stock: 80, lowStockThreshold: 15 },
        { name: 'Reynolds Ball Pen', category: 'stationery', price: 10, mrp: 12, unit: 'pack of 5', stock: 150, lowStockThreshold: 30 },
        { name: 'Cello Tape Large', category: 'stationery', price: 40, mrp: 50, unit: '2 inch', stock: 60, lowStockThreshold: 10 },
        { name: 'Geometry Box', category: 'stationery', price: 120, mrp: 140, unit: '1 set', stock: 25, lowStockThreshold: 5 },
        { name: 'A4 Paper Ream', category: 'stationery', price: 280, mrp: 320, unit: '500 sheets', stock: 30, lowStockThreshold: 5 },
        { name: 'Stapler with Pins', category: 'stationery', price: 85, mrp: 100, unit: '1 piece', stock: 20, lowStockThreshold: 4 },
        { name: 'Sketch Pens Set', category: 'stationery', price: 65, mrp: 80, unit: '12 colors', stock: 35, lowStockThreshold: 7 },
      ],
    },
  ];

  const allProducts: mongoose.Document[] = [];
  for (const pd of productDefs) {
    const shop = shops[pd.shopIdx] as unknown as { _id: mongoose.Types.ObjectId; category: string };
    for (const p of pd.products) {
      const images = IMAGES[shop.category as keyof typeof IMAGES] ?? IMAGES.general;
      const product = await Product.create({
        shopId: shop._id,
        name: p.name,
        description: `Premium quality ${p.name} from your trusted neighborhood store.`,
        category: p.category,
        price: p.price,
        mrp: p.mrp,
        unit: p.unit,
        images,
        stock: p.stock ?? 50,
        reservedStock: 0,
        walkInReserve: p.walkInReserve ?? 0,
        lowStockThreshold: p.lowStockThreshold ?? 5,
        isZeroWasteItem: p.isZeroWasteItem ?? false,
        zeroWasteDiscountPercent: p.zeroWasteDiscountPercent ?? 0,
        status: 'active',
      });
      allProducts.push(product);
    }
  }

  console.log('👥 Creating customers...');
  const customerData = [
    { name: 'Ananya Krishnan', email: 'ananya@example.com', area: 'Koramangala', lat: 12.9348, lng: 77.6246 },
    { name: 'Vikas Mehta', email: 'vikas@example.com', area: 'Koramangala', lat: 12.9352, lng: 77.6251 },
    { name: 'Pooja Sharma', email: 'pooja@example.com', area: 'Koramangala', lat: 12.9345, lng: 77.6240 },
    { name: 'Rahul Gupta', email: 'rahul@example.com', area: 'Indiranagar', lat: 12.9780, lng: 77.6405 },
    { name: 'Sneha Pillai', email: 'sneha@example.com', area: 'Indiranagar', lat: 12.9785, lng: 77.6415 },
    { name: 'Aditya Rao', email: 'aditya@example.com', area: 'Jayanagar', lat: 12.9252, lng: 77.5836 },
    { name: 'Divya Nair', email: 'divya@example.com', area: 'Jayanagar', lat: 12.9248, lng: 77.5830 },
    { name: 'Kiran Bhat', email: 'kiran@example.com', area: 'Koramangala', lat: 12.9358, lng: 77.6255 },
    { name: 'Meera Joshi', email: 'meera@example.com', area: 'Indiranagar', lat: 12.9782, lng: 77.6410 },
    { name: 'Nikhil Trivedi', email: 'nikhil@example.com', area: 'Jayanagar', lat: 12.9255, lng: 77.5838 },
    { name: 'Swati Chandra', email: 'swati@example.com', area: 'Koramangala', lat: 12.9343, lng: 77.6243 },
    { name: 'Rohan Saxena', email: 'rohan@example.com', area: 'Indiranagar', lat: 12.9788, lng: 77.6418 },
  ];

  const customers: mongoose.Document[] = [];
  for (const cd of customerData) {
    const customer = await User.create({
      name: cd.name,
      email: cd.email,
      passwordHash: 'Customer@12345',
      role: 'customer',
      phone: `98765${randomBetween(10000, 99999)}`,
      address: { line1: `${randomBetween(1, 100)} Residential Layout`, area: cd.area, city: 'Bengaluru', pincode: '560034', lat: cd.lat, lng: cd.lng },
    });
    customers.push(customer);
  }

  console.log('📋 Creating historical orders...');
  const orderStatuses: Array<import('@yaharika/shared-types').OrderStatus> = [
    'delivered', 'delivered', 'delivered', 'out_for_delivery', 'preparing', 'confirmed', 'placed', 'cancelled',
  ];

  for (let i = 0; i < 28; i++) {
    const customer = customers[i % customers.length] as unknown as { _id: mongoose.Types.ObjectId; address: Record<string, unknown> };
    const shopIdx = i % shops.length;
    const shop = shops[shopIdx] as unknown as { _id: mongoose.Types.ObjectId };
    const shopProducts = allProducts.filter((p) => {
      const prod = p as unknown as { shopId: { toString(): string }; price: number; name: string; _id: mongoose.Types.ObjectId };
      return prod.shopId.toString() === shop._id.toString();
    });

    if (shopProducts.length === 0) continue;

    const items = shopProducts.slice(0, randomBetween(1, 3)).map((p) => {
      const prod = p as unknown as { _id: mongoose.Types.ObjectId; name: string; price: number };
      const qty = randomBetween(1, 3);
      return { productId: prod._id, name: prod.name, qty, price: prod.price };
    });

    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const status = orderStatuses[i % orderStatuses.length];
    const placedAt = daysAgo(randomBetween(0, 30));

    await Order.create({
      customerId: customer._id,
      shopId: shop._id,
      items,
      subtotal,
      discount: 0,
      total: subtotal,
      status,
      paymentStatus: status === 'cancelled' ? 'refunded' : 'paid',
      deliveryAddress: customer.address,
      placedAt,
      statusHistory: [
        { status: 'placed', at: placedAt },
        ...(status !== 'placed' ? [{ status: 'confirmed', at: new Date(placedAt.getTime() + 5 * 60000) }] : []),
        ...(status === 'delivered' ? [{ status: 'delivered', at: new Date(placedAt.getTime() + 45 * 60000) }] : []),
      ],
    });
  }

  console.log('🔄 Creating stock swap requests...');
  const kraionaShop = shops[0] as unknown as { _id: mongoose.Types.ObjectId };
  const dairyShop = shops[1] as unknown as { _id: mongoose.Types.ObjectId };
  const generalShop = shops[4] as unknown as { _id: mongoose.Types.ObjectId };
  const bakeryShop = shops[3] as unknown as { _id: mongoose.Types.ObjectId };

  await StockSwapRequest.create([
    { requestingShopId: kraionaShop._id, productName: 'Tata Salt', category: 'grocery', qtyNeeded: 10, status: 'open' },
    { requestingShopId: generalShop._id, fulfillingShopId: kraionaShop._id, productName: 'Sona Masoori Rice', category: 'grocery', qtyNeeded: 20, status: 'matched' },
    { requestingShopId: bakeryShop._id, fulfillingShopId: dairyShop._id, productName: 'Butter', category: 'dairy', qtyNeeded: 5, status: 'in_transit' },
    { requestingShopId: dairyShop._id, fulfillingShopId: kraionaShop._id, productName: 'Amul Butter', category: 'grocery', qtyNeeded: 8, status: 'completed' },
  ]);

  console.log('💰 Creating stock loans...');
  const firstProduct = allProducts[0] as unknown as { _id: mongoose.Types.ObjectId };
  const secondProduct = allProducts[8] as unknown as { _id: mongoose.Types.ObjectId };

  await StockLoan.create([
    {
      borrowingShopId: bakeryShop._id,
      lendingShopId: dairyShop._id,
      productId: secondProduct._id,
      qtyBorrowed: 5,
      agreedReturnDate: daysFromNow(7),
      returnStatus: 'pending',
      interestType: 'free',
    },
    {
      borrowingShopId: generalShop._id,
      lendingShopId: kraionaShop._id,
      productId: firstProduct._id,
      qtyBorrowed: 20,
      agreedReturnDate: daysAgo(2),
      returnStatus: 'overdue',
      interestType: 'replacement',
    },
  ]);

  console.log('🛍️  Creating group buy deals...');
  const riceProduct = allProducts.find((p) => {
    const prod = p as unknown as { name: string };
    return prod.name.toLowerCase().includes('rice');
  }) as unknown as { _id: mongoose.Types.ObjectId; price: number };

  const paneerProduct = allProducts.find((p) => {
    const prod = p as unknown as { name: string };
    return prod.name.toLowerCase().includes('paneer');
  }) as unknown as { _id: mongoose.Types.ObjectId; price: number };

  const customer1 = customers[0] as unknown as { _id: mongoose.Types.ObjectId };
  const customer2 = customers[1] as unknown as { _id: mongoose.Types.ObjectId };
  const customer3 = customers[2] as unknown as { _id: mongoose.Types.ObjectId };

  if (riceProduct) {
    await GroupBuyDeal.create({
      productId: riceProduct._id,
      targetQty: 50,
      currentQty: 32,
      pricePerUnitAtTarget: Math.round(riceProduct.price * 0.8),
      participants: [
        { customerId: customer1._id, qty: 15 },
        { customerId: customer2._id, qty: 10 },
        { customerId: customer3._id, qty: 7 },
      ],
      expiresAt: daysFromNow(3),
      status: 'active',
    });
  }

  if (paneerProduct) {
    await GroupBuyDeal.create({
      productId: paneerProduct._id,
      targetQty: 30,
      currentQty: 8,
      pricePerUnitAtTarget: Math.round(paneerProduct.price * 0.75),
      participants: [{ customerId: customer1._id, qty: 5 }, { customerId: customer2._id, qty: 3 }],
      expiresAt: daysFromNow(5),
      status: 'active',
    });
  }

  console.log('🗑️  Creating zero waste listings...');
  const zeroWasteProducts = allProducts.filter((p) => {
    const prod = p as unknown as { isZeroWasteItem: boolean };
    return prod.isZeroWasteItem;
  });

  for (const zwp of zeroWasteProducts.slice(0, 5)) {
    const prod = zwp as unknown as { _id: mongoose.Types.ObjectId; shopId: mongoose.Types.ObjectId; price: number; zeroWasteDiscountPercent: number; stock: number };
    const discounted = Math.round(prod.price * (1 - prod.zeroWasteDiscountPercent / 100));
    await ZeroWasteListing.create({
      productId: prod._id,
      shopId: prod.shopId,
      originalPrice: prod.price,
      discountedPrice: discounted,
      expiryDate: daysFromNow(randomBetween(2, 7)),
      qtyAvailable: randomBetween(5, 20),
    });
  }

  console.log('🎯 Creating deals radar entries...');
  const dealProducts = allProducts.slice(0, 8) as unknown as Array<{ _id: mongoose.Types.ObjectId; shopId: mongoose.Types.ObjectId; price: number; mrp: number }>;
  const dealReasons: Array<'surplus' | 'near-expiry' | 'promo'> = ['surplus', 'near-expiry', 'promo', 'surplus', 'promo', 'near-expiry'];

  for (let i = 0; i < 6; i++) {
    const dp = dealProducts[i];
    const discountPct = randomBetween(10, 35);
    await DealsRadarEntry.create({
      productId: dp._id,
      shopId: dp.shopId,
      discountPercent: discountPct,
      reason: dealReasons[i],
      startsAt: daysAgo(1),
      endsAt: daysFromNow(randomBetween(1, 7)),
    });
  }

  console.log('🔔 Creating sample notifications...');
  await Notification.create([
    { userId: vendors[0]._id, type: 'swap_matched', title: 'Stock Swap Matched!', body: 'Singh General Store needs 20kg rice. You have been auto-matched!', isRead: false },
    { userId: vendors[1]._id, type: 'loan_overdue', title: '⚠️ Loan Overdue', body: 'Singh General Store has not returned the borrowed butter yet.', isRead: false },
    { userId: customers[0]._id, type: 'order_status', title: 'Order Delivered', body: 'Your order #KO123 has been delivered. Enjoy your groceries!', isRead: true },
    { userId: customers[1]._id, type: 'group_buy_success', title: '🎉 Group Buy Succeeded!', body: 'Your rice group buy succeeded! Order placed at ₹60/kg.', isRead: false },
  ]);

  console.log('\n✅ Seed complete! Summary:');
  console.log(`  👤 Admin: 1 (admin@yaharika.in / Admin@12345)`);
  console.log(`  🏪 Vendors: ${vendors.length} (password: Vendor@12345)`);
  console.log(`  👥 Customers: ${customers.length} (password: Customer@12345)`);
  console.log(`  📦 Products: ${allProducts.length}`);
  console.log(`  📋 Orders: 28`);
  console.log(`  🔄 Stock Swaps: 4`);
  console.log(`  💰 Stock Loans: 2`);
  console.log(`  🛍️  Group Buys: 2`);
  console.log(`  🗑️  Zero Waste: ${zeroWasteProducts.slice(0, 5).length}`);
  console.log(`  🎯 Deals Radar: 6`);
  console.log('\n🚀 Ready to run! Visit http://localhost:3000\n');
}

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');
  await seedDatabase();
  await mongoose.disconnect();
}
if (require.main === module || process.argv[1]?.endsWith('index.ts')) {
  seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
}
