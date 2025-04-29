import mongoose, { Schema, Document } from "mongoose";

export interface IArea extends Document {
  _id: String;
  type: string;
  user_id: string;
}

const areaSchema = new Schema<IArea>(
  {
    type: {
      type: String,
      required: [true, "Tipo de área é obrigatório"],
      enum: ["Escolar", "Profissional"],
      default: "Escolar",
    },
    user_id: {
      type: String,
      required: [true, "ID do usuário é obrigatório"],
    },
  },
  {
    timestamps: true,
  }
);
export const Area = mongoose.model<IArea>("Area", areaSchema);
