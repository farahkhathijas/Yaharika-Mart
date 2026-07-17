"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = exports.app = void 0;
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const sockets_1 = require("./sockets");
const cronJobs_1 = require("./jobs/cronJobs");
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const shopRoutes_1 = __importDefault(require("./routes/shopRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const collaborationRoutes_1 = __importDefault(require("./routes/collaborationRoutes"));
const featureRoutes_1 = __importDefault(require("./routes/featureRoutes"));
const productRoutes_2 = require("./routes/productRoutes");
const app = (0, express_1.default)();
exports.app = app;
const httpServer = http_1.default.createServer(app);
exports.httpServer = httpServer;
// ─── Security Middleware ──────────────────────────────────────────────────────
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use((0, cors_1.default)({
    origin: env_1.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use(rateLimiter_1.generalLimiter);
// ─── Request Logging ──────────────────────────────────────────────────────────
app.use((req, _res, next) => {
    logger_1.logger.debug(`→ ${req.method} ${req.path}`);
    next();
});
// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env_1.env.NODE_ENV });
});
// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes_1.default);
app.use('/api/shops', shopRoutes_1.default);
app.use('/api/shops/:shopId/products', productRoutes_2.shopProductsRouter);
app.use('/api/products', productRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api', collaborationRoutes_1.default);
app.use('/api', featureRoutes_1.default);
// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Route not found.' },
    });
});
// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler_1.errorHandler);
// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap() {
    await (0, db_1.connectDB)();
    (0, sockets_1.initSocketIO)(httpServer);
    (0, cronJobs_1.startAllCronJobs)();
    httpServer.listen(env_1.env.PORT, () => {
        logger_1.logger.info(`🚀 Yaharika Mart API running on port ${env_1.env.PORT} [${env_1.env.NODE_ENV}]`);
    });
}
bootstrap().catch((err) => {
    logger_1.logger.error('Failed to start server:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map