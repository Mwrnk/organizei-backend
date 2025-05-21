import { Response } from "express";
import { Card, IComment } from "../models/card";
import { AppError } from "../middlewares/errorHandler";
import { AuthRequest } from "../types/express";
import { User } from "../models/user";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

// Configuração do Multer para gerenciar uploads de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define a pasta 'uploads' como destino dos arquivos
    const uploadDir = "uploads";
    // Cria a pasta se ela não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gera um nome único para o arquivo usando timestamp + número aleatório
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Mantém a extensão original do arquivo
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Filtro para aceitar apenas imagens e PDFs
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Verifica se o arquivo é uma imagem ou PDF
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipo de arquivo não suportado. Apenas imagens e PDFs são permitidos."
      )
    );
  }
};

// Configuração final do Multer com limite de tamanho de arquivo
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB por arquivo
  },
});

export interface IPdf {
  data: Buffer;
  filename: string;
  mimetype: string;
  uploaded_at: Date;
  size_kb?: number;
}

export class CardController {
  // Método para buscar todos os cards do usuário
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

  // Método para buscar um card específico por ID
  // async getCardById(req: AuthRequest, res: Response): Promise<void> {
  //   try {
  //     const card = req.card;

  //     res.status(200).json({
  //       status: "success",
  //       data: {
  //         id: card._id,
  //         title: card.title,
  //         priority: card.priority,
  //         is_published: card.is_published,
  //         userId: card.userId,
  //         listId: card.listId,
  //       },
  //     });
  //   } catch (error) {
  //     if (error instanceof AppError) {
  //       throw error;
  //     }
  //     throw new AppError("Erro ao buscar cartão", 500);
  //   }
  // }

  //atualizado getCardById para devolver o pdf e imagens dos cards
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
          pdfs: card.pdfs, 
          image_url: card.image_url, 
          content: card.content, 
        },
      });
    } catch (error) {
      throw new AppError("Erro ao buscar cartão", 500);
    }
  }

  // Método para buscar um card pelo título
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

  // Método para buscar cards por ID da lista
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

  // Método para criar um novo card
  async createCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, listId, content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const card = await Card.create({
        title,
        listId,
        userId,
        content,
      });

      res.status(201).json({
        status: "success",
        data: {
          id: card._id,
          title: card.title,
          listId: card.listId,
          userId: card.userId,
          content: card.content,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao criar cartão", 500);
    }
  }

  // Método para dar like em um card
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
          message: "Você já curtiu este card",
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
        throw error;
      }
      throw new AppError("Erro ao dar like no cartão", 500);
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
        throw new AppError(
          "Este card não está disponível para interações",
          403
        );
      }

      // Verifica se o usuário está tentando descurtir seu próprio card
      if (card.userId.toString() === userId) {
        throw new AppError("Você não pode descurtir seu próprio card", 403);
      }

      // Verifica se o usuário já deu like no card
      if (!card.likedBy || !card.likedBy.includes(userId)) {
        res.status(400).json({
          status: "fail",
          message: "Você ainda não curtiu este card",
        });
        return;
      }

      // Remove o usuário da lista de likes
      card.likedBy = card.likedBy.filter(
        (id: string | number) => id.toString() !== userId
      );

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
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        status: "error",
        message: "Erro ao remover like do cartão",
      });
    }
  }

  // Método para editar um card existente
  async editCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const { title, priority, is_published, image_url, content } = req.body;
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
        { title, priority, is_published, image_url, content },
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
          is_published: updatedCard.is_published,
          image_url: updatedCard.image_url,
          pdfs: updatedCard.pdfs,
          priority: updatedCard.priority,
          content: updatedCard.content,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao editar cartão", 500);
    }
  }

  // Método para buscar cards por ID do usuário
  async getCardsByUserId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const cards = await Card.find({ userId })
        .sort({ createdAt: -1 });

      res.status(200).json({
        status: "success",
        data: cards,
      });
    } catch (error) {
      throw new AppError("Erro ao buscar cards do usuário", 500);
    }
  }
  // Método para deletar um card
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

  // Método para fazer upload de arquivos (imagens e PDFs)
  async uploadFiles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const userId = req.user?.id;
      const files = req.files as Express.Multer.File[];

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      if (card.userId.toString() !== userId) {
        throw new AppError(
          "Você não tem permissão para modificar este cartão",
          403
        );
      }

      if (!files || files.length === 0) {
        throw new AppError("Nenhum arquivo enviado", 400);
      }

      const imageUrls = [];
      const pdfs = [];

      for (const file of files) {
        const fileUrl = `/uploads/${file.filename}`;

        if (file.mimetype.startsWith("image/")) {
          imageUrls.push(fileUrl);
        } else if (file.mimetype === "application/pdf") {
          pdfs.push({
            data: file.buffer,
            filename: file.originalname,
            mimetype: file.mimetype,
            uploaded_at: new Date(),
            size_kb: Math.round(file.size / 1024),
          });
        }
      }

      // Atualiza o card com os novos arquivos
      if (imageUrls.length > 0) {
        card.image_url = card.image_url || [];
        card.image_url = [...card.image_url, ...imageUrls];
      }

      if (pdfs.length > 0) {
        card.pdfs = card.pdfs || [];
        card.pdfs = [...card.pdfs, ...pdfs];
      }

      await card.save();

      res.status(200).json({
        status: "success",
        message: "Arquivos enviados com sucesso",
        data: {
          images: imageUrls,
          pdfs: pdfs.map(pdf => ({
            filename: pdf.filename,
            size_kb: pdf.size_kb,
            uploaded_at: pdf.uploaded_at
          })),
          card: {
            id: card._id,
            title: card.title,
            content: card.content,
            priority: card.priority,
            is_published: card.is_published,
            listId: card.listId,
            userId: card.userId,
            likes: card.likes,
            downloads: card.downloads,
            createdAt: card.createdAt,
            updatedAt: card.updatedAt,
          },
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao fazer upload dos arquivos", 500);
    }
  }

  // Método para adicionar um comentário em um card
  async addComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const userId = req.user?.id;
      const { text } = req.body;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const comment = {
        userId: new mongoose.Types.ObjectId(userId),
        text,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Adiciona o comentário ao card
      card.comments.push(comment);
      await card.save();

      res.status(201).json({
        status: "success",
        data: {
          comment,
          card: {
            id: card._id,
            title: card.title,
          },
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao adicionar comentário", 500);
    }
  }

  // Método para buscar comentários de um card
  async getComments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;

      const populatedComments = await Promise.all(
        card.comments.map(async (comment: IComment) => {
          const user = await User.findById(comment.userId);
          return {
            _id: comment._id,
            userId: comment.userId,
            text: comment.text,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            user: user
              ? {
                  id: user._id,
                  name: user.name,
                  email: user.email,
                }
              : null,
          };
        })
      );

      res.status(200).json({
        status: "success",
        data: populatedComments,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao buscar comentários", 500);
    }
  }

  // Método para deletar um comentário
  async deleteComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const userId = req.user?.id;
      const { commentId } = req.params;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const commentIndex = card.comments.findIndex(
        (c: IComment) =>
          c._id.toString() === commentId && c.userId.toString() === userId
      );

      if (commentIndex === -1) {
        throw new AppError("Comentário não encontrado ou sem permissão", 404);
      }

      card.comments.splice(commentIndex, 1);
      await card.save();

      res.status(200).json({
        status: "success",
        message: "Comentário removido com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao remover comentário", 500);
    }
  }

  // Método para download de PDF
  async downloadPdf(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const { pdfIndex } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      // Verifica se o card está publicado ou se o usuário é o dono
      if (!card.is_published && card.userId.toString() !== userId) {
        throw new AppError("Você não tem permissão para acessar este PDF", 403);
      }

      const pdfIndexNum = parseInt(pdfIndex);
      if (isNaN(pdfIndexNum) || pdfIndexNum < 0 || pdfIndexNum >= card.pdfs.length) {
        throw new AppError("PDF não encontrado", 404);
      }

      const pdf = card.pdfs[pdfIndexNum];

      // Incrementa o contador de downloads
      card.downloads = (card.downloads || 0) + 1;
      await card.save();

      // Configura os headers para download
      res.setHeader('Content-Type', pdf.mimetype);
      res.setHeader('Content-Disposition', `attachment; filename="${pdf.filename}"`);
      res.setHeader('Content-Length', pdf.data.length);

      // Envia o arquivo
      res.send(pdf.data);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao fazer download do PDF", 500);
    }
  }
}
