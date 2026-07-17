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
Object.defineProperty(exports, "__esModule", { value: true });
exports.demandCounters = exports.FlashDemandEvent = void 0;
exports.trackDemand = trackDemand;
const mongoose_1 = __importStar(require("mongoose"));
const flashDemandSchema = new mongoose_1.Schema({
    productCategory: { type: String, required: true, index: true },
    area: { type: String, required: true, index: true },
    demandScore: { type: Number, required: true },
    triggeredAt: { type: Date, default: Date.now },
    routedOrders: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Order' }],
    notifiedShopIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Shop' }],
}, { timestamps: false });
flashDemandSchema.index({ area: 1, triggeredAt: -1 });
exports.FlashDemandEvent = mongoose_1.default.model('FlashDemandEvent', flashDemandSchema);
exports.demandCounters = new Map();
function trackDemand(category, area, shopId) {
    const key = `${category}:${area}`;
    const now = Date.now();
    const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
    const TRIGGER_THRESHOLD = 8; // searches to trigger flash demand
    let entry = exports.demandCounters.get(key);
    if (!entry || now - entry.windowStart > WINDOW_MS) {
        entry = { count: 0, windowStart: now, shopIds: new Set() };
        exports.demandCounters.set(key, entry);
    }
    entry.count += 1;
    entry.shopIds.add(shopId);
    const triggered = entry.count >= TRIGGER_THRESHOLD;
    return { count: entry.count, triggered };
}
//# sourceMappingURL=FlashDemandEvent.js.map