import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IShopDocument extends Document {
  ownerId: Types.ObjectId;
  name: string;
  description: string;
  category: string;
  logoUrl?: string;
  bannerUrl?: string;
  area: string;
  lat: number;
  lng: number;
  isOpen: boolean;
  rating: number;
  walkInStockLockEnabled: boolean;
  createdAt: Date;
}

const shopSchema = new Schema<IShopDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      required: true,
      enum: ['grocery', 'pharmacy', 'bakery', 'dairy', 'general', 'vegetables', 'stationery', 'meat', 'other'],
    },
    logoUrl: { type: String },
    bannerUrl: { type: String },
    area: { type: String, required: true, index: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    isOpen: { type: Boolean, default: true },
    rating: { type: Number, default: 4.0, min: 0, max: 5 },
    walkInStockLockEnabled: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

// 2dsphere index for geospatial queries
shopSchema.index({ lat: 1, lng: 1 });
shopSchema.index({ area: 1, category: 1 });

export const Shop = mongoose.model<IShopDocument>('Shop', shopSchema);
