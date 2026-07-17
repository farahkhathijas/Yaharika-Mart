import mongoose, { Document, Schema, Types } from 'mongoose';
import { GroupBuyStatus } from '@yaharika/shared-types';

export interface IGroupBuyDealDocument extends Document {
  productId: Types.ObjectId;
  targetQty: number;
  currentQty: number;
  pricePerUnitAtTarget: number;
  participants: Array<{ customerId: Types.ObjectId; qty: number }>;
  expiresAt: Date;
  status: GroupBuyStatus;
}

const groupBuySchema = new Schema<IGroupBuyDealDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    targetQty: { type: Number, required: true, min: 1 },
    currentQty: { type: Number, default: 0, min: 0 },
    pricePerUnitAtTarget: { type: Number, required: true, min: 0 },
    participants: [
      {
        customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        qty: { type: Number, required: true, min: 1 },
        _id: false,
      },
    ],
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'succeeded', 'failed'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

export const GroupBuyDeal = mongoose.model<IGroupBuyDealDocument>('GroupBuyDeal', groupBuySchema);
