import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFlashDemandEventDocument extends Document {
  productCategory: string;
  area: string;
  demandScore: number;
  triggeredAt: Date;
  routedOrders: Types.ObjectId[];
  notifiedShopIds: Types.ObjectId[];
}

const flashDemandSchema = new Schema<IFlashDemandEventDocument>(
  {
    productCategory: { type: String, required: true, index: true },
    area: { type: String, required: true, index: true },
    demandScore: { type: Number, required: true },
    triggeredAt: { type: Date, default: Date.now },
    routedOrders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
    notifiedShopIds: [{ type: Schema.Types.ObjectId, ref: 'Shop' }],
  },
  { timestamps: false }
);

flashDemandSchema.index({ area: 1, triggeredAt: -1 });

export const FlashDemandEvent = mongoose.model<IFlashDemandEventDocument>(
  'FlashDemandEvent',
  flashDemandSchema
);

// ─── In-memory demand counter for rolling 10-minute window ───────────────────

interface DemandCountEntry {
  count: number;
  windowStart: number;
  shopIds: Set<string>;
}

export const demandCounters = new Map<string, DemandCountEntry>();

export function trackDemand(
  category: string,
  area: string,
  shopId: string
): { count: number; triggered: boolean } {
  const key = `${category}:${area}`;
  const now = Date.now();
  const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
  const TRIGGER_THRESHOLD = 8; // searches to trigger flash demand

  let entry = demandCounters.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    entry = { count: 0, windowStart: now, shopIds: new Set() };
    demandCounters.set(key, entry);
  }

  entry.count += 1;
  entry.shopIds.add(shopId);

  const triggered = entry.count >= TRIGGER_THRESHOLD;
  return { count: entry.count, triggered };
}
