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
exports.CommunityController = void 0;
const card_1 = require("../models/card");
const errorHandler_1 = require("../middlewares/errorHandler");
class CommunityController {
    // Publicar um card na comunidade
    publishCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const card = req.card;
                if (!card) {
                    throw new errorHandler_1.AppError("Cartão não encontrado", 404);
                }
                card.is_published = true;
                yield card.save();
                res.status(200).json({
                    status: "success",
                    message: "Cartão publicado com sucesso!",
                    data: {
                        id: card._id,
                        title: card.title,
                        is_published: card.is_published,
                    },
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao publicar cartão", 500);
            }
        });
    }
    // Listar todos os cards publicados
    getPublishedCards(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cards = yield card_1.Card.find({ is_published: true }, {
                    _id: 0,
                    id: "$_id",
                    title: 1,
                    priority: 1,
                    downloads: 1,
                    likes: 1,
                    comments: 1,
                    image_url: 1
                })
                    .sort({ createdAt: -1 })
                    .populate({
                    path: "userId",
                    select: "name email",
                });
                res.status(200).json({
                    status: "success",
                    data: cards,
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao buscar os cards publicados", 500);
            }
        });
    }
    // Registrar download de um card
    downloadCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const card = req.card;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { listId } = req.body;
                if (!userId) {
                    throw new errorHandler_1.AppError("Usuário não autenticado", 401);
                }
                if (!listId) {
                    throw new errorHandler_1.AppError("ID da lista de destino é obrigatório", 400);
                }
                // Incrementa o contador de downloads no card original
                card.downloads = Number(card.downloads) + 1;
                yield card.save();
                // Cria uma cópia do card para o usuário com a nova lista
                const cardCopy = yield card_1.Card.create(Object.assign(Object.assign({}, card.toObject()), { _id: undefined, userId,
                    listId, downloads: 0, likes: 0, comments: [], is_published: false, createdAt: new Date(), updatedAt: new Date() }));
                res.status(200).json({
                    status: "success",
                    message: "Download e duplicação realizados com sucesso!",
                    data: {
                        originalCard: {
                            id: card._id,
                            title: card.title,
                            downloads: card.downloads,
                        },
                        duplicatedCard: {
                            id: cardCopy._id,
                            title: cardCopy.title,
                            userId: cardCopy.userId,
                        },
                    },
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                throw new errorHandler_1.AppError("Erro ao realizar o download e duplicação", 500);
            }
        });
    }
}
exports.CommunityController = CommunityController;
