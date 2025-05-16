import { Response } from "express";
import { Tag } from "../models/Flashcard";
import { AppError } from "../middlewares/errorHandler";
import { AuthRequest } from "../types/express";

export class TagController {
    async getAllTag(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError("Usuário não autenticado", 401);
            }

            const tags = await Tag.find();

            res.status(200).json({ status: "success", tags });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Erro ao buscar as tags", 500);
        }
    };

    async getTagById(req: AuthRequest, res: Response): Promise<void> {
        try {
            const tag = req.tag;

            res.status(200).json({ status: "success", tag });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Erro ao buscar a tag", 500);
        }
    };

    async getTagByName(req: AuthRequest, res: Response): Promise<void> {
        try {
            const tags = req.tags;

            res.status(200).json({ status: "success", tags });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Erro ao buscar a tag", 500);
        }
    };

    async createTag(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { name } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError("Usuário não autenticado", 401);
            }

            const tag = await Tag.create({ name });

            res.status(201).json({ status: "success", data: tag });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Erro ao criar a tag", 500);
        }
    };

    async editTag(req: AuthRequest, res: Response): Promise<void> {
        try {
            const tag = req.tag;
            const { name } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError("Usuário não autenticado", 401);
            }

            const updatedTag = await Tag.findByIdAndUpdate(
                tag.id, 
                { name }, 
                { new: true, runValidators: true }
            );

            if (!updatedTag) {
                throw new AppError("Tag não encontrada", 404);
            }

            res.status(200).json({ status: "success", data: updatedTag });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Erro ao atualizar a tag", 500);
        }
    };

    async deleteTag(req: AuthRequest, res: Response): Promise<void> {
        try {
            const tag = req.tag;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError("Usuário não autenticado", 401);
            }

            const deletedTag = await Tag.findByIdAndDelete(tag.id);

            if (!deletedTag) {
                throw new AppError("Tag não encontrada", 404);
            }

            res.status(204).json({ status: "success" });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Erro ao deletar a tag", 500);
        }
    };
}
