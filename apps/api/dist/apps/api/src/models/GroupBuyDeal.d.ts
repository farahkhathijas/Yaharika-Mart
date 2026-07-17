import mongoose, { Document, Types } from 'mongoose';
import { GroupBuyStatus } from '@yaharika/shared-types';
export interface IGroupBuyDealDocument extends Document {
    productId: Types.ObjectId;
    targetQty: number;
    currentQty: number;
    pricePerUnitAtTarget: number;
    participants: Array<{
        customerId: Types.ObjectId;
        qty: number;
    }>;
    expiresAt: Date;
    status: GroupBuyStatus;
}
export declare const GroupBuyDeal: mongoose.Model<IGroupBuyDealDocument, {}, {}, {}, mongoose.Document<unknown, {}, IGroupBuyDealDocument, {}, {}> & IGroupBuyDealDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=GroupBuyDeal.d.ts.map