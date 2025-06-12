"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const communityController_1 = require("../controllers/communityController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const communityMiddlewares_1 = require("../middlewares/communityMiddlewares");
const errorHandler_1 = require("../middlewares/errorHandler");
const router = (0, express_1.Router)();
const communityController = new communityController_1.CommunityController();
// Middleware para validar parâmetros de rota
const validateRouteParams = (req, res, next) => {
    const { id } = req.params;
    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new errorHandler_1.AppError("ID inválido", 400);
    }
    next();
};
// Aplicar autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Rotas de publicação
router.post("/publish/:id", validateRouteParams, communityMiddlewares_1.validatePublishData, communityMiddlewares_1.checkCardExists, communityMiddlewares_1.checkCardOwnership, communityController.publishCard);
// Rotas de visualização
router.get("/cards", communityController.getPublishedCards);
// Rotas de interação
router.post("/download/:id", validateRouteParams, communityMiddlewares_1.checkCardExists, communityMiddlewares_1.checkCardIsPublished, communityController.downloadCard);
exports.default = router;
