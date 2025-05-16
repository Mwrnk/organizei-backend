import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICard extends Document {
  listId: String;
  userId: String;
  title: String;
  priority: String;
  is_published: Boolean;
  image_url: String[];
  pdfs: IPdf[];
  likes: Number;
  comments: IComment[];
  downloads: Number;
  likedBy: String[];
  createdAt: Date;
  updatedAt: Date;
  content: String;
}

export interface IPdf {
  url: string;
  filename: string;
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
    image_url: {
      type: [String],
      default: null,
    },
    pdfs: [{
      url: String,
      filename: String,
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
