import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getPlatformStats: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAnalyticsTrend: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllVendors: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getVendorInsights: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getNotifications: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const markNotificationRead: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=analyticsController.d.ts.map