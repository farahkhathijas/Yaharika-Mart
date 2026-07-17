import mongoose, { Document, Types } from 'mongoose';
export interface IZeroWasteListingDocument extends Document {
    productId: Types.ObjectId;
    shopId: Types.ObjectId;
    originalPrice: number;
    discountedPrice: number;
    expiryDate: Date;
    qtyAvailable: number;
}
export declare const ZeroWasteListing: mongoose.Model<IZeroWasteListingDocument, {}, {}, {}, mongoose.Document<unknown, {}, IZeroWasteListingDocument, {}, {}> & IZeroWasteListingDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ZeroWasteListing.d.ts.map