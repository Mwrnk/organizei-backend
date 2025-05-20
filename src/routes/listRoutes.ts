import { Router } from "express";
import { ListController } from "../controllers/listController";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  validateListData,
  validateListUpdateData,
  checkListExists,
  checkListOwnership,
  checkUserLists,
  checkListLimit
} from "../middlewares/listMiddlewares";

const router = Router();
const listController = new ListController();

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

// Criar uma nova lista
router.post(
  "/lists",
  validateListData,
  checkListLimit,
  listController.createList
);

// Buscar todas as listas
router.get("/lists", listController.getLists);

// Buscar lista por ID
router.get(
  "/lists/:id",
  checkListExists,
  listController.getListById
);

// Atualizar lista
router.put(
  "/lists/:id",
  checkListExists,
  checkListOwnership,
  validateListUpdateData,
  listController.editList
);

// Buscar listas por usuário
router.get(
  "/lists/user/:userId",
  checkUserLists,
  listController.getListByUserId
);

// Deletar lista
router.delete(
  "/lists/:id",
  checkListExists,
  checkListOwnership,
  listController.deleteList
);

export default router;
