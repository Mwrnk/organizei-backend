import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface TokenPayload {
  id: string;
  email: string;
}

export const generateToken = (userId: string, email: string, expiresIn: jwt.SignOptions["expiresIn"] = '24h'): string => {
  try {
    return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn });
  } catch (error) {
    throw new AppError('Erro ao gerar token', 500);
  }
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expirado', 401);
    }
    throw new AppError('Token inválido', 401);
  }
};