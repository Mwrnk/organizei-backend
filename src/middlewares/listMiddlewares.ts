import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler"; // caminho correto!

export const validateCreateList = (req: Request, res: Response, next: NextFunction): void => {
  const { name } = req.body;

  if (!name || typeof name !== "string") {
    throw new AppError("O nome da lista é obrigatório e deve ser uma string.", 400);
  }

  next();
};

export const validateEditList = (req: Request, res: Response, next: NextFunction): void => {
  const { name } = req.body;

  if (!name || typeof name !== "string") {
    throw new AppError("Nome inválido para edição da lista.", 400);
  }

  next();
};

export const validateGetListById = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    throw new AppError("ID inválido para busca da lista.", 400);
  }

  next();
};
