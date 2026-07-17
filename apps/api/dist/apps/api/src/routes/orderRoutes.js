"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const orderController_1 = require("../controllers/orderController");
const router = (0, express_1.Router)();
// POST /api/orders — Requires: authenticate, customer role
router.post('/', auth_1.authenticate, (0, auth_1.roleGuard)('customer'), orderController_1.createOrder);
// GET /api/orders — Requires: authenticate (role-filtered internally)
router.get('/', auth_1.authenticate, orderController_1.getOrders);
// GET /api/orders/:id — Requires: authenticate
router.get('/:id', auth_1.authenticate, orderController_1.getOrderById);
// PATCH /api/orders/:id/status — Requires: authenticate, vendor or admin role
router.patch('/:id/status', auth_1.authenticate, (0, auth_1.roleGuard)('vendor', 'admin'), orderController_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map