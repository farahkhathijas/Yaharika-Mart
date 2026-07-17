import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IZeroWasteListingDocument extends Document {
  productId: Types.ObjectId;
  shopId: Types.ObjectId;
  originalPrice: number;
  discountedPrice: number;
  expiryDate: Date;
  qtyAvailable: number;
}

const zeroWasteSchema = new Schema<IZeroWasteListingDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    originalPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    expiryDate: { type: Date, required: true, index: true },
    qtyAvailable: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const ZeroWasteListing = mongoose.model<IZeroWasteListingDocument>(
  'ZeroWasteListing',
  zeroWasteSchema
);
