import { Response, NextFunction } from 'express';
import { GroupBuyDeal } from '../models/GroupBuyDeal';
import { DealsRadarEntry } from '../models/DealsRadarEntry';
import { ZeroWasteListing } from '../models/ZeroWasteListing';
import { Product } from '../models/Product';
import { Shop } from '../models/Shop';
import { Order } from '../models/Order';
import { Notification } from '../models/Notification';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getIO } from '../sockets';

// ─── Group Buy ────────────────────────────────────────────────────────────────

// GET /api/group-buys
export const getGroupBuys = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deals = await GroupBuyDeal.find({ status: 'active', expiresAt: { $gt: new Date() } })
      .populate('productId', 'name images price unit shopId')
      .sort({ expiresAt: 1 })
      .lean();
    res.json({ success: true, data: { deals } });
  } catch (err) {
    next(err);
  }
};

// GET /api/group-buys/:id
export const getGroupBuyById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deal = await GroupBuyDeal.findById(req.params.id)
      .populate('productId', 'name images price mrp unit shopId description')
      .populate('participants.customerId', 'name')
      .lean();
    if (!deal) throw ApiError.notFound('Group buy not found.');
    res.json({ success: true, data: { deal } });
  } catch (err) {
    next(err);
  }
};

// POST /api/group-buys/:id/join — Customer joins group buy
export const joinGroupBuy = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { qty } = req.body;
    const qtyNum = parseInt(qty, 10);
    if (!qtyNum || qtyNum < 1) throw ApiError.badRequest('Quantity must be at least 1.');

    const deal = await GroupBuyDeal.findById(req.params.id);
    if (!deal) throw ApiError.notFound('Group buy not found.');
    if (deal.status !== 'active') throw ApiError.badRequest('This group buy is no longer active.');
    if (new Date() > deal.expiresAt) throw ApiError.badRequest('This group buy has expired.');

    // Check if customer already participated
    const existing = deal.participants.find((p) => p.customerId.toString() === req.user!.id);
    if (existing) {
      existing.qty += qtyNum;
    } else {
      deal.participants.push({ customerId: req.user!.id as unknown as import('mongoose').Types.ObjectId, qty: qtyNum });
    }

    deal.currentQty += qtyNum;

    // Check if target reached
    if (deal.currentQty >= deal.targetQty) {
      deal.status = 'succeeded';

      // Create orders for all participants
      const product = await Product.findById(deal.productId);
      if (product) {
        for (const participant of deal.participants) {
          await Order.create({
            customerId: participant.customerId,
            shopId: (product.shopId as unknown as { toString(): string }).toString(),
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
          await Notification.create({
            userId: participant.customerId,
            type: 'group_buy_success',
            title: '🎉 Group Buy Succeeded!',
            body: `Your group buy for "${product.name}" succeeded! Order placed at ₹${deal.pricePerUnitAtTarget}/unit.`,
          });

          getIO().to(`user:${participant.customerId}`).emit('notification:new', {
            type: 'group_buy_success',
            title: '🎉 Group Buy Succeeded!',
            body: `Your group buy for "${product.name}" succeeded!`,
          });
        }
      }
    }

    await deal.save();

    // Emit progress update
    getIO().emit('groupbuy:progress', {
      dealId: deal._id.toString(),
      currentQty: deal.currentQty,
      targetQty: deal.targetQty,
      status: deal.status,
    });

    res.json({ success: true, data: { deal } });
  } catch (err) {
    next(err);
  }
};

// POST /api/group-buys — Vendor creates a group buy deal
export const createGroupBuy = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, targetQty, pricePerUnitAtTarget, expiresAt } = req.body;

    const product = await Product.findById(productId).populate('shopId').lean();
    if (!product) throw ApiError.notFound('Product not found.');

    const shopDoc = product.shopId as unknown as { ownerId: { toString(): string } };
    if (shopDoc.ownerId.toString() !== req.user!.id) {
      throw ApiError.forbidden('You do not own this product.');
    }

    const deal = await GroupBuyDeal.create({
      productId,
      targetQty,
      currentQty: 0,
      pricePerUnitAtTarget,
      participants: [],
      expiresAt: new Date(expiresAt),
    });

    res.status(201).json({ success: true, data: { deal } });
  } catch (err) {
    next(err);
  }
};

// ─── Deals Radar ─────────────────────────────────────────────────────────────

// GET /api/deals-radar
export const getDealsRadar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { area, sortBy = 'discount', page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const now = new Date();

    let shopFilter: Record<string, unknown> = {};
    if (area) shopFilter.area = { $regex: new RegExp(area as string, 'i') };
    const shops = area ? await Shop.find(shopFilter).select('_id').lean() : [];
    const shopIds = shops.map((s) => s._id);

    const filter: Record<string, unknown> = {
      startsAt: { $lte: now },
      endsAt: { $gt: now },
    };
    if (area && shopIds.length) filter.shopId = { $in: shopIds };

    const sortMap: Record<string, string> = {
      discount: '-discountPercent',
      expiry: 'endsAt',
    };
    const sortStr = sortMap[sortBy as string] ?? '-discountPercent';

    const deals = await DealsRadarEntry.find(filter)
      .populate('productId', 'name images price mrp unit stock')
      .populate('shopId', 'name area lat lng rating')
      .sort(sortStr)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const total = await DealsRadarEntry.countDocuments(filter);

    res.json({ success: true, data: { items: deals, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) {
    next(err);
  }
};

// POST /api/deals-radar — Vendor creates a deal
export const createDeal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user!.id });
    if (!shop) throw ApiError.notFound('No shop found.');

    const { productId, discountPercent, reason, startsAt, endsAt } = req.body;

    const deal = await DealsRadarEntry.create({
      productId,
      shopId: shop._id,
      discountPercent,
      reason,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
    });

    res.status(201).json({ success: true, data: { deal } });
  } catch (err) {
    next(err);
  }
};

// ─── Zero Waste ───────────────────────────────────────────────────────────────

// GET /api/zero-waste
export const getZeroWasteListings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { area, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    let shopFilter: Record<string, unknown> = {};
    if (area) shopFilter.area = { $regex: new RegExp(area as string, 'i') };
    const shops = area ? await Shop.find(shopFilter).select('_id').lean() : [];
    const shopIds = shops.map((s) => s._id);

    const filter: Record<string, unknown> = {
      expiryDate: { $gt: new Date() },
      qtyAvailable: { $gt: 0 },
    };
    if (area && shopIds.length) filter.shopId = { $in: shopIds };

    const listings = await ZeroWasteListing.find(filter)
      .populate('productId', 'name images unit category')
      .populate('shopId', 'name area lat lng')
      .sort({ expiryDate: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const total = await ZeroWasteListing.countDocuments(filter);

    res.json({ success: true, data: { items: listings, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) {
    next(err);
  }
};

// POST /api/zero-waste — Vendor creates a listing
export const createZeroWasteListing = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user!.id });
    if (!shop) throw ApiError.notFound('No shop found.');

    const { productId, originalPrice, discountedPrice, expiryDate, qtyAvailable } = req.body;

    // Also update product to mark as zero waste
    await Product.findByIdAndUpdate(productId, {
      isZeroWasteItem: true,
      zeroWasteDiscountPercent: Math.round(((originalPrice - discountedPrice) / originalPrice) * 100),
    });

    const listing = await ZeroWasteListing.create({
      productId,
      shopId: shop._id,
      originalPrice,
      discountedPrice,
      expiryDate: new Date(expiryDate),
      qtyAvailable,
    });

    // Also create a DealsRadarEntry for it
    await DealsRadarEntry.create({
      productId,
      shopId: shop._id,
      discountPercent: Math.round(((originalPrice - discountedPrice) / originalPrice) * 100),
      reason: 'near-expiry',
      startsAt: new Date(),
      endsAt: new Date(expiryDate),
    });

    res.status(201).json({ success: true, data: { listing } });
  } catch (err) {
    next(err);
  }
};
