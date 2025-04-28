import mongoose, { Schema, Document } from "mongoose";

interface IList extends Document {
  name: string;
}
const Listschema = new Schema<IList>(
  {
    name: {
      type: String,
      required: [true, "Nome da lista é obrigatório"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const List = mongoose.model<IList>("List", Listschema);
