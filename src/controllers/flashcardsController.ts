import OpenAI from "openai";
import dotenv from "dotenv";
import { Response } from "express";
import { AuthRequest } from "../types/express";
import { AppError } from "../middlewares/errorHandler";
import { Flashcard, IFlashcard, IReviewLog, IScheduling, Tag } from "../models/flashcard";
import { generateFlashcardPrompt, context, model, temperature } from "../prompts/generateFlashcardPrompt";


dotenv.config();

export class FlashcardsController {
    private clientOpenAI: OpenAI;

    constructor(){
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY não está configurada nas variáveis de ambiente");
        }
        this.clientOpenAI = new OpenAI({ 
            apiKey: process.env.OPENAI_API_KEY,
            timeout: 30000, // 30 segundos de timeout
        });
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
    };

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

            const availableTags = await Tag.find();

            const prompt = generateFlashcardPrompt(
                amount, card.title.toString(), 
                existingFronts, 
                availableTags.map(tag => tag.name)
            );

            const resultGpt = await this.generateFlashCardsWithAI(prompt);

            console.log("Resposta bruta da OpenAI:", resultGpt);

            let convertedResults;
            try {
                convertedResults = JSON.parse(resultGpt);
            } catch (parseError) {
                console.error("Erro ao fazer parse da resposta da OpenAI:", parseError);
                console.error("Resposta que causou erro:", resultGpt);
                throw new AppError("Resposta da IA não está em formato JSON válido", 500);
            }

            if (!Array.isArray(convertedResults)) {
                throw new AppError("Resposta da IA não é um array válido", 500);
            }

            const preparedFlashcards = await this.prepareFlashcards(convertedResults, card.id, userId);

            const insertedFlashcards = await Flashcard.insertMany(preparedFlashcards);

            res.status(200).json({
                status: "success",
                data: {
                    flashcards: insertedFlashcards
                }
            });
        } catch (error: any) {
            console.error("Erro ao criar flashcards com IA:", error.message);
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Erro ao gerar flashcards com IA", 500);
        }
    };

    getAllFlashcards = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError("Usuário não autenticado", 401);
            }

            const flashcards = await Flashcard.find({ userId })
                .sort({ createdAt: -1 })
                .populate({
                    path: "tags"
                });

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
    };

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
    };

    getlFlashcardsByCard = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { cardId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError("Usuário não autenticado", 401);
            }

            const flashcards = await Flashcard.find({ cardId: cardId })
                .populate({
                    path: "tags"
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
    };

    deteleFlashcard = async (req: AuthRequest, res: Response): Promise<void> => {
        const userId = req.user?.id;
        const flashcard = req.flashcard;

        if (!userId) {
            throw new AppError("Usuário não autenticado", 401);
        }

        await Flashcard.findByIdAndDelete(flashcard.id);

        res.status(204).send();
    };

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
    };

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
            })
            .populate({
                path: "tags"
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
    };

    handleReview = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;
            const { grade } = req.body;
            const flashcard = req.flashcard;

            if (!userId) {
                throw new AppError("Usuário não autenticado", 401);
            }

            flashcard.scheduling = this.updateScheduling(flashcard.scheduling, grade);

            flashcard.reviewLogs.push(this.createReviewLog(grade));
            
            flashcard.markModified('scheduling');
            flashcard.markModified('reviewLogs');
            const updatedFlashcard = await flashcard.save();

            res.status(201).json({
                status: "success",
                data: {
                    flashcard: updatedFlashcard
                }
            });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("Erro ao processar revisão do flashcard", 500);
        }
    };

    private updateScheduling = (scheduling: IScheduling, grade: number): IScheduling => {
        const now = new Date();
        let { repetitions, interval, easeFactor, nextReview } = scheduling;

        if(grade >= 3){
            repetitions += 1;
            interval = this.defineInterval(repetitions, interval, easeFactor);
        }else{
            repetitions = 0;
            interval = 1;
        }

        easeFactor = Math.max(this.calcEaseFactor(easeFactor, grade), 1.3); // 1.3 valor mínimo no algoritmo SM-2

        nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

        const updatedScheduling: IScheduling = {
            repetitions,
            interval,
            easeFactor,
            lastReview: now,
            nextReview
        };

        return updatedScheduling;
    };

    private defineInterval = (
        repetitions: number, 
        interval: number, 
        easeFactor: number
    ): number => {
        switch(repetitions) {
            case 1: interval = 1; break;
            case 2:  interval = 6; break;
            default:  {
                interval = 
                    Math.round(interval * easeFactor);
                break;
            }
        }

        return interval;
    };

    private calcEaseFactor = (easeFactor: number, grade: number): number => {
        return easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    };

    private createReviewLog = (grade: number): IReviewLog => {
        return {
            reviewDate: new Date,
            grade,
            responseTimeInSeconds: 0
        };
    };

    private generateFlashCardsWithAI = async (prompt: string): Promise<string> => {
        try {
            console.log("Iniciando comunicação com OpenAI...");
            
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
                max_tokens: 2000,
            });

            console.log("Resposta recebida da OpenAI");

            if (!completion.choices[0]?.message?.content) {
                throw new AppError("Nenhuma resposta da OpenAI", 500);
            }

            return completion.choices[0].message.content;
        } catch (error: any) {
            console.error("Erro detalhado da OpenAI:", {
                message: error.message,
                type: error.type,
                code: error.code,
                status: error.status
            });

            if (error.code === 'insufficient_quota') {
                throw new AppError("Cota da API OpenAI esgotada", 402);
            }
            
            if (error.code === 'invalid_api_key') {
                throw new AppError("Chave da API OpenAI inválida", 401);
            }

            if (error.message?.includes('Connection error') || error.code === 'ENOTFOUND') {
                throw new AppError("Erro de conexão com a OpenAI. Verifique sua conexão com a internet", 503);
            }

            throw new AppError(`Erro na comunicação com OpenAI: ${error.message}`, 500);
        }
    };

    private prepareFlashcards = async (
        flashcardsGenerated: 
            { front: string, back: string, tags: string[] }[],
            cardId: string,
            userId: string 
        ) => {
        const tagNames = flashcardsGenerated.flatMap(flashcard =>
            flashcard.tags.map(tag => tag.toLowerCase().trim())
        );

        const existingTags = await Tag.find({ name: { $in: tagNames } });

        const existingMap = new Map(existingTags.map(tag => [tag.name, tag._id]));

        const newTagsToCreate = tagNames.filter((name: string) => !existingMap.has(name));

        const createdTags = await Tag.insertMany(newTagsToCreate.map((name: string) => ({ name })));

        const createdMap = new Map(createdTags.map(tag => [tag.name, tag._id]));

        const allTagsMap = new Map([ ...existingMap, ...createdMap ]);

        const newFlashcards = flashcardsGenerated.map(
            (flashcard: { front: string, back: string, tags: string[] }) => ({
                front: flashcard.front,
                back: flashcard.back,
                cardId,
                userId,
                tags: flashcard.tags
                    .map(tag => tag.toLowerCase().trim())
                    .map(tag => allTagsMap.get(tag))
                    .filter(Boolean),
            })
        );

        return newFlashcards;
    };
}
