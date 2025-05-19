import { NextFunction, Response } from "express";
import { AppError } from "./errorHandler";
import { AuthRequest } from "../types/express";
import { Tag } from "../models/Flashcard";

export const validateTagData = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const { name } = req.body;

        if (!name) {
            throw new AppError("O nome da tag é obrigatório", 400);
        }

        if (name.length < 3 || name.length > 100) {
            throw new AppError("O nome da tag deve ter entre 3 e 100 caracteres", 400);
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const checkTagById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new AppError("ID inválido", 400);
        }

        const tag = await Tag.findById(id);

        if (!tag) {
            throw new AppError("Tag não encontrada", 404);
        }

        req.tag = tag;
        next();
    } catch (error) {
        next(error)
    }
};

export const checkTagByName = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
    try {
        const { name } = req.params;

        if (!name) {
            throw new AppError("Nome é obrigatório", 400);
        }

        const tags = await Tag.find({ name: { $regex: name, $options: 'i' } });

        if (!tags) {
            throw new AppError("Tag não encontrada", 404);
        }

        req.tags = tags;
        next();
    } catch (error) {
        next(error);
    }
};
