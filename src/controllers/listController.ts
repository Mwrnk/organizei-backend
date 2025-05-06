import { Response } from "express";
import { List } from "../models/List";
import { AppError } from "../middlewares/errorHandler";
import { AuthRequest } from "../types/express";

export class ListController {
  async createList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, userId } = req.body;
      const list = await List.create({ name, userId });

      res.status(201).json({
        status: "success",
        data: {
          id: list._id,
          name: list.name,
        },
      });
    } catch (error) {
      throw new AppError("Erro ao criar lista", 500);
    }
  }

  async editList(req: AuthRequest, res: Response): Promise<void> {
    try {
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
    } catch (error) {
      throw new AppError("Erro ao editar lista", 500);
    }
  }

  async getListByUserId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const lists = await List.find({ userId });

      res.status(200).json({
        status: "success",
        data: lists.map((list) => ({
          id: list._id,
          name: list.name,
        })),
      });
    } catch (error) {
      throw new AppError("Erro ao buscar listas do usuário", 500);
    }
  }

  async getListById(req: AuthRequest, res: Response): Promise<void> {
    try {
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
    } catch (error) {
      throw new AppError("Erro ao buscar lista", 500);
    }
  }

  async getLists(req: AuthRequest, res: Response): Promise<void> {
    try {
      const lists = await List.find();

      res.status(200).json({
        status: "success",
        data: lists.map((list) => ({
          id: list._id,
          name: list.name,
        })),
      });
    } catch (error) {
      throw new AppError("Erro ao buscar listas", 500);
    }
  }

  async deleteList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await List.findByIdAndDelete(id);

      res.status(204).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      throw new AppError("Erro ao deletar lista", 500);
    }
  }
}
