"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const collaborationController_1 = require("../controllers/collaborationController");
const router = (0, express_1.Router)();
// ─── Stock Swap Routes ────────────────────────────────────────────────────────
// POST /api/stock-swap — Requires: authenticate, vendor
router.post('/stock-swap', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), collaborationController_1.createSwapRequest);
// GET /api/stock-swap — Requires: authenticate, vendor
router.get('/stock-swap', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), collaborationController_1.getSwapRequests);
// PATCH /api/stock-swap/:id/accept — Requires: authenticate, vendor (fulfilling shop)
router.patch('/stock-swap/:id/accept', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), collaborationController_1.acceptSwap);
// PATCH /api/stock-swap/:id/complete — Requires: authenticate, vendor (requesting shop)
router.patch('/stock-swap/:id/complete', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), collaborationController_1.completeSwap);
// ─── Stock Loan Routes ────────────────────────────────────────────────────────
// POST /api/stock-loans — Requires: authenticate, vendor
router.post('/stock-loans', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), collaborationController_1.createLoan);
// GET /api/stock-loans — Requires: authenticate, vendor
router.get('/stock-loans', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), collaborationController_1.getLoans);
// PATCH /api/stock-loans/:id/return — Requires: authenticate, vendor (borrowing shop)
router.patch('/stock-loans/:id/return', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), collaborationController_1.returnLoan);
exports.default = router;
//# sourceMappingURL=collaborationRoutes.js.map