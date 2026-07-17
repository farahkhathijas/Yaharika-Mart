import mongoose, { Document, Schema, Types } from 'mongoose';
import { NotificationType } from '@yaharika/shared-types';

export interface INotificationDocument extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'order_status', 'swap_matched', 'swap_completed', 'loan_overdue',
        'flash_demand', 'group_buy_success', 'group_buy_failed', 'stock_low', 'general',
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.model<INotificationDocument>(
  'Notification',
  notificationSchema
);
