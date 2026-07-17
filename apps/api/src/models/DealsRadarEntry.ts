import mongoose, { Document, Schema, Types } from 'mongoose';
import { DealReason } from '@yaharika/shared-types';

export interface IDealsRadarEntryDocument extends Document {
  productId: Types.ObjectId;
  shopId: Types.ObjectId;
  discountPercent: number;
  reason: DealReason;
  startsAt: Date;
  endsAt: Date;
}

const dealsRadarSchema = new Schema<IDealsRadarEntryDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    discountPercent: { type: Number, required: true, min: 0, max: 100 },
    reason: {
      type: String,
      enum: ['surplus', 'near-expiry', 'promo'],
      required: true,
    },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

dealsRadarSchema.index({ shopId: 1, endsAt: 1 });

export const DealsRadarEntry = mongoose.model<IDealsRadarEntryDocument>(
  'DealsRadarEntry',
  dealsRadarSchema
);
