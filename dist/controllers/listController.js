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
exports.ListController = void 0;
const list_1 = require("../models/list");
const errorHandler_1 = require("../middlewares/errorHandler");
class ListController {
    getLists(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const lists = yield list_1.List.find();
                res.status(200).json({
                    status: "success",
                    data: lists.map((list) => ({
                        id: list._id,
                        name: list.name,
                    })),
                });
            }
            catch (error) {
                throw new errorHandler_1.AppError("Erro ao buscar listas", 500);
            }
        });
    }
    getListById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const list = yield list_1.List.findById(id);
                if (!list) {
                    throw new errorHandler_1.AppError("Lista não encontrada", 404);
                }
                res.status(200).json({
                    status: "success",
                    data: {
                        id: list._id,
                        name: list.name,
                    },
                });
            }
            catch (error) {
                throw new errorHandler_1.AppError("Erro ao buscar lista", 500);
            }
        });
    }
    getListByUserId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const listsAggregated = yield list_1.List.aggregate([
                    { $match: { userId } },
                    {
                        $lookup: {
                            from: "cards",
                            localField: "_id",
                            foreignField: "listId",
                            as: "cards"
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            id: "$_id",
                            name: 1,
                            cards: {
                                $map: {
                                    input: "$cards",
                                    as: "card",
                                    in: {
                                        id: "$$card._id",
                                        title: "$$card.title",
                                        createdAt: "$$card.createdAt",
                                    }
                                }
                            }
                        }
                    }
                ]);
                res.status(200).json({
                    status: "success",
                    data: listsAggregated
                });
            }
            catch (error) {
                throw new errorHandler_1.AppError("Erro ao buscar listas do usuário", 500);
            }
        });
    }
    createList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, userId } = req.body;
                const list = yield list_1.List.create({ name, userId });
                res.status(201).json({
                    status: "success",
                    data: {
                        id: list._id,
                        name: list.name,
                    },
                });
            }
            catch (error) {
                throw new errorHandler_1.AppError("Erro ao criar lista", 500);
            }
        });
    }
    editList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { name } = req.body;
                const updatedList = yield list_1.List.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });
                if (!updatedList) {
                    throw new errorHandler_1.AppError("Lista não encontrada", 404);
                }
                res.status(200).json({
                    status: "success",
                    data: {
                        id: updatedList._id,
                        name: updatedList.name,
                    },
                });
            }
            catch (error) {
                throw new errorHandler_1.AppError("Erro ao editar lista", 500);
            }
        });
    }
    deleteList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // Primeiro, deletar todos os cards que pertencem a esta lista
                const { Card } = yield Promise.resolve().then(() => __importStar(require("../models/card")));
                yield Card.deleteMany({ listId: id });
                // Depois, deletar a lista
                yield list_1.List.findByIdAndDelete(id);
                res.status(204).json({
                    status: "success",
                    data: null,
                });
            }
            catch (error) {
                throw new errorHandler_1.AppError("Erro ao deletar lista", 500);
            }
        });
    }
}
exports.ListController = ListController;
