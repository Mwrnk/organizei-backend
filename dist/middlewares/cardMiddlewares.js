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
exports.validateLikeOperation = exports.checkCardOwnership = exports.checkCardIsPublished = exports.checkCardByTitle = exports.checkCardById = exports.validateCardUpdateData = exports.validateCardData = void 0;
const card_1 = require("../models/card");
const list_1 = require("../models/list");
const errorHandler_1 = require("./errorHandler");
const validateCardData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, listId, priority } = req.body;
        if (!title || !listId) {
            throw new errorHandler_1.AppError("O título e o ID da lista são obrigatórios", 400);
        }
        // Validação do título
        if (title.length < 3 || title.length > 100) {
            throw new errorHandler_1.AppError("O título deve ter entre 3 e 100 caracteres", 400);
        }
        // Validação do listId
        if (!listId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new errorHandler_1.AppError("ID da lista inválido", 400);
        }
        // Verificar se a lista existe
        const list = yield list_1.List.findById(listId);
        if (!list) {
            throw new errorHandler_1.AppError("Lista não encontrada", 404);
        }
        // Validação da prioridade se fornecida
        if (priority && !["Baixa", "Média", "Alta"].includes(priority)) {
            throw new errorHandler_1.AppError("Prioridade inválida. Use: Baixa, Média ou Alta", 400);
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateCardData = validateCardData;
const validateCardUpdateData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, priority, is_published, image_url, listId } = req.body;
        if (!title && !priority && !is_published && !image_url && !listId) {
            throw new errorHandler_1.AppError("Pelo menos um campo deve ser enviado para atualização", 400);
        }
        // Validação do título se fornecido
        if (title && (title.length < 3 || title.length > 100)) {
            throw new errorHandler_1.AppError("O título deve ter entre 3 e 100 caracteres", 400);
        }
        // Validação da prioridade se fornecida
        if (priority && !["Baixa", "Média", "Alta"].includes(priority)) {
            throw new errorHandler_1.AppError("Prioridade inválida. Use: Baixa, Média ou Alta", 400);
        }
        // Validação do is_published se fornecido
        if (is_published !== undefined && typeof is_published !== "boolean") {
            throw new errorHandler_1.AppError("is_published deve ser um valor booleano", 400);
        }
        // Validação do listId se fornecido
        if (listId) {
            if (!listId.match(/^[0-9a-fA-F]{24}$/)) {
                throw new errorHandler_1.AppError("ID da lista inválido", 400);
            }
            // Verificar se a lista existe
            const list = yield list_1.List.findById(listId);
            if (!list) {
                throw new errorHandler_1.AppError("Lista não encontrada", 404);
            }
        }
        // Validação das URLs das imagens se fornecidas
        if (image_url) {
            if (!Array.isArray(image_url)) {
                throw new errorHandler_1.AppError("image_url deve ser um array de URLs", 400);
            }
            const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
            for (const url of image_url) {
                if (!urlRegex.test(url)) {
                    throw new errorHandler_1.AppError("URL de imagem inválida", 400);
                }
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateCardUpdateData = validateCardUpdateData;
const checkCardById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new errorHandler_1.AppError("ID inválido", 400);
        }
        const card = yield card_1.Card.findById(id);
        if (!card) {
            throw new errorHandler_1.AppError("Cartão não encontrado", 404);
        }
        req.card = card;
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            next(error);
            return;
        }
        console.error("Erro no middleware checkCardById:", error);
        next(new errorHandler_1.AppError("Erro ao verificar cartão", 500));
    }
});
exports.checkCardById = checkCardById;
const checkCardByTitle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title } = req.params;
        if (!title) {
            throw new errorHandler_1.AppError("Título é obrigatório", 400);
        }
        const card = yield card_1.Card.findOne({ title }, { "pdfs.data": 0 });
        if (!card) {
            throw new errorHandler_1.AppError("Cartão não encontrado", 404);
        }
        req.card = card;
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            next(error);
            return;
        }
        console.error("Erro no middleware checkCardByTitle:", error);
        next(new errorHandler_1.AppError("Erro ao verificar cartão", 500));
    }
});
exports.checkCardByTitle = checkCardByTitle;
const checkCardIsPublished = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const card = req.card;
        if (card.publishedAt && card.expiresAt) {
            const expiresAt = new Date(card.expiresAt);
            if (!isNaN(expiresAt.getTime()) && new Date() > expiresAt) {
                throw new errorHandler_1.AppError("Esta publicação expirou", 403);
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.checkCardIsPublished = checkCardIsPublished;
const checkCardOwnership = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const isAdmin = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === "admin";
        const card = req.card;
        if (!userId) {
            throw new errorHandler_1.AppError("Usuário não autenticado", 401);
        }
        if (!card) {
            throw new errorHandler_1.AppError("Card não encontrado", 404);
        }
        // Se não for admin, só pode manipular seus próprios cards
        if (!isAdmin && ((_c = card === null || card === void 0 ? void 0 : card.userId) === null || _c === void 0 ? void 0 : _c.toString()) !== userId) {
            throw new errorHandler_1.AppError("Você não tem permissão para realizar esta ação", 403);
        }
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            next(error);
            return;
        }
        console.error("Erro no middleware checkCardOwnership:", error);
        next(new errorHandler_1.AppError("Erro interno do servidor", 500));
    }
});
exports.checkCardOwnership = checkCardOwnership;
const validateLikeOperation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const card = req.card;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            throw new errorHandler_1.AppError("Usuário não autenticado", 401);
        }
        // Verifica se o card está publicado
        if (!card.is_published) {
            throw new errorHandler_1.AppError("Este card não está disponível para curtidas", 403);
        }
        // Verifica se o usuário está tentando curtir seu próprio card
        if (card.userId.toString() === userId) {
            throw new errorHandler_1.AppError("Você não pode curtir seu próprio card", 403);
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateLikeOperation = validateLikeOperation;
