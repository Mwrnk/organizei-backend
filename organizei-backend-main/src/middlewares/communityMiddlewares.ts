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

    // Verificar se o card existe e está pronto para publicação
    const card = await Card.findById(id);
    if (!card) {
      throw new AppError("Card não encontrado", 404);
    }

    if (card.is_published) {
      throw new AppError("Este card já está publicado", 400);
    }

    // Validar campos obrigatórios para publicação
    if (!card.title || card.title.length < 3) {
      throw new AppError("O título do card é obrigatório e deve ter pelo menos 3 caracteres", 400);
    }

    if (!card.priority) {
      throw new AppError("A prioridade do card é obrigatória", 400);
    }

    // Verificar se o usuário tem permissão para publicar
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!card?.userId || card.userId.toString() !== userId) {
      throw new AppError("Você não tem permissão para realizar esta ação", 403);
    }

    req.card = card;
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

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError("ID inválido", 400);
    }

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

    if (!card) {
      throw new AppError("Card não encontrado", 404);
    }

    if (!card.is_published) {
      throw new AppError("Card não está publicado", 403);
    }

    // Verificar se a publicação não expirou (se houver data de expiração)
    if (card.publishedAt && card.expiresAt && new Date() > card.expiresAt) {
      throw new AppError("Esta publicação expirou", 403);
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

    if (!card) {
      throw new AppError("Card não encontrado", 404);
    }

    if (!card?.userId || card.userId.toString() !== userId) {
      throw new AppError("Você não tem permissão para realizar esta ação", 403);
    }

    // Verificar se o usuário tem permissão de administrador
    const isAdmin = req.user && req.user.role === "admin";
    if (!isAdmin && card.userId.toString() !== userId) {
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
