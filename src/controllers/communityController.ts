import { Response } from "express";
import { Card } from "../models/card";
import { AppError } from "../middlewares/errorHandler";
import { AuthRequest } from "../types/express";

export class CommunityController {
  // Listar todos os cards publicados
  async getPublishedCards(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cards = await Card.find({ is_published: true })
        .sort({ createdAt: -1 })
        .populate({
          path: "userId",
          select: "name email"
        });

      res.status(200).json({
        status: "success",
        data: cards.map(card => ({
          id: card._id,
          title: card.title,
          priority: card.priority,
          downloads: card.downloads,
          likes: card.likes,
          comments: card.comments,
          user: card.userId
        }))
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao buscar os cards publicados", 500);
    }
  }

  // Publicar um card na comunidade
  async publishCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;

      if (!card) {
        throw new AppError("Cartão não encontrado", 404);
      }

      card.is_published = true;
      await card.save();

      res.status(200).json({
        status: "success",
        message: "Cartão publicado com sucesso!",
        data: {
          id: card._id,
          title: card.title,
          is_published: card.is_published
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao publicar cartão", 500);
    }
  }

  // Registrar download de um card
  async downloadCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      // Incrementa o contador de downloads
      card.downloads = Number(card.downloads) + 1;
      await card.save();

      // Cria uma cópia do card para o usuário
      const cardCopy = await Card.create({
        ...card.toObject(),
        _id: undefined,
        userId: userId,
        downloads: 0,
        likes: 0,
        comments: 0,
        is_published: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.status(200).json({
        status: "success",
        message: "Download e duplicação realizados com sucesso!",
        data: {
          originalCard: {
            id: card._id,
            title: card.title,
            downloads: card.downloads,
          },
          duplicatedCard: {
            id: cardCopy._id,
            title: cardCopy.title,
            userId: cardCopy.userId,
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao realizar o download e duplicação", 500);
    }
  }
}