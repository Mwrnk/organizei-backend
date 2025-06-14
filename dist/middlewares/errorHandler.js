"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        return;
    }
    console.error("Erro:", err);
    res.status(500).json({
        status: "error",
        message: "Erro interno do servidor",
    });
};
exports.errorHandler = errorHandler;
