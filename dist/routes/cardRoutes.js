"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cardController_1 = require("../controllers/cardController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const cardMiddlewares_1 = require("../middlewares/cardMiddlewares");
const errorHandler_1 = require("../middlewares/errorHandler");
const router = (0, express_1.Router)();
const cardController = new cardController_1.CardController();
// Middleware para validar parâmetros de rota
const validateRouteParams = (req, res, next) => {
    const { id, listId, title } = req.params;
    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new errorHandler_1.AppError("ID inválido", 400);
    }
    if (listId && !listId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new errorHandler_1.AppError("ID da lista inválido", 400);
    }
    if (title && (title.length < 3 || title.length > 100)) {
        throw new errorHandler_1.AppError("Título inválido", 400);
    }
    next();
};
// Aplicar autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Rotas de busca
router.get("/cards", cardController.getAllCards);
router.get("/cards/:id", validateRouteParams, cardMiddlewares_1.checkCardById, cardController.getCardById);
router.get("/cards/title/:title", validateRouteParams, cardMiddlewares_1.checkCardByTitle, cardController.getCardByTitle);
router.get("/lists/:listId/cards", validateRouteParams, cardController.getCardsByListId);
router.get('/cards/user/:userId', validateRouteParams, cardController.getCardsByUserId);
// Rotas de manipulação básica
router.post("/cards", cardMiddlewares_1.validateCardData, cardController.createCard);
router.patch("/cards/:id", validateRouteParams, cardMiddlewares_1.checkCardById, cardMiddlewares_1.checkCardOwnership, cardMiddlewares_1.validateCardUpdateData, cardController.editCard);
router.delete("/cards/:id", validateRouteParams, cardMiddlewares_1.checkCardById, cardMiddlewares_1.checkCardOwnership, cardController.deleteCard);
// Rotas de interação (likes)
router.post("/cards/:id/like", validateRouteParams, cardMiddlewares_1.checkCardById, cardMiddlewares_1.validateLikeOperation, cardController.likeCard);
router.post("/cards/:id/unlike", validateRouteParams, cardMiddlewares_1.checkCardById, cardMiddlewares_1.validateLikeOperation, cardController.unlikeCard);
// Rotas de arquivos
router.post("/cards/:id/files", validateRouteParams, cardMiddlewares_1.checkCardById, cardMiddlewares_1.checkCardOwnership, cardController_1.upload.array('files', 5), cardController.uploadFiles);
// Rotas de PDFs
router.get("/cards/:id/pdf/:pdfIndex/download", validateRouteParams, cardMiddlewares_1.checkCardById, cardController.downloadPdf);
router.get("/cards/:id/pdf/:pdfIndex/view", validateRouteParams, cardMiddlewares_1.checkCardById, cardController.viewPdf);
router.get('/cards/:id/pdfs/', validateRouteParams, cardMiddlewares_1.checkCardById, cardController.getPdfsByCardId);
// Rotas de imagem
router.get('/cards/:id/image/info', validateRouteParams, cardMiddlewares_1.checkCardById, cardController.getImageInfo);
router.get("/cards/:id/image/view", validateRouteParams, cardMiddlewares_1.checkCardById, cardController.viewImage);
router.get("/cards/:id/image/download", validateRouteParams, cardMiddlewares_1.checkCardById, cardController.downloadImage);
router.delete('/cards/:id/image', validateRouteParams, cardMiddlewares_1.checkCardById, cardMiddlewares_1.checkCardOwnership, cardController.removeImage);
exports.default = router;
