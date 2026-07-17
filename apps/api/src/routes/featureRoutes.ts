import { Router } from 'express';
import { authenticate, roleGuard } from '../middleware/auth';
import {
  getGroupBuys,
  getGroupBuyById,
  joinGroupBuy,
  createGroupBuy,
  getDealsRadar,
  createDeal,
  getZeroWasteListings,
  createZeroWasteListing,
} from '../controllers/commerceController';
import {
  getPlatformStats,
  getAnalyticsTrend,
  getAllVendors,
  getVendorInsights,
  getNotifications,
  markNotificationRead,
} from '../controllers/analyticsController';

const router = Router();

// ─── Group Buy ────────────────────────────────────────────────────────────────
router.get('/group-buys', getGroupBuys);
router.get('/group-buys/:id', getGroupBuyById);
router.post('/group-buys', authenticate, roleGuard('vendor'), createGroupBuy);
router.post('/group-buys/:id/join', authenticate, roleGuard('customer'), joinGroupBuy);

// ─── Deals Radar ─────────────────────────────────────────────────────────────
router.get('/deals-radar', getDealsRadar);
router.post('/deals-radar', authenticate, roleGuard('vendor'), createDeal);

// ─── Zero Waste ───────────────────────────────────────────────────────────────
router.get('/zero-waste', getZeroWasteListings);
router.post('/zero-waste', authenticate, roleGuard('vendor'), createZeroWasteListing);

// ─── Admin ────────────────────────────────────────────────────────────────────
router.get('/admin/stats', authenticate, roleGuard('admin'), getPlatformStats);
router.get('/admin/analytics', authenticate, roleGuard('admin'), getAnalyticsTrend);
router.get('/admin/vendors', authenticate, roleGuard('admin'), getAllVendors);

// ─── Vendor Intelligence ──────────────────────────────────────────────────────
router.get('/vendor/insights', authenticate, roleGuard('vendor'), getVendorInsights);

// ─── Notifications ────────────────────────────────────────────────────────────
router.get('/notifications', authenticate, getNotifications);
router.patch('/notifications/:id/read', authenticate, markNotificationRead);

export default router;
