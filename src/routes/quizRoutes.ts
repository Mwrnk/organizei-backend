import { Router } from "express";
import { QuizController } from "../controllers/quizController";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  validateQuizStartData,
  validateQuizAnswerData,
  checkQuizSessionExists,
  checkQuizSessionOwnership
} from "../middlewares/quizMiddleware";
import { AppError } from "../middlewares/errorHandler";

const router = Router();
const quizController = new QuizController();

// Middleware para validar parâmetros de rota
const validateRouteParams = (req: any, res: any, next: any) => {
  const { cardId, sessionId } = req.params;

  if (cardId && !cardId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new AppError("ID do card inválido", 400);
  }

  if (sessionId && !sessionId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new AppError("ID da sessão inválido", 400);
  }

  next();
};

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas do quiz
router.post(
  "/quiz/start/:cardId",
  validateRouteParams,
  validateQuizStartData,
  quizController.startQuiz
);

router.post(
  "/quiz/answer/:sessionId",
  validateRouteParams,
  validateQuizAnswerData,
  quizController.answerQuestion
);

router.get(
  "/quiz/stats",
  quizController.getQuizStats
);

router.get(
  "/quiz/history",
  quizController.getQuizHistory
);

export default router; 