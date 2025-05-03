import { Request, Response } from "express";
import { List } from "../models/List";
import { AppError } from "../middlewares/errorHandler";

export class ListController {
  async createList(req: Request, res: Response): Promise<void> {
    const { name, userId } = req.body;

    if (!name || !userId) {
      throw new AppError("Nome ou ID do usuário ausente", 400);
    }

    const list = await List.create({ name, userId });

    res.status(201).json({
      status: "success",
      data: {
        id: list._id,
        name: list.name,
      },
    });
  }

  async editList(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name } = req.body;

    const updatedList = await List.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedList) {
      throw new AppError("Lista não encontrada", 404);
    }

    res.status(200).json({
      status: "success",
      data: {
        id: updatedList._id,
        name: updatedList.name,
      },
    });
  }

  async getListByUserId(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;

    const lists = await List.find({ userId });

    if (!userId) {
      throw new AppError("Usuário não encontrado", 404);
    }
    // if (lists.length === 0) {
    //   throw new AppError("Nenhuma lista encontrada para este usuário", 404);
    // }
    //esta dando erro crashando o banco de dados 

    res.status(200).json({
      status: "success",
      data: lists.map((list) => ({
        id: list._id,
        name: list.name,
      })),
    });
  }

  async getListById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const list = await List.findById(id);

    if (!list) {
      throw new AppError("Lista não encontrada", 404);
    }

    res.status(200).json({
      status: "success",
      data: {
        id: list._id,
        name: list.name,
      },
    });
  }

  async getLists(req: Request, res: Response): Promise<void> {
    const lists = await List.find();

    res.status(200).json({
      status: "success",
      data: lists.map((list) => ({
        id: list._id,
        name: list.name,
      })),
    });
  }
}
