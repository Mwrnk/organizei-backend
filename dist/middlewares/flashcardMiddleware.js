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
exports.validateFlashcardUpdateData = exports.validateFlashcardReviewData = exports.validateFlashcardData = exports.validateFlashcardWithAIData = exports.checkFlashcardOwnership = exports.checkFlashcardById = void 0;
const errorHandler_1 = require("./errorHandler");
const flashcard_1 = require("../models/flashcard");
const card_1 = require("../models/card");
const checkFlashcardById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new errorHandler_1.AppError("ID inválido", 400);
        }
        const flashcard = yield flashcard_1.Flashcard.findById(id)
            .populate({
            path: "tags"
        });
        if (!flashcard) {
            throw new errorHandler_1.AppError("Flashcard não encontrado", 404);
        }
        req.flashcard = flashcard;
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            throw error;
        }
        throw new errorHandler_1.AppError("Erro ao verificar cartão", 500);
    }
});
exports.checkFlashcardById = checkFlashcardById;
const checkFlashcardOwnership = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const flashcard = req.flashcard;
        if (!userId) {
            throw new errorHandler_1.AppError("Usuário não autenticado", 401);
        }
        if (((_b = flashcard === null || flashcard === void 0 ? void 0 : flashcard.userId) === null || _b === void 0 ? void 0 : _b.toString()) !== userId) {
            throw new errorHandler_1.AppError("Você não tem permissão para realizar esta ação", 403);
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.checkFlashcardOwnership = checkFlashcardOwnership;
const validateFlashcardWithAIData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cardId, amount } = req.body;
        if (!cardId || !amount) {
            throw new errorHandler_1.AppError("O ID do card e a quantidade a gerar são obrigatórios", 400);
        }
        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || !Number.isInteger(parsedAmount) || parsedAmount < 1 || parsedAmount > 10) {
            throw new errorHandler_1.AppError("A quantidade a gerar deve ser um número inteiro entre 1 e 10", 400);
        }
        if (!cardId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new errorHandler_1.AppError("ID do card é inválido", 400);
        }
        const card = yield card_1.Card.findById(cardId);
        if (!card) {
            throw new errorHandler_1.AppError("Card não encontrado", 404);
        }
        req.card = card;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateFlashcardWithAIData = validateFlashcardWithAIData;
const validateFlashcardData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cardId, front, back, tags } = req.body;
        if (!cardId || !front || !back || !tags) {
            throw new errorHandler_1.AppError("O ID do card, front e back do flashcard e pelo menos 1 tag são obrigatórios", 400);
        }
        if (tags.length === 0) {
            throw new errorHandler_1.AppError("O array de tags esta vazio", 400);
        }
        const tagsIds = tags.map((tagId) => {
            if (!tagId.match(/^[0-9a-fA-F]{24}$/)) {
                throw new errorHandler_1.AppError("ID de uma tag é inválido", 400);
            }
            return tagId;
        });
        const foundedTags = yield flashcard_1.Tag.find({ _id: { $in: tagsIds } });
        if (foundedTags.length === 0) {
            throw new errorHandler_1.AppError("Nenhuma tag encontrada", 404);
        }
        if (!cardId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new errorHandler_1.AppError("ID do card é inválido", 400);
        }
        const card = yield card_1.Card.findById(cardId);
        if (!card) {
            throw new errorHandler_1.AppError("Card não encontrado", 404);
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateFlashcardData = validateFlashcardData;
const validateFlashcardReviewData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { grade } = req.body;
        if (!grade) {
            throw new errorHandler_1.AppError("A nota do nível de dificuldadde é obrigatória", 400);
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateFlashcardReviewData = validateFlashcardReviewData;
const validateFlashcardUpdateData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { front, back, tags } = req.body;
        if (!front && !back && !tags) {
            throw new errorHandler_1.AppError("Pelo menos um campo deve ser enviado para atualização", 400);
        }
        if (tags && tags.length === 0) {
            throw new errorHandler_1.AppError("O array de tags esta vazio", 400);
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateFlashcardUpdateData = validateFlashcardUpdateData;
