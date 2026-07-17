import { Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { Shop } from '../models/Shop';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { trackDemand } from '../models/FlashDemandEvent';
import { getIO } from '../sockets';

// GET /api/shops/:shopId/products
export const getProductsByShop = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, search, sort = 'createdAt' } = req.query;
    const filter: Record<string, unknown> = { shopId: req.params.shopId, status: 'active' };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search as string };

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name: { name: 1 },
      createdAt: { createdAt: -1 },
    };
    const sortOpt = sortMap[sort as string] ?? { createdAt: -1 };

    const products = await Product.find(filter).sort(sortOpt).lean();
    res.json({ success: true, data: { products } });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
export const getProductById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate('shopId').lean();
    if (!product) throw ApiError.notFound('Product not found.');
    res.json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/search
export const searchProducts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q, area, category, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const filter: Record<string, unknown> = { status: 'active' };
    if (q) filter.$text = { $search: q as string };
    if (category) filter.category = category;

    // Join with shops if area filter needed
    let products;
    if (area) {
      const shops = await Shop.find({ area: { $regex: new RegExp(area as string, 'i') } }).select('_id').lean();
      const shopIds = shops.map((s) => s._id);
      filter.shopId = { $in: shopIds };
    }

    products = await Product.find(filter)
      .populate('shopId', 'name area lat lng rating isOpen')
      .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const total = await Product.countDocuments(filter);

    // Track demand for flash demand system
    if (category && area && req.user) {
      const shop = await Shop.findOne({ ownerId: req.user.id }).lean();
      const shopIdStr = shop?._id?.toString() ?? 'anonymous';
      const { count, triggered } = trackDemand(category as string, area as string, shopIdStr);
      if (triggered) {
        // Emit flash demand event to vendors in that area
        getIO().to(`area:${area}`).emit('flashdemand:triggered', {
          productCategory: category,
          area,
          demandScore: count,
        });
      }
    }

    res.json({ success: true, data: { items: products, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) {
    next(err);
  }
};

// POST /api/products — Vendor only
export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user!.id });
    if (!shop) throw ApiError.notFound('You do not have a shop yet.');

    const {
      name, description, category, price, mrp, unit,
      images, stock, walkInReserve, lowStockThreshold,
      isZeroWasteItem, zeroWasteDiscountPercent, expiryDate,
    } = req.body;

    const product = await Product.create({
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
  } catch (err) {
    next(err);
  }
};

// PATCH /api/products/:id — Vendor only (must own the shop)
export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate('shopId');
    if (!product) throw ApiError.notFound('Product not found.');

    const shop = product.shopId as unknown as { ownerId: string };
    if (shop.ownerId.toString() !== req.user!.id) {
      throw ApiError.forbidden('You do not own this product.');
    }

    const allowed = [
      'name', 'description', 'category', 'price', 'mrp', 'unit',
      'images', 'lowStockThreshold', 'isZeroWasteItem',
      'zeroWasteDiscountPercent', 'expiryDate', 'status',
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) (product as any)[field] = req.body[field];
    });

    await product.save();
    res.json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/products/:id/stock — Vendor adjusts stock (optimistic lock)
export const updateStock = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { stockDelta, version } = req.body;
    const delta = parseInt(stockDelta, 10);

    if (isNaN(delta)) throw ApiError.badRequest('stockDelta must be a number.');

    // Verify ownership
    const existing = await Product.findById(req.params.id).populate('shopId').lean();
    if (!existing) throw ApiError.notFound('Product not found.');

    const shopDoc = existing.shopId as unknown as { ownerId: { toString(): string } };
    if (shopDoc.ownerId.toString() !== req.user!.id) {
      throw ApiError.forbidden('You do not own this product.');
    }

    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, version: version ?? existing.version },
      { $inc: { stock: delta, version: 1 } },
      { new: true }
    );

    if (!updated) {
      throw ApiError.conflict(
        'Stock was modified concurrently. Please refresh and try again.',
        'VERSION_CONFLICT'
      );
    }

    // Emit real-time stock update
    getIO().to(`product:${updated._id}`).emit('stock:updated', {
      productId: updated._id.toString(),
      newStock: updated.stock,
      reservedStock: updated.reservedStock,
    });

    res.json({ success: true, data: { product: updated } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/products/:id/walkin-reserve — Adjust walk-in reserve (slider)
export const updateWalkInReserve = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { walkInReserve } = req.body;
    const reserve = parseInt(walkInReserve, 10);

    const existing = await Product.findById(req.params.id).populate('shopId').lean();
    if (!existing) throw ApiError.notFound('Product not found.');

    const shopDoc = existing.shopId as unknown as { ownerId: { toString(): string } };
    if (shopDoc.ownerId.toString() !== req.user!.id) {
      throw ApiError.forbidden('You do not own this product.');
    }

    if (reserve > existing.stock) {
      throw ApiError.badRequest(
        'Walk-in reserve cannot exceed total stock.',
        'RESERVE_EXCEEDS_STOCK'
      );
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { walkInReserve: reserve } },
      { new: true }
    );

    res.json({ success: true, data: { product: updated } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id — Vendor only
export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate('shopId').lean();
    if (!product) throw ApiError.notFound('Product not found.');

    const shopDoc = product.shopId as unknown as { ownerId: { toString(): string } };
    if (shopDoc.ownerId.toString() !== req.user!.id) {
      throw ApiError.forbidden('You do not own this product.');
    }

    await Product.findByIdAndUpdate(req.params.id, { status: 'inactive' });
    res.json({ success: true, data: { message: 'Product deactivated.' } });
  } catch (err) {
    next(err);
  }
};
