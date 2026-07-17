import mongoose, { Document, Types } from 'mongoose';
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
export declare const Product: mongoose.Model<IProductDocument, {}, {}, {}, mongoose.Document<unknown, {}, IProductDocument, {}, {}> & IProductDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Product.d.ts.map