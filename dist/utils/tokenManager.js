"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../middlewares/errorHandler");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const generateToken = (userId, email, expiresIn = '24h') => {
    try {
        return jsonwebtoken_1.default.sign({ id: userId, email }, JWT_SECRET, { expiresIn });
    }
    catch (error) {
        throw new errorHandler_1.AppError('Erro ao gerar token', 500);
    }
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new errorHandler_1.AppError('Token expirado', 401);
        }
        throw new errorHandler_1.AppError('Token inválido', 401);
    }
};
exports.verifyToken = verifyToken;
