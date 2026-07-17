import mongoose, { Document, Types } from 'mongoose';
import { OrderStatus } from '@yaharika/shared-types';
export interface IOrderDocument extends Document {
    customerId: Types.ObjectId;
    shopId: Types.ObjectId;
    items: Array<{
        productId: Types.ObjectId;
        name: string;
        qty: number;
        price: number;
    }>;
    subtotal: number;
    discount: number;
    total: number;
    status: OrderStatus;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    deliveryAddress: {
        line1: string;
        area: string;
        city: string;
        pincode: string;
        lat: number;
        lng: number;
    };
    placedAt: Date;
    statusHistory: Array<{
        status: OrderStatus;
        at: Date;
    }>;
}
export declare const Order: mongoose.Model<IOrderDocument, {}, {}, {}, mongoose.Document<unknown, {}, IOrderDocument, {}, {}> & IOrderDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Order.d.ts.map