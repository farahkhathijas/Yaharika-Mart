import mongoose, { Document, Types } from 'mongoose';
import { DealReason } from '@yaharika/shared-types';
export interface IDealsRadarEntryDocument extends Document {
    productId: Types.ObjectId;
    shopId: Types.ObjectId;
    discountPercent: number;
    reason: DealReason;
    startsAt: Date;
    endsAt: Date;
}
export declare const DealsRadarEntry: mongoose.Model<IDealsRadarEntryDocument, {}, {}, {}, mongoose.Document<unknown, {}, IDealsRadarEntryDocument, {}, {}> & IDealsRadarEntryDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=DealsRadarEntry.d.ts.map