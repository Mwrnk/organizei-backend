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
router.get("/users", userController.getUsers);
router.post("/signup", validateSignupData, userController.signup);
router.post("/login", validateLoginData, userController.login);

// Rotas protegidas
router.use(authMiddleware);

// Rotas de usuário
router.get("/users/:id", validateRouteParams, checkUserExists, userController.getUserById);
router.patch("/users/:id", validateRouteParams, checkUserExists, validateUserData, userController.editUser);
router.patch("/users/:id/image", validateRouteParams, checkUserExists, userController.uploadProfileImage);

export default router;
