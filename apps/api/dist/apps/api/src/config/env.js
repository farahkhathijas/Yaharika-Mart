"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env from root monorepo directory
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
dotenv_1.default.config();
function required(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
function optional(key, fallback) {
    return process.env[key] ?? fallback;
}
exports.env = {
    NODE_ENV: optional('NODE_ENV', 'development'),
    PORT: parseInt(optional('PORT', '5000'), 10),
    MONGO_URI: optional('MONGO_URI', 'mongodb://localhost:27017/yaharika-mart'),
    JWT_SECRET: optional('JWT_SECRET', 'dev_jwt_secret_32chars_change_in_prod'),
    JWT_REFRESH_SECRET: optional('JWT_REFRESH_SECRET', 'dev_refresh_secret_32chars_change'),
    JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '15m'),
    JWT_REFRESH_EXPIRES_IN: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
    CLIENT_URL: optional('CLIENT_URL', 'http://localhost:3000'),
    CLOUDINARY_CLOUD_NAME: optional('CLOUDINARY_CLOUD_NAME', ''),
    CLOUDINARY_API_KEY: optional('CLOUDINARY_API_KEY', ''),
    CLOUDINARY_API_SECRET: optional('CLOUDINARY_API_SECRET', ''),
    isProduction: optional('NODE_ENV', 'development') === 'production',
    isDevelopment: optional('NODE_ENV', 'development') === 'development',
};
//# sourceMappingURL=env.js.map