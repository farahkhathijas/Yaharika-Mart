import { Router } from 'express';
import { authenticate, roleGuard } from '../middleware/auth';
import { getAllShops, getShopById, getMyShop, updateShop, toggleOpen } from '../controllers/shopController';

const router = Router();

// GET /api/shops — Public: list all open shops with filters
router.get('/', getAllShops);

// GET /api/shops/my — Requires: authenticate, vendor role
router.get('/my', authenticate, roleGuard('vendor'), getMyShop);

// GET /api/shops/:id — Public: shop detail with products
router.get('/:id', getShopById);

// PATCH /api/shops/:id — Requires: authenticate, vendor role (must own shop)
router.patch('/:id', authenticate, roleGuard('vendor'), updateShop);

// PATCH /api/shops/:id/toggle-open — Requires: authenticate, vendor role
router.patch('/:id/toggle-open', authenticate, roleGuard('vendor'), toggleOpen);

export default router;
