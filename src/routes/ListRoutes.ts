import { Router } from "express";
import { ListController } from "../controllers/listController";
import {
  validateListData,
  validateListUpdateData,
  checkListExists,
  checkUserLists,
} from "../middlewares/listMiddlewares";

const router = Router();
const listController = new ListController();

// Criar uma nova lista
router.post("/lists", validateListData, listController.createList);

// Buscar todas as listas
router.get("/lists", listController.getLists);

// Buscar lista por ID
router.get("/lists/:id", checkListExists, listController.getListById);

// Atualizar lista
router.put("/lists/:id", checkListExists, validateListUpdateData, listController.editList);

// Buscar listas por usuário
router.get("/users/:userId/lists", checkUserLists, listController.getListByUserId);

// Deletar lista
router.delete("/lists/:id", checkListExists, listController.deleteList);

export default router;