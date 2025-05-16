import mongoose, { Schema, Document } from "mongoose";

interface IList extends Document {
  name: string;
  userId: string;
}

const ListSchema = new Schema<IList>(
  {
    name: {
      type: String,
      required: [true, "Nome da lista é obrigatório"],
      trim: true,
    },
    // foi inserido para receber o id do usuario que criou a lista
    userId: {
      type: String,
      required: [true, "O ID do usuário é obrigatório"],
    },
  },
  {
    timestamps: true,
  }
);

export const List = mongoose.model<IList>("List", ListSchema);
