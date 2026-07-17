import mongoose, { Document } from 'mongoose';
import { UserRole, AccessibilityPrefs, Address } from '@yaharika/shared-types';
export interface IUserDocument extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    phone?: string;
    address?: Address;
    accessibilityPrefs: AccessibilityPrefs;
    createdAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUserDocument, {}, {}, {}, mongoose.Document<unknown, {}, IUserDocument, {}, {}> & IUserDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map