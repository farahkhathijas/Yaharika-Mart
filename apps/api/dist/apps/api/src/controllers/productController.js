"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateWalkInReserve = exports.updateStock = exports.updateProduct = exports.createProduct = exports.searchProducts = exports.getProductById = exports.getProductsByShop = void 0;
const Product_1 = require("../models/Product");
const Shop_1 = require("../models/Shop");
const errorHandler_1 = require("../middleware/errorHandler");
const FlashDemandEvent_1 = require("../models/FlashDemandEvent");
const sockets_1 = require("../sockets");
// GET /api/shops/:shopId/products
const getProductsByShop = async (req, res, next) => {
    try {
        const { category, search, sort = 'createdAt' } = req.query;
        const filter = { shopId: req.params.shopId, status: 'active' };
        if (category)
            filter.category = category;
        if (search)
            filter.$text = { $search: search };
        const sortMap = {
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            name: { name: 1 },
            createdAt: { createdAt: -1 },
        };
        const sortOpt = sortMap[sort] ?? { createdAt: -1 };
        const products = await Product_1.Product.find(filter).sort(sortOpt).lean();
        res.json({ success: true, data: { products } });
    }
    catch (err) {
        next(err);
    }
};
exports.getProductsByShop = getProductsByShop;
// GET /api/products/:id
const getProductById = async (req, res, next) => {
    try {
        const product = await Product_1.Product.findById(req.params.id).populate('shopId').lean();
        if (!product)
            throw errorHandler_1.ApiError.notFound('Product not found.');
        res.json({ success: true, data: { product } });
    }
    catch (err) {
        next(err);
    }
};
exports.getProductById = getProductById;
// GET /api/products/search
const searchProducts = async (req, res, next) => {
    try {
        const { q, area, category, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const filter = { status: 'active' };
        if (q)
            filter.$text = { $search: q };
        if (category)
            filter.category = category;
        // Join with shops if area filter needed
        let products;
        if (area) {
            const shops = await Shop_1.Shop.find({ area: { $regex: new RegExp(area, 'i') } }).select('_id').lean();
            const shopIds = shops.map((s) => s._id);
            filter.shopId = { $in: shopIds };
        }
        products = await Product_1.Product.find(filter)
            .populate('shopId', 'name area lat lng rating isOpen')
            .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean();
        const total = await Product_1.Product.countDocuments(filter);
        // Track demand for flash demand system
        if (category && area && req.user) {
            const shop = await Shop_1.Shop.findOne({ ownerId: req.user.id }).lean();
            const shopIdStr = shop?._id?.toString() ?? 'anonymous';
            const { count, triggered } = (0, FlashDemandEvent_1.trackDemand)(category, area, shopIdStr);
            if (triggered) {
                // Emit flash demand event to vendors in that area
                (0, sockets_1.getIO)().to(`area:${area}`).emit('flashdemand:triggered', {
                    productCategory: category,
                    area,
                    demandScore: count,
                });
            }
        }
        res.json({ success: true, data: { items: products, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (err) {
        next(err);
    }
};
exports.searchProducts = searchProducts;
// POST /api/products — Vendor only
const createProduct = async (req, res, next) => {
    try {
        const shop = await Shop_1.Shop.findOne({ ownerId: req.user.id });
        if (!shop)
            throw errorHandler_1.ApiError.notFound('You do not have a shop yet.');
        const { name, description, category, price, mrp, unit, images, stock, walkInReserve, lowStockThreshold, isZeroWasteItem, zeroWasteDiscountPercent, expiryDate, } = req.body;
        const product = await Product_1.Product.create({
            shopId: shop._id,
            name, description, category, price, mrp, unit,
            images: images ?? [],
            stock: parseInt(stock, 10),
            walkInReserve: parseInt(walkInReserve || '0', 10),
            lowStockThreshold: parseInt(lowStockThreshold || '5', 10),
            isZeroWasteItem: isZeroWasteItem ?? false,
            zeroWasteDiscountPercent: parseFloat(zeroWasteDiscountPercent || '0'),
            expiryDate: expiryDate || undefined,
        });
        res.status(201).json({ success: true, data: { product } });
    }
    catch (err) {
        next(err);
    }
};
exports.createProduct = createProduct;
// PATCH /api/products/:id — Vendor only (must own the shop)
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product_1.Product.findById(req.params.id).populate('shopId');
        if (!product)
            throw errorHandler_1.ApiError.notFound('Product not found.');
        const shop = product.shopId;
        if (shop.ownerId.toString() !== req.user.id) {
            throw errorHandler_1.ApiError.forbidden('You do not own this product.');
        }
        const allowed = [
            'name', 'description', 'category', 'price', 'mrp', 'unit',
            'images', 'lowStockThreshold', 'isZeroWasteItem',
            'zeroWasteDiscountPercent', 'expiryDate', 'status',
        ];
        allowed.forEach((field) => {
            if (req.body[field] !== undefined)
                product[field] = req.body[field];
        });
        await product.save();
        res.json({ success: true, data: { product } });
    }
    catch (err) {
        next(err);
    }
};
exports.updateProduct = updateProduct;
// PATCH /api/products/:id/stock — Vendor adjusts stock (optimistic lock)
const updateStock = async (req, res, next) => {
    try {
        const { stockDelta, version } = req.body;
        const delta = parseInt(stockDelta, 10);
        if (isNaN(delta))
            throw errorHandler_1.ApiError.badRequest('stockDelta must be a number.');
        // Verify ownership
        const existing = await Product_1.Product.findById(req.params.id).populate('shopId').lean();
        if (!existing)
            throw errorHandler_1.ApiError.notFound('Product not found.');
        const shopDoc = existing.shopId;
        if (shopDoc.ownerId.toString() !== req.user.id) {
            throw errorHandler_1.ApiError.forbidden('You do not own this product.');
        }
        const updated = await Product_1.Product.findOneAndUpdate({ _id: req.params.id, version: version ?? existing.version }, { $inc: { stock: delta, version: 1 } }, { new: true });
        if (!updated) {
            throw errorHandler_1.ApiError.conflict('Stock was modified concurrently. Please refresh and try again.', 'VERSION_CONFLICT');
        }
        // Emit real-time stock update
        (0, sockets_1.getIO)().to(`product:${updated._id}`).emit('stock:updated', {
            productId: updated._id.toString(),
            newStock: updated.stock,
            reservedStock: updated.reservedStock,
        });
        res.json({ success: true, data: { product: updated } });
    }
    catch (err) {
        next(err);
    }
};
exports.updateStock = updateStock;
// PATCH /api/products/:id/walkin-reserve — Adjust walk-in reserve (slider)
const updateWalkInReserve = async (req, res, next) => {
    try {
        const { walkInReserve } = req.body;
        const reserve = parseInt(walkInReserve, 10);
        const existing = await Product_1.Product.findById(req.params.id).populate('shopId').lean();
        if (!existing)
            throw errorHandler_1.ApiError.notFound('Product not found.');
        const shopDoc = existing.shopId;
        if (shopDoc.ownerId.toString() !== req.user.id) {
            throw errorHandler_1.ApiError.forbidden('You do not own this product.');
        }
        if (reserve > existing.stock) {
            throw errorHandler_1.ApiError.badRequest('Walk-in reserve cannot exceed total stock.', 'RESERVE_EXCEEDS_STOCK');
        }
        const updated = await Product_1.Product.findByIdAndUpdate(req.params.id, { $set: { walkInReserve: reserve } }, { new: true });
        res.json({ success: true, data: { product: updated } });
    }
    catch (err) {
        next(err);
    }
};
exports.updateWalkInReserve = updateWalkInReserve;
// DELETE /api/products/:id — Vendor only
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product_1.Product.findById(req.params.id).populate('shopId').lean();
        if (!product)
            throw errorHandler_1.ApiError.notFound('Product not found.');
        const shopDoc = product.shopId;
        if (shopDoc.ownerId.toString() !== req.user.id) {
            throw errorHandler_1.ApiError.forbidden('You do not own this product.');
        }
        await Product_1.Product.findByIdAndUpdate(req.params.id, { status: 'inactive' });
        res.json({ success: true, data: { message: 'Product deactivated.' } });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=productController.js.map