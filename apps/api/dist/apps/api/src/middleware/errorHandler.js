"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
/**
 * Global Express error handler.
 * Never leaks stack traces in production.
 */
const errorHandler = (err, req, res, _next) => {
    const statusCode = err.statusCode ?? 500;
    const code = err.code ?? 'INTERNAL_SERVER_ERROR';
    logger_1.logger.error(`${req.method} ${req.path} → ${statusCode}: ${err.message}`, {
        stack: env_1.env.isDevelopment ? err.stack : undefined,
    });
    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message: env_1.env.isProduction && statusCode === 500
                ? 'An unexpected error occurred. Please try again later.'
                : err.message,
        },
    });
};
exports.errorHandler = errorHandler;
class ApiError extends Error {
    statusCode;
    code;
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
    static notFound(message = 'Resource not found') {
        return new ApiError(message, 404, 'NOT_FOUND');
    }
    static unauthorized(message = 'Unauthorized') {
        return new ApiError(message, 401, 'UNAUTHORIZED');
    }
    static forbidden(message = 'Forbidden') {
        return new ApiError(message, 403, 'FORBIDDEN');
    }
    static badRequest(message, code = 'BAD_REQUEST') {
        return new ApiError(message, 400, code);
    }
    static conflict(message, code = 'CONFLICT') {
        return new ApiError(message, 409, code);
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=errorHandler.js.map