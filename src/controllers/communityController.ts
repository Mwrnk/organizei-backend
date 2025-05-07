import { Request, Response } from "express";
import { Card } from "../models/card";
import { AppError } from "../middlewares/errorHandler";

export class CommunityController {
  // Publicar um card na comunidade
  async publishCard(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const card = await Card.findByIdAndUpdate(
        id,
        { is_published: true },
        { new: true }
      );

      if (!card) {
        throw new AppError("Cartão não encontrado", 404);
      }

      res.status(200).json({
        status: "success",
        message: "Cartão publicado com sucesso!",
        data: card,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error instanceof AppError ? error.message : "Erro interno",
      });
    }
  }

  // Listar todos os cards publicados
  async getPublishedCards(req: Request, res: Response): Promise<void> {
    try {
      const cards = await Card.find({ is_published: true }).sort({ createdAt: -1 });

      res.status(200).json({
        status: "success",
        data: cards,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Erro ao buscar os cards publicados",
      });
    }
  }

  // Registrar download de um card
  async downloadCard(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Verifica se o card existe e está publicado
      const card = await Card.findById(id);
      if (!card) {
        throw new AppError("Cartão não encontrado", 404);
      }
      if (!card.is_published) {
        throw new AppError("Cartão não está publicado", 403);
      }

      // Incrementa o contador de downloads
      card.downloads = Number(card.downloads) + 1;
      await card.save();

      // Retorna os dados do card no formato JSON
      res.status(200).json({
        status: "success",
        message: "Download realizado com sucesso!",
        data: {
          id: card._id,
          title: card.title,
          listId: card.listId,
          downloads: card.downloads,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
      } else {
        res.status(500).json({
          status: "error",
          message: "Erro ao realizar o download",
        });
      }
    }
  }
}