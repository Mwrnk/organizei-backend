import { NextFunction, Response } from "express";
import { Card } from "../models/Card";
import { AppError } from "./errorHandler";
import { AuthRequest } from "../types/express";

export const validateCardData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, listId } = req.body;

    if (!title || !listId) {
      throw new AppError("O título e o ID da lista são obrigatórios", 400);
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

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
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
      throw error;
    }
    throw new AppError("Erro ao verificar cartão", 500);
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
      throw error;
    }
    throw new AppError("Erro ao verificar cartão", 500);
  }
}; 