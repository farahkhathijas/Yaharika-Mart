import { Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Shop } from '../models/Shop';
import { User } from '../models/User';
import { StockSwapRequest } from '../models/StockSwapRequest';
import { ZeroWasteListing } from '../models/ZeroWasteListing';
import { FlashDemandEvent } from '../models/FlashDemandEvent';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// GET /api/admin/stats — Platform-wide statistics
export const getPlatformStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalShops,
      totalOrders,
      totalRevenue,
      swapsCompleted,
      zeroWasteListings,
      activeGroupBuys,
      totalCustomers,
      totalVendors,
    ] = await Promise.all([
      Shop.countDocuments({ isOpen: true }),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      StockSwapRequest.countDocuments({ status: 'completed' }),
      ZeroWasteListing.aggregate([{ $group: { _id: null, totalQty: { $sum: '$qtyAvailable' } } }]),
      Order.countDocuments({ status: { $in: ['placed', 'confirmed', 'preparing'] } }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'vendor' }),
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
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/analytics — Revenue trend (last 30 days)
export const getAnalyticsTrend = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevenue = await Order.aggregate([
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

    const topVendors = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$shopId', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'shops', localField: '_id', foreignField: '_id', as: 'shop' } },
      { $unwind: '$shop' },
      { $project: { shopName: '$shop.name', revenue: 1, orders: 1 } },
    ]);

    const categoryBreakdown = await Order.aggregate([
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
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/vendors — All vendors with stats
export const getAllVendors = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const vendors = await User.find({ role: 'vendor' })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const vendorIds = vendors.map((v) => v._id);
    const shops = await Shop.find({ ownerId: { $in: vendorIds } }).lean();
    const shopMap = new Map(shops.map((s) => [s.ownerId.toString(), s]));

    const enriched = vendors.map((v) => ({
      ...v,
      shop: shopMap.get(v._id.toString()),
    }));

    const total = await User.countDocuments({ role: 'vendor' });

    res.json({ success: true, data: { items: enriched, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) {
    next(err);
  }
};

// GET /api/vendor/insights — Vendor's own analytics
export const getVendorInsights = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user!.id });
    if (!shop) throw ApiError.notFound('No shop found.');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalRevenue,
      totalOrders,
      topProducts,
      swapsGiven,
      swapsReceived,
      loansGiven,
      dailyRevenue,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { shopId: shop._id, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments({ shopId: shop._id, status: { $ne: 'cancelled' } }),
      Order.aggregate([
        { $match: { shopId: shop._id, status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.productId', name: { $first: '$items.name' }, sold: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
      StockSwapRequest.countDocuments({ fulfillingShopId: shop._id, status: 'completed' }),
      StockSwapRequest.countDocuments({ requestingShopId: shop._id, status: 'completed' }),
      StockSwapRequest.countDocuments({ fulfillingShopId: shop._id }),
      Order.aggregate([
        { $match: { shopId: shop._id, placedAt: { $gte: thirtyDaysAgo }, status: { $ne: 'cancelled' } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$placedAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Collaboration score: swaps given + loans given vs total
    const collaborationScore = Math.min(100, (swapsGiven + loansGiven) * 10);

    // Restock suggestions: products with low stock
    const lowStockProducts = await Product.find({
      shopId: shop._id,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      status: 'active',
    }).lean();

    // Calculate 7-day rolling avg
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSales = await Order.aggregate([
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
  } catch (err) {
    next(err);
  }
};

// GET /api/notifications
export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { Notification } = await import('../models/Notification');
    const notifications = await Notification.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ success: true, data: { notifications } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/:id/read
export const markNotificationRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { Notification } = await import('../models/Notification');
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { isRead: true }
    );
    res.json({ success: true, data: { message: 'Marked as read.' } });
  } catch (err) {
    next(err);
  }
};
