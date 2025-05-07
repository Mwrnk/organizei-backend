import { Response } from "express";
import { Card } from "../models/card"
import { AppError } from "../middlewares/errorHandler";
import { AuthRequest } from "../types/express";


export class CardController {
  async createCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, listId } = req.body;
      const card = await Card.create({ title, listId });

      res.status(201).json({
        status: "success",
        data: {
          id: card._id,
          title: card.title,
          listId: card.listId,
        },
      });
    } catch (error) {
      throw new AppError("Erro ao criar cartão", 500);
    }
  }

  async editCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, priority, is_published, image_url } = req.body;

      const updatedCard = await Card.findByIdAndUpdate(
        id,
        { title, priority, is_published, image_url },
        { new: true, runValidators: true }
      );

      if (!updatedCard) {
        throw new AppError("Cartão não encontrado", 404);
      }

      res.status(200).json({
        status: "success",
        data: {
          id: updatedCard._id,
          title: updatedCard.title,
        },
      });
    } catch (error) {
      throw new AppError("Erro ao editar cartão", 500);
    }
  }

  async deleteCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await Card.findByIdAndDelete(id);
      res.status(204).send();
    } catch (error) {
      throw new AppError("Erro ao deletar cartão", 500);
    }
  }

  async getCardById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const card = await Card.findById(id);
  
      res.status(200).json({
        status: "success",
        data: card,
      });
    } catch (error) {
      throw new AppError("Erro ao buscar cartão", 500);
    }
  }

  async getCardByTitle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title } = req.params;
      const card = await Card.findOne({ title });

      res.status(200).json({
        status: "success",
        data: card,
      });
    } catch (error) {
      throw new AppError("Erro ao buscar cartão", 500);
    }
  }

  async getCardsByListId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { listId } = req.params;
      const cards = await Card.find({ listId });

      res.status(200).json({
        status: "success",
        data: cards,
      });
    } catch (error) {
      throw new AppError("Erro ao buscar cartões da lista", 500);
    }
  }

  async getAllCards(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cards = await Card.find()
        .sort({ createdAt: -1 })
        .limit(12)
        .populate({
          path: "listId",
          populate: {
            path: "userId"
          },
        });

      res.status(200).json({
        status: "success",
        data: cards,
      });
    } catch (error) {
      throw new AppError("Erro ao buscar os cards", 500);
    }
  }
}
