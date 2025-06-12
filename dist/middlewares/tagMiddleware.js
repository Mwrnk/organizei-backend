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
exports.checkTagByName = exports.checkTagById = exports.validateTagData = void 0;
const errorHandler_1 = require("./errorHandler");
const flashcard_1 = require("../models/flashcard");
const validateTagData = (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) {
            throw new errorHandler_1.AppError("O nome da tag é obrigatório", 400);
        }
        if (name.length < 3 || name.length > 100) {
            throw new errorHandler_1.AppError("O nome da tag deve ter entre 3 e 100 caracteres", 400);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateTagData = validateTagData;
const checkTagById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new errorHandler_1.AppError("ID inválido", 400);
        }
        const tag = yield flashcard_1.Tag.findById(id);
        if (!tag) {
            throw new errorHandler_1.AppError("Tag não encontrada", 404);
        }
        req.tag = tag;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.checkTagById = checkTagById;
const checkTagByName = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.params;
        if (!name) {
            throw new errorHandler_1.AppError("Nome é obrigatório", 400);
        }
        const tags = yield flashcard_1.Tag.find({ name: { $regex: name, $options: 'i' } });
        if (!tags) {
            throw new errorHandler_1.AppError("Tag não encontrada", 404);
        }
        req.tags = tags;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.checkTagByName = checkTagByName;
