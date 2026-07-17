import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getAllShops: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getShopById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMyShop: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createShop: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateShop: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleOpen: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=shopController.d.ts.map