import mongoose, { Document, Schema, Types } from 'mongoose';
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

const stockLoanSchema = new Schema<IStockLoanDocument>(
  {
    borrowingShopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    lendingShopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    qtyBorrowed: { type: Number, required: true, min: 1 },
    agreedReturnDate: { type: Date, required: true },
    returnStatus: {
      type: String,
      enum: ['pending', 'returned', 'overdue'],
      default: 'pending',
      index: true,
    },
    interestType: {
      type: String,
      enum: ['free', 'replacement', 'revenue-share'],
      required: true,
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export const StockLoan = mongoose.model<IStockLoanDocument>('StockLoan', stockLoanSchema);
