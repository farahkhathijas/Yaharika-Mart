import mongoose, { Document, Types } from 'mongoose';
export interface IFlashDemandEventDocument extends Document {
    productCategory: string;
    area: string;
    demandScore: number;
    triggeredAt: Date;
    routedOrders: Types.ObjectId[];
    notifiedShopIds: Types.ObjectId[];
}
export declare const FlashDemandEvent: mongoose.Model<IFlashDemandEventDocument, {}, {}, {}, mongoose.Document<unknown, {}, IFlashDemandEventDocument, {}, {}> & IFlashDemandEventDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
interface DemandCountEntry {
    count: number;
    windowStart: number;
    shopIds: Set<string>;
}
export declare const demandCounters: Map<string, DemandCountEntry>;
export declare function trackDemand(category: string, area: string, shopId: string): {
    count: number;
    triggered: boolean;
};
export {};
//# sourceMappingURL=FlashDemandEvent.d.ts.map