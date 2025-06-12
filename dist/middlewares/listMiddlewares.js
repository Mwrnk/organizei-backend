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
exports.checkListLimit = exports.checkUserLists = exports.checkListOwnership = exports.checkListExists = exports.validateListUpdateData = exports.validateListData = void 0;
const list_1 = require("../models/list");
const user_1 = require("../models/user");
const errorHandler_1 = require("./errorHandler");
// Validação dos dados básicos da lista
const validateListData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, userId } = req.body;
        // Validação de campos obrigatórios
        if (!name || !userId) {
            throw new errorHandler_1.AppError("Nome e ID do usuário são obrigatórios", 400);
        }
        // Validação do tamanho do nome
        if (name.length < 3 || name.length > 50) {
            throw new errorHandler_1.AppError("O nome deve ter entre 3 e 50 caracteres", 400);
        }
        // Validação de caracteres especiais no nome
        if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
            throw new errorHandler_1.AppError("O nome contém caracteres inválidos", 400);
        }
        // Validação do formato do ID do usuário
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new errorHandler_1.AppError("ID do usuário inválido", 400);
        }
        // Verificar se o usuário existe
        const user = yield user_1.User.findById(userId);
        if (!user) {
            throw new errorHandler_1.AppError("Usuário não encontrado", 404);
        }
        // Verificar duplicidade de nome para o mesmo usuário
        const existingList = yield list_1.List.findOne({ name, userId });
        if (existingList) {
            throw new errorHandler_1.AppError("Já existe uma lista com este nome para este usuário", 400);
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateListData = validateListData;
// Validação dos dados de atualização da lista
const validateListUpdateData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        if (!name) {
            throw new errorHandler_1.AppError("O nome é obrigatório para atualização", 400);
        }
        // Validação do tamanho do nome
        if (name.length < 3 || name.length > 50) {
            throw new errorHandler_1.AppError("O nome deve ter entre 3 e 50 caracteres", 400);
        }
        // Validação de caracteres especiais no nome
        /*if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
          throw new AppError("O nome contém caracteres inválidos", 400);
        }*/
        // Verificar duplicidade de nome para o mesmo usuário
        const list = req.list;
        if (list) {
            const existingList = yield list_1.List.findOne({
                name,
                userId: list.userId,
                _id: { $ne: list._id }
            });
            if (existingList) {
                throw new errorHandler_1.AppError("Já existe uma lista com este nome para este usuário", 400);
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateListUpdateData = validateListUpdateData;
// Verificação de existência da lista
const checkListExists = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new errorHandler_1.AppError("ID inválido", 400);
        }
        const list = yield list_1.List.findById(id);
        if (!list) {
            throw new errorHandler_1.AppError("Lista não encontrada", 404);
        }
        req.list = list;
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            throw error;
        }
        throw new errorHandler_1.AppError("Erro ao verificar lista", 500);
    }
});
exports.checkListExists = checkListExists;
// Verificação de propriedade da lista
const checkListOwnership = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const list = req.list;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            throw new errorHandler_1.AppError("Usuário não autenticado", 401);
        }
        if ((list === null || list === void 0 ? void 0 : list.userId.toString()) !== userId) {
            throw new errorHandler_1.AppError("Você não tem permissão para realizar esta ação", 403);
        }
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            throw error;
        }
        throw new errorHandler_1.AppError("Erro ao verificar propriedade da lista", 500);
    }
});
exports.checkListOwnership = checkListOwnership;
// Verificação de listas do usuário
const checkUserLists = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            throw new errorHandler_1.AppError("ID do usuário é obrigatório", 400);
        }
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new errorHandler_1.AppError("ID do usuário inválido", 400);
        }
        // Verificar se o usuário existe
        const user = yield user_1.User.findById(userId);
        if (!user) {
            throw new errorHandler_1.AppError("Usuário não encontrado", 404);
        }
        const lists = yield list_1.List.find({ userId });
        req.lists = lists;
        if (lists.length === 0) {
            res.status(200).json({
                status: "success",
                data: [],
                message: "Nenhuma lista encontrada para este usuário"
            });
            return;
        }
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            throw error;
        }
        throw new errorHandler_1.AppError("Erro ao buscar listas do usuário", 500);
    }
});
exports.checkUserLists = checkUserLists;
// Verificação de limites de listas por usuário
const checkListLimit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            throw new errorHandler_1.AppError("Usuário não autenticado", 401);
        }
        const user = yield user_1.User.findById(userId).populate('plan');
        if (!user) {
            throw new errorHandler_1.AppError("Usuário não encontrado", 404);
        }
        const listCount = yield list_1.List.countDocuments({ userId });
        const planLimit = ((_c = (_b = user.plan) === null || _b === void 0 ? void 0 : _b.features) === null || _c === void 0 ? void 0 : _c.includes('unlimited_lists')) ? Infinity : 10;
        if (listCount >= planLimit) {
            throw new errorHandler_1.AppError(`Limite de listas atingido. Seu plano permite ${planLimit} listas.`, 403);
        }
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            throw error;
        }
        throw new errorHandler_1.AppError("Erro ao verificar limite de listas", 500);
    }
});
exports.checkListLimit = checkListLimit;
