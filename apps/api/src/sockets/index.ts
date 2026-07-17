import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../utils/logger';

let io: SocketIOServer;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      // Allow unauthenticated connections (for public product rooms)
      (socket as Socket & { userId?: string; userRole?: string }).userId = 'anonymous';
      return next();
    }
    try {
      const decoded = jwt.verify(token as string, env.JWT_SECRET) as {
        id: string;
        role: string;
      };
      (socket as Socket & { userId?: string; userRole?: string }).userId = decoded.id;
      (socket as Socket & { userId?: string; userRole?: string }).userRole = decoded.role;
      next();
    } catch {
      // Still allow, but without user context
      (socket as Socket & { userId?: string; userRole?: string }).userId = 'anonymous';
      next();
    }
  });

  io.on('connection', (socket: Socket & { userId?: string; userRole?: string }) => {
    logger.debug(`Socket connected: ${socket.id} (user: ${socket.userId ?? 'anon'})`);

    // ─── Room Subscriptions ───────────────────────────────────────────────────

    socket.on('join:product', (productId: string) => {
      socket.join(`product:${productId}`);
      logger.debug(`Socket ${socket.id} joined product:${productId}`);
    });

    socket.on('leave:product', (productId: string) => {
      socket.leave(`product:${productId}`);
    });

    socket.on('join:shop', (shopId: string) => {
      // Only vendors/admins should join shop rooms
      if (socket.userRole === 'vendor' || socket.userRole === 'admin') {
        socket.join(`shop:${shopId}`);
        logger.debug(`Socket ${socket.id} joined shop:${shopId}`);
      }
    });

    socket.on('join:area', (area: string) => {
      socket.join(`area:${area}`);
    });

    socket.on('join:user', () => {
      if (socket.userId && socket.userId !== 'anonymous') {
        socket.join(`user:${socket.userId}`);
        logger.debug(`Socket ${socket.id} joined user:${socket.userId}`);
      }
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  logger.info('Socket.IO server initialized');
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSocketIO first.');
  }
  return io;
}
