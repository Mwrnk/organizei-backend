import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { AppError } from "./errorHandler";

export const validateUserData = async (
  req: Request,
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
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { coduser, name, dateOfBirth, email, password } = req.body;

    if (!coduser || !name || !email || !password || !dateOfBirth) {
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
  req: Request,
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
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    next();
  } catch (error) {
    next(error);
  }
};
