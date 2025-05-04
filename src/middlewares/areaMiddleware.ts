import { NextFunction, Response } from "express";
import { AppError } from "./errorHandler";  
import { AuthRequest } from "../types/express";  


export const validateAreaData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, userId } = req.body;

    
    if (!type || !userId) {
      throw new AppError("Tipo e ID do usuário são obrigatórios", 400);
    }

    
    if (!["Escolar", "Profissional"].includes(type)) {
      throw new AppError("O tipo da área deve ser 'Escolar' ou 'Profissional'", 400);
    }

   
    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      throw new AppError("ID do usuário inválido", 400);
    }
    
    next();
  } catch (error) {
    next(error);  
  }
};


