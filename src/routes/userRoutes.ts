import { Router } from "express";
import { UserController } from "../controllers/userController";
import {
  validateUserData,
  validateSignupData,
  validateLoginData,
  checkUserExists
} from "../middlewares/userMiddlewares";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const userController = new UserController();

// Rotas públicas
router.get("/users", userController.getUsers);
router.post("/signup", validateSignupData, userController.signup);
router.post("/login", validateLoginData, userController.login);

// Rotas protegidas
router.use(authMiddleware);

router.get("/users/:id", checkUserExists, userController.getUserById);
router.patch("/users/:id", checkUserExists, validateUserData, userController.editUser);
router.patch("/users/:id/image", checkUserExists, userController.uploadProfileImage);

export default router;
