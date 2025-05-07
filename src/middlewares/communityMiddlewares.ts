import { NextFunction, Response } from "express";
import { Card } from "../models/card";
import { AppError } from "./errorHandler";
import { AuthRequest } from "../types/express";

export const validatePublishData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError("ID do card é obrigatório", 400);
    }

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError("ID inválido", 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const checkCardExists = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const card = await Card.findById(id);

    if (!card) {
      throw new AppError("Card não encontrado", 404);
    }

    req.card = card;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Erro ao verificar card", 500);
  }
};

export const checkCardIsPublished = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const card = req.card;

    if (!card?.is_published) {
      throw new AppError("Card não está publicado", 403);
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Erro ao verificar status de publicação do card", 500);
  }
};

export const checkCardOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const card = req.card;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (card?.userId.toString() !== userId) {
      throw new AppError("Você não tem permissão para realizar esta ação", 403);
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Erro ao verificar propriedade do card", 500);
  }
}; 