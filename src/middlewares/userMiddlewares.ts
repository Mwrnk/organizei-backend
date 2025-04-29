import { NextFunction, Response } from "express";
import { User } from "../models/User";
import { AppError } from "./errorHandler";
import { AuthRequest } from "../types/express";

export const validateUserData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, dateOfBirth } = req.body;

    if (!name && !dateOfBirth) {
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

export const validateSignupData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { coduser, name, dateOfBirth, email, password } = req.body;

    if (!coduser || !name || !dateOfBirth || !email || !password) {
      throw new AppError("Todos os campos são obrigatórios", 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Usuário já existe", 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateLoginData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email e senha são obrigatórios", 400);
    }

    next();
  } catch (error) {
    next(error);
  }
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
