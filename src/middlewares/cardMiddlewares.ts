import { NextFunction, Response } from "express";
import { Card } from "../models/card";
import { List } from "../models/list";
import { AppError } from "./errorHandler";
import { AuthRequest } from "../types/express";
import mongoose from "mongoose";

export const validateCardData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, listId, priority } = req.body;

    if (!title || !listId) {
      throw new AppError("O título e o ID da lista são obrigatórios", 400);
    }

    // Validação do título
    if (title.length < 3 || title.length > 100) {
      throw new AppError("O título deve ter entre 3 e 100 caracteres", 400);
    }

    // Validação do listId
    if (!listId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError("ID da lista inválido", 400);
    }

    // Verificar se a lista existe
    const list = await List.findById(listId);
    if (!list) {
      throw new AppError("Lista não encontrada", 404);
    }

    // Validação da prioridade se fornecida
    if (priority && !["Baixa", "Média", "Alta"].includes(priority)) {
      throw new AppError("Prioridade inválida. Use: Baixa, Média ou Alta", 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateCardUpdateData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, priority, is_published, image_url } = req.body;

    if (!title && !priority && !is_published && !image_url) {
      throw new AppError(
        "Pelo menos um campo deve ser enviado para atualização",
        400
      );
    }

    // Validação do título se fornecido
    if (title && (title.length < 3 || title.length > 100)) {
      throw new AppError("O título deve ter entre 3 e 100 caracteres", 400);
    }

    // Validação da prioridade se fornecida
    if (priority && !["Baixa", "Média", "Alta"].includes(priority)) {
      throw new AppError("Prioridade inválida. Use: Baixa, Média ou Alta", 400);
    }

    // Validação do is_published se fornecido
    if (is_published !== undefined && typeof is_published !== "boolean") {
      throw new AppError("is_published deve ser um valor booleano", 400);
    }

    // Validação das URLs das imagens se fornecidas
    if (image_url) {
      if (!Array.isArray(image_url)) {
        throw new AppError("image_url deve ser um array de URLs", 400);
      }
      
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      for (const url of image_url) {
        if (!urlRegex.test(url)) {
          throw new AppError("URL de imagem inválida", 400);
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const checkCardById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError("ID inválido", 400);
    }

    const card = await Card.findById(id);

    if (!card) {
      throw new AppError("Cartão não encontrado", 404);
    }

    req.card = card;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    console.error("Erro no middleware checkCardById:", error);
    next(new AppError("Erro ao verificar cartão", 500));
  }
};

export const checkCardByTitle = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title } = req.params;

    if (!title) {
      throw new AppError("Título é obrigatório", 400);
    }

    const card = await Card.findOne({ title });

    if (!card) {
      throw new AppError("Cartão não encontrado", 404);
    }

    req.card = card;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    console.error("Erro no middleware checkCardByTitle:", error);
    next(new AppError("Erro ao verificar cartão", 500));
  }
};

export const checkCardIsPublished = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const card = req.card;

    if (card.publishedAt && card.expiresAt) {
      const expiresAt = new Date(card.expiresAt);
      if (!isNaN(expiresAt.getTime()) && new Date() > expiresAt) {
        throw new AppError("Esta publicação expirou", 403);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const checkCardOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "admin";
    const card = req.card;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!card) {
      throw new AppError("Card não encontrado", 404);
    }

    // Se não for admin, só pode manipular seus próprios cards
    if (!isAdmin && card?.userId?.toString() !== userId) {
      throw new AppError("Você não tem permissão para realizar esta ação", 403);
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    console.error("Erro no middleware checkCardOwnership:", error);
    next(new AppError("Erro interno do servidor", 500));
  }
};

export const validateLikeOperation = async (
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

    // Verifica se o card está publicado
    if (!card.is_published) {
      throw new AppError("Este card não está disponível para curtidas", 403);
    }

    // Verifica se o usuário está tentando curtir seu próprio card
    if (card.userId.toString() === userId) {
      throw new AppError("Você não pode curtir seu próprio card", 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
