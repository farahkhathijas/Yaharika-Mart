"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketIO = initSocketIO;
exports.getIO = getIO;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
let io;
function initSocketIO(httpServer) {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.env.CLIENT_URL,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            // Allow unauthenticated connections (for public product rooms)
            socket.userId = 'anonymous';
            return next();
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            next();
        }
        catch {
            // Still allow, but without user context
            socket.userId = 'anonymous';
            next();
        }
    });
    io.on('connection', (socket) => {
        logger_1.logger.debug(`Socket connected: ${socket.id} (user: ${socket.userId ?? 'anon'})`);
        // ─── Room Subscriptions ───────────────────────────────────────────────────
        socket.on('join:product', (productId) => {
            socket.join(`product:${productId}`);
            logger_1.logger.debug(`Socket ${socket.id} joined product:${productId}`);
        });
        socket.on('leave:product', (productId) => {
            socket.leave(`product:${productId}`);
        });
        socket.on('join:shop', (shopId) => {
            // Only vendors/admins should join shop rooms
            if (socket.userRole === 'vendor' || socket.userRole === 'admin') {
                socket.join(`shop:${shopId}`);
                logger_1.logger.debug(`Socket ${socket.id} joined shop:${shopId}`);
            }
        });
        socket.on('join:area', (area) => {
            socket.join(`area:${area}`);
        });
        socket.on('join:user', () => {
            if (socket.userId && socket.userId !== 'anonymous') {
                socket.join(`user:${socket.userId}`);
                logger_1.logger.debug(`Socket ${socket.id} joined user:${socket.userId}`);
            }
        });
        socket.on('disconnect', () => {
            logger_1.logger.debug(`Socket disconnected: ${socket.id}`);
        });
    });
    logger_1.logger.info('Socket.IO server initialized');
    return io;
}
function getIO() {
    if (!io) {
        throw new Error('Socket.IO not initialized. Call initSocketIO first.');
    }
    return io;
}
//# sourceMappingURL=index.js.map