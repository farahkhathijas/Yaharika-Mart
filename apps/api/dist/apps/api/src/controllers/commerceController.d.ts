import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getGroupBuys: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getGroupBuyById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const joinGroupBuy: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createGroupBuy: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getDealsRadar: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createDeal: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getZeroWasteListings: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createZeroWasteListing: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=commerceController.d.ts.map