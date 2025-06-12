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
exports.TagController = void 0;
const flashcard_1 = require("../models/flashcard");
const errorHandler_1 = require("../middlewares/errorHandler");
class TagController {
    getAllTag(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errorHandler_1.AppError("Usuário não autenticado", 401);
                }
                const tags = yield flashcard_1.Tag.find();
                res.status(200).json({ status: "success", tags });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao buscar as tags", 500);
            }
        });
    }
    ;
    getTagById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tag = req.tag;
                res.status(200).json({ status: "success", tag });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao buscar a tag", 500);
            }
        });
    }
    ;
    getTagByName(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tags = req.tags;
                res.status(200).json({ status: "success", tags });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao buscar a tag", 500);
            }
        });
    }
    ;
    createTag(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { name } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errorHandler_1.AppError("Usuário não autenticado", 401);
                }
                const tag = yield flashcard_1.Tag.create({ name });
                res.status(201).json({ status: "success", data: tag });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao criar a tag", 500);
            }
        });
    }
    ;
    editTag(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const tag = req.tag;
                const { name } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errorHandler_1.AppError("Usuário não autenticado", 401);
                }
                const updatedTag = yield flashcard_1.Tag.findByIdAndUpdate(tag.id, { name }, { new: true, runValidators: true });
                if (!updatedTag) {
                    throw new errorHandler_1.AppError("Tag não encontrada", 404);
                }
                res.status(200).json({ status: "success", data: updatedTag });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao atualizar a tag", 500);
            }
        });
    }
    ;
    deleteTag(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const tag = req.tag;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errorHandler_1.AppError("Usuário não autenticado", 401);
                }
                const deletedTag = yield flashcard_1.Tag.findByIdAndDelete(tag.id);
                if (!deletedTag) {
                    throw new errorHandler_1.AppError("Tag não encontrada", 404);
                }
                res.status(204).json({ status: "success" });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao deletar a tag", 500);
            }
        });
    }
    ;
}
exports.TagController = TagController;
