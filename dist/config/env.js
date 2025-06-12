"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const validateEnv = () => {
    const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Variável de ambiente ${envVar} não está definida`);
        }
    }
    const port = Number(process.env.PORT);
    if (isNaN(port)) {
        throw new Error("PORT deve ser um número válido");
    }
    const bcryptCost = Number(process.env.BCRYPT_COST);
    if (isNaN(bcryptCost) || bcryptCost < 10 || bcryptCost > 12) {
        throw new Error("BCRYPT_COST deve ser um número entre 10 e 12");
    }
    return {
        NODE_ENV: process.env.NODE_ENV ||
            "development",
        PORT: port || 3000,
        MONGODB_URI: process.env.MONGODB_URI,
        JWT_SECRET: process.env.JWT_SECRET,
        BCRYPT_COST: bcryptCost || 12,
    };
};
exports.env = validateEnv();
