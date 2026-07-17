"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccessibility = exports.getMe = exports.logout = exports.refreshToken = exports.login = exports.registerVendor = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const Shop_1 = require("../models/Shop");
const env_1 = require("../config/env");
const errorHandler_1 = require("../middleware/errorHandler");
const signAccessToken = (id, role, email) => jsonwebtoken_1.default.sign({ id, role, email }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
const signRefreshToken = (id) => jsonwebtoken_1.default.sign({ id }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN });
const cookieOptions = {
    httpOnly: true,
    secure: env_1.env.isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
// POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;
        const existing = await User_1.User.findOne({ email });
        if (existing) {
            throw errorHandler_1.ApiError.conflict('An account with this email already exists.', 'EMAIL_TAKEN');
        }
        const user = await User_1.User.create({
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
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
// POST /api/auth/register-vendor
const registerVendor = async (req, res, next) => {
    try {
        const { name, email, password, phone, shopName, shopDescription, shopCategory, area, lat, lng } = req.body;
        const existing = await User_1.User.findOne({ email });
        if (existing) {
            throw errorHandler_1.ApiError.conflict('An account with this email already exists.', 'EMAIL_TAKEN');
        }
        const user = await User_1.User.create({
            name,
            email,
            passwordHash: password,
            role: 'vendor',
            phone,
        });
        const shop = await Shop_1.Shop.create({
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
    }
    catch (err) {
        next(err);
    }
};
exports.registerVendor = registerVendor;
// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email }).select('+passwordHash');
        if (!user) {
            throw errorHandler_1.ApiError.unauthorized('Invalid email or password.');
        }
        const match = await user.comparePassword(password);
        if (!match) {
            throw errorHandler_1.ApiError.unauthorized('Invalid email or password.');
        }
        const accessToken = signAccessToken(user.id, user.role, user.email);
        const refreshToken = signRefreshToken(user.id);
        res.cookie('refreshToken', refreshToken, cookieOptions);
        res.json({
            success: true,
            data: { accessToken, user: user.toJSON() },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
// POST /api/auth/refresh
const refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token)
            throw errorHandler_1.ApiError.unauthorized('No refresh token provided.');
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
        const user = await User_1.User.findById(decoded.id);
        if (!user)
            throw errorHandler_1.ApiError.unauthorized('User not found.');
        const accessToken = signAccessToken(user.id, user.role, user.email);
        res.json({ success: true, data: { accessToken } });
    }
    catch (err) {
        next(err);
    }
};
exports.refreshToken = refreshToken;
// POST /api/auth/logout
const logout = async (_req, res) => {
    res.clearCookie('refreshToken', cookieOptions);
    res.json({ success: true, data: { message: 'Logged out successfully.' } });
};
exports.logout = logout;
// GET /api/auth/me
const getMe = async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.id);
        if (!user)
            throw errorHandler_1.ApiError.notFound('User not found.');
        res.json({ success: true, data: { user: user.toJSON() } });
    }
    catch (err) {
        next(err);
    }
};
exports.getMe = getMe;
// PATCH /api/auth/me/accessibility
const updateAccessibility = async (req, res, next) => {
    try {
        const { highContrast, largeText, voiceEnabled } = req.body;
        const user = await User_1.User.findByIdAndUpdate(req.user.id, { $set: { accessibilityPrefs: { highContrast, largeText, voiceEnabled } } }, { new: true });
        res.json({ success: true, data: { user: user?.toJSON() } });
    }
    catch (err) {
        next(err);
    }
};
exports.updateAccessibility = updateAccessibility;
//# sourceMappingURL=authController.js.map