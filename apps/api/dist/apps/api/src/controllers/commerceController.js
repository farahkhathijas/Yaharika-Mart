"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createZeroWasteListing = exports.getZeroWasteListings = exports.createDeal = exports.getDealsRadar = exports.createGroupBuy = exports.joinGroupBuy = exports.getGroupBuyById = exports.getGroupBuys = void 0;
const GroupBuyDeal_1 = require("../models/GroupBuyDeal");
const DealsRadarEntry_1 = require("../models/DealsRadarEntry");
const ZeroWasteListing_1 = require("../models/ZeroWasteListing");
const Product_1 = require("../models/Product");
const Shop_1 = require("../models/Shop");
const Order_1 = require("../models/Order");
const Notification_1 = require("../models/Notification");
const errorHandler_1 = require("../middleware/errorHandler");
const sockets_1 = require("../sockets");
// ─── Group Buy ────────────────────────────────────────────────────────────────
// GET /api/group-buys
const getGroupBuys = async (req, res, next) => {
    try {
        const deals = await GroupBuyDeal_1.GroupBuyDeal.find({ status: 'active', expiresAt: { $gt: new Date() } })
            .populate('productId', 'name images price unit shopId')
            .sort({ expiresAt: 1 })
            .lean();
        res.json({ success: true, data: { deals } });
    }
    catch (err) {
        next(err);
    }
};
exports.getGroupBuys = getGroupBuys;
// GET /api/group-buys/:id
const getGroupBuyById = async (req, res, next) => {
    try {
        const deal = await GroupBuyDeal_1.GroupBuyDeal.findById(req.params.id)
            .populate('productId', 'name images price mrp unit shopId description')
            .populate('participants.customerId', 'name')
            .lean();
        if (!deal)
            throw errorHandler_1.ApiError.notFound('Group buy not found.');
        res.json({ success: true, data: { deal } });
    }
    catch (err) {
        next(err);
    }
};
exports.getGroupBuyById = getGroupBuyById;
// POST /api/group-buys/:id/join — Customer joins group buy
const joinGroupBuy = async (req, res, next) => {
    try {
        const { qty } = req.body;
        const qtyNum = parseInt(qty, 10);
        if (!qtyNum || qtyNum < 1)
            throw errorHandler_1.ApiError.badRequest('Quantity must be at least 1.');
        const deal = await GroupBuyDeal_1.GroupBuyDeal.findById(req.params.id);
        if (!deal)
            throw errorHandler_1.ApiError.notFound('Group buy not found.');
        if (deal.status !== 'active')
            throw errorHandler_1.ApiError.badRequest('This group buy is no longer active.');
        if (new Date() > deal.expiresAt)
            throw errorHandler_1.ApiError.badRequest('This group buy has expired.');
        // Check if customer already participated
        const existing = deal.participants.find((p) => p.customerId.toString() === req.user.id);
        if (existing) {
            existing.qty += qtyNum;
        }
        else {
            deal.participants.push({ customerId: req.user.id, qty: qtyNum });
        }
        deal.currentQty += qtyNum;
        // Check if target reached
        if (deal.currentQty >= deal.targetQty) {
            deal.status = 'succeeded';
            // Create orders for all participants
            const product = await Product_1.Product.findById(deal.productId);
            if (product) {
                for (const participant of deal.participants) {
                    await Order_1.Order.create({
                        customerId: participant.customerId,
                        shopId: product.shopId.toString(),
                        items: [{
                                productId: product._id,
                                name: product.name,
                                qty: participant.qty,
                                price: deal.pricePerUnitAtTarget,
                            }],
                        subtotal: deal.pricePerUnitAtTarget * participant.qty,
                        discount: (product.price - deal.pricePerUnitAtTarget) * participant.qty,
                        total: deal.pricePerUnitAtTarget * participant.qty,
                        deliveryAddress: { line1: 'Group Buy Delivery', area: '', city: '', pincode: '', lat: 0, lng: 0 },
                        placedAt: new Date(),
                        statusHistory: [{ status: 'placed', at: new Date() }],
                    });
                    // Notify each participant
                    await Notification_1.Notification.create({
                        userId: participant.customerId,
                        type: 'group_buy_success',
                        title: '🎉 Group Buy Succeeded!',
                        body: `Your group buy for "${product.name}" succeeded! Order placed at ₹${deal.pricePerUnitAtTarget}/unit.`,
                    });
                    (0, sockets_1.getIO)().to(`user:${participant.customerId}`).emit('notification:new', {
                        type: 'group_buy_success',
                        title: '🎉 Group Buy Succeeded!',
                        body: `Your group buy for "${product.name}" succeeded!`,
                    });
                }
            }
        }
        await deal.save();
        // Emit progress update
        (0, sockets_1.getIO)().emit('groupbuy:progress', {
            dealId: deal._id.toString(),
            currentQty: deal.currentQty,
            targetQty: deal.targetQty,
            status: deal.status,
        });
        res.json({ success: true, data: { deal } });
    }
    catch (err) {
        next(err);
    }
};
exports.joinGroupBuy = joinGroupBuy;
// POST /api/group-buys — Vendor creates a group buy deal
const createGroupBuy = async (req, res, next) => {
    try {
        const { productId, targetQty, pricePerUnitAtTarget, expiresAt } = req.body;
        const product = await Product_1.Product.findById(productId).populate('shopId').lean();
        if (!product)
            throw errorHandler_1.ApiError.notFound('Product not found.');
        const shopDoc = product.shopId;
        if (shopDoc.ownerId.toString() !== req.user.id) {
            throw errorHandler_1.ApiError.forbidden('You do not own this product.');
        }
        const deal = await GroupBuyDeal_1.GroupBuyDeal.create({
            productId,
            targetQty,
            currentQty: 0,
            pricePerUnitAtTarget,
            participants: [],
            expiresAt: new Date(expiresAt),
        });
        res.status(201).json({ success: true, data: { deal } });
    }
    catch (err) {
        next(err);
    }
};
exports.createGroupBuy = createGroupBuy;
// ─── Deals Radar ─────────────────────────────────────────────────────────────
// GET /api/deals-radar
const getDealsRadar = async (req, res, next) => {
    try {
        const { area, sortBy = 'discount', page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const now = new Date();
        let shopFilter = {};
        if (area)
            shopFilter.area = { $regex: new RegExp(area, 'i') };
        const shops = area ? await Shop_1.Shop.find(shopFilter).select('_id').lean() : [];
        const shopIds = shops.map((s) => s._id);
        const filter = {
            startsAt: { $lte: now },
            endsAt: { $gt: now },
        };
        if (area && shopIds.length)
            filter.shopId = { $in: shopIds };
        const sortMap = {
            discount: '-discountPercent',
            expiry: 'endsAt',
        };
        const sortStr = sortMap[sortBy] ?? '-discountPercent';
        const deals = await DealsRadarEntry_1.DealsRadarEntry.find(filter)
            .populate('productId', 'name images price mrp unit stock')
            .populate('shopId', 'name area lat lng rating')
            .sort(sortStr)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean();
        const total = await DealsRadarEntry_1.DealsRadarEntry.countDocuments(filter);
        res.json({ success: true, data: { items: deals, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (err) {
        next(err);
    }
};
exports.getDealsRadar = getDealsRadar;
// POST /api/deals-radar — Vendor creates a deal
const createDeal = async (req, res, next) => {
    try {
        const shop = await Shop_1.Shop.findOne({ ownerId: req.user.id });
        if (!shop)
            throw errorHandler_1.ApiError.notFound('No shop found.');
        const { productId, discountPercent, reason, startsAt, endsAt } = req.body;
        const deal = await DealsRadarEntry_1.DealsRadarEntry.create({
            productId,
            shopId: shop._id,
            discountPercent,
            reason,
            startsAt: new Date(startsAt),
            endsAt: new Date(endsAt),
        });
        res.status(201).json({ success: true, data: { deal } });
    }
    catch (err) {
        next(err);
    }
};
exports.createDeal = createDeal;
// ─── Zero Waste ───────────────────────────────────────────────────────────────
// GET /api/zero-waste
const getZeroWasteListings = async (req, res, next) => {
    try {
        const { area, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        let shopFilter = {};
        if (area)
            shopFilter.area = { $regex: new RegExp(area, 'i') };
        const shops = area ? await Shop_1.Shop.find(shopFilter).select('_id').lean() : [];
        const shopIds = shops.map((s) => s._id);
        const filter = {
            expiryDate: { $gt: new Date() },
            qtyAvailable: { $gt: 0 },
        };
        if (area && shopIds.length)
            filter.shopId = { $in: shopIds };
        const listings = await ZeroWasteListing_1.ZeroWasteListing.find(filter)
            .populate('productId', 'name images unit category')
            .populate('shopId', 'name area lat lng')
            .sort({ expiryDate: 1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean();
        const total = await ZeroWasteListing_1.ZeroWasteListing.countDocuments(filter);
        res.json({ success: true, data: { items: listings, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (err) {
        next(err);
    }
};
exports.getZeroWasteListings = getZeroWasteListings;
// POST /api/zero-waste — Vendor creates a listing
const createZeroWasteListing = async (req, res, next) => {
    try {
        const shop = await Shop_1.Shop.findOne({ ownerId: req.user.id });
        if (!shop)
            throw errorHandler_1.ApiError.notFound('No shop found.');
        const { productId, originalPrice, discountedPrice, expiryDate, qtyAvailable } = req.body;
        // Also update product to mark as zero waste
        await Product_1.Product.findByIdAndUpdate(productId, {
            isZeroWasteItem: true,
            zeroWasteDiscountPercent: Math.round(((originalPrice - discountedPrice) / originalPrice) * 100),
        });
        const listing = await ZeroWasteListing_1.ZeroWasteListing.create({
            productId,
            shopId: shop._id,
            originalPrice,
            discountedPrice,
            expiryDate: new Date(expiryDate),
            qtyAvailable,
        });
        // Also create a DealsRadarEntry for it
        await DealsRadarEntry_1.DealsRadarEntry.create({
            productId,
            shopId: shop._id,
            discountPercent: Math.round(((originalPrice - discountedPrice) / originalPrice) * 100),
            reason: 'near-expiry',
            startsAt: new Date(),
            endsAt: new Date(expiryDate),
        });
        res.status(201).json({ success: true, data: { listing } });
    }
    catch (err) {
        next(err);
    }
};
exports.createZeroWasteListing = createZeroWasteListing;
//# sourceMappingURL=commerceController.js.map