"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleGuard = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
/**
 * Verifies the JWT access token from the Authorization header.
 * Attaches decoded user info to req.user.
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: { code: 'NO_TOKEN', message: 'Authentication token required.' },
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                error: { code: 'TOKEN_EXPIRED', message: 'Access token has expired. Please refresh.' },
            });
        }
        else {
            res.status(401).json({
                success: false,
                error: { code: 'INVALID_TOKEN', message: 'Invalid authentication token.' },
            });
        }
    }
};
exports.authenticate = authenticate;
/**
 * Role-based access guard. Use after authenticate middleware.
 * @example router.get('/admin', authenticate, roleGuard('admin'), handler)
 */
const roleGuard = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' },
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED_ROLE',
                    message: `Access restricted. Required role(s): ${roles.join(', ')}.`,
                },
            });
            return;
        }
        next();
    };
};
exports.roleGuard = roleGuard;
//# sourceMappingURL=auth.js.map