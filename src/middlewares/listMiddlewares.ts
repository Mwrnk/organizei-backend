import { NextFunction, Response } from "express";
import { List } from "../models/list";
import { AppError } from "./errorHandler";
import { AuthRequest } from "../types/express";

export const validateListData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, userId } = req.body;

    if (!name || !userId) {
      throw new AppError("Nome e ID do usuário são obrigatórios", 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateListUpdateData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      throw new AppError("O nome é obrigatório para atualização", 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const checkListExists = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError("ID inválido", 400);
    }

    const list = await List.findById(id);

    if (!list) {
      throw new AppError("Lista não encontrada", 404);
    }

    req.list = list;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Erro ao verificar lista", 500);
  }
};

export const checkUserLists = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      throw new AppError("ID do usuário é obrigatório", 400);
    }

    const lists = await List.find({ userId });

    // if (lists.length === 0) {
    //   throw new AppError("Nenhuma lista encontrada para este usuário", 404);
    // }
    //esse trecho crasha o backend quando usuario nao tem nenhuma lista

    req.lists = lists;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Erro ao buscar listas do usuário", 500);
  }
};
