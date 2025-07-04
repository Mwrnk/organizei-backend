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
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
// Middleware para atualizar o updatedAt antes de salvar
userSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});
exports.User = mongoose_1.default.model("User", userSchema);
