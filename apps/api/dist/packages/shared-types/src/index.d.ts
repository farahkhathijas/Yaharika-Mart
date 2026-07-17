export type UserRole = 'customer' | 'vendor' | 'admin';
export interface AccessibilityPrefs {
    highContrast: boolean;
    largeText: boolean;
    voiceEnabled: boolean;
}
export interface Address {
    line1: string;
    area: string;
    city: string;
    pincode: string;
    lat: number;
    lng: number;
}
export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    address?: Address;
    accessibilityPrefs: AccessibilityPrefs;
    createdAt: string;
}
export interface AuthTokens {
    accessToken: string;
}
export interface LoginPayload {
    email: string;
    password: string;
}
export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'customer' | 'vendor';
}
export interface VendorRegisterPayload extends RegisterPayload {
    shopName: string;
    shopDescription: string;
    shopCategory: string;
    area: string;
    lat: number;
    lng: number;
}
export interface IShop {
    _id: string;
    ownerId: string | IUser;
    name: string;
    description: string;
    category: string;
    logoUrl?: string;
    bannerUrl?: string;
    area: string;
    lat: number;
    lng: number;
    isOpen: boolean;
    rating: number;
    walkInStockLockEnabled: boolean;
    createdAt: string;
}
export interface IProduct {
    _id: string;
    shopId: string | IShop;
    name: string;
    description: string;
    category: string;
    price: number;
    mrp: number;
    unit: string;
    images: string[];
    stock: number;
    reservedStock: number;
    walkInReserve: number;
    lowStockThreshold: number;
    isZeroWasteItem: boolean;
    zeroWasteDiscountPercent: number;
    expiryDate?: string;
    version: number;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}
export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export interface OrderItem {
    productId: string | IProduct;
    name: string;
    qty: number;
    price: number;
}
export interface StatusHistoryEntry {
    status: OrderStatus;
    at: string;
}
export interface IOrder {
    _id: string;
    customerId: string | IUser;
    shopId: string | IShop;
    items: OrderItem[];
    subtotal: number;
    discount: number;
    total: number;
    status: OrderStatus;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    deliveryAddress: Address;
    placedAt: string;
    statusHistory: StatusHistoryEntry[];
}
export type SwapStatus = 'open' | 'matched' | 'in_transit' | 'completed' | 'cancelled';
export interface IStockSwapRequest {
    _id: string;
    requestingShopId: string | IShop;
    fulfillingShopId?: string | IShop;
    productName: string;
    category: string;
    qtyNeeded: number;
    status: SwapStatus;
    matchedProductId?: string | IProduct;
    createdAt: string;
}
export type InterestType = 'free' | 'replacement' | 'revenue-share';
export type ReturnStatus = 'pending' | 'returned' | 'overdue';
export interface IStockLoan {
    _id: string;
    borrowingShopId: string | IShop;
    lendingShopId: string | IShop;
    productId: string | IProduct;
    qtyBorrowed: number;
    agreedReturnDate: string;
    returnStatus: ReturnStatus;
    interestType: InterestType;
    createdAt: string;
}
export interface IFlashDemandEvent {
    _id: string;
    productCategory: string;
    area: string;
    demandScore: number;
    triggeredAt: string;
    routedOrders: string[];
    notifiedShopIds: string[];
}
export type GroupBuyStatus = 'active' | 'succeeded' | 'failed';
export interface GroupBuyParticipant {
    customerId: string | IUser;
    qty: number;
}
export interface IGroupBuyDeal {
    _id: string;
    productId: string | IProduct;
    targetQty: number;
    currentQty: number;
    pricePerUnitAtTarget: number;
    participants: GroupBuyParticipant[];
    expiresAt: string;
    status: GroupBuyStatus;
}
export type DealReason = 'surplus' | 'near-expiry' | 'promo';
export interface IDealsRadarEntry {
    _id: string;
    productId: string | IProduct;
    shopId: string | IShop;
    discountPercent: number;
    reason: DealReason;
    startsAt: string;
    endsAt: string;
}
export interface IZeroWasteListing {
    _id: string;
    productId: string | IProduct;
    shopId: string | IShop;
    originalPrice: number;
    discountedPrice: number;
    expiryDate: string;
    qtyAvailable: number;
}
export type NotificationType = 'order_status' | 'swap_matched' | 'swap_completed' | 'loan_overdue' | 'flash_demand' | 'group_buy_success' | 'group_buy_failed' | 'stock_low' | 'general';
export interface INotification {
    _id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
}
export interface PlatformStats {
    totalShops: number;
    totalOrders: number;
    totalSwapsCompleted: number;
    kgWasteDiverted: number;
    totalRevenue: number;
    activeGroupBuys: number;
}
export interface VendorInsights {
    totalRevenue: number;
    totalOrders: number;
    topProducts: Array<{
        name: string;
        sold: number;
        revenue: number;
    }>;
    stockoutFrequency: number;
    collaborationScore: number;
    restockSuggestions: Array<{
        productId: string;
        name: string;
        suggestedQty: number;
    }>;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface StockUpdatedPayload {
    productId: string;
    newStock: number;
    reservedStock: number;
}
export interface OrderStatusChangedPayload {
    orderId: string;
    status: OrderStatus;
    at: string;
}
export interface SwapEventPayload {
    swapId: string;
    status: SwapStatus;
    requestingShopId: string;
    fulfillingShopId?: string;
}
export interface GroupBuyProgressPayload {
    dealId: string;
    currentQty: number;
    targetQty: number;
    status: GroupBuyStatus;
}
export interface FlashDemandPayload {
    eventId: string;
    productCategory: string;
    area: string;
    demandScore: number;
}
//# sourceMappingURL=index.d.ts.map