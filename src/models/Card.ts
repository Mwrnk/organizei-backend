import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IImage {
  data: Buffer;
  filename: string;
  mimetype: string;
  uploaded_at: Date;
  size_kb?: number;
}

export interface ICard extends Document {
  listId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  priority: string;
  is_published: boolean;
  images: IImage[];
  pdfs: IPdf[];
  likes: number;
  comments: IComment[];
  downloads: number;
  likedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  content: string;
}

export interface IPdf {
  data: Buffer;
  filename: string;
  mimetype: string;
  uploaded_at: Date;
  size_kb?: number;
}

const commentSchema = new Schema<IComment>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

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
    images: [{
      data: Buffer,
      filename: String,
      mimetype: String,
      uploaded_at: Date,
      size_kb: Number
    }],
    pdfs: [{
      data: Buffer,
      filename: String,
      mimetype: String,
      uploaded_at: Date,
      size_kb: Number
    }],
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    comments: [commentSchema],
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
    content: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);
export const Card = mongoose.model<ICard>("Card", cardSchema);
