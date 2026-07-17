import mongoose, { Document, Schema, Types } from 'mongoose';
import { SwapStatus } from '@yaharika/shared-types';

export interface IStockSwapRequestDocument extends Document {
  requestingShopId: Types.ObjectId;
  fulfillingShopId?: Types.ObjectId;
  productName: string;
  category: string;
  qtyNeeded: number;
  status: SwapStatus;
  matchedProductId?: Types.ObjectId;
  createdAt: Date;
}

const stockSwapSchema = new Schema<IStockSwapRequestDocument>(
  {
    requestingShopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    fulfillingShopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
    productName: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    qtyNeeded: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['open', 'matched', 'in_transit', 'completed', 'cancelled'],
      default: 'open',
      index: true,
    },
    matchedProductId: { type: Schema.Types.ObjectId, ref: 'Product' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export const StockSwapRequest = mongoose.model<IStockSwapRequestDocument>(
  'StockSwapRequest',
  stockSwapSchema
);
