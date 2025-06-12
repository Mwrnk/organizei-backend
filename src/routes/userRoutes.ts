import { Router } from "express";
import { UserController } from "../controllers/userController";
import {
  validateUserData,
  validateSignupData,
  validateLoginData,
  checkUserExists
} from "../middlewares/userMiddlewares";
import { authMiddleware } from "../middlewares/authMiddleware";
import { AppError } from "../middlewares/errorHandler";
import { cacheMiddleware } from "../middlewares/cacheMiddleware";

const router = Router();
const userController = new UserController();

// Middleware para validar parâmetros de rota
const validateRouteParams = (req: any, res: any, next: any) => {
  const { id } = req.params;

  if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new AppError("ID inválido", 400);
  }

  next();
};

// Rotas públicas
router.get("/users", cacheMiddleware(300), userController.getUsers);
router.post("/signup",checkUserExists, validateSignupData, userController.signup);
router.post("/login", validateLoginData, userController.login);
router.get("/users/check-nickname", userController.checkNickname);
router.get("/users/check-email", userController.checkEmail);

// Rotas protegidas
router.use(authMiddleware);

// Rotas de usuário
router.get("/users/:id", validateRouteParams, checkUserExists, cacheMiddleware(300), userController.getUserById);
router.patch("/users/:id", validateRouteParams, checkUserExists, validateUserData, userController.editUser);
router.patch("/users/:id/image", validateRouteParams, checkUserExists, userController.uploadProfileImage);

export default router;
