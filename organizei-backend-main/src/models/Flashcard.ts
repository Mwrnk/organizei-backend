import mongoose, { Schema, Document } from "mongoose";

export interface IFlashcard extends Document {
    cardId: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
    front: string;
    back: string;
    scheduling: IScheduling;
    tags: mongoose.Schema.Types.ObjectId[];
    reviewLogs: IReviewLog[]
    createdAt: Date;
    updatedAt: Date;
}

export interface IScheduling {
    nextReview: Date;
    lastReview: Date;
    repetitions: number;
    interval: number;
    easeFactor: number;
}

export interface IReviewLog {
    reviewDate: Date;
    grade: number;
    responseTimeInSeconds: number;
}

interface ITag extends Document{
    name: string
}

const flashcardSchema = new Schema<IFlashcard>(
    {
        cardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Card",
            required: [true, "ID do card é obrigatório"],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Card",
            required: [true, "ID do usuário é obrigatório"],
        },
        front: {
            type: String,
            required: [true, "Front do flashcard é obrigatório"],
            trim: true,
        },
        back: {
            type: String,
            required: [true, "Back do flashcard é obrigatório"],
            trim: true,
        },
        scheduling: {
            nextReview: {
                type: Date,
                default: Date.now
            },
            lastReview: {
                type: Date,
                default: null
            },
            repetitions: {
                type: Number,
                default: 0
            },
            interval: {
                type: Number,
                default: 0
            },
            easeFactor: {
                type: Number,
                default: 2.5// valor padrão no algortimo SM-2
            },
        },
        tags: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tag",
            }
        ],
        reviewLogs: [
            {
                reviewDate: {
                    type: Date,
                    default: Date.now
                },
                grade: {
                    type: Number,
                    default: 0
                },
                responseTimeInSeconds: {
                    type: Number,
                    default: 0
                }
            }
        ],
    }
);

const tagSchema = new Schema<ITag>(
    {
        name: {
            type: String,
            required: [true, "Nome da tag é obrigatório"],
            trim: true,
        }
    }
);
export const Flashcard = mongoose.model<IFlashcard>("Flashcard", flashcardSchema);
export const Tag = mongoose.model<ITag>("Tag", tagSchema);
