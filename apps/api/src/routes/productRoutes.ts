import { Router } from 'express';
import { authenticate, roleGuard } from '../middleware/auth';
import {
  getProductsByShop,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  updateStock,
  updateWalkInReserve,
  deleteProduct,
} from '../controllers/productController';

const router = Router();

// GET /api/products/search — Public: full-text search with demand tracking
router.get('/search', searchProducts);

// GET /api/products/:id — Public: product detail
router.get('/:id', getProductById);

// POST /api/products — Requires: authenticate, vendor role
router.post('/', authenticate, roleGuard('vendor'), createProduct);

// PATCH /api/products/:id — Requires: authenticate, vendor role
router.patch('/:id', authenticate, roleGuard('vendor'), updateProduct);

// PATCH /api/products/:id/stock — Requires: authenticate, vendor role (optimistic lock)
router.patch('/:id/stock', authenticate, roleGuard('vendor'), updateStock);

// PATCH /api/products/:id/walkin-reserve — Requires: authenticate, vendor role
router.patch('/:id/walkin-reserve', authenticate, roleGuard('vendor'), updateWalkInReserve);

// DELETE /api/products/:id — Requires: authenticate, vendor role
router.delete('/:id', authenticate, roleGuard('vendor'), deleteProduct);

// Nested: GET /api/shops/:shopId/products — Public
export const shopProductsRouter = Router({ mergeParams: true });
shopProductsRouter.get('/', getProductsByShop);

export default router;
