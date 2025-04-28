import { NextFunction, Response } from "express";
import { User } from "../models/User";
import { AppError } from "./errorHandler";
import { AuthRequest } from "../types/express";

export const validateUserData = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const { name, dateOfBirth } = req.body;
  if (!name || !dateOfBirth) {
    throw new AppError("Nome e data de nascimento são obrigatórios", 400);
  }
  next();
};

export const validateSignupData = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const { coduser, name, dateOfBirth, email, password } = req.body;
  if (!coduser || !name || !dateOfBirth || !email || !password) {
    throw new AppError("Todos os campos são obrigatórios", 400);
  }
  next();
};

export const validateLoginData = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("Email e senha são obrigatórios", 400);
  }
  next();
};

export const checkUserExists = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Não verifica usuário em rotas de signup
    if (req.path === "/signup") {
      return next();
    }

    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Erro ao verificar usuário", 500);
  }
}; 