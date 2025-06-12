"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const listController_1 = require("../controllers/listController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const listMiddlewares_1 = require("../middlewares/listMiddlewares");
const router = (0, express_1.Router)();
const listController = new listController_1.ListController();
// Aplicar autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
// Criar uma nova lista
router.post("/lists", listMiddlewares_1.validateListData, listMiddlewares_1.checkListLimit, listController.createList);
// Buscar todas as listas
router.get("/lists", listController.getLists);
// Buscar lista por ID
router.get("/lists/:id", listMiddlewares_1.checkListExists, listController.getListById);
// Atualizar lista
router.put("/lists/:id", listMiddlewares_1.checkListExists, listMiddlewares_1.checkListOwnership, listMiddlewares_1.validateListUpdateData, listController.editList);
// Buscar listas por usuário
router.get("/lists/user/:userId", listMiddlewares_1.checkUserLists, listController.getListByUserId);
// Deletar lista
router.delete("/lists/:id", listMiddlewares_1.checkListExists, listMiddlewares_1.checkListOwnership, listController.deleteList);
exports.default = router;
