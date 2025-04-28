import { List } from "./List";
import mongoose, { Schema, Document } from "mongoose";

interface ICard extends Document {
  List_id: String;
  Title: String;
  Priority: String;
  is_published: Boolean;
  image_url: String[];
  pdfs: IPdf[];
}
interface IPdf {
  url: string;
  filename: string;
  uploaded_at: Date;
  size_kb?: number;
}

const cardSchema = new Schema<ICard>(
  {
    List_id: {
      type: String,
      required: [true, "ID da lista é obrigatório"],
    },
    Title: {
      type: String,
      required: [true, "Título do card é obrigatório"],
      trim: true,
    },
    Priority: {
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
  },
  {
    timestamps: true,
  }
);
export const Card = mongoose.model<ICard>("Card", cardSchema);
