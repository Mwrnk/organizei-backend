"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quizController_1 = require("../controllers/quizController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const quizMiddleware_1 = require("../middlewares/quizMiddleware");
const errorHandler_1 = require("../middlewares/errorHandler");
const router = (0, express_1.Router)();
const quizController = new quizController_1.QuizController();
// Middleware para validar parâmetros de rota
const validateRouteParams = (req, res, next) => {
    const { cardId, sessionId } = req.params;
    if (cardId && !cardId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new errorHandler_1.AppError("ID do card inválido", 400);
    }
    if (sessionId && !sessionId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new errorHandler_1.AppError("ID da sessão inválido", 400);
    }
    next();
};
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Rotas do quiz
router.post("/quiz/start/:cardId", validateRouteParams, quizMiddleware_1.validateQuizStartData, quizController.startQuiz);
router.post("/quiz/answer/:sessionId", validateRouteParams, quizMiddleware_1.validateQuizAnswerData, quizController.answerQuestion);
router.get("/quiz/stats", quizController.getQuizStats);
router.get("/quiz/history", quizController.getQuizHistory);
exports.default = router;
