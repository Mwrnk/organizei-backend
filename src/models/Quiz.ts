import mongoose, { Schema, Document } from "mongoose";

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // índice da resposta correta (0-3)
}

export interface IQuizSession extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  cardId: mongoose.Schema.Types.ObjectId;
  question: IQuizQuestion;
  userAnswer?: number;
  isCorrect?: boolean;
  pointsEarned: number;
  timeSpent?: number; // em segundos
  status: "active" | "completed";
  createdAt: Date;
  completedAt?: Date;
}

const quizQuestionSchema = new Schema<IQuizQuestion>({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: [{
    type: String,
    required: true,
    trim: true,
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
});

const quizSessionSchema = new Schema<IQuizSession>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "ID do usuário é obrigatório"],
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: [true, "ID do card é obrigatório"],
    },
    question: {
      type: quizQuestionSchema,
      required: true,
    },
    userAnswer: {
      type: Number,
      min: 0,
      max: 3,
    },
    isCorrect: {
      type: Boolean,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const QuizSession = mongoose.model<IQuizSession>("QuizSession", quizSessionSchema); 