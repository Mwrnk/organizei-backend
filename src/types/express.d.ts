import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Card } from '../models/Card';
import { List } from '../models/List';

export interface AuthRequest extends Request {
  user?: JwtPayload;
  card?: Card;
  list?: List;
  lists?: List[];
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      card?: Card;
      list?: List;
      lists?: List[];
    }
  }
} 