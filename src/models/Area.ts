import mongoose, { Schema, Document } from "mongoose";

export interface IArea extends Document {
  _id: String;
  type: string;
  userId: mongoose.Types.ObjectId;
}

const areaSchema = new Schema<IArea>(
  {
    type: {
      type: String,
      required: [true, "Tipo de área é obrigatório"],
      enum: ["Escolar", "Profissional"],
      default: "Escolar",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "ID do usuário é obrigatório"],
    },
  },
  {
    timestamps: true,
  }
);
export const Area = mongoose.model<IArea>("Area", areaSchema);
