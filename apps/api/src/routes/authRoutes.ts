import { Router } from 'express';
import { body } from 'express-validator';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';
import {
  register,
  registerVendor,
  login,
  refreshToken,
  logout,
  getMe,
  updateAccessibility,
} from '../controllers/authController';

const router = Router();

// POST /api/auth/register — Public, rate limited
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  ],
  register
);

// POST /api/auth/register-vendor — Public, rate limited
router.post(
  '/register-vendor',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
    body('shopName').trim().notEmpty().withMessage('Shop name is required.'),
    body('shopCategory').notEmpty().withMessage('Shop category is required.'),
    body('area').trim().notEmpty().withMessage('Area is required.'),
  ],
  registerVendor
);

// POST /api/auth/login — Public, rate limited
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  login
);

// POST /api/auth/refresh — Public
router.post('/refresh', refreshToken);

// POST /api/auth/logout — Public
router.post('/logout', logout);

// GET /api/auth/me — Requires: authenticate
router.get('/me', authenticate, getMe);

// PATCH /api/auth/me/accessibility — Requires: authenticate
router.patch('/me/accessibility', authenticate, updateAccessibility);

export default router;
