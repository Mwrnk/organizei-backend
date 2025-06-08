import OpenAI from "openai";
import { Response } from "express";
import { AuthRequest } from "../types/express";
import { AppError } from "../middlewares/errorHandler";
import { QuizSession, IQuizQuestion } from "../models/quiz";
import { Card } from "../models/card";
import { User } from "../models/user";
import { generateQuizPrompt, context, model, temperature } from "../prompts/generateQuizPrompt";
import pdfParse from "pdf-parse";
import dotenv from "dotenv";

dotenv.config();

export class QuizController {
  private clientOpenAI: OpenAI;

  constructor() {
    this.clientOpenAI = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Iniciar uma nova sessão de quiz
  startQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { cardId } = req.params;
      const { amount = 1 } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      // Validar quantidade de perguntas
      if (amount < 1 || amount > 10) {
        throw new AppError("A quantidade de perguntas deve estar entre 1 e 10", 400);
      }

      // Buscar o card
      const card = await Card.findById(cardId);
      if (!card) {
        throw new AppError("Card não encontrado", 404);
      }

      // Verificar se o card tem PDFs
      if (!card.pdfs || card.pdfs.length === 0) {
        throw new AppError("Este card não possui PDFs para gerar perguntas. Por favor, adicione um PDF ao card primeiro.", 400);
      }

      // Verificar se o primeiro PDF tem dados válidos
      if (!card.pdfs[0]?.data) {
        throw new AppError("O PDF deste card está corrompido ou vazio. Por favor, faça upload de um novo PDF.", 400);
      }

      // Verificar se o usuário tem acesso ao card
      if (card.userId.toString() !== userId && !card.is_published) {
        throw new AppError("Você não tem acesso a este card", 403);
      }

      // Verificar se já existe uma sessão ativa para este usuário e card
      const existingSession = await QuizSession.findOne({
        userId,
        cardId,
        status: "active"
      });

      if (existingSession) {
        throw new AppError("Você já possui uma sessão de quiz ativa para este card", 400);
      }

      // Extrair texto do primeiro PDF
      const pdfContent = await this.extractTextFromPdf(card.pdfs[0].data);
      
      if (!pdfContent || pdfContent.trim().length < 50) {
        throw new AppError("Não foi possível extrair conteúdo suficiente do PDF", 400);
      }

      // Gerar pergunta usando IA
      const question = await this.generateQuestionWithAI(pdfContent, card.title);

      // Criar nova sessão de quiz
      const quizSession = await QuizSession.create({
        userId,
        cardId,
        question,
        status: "active"
      });

      res.status(201).json({
        status: "success",
        data: {
          sessionId: quizSession._id,
          question: {
            question: question.question,
            options: question.options
          },
          cardTitle: card.title
        }
      });

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Erro ao iniciar quiz:", error);
      throw new AppError("Erro ao iniciar quiz", 500);
    }
  };

  // Responder uma pergunta
  answerQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const { answer, timeSpent } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      // Validar resposta
      if (typeof answer !== "number" || answer < 0 || answer > 3) {
        throw new AppError("Resposta inválida. Deve ser um número entre 0 e 3", 400);
      }

      // Buscar sessão
      const session = await QuizSession.findById(sessionId);
      if (!session) {
        throw new AppError("Sessão de quiz não encontrada", 404);
      }

      // Verificar se é do usuário correto
      if (session.userId.toString() !== userId) {
        throw new AppError("Você não tem acesso a esta sessão", 403);
      }

      // Verificar se a sessão ainda está ativa
      if (session.status !== "active") {
        throw new AppError("Esta sessão já foi finalizada", 400);
      }

      // Verificar se já foi respondida
      if (session.userAnswer !== undefined) {
        throw new AppError("Esta pergunta já foi respondida", 400);
      }

      // Verificar se a resposta está correta
      const isCorrect = answer === session.question.correctAnswer;
      
      // Calcular pontos (10 pontos para resposta correta)
      const pointsEarned = isCorrect ? 10 : 0;

      // Atualizar sessão
      session.userAnswer = answer;
      session.isCorrect = isCorrect;
      session.pointsEarned = pointsEarned;
      session.timeSpent = timeSpent || 0;
      session.status = "completed";
      session.completedAt = new Date();

      await session.save();

      // Se acertou, adicionar OrgPoints ao usuário
      if (isCorrect) {
        const user = await User.findById(userId);
        if (user) {
          user.orgPoints = (user.orgPoints || 0) + 1;
          await user.save();
        }
      }

      res.status(200).json({
        status: "success",
        data: {
          isCorrect,
          correctAnswer: session.question.correctAnswer,
          correctOption: session.question.options[session.question.correctAnswer],
          pointsEarned,
          totalOrgPoints: isCorrect ? (await User.findById(userId))?.orgPoints : undefined
        }
      });

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Erro ao responder pergunta:", error);
      throw new AppError("Erro ao responder pergunta", 500);
    }
  };

  // Obter estatísticas do usuário
  getQuizStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      // Buscar estatísticas
      const totalQuizzes = await QuizSession.countDocuments({ 
        userId, 
        status: "completed" 
      });

      const correctAnswers = await QuizSession.countDocuments({ 
        userId, 
        status: "completed",
        isCorrect: true 
      });

      const totalPoints = await QuizSession.aggregate([
        { $match: { userId: userId, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$pointsEarned" } } }
      ]);

      const user = await User.findById(userId);

      res.status(200).json({
        status: "success",
        data: {
          totalQuizzes,
          correctAnswers,
          accuracy: totalQuizzes > 0 ? Math.round((correctAnswers / totalQuizzes) * 100) : 0,
          totalPointsEarned: totalPoints[0]?.total || 0,
          currentOrgPoints: user?.orgPoints || 0
        }
      });

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Erro ao buscar estatísticas:", error);
      throw new AppError("Erro ao buscar estatísticas", 500);
    }
  };

  // Obter histórico de quizzes
  getQuizHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const totalDocs = await QuizSession.countDocuments({ 
        userId, 
        status: "completed" 
      });

      const quizzes = await QuizSession.find({ 
        userId, 
        status: "completed" 
      })
      .populate({
        path: "cardId",
        select: "title"
      })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit);

      const totalPages = Math.ceil(totalDocs / limit);

      res.status(200).json({
        status: "success",
        data: {
          quizzes: quizzes.map(quiz => ({
            id: quiz._id,
            cardTitle: (quiz.cardId as any)?.title,
            question: quiz.question.question,
            userAnswer: quiz.question.options[quiz.userAnswer!],
            correctAnswer: quiz.question.options[quiz.question.correctAnswer],
            isCorrect: quiz.isCorrect,
            pointsEarned: quiz.pointsEarned,
            timeSpent: quiz.timeSpent,
            completedAt: quiz.completedAt
          })),
          pagination: {
            page,
            limit,
            totalDocs,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Erro ao buscar histórico:", error);
      throw new AppError("Erro ao buscar histórico", 500);
    }
  };

  // Método privado para extrair texto do PDF
  private extractTextFromPdf = async (pdfBuffer: Buffer): Promise<string> => {
    try {
      const data = await pdfParse(pdfBuffer);
      return data.text;
    } catch (error) {
      console.error("Erro ao extrair texto do PDF:", error);
      throw new AppError("Erro ao processar PDF", 500);
    }
  };

  // Método privado para gerar pergunta com IA
  private generateQuestionWithAI = async (
    pdfContent: string, 
    cardTitle: string
  ): Promise<IQuizQuestion> => {
    try {
      // Limitar o conteúdo para evitar tokens excessivos (primeiros 3000 caracteres)
      const limitedContent = pdfContent.substring(0, 3000);
      
      const prompt = generateQuizPrompt(1, limitedContent, cardTitle);

      const completion = await this.clientOpenAI.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: context
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: temperature,
      });

      if (!completion.choices[0].message.content) {
        throw new AppError("Nenhuma resposta da OpenAI", 500);
      }

      const questionData = JSON.parse(completion.choices[0].message.content);

      // Validar estrutura da resposta
      if (!questionData.question || !Array.isArray(questionData.options) || 
          questionData.options.length !== 4 || 
          typeof questionData.correctAnswer !== "number" ||
          questionData.correctAnswer < 0 || questionData.correctAnswer > 3) {
        throw new AppError("Formato de pergunta inválido gerado pela IA", 500);
      }

      return {
        question: questionData.question,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer
      };

    } catch (error) {
      console.error("Erro ao gerar pergunta com IA:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao gerar pergunta", 500);
    }
  };
} 