import { NextFunction, Response } from "express";
import { AppError } from "./errorHandler";
import { AuthRequest } from "../types/express";
import { Flashcard, Tag } from "../models/flashcard";
import { Card } from "../models/card";

export const checkFlashcardById = async (
      req: AuthRequest,
      res: Response,
      next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new AppError("ID inválido", 400);
        }

        const flashcard = await Flashcard.findById(id)
            .populate({
                path: "tags"
            });

        if  (!flashcard) {
            throw new AppError("Flashcard não encontrado", 404);
        }

        req.flashcard = flashcard;
        next();

    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError("Erro ao verificar cartão", 500);
    }
}

export const checkFlashcardOwnership = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        const flashcard = req.flashcard;

        if (!userId) {
            throw new AppError("Usuário não autenticado", 401);
        }

        if (flashcard?.userId?.toString() !== userId) {
            throw new AppError("Você não tem permissão para realizar esta ação", 403);
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const validateFlashcardWithAIData = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { cardId, amount } = req.body;

        if(!cardId || !amount){
            throw new AppError("O ID do card e a quantidade a gerar são obrigatórios", 400);
        }

        const parsedAmount = Number(amount);

        if(!Number.isInteger(parsedAmount) || parsedAmount < 1 || parsedAmount > 10){
            throw new AppError("A quantidade a gerar deve ser um número inteiro entre 1 e 10", 400);
        }

        if (!cardId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new AppError("ID do card é inválido", 400);
        }

        const card = await Card.findById(cardId);

        if(!card){
            throw new AppError("Card não encontrado", 404);
        }

        req.card = card;

        next();
    } catch (error) {
        next(error);
    }
};

export const validateFlashcardData = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { cardId, front, back, tags } = req.body;

        if(!cardId || !front || !back || !tags){
            throw new AppError("O ID do card, front e back do flashcard e pelo menos 1 tag são obrigatórios", 400);
        }

        if(tags.length === 0) {
            throw new AppError("O array de tags esta vazio", 400);
        }

        const tagsIds = tags.map((tagId: string) => {
            if (!tagId.match(/^[0-9a-fA-F]{24}$/)) {
                throw new AppError("ID de uma tag é inválido", 400);
            }

            return tagId;
        });

        const foundedTags = await Tag.find({ _id: { $in: tagsIds } });

        if(foundedTags.length === 0){
            throw new AppError("Nenhuma tag encontrada", 404);
        }

        if (!cardId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new AppError("ID do card é inválido", 400);
        }

        const card = await Card.findById(cardId);

        if(!card){
            throw new AppError("Card não encontrado", 404);
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const validateFlashcardReviewData = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { grade } = req.body;

        if(!grade) {
            throw new AppError("A nota do nível de dificuldadde é obrigatória", 400);
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const validateFlashcardUpdateData = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { front, back, tags } = req.body;

        if (!front && !back && !tags) {
            throw new AppError(
                "Pelo menos um campo deve ser enviado para atualização",
                400
            );
        }

        if(tags && tags.length === 0) {
            throw new AppError("O array de tags esta vazio", 400);
        }
        
        next();
    } catch (error) {
        next(error);
    }
};
