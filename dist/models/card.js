"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const commentSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
const cardSchema = new mongoose_1.Schema({
    listId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "List",
        required: [true, "ID da lista é obrigatório"],
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
    image: {
        data: Buffer,
        filename: String,
        mimetype: String,
        uploaded_at: Date,
        size_kb: Number
    },
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
            type: mongoose_1.default.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
exports.Card = mongoose_1.default.model("Card", cardSchema);
