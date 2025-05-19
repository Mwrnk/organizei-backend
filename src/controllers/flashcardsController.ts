import OpenAI from "openai";
import dotenv from "dotenv";
import { Response } from "express";
import { AuthRequest } from "../types/express";
import { AppError } from "../middlewares/errorHandler";
<<<<<<< HEAD
import { Flashcard, IFlashcard, IReviewLog } from "../models/flashcard";
import { generateFlashcardPrompt, context } from "../prompts/generateFlashcardPrompt";
=======
import { Flashcard, IFlashcard, IReviewLog, IScheduling, Tag } from "../models/Flashcard";
import { generateFlashcardPrompt, context, model, temperature } from "../prompts/generateFlashcardPrompt";
>>>>>>> 2c0957f9f6dd68dbdba614248fb6f3535939f59a

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

            const convertedResults = JSON.parse(resultGpt);

            const preparedFlashcards = await this.prepareFlashcards(convertedResults, card.id, userId);

            const insertedFlashcards = await Flashcard.insertMany(preparedFlashcards);

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
        const userId = req.user?.id;
        const { grade } = req.body;
        const flashcard = req.flashcard;

        if (!userId) {
            throw new AppError("Usuário não autenticado", 401);
        }

        flashcard.scheduling = this.updateScheduling(flashcard.scheduling, grade);

        flashcard.reviewLog.push(this.createReviewLog(grade));
        
        flashcard.markModified('scheduling')
        const updatedFlashcard =  await flashcard.save();

        res.status(201).json({
            status: "success",
            data: {
                flashcard: updatedFlashcard
            }
        });
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

        easeFactor = Math.max(this.calcEaseFactor(easeFactor, grade)), 1.3; // 1.3 valor mínimo no algoritmo SM-2

        nextReview.setDate(now.getDate() + interval);

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
            "temperature": temperature,
        });

        if(!completion.choices[0].message.content){
                throw new AppError("Nenhuma resposta da OpenAI", 500);
        }

        return completion.choices[0].message.content;
    };

    private prepareFlashcards = async (
        flashcardsGenerated: 
            [{ front: string, back: string, tags: string[] }],
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
