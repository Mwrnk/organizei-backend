import { Response } from 'express';
import { Card, IComment, IImage } from '../models/card';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../types/express';
import { User } from '../models/user';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

// Configuração do Multer para armazenar arquivos em memória
const storage = multer.memoryStorage();

// Filtro para aceitar apenas imagens e PDFs
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Apenas imagens e PDFs são permitidos.'));
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
        throw new AppError('Usuário não autenticado', 401);
      }

      const cards = await Card.find(
        { userId },
        {
          _id: 0,
          id: '$_id',
          title: 1,
          priority: 1,
          is_published: 1,
          userId: 1,
          listId: 1,
        }
      )
        .sort({ createdAt: -1 })
        .populate({
          path: 'listId',
          populate: {
            path: 'userId',
          },
        });

      res.status(200).json({
        status: 'success',
        data: cards,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao buscar os cards', 500);
    }
  }

  // Método para buscar um card pelo ID
  async getCardById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const userId = req.user?.id?.toString();

      res.status(200).json({
        status: 'success',
        data: {
          pdfs: card.pdfs,
          id: card._id,
          title: card.title,
          priority: card.priority,
          is_published: card.is_published,
          userId: card.userId,
          listId: card.listId,
          image_url: (card as any).image_url,
          content: card.content,
          likes: card.likes,
          likedByUser: !!(userId && card.likedBy?.some((id: any) => id.toString() === userId)),
        },
      });
    } catch (error) {
      throw new AppError('Erro ao buscar cartão', 500);
    }
  }

  // Método para buscar um card pelo título
  async getCardByTitle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Busca total de documentos para calcular total de páginas
      const totalDocs = await Card.countDocuments({
        title: { $regex: title, $options: 'i' },
      });

      const cards = await Card.find({
        title: { $regex: title, $options: 'i' },
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalPages = Math.ceil(totalDocs / limit);

      res.status(200).json({
        status: 'success',
        data: {
          cards,
          pagination: {
            page,
            limit,
            totalDocs,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      throw new AppError('Erro ao buscar cartão', 500);
    }
  }

  // Método para buscar cards por ID da lista
  async getCardsByListId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { listId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const cards = await Card.find(
        { listId, userId },
        {
          _id: 0,
          id: '$_id',
          title: 1,
          priority: 1,
          is_published: 1,
          userId: 1,
        }
      );

      res.status(200).json({
        status: 'success',
        data: cards,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao buscar cartões da lista', 500);
    }
  }

  // Método para criar um novo card
  async createCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, listId, content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const card = await Card.create({
        title,
        listId,
        userId,
        content,
      });

      res.status(201).json({
        status: 'success',
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
      throw new AppError('Erro ao criar cartão', 500);
    }
  }

  // Método para dar like em um card
  async likeCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      // Inicializa o array likedBy se não existir
      if (!card.likedBy) {
        card.likedBy = [];
      }

      // Verifica se o usuário já deu like no card
      const hasLiked = card.likedBy.some(
        (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
      );

      if (hasLiked) {
        res.status(400).json({
          status: 'fail',
          message: 'Você já curtiu este card',
        });
        return;
      }

      // Adiciona o usuário à lista de likes
      card.likedBy.push(new mongoose.Types.ObjectId(userId));

      // Incrementa o contador de likes
      card.likes = (card.likes || 0) + 1;

      // Calcula quantos likes únicos o card tem (baseado no tamanho do array likedBy)
      const uniqueLikesCount = card.likedBy.length;

      // Verifica se atingiu um novo marco de 20 likes únicos
      if (uniqueLikesCount % 1 === 0) {
        const user = await User.findById(card.userId);
        if (user) {
          user.orgPoints = (user.orgPoints || 0) + 1;
          await user.save();
        }
      }

      await card.save();

      res.status(200).json({
        status: 'success',
        data: {
          id: card._id,
          title: card.title,
          likes: card.likes,
          userId: card.userId,
          uniqueLikes: uniqueLikesCount,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao dar like no cartão', 500);
    }
  }

  async unlikeCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      // Verifica se o card está publicado
      if (!card.is_published) {
        throw new AppError('Este card não está disponível para interações', 403);
      }

      // Verifica se o usuário está tentando descurtir seu próprio card
      if (card.userId.toString() === userId) {
        throw new AppError('Você não pode descurtir seu próprio card', 403);
      }

      // Verifica se o usuário já deu like no card
      const hasLiked = card.likedBy.some(
        (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
      );

      if (!hasLiked) {
        res.status(400).json({
          status: 'fail',
          message: 'Você ainda não curtiu este card',
        });
        return;
      }

      // Remove o usuário da lista de likes
      card.likedBy = card.likedBy.filter(
        (id: mongoose.Types.ObjectId) => id.toString() !== userId.toString()
      );

      // Decrementa o contador de likes
      card.likes = Math.max(0, (card.likes || 0) - 1);

      // Calcula quantos likes únicos o card tem
      const uniqueLikesCount = card.likedBy.length;

      await card.save();

      res.status(200).json({
        status: 'success',
        data: {
          id: card._id,
          title: card.title,
          likes: card.likes,
          userId: card.userId,
          uniqueLikes: uniqueLikesCount,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: 'fail',
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Erro ao remover like do cartão',
      });
    }
  }

  // Método para editar um card existente
  async editCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const { title, priority, is_published, image_url, content, listId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      if (card.userId.toString() !== userId) {
        throw new AppError('Você não tem permissão para editar este cartão', 403);
      }

      const updatedCard = await Card.findByIdAndUpdate(
        card._id,
        { title, priority, is_published, image_url, content, listId },
        { new: true, runValidators: true }
      );

      if (!updatedCard) {
        throw new AppError('Cartão não encontrado', 404);
      }

      res.status(200).json({
        status: 'success',
        data: {
          id: updatedCard._id,
          title: updatedCard.title,
          userId: updatedCard.userId,
          is_published: updatedCard.is_published,
          image: updatedCard.image,
          pdfs: updatedCard.pdfs,
          priority: updatedCard.priority,
          content: updatedCard.content,
          listId: updatedCard.listId,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao editar cartão', 500);
    }
  }

  // Método para buscar cards por ID do usuário
  async getCardsByUserId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const cards = await Card.find({ userId }).sort({ createdAt: -1 });

      res.status(200).json({
        status: 'success',
        data: cards,
      });
    } catch (error) {
      throw new AppError('Erro ao buscar cards do usuário', 500);
    }
  }
  // Método para deletar um card
  async deleteCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      if (card.userId.toString() !== userId) {
        throw new AppError('Você não tem permissão para deletar este cartão', 403);
      }

      await Card.findByIdAndDelete(card._id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao deletar cartão', 500);
    }
  }

  // Método para fazer upload de PDFs
  async uploadPdfs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const userId = req.user?.id;
      const files = req.files as Express.Multer.File[];

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      if (card.userId.toString() !== userId) {
        throw new AppError('Você não tem permissão para modificar este cartão', 403);
      }

      if (!files || files.length === 0) {
        res.status(400).json({ message: 'Nenhum arquivo enviado' });
        return;
      }

      const pdfs = [];

      for (const file of files) {
        if (file.mimetype === 'application/pdf') {
          pdfs.push({
            data: file.buffer,
            filename: file.originalname,
            mimetype: file.mimetype,
            uploaded_at: new Date(),
            size_kb: Math.round(file.size / 1024),
          });
        } else {
          throw new AppError('Apenas arquivos PDF são permitidos', 400);
        }
      }

      if (pdfs.length > 0) {
        card.pdfs = card.pdfs || [];
        card.pdfs = [...card.pdfs, ...pdfs];
      }

      await card.save();

      res.status(200).json({
        status: 'success',
        message: 'PDFs enviados com sucesso',
        data: {
          pdfs: pdfs.map((pdf) => ({
            filename: pdf.filename,
            size_kb: pdf.size_kb,
            uploaded_at: pdf.uploaded_at,
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
      console.error(error);
      if (error instanceof AppError) {
        throw error;
      }
      res.status(500).json({ message: 'Erro ao fazer upload dos PDFs' });
      return;
    }
  }

  // Método para fazer upload de imagem
  async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const userId = req.user?.id;
      const file = req.file as Express.Multer.File;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      if (card.userId.toString() !== userId) {
        throw new AppError('Você não tem permissão para modificar este cartão', 403);
      }

      if (!file) {
        res.status(400).json({ message: 'Nenhuma imagem enviada' });
        return;
      }

      if (!file.mimetype.startsWith('image/')) {
        throw new AppError('Apenas imagens são permitidas', 400);
      }

      // Verifica se já existe uma imagem salva
      if (card.image && (card.image.filename || card.image.data)) {
        throw new AppError(
          'Este card já possui uma imagem. Remova a imagem existente antes de adicionar uma nova.',
          400
        );
      }

      const image = {
        data: file.buffer,
        filename: file.originalname,
        mimetype: file.mimetype,
        uploaded_at: new Date(),
        size_kb: Math.round(file.size / 1024),
      };

      card.image = image;
      await card.save();

      res.status(200).json({
        status: 'success',
        message: 'Imagem enviada com sucesso',
        data: {
          image: {
            filename: image.filename,
            size_kb: image.size_kb,
            uploaded_at: image.uploaded_at,
          },
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
      console.error(error);
      if (error instanceof AppError) {
        throw error;
      }
      res.status(500).json({ message: 'Erro ao fazer upload da imagem' });
      return;
    }
  }

  // Método para adicionar um comentário em um card
  async addComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const userId = req.user?.id;
      const { text } = req.body;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
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
        status: 'success',
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
      throw new AppError('Erro ao adicionar comentário', 500);
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
        status: 'success',
        data: populatedComments,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao buscar comentários', 500);
    }
  }

  // Método para deletar um comentário
  async deleteComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const userId = req.user?.id;
      const { commentId } = req.params;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const commentIndex = card.comments.findIndex(
        (c: IComment) => c._id.toString() === commentId && c.userId.toString() === userId
      );

      if (commentIndex === -1) {
        throw new AppError('Comentário não encontrado ou sem permissão', 404);
      }

      card.comments.splice(commentIndex, 1);
      await card.save();

      res.status(200).json({
        status: 'success',
        message: 'Comentário removido com sucesso',
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao remover comentário', 500);
    }
  }

  // Método para download de PDF
  async downloadPdf(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const { pdfIndex } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      // Verifica se o card está publicado ou se o usuário é o dono
      if (!card.is_published && card.userId.toString() !== userId) {
        throw new AppError('Você não tem permissão para acessar este PDF', 403);
      }

      // Verifica se o card tem PDFs - retorna resposta JSON em vez de erro
      if (!card.pdfs || card.pdfs.length === 0) {
        res.status(200).json({
          status: 'info',
          message: 'Este card não possui PDFs disponíveis para download',
          data: {
            hasPdfs: false,
            cardTitle: card.title,
          },
        });
        return;
      }

      const pdfIndexNum = parseInt(pdfIndex);
      if (isNaN(pdfIndexNum) || pdfIndexNum < 0 || pdfIndexNum >= card.pdfs.length) {
        res.status(200).json({
          status: 'info',
          message: 'PDF não encontrado no índice especificado',
          data: {
            hasPdfs: true,
            availablePdfs: card.pdfs.length,
            requestedIndex: pdfIndexNum,
          },
        });
        return;
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
      throw new AppError('Erro ao fazer download do PDF', 500);
    }
  }

  getPdfsByCardId = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const cardId = req.params.id;

      const pdfsFromCard = await Card.findById(cardId, {
        'pdfs.filename': 1,
        'pdfs.mimetype': 1,
        'pdfs.uploaded_at': 1,
        'pdfs.size_kb': 1,
      });

      res.status(200).json({
        status: 'success',
        pdfsFromCard,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao visualizar o PDF', 500);
    }
  };

  // Método para visualizar PDF
  async viewPdf(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cardId = req.card._id;
      const { pdfIndex } = req.params;
      const userId = req.user?.id;

      const card = await Card.findById(cardId);

      if (!card) {
        throw new AppError('Cartão não encontrado', 404);
      }

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      // Verifica se o card está publicado ou se o usuário é o dono
      if (!card.is_published && card.userId.toString() !== userId) {
        throw new AppError('Você não tem permissão para acessar este PDF', 403);
      }

      // Verifica se o card tem PDFs - retorna resposta JSON em vez de erro
      if (!card.pdfs || card.pdfs.length === 0) {
        res.status(200).json({
          status: 'info',
          message: 'Este card não possui PDFs disponíveis',
          data: {
            hasPdfs: false,
            cardTitle: card.title,
          },
        });
        return;
      }

      const pdfIndexNum = parseInt(pdfIndex);
      if (isNaN(pdfIndexNum) || pdfIndexNum < 0 || pdfIndexNum >= card.pdfs.length) {
        res.status(200).json({
          status: 'info',
          message: 'PDF não encontrado no índice especificado',
          data: {
            hasPdfs: true,
            availablePdfs: card.pdfs.length,
            requestedIndex: pdfIndexNum,
          },
        });
        return;
      }

      const pdf = card.pdfs[pdfIndexNum];
      if (!pdf || !pdf.data) {
        res.status(200).json({
          status: 'info',
          message: 'PDF corrompido ou vazio',
          data: {
            hasPdfs: true,
            pdfExists: false,
          },
        });
        return;
      }

      // Configura os headers para visualização inline do PDF
      res.setHeader('Content-Type', pdf.mimetype);
      res.setHeader('Content-Disposition', `inline; filename="${pdf.filename}"`);
      res.setHeader('Content-Length', pdf.data.length);

      // Envia o arquivo
      res.send(pdf.data);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao visualizar o PDF', 500);
    }
  }

  async viewImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;

      if (!card.image) {
        throw new AppError('Este card não possui imagem', 404);
      }

      res.setHeader('Content-Type', card.image.mimetype);
      res.send(card.image.data);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao visualizar imagem', 500);
    }
  }

  async downloadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;

      if (!card.image) {
        throw new AppError('Este card não possui imagem', 404);
      }

      res.setHeader('Content-Type', card.image.mimetype);
      res.setHeader('Content-Disposition', `attachment; filename="${card.image.filename}"`);
      res.send(card.image.data);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao baixar imagem', 500);
    }
  }

  async getImageInfo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;

      if (!card.image) {
        res.status(200).json({
          status: 'success',
          data: null,
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: {
          filename: card.image.filename,
          size_kb: card.image.size_kb,
          uploaded_at: card.image.uploaded_at,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao buscar informações da imagem', 500);
    }
  }

  async removeImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const card = req.card;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuário não autenticado', 401);
      }

      if (card.userId.toString() !== userId) {
        throw new AppError('Você não tem permissão para modificar este cartão', 403);
      }

      if (!card.image) {
        throw new AppError('Este card não possui imagem para remover', 404);
      }

      card.image = null;
      await card.save();

      res.status(200).json({
        status: 'success',
        message: 'Imagem removida com sucesso',
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao remover imagem', 500);
    }
  }
}
