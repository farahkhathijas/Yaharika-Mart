"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopProductsRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
// GET /api/products/search — Public: full-text search with demand tracking
router.get('/search', productController_1.searchProducts);
// GET /api/products/:id — Public: product detail
router.get('/:id', productController_1.getProductById);
// POST /api/products — Requires: authenticate, vendor role
router.post('/', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), productController_1.createProduct);
// PATCH /api/products/:id — Requires: authenticate, vendor role
router.patch('/:id', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), productController_1.updateProduct);
// PATCH /api/products/:id/stock — Requires: authenticate, vendor role (optimistic lock)
router.patch('/:id/stock', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), productController_1.updateStock);
// PATCH /api/products/:id/walkin-reserve — Requires: authenticate, vendor role
router.patch('/:id/walkin-reserve', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), productController_1.updateWalkInReserve);
// DELETE /api/products/:id — Requires: authenticate, vendor role
router.delete('/:id', auth_1.authenticate, (0, auth_1.roleGuard)('vendor'), productController_1.deleteProduct);
// Nested: GET /api/shops/:shopId/products — Public
exports.shopProductsRouter = (0, express_1.Router)({ mergeParams: true });
exports.shopProductsRouter.get('/', productController_1.getProductsByShop);
exports.default = router;
//# sourceMappingURL=productRoutes.js.map