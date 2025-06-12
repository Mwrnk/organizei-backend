"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const userMiddlewares_1 = require("../middlewares/userMiddlewares");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const errorHandler_1 = require("../middlewares/errorHandler");
const router = (0, express_1.Router)();
const userController = new userController_1.UserController();
// Middleware para validar parâmetros de rota
const validateRouteParams = (req, res, next) => {
    const { id } = req.params;
    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new errorHandler_1.AppError("ID inválido", 400);
    }
    next();
};
// Rotas públicas
router.get("/users", userController.getUsers);
router.post("/signup", userMiddlewares_1.checkUserExists, userMiddlewares_1.validateSignupData, userController.signup);
router.post("/login", userMiddlewares_1.validateLoginData, userController.login);
router.get("/users/check-nickname", userController.checkNickname);
router.get("/users/check-email", userController.checkEmail);
// Rotas protegidas
router.use(authMiddleware_1.authMiddleware);
// Rotas de usuário
router.get("/users/:id", validateRouteParams, userMiddlewares_1.checkUserExists, userController.getUserById);
router.patch("/users/:id", validateRouteParams, userMiddlewares_1.checkUserExists, userMiddlewares_1.validateUserData, userController.editUser);
router.patch("/users/:id/image", validateRouteParams, userMiddlewares_1.checkUserExists, userController.uploadProfileImage);
exports.default = router;
