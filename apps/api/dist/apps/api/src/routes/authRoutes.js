"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const rateLimiter_1 = require("../middleware/rateLimiter");
const auth_1 = require("../middleware/auth");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// POST /api/auth/register — Public, rate limited
router.post('/register', rateLimiter_1.authLimiter, [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required.'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
], authController_1.register);
// POST /api/auth/register-vendor — Public, rate limited
router.post('/register-vendor', rateLimiter_1.authLimiter, [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required.'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
    (0, express_validator_1.body)('shopName').trim().notEmpty().withMessage('Shop name is required.'),
    (0, express_validator_1.body)('shopCategory').notEmpty().withMessage('Shop category is required.'),
    (0, express_validator_1.body)('area').trim().notEmpty().withMessage('Area is required.'),
], authController_1.registerVendor);
// POST /api/auth/login — Public, rate limited
router.post('/login', rateLimiter_1.authLimiter, [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required.'),
], authController_1.login);
// POST /api/auth/refresh — Public
router.post('/refresh', authController_1.refreshToken);
// POST /api/auth/logout — Public
router.post('/logout', authController_1.logout);
// GET /api/auth/me — Requires: authenticate
router.get('/me', auth_1.authenticate, authController_1.getMe);
// PATCH /api/auth/me/accessibility — Requires: authenticate
router.patch('/me/accessibility', auth_1.authenticate, authController_1.updateAccessibility);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map