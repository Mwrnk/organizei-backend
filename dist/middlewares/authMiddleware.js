"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const errorHandler_1 = require("./errorHandler");
const tokenManager_1 = require("../utils/tokenManager");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new errorHandler_1.AppError("Token não fornecido", 401);
        }
        //   const [token] = authHeader.split(' '); <- antes estava assim
        let token = authHeader;
        // Se o header vier no formato "Bearer <token>", extrai só o token
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
        if (!token) {
            throw new errorHandler_1.AppError("Token mal formatado", 401);
        }
        const decoded = (0, tokenManager_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            throw error;
        }
        throw new errorHandler_1.AppError("Erro na autenticação", 401);
    }
};
exports.authMiddleware = authMiddleware;
