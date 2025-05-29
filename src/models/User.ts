import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  coduser: string;
  name: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  role: string;
  plan: mongoose.Types.ObjectId;
  orgPoints: number;
  profileImage: string | null;
  loginAttempts: number;
  lastLoginAttempt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    coduser: {
      type: String,
      required: [true, "Código do usuário é obrigatório"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Nome é obrigatório"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email é obrigatório"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Senha é obrigatória"],
      select: false,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Data de nascimento é obrigatória"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: "68379d6589ed7583b0596d8a"
    },
    orgPoints: {
      type: Number,
      default: 0,
    },
    profileImage: {
      type: String,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lastLoginAttempt: {
      type: Date,
      default: null,
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

// Middleware para atualizar o updatedAt antes de salvar
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.model<IUser>("User", userSchema);
