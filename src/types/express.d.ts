import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Card } from "../models/Card";
import { List } from "../models/list";
import { Flashcard, Tag } from "../models/Flashcard";

export interface AuthRequest extends Request {
  user?: JwtPayload;
  card?: Card;
  list?: List;
  lists?: List[];
  flashcard?: Flashcard;
  tag?: Tag;
  tags?: Tag[];
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      card?: Card;
      list?: List;
      lists?: List[];
      flashcard?: Flashcard;
      tag?: Tag;
      tags?: Tag[];
    }
  }
}
