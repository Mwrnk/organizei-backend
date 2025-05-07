import { Card } from './card';
import mongoose, { Schema, Document } from "mongoose";

interface IComment extends Document {
  cardId: String;  
  description: String;
  userId: String; 
}

const commentSchema = new Schema<IComment>(
  {
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: [true, "ID do card é obrigatório"],
    },
    description: {
      type: String,
      required: [false, "Descrição do comentário não obrigatória"],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "ID do usuário é obrigatório"],
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model<IComment>("Comment", commentSchema);  