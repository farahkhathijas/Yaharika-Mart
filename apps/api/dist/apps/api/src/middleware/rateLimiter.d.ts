/**
 * Strict rate limiter for auth endpoints (login, register).
 * 10 requests per 15 minutes per IP.
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * General API limiter.
 * 200 requests per 15 minutes per IP.
 */
export declare const generalLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimiter.d.ts.map