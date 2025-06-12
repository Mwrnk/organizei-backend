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
exports.QuizController = void 0;
const openai_1 = __importDefault(require("openai"));
const errorHandler_1 = require("../middlewares/errorHandler");
const quiz_1 = require("../models/quiz");
const card_1 = require("../models/card");
const user_1 = require("../models/user");
const generateQuizPrompt_1 = require("../prompts/generateQuizPrompt");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class QuizController {
    constructor() {
        // Iniciar uma nova sessão de quiz
        this.startQuiz = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { cardId } = req.params;
                const { amount = 1 } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errorHandler_1.AppError("Usuário não autenticado", 401);
                }
                // Validar quantidade de perguntas
                if (amount < 1 || amount > 10) {
                    throw new errorHandler_1.AppError("A quantidade de perguntas deve estar entre 1 e 10", 400);
                }
                // Buscar o card
                const card = yield card_1.Card.findById(cardId);
                if (!card) {
                    throw new errorHandler_1.AppError("Card não encontrado", 404);
                }
                // Verificar se o card tem PDFs
                if (!card.pdfs || card.pdfs.length === 0) {
                    throw new errorHandler_1.AppError("Este card não possui PDFs para gerar perguntas. Por favor, adicione um PDF ao card primeiro.", 400);
                }
                // Verificar se o primeiro PDF tem dados válidos
                if (!((_b = card.pdfs[0]) === null || _b === void 0 ? void 0 : _b.data)) {
                    throw new errorHandler_1.AppError("O PDF deste card está corrompido ou vazio. Por favor, faça upload de um novo PDF.", 400);
                }
                // Verificar se o usuário tem acesso ao card
                if (card.userId.toString() !== userId && !card.is_published) {
                    throw new errorHandler_1.AppError("Você não tem acesso a este card", 403);
                }
                // Verificar se já existe uma sessão ativa para este usuário e card
                const existingSession = yield quiz_1.QuizSession.findOne({
                    userId,
                    cardId,
                    status: "active"
                });
                if (existingSession) {
                    throw new errorHandler_1.AppError("Você já possui uma sessão de quiz ativa para este card", 400);
                }
                // Extrair texto do primeiro PDF
                const pdfContent = yield this.extractTextFromPdf(card.pdfs[0].data);
                if (!pdfContent || pdfContent.trim().length < 50) {
                    throw new errorHandler_1.AppError("Não foi possível extrair conteúdo suficiente do PDF", 400);
                }
                // Gerar pergunta usando IA
                const question = yield this.generateQuestionWithAI(pdfContent, card.title);
                // Criar nova sessão de quiz
                const quizSession = yield quiz_1.QuizSession.create({
                    userId,
                    cardId,
                    question,
                    status: "active"
                });
                res.status(201).json({
                    status: "success",
                    data: {
                        sessionId: quizSession._id,
                        question: {
                            question: question.question,
                            options: question.options
                        },
                        cardTitle: card.title
                    }
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                console.error("Erro ao iniciar quiz:", error);
                throw new errorHandler_1.AppError("Erro ao iniciar quiz", 500);
            }
        });
        // Responder uma pergunta
        this.answerQuestion = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { sessionId } = req.params;
                const { answer, timeSpent } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errorHandler_1.AppError("Usuário não autenticado", 401);
                }
                // Validar resposta
                if (typeof answer !== "number" || answer < 0 || answer > 3) {
                    throw new errorHandler_1.AppError("Resposta inválida. Deve ser um número entre 0 e 3", 400);
                }
                // Buscar sessão
                const session = yield quiz_1.QuizSession.findById(sessionId);
                if (!session) {
                    throw new errorHandler_1.AppError("Sessão de quiz não encontrada", 404);
                }
                // Verificar se é do usuário correto
                if (session.userId.toString() !== userId) {
                    throw new errorHandler_1.AppError("Você não tem acesso a esta sessão", 403);
                }
                // Verificar se a sessão ainda está ativa
                if (session.status !== "active") {
                    throw new errorHandler_1.AppError("Esta sessão já foi finalizada", 400);
                }
                // Verificar se já foi respondida
                if (session.userAnswer !== undefined) {
                    throw new errorHandler_1.AppError("Esta pergunta já foi respondida", 400);
                }
                // Verificar se a resposta está correta
                const isCorrect = answer === session.question.correctAnswer;
                // Calcular pontos (10 pontos para resposta correta)
                const pointsEarned = isCorrect ? 10 : 0;
                // Atualizar sessão
                session.userAnswer = answer;
                session.isCorrect = isCorrect;
                session.pointsEarned = pointsEarned;
                session.timeSpent = timeSpent || 0;
                session.status = "completed";
                session.completedAt = new Date();
                yield session.save();
                // Se acertou, adicionar OrgPoints ao usuário
                if (isCorrect) {
                    const user = yield user_1.User.findById(userId);
                    if (user) {
                        user.orgPoints = (user.orgPoints || 0) + 10;
                        yield user.save();
                    }
                }
                res.status(200).json({
                    status: "success",
                    data: {
                        isCorrect,
                        correctAnswer: session.question.correctAnswer,
                        correctOption: session.question.options[session.question.correctAnswer],
                        pointsEarned,
                        totalOrgPoints: isCorrect ? (_b = (yield user_1.User.findById(userId))) === null || _b === void 0 ? void 0 : _b.orgPoints : undefined
                    }
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                console.error("Erro ao responder pergunta:", error);
                throw new errorHandler_1.AppError("Erro ao responder pergunta", 500);
            }
        });
        // Obter estatísticas do usuário
        this.getQuizStats = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errorHandler_1.AppError("Usuário não autenticado", 401);
                }
                // Buscar estatísticas
                const totalQuizzes = yield quiz_1.QuizSession.countDocuments({
                    userId,
                    status: "completed"
                });
                const correctAnswers = yield quiz_1.QuizSession.countDocuments({
                    userId,
                    status: "completed",
                    isCorrect: true
                });
                const totalPoints = yield quiz_1.QuizSession.aggregate([
                    { $match: { userId: userId, status: "completed" } },
                    { $group: { _id: null, total: { $sum: "$pointsEarned" } } }
                ]);
                const user = yield user_1.User.findById(userId);
                res.status(200).json({
                    status: "success",
                    data: {
                        totalQuizzes,
                        correctAnswers,
                        accuracy: totalQuizzes > 0 ? Math.round((correctAnswers / totalQuizzes) * 100) : 0,
                        totalPointsEarned: ((_b = totalPoints[0]) === null || _b === void 0 ? void 0 : _b.total) || 0,
                        currentOrgPoints: (user === null || user === void 0 ? void 0 : user.orgPoints) || 0
                    }
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                console.error("Erro ao buscar estatísticas:", error);
                throw new errorHandler_1.AppError("Erro ao buscar estatísticas", 500);
            }
        });
        // Obter histórico de quizzes
        this.getQuizHistory = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const skip = (page - 1) * limit;
                if (!userId) {
                    throw new errorHandler_1.AppError("Usuário não autenticado", 401);
                }
                const totalDocs = yield quiz_1.QuizSession.countDocuments({
                    userId,
                    status: "completed"
                });
                const quizzes = yield quiz_1.QuizSession.find({
                    userId,
                    status: "completed"
                })
                    .populate({
                    path: "cardId",
                    select: "title"
                })
                    .sort({ completedAt: -1 })
                    .skip(skip)
                    .limit(limit);
                const totalPages = Math.ceil(totalDocs / limit);
                res.status(200).json({
                    status: "success",
                    data: {
                        quizzes: quizzes.map(quiz => {
                            var _a;
                            return ({
                                id: quiz._id,
                                cardTitle: (_a = quiz.cardId) === null || _a === void 0 ? void 0 : _a.title,
                                question: quiz.question.question,
                                userAnswer: quiz.question.options[quiz.userAnswer],
                                correctAnswer: quiz.question.options[quiz.question.correctAnswer],
                                isCorrect: quiz.isCorrect,
                                pointsEarned: quiz.pointsEarned,
                                timeSpent: quiz.timeSpent,
                                completedAt: quiz.completedAt
                            });
                        }),
                        pagination: {
                            page,
                            limit,
                            totalDocs,
                            totalPages,
                            hasNextPage: page < totalPages,
                            hasPrevPage: page > 1
                        }
                    }
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                console.error("Erro ao buscar histórico:", error);
                throw new errorHandler_1.AppError("Erro ao buscar histórico", 500);
            }
        });
        // Método privado para extrair texto do PDF
        this.extractTextFromPdf = (pdfBuffer) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield (0, pdf_parse_1.default)(pdfBuffer);
                return data.text;
            }
            catch (error) {
                console.error("Erro ao extrair texto do PDF:", error);
                throw new errorHandler_1.AppError("Erro ao processar PDF", 500);
            }
        });
        // Método privado para gerar pergunta com IA
        this.generateQuestionWithAI = (pdfContent, cardTitle) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Limitar o conteúdo para evitar tokens excessivos (primeiros 3000 caracteres)
                const limitedContent = pdfContent.substring(0, 3000);
                const prompt = (0, generateQuizPrompt_1.generateQuizPrompt)(1, limitedContent, cardTitle);
                const completion = yield this.clientOpenAI.chat.completions.create({
                    model: generateQuizPrompt_1.model,
                    messages: [
                        {
                            role: "system",
                            content: generateQuizPrompt_1.context
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: generateQuizPrompt_1.temperature,
                });
                if (!completion.choices[0].message.content) {
                    throw new errorHandler_1.AppError("Nenhuma resposta da OpenAI", 500);
                }
                const questionData = JSON.parse(completion.choices[0].message.content);
                // Validar estrutura da resposta
                if (!questionData.question || !Array.isArray(questionData.options) ||
                    questionData.options.length !== 4 ||
                    typeof questionData.correctAnswer !== "number" ||
                    questionData.correctAnswer < 0 || questionData.correctAnswer > 3) {
                    throw new errorHandler_1.AppError("Formato de pergunta inválido gerado pela IA", 500);
                }
                return {
                    question: questionData.question,
                    options: questionData.options,
                    correctAnswer: questionData.correctAnswer
                };
            }
            catch (error) {
                console.error("Erro ao gerar pergunta com IA:", error);
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao gerar pergunta", 500);
            }
        });
        this.clientOpenAI = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
}
exports.QuizController = QuizController;
