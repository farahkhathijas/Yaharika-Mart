import mongoose, { Document, Schema, Types } from 'mongoose';
import { OrderStatus } from '@yaharika/shared-types';

export interface IOrderDocument extends Document {
  customerId: Types.ObjectId;
  shopId: Types.ObjectId;
  items: Array<{
    productId: Types.ObjectId;
    name: string;
    qty: number;
    price: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  deliveryAddress: {
    line1: string;
    area: string;
    city: string;
    pincode: string;
    lat: number;
    lng: number;
  };
  placedAt: Date;
  statusHistory: Array<{ status: OrderStatus; at: Date }>;
}

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    line1: String,
    area: String,
    city: String,
    pincode: String,
    lat: Number,
    lng: Number,
  },
  { _id: false }
);

const statusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrderDocument>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'paid',
    },
    deliveryAddress: addressSchema,
    placedAt: { type: Date, default: Date.now },
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

orderSchema.index({ customerId: 1, placedAt: -1 });
orderSchema.index({ shopId: 1, placedAt: -1 });
orderSchema.index({ status: 1 });

export const Order = mongoose.model<IOrderDocument>('Order', orderSchema);
