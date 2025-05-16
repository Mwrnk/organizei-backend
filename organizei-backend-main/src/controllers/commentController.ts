import { Response } from "express";
import { Comment } from "../models/Comment";
import { AppError } from "../middlewares/errorHandler";

export class CommentController {
  async getComments(req: any, res: Response): Promise<void> {
    try {
      const { cardId } = req.params;
      const comments = await Comment.find({ cardId }).populate(
        "userId",
        "name email"
      );

      res.status(200).json({
        status: "success",
        data: comments,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError("Erro ao buscar comentários", 500);
      }
    }
  }

  async createComment(req: any, res: Response): Promise<void> {
    try {
      const { cardId, description } = req.body;
      const userId = req.userId;

      const newComment = await Comment.create({
        cardId,
        description,
        userId,
      });

      res.status(201).json({
        status: "success",
        data: newComment,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError("Erro ao criar comentário", 500);
      }
    }
  }

  async updateComment(req: any, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const { description } = req.body;
      const userId = req.userId;

      const comment = await Comment.findById(commentId);

      if (!comment) {
        throw new AppError("Comentário não encontrado", 404);
      }

      if (comment.userId.toString() !== userId) {
        throw new AppError(
          "Você não tem permissão para editar este comentário",
          403
        );
      }

      comment.description = description;
      await comment.save();

      res.status(200).json({
        status: "success",
        data: comment,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError("Erro ao atualizar comentário", 500);
      }
    }
  }

  async deleteComment(req: any, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const userId = req.userId;

      const comment = await Comment.findById(commentId);

      if (!comment) {
        throw new AppError("Comentário não encontrado", 404);
      }

      if (comment.userId.toString() !== userId) {
        throw new AppError(
          "Você não tem permissão para deletar este comentário",
          403
        );
      }

      await Comment.findByIdAndDelete(commentId);

      res.status(204).json({
        status: "success",
        message: "Comentário deletado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError("Erro ao deletar comentário", 500);
      }
    }
  }
 async getAllComments(req: any, res: Response): Promise<void> {
    try {
      const comments = await Comment.find().populate("userId", "name email");

      res.status(200).json({
        status: "success",
        data: comments,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError("Erro ao buscar comentários", 500);
      }
    }
  }


}
