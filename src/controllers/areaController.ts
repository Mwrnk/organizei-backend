import { Request, Response } from "express";
const { Area } = require("../models/Area");
const { List } = require("../models/List");
const { Card } = require("../models/Card");
const { AppError } = require("../middlewares/errorHandler");

export class AreaController {
  async createArea(req: Request, res: Response): Promise<void> {
    const { type, userId } = req.body;

    const area = await Area.create({ type, userId });

    res.status(201).json({
      status: "success",
      data: {
        id: area._id,
        type: area.type,
        userId: area.userId,
      },
    });
  }

  async editArea(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { type } = req.body;

    const updatedArea = await Area.findByIdAndUpdate(
      id,
      { type },
      { new: true, runValidators: true }
    );

    if (!updatedArea) {
      throw new AppError("Área não encontrada", 404);
    }

    res.status(200).json({
      status: "success",
      data: {
        id: updatedArea._id,
        type: updatedArea.type,
        userId: updatedArea.userId,
      },
    });
  }

  async getAreaByUserId(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;

    if (!userId) {
      throw new AppError("ID do usuário não fornecido", 400);
    }

    const areas = await Area.find({ userId });

    if (areas.length === 0) {
      throw new AppError("Nenhuma área encontrada para este usuário", 404);
    }

    res.status(200).json({
      status: "success",
      data: areas.map((area: any) => ({
        id: area._id,
        type: area.type,
        userId: area.userId,
      })),
    });
  }

  async getAreaById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const area = await Area.findById(id);

    if (!area) {
      throw new AppError("Área não encontrada", 404);
    }

    res.status(200).json({
      status: "success",
      data: {
        id: area._id,
        type: area.type,
        userId: area.userId,
      },
    });
  }

  async getAreas(req: Request, res: Response): Promise<void> {
    const areas = await Area.find();

    res.status(200).json({
      status: "success",
      data: areas.map((area: any) => ({
        id: area._id,
        type: area.type,
        userId: area.userId,
      })),
    });
  }

  async deleteArea(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const deletedArea = await Area.findByIdAndDelete(id);

    if (!deletedArea) {
      throw new AppError("Área não encontrada", 404);
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  }

  // 🔗 Endpoint que retorna os Cards relacionados a uma Área via List do mesmo userId
  async getCardsByArea(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const area = await Area.findById(id);

    if (!area) {
      throw new AppError("Área não encontrada", 404);
    }

    const lists = await List.find({ userId: area.userId });

    const listIds = lists.map((list: any) => list._id);

    const cards = await Card.find({ listId: { $in: listIds } });

    res.status(200).json({
      status: "success",
      data: cards,
    });
  }
}
