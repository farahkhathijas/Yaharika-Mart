import mongoose, { Document, Types } from 'mongoose';
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
export declare const Shop: mongoose.Model<IShopDocument, {}, {}, {}, mongoose.Document<unknown, {}, IShopDocument, {}, {}> & IShopDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Shop.d.ts.map