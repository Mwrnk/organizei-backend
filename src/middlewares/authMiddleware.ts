import { Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { AuthRequest } from '../types/express';
import { verifyToken } from '../utils/tokenManager';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('Token não fornecido', 401);
    }

    //   const [token] = authHeader.split(' '); <- antes estava assim
    let token = authHeader;
    // Se o header vier no formato "Bearer <token>", extrai só o token
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Token mal formatado', 401);
    }

    const decoded = verifyToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Erro na autenticação', 401);
  }
};
