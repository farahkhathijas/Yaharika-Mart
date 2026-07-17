import { Router } from 'express';
import { authenticate, roleGuard } from '../middleware/auth';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController';

const router = Router();

// POST /api/orders — Requires: authenticate, customer role
router.post('/', authenticate, roleGuard('customer'), createOrder);

// GET /api/orders — Requires: authenticate (role-filtered internally)
router.get('/', authenticate, getOrders);

// GET /api/orders/:id — Requires: authenticate
router.get('/:id', authenticate, getOrderById);

// PATCH /api/orders/:id/status — Requires: authenticate, vendor or admin role
router.patch('/:id/status', authenticate, roleGuard('vendor', 'admin'), updateOrderStatus);

export default router;
