"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const commerceController_1 = require("../controllers/commerceController");
const analyticsController_1 = require("../controllers/analyticsController");
const router = (0, express_1.Router)();
// ─── Group Buy ────────────────────────────────────────────────────────────────
router.get('/group-buys', commerceController_1.getGroupBuys);
router.get('/group-buys/:id', commerceController_1.getGroupBuyById);
router.post('/group-buys', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), commerceController_1.createGroupBuy);
router.post('/group-buys/:id/join', auth_1.authenticate, (0, auth_1.roleGuard)('customer'), commerceController_1.joinGroupBuy);
// ─── Deals Radar ─────────────────────────────────────────────────────────────
router.get('/deals-radar', commerceController_1.getDealsRadar);
router.post('/deals-radar', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), commerceController_1.createDeal);
// ─── Zero Waste ───────────────────────────────────────────────────────────────
router.get('/zero-waste', commerceController_1.getZeroWasteListings);
router.post('/zero-waste', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), commerceController_1.createZeroWasteListing);
// ─── Admin ────────────────────────────────────────────────────────────────────
router.get('/admin/stats', auth_1.authenticate, (0, auth_1.roleGuard)('admin'), analyticsController_1.getPlatformStats);
router.get('/admin/analytics', auth_1.authenticate, (0, auth_1.roleGuard)('admin'), analyticsController_1.getAnalyticsTrend);
router.get('/admin/vendors', auth_1.authenticate, (0, auth_1.roleGuard)('admin'), analyticsController_1.getAllVendors);
// ─── Vendor Intelligence ──────────────────────────────────────────────────────
router.get('/vendor/insights', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), analyticsController_1.getVendorInsights);
// ─── Notifications ────────────────────────────────────────────────────────────
router.get('/notifications', auth_1.authenticate, analyticsController_1.getNotifications);
router.patch('/notifications/:id/read', auth_1.authenticate, analyticsController_1.markNotificationRead);
exports.default = router;
//# sourceMappingURL=featureRoutes.js.map