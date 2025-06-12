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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlashcardsController = void 0;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("../middlewares/errorHandler");
const flashcard_1 = require("../models/flashcard");
const generateFlashcardPrompt_1 = require("../prompts/generateFlashcardPrompt");
dotenv_1.default.config();
class FlashcardsController {
    constructor() {
        this.createFlashcard = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { cardId, front, back, tags } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errorHandler_1.AppError("Usuário não autenticado", 401);
                }
                const flashcard = yield flashcard_1.Flashcard.create({
                    cardId,
                    userId,
                    front,
                    back,
                    tags
                });
                res.status(200).json({
                    status: "success",
                    data: {
                        flashcard
                    }
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao criar flashcard", 500);
            }
        });
        this.createFlashcardWithAI = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const card = req.card;
                const { amount } = req.body;
                if (!userId) {
                    throw new errorHandler_1.AppError("Usuário não autenticado", 401);
                }
                const flashcards = yield flashcard_1.Flashcard.find({ cardId: card.id });
                const existingFronts = flashcards.map(flashcard => flashcard.front);
                const availableTags = yield flashcard_1.Tag.find();
                const prompt = (0, generateFlashcardPrompt_1.generateFlashcardPrompt)(amount, card.title.toString(), existingFronts, availableTags.map(tag => tag.name));
                const resultGpt = yield this.generateFlashCardsWithAI(prompt);
                console.log("Resposta bruta da OpenAI:", resultGpt);
                let convertedResults;
                try {
                    convertedResults = JSON.parse(resultGpt);
                }
                catch (parseError) {
                    console.error("Erro ao fazer parse da resposta da OpenAI:", parseError);
                    console.error("Resposta que causou erro:", resultGpt);
                    throw new errorHandler_1.AppError("Resposta da IA não está em formato JSON válido", 500);
                }
                if (!Array.isArray(convertedResults)) {
                    throw new errorHandler_1.AppError("Resposta da IA não é um array válido", 500);
                }
                const preparedFlashcards = yield this.prepareFlashcards(convertedResults, card.id, userId);
                const insertedFlashcards = yield flashcard_1.Flashcard.insertMany(preparedFlashcards);
                res.status(200).json({
                    status: "success",
                    data: {
                        flashcards: insertedFlashcards
                    }
                });
            }
            catch (error) {
                console.error("Erro ao criar flashcards com IA:", error.message);
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao gerar flashcards com IA", 500);
            }
        });
        this.getAllFlashcards = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errorHandler_1.AppError("Usuário não autenticado", 401);
                }
                const flashcards = yield flashcard_1.Flashcard.find({ userId })
                    .sort({ createdAt: -1 })
                    .populate({
                    path: "tags"
                });
                res.status(200).json({
                    status: "success",
                    data: flashcards
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro buscar flashcards", 500);
            }
        });
        this.getFlashcardById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const flashcard = req.flashcard;
                res.status(200).json({
                    status: "success",
                    data: {
                        flashcard
                    }
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro buscar flashcards", 500);
            }
        });
        this.getlFlashcardsByCard = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { cardId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errorHandler_1.AppError("Usuário não autenticado", 401);
                }
                const flashcards = yield flashcard_1.Flashcard.find({ cardId: cardId })
                    .populate({
                    path: "tags"
                });
                res.status(200).json({
                    status: "success",
                    data: flashcards
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao buscar cartões da lista", 500);
            }
        });
        this.deteleFlashcard = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const flashcard = req.flashcard;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            yield flashcard_1.Flashcard.findByIdAndDelete(flashcard.id);
            res.status(204).send();
        });
        this.editFlashcard = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const flashcard = req.flashcard;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { front, back, tags } = req.body;
                if (!userId) {
                    throw new errorHandler_1.AppError("Usuário não autenticado", 401);
                }
                const updatedFlashcard = yield flashcard_1.Flashcard.findByIdAndUpdate(flashcard.id, { front, back, tags }, { new: true, runValidators: true });
                if (!updatedFlashcard) {
                    throw new errorHandler_1.AppError("Flashcard não encontrado", 404);
                }
                res.status(200).json({
                    status: "success",
                    data: {
                        flashcard: updatedFlashcard
                    }
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao atualizar o flashcard", 500);
            }
        });
        this.startReview = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { cardId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errorHandler_1.AppError("Usuário não autenticado", 401);
                }
                const flashcards = yield flashcard_1.Flashcard.find({
                    cardId,
                    "scheduling.nextReview": {
                        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
                    }
                })
                    .populate({
                    path: "tags"
                });
                res.status(200).json({
                    status: "success",
                    data: flashcards
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao buscar cartões da lista", 500);
            }
        });
        this.handleReview = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { grade } = req.body;
                const flashcard = req.flashcard;
                if (!userId) {
                    throw new errorHandler_1.AppError("Usuário não autenticado", 401);
                }
                flashcard.scheduling = this.updateScheduling(flashcard.scheduling, grade);
                flashcard.reviewLogs.push(this.createReviewLog(grade));
                flashcard.markModified('scheduling');
                flashcard.markModified('reviewLogs');
                const updatedFlashcard = yield flashcard.save();
                res.status(201).json({
                    status: "success",
                    data: {
                        flashcard: updatedFlashcard
                    }
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao processar revisão do flashcard", 500);
            }
        });
        this.updateScheduling = (scheduling, grade) => {
            const now = new Date();
            let { repetitions, interval, easeFactor, nextReview } = scheduling;
            if (grade >= 3) {
                repetitions += 1;
                interval = this.defineInterval(repetitions, interval, easeFactor);
            }
            else {
                repetitions = 0;
                interval = 1;
            }
            easeFactor = Math.max(this.calcEaseFactor(easeFactor, grade), 1.3); // 1.3 valor mínimo no algoritmo SM-2
            nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
            const updatedScheduling = {
                repetitions,
                interval,
                easeFactor,
                lastReview: now,
                nextReview
            };
            return updatedScheduling;
        };
        this.defineInterval = (repetitions, interval, easeFactor) => {
            switch (repetitions) {
                case 1:
                    interval = 1;
                    break;
                case 2:
                    interval = 6;
                    break;
                default: {
                    interval =
                        Math.round(interval * easeFactor);
                    break;
                }
            }
            return interval;
        };
        this.calcEaseFactor = (easeFactor, grade) => {
            return easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
        };
        this.createReviewLog = (grade) => {
            return {
                reviewDate: new Date,
                grade,
                responseTimeInSeconds: 0
            };
        };
        this.generateFlashCardsWithAI = (prompt) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                console.log("Iniciando comunicação com OpenAI...");
                const completion = yield this.clientOpenAI.chat.completions.create({
                    model: generateFlashcardPrompt_1.model,
                    messages: [
                        {
                            role: "system",
                            content: generateFlashcardPrompt_1.context
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: generateFlashcardPrompt_1.temperature,
                    max_tokens: 2000,
                });
                console.log("Resposta recebida da OpenAI");
                if (!((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content)) {
                    throw new errorHandler_1.AppError("Nenhuma resposta da OpenAI", 500);
                }
                return completion.choices[0].message.content;
            }
            catch (error) {
                console.error("Erro detalhado da OpenAI:", {
                    message: error.message,
                    type: error.type,
                    code: error.code,
                    status: error.status
                });
                if (error.code === 'insufficient_quota') {
                    throw new errorHandler_1.AppError("Cota da API OpenAI esgotada", 402);
                }
                if (error.code === 'invalid_api_key') {
                    throw new errorHandler_1.AppError("Chave da API OpenAI inválida", 401);
                }
                if (((_c = error.message) === null || _c === void 0 ? void 0 : _c.includes('Connection error')) || error.code === 'ENOTFOUND') {
                    throw new errorHandler_1.AppError("Erro de conexão com a OpenAI. Verifique sua conexão com a internet", 503);
                }
                throw new errorHandler_1.AppError(`Erro na comunicação com OpenAI: ${error.message}`, 500);
            }
        });
        this.prepareFlashcards = (flashcardsGenerated, cardId, userId) => __awaiter(this, void 0, void 0, function* () {
            const tagNames = flashcardsGenerated.flatMap(flashcard => flashcard.tags.map(tag => tag.toLowerCase().trim()));
            const existingTags = yield flashcard_1.Tag.find({ name: { $in: tagNames } });
            const existingMap = new Map(existingTags.map(tag => [tag.name, tag._id]));
            const newTagsToCreate = tagNames.filter((name) => !existingMap.has(name));
            const createdTags = yield flashcard_1.Tag.insertMany(newTagsToCreate.map((name) => ({ name })));
            const createdMap = new Map(createdTags.map(tag => [tag.name, tag._id]));
            const allTagsMap = new Map([...existingMap, ...createdMap]);
            const newFlashcards = flashcardsGenerated.map((flashcard) => ({
                front: flashcard.front,
                back: flashcard.back,
                cardId,
                userId,
                tags: flashcard.tags
                    .map(tag => tag.toLowerCase().trim())
                    .map(tag => allTagsMap.get(tag))
                    .filter(Boolean),
            }));
            return newFlashcards;
        });
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY não está configurada nas variáveis de ambiente");
        }
        this.clientOpenAI = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
            timeout: 30000, // 30 segundos de timeout
        });
    }
}
exports.FlashcardsController = FlashcardsController;
