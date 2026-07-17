import mongoose, { Document, Types } from 'mongoose';
import { InterestType, ReturnStatus } from '@yaharika/shared-types';
export interface IStockLoanDocument extends Document {
    borrowingShopId: Types.ObjectId;
    lendingShopId: Types.ObjectId;
    productId: Types.ObjectId;
    qtyBorrowed: number;
    agreedReturnDate: Date;
    returnStatus: ReturnStatus;
    interestType: InterestType;
    createdAt: Date;
}
export declare const StockLoan: mongoose.Model<IStockLoanDocument, {}, {}, {}, mongoose.Document<unknown, {}, IStockLoanDocument, {}, {}> & IStockLoanDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=StockLoan.d.ts.map