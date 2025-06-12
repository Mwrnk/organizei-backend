"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCardOwnership = exports.checkCardIsPublished = exports.checkCardExists = exports.validatePublishData = void 0;
const card_1 = require("../models/card");
const errorHandler_1 = require("./errorHandler");
const validatePublishData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        if (!id) {
            throw new errorHandler_1.AppError("ID do card é obrigatório", 400);
        }
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new errorHandler_1.AppError("ID inválido", 400);
        }
        // Verificar se o card existe e está pronto para publicação
        const card = yield card_1.Card.findById(id);
        if (!card) {
            throw new errorHandler_1.AppError("Card não encontrado", 404);
        }
        if (card.is_published) {
            throw new errorHandler_1.AppError("Este card já está publicado", 400);
        }
        // Validar campos obrigatórios para publicação
        if (!card.title || card.title.length < 3) {
            throw new errorHandler_1.AppError("O título do card é obrigatório e deve ter pelo menos 3 caracteres", 400);
        }
        if (!card.priority) {
            throw new errorHandler_1.AppError("A prioridade do card é obrigatória", 400);
        }
        // Verificar se o usuário tem permissão para publicar
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            throw new errorHandler_1.AppError("Usuário não autenticado", 401);
        }
        if (!(card === null || card === void 0 ? void 0 : card.userId) || card.userId.toString() !== userId) {
            throw new errorHandler_1.AppError("Você não tem permissão para realizar esta ação", 403);
        }
        req.card = card;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validatePublishData = validatePublishData;
const checkCardExists = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new errorHandler_1.AppError("ID inválido", 400);
        }
        const card = yield card_1.Card.findById(id);
        if (!card) {
            throw new errorHandler_1.AppError("Card não encontrado", 404);
        }
        req.card = card;
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            throw error;
        }
        throw new errorHandler_1.AppError("Erro ao verificar card", 500);
    }
});
exports.checkCardExists = checkCardExists;
const checkCardIsPublished = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const card = req.card;
        if (!card) {
            throw new errorHandler_1.AppError("Card não encontrado", 404);
        }
        if (!card.is_published) {
            throw new errorHandler_1.AppError("Card não está publicado", 403);
        }
        // Verificar se a publicação não expirou (se houver data de expiração)
        if (card.publishedAt && card.expiresAt && new Date() > card.expiresAt) {
            throw new errorHandler_1.AppError("Esta publicação expirou", 403);
        }
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            throw error;
        }
        throw new errorHandler_1.AppError("Erro ao verificar status de publicação do card", 500);
    }
});
exports.checkCardIsPublished = checkCardIsPublished;
const checkCardOwnership = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const card = req.card;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            throw new errorHandler_1.AppError("Usuário não autenticado", 401);
        }
        if (!card) {
            throw new errorHandler_1.AppError("Card não encontrado", 404);
        }
        if (!(card === null || card === void 0 ? void 0 : card.userId) || card.userId.toString() !== userId) {
            throw new errorHandler_1.AppError("Você não tem permissão para realizar esta ação", 403);
        }
        // Verificar se o usuário tem permissão de administrador
        const isAdmin = req.user && req.user.role === "admin";
        if (!isAdmin && card.userId.toString() !== userId) {
            throw new errorHandler_1.AppError("Você não tem permissão para realizar esta ação", 403);
        }
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            throw error;
        }
        throw new errorHandler_1.AppError("Erro ao verificar propriedade do card", 500);
    }
});
exports.checkCardOwnership = checkCardOwnership;
