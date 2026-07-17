import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getProductsByShop: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getProductById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const searchProducts: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createProduct: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProduct: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateStock: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateWalkInReserve: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteProduct: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=productController.d.ts.map