"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shopController_1 = require("../controllers/shopController");
const router = (0, express_1.Router)();
// GET /api/shops — Public: list all open shops with filters
router.get('/', shopController_1.getAllShops);
// POST /api/shops — Requires: authenticate, vendor role
router.post('/', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), shopController_1.createShop);
// GET /api/shops/my — Requires: authenticate, vendor role
router.get('/my', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), shopController_1.getMyShop);
// GET /api/shops/:id — Public: shop detail with products
router.get('/:id', shopController_1.getShopById);
// PATCH /api/shops/:id — Requires: authenticate, vendor role (must own shop)
router.patch('/:id', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), shopController_1.updateShop);
// PATCH /api/shops/:id/toggle-open — Requires: authenticate, vendor role
router.patch('/:id/toggle-open', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), shopController_1.toggleOpen);
exports.default = router;
//# sourceMappingURL=shopRoutes.js.map