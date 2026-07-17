import { Request, Response, NextFunction } from 'express';
interface AppError extends Error {
    statusCode?: number;
    code?: string;
}
/**
 * Global Express error handler.
 * Never leaks stack traces in production.
 */
export declare const errorHandler: (err: AppError, req: Request, res: Response, _next: NextFunction) => void;
export declare class ApiError extends Error {
    statusCode: number;
    code: string;
    constructor(message: string, statusCode: number, code: string);
    static notFound(message?: string): ApiError;
    static unauthorized(message?: string): ApiError;
    static forbidden(message?: string): ApiError;
    static badRequest(message: string, code?: string): ApiError;
    static conflict(message: string, code?: string): ApiError;
}
export {};
//# sourceMappingURL=errorHandler.d.ts.map