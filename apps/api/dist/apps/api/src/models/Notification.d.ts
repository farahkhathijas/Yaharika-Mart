import mongoose, { Document, Types } from 'mongoose';
import { NotificationType } from '@yaharika/shared-types';
export interface INotificationDocument extends Document {
    userId: Types.ObjectId;
    type: NotificationType;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: Date;
}
export declare const Notification: mongoose.Model<INotificationDocument, {}, {}, {}, mongoose.Document<unknown, {}, INotificationDocument, {}, {}> & INotificationDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.d.ts.map