"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserExists = exports.validateLoginData = exports.validateSignupData = exports.validateUserData = void 0;
const user_1 = require("../models/user");
const errorHandler_1 = require("./errorHandler");
const validateUserData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, dateOfBirth } = req.body;
        if (!name && !dateOfBirth) {
            throw new errorHandler_1.AppError("Pelo menos um campo deve ser enviado para atualização", 400);
        }
        // Validação do nome se fornecido
        if (name) {
            if (name.length < 3 || name.length > 50) {
                throw new errorHandler_1.AppError("O nome deve ter entre 3 e 50 caracteres", 400);
            }
            if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
                throw new errorHandler_1.AppError("O nome deve conter apenas letras e espaços", 400);
            }
        }
        // Validação da data de nascimento se fornecida
        if (dateOfBirth) {
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (isNaN(birthDate.getTime())) {
                throw new errorHandler_1.AppError("Data de nascimento inválida", 400);
            }
            if (age < 10) {
                throw new errorHandler_1.AppError("Você deve ter pelo menos 10 anos para se cadastrar", 400);
            }
            if (age > 120) {
                throw new errorHandler_1.AppError("Data de nascimento inválida", 400);
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateUserData = validateUserData;
const validateSignupData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { coduser, name, dateOfBirth, email, password } = req.body;
        if (!coduser || !name || !dateOfBirth || !email || !password) {
            throw new errorHandler_1.AppError("Todos os campos são obrigatórios", 400);
        }
        // Validação do coduser
        if (!/^[a-zA-Z0-9]{4,20}$/.test(coduser)) {
            throw new errorHandler_1.AppError("O código do usuário deve ter entre 4 e 20 caracteres alfanuméricos", 400);
        }
        // Validação do nome
        if (name.length < 3 || name.length > 50) {
            throw new errorHandler_1.AppError("O nome deve ter entre 3 e 50 caracteres", 400);
        }
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
            throw new errorHandler_1.AppError("O nome deve conter apenas letras e espaços", 400);
        }
        // Validação do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new errorHandler_1.AppError("Email inválido", 400);
        }
        // Validação da senha
        if (password.length < 8) {
            throw new errorHandler_1.AppError("A senha deve ter pelo menos 8 caracteres", 400);
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            throw new errorHandler_1.AppError("A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número", 400);
        }
        // Validação da data de nascimento
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (isNaN(birthDate.getTime())) {
            throw new errorHandler_1.AppError("Data de nascimento inválida", 400);
        }
        if (age < 13) {
            throw new errorHandler_1.AppError("Você deve ter pelo menos 13 anos para se cadastrar", 400);
        }
        if (age > 120) {
            throw new errorHandler_1.AppError("Data de nascimento inválida", 400);
        }
        // Verificar se o usuário já existe
        const existingUser = yield user_1.User.findOne({
            $or: [
                { email },
                { coduser }
            ]
        });
        if (existingUser) {
            if (existingUser.email === email) {
                throw new errorHandler_1.AppError("Este email já está em uso", 400);
            }
            if (existingUser.coduser === coduser) {
                throw new errorHandler_1.AppError("Este código de usuário já está em uso", 400);
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateSignupData = validateSignupData;
const validateLoginData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new errorHandler_1.AppError("Email e senha são obrigatórios", 400);
        }
        // Validação do formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new errorHandler_1.AppError("Email inválido", 400);
        }
        // Validação básica da senha
        if (password.length < 8) {
            throw new errorHandler_1.AppError("Senha inválida", 400);
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateLoginData = validateLoginData;
const checkUserExists = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Não verifica usuário em rotas de signup
        if (req.path === "/signup") {
            return next();
        }
        const { id } = req.params;
        // Verifica se o ID foi fornecido
        if (!id) {
            throw new errorHandler_1.AppError("ID do usuário é obrigatório", 400);
        }
        const user = yield user_1.User.findById(id);
        if (!user) {
            throw new errorHandler_1.AppError("Usuário não encontrado", 404);
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            throw error;
        }
        throw new errorHandler_1.AppError("Erro ao verificar usuário", 500);
    }
});
exports.checkUserExists = checkUserExists;
