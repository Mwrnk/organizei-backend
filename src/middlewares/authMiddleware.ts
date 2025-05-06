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

    const [token] = authHeader.split(' ');

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