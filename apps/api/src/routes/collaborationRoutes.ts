import { Router } from 'express';
import { authenticate, roleGuard } from '../middleware/auth';
import {
  createSwapRequest,
  getSwapRequests,
  acceptSwap,
  completeSwap,
  createLoan,
  getLoans,
  returnLoan,
} from '../controllers/collaborationController';

const router = Router();

// ─── Stock Swap Routes ────────────────────────────────────────────────────────

// POST /api/stock-swap — Requires: authenticate, vendor
router.post('/stock-swap', authenticate, roleGuard('vendor'), createSwapRequest);

// GET /api/stock-swap — Requires: authenticate, vendor
router.get('/stock-swap', authenticate, roleGuard('vendor'), getSwapRequests);

// PATCH /api/stock-swap/:id/accept — Requires: authenticate, vendor (fulfilling shop)
router.patch('/stock-swap/:id/accept', authenticate, roleGuard('vendor'), acceptSwap);

// PATCH /api/stock-swap/:id/complete — Requires: authenticate, vendor (requesting shop)
router.patch('/stock-swap/:id/complete', authenticate, roleGuard('vendor'), completeSwap);

// ─── Stock Loan Routes ────────────────────────────────────────────────────────

// POST /api/stock-loans — Requires: authenticate, vendor
router.post('/stock-loans', authenticate, roleGuard('vendor'), createLoan);

// GET /api/stock-loans — Requires: authenticate, vendor
router.get('/stock-loans', authenticate, roleGuard('vendor'), getLoans);

// PATCH /api/stock-loans/:id/return — Requires: authenticate, vendor (borrowing shop)
router.patch('/stock-loans/:id/return', authenticate, roleGuard('vendor'), returnLoan);

export default router;
