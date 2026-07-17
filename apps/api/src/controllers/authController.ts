import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Shop } from '../models/Shop';
import { env } from '../config/env';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const signAccessToken = (id: string, role: string, email: string) =>
  jwt.sign({ id, role, email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });

const signRefreshToken = (id: string) =>
  jwt.sign({ id }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });

const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/register
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists.', 'EMAIL_TAKEN');
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: 'customer',
      phone,
    });

    const accessToken = signAccessToken(user.id, user.role, user.email);
    const refreshToken = signRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.status(201).json({
      success: true,
      data: { accessToken, user: user.toJSON() },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register-vendor
export const registerVendor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phone, shopName, shopDescription, shopCategory, area, lat, lng } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists.', 'EMAIL_TAKEN');
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: 'vendor',
      phone,
    });

    const shop = await Shop.create({
      ownerId: user._id,
      name: shopName,
      description: shopDescription || '',
      category: shopCategory || 'general',
      area,
      lat: parseFloat(lat) || 12.9716,
      lng: parseFloat(lng) || 77.5946,
    });

    const accessToken = signAccessToken(user.id, user.role, user.email);
    const refreshToken = signRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.status(201).json({
      success: true,
      data: { accessToken, user: user.toJSON(), shop },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const match = await user.comparePassword(password);
    if (!match) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const accessToken = signAccessToken(user.id, user.role, user.email);
    const refreshToken = signRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({
      success: true,
      data: { accessToken, user: user.toJSON() },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw ApiError.unauthorized('No refresh token provided.');

    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) throw ApiError.unauthorized('User not found.');

    const accessToken = signAccessToken(user.id, user.role, user.email);
    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('refreshToken', cookieOptions);
  res.json({ success: true, data: { message: 'Logged out successfully.' } });
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) throw ApiError.notFound('User not found.');
    res.json({ success: true, data: { user: user.toJSON() } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/auth/me/accessibility
export const updateAccessibility = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { highContrast, largeText, voiceEnabled } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { $set: { accessibilityPrefs: { highContrast, largeText, voiceEnabled } } },
      { new: true }
    );
    res.json({ success: true, data: { user: user?.toJSON() } });
  } catch (err) {
    next(err);
  }
};
