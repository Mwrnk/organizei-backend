import { NextFunction, Response } from "express";
import { List } from "../models/list";
import { User } from "../models/user";
import { AppError } from "./errorHandler";
import { AuthRequest } from "../types/express";
import { IPlan } from "../models/plan";

// Validação dos dados básicos da lista
export const validateListData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, userId } = req.body;

    // Validação de campos obrigatórios
    if (!name || !userId) {
      throw new AppError("Nome e ID do usuário são obrigatórios", 400);
    }

    // Validação do tamanho do nome
    if (name.length < 3 || name.length > 50) {
      throw new AppError("O nome deve ter entre 3 e 50 caracteres", 400);
    }

    // Validação de caracteres especiais no nome
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
      throw new AppError("O nome contém caracteres inválidos", 400);
    }

    // Validação do formato do ID do usuário
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError("ID do usuário inválido", 400);
    }

    // Verificar se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    // Verificar duplicidade de nome para o mesmo usuário
    const existingList = await List.findOne({ name, userId });
    if (existingList) {
      throw new AppError("Já existe uma lista com este nome para este usuário", 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Validação dos dados de atualização da lista
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

    // Validação do tamanho do nome
    if (name.length < 3 || name.length > 50) {
      throw new AppError("O nome deve ter entre 3 e 50 caracteres", 400);
    }

    // Validação de caracteres especiais no nome
    /*if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
      throw new AppError("O nome contém caracteres inválidos", 400);
    }*/

    // Verificar duplicidade de nome para o mesmo usuário
    const list = req.list;
    if (list) {
      const existingList = await List.findOne({
        name,
        userId: list.userId,
        _id: { $ne: list._id }
      });
      if (existingList) {
        throw new AppError("Já existe uma lista com este nome para este usuário", 400);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Verificação de existência da lista
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

// Verificação de propriedade da lista
export const checkListOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const list = req.list;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (list?.userId.toString() !== userId) {
      throw new AppError("Você não tem permissão para realizar esta ação", 403);
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Erro ao verificar propriedade da lista", 500);
  }
};

// Verificação de listas do usuário
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

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError("ID do usuário inválido", 400);
    }

    // Verificar se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const lists = await List.find({ userId });
    req.lists = lists;
    
    if (lists.length === 0) {
      res.status(200).json({
        status: "success",
        data: [],
        message: "Nenhuma lista encontrada para este usuário"
      });
      return;
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Erro ao buscar listas do usuário", 500);
  }
};

// Verificação de limites de listas por usuário
export const checkListLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const user = await User.findById(userId).populate<{ plan: IPlan }>('plan');
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const listCount = await List.countDocuments({ userId });
    const planLimit = user.plan?.features?.includes('unlimited_lists') ? Infinity : 10;

    if (listCount >= planLimit) {
      throw new AppError(
        `Limite de listas atingido. Seu plano permite ${planLimit} listas.`,
        403
      );
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Erro ao verificar limite de listas", 500);
  }
};
