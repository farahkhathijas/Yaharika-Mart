import mongoose, { Document, Types } from 'mongoose';
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
export declare const StockSwapRequest: mongoose.Model<IStockSwapRequestDocument, {}, {}, {}, mongoose.Document<unknown, {}, IStockSwapRequestDocument, {}, {}> & IStockSwapRequestDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=StockSwapRequest.d.ts.map