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
exports.Tag = exports.Flashcard = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const flashcardSchema = new mongoose_1.Schema({
    cardId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Card",
        required: [true, "ID do card é obrigatório"],
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "ID do usuário é obrigatório"],
    },
    front: {
        type: String,
        required: [true, "Front do flashcard é obrigatório"],
        trim: true,
    },
    back: {
        type: String,
        required: [true, "Back do flashcard é obrigatório"],
        trim: true,
    },
    scheduling: {
        nextReview: {
            type: Date,
            default: Date.now
        },
        lastReview: {
            type: Date,
            default: null
        },
        repetitions: {
            type: Number,
            default: 0
        },
        interval: {
            type: Number,
            default: 0
        },
        easeFactor: {
            type: Number,
            default: 2.5 // valor padrão no algortimo SM-2
        },
    },
    tags: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Tag",
        }
    ],
    reviewLogs: [
        {
            reviewDate: {
                type: Date,
                default: Date.now
            },
            grade: {
                type: Number,
                default: 0
            },
            responseTimeInSeconds: {
                type: Number,
                default: 0
            }
        }
    ],
}, {
    timestamps: true,
});
const tagSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Nome da tag é obrigatório"],
        trim: true,
    }
});
exports.Flashcard = mongoose_1.default.model("Flashcard", flashcardSchema);
exports.Tag = mongoose_1.default.model("Tag", tagSchema);
