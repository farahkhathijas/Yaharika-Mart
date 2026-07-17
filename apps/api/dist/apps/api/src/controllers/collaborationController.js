"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnLoan = exports.getLoans = exports.createLoan = exports.completeSwap = exports.acceptSwap = exports.getSwapRequests = exports.createSwapRequest = void 0;
const StockSwapRequest_1 = require("../models/StockSwapRequest");
const StockLoan_1 = require("../models/StockLoan");
const Product_1 = require("../models/Product");
const Shop_1 = require("../models/Shop");
const Notification_1 = require("../models/Notification");
const errorHandler_1 = require("../middleware/errorHandler");
const sockets_1 = require("../sockets");
// Haversine helper
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
// ─── Stock Swap ────────────────────────────────────────────────────────────────
// POST /api/stock-swap — Vendor creates a swap request
const createSwapRequest = async (req, res, next) => {
    try {
        const shop = await Shop_1.Shop.findOne({ ownerId: req.user.id });
        if (!shop)
            throw errorHandler_1.ApiError.notFound('No shop found for this vendor.');
        const { productName, category, qtyNeeded } = req.body;
        // Auto-match: find nearby shops (same area or within 3km) with this product in stock
        const nearbyShops = await Shop_1.Shop.find({
            _id: { $ne: shop._id },
            area: shop.area,
        }).lean();
        // Also find shops within 3km (different area)
        const withinRadius = await Shop_1.Shop.find({ _id: { $ne: shop._id } }).lean();
        const closbyIds = withinRadius
            .filter((s) => haversine(shop.lat, shop.lng, s.lat, s.lng) <= 3)
            .map((s) => s._id);
        const allCandidateIds = [...new Set([...nearbyShops.map((s) => s._id), ...closbyIds])];
        // Find a matching product in candidate shops
        const matchingProduct = await Product_1.Product.findOne({
            shopId: { $in: allCandidateIds },
            name: { $regex: new RegExp(productName, 'i') },
            category,
            stock: { $gte: qtyNeeded },
            status: 'active',
        }).populate('shopId').sort({ stock: -1 }).lean();
        const swapRequest = await StockSwapRequest_1.StockSwapRequest.create({
            requestingShopId: shop._id,
            fulfillingShopId: matchingProduct ? matchingProduct.shopId._id : undefined,
            productName,
            category,
            qtyNeeded,
            status: matchingProduct ? 'matched' : 'open',
            matchedProductId: matchingProduct?._id,
        });
        // Notify matched shop
        if (matchingProduct) {
            const fulfillingShop = matchingProduct.shopId;
            (0, sockets_1.getIO)().to(`shop:${fulfillingShop._id.toString()}`).emit('swap:matched', {
                swapId: swapRequest._id.toString(),
                status: 'matched',
                requestingShopId: shop._id.toString(),
            });
            await Notification_1.Notification.create({
                userId: fulfillingShop.ownerId.toString(),
                type: 'swap_matched',
                title: 'Stock Swap Request',
                body: `${shop.name} needs ${qtyNeeded} units of "${productName}". You've been auto-matched!`,
            });
        }
        // Broadcast to requesting shop room
        (0, sockets_1.getIO)().to(`shop:${shop._id.toString()}`).emit('swap:created', {
            swapId: swapRequest._id.toString(),
            status: swapRequest.status,
        });
        res.status(201).json({ success: true, data: { swapRequest } });
    }
    catch (err) {
        next(err);
    }
};
exports.createSwapRequest = createSwapRequest;
// GET /api/stock-swap — Vendor: their shop's swap requests
const getSwapRequests = async (req, res, next) => {
    try {
        const shop = await Shop_1.Shop.findOne({ ownerId: req.user.id });
        if (!shop) {
            res.json({ success: true, data: { swaps: [] } });
            return;
        }
        const swaps = await StockSwapRequest_1.StockSwapRequest.find({
            $or: [
                { requestingShopId: shop._id },
                { fulfillingShopId: shop._id },
            ],
        })
            .populate('requestingShopId', 'name area')
            .populate('fulfillingShopId', 'name area')
            .populate('matchedProductId', 'name stock')
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, data: { swaps } });
    }
    catch (err) {
        next(err);
    }
};
exports.getSwapRequests = getSwapRequests;
// PATCH /api/stock-swap/:id/accept — Fulfilling vendor accepts swap
const acceptSwap = async (req, res, next) => {
    try {
        const swap = await StockSwapRequest_1.StockSwapRequest.findById(req.params.id);
        if (!swap)
            throw errorHandler_1.ApiError.notFound('Swap request not found.');
        const shop = await Shop_1.Shop.findOne({ ownerId: req.user.id });
        if (!shop)
            throw errorHandler_1.ApiError.notFound('Shop not found.');
        if (swap.fulfillingShopId?.toString() !== shop._id.toString()) {
            throw errorHandler_1.ApiError.forbidden('This swap is not assigned to your shop.');
        }
        if (swap.status !== 'matched') {
            throw errorHandler_1.ApiError.badRequest(`Cannot accept a swap in "${swap.status}" status.`);
        }
        // Atomically decrement fulfilling shop's stock
        if (swap.matchedProductId) {
            const product = await Product_1.Product.findOneAndUpdate({ _id: swap.matchedProductId, stock: { $gte: swap.qtyNeeded } }, { $inc: { stock: -swap.qtyNeeded, version: 1 } }, { new: true });
            if (!product) {
                throw errorHandler_1.ApiError.conflict('Insufficient stock to complete this swap.', 'STOCK_INSUFFICIENT');
            }
            // Emit stock update
            (0, sockets_1.getIO)().to(`product:${swap.matchedProductId}`).emit('stock:updated', {
                productId: swap.matchedProductId.toString(),
                newStock: product.stock,
                reservedStock: product.reservedStock,
            });
        }
        swap.status = 'in_transit';
        await swap.save();
        (0, sockets_1.getIO)().to(`shop:${swap.requestingShopId}`).emit('swap:matched', {
            swapId: swap._id.toString(),
            status: 'in_transit',
            fulfillingShopId: shop._id.toString(),
        });
        res.json({ success: true, data: { swapRequest: swap } });
    }
    catch (err) {
        next(err);
    }
};
exports.acceptSwap = acceptSwap;
// PATCH /api/stock-swap/:id/complete
const completeSwap = async (req, res, next) => {
    try {
        const swap = await StockSwapRequest_1.StockSwapRequest.findById(req.params.id);
        if (!swap)
            throw errorHandler_1.ApiError.notFound('Swap request not found.');
        const shop = await Shop_1.Shop.findOne({ ownerId: req.user.id });
        if (!shop || swap.requestingShopId.toString() !== shop._id.toString()) {
            throw errorHandler_1.ApiError.forbidden('Only the requesting shop can mark as complete.');
        }
        swap.status = 'completed';
        await swap.save();
        const payload = {
            swapId: swap._id.toString(),
            status: 'completed',
            requestingShopId: swap.requestingShopId.toString(),
            fulfillingShopId: swap.fulfillingShopId?.toString(),
        };
        (0, sockets_1.getIO)().to(`shop:${swap.requestingShopId}`).emit('swap:matched', payload);
        if (swap.fulfillingShopId) {
            (0, sockets_1.getIO)().to(`shop:${swap.fulfillingShopId}`).emit('swap:matched', payload);
        }
        res.json({ success: true, data: { swapRequest: swap } });
    }
    catch (err) {
        next(err);
    }
};
exports.completeSwap = completeSwap;
// ─── Stock Loans ───────────────────────────────────────────────────────────────
// POST /api/stock-loans
const createLoan = async (req, res, next) => {
    try {
        const borrowingShop = await Shop_1.Shop.findOne({ ownerId: req.user.id });
        if (!borrowingShop)
            throw errorHandler_1.ApiError.notFound('No shop found for this vendor.');
        const { lendingShopId, productId, qtyBorrowed, agreedReturnDate, interestType } = req.body;
        const lendingShop = await Shop_1.Shop.findById(lendingShopId);
        if (!lendingShop)
            throw errorHandler_1.ApiError.notFound('Lending shop not found.');
        const product = await Product_1.Product.findById(productId);
        if (!product)
            throw errorHandler_1.ApiError.notFound('Product not found.');
        if (product.stock < qtyBorrowed)
            throw errorHandler_1.ApiError.conflict('Insufficient stock to lend.', 'STOCK_INSUFFICIENT');
        // Deduct from lending shop's stock
        await Product_1.Product.findOneAndUpdate({ _id: productId, stock: { $gte: qtyBorrowed } }, { $inc: { stock: -qtyBorrowed, version: 1 } });
        const loan = await StockLoan_1.StockLoan.create({
            borrowingShopId: borrowingShop._id,
            lendingShopId,
            productId,
            qtyBorrowed,
            agreedReturnDate,
            interestType,
        });
        (0, sockets_1.getIO)().to(`shop:${lendingShopId}`).emit('loan:requested', {
            loanId: loan._id.toString(),
            borrowingShopName: borrowingShop.name,
            qtyBorrowed,
        });
        res.status(201).json({ success: true, data: { loan } });
    }
    catch (err) {
        next(err);
    }
};
exports.createLoan = createLoan;
// GET /api/stock-loans
const getLoans = async (req, res, next) => {
    try {
        const shop = await Shop_1.Shop.findOne({ ownerId: req.user.id });
        if (!shop) {
            res.json({ success: true, data: { loans: [] } });
            return;
        }
        const loans = await StockLoan_1.StockLoan.find({
            $or: [{ borrowingShopId: shop._id }, { lendingShopId: shop._id }],
        })
            .populate('borrowingShopId', 'name area')
            .populate('lendingShopId', 'name area')
            .populate('productId', 'name unit')
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, data: { loans } });
    }
    catch (err) {
        next(err);
    }
};
exports.getLoans = getLoans;
// PATCH /api/stock-loans/:id/return
const returnLoan = async (req, res, next) => {
    try {
        const loan = await StockLoan_1.StockLoan.findById(req.params.id);
        if (!loan)
            throw errorHandler_1.ApiError.notFound('Loan not found.');
        const shop = await Shop_1.Shop.findOne({ ownerId: req.user.id });
        if (!shop || loan.borrowingShopId.toString() !== shop._id.toString()) {
            throw errorHandler_1.ApiError.forbidden('Only the borrowing shop can mark as returned.');
        }
        // Return stock to lending shop
        await Product_1.Product.findByIdAndUpdate(loan.productId, { $inc: { stock: loan.qtyBorrowed } });
        loan.returnStatus = 'returned';
        await loan.save();
        res.json({ success: true, data: { loan } });
    }
    catch (err) {
        next(err);
    }
};
exports.returnLoan = returnLoan;
//# sourceMappingURL=collaborationController.js.map