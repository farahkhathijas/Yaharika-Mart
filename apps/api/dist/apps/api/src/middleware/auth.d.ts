import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@yaharika/shared-types';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: UserRole;
        email: string;
    };
}
/**
 * Verifies the JWT access token from the Authorization header.
 * Attaches decoded user info to req.user.
 */
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Role-based access guard. Use after authenticate middleware.
 * @example router.get('/admin', authenticate, roleGuard('admin'), handler)
 */
export declare const roleGuard: (...roles: UserRole[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map