import mongoose, { Schema, Document } from "mongoose";

export interface IPlan extends Document {
  name: string;
  price: number; 
  features: string[]; 
  duration: number; // duração em dias
  isDefault: boolean;
  isActive: boolean;
}

const PlanSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  features: {
    type: [String],
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    default: 30, // duração padrão em dias
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
});

export const Plan = mongoose.model<IPlan>("Plan", PlanSchema);
