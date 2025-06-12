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
exports.UserController = void 0;
const user_1 = require("../models/user");
const hashManager_1 = require("../utils/hashManager");
const tokenManager_1 = require("../utils/tokenManager");
const errorHandler_1 = require("../middlewares/errorHandler");
class UserController {
    uploadProfileImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { image } = req.body;
                const user = yield user_1.User.findByIdAndUpdate(id, { profileImage: image }, { new: true });
                if (!user) {
                    throw new errorHandler_1.AppError("Usuário não encontrado", 404);
                }
                res.status(200).json({
                    status: "success",
                    data: user,
                });
            }
            catch (error) {
                throw new errorHandler_1.AppError("Erro ao salvar imagem de perfil", 500);
            }
        });
    }
    editUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { name, dateOfBirth, image } = req.body;
                const updatedUser = yield user_1.User.findByIdAndUpdate(id, { name, dateOfBirth, profileImage: image }, { new: true, runValidators: true });
                if (!updatedUser) {
                    throw new errorHandler_1.AppError("Usuário não encontrado", 404);
                }
                res.status(200).json({
                    status: "success",
                    data: {
                        id: updatedUser._id,
                        name: updatedUser.name,
                        dateOfBirth: updatedUser.dateOfBirth,
                        email: updatedUser.email,
                    },
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao editar usuário", 500);
            }
        });
    }
    signup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { coduser, name, dateOfBirth, email, password } = req.body;
                const hashedPassword = yield (0, hashManager_1.hash)(password);
                const user = yield user_1.User.create({
                    coduser,
                    name,
                    dateOfBirth,
                    email,
                    password: hashedPassword,
                    role: "user",
                });
                const token = (0, tokenManager_1.generateToken)(user._id, user.email);
                res.status(201).json({
                    status: "success",
                    data: {
                        token,
                        user: {
                            id: user._id,
                            coduser: user.coduser,
                            name: user.name,
                            dateOfBirth: user.dateOfBirth,
                            email: user.email,
                        },
                    },
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao criar usuário", 500);
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const user = yield user_1.User.findOne({ email }).select("+password");
                if (!user) {
                    res.status(404).json({
                        status: "fail",
                        message: "Email ou senha incorretos"
                    });
                    return;
                }
                const isPasswordValid = yield (0, hashManager_1.compare)(password, user.password);
                if (!isPasswordValid) {
                    res.status(401).json({
                        status: "fail",
                        message: "Email ou senha incorretos"
                    });
                    return;
                }
                const token = (0, tokenManager_1.generateToken)(user._id, user.email);
                res.status(200).json({
                    status: "success",
                    data: {
                        token,
                        user: {
                            id: user._id,
                            name: user.name,
                            email: user.email,
                        },
                    },
                });
            }
            catch (error) {
                res.status(500).json({
                    status: "error",
                    message: "Erro interno do servidor"
                });
            }
        });
    }
    getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield user_1.User.findById(id).select("-password");
                if (!user) {
                    throw new errorHandler_1.AppError("Usuário não encontrado", 404);
                }
                res.status(200).json({
                    status: "success",
                    data: user,
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao buscar usuário", 500);
            }
        });
    }
    getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield user_1.User.find().select("-password");
                res.status(200).json({
                    status: "success",
                    data: users,
                });
            }
            catch (error) {
                throw new errorHandler_1.AppError("Erro ao buscar usuários", 500);
            }
        });
    }
    checkNickname(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { coduser } = req.query;
                if (!coduser || typeof coduser !== 'string') {
                    res.status(400).json({ available: false, message: 'Nickname não informado.' });
                    return;
                }
                const user = yield user_1.User.findOne({ coduser });
                if (user) {
                    res.status(200).json({ available: false, message: 'Nickname já está em uso.' });
                }
                else {
                    res.status(200).json({ available: true, message: 'Nickname disponível.' });
                }
            }
            catch (error) {
                res.status(500).json({ available: false, message: 'Erro ao verificar nickname.' });
            }
        });
    }
    checkEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.query;
                if (!email || typeof email !== 'string') {
                    res.status(400).json({ available: false, message: 'E-mail não informado.' });
                    return;
                }
                const user = yield user_1.User.findOne({ email });
                if (user) {
                    res.status(200).json({ available: false, message: 'E-mail já está em uso.' });
                }
                else {
                    res.status(200).json({ available: true, message: 'E-mail disponível.' });
                }
            }
            catch (error) {
                res.status(500).json({ available: false, message: 'Erro ao verificar e-mail.' });
            }
        });
    }
}
exports.UserController = UserController;
