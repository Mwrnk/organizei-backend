import mongoose, { Schema, Document } from "mongoose";

interface ICard extends Document {
  listId: String;
  userId: String;
  title: String;
  priority: String;
  is_published: Boolean;
  image_url: String[];
  pdfs: IPdf[];
  likes: Number;
  comments: Number;
  downloads: Number;
  createdAt: Date;
  updatedAt: Date;
}
interface IPdf {
  url: string;
  filename: string;
  uploaded_at: Date;
  size_kb?: number;
}

const cardSchema = new Schema<ICard>(
  {
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: [true, "ID da lista é obrigatório"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "ID do usuário é obrigatório"],
    },
    title: {
      type: String,
      required: [true, "Título do card é obrigatório"],
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Baixa", "Média", "Alta"],
      default: "Baixa",
    },
    is_published: {
      type: Boolean,
      default: false,
    },
    image_url: {
      type: [String],
      default: null,
    },
    pdfs: {
      type: [Object],
      default: null,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
export const Card = mongoose.model<ICard>("Card", cardSchema);
