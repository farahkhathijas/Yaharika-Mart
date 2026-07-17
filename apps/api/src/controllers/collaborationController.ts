import { Response, NextFunction } from 'express';
import { StockSwapRequest } from '../models/StockSwapRequest';
import { StockLoan } from '../models/StockLoan';
import { Product } from '../models/Product';
import { Shop } from '../models/Shop';
import { Notification } from '../models/Notification';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getIO } from '../sockets';

// Haversine helper
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Stock Swap ────────────────────────────────────────────────────────────────

// POST /api/stock-swap — Vendor creates a swap request
export const createSwapRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user!.id });
    if (!shop) throw ApiError.notFound('No shop found for this vendor.');

    const { productName, category, qtyNeeded } = req.body;

    // Auto-match: find nearby shops (same area or within 3km) with this product in stock
    const nearbyShops = await Shop.find({
      _id: { $ne: shop._id },
      area: shop.area,
    }).lean();

    // Also find shops within 3km (different area)
    const withinRadius = await Shop.find({ _id: { $ne: shop._id } }).lean();
    const closbyIds = withinRadius
      .filter((s) => haversine(shop.lat, shop.lng, s.lat, s.lng) <= 3)
      .map((s) => s._id);

    const allCandidateIds = [...new Set([...nearbyShops.map((s) => s._id), ...closbyIds])];

    // Find a matching product in candidate shops
    const matchingProduct = await Product.findOne({
      shopId: { $in: allCandidateIds },
      name: { $regex: new RegExp(productName, 'i') },
      category,
      stock: { $gte: qtyNeeded },
      status: 'active',
    }).populate('shopId').sort({ stock: -1 }).lean();

    const swapRequest = await StockSwapRequest.create({
      requestingShopId: shop._id,
      fulfillingShopId: matchingProduct ? (matchingProduct.shopId as { _id: unknown })._id : undefined,
      productName,
      category,
      qtyNeeded,
      status: matchingProduct ? 'matched' : 'open',
      matchedProductId: matchingProduct?._id,
    });

    // Notify matched shop
    if (matchingProduct) {
      const fulfillingShop = matchingProduct.shopId as any;
      getIO().to(`shop:${fulfillingShop._id.toString()}`).emit('swap:matched', {
        swapId: swapRequest._id.toString(),
        status: 'matched',
        requestingShopId: shop._id.toString(),
      });

      await Notification.create({
        userId: fulfillingShop.ownerId.toString(),
        type: 'swap_matched',
        title: 'Stock Swap Request',
        body: `${shop.name} needs ${qtyNeeded} units of "${productName}". You've been auto-matched!`,
      });
    }

    // Broadcast to requesting shop room
    getIO().to(`shop:${shop._id.toString()}`).emit('swap:created', {
      swapId: swapRequest._id.toString(),
      status: swapRequest.status,
    });

    res.status(201).json({ success: true, data: { swapRequest } });
  } catch (err) {
    next(err);
  }
};

// GET /api/stock-swap — Vendor: their shop's swap requests
export const getSwapRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user!.id });
    if (!shop) { res.json({ success: true, data: { swaps: [] } }); return; }

    const swaps = await StockSwapRequest.find({
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
  } catch (err) {
    next(err);
  }
};

// PATCH /api/stock-swap/:id/accept — Fulfilling vendor accepts swap
export const acceptSwap = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const swap = await StockSwapRequest.findById(req.params.id);
    if (!swap) throw ApiError.notFound('Swap request not found.');

    const shop = await Shop.findOne({ ownerId: req.user!.id });
    if (!shop) throw ApiError.notFound('Shop not found.');

    if (swap.fulfillingShopId?.toString() !== shop._id.toString()) {
      throw ApiError.forbidden('This swap is not assigned to your shop.');
    }

    if (swap.status !== 'matched') {
      throw ApiError.badRequest(`Cannot accept a swap in "${swap.status}" status.`);
    }

    // Atomically decrement fulfilling shop's stock
    if (swap.matchedProductId) {
      const product = await Product.findOneAndUpdate(
        { _id: swap.matchedProductId, stock: { $gte: swap.qtyNeeded } },
        { $inc: { stock: -swap.qtyNeeded, version: 1 } },
        { new: true }
      );

      if (!product) {
        throw ApiError.conflict('Insufficient stock to complete this swap.', 'STOCK_INSUFFICIENT');
      }

      // Emit stock update
      getIO().to(`product:${swap.matchedProductId}`).emit('stock:updated', {
        productId: swap.matchedProductId.toString(),
        newStock: product.stock,
        reservedStock: product.reservedStock,
      });
    }

    swap.status = 'in_transit';
    await swap.save();

    getIO().to(`shop:${swap.requestingShopId}`).emit('swap:matched', {
      swapId: swap._id.toString(),
      status: 'in_transit',
      fulfillingShopId: shop._id.toString(),
    });

    res.json({ success: true, data: { swapRequest: swap } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/stock-swap/:id/complete
export const completeSwap = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const swap = await StockSwapRequest.findById(req.params.id);
    if (!swap) throw ApiError.notFound('Swap request not found.');

    const shop = await Shop.findOne({ ownerId: req.user!.id });
    if (!shop || swap.requestingShopId.toString() !== shop._id.toString()) {
      throw ApiError.forbidden('Only the requesting shop can mark as complete.');
    }

    swap.status = 'completed';
    await swap.save();

    const payload = {
      swapId: swap._id.toString(),
      status: 'completed',
      requestingShopId: swap.requestingShopId.toString(),
      fulfillingShopId: swap.fulfillingShopId?.toString(),
    };

    getIO().to(`shop:${swap.requestingShopId}`).emit('swap:matched', payload);
    if (swap.fulfillingShopId) {
      getIO().to(`shop:${swap.fulfillingShopId}`).emit('swap:matched', payload);
    }

    res.json({ success: true, data: { swapRequest: swap } });
  } catch (err) {
    next(err);
  }
};

// ─── Stock Loans ───────────────────────────────────────────────────────────────

// POST /api/stock-loans
export const createLoan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const borrowingShop = await Shop.findOne({ ownerId: req.user!.id });
    if (!borrowingShop) throw ApiError.notFound('No shop found for this vendor.');

    const { lendingShopId, productId, qtyBorrowed, agreedReturnDate, interestType } = req.body;

    const lendingShop = await Shop.findById(lendingShopId);
    if (!lendingShop) throw ApiError.notFound('Lending shop not found.');

    const product = await Product.findById(productId);
    if (!product) throw ApiError.notFound('Product not found.');
    if (product.stock < qtyBorrowed) throw ApiError.conflict('Insufficient stock to lend.', 'STOCK_INSUFFICIENT');

    // Deduct from lending shop's stock
    await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: qtyBorrowed } },
      { $inc: { stock: -qtyBorrowed, version: 1 } }
    );

    const loan = await StockLoan.create({
      borrowingShopId: borrowingShop._id,
      lendingShopId,
      productId,
      qtyBorrowed,
      agreedReturnDate,
      interestType,
    });

    getIO().to(`shop:${lendingShopId}`).emit('loan:requested', {
      loanId: loan._id.toString(),
      borrowingShopName: borrowingShop.name,
      qtyBorrowed,
    });

    res.status(201).json({ success: true, data: { loan } });
  } catch (err) {
    next(err);
  }
};

// GET /api/stock-loans
export const getLoans = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user!.id });
    if (!shop) { res.json({ success: true, data: { loans: [] } }); return; }

    const loans = await StockLoan.find({
      $or: [{ borrowingShopId: shop._id }, { lendingShopId: shop._id }],
    })
      .populate('borrowingShopId', 'name area')
      .populate('lendingShopId', 'name area')
      .populate('productId', 'name unit')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: { loans } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/stock-loans/:id/return
export const returnLoan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const loan = await StockLoan.findById(req.params.id);
    if (!loan) throw ApiError.notFound('Loan not found.');

    const shop = await Shop.findOne({ ownerId: req.user!.id });
    if (!shop || loan.borrowingShopId.toString() !== shop._id.toString()) {
      throw ApiError.forbidden('Only the borrowing shop can mark as returned.');
    }

    // Return stock to lending shop
    await Product.findByIdAndUpdate(loan.productId, { $inc: { stock: loan.qtyBorrowed } });

    loan.returnStatus = 'returned';
    await loan.save();

    res.json({ success: true, data: { loan } });
  } catch (err) {
    next(err);
  }
};
