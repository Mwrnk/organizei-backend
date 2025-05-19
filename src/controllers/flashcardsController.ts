import OpenAI from "openai";
import dotenv from "dotenv";
import { Response } from "express";
import { AuthRequest } from "../types/express";
import { AppError } from "../middlewares/errorHandler";
import { Flashcard, IFlashcard, IReviewLog } from "../models/flashcard";
import { generateFlashcardPrompt, context } from "../prompts/generateFlashcardPrompt";

dotenv.config();

export class FlashcardsController {
    private clientOpenAI: OpenAI;

    constructor(){
        this.clientOpenAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    createFlashcard = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { cardId, front, back, tags } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError("Usuário não autenticado", 401);
            }

            const flashcard = await Flashcard.create({
                cardId,
                userId,
                front,
                back,
                tags
            });

            res.status(200).json({
                status: "success",
                data: {
                    flashcard
                }
            });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Erro ao criar flashcard", 500);
        }
    }

    createFlashcardWithAI = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;
            const card = req.card;
            const { amount } = req.body;

            if (!userId) {
                throw new AppError("Usuário não autenticado", 401);
            }

            const flashcards = await Flashcard.find({ cardId: card.id });

            const existingFronts = flashcards.map(flashcard => flashcard.front);

            const completion = await this.clientOpenAI.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: context
                    },
                    {
                        role: "user",
                        content: generateFlashcardPrompt(amount, card.title.toString(), existingFronts)
                    }
                ],
                "temperature": 0.5
            });

            if(!completion.choices[0].message.content){
                throw new AppError("tenta de novo", 500);
            }

            const convertedResults = JSON.parse(completion.choices[0].message.content);

            const newFlashcards = convertedResults.map(
                (flashcard: [{front: string, back: string }]) => 
                    ({ ...flashcard, cardId: card.id, userId }));

            const insertedFlashcards = await Flashcard.insertMany(newFlashcards);

            res.status(200).json({
                status: "success",
                data: {
                    flashcards: insertedFlashcards
                }
            });
        } catch(error: any) {
            console.error("Erro ao se comunicar com a OpenAI:", error.message);
            res.status(500).json({ error: error.message || "Erro desconhecido" });
        }
    }

    getAllFlashcards = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError("Usuário não autenticado", 401);
            }

            const flashcards = await Flashcard.find({ userId })
                .sort({ createdAt: -1 });

            res.status(200).json({
                status: "success",
                data: flashcards
            });

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Erro buscar flashcards", 500);
        }
    }

    getFlashcardById = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const flashcard = req.flashcard;

            res.status(200).json({
                status: "success",
                data: {
                    flashcard
                }
            });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Erro buscar flashcards", 500);
        }
    }

    getlFlashcardsByCard = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { cardId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError("Usuário não autenticado", 401);
            }

            const flashcards = await Flashcard.find({ cardId: cardId });

            res.status(200).json({
                status: "success",
                data: flashcards
            });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Erro ao buscar cartões da lista", 500);
        }
    }

    deteleFlashcard = async (req: AuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const flashcard = req.flashcard;

        if (!userId) {
            throw new AppError("Usuário não autenticado", 401);
        }

        await Flashcard.findByIdAndDelete(flashcard.id);

        res.status(204).send();
    }

    editFlashcard = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const flashcard = req.flashcard;
            const userId = req.user?.id;
            const { front, back, tags } = req.body;

            if (!userId) {
                throw new AppError("Usuário não autenticado", 401);
            }

            const updatedFlashcard = await Flashcard.findByIdAndUpdate(
                flashcard.id,
                { front, back, tags },
                { new: true, runValidators: true }
            );

            if (!updatedFlashcard) {
                throw new AppError("Flashcard não encontrado", 404);
            }

            res.status(200).json({
                status: "success",
                data: {
                    flashcard: updatedFlashcard
                }
            });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Erro ao atualizar o flashcard", 500);
        }
    }

    startReview = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { cardId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError("Usuário não autenticado", 401);
            }

            const flashcards = await Flashcard.find({
                cardId,
                "scheduling.nextReview": {
                    $lt: new Date(new Date().setHours(23, 59, 59, 999)),
                }
            });

            res.status(200).json({
                status: "success",
                data: flashcards
            });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Erro ao buscar cartões da lista", 500);
        }
    }

    handleReview = async (req: AuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const { grade } = req.body;
        const flashcard = req.flashcard;

        if (!userId) {
            throw new AppError("Usuário não autenticado", 401);
        }

        const flashcardUpdated = this.updateScheduling(flashcard, grade);
        
        flashcardUpdated.markModified('scheduling')
        const updatedFlashcard =  await flashcardUpdated.save();

        res.status(201).json({
            status: "success",
            data: {
                flashcard: updatedFlashcard
            }
        });
    }

    private updateScheduling = (flashcard: IFlashcard, grade: number): IFlashcard => {
        if(grade >= 3){
            flashcard.scheduling.repetitions += 1;

            if(flashcard.scheduling.repetitions == 1){
                flashcard.scheduling.interval = 1;
            }

            if(flashcard.scheduling.repetitions == 2){
                flashcard.scheduling.interval = 6;
            }

            if(flashcard.scheduling.repetitions == 3){
                flashcard.scheduling.interval = Math.round(flashcard.scheduling.interval * flashcard.scheduling.easeFactor);
            }
        }

        if(grade < 3){
            flashcard.scheduling.repetitions = 0;
            flashcard.scheduling.interval = 1;
        }

        const easeFactor = flashcard.scheduling.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

        flashcard.scheduling.easeFactor = easeFactor >= 1.3 ? easeFactor : 1.3; // 1.3 valor mínimo no algoritmo SM-2

        const lastReview = new Date();

        flashcard.scheduling.lastReview = lastReview;

        const test = flashcard.scheduling.nextReview.setDate(lastReview.getDate() + flashcard.scheduling.interval);

        flashcard.scheduling.nextReview = new Date(test);

        console.log("ERA PRA DAR CERTO: ", flashcard.scheduling.nextReview);

        const testDate = new Date(test);

        console.log("TESTE: ", testDate);

        const reviewLog: IReviewLog = {
            reviewDate: new Date(),
            grade,
            responseTimeInSeconds: 0
        };

        flashcard.reviewLogs.push(reviewLog);

        return flashcard;
    }
}
