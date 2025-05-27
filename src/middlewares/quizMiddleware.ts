import { NextFunction, Response } from "express";
import { AppError } from "./errorHandler";
import { AuthRequest } from "../types/express";
import { QuizSession } from "../models/quiz";
import { Card } from "../models/card";

export const validateQuizStartData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { cardId } = req.params;

    if (!cardId || !cardId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError("ID do card é inválido", 400);
    }

    const card = await Card.findById(cardId);
    if (!card) {
      throw new AppError("Card não encontrado", 404);
    }

    req.card = card;
    next();
  } catch (error) {
    next(error);
  }
};

export const validateQuizAnswerData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { answer, timeSpent } = req.body;

    if (!sessionId || !sessionId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError("ID da sessão é inválido", 400);
    }

    if (typeof answer !== "number" || answer < 0 || answer > 3) {
      throw new AppError("Resposta deve ser um número entre 0 e 3", 400);
    }

    if (timeSpent !== undefined && (typeof timeSpent !== "number" || timeSpent < 0)) {
      throw new AppError("Tempo gasto deve ser um número positivo", 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const checkQuizSessionExists = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || !sessionId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError("ID da sessão é inválido", 400);
    }

    const session = await QuizSession.findById(sessionId);
    if (!session) {
      throw new AppError("Sessão de quiz não encontrada", 404);
    }

    req.quizSession = session;
    next();
  } catch (error) {
    next(error);
  }
};

export const checkQuizSessionOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = req.quizSession;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!session) {
      throw new AppError("Sessão não encontrada", 404);
    }

    if (session.userId.toString() !== userId) {
      throw new AppError("Você não tem acesso a esta sessão", 403);
    }

    next();
  } catch (error) {
    next(error);
  }
}; 