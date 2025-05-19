import { Response } from "express";
import { Card } from "../models/card";
import { AppError } from "../middlewares/errorHandler";
import { AuthRequest } from "../types/express";
import { User } from "../models/User";

export class CardController {
  async getAllCards(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const cards = await Card.find({ userId })
        .sort({ createdAt: -1 })
        .populate({
          path: "listId",
          populate: {
            path: "userId",
          },
        });

      res.status(200).json({
        status: "success",
        data: cards.map((card) => ({
          id: card._id,
          title: card.title,
          priority: card.priority,
          is_published: card.is_published,
          userId: card.userId,
          listId: card.listId,
        })),
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao buscar os cards", 500);
    }
  }

  async getCardById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;

      res.status(200).json({
        status: "success",
        data: {
          id: card._id,
          title: card.title,
          priority: card.priority,
          is_published: card.is_published,
          userId: card.userId,
          listId: card.listId,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
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
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const cards = await Card.find({ listId, userId });

      res.status(200).json({
        status: "success",
        data: cards.map((card) => ({
          id: card._id,
          title: card.title,
          priority: card.priority,
          is_published: card.is_published,
          userId: card.userId,
        })),
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao buscar cartões da lista", 500);
    }
  }

  async createCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, listId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const card = await Card.create({
        title,
        listId,
        userId,
      });

      res.status(201).json({
        status: "success",
        data: {
          id: card._id,
          title: card.title,
          listId: card.listId,
          userId: card.userId,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao criar cartão", 500);
    }
  }

  async likeCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      // Verifica se o card está publicado
      if (!card.is_published) {
        throw new AppError("Este card não está disponível para curtidas", 403);
      }

      // Verifica se o usuário está tentando curtir seu próprio card
      if (card.userId.toString() === userId) {
        throw new AppError("Você não pode curtir seu próprio card", 403);
      }

      // Verifica se o usuário já deu like no card
      if (card.likedBy && card.likedBy.includes(userId)) {
        res.status(400).json({
          status: "fail",
          message: "Você já curtiu este card"
        });
        return;
      }

      // Inicializa o array likedBy se não existir
      if (!card.likedBy) {
        card.likedBy = [];
      }

      // Adiciona o usuário à lista de likes
      card.likedBy.push(userId);
      
      // Incrementa o contador de likes
      card.likes = Number(card.likes) + 1;
      await card.save();

      // Verifica se atingiu 20 likes únicos (likedBy.length)
      if (card.likedBy.length % 20 === 0) {
        const user = await User.findById(card.userId);
        if (user) {
          user.orgPoints = Number(user.orgPoints) + 1;
          await user.save();
        }
      }

      res.status(200).json({
        status: "success",
        data: {
          id: card._id,
          title: card.title,
          likes: card.likes,
          userId: card.userId,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: "fail",
          message: error.message
        });
        return;
      }
      res.status(500).json({
        status: "error",
        message: "Erro ao dar like no cartão"
      });
    }
  }

  async unlikeCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      // Verifica se o card está publicado
      if (!card.is_published) {
        throw new AppError("Este card não está disponível para interações", 403);
      }

      // Verifica se o usuário está tentando descurtir seu próprio card
      if (card.userId.toString() === userId) {
        throw new AppError("Você não pode descurtir seu próprio card", 403);
      }

      // Verifica se o usuário já deu like no card
      if (!card.likedBy || !card.likedBy.includes(userId)) {
        res.status(400).json({
          status: "fail",
          message: "Você ainda não curtiu este card"
        });
        return;
      }

      // Remove o usuário da lista de likes
      card.likedBy = card.likedBy.filter((id: string | number) => id.toString() !== userId);
      
      // Decrementa o contador de likes
      card.likes = Math.max(0, Number(card.likes) - 1);
      await card.save();

      res.status(200).json({
        status: "success",
        data: {
          id: card._id,
          title: card.title,
          likes: card.likes,
          userId: card.userId,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: "fail",
          message: error.message
        });
        return;
      }
      res.status(500).json({
        status: "error",
        message: "Erro ao remover like do cartão"
      });
    }
  }

  async editCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const { title, priority, is_published, image_url } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      if (card.userId.toString() !== userId) {
        throw new AppError(
          "Você não tem permissão para editar este cartão",
          403
        );
      }

      const updatedCard = await Card.findByIdAndUpdate(
        card._id,
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
          userId: updatedCard.userId,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao editar cartão", 500);
    }
  }

  async getCardsByUserId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const cards = await Card.find({ userId })
        .sort({ createdAt: -1 })
        .populate({
          path: "tipoId", // ou outro campo referenciado
          select: "nome", // só traz os campos que você quer
        });

      res.status(200).json({
        status: "success",
        data: cards,
      });
    } catch (error) {
      throw new AppError("Erro ao buscar cards do usuário", 500);
    }
  }

  async deleteCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      if (card.userId.toString() !== userId) {
        throw new AppError(
          "Você não tem permissão para deletar este cartão",
          403
        );
      }

      await Card.findByIdAndDelete(card._id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao deletar cartão", 500);
    }
  }
}
