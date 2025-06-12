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
exports.checkQuizSessionOwnership = exports.checkQuizSessionExists = exports.validateQuizAnswerData = exports.validateQuizStartData = void 0;
const errorHandler_1 = require("./errorHandler");
const quiz_1 = require("../models/quiz");
const card_1 = require("../models/card");
const validateQuizStartData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cardId } = req.params;
        if (!cardId || !cardId.match(/^[0-9a-fA-F]{24}$/)) {
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
exports.validateQuizStartData = validateQuizStartData;
const validateQuizAnswerData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sessionId } = req.params;
        const { answer, timeSpent } = req.body;
        if (!sessionId || !sessionId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new errorHandler_1.AppError("ID da sessão é inválido", 400);
        }
        if (typeof answer !== "number" || answer < 0 || answer > 3) {
            throw new errorHandler_1.AppError("Resposta deve ser um número entre 0 e 3", 400);
        }
        if (timeSpent !== undefined && (typeof timeSpent !== "number" || timeSpent < 0)) {
            throw new errorHandler_1.AppError("Tempo gasto deve ser um número positivo", 400);
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateQuizAnswerData = validateQuizAnswerData;
const checkQuizSessionExists = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sessionId } = req.params;
        if (!sessionId || !sessionId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new errorHandler_1.AppError("ID da sessão é inválido", 400);
        }
        const session = yield quiz_1.QuizSession.findById(sessionId);
        if (!session) {
            throw new errorHandler_1.AppError("Sessão de quiz não encontrada", 404);
        }
        req.quizSession = session;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.checkQuizSessionExists = checkQuizSessionExists;
const checkQuizSessionOwnership = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const session = req.quizSession;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            throw new errorHandler_1.AppError("Usuário não autenticado", 401);
        }
        if (!session) {
            throw new errorHandler_1.AppError("Sessão não encontrada", 404);
        }
        if (session.userId.toString() !== userId) {
            throw new errorHandler_1.AppError("Você não tem acesso a esta sessão", 403);
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.checkQuizSessionOwnership = checkQuizSessionOwnership;
