"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const addressSchema = new mongoose_1.Schema({
    line1: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
}, { _id: false });
const accessibilityPrefsSchema = new mongoose_1.Schema({
    highContrast: { type: Boolean, default: false },
    largeText: { type: Boolean, default: false },
    voiceEnabled: { type: Boolean, default: false },
}, { _id: false });
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ['customer', 'vendor', 'admin'],
        required: true,
        default: 'customer',
    },
    phone: { type: String, trim: true },
    address: addressSchema,
    accessibilityPrefs: {
        type: accessibilityPrefsSchema,
        default: () => ({ highContrast: false, largeText: false, voiceEnabled: false }),
    },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    toJSON: {
        transform(_doc, ret) {
            delete ret.passwordHash;
            return ret;
        },
    },
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash'))
        return next();
    if (!this.passwordHash.startsWith('$2b$')) {
        this.passwordHash = await bcrypt_1.default.hash(this.passwordHash, 12);
    }
    next();
});
userSchema.methods.comparePassword = async function (candidate) {
    return bcrypt_1.default.compare(candidate, this.passwordHash);
};
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map