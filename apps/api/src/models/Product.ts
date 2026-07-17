import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProductDocument extends Document {
  shopId: Types.ObjectId;
  name: string;
  description: string;
  category: string;
  price: number;
  mrp: number;
  unit: string;
  images: string[];
  stock: number;
  reservedStock: number;
  walkInReserve: number;
  lowStockThreshold: number;
  isZeroWasteItem: boolean;
  zeroWasteDiscountPercent: number;
  expiryDate?: Date;
  version: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProductDocument>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, default: 'piece' },
    images: [{ type: String }],
    stock: { type: Number, required: true, default: 0, min: 0 },
    reservedStock: { type: Number, default: 0, min: 0 },
    walkInReserve: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    isZeroWasteItem: { type: Boolean, default: false },
    zeroWasteDiscountPercent: { type: Number, default: 0, min: 0, max: 100 },
    expiryDate: { type: Date },
    version: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    optimisticConcurrency: false, // manual version via $inc + version match
  }
);

productSchema.index({ shopId: 1, category: 1 });
productSchema.index({ name: 'text', description: 'text' });

export const Product = mongoose.model<IProductDocument>('Product', productSchema);
