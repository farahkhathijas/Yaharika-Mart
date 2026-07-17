"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationRead = exports.getNotifications = exports.getVendorInsights = exports.getAllVendors = exports.getAnalyticsTrend = exports.getPlatformStats = void 0;
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const Shop_1 = require("../models/Shop");
const User_1 = require("../models/User");
const StockSwapRequest_1 = require("../models/StockSwapRequest");
const ZeroWasteListing_1 = require("../models/ZeroWasteListing");
const errorHandler_1 = require("../middleware/errorHandler");
// GET /api/admin/stats — Platform-wide statistics
const getPlatformStats = async (req, res, next) => {
    try {
        const [totalShops, totalOrders, totalRevenue, swapsCompleted, zeroWasteListings, activeGroupBuys, totalCustomers, totalVendors,] = await Promise.all([
            Shop_1.Shop.countDocuments({ isOpen: true }),
            Order_1.Order.countDocuments(),
            Order_1.Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
            StockSwapRequest_1.StockSwapRequest.countDocuments({ status: 'completed' }),
            ZeroWasteListing_1.ZeroWasteListing.aggregate([{ $group: { _id: null, totalQty: { $sum: '$qtyAvailable' } } }]),
            Order_1.Order.countDocuments({ status: { $in: ['placed', 'confirmed', 'preparing'] } }),
            User_1.User.countDocuments({ role: 'customer' }),
            User_1.User.countDocuments({ role: 'vendor' }),
        ]);
        const kgWasteDiverted = (zeroWasteListings[0]?.totalQty ?? 0) * 0.5; // Estimate 0.5kg per unit
        res.json({
            success: true,
            data: {
                totalShops,
                totalOrders,
                totalRevenue: totalRevenue[0]?.total ?? 0,
                swapsCompleted,
                kgWasteDiverted,
                activeGroupBuys,
                totalCustomers,
                totalVendors,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getPlatformStats = getPlatformStats;
// GET /api/admin/analytics — Revenue trend (last 30 days)
const getAnalyticsTrend = async (req, res, next) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dailyRevenue = await Order_1.Order.aggregate([
            { $match: { placedAt: { $gte: thirtyDaysAgo }, status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$placedAt' } },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        const topVendors = await Order_1.Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: '$shopId', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'shops', localField: '_id', foreignField: '_id', as: 'shop' } },
            { $unwind: '$shop' },
            { $project: { shopName: '$shop.name', revenue: 1, orders: 1 } },
        ]);
        const categoryBreakdown = await Order_1.Order.aggregate([
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            { $unwind: '$product' },
            { $group: { _id: '$product.category', revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } }, units: { $sum: '$items.qty' } } },
            { $sort: { revenue: -1 } },
        ]);
        res.json({ success: true, data: { dailyRevenue, topVendors, categoryBreakdown } });
    }
    catch (err) {
        next(err);
    }
};
exports.getAnalyticsTrend = getAnalyticsTrend;
// GET /api/admin/vendors — All vendors with stats
const getAllVendors = async (req, res, next) => {
    try {
        const { page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const vendors = await User_1.User.find({ role: 'vendor' })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean();
        const vendorIds = vendors.map((v) => v._id);
        const shops = await Shop_1.Shop.find({ ownerId: { $in: vendorIds } }).lean();
        const shopMap = new Map(shops.map((s) => [s.ownerId.toString(), s]));
        const enriched = vendors.map((v) => ({
            ...v,
            shop: shopMap.get(v._id.toString()),
        }));
        const total = await User_1.User.countDocuments({ role: 'vendor' });
        res.json({ success: true, data: { items: enriched, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllVendors = getAllVendors;
// GET /api/vendor/insights — Vendor's own analytics
const getVendorInsights = async (req, res, next) => {
    try {
        const shop = await Shop_1.Shop.findOne({ ownerId: req.user.id });
        if (!shop)
            throw errorHandler_1.ApiError.notFound('No shop found.');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [totalRevenue, totalOrders, topProducts, swapsGiven, swapsReceived, loansGiven, dailyRevenue,] = await Promise.all([
            Order_1.Order.aggregate([
                { $match: { shopId: shop._id, status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            Order_1.Order.countDocuments({ shopId: shop._id, status: { $ne: 'cancelled' } }),
            Order_1.Order.aggregate([
                { $match: { shopId: shop._id, status: { $ne: 'cancelled' } } },
                { $unwind: '$items' },
                { $group: { _id: '$items.productId', name: { $first: '$items.name' }, sold: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
                { $sort: { revenue: -1 } },
                { $limit: 5 },
            ]),
            StockSwapRequest_1.StockSwapRequest.countDocuments({ fulfillingShopId: shop._id, status: 'completed' }),
            StockSwapRequest_1.StockSwapRequest.countDocuments({ requestingShopId: shop._id, status: 'completed' }),
            StockSwapRequest_1.StockSwapRequest.countDocuments({ fulfillingShopId: shop._id }),
            Order_1.Order.aggregate([
                { $match: { shopId: shop._id, placedAt: { $gte: thirtyDaysAgo }, status: { $ne: 'cancelled' } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$placedAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
                { $sort: { _id: 1 } },
            ]),
        ]);
        // Collaboration score: swaps given + loans given vs total
        const collaborationScore = Math.min(100, (swapsGiven + loansGiven) * 10);
        // Restock suggestions: products with low stock
        const lowStockProducts = await Product_1.Product.find({
            shopId: shop._id,
            $expr: { $lte: ['$stock', '$lowStockThreshold'] },
            status: 'active',
        }).lean();
        // Calculate 7-day rolling avg
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentSales = await Order_1.Order.aggregate([
            { $match: { shopId: shop._id, placedAt: { $gte: sevenDaysAgo } } },
            { $unwind: '$items' },
            { $group: { _id: '$items.productId', avgDaily: { $avg: '$items.qty' } } },
        ]);
        const salesMap = new Map(recentSales.map((s) => [s._id.toString(), s.avgDaily]));
        const restockSuggestions = lowStockProducts.map((p) => ({
            productId: p._id.toString(),
            name: p.name,
            suggestedQty: Math.ceil((salesMap.get(p._id.toString()) ?? 2) * 7 * 1.5),
        }));
        res.json({
            success: true,
            data: {
                totalRevenue: totalRevenue[0]?.total ?? 0,
                totalOrders,
                topProducts,
                collaborationScore,
                restockSuggestions,
                swapsGiven,
                swapsReceived,
                dailyRevenue,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getVendorInsights = getVendorInsights;
// GET /api/notifications
const getNotifications = async (req, res, next) => {
    try {
        const { Notification } = await Promise.resolve().then(() => __importStar(require('../models/Notification')));
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        res.json({ success: true, data: { notifications } });
    }
    catch (err) {
        next(err);
    }
};
exports.getNotifications = getNotifications;
// PATCH /api/notifications/:id/read
const markNotificationRead = async (req, res, next) => {
    try {
        const { Notification } = await Promise.resolve().then(() => __importStar(require('../models/Notification')));
        await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { isRead: true });
        res.json({ success: true, data: { message: 'Marked as read.' } });
    }
    catch (err) {
        next(err);
    }
};
exports.markNotificationRead = markNotificationRead;
//# sourceMappingURL=analyticsController.js.map