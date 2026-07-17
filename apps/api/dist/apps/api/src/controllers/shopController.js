"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleOpen = exports.updateShop = exports.createShop = exports.getMyShop = exports.getShopById = exports.getAllShops = void 0;
const Shop_1 = require("../models/Shop");
const Product_1 = require("../models/Product");
const errorHandler_1 = require("../middleware/errorHandler");
// Haversine formula: returns distance in km
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
// GET /api/shops
const getAllShops = async (req, res, next) => {
    try {
        const { area, category, search, page = '1', limit = '12', lat, lng, radius } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const filter = { isOpen: true };
        if (area)
            filter.area = { $regex: new RegExp(area, 'i') };
        if (category)
            filter.category = category;
        if (search)
            filter.name = { $regex: new RegExp(search, 'i') };
        let shops = await Shop_1.Shop.find(filter)
            .populate('ownerId', 'name email phone')
            .sort({ rating: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean();
        // Geo-filter & sort by distance if lat/lng provided
        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            const maxKm = parseFloat(radius || '15');
            // Map distance onto each shop
            shops = shops.map((s) => ({
                ...s,
                distance: parseFloat(haversine(userLat, userLng, s.lat, s.lng).toFixed(2)),
            }));
            // Filter by radius
            shops = shops.filter((s) => s.distance <= maxKm);
            // Sort by distance
            shops.sort((a, b) => a.distance - b.distance);
        }
        const total = shops.length;
        res.json({
            success: true,
            data: {
                items: shops,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllShops = getAllShops;
// GET /api/shops/:id
const getShopById = async (req, res, next) => {
    try {
        const shop = await Shop_1.Shop.findById(req.params.id).populate('ownerId', 'name email phone');
        if (!shop)
            throw errorHandler_1.ApiError.notFound('Shop not found.');
        const products = await Product_1.Product.find({ shopId: shop._id, status: 'active' }).sort({ createdAt: -1 });
        res.json({ success: true, data: { shop, products } });
    }
    catch (err) {
        next(err);
    }
};
exports.getShopById = getShopById;
// GET /api/shops/my — Vendor: own shop
const getMyShop = async (req, res, next) => {
    try {
        const shop = await Shop_1.Shop.findOne({ ownerId: req.user.id });
        if (!shop)
            throw errorHandler_1.ApiError.notFound('No shop found for this vendor.');
        res.json({ success: true, data: { shop } });
    }
    catch (err) {
        next(err);
    }
};
exports.getMyShop = getMyShop;
// POST /api/shops — Vendor creates their shop
const createShop = async (req, res, next) => {
    try {
        const { name, description, category, area, lat, lng, logoUrl, bannerUrl } = req.body;
        if (!name || !category || !area) {
            throw errorHandler_1.ApiError.badRequest('Shop name, category, and area are required.');
        }
        const existing = await Shop_1.Shop.findOne({ ownerId: req.user.id });
        if (existing) {
            throw errorHandler_1.ApiError.conflict('You already have a shop.', 'SHOP_EXISTS');
        }
        const shop = await Shop_1.Shop.create({
            ownerId: req.user.id,
            name,
            description: description || '',
            category,
            area,
            lat: parseFloat(lat) || 12.9716,
            lng: parseFloat(lng) || 77.5946,
            logoUrl,
            bannerUrl,
            isOpen: true,
            rating: 4.0,
            walkInStockLockEnabled: false,
        });
        res.status(201).json({ success: true, data: { shop } });
    }
    catch (err) {
        next(err);
    }
};
exports.createShop = createShop;
// PATCH /api/shops/:id
const updateShop = async (req, res, next) => {
    try {
        const shop = await Shop_1.Shop.findOne({ _id: req.params.id, ownerId: req.user.id });
        if (!shop)
            throw errorHandler_1.ApiError.notFound('Shop not found or not owned by you.');
        const allowed = ['name', 'description', 'isOpen', 'walkInStockLockEnabled', 'logoUrl', 'bannerUrl'];
        allowed.forEach((field) => {
            if (req.body[field] !== undefined)
                shop[field] = req.body[field];
        });
        await shop.save();
        res.json({ success: true, data: { shop } });
    }
    catch (err) {
        next(err);
    }
};
exports.updateShop = updateShop;
// PATCH /api/shops/:id/toggle-open
const toggleOpen = async (req, res, next) => {
    try {
        const shop = await Shop_1.Shop.findOneAndUpdate({ _id: req.params.id, ownerId: req.user.id }, [{ $set: { isOpen: { $not: '$isOpen' } } }], { new: true });
        if (!shop)
            throw errorHandler_1.ApiError.notFound('Shop not found or not owned by you.');
        res.json({ success: true, data: { shop } });
    }
    catch (err) {
        next(err);
    }
};
exports.toggleOpen = toggleOpen;
//# sourceMappingURL=shopController.js.map