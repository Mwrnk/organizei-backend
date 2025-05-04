import { Request, Response } from "express";
const { Card } = require("../models/Card");
const { AppError } = require("../middlewares/errorHandler");

export class CardController {
  async createCard(req: Request, res: Response): Promise<void> {
    try {
      const { title, listId } = req.body;

      if (!listId || !title) {
        throw new AppError("O título e o ID da lista são obrigatórios", 400);
      }

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

  async editCard(req: Request, res: Response): Promise<void> {
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
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao editar cartão", 500);
    }
  }

  async deleteCard(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deletedCard = await Card.findByIdAndDelete(id);

      if (!deletedCard) {
        throw new AppError("Cartão não encontrado", 404);
      }

      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao deletar cartão", 500);
    }
  }

  async getCardById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const card = await Card.findById(id);

      if (!card) {
        throw new AppError("Cartão não encontrado", 404);
      }

      res.status(200).json({
        status: "success",
        data: {
          id: card._id,
          title: card.title,
        },
      });
    } catch (error) {
      throw new AppError("Erro ao buscar cartão", 500);
    }
  }
  // modificado para receber title e nao nome igual estava
  async getCardByTitle(req: Request, res: Response): Promise<void> {
    try {
      const { title } = req.params;

      const card = await Card.findOne({ title });

      if (!card) {
        throw new AppError("Cartão não encontrado", 404);
      }

      res.status(200).json({
        status: "success",
        data: {
          id: card._id,
          title: card.title,
        },
      });
    } catch (error) {
      throw new AppError("Erro ao buscar cartão", 500);
    }
  }
  //buscando cards de uma lista especifica
  async getCardsByListId(req: Request, res: Response): Promise<void> {
    const { listId } = req.params;

    const cards = await Card.find({ listId });

    res.status(200).json({
      status: "success",
      data: cards,
    });
  }
  //FEITO POR MATHEUS RIBAS 
  //ENDPOINT PARA BUSCAR TODOS OS CARDS CRIADOS 
async getAllCards(req: Request, res: Response): Promise<void> {
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
    res.status(500).json({
      status: "error",
      message: "Erro ao buscar os cards",
    });
  }
}

}
