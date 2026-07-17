import { Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Shop } from '../models/Shop';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getIO } from '../sockets';
import { Notification } from '../models/Notification';

// POST /api/orders — Customer places an order
export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shopId, items, deliveryAddress, discount = 0 } = req.body;

    if (!items || items.length === 0) {
      throw ApiError.badRequest('Order must contain at least one item.');
    }

    const shop = await Shop.findById(shopId);
    if (!shop || !shop.isOpen) {
      throw ApiError.badRequest('Shop is not available.', 'SHOP_UNAVAILABLE');
    }

    // Validate and reserve stock for each item with optimistic locking
    let subtotal = 0;
    const processedItems: Array<{ productId: string; name: string; qty: number; price: number }> = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.status !== 'active') {
        throw ApiError.badRequest(`Product "${item.name}" is no longer available.`, 'PRODUCT_UNAVAILABLE');
      }

      const availableOnline = product.stock - product.walkInReserve - product.reservedStock;

      // Walk-in stock lock check
      if (shop.walkInStockLockEnabled && availableOnline < item.qty) {
        throw ApiError.conflict(
          `"${product.name}" has units reserved for in-store customers. Please visit the shop or try a smaller quantity.`,
          'WALK_IN_RESERVE_CONFLICT'
        );
      }

      if (product.stock - product.reservedStock < item.qty) {
        throw ApiError.conflict(
          `Insufficient stock for "${product.name}". Only ${product.stock - product.reservedStock} available.`,
          'STOCK_INSUFFICIENT'
        );
      }

      // Atomically reserve stock with optimistic lock
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, version: product.version, stock: { $gte: item.qty } },
        { $inc: { reservedStock: item.qty, version: 1 } },
        { new: true }
      );

      if (!updated) {
        throw ApiError.conflict(
          `Stock conflict on "${product.name}". Please refresh your cart.`,
          'VERSION_CONFLICT'
        );
      }

      subtotal += product.price * item.qty;
      processedItems.push({ productId: item.productId, name: product.name, qty: item.qty, price: product.price });
    }

    const total = subtotal - discount;
    const order = await Order.create({
      customerId: req.user!.id,
      shopId,
      items: processedItems,
      subtotal,
      discount,
      total,
      deliveryAddress,
      placedAt: new Date(),
      statusHistory: [{ status: 'placed', at: new Date() }],
    });

    // Deduct reserved stock (move from reserved to actually deducted)
    for (const item of processedItems) {
      await Product.findOneAndUpdate(
        { _id: item.productId },
        { $inc: { stock: -item.qty, reservedStock: -item.qty } }
      );

      // Emit live stock update
      getIO().to(`product:${item.productId}`).emit('stock:updated', {
        productId: item.productId,
      });
    }

    // Notify vendor
    const vendor = await Shop.findById(shopId);
    if (vendor) {
      getIO().to(`shop:${shopId}`).emit('order:statusChanged', {
        orderId: order._id.toString(),
        status: 'placed',
        at: new Date().toISOString(),
      });
    }

    // Notify customer
    getIO().to(`user:${req.user!.id}`).emit('order:statusChanged', {
      orderId: order._id.toString(),
      status: 'placed',
      at: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders — Customer: their orders; Vendor: shop orders; Admin: all
export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '10', status } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    let filter: Record<string, unknown> = {};

    if (req.user!.role === 'customer') {
      filter.customerId = req.user!.id;
    } else if (req.user!.role === 'vendor') {
      const shop = await Shop.findOne({ ownerId: req.user!.id });
      if (!shop) { res.json({ success: true, data: { items: [], total: 0, page: pageNum, limit: limitNum, totalPages: 0 } }); return; }
      filter.shopId = shop._id;
    }

    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customerId', 'name email phone')
        .populate('shopId', 'name area')
        .sort({ placedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { items: orders, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('shopId', 'name area lat lng')
      .populate('items.productId', 'name images');

    if (!order) throw ApiError.notFound('Order not found.');

    // Access control
    if (req.user!.role === 'customer' && order.customerId.toString() !== req.user!.id) {
      throw ApiError.forbidden('Not your order.');
    }

    res.json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/status — Vendor/Admin updates order status
export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      throw ApiError.badRequest('Invalid status value.');
    }

    const order = await Order.findById(req.params.id);
    if (!order) throw ApiError.notFound('Order not found.');

    if (req.user!.role === 'vendor') {
      const shop = await Shop.findOne({ ownerId: req.user!.id });
      if (!shop || shop._id.toString() !== order.shopId.toString()) {
        throw ApiError.forbidden('Not your order.');
      }
    }

    order.status = status;
    order.statusHistory.push({ status, at: new Date() });
    await order.save();

    // Emit to customer and shop rooms
    const payload = { orderId: order._id.toString(), status, at: new Date().toISOString() };
    getIO().to(`user:${order.customerId}`).emit('order:statusChanged', payload);
    getIO().to(`shop:${order.shopId}`).emit('order:statusChanged', payload);

    // Create notification for customer
    await Notification.create({
      userId: order.customerId,
      type: 'order_status',
      title: 'Order Update',
      body: `Your order #${order._id.toString().slice(-6)} is now ${status.replace(/_/g, ' ')}.`,
    });

    getIO().to(`user:${order.customerId}`).emit('notification:new', {
      type: 'order_status',
      title: 'Order Update',
      body: `Your order is now ${status.replace(/_/g, ' ')}.`,
    });

    res.json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
};
