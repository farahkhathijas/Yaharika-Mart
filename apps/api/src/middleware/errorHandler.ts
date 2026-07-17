import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { env } from '../config/env';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Global Express error handler.
 * Never leaks stack traces in production.
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_SERVER_ERROR';

  logger.error(`${req.method} ${req.path} → ${statusCode}: ${err.message}`, {
    stack: env.isDevelopment ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: env.isProduction && statusCode === 500
        ? 'An unexpected error occurred. Please try again later.'
        : err.message,
    },
  });
};

export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(message, 404, 'NOT_FOUND');
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(message, 403, 'FORBIDDEN');
  }

  static badRequest(message: string, code = 'BAD_REQUEST'): ApiError {
    return new ApiError(message, 400, code);
  }

  static conflict(message: string, code = 'CONFLICT'): ApiError {
    return new ApiError(message, 409, code);
  }
}
