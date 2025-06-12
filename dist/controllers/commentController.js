"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const Comment_1 = require("../models/Comment");
const errorHandler_1 = require("../middlewares/errorHandler");
class CommentController {
    getComments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { cardId } = req.params;
                const comments = yield Comment_1.Comment.find({ cardId }).populate("userId", "name email profileImage");
                res.status(200).json({
                    status: "success",
                    data: comments,
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                else {
                    throw new errorHandler_1.AppError("Erro ao buscar comentários", 500);
                }
            }
        });
    }
    createComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { cardId, description } = req.body;
                const userId = req.user.id;
                //antes estava const userId = req.userId mas nao estava funcionando rsrsrsrs
                const newComment = yield Comment_1.Comment.create({
                    cardId,
                    description,
                    userId,
                });
                res.status(201).json({
                    status: "success",
                    data: newComment,
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                else {
                    throw new errorHandler_1.AppError("Erro ao criar comentário", 500);
                }
            }
        });
    }
    updateComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { commentId } = req.params;
                const { description } = req.body;
                const userId = req.userId;
                const comment = yield Comment_1.Comment.findById(commentId);
                if (!comment) {
                    throw new errorHandler_1.AppError("Comentário não encontrado", 404);
                }
                if (comment.userId.toString() !== userId) {
                    throw new errorHandler_1.AppError("Você não tem permissão para editar este comentário", 403);
                }
                comment.description = description;
                yield comment.save();
                res.status(200).json({
                    status: "success",
                    data: comment,
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                else {
                    throw new errorHandler_1.AppError("Erro ao atualizar comentário", 500);
                }
            }
        });
    }
    deleteComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { commentId } = req.params;
                const userId = req.userId;
                const comment = yield Comment_1.Comment.findById(commentId);
                if (!comment) {
                    throw new errorHandler_1.AppError("Comentário não encontrado", 404);
                }
                if (comment.userId.toString() !== userId) {
                    throw new errorHandler_1.AppError("Você não tem permissão para deletar este comentário", 403);
                }
                yield Comment_1.Comment.findByIdAndDelete(commentId);
                res.status(204).json({
                    status: "success",
                    message: "Comentário deletado com sucesso",
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                else {
                    throw new errorHandler_1.AppError("Erro ao deletar comentário", 500);
                }
            }
        });
    }
    getAllComments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const comments = yield Comment_1.Comment.find().populate("userId", "name email");
                res.status(200).json({
                    status: "success",
                    data: comments,
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                else {
                    throw new errorHandler_1.AppError("Erro ao buscar comentários", 500);
                }
            }
        });
    }
}
exports.CommentController = CommentController;
