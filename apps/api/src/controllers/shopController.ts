import { Response, NextFunction } from 'express';
import { Shop } from '../models/Shop';
import { Product } from '../models/Product';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Haversine formula: returns distance in km
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GET /api/shops
export const getAllShops = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { area, category, search, page = '1', limit = '12', lat, lng, radius } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const filter: Record<string, unknown> = { isOpen: true };
    if (area) filter.area = { $regex: new RegExp(area as string, 'i') };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: new RegExp(search as string, 'i') };

    let shops = await Shop.find(filter)
      .populate('ownerId', 'name email phone')
      .sort({ rating: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Geo-filter & sort by distance if lat/lng provided
    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const maxKm = parseFloat((radius as string) || '15');
      
      // Map distance onto each shop
      shops = shops.map((s) => ({
        ...s,
        distance: parseFloat(haversine(userLat, userLng, s.lat, s.lng).toFixed(2)),
      }));

      // Filter by radius
      shops = shops.filter((s: any) => s.distance <= maxKm);

      // Sort by distance
      shops.sort((a: any, b: any) => a.distance - b.distance);
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
  } catch (err) {
    next(err);
  }
};

// GET /api/shops/:id
export const getShopById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shop = await Shop.findById(req.params.id).populate('ownerId', 'name email phone');
    if (!shop) throw ApiError.notFound('Shop not found.');

    const products = await Product.find({ shopId: shop._id, status: 'active' }).sort({ createdAt: -1 });

    res.json({ success: true, data: { shop, products } });
  } catch (err) {
    next(err);
  }
};

// GET /api/shops/my — Vendor: own shop
export const getMyShop = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user!.id });
    if (!shop) throw ApiError.notFound('No shop found for this vendor.');
    res.json({ success: true, data: { shop } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/shops/:id
export const updateShop = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shop = await Shop.findOne({ _id: req.params.id, ownerId: req.user!.id });
    if (!shop) throw ApiError.notFound('Shop not found or not owned by you.');

    const allowed = ['name', 'description', 'isOpen', 'walkInStockLockEnabled', 'logoUrl', 'bannerUrl'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) (shop as any)[field] = req.body[field];
    });

    await shop.save();
    res.json({ success: true, data: { shop } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/shops/:id/toggle-open
export const toggleOpen = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shop = await Shop.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user!.id },
      [{ $set: { isOpen: { $not: '$isOpen' } } }],
      { new: true }
    );
    if (!shop) throw ApiError.notFound('Shop not found or not owned by you.');
    res.json({ success: true, data: { shop } });
  } catch (err) {
    next(err);
  }
};
