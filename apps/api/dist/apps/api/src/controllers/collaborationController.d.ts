import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createSwapRequest: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getSwapRequests: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const acceptSwap: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const completeSwap: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createLoan: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getLoans: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const returnLoan: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=collaborationController.d.ts.map