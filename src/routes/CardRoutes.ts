import { Router } from "express";
import { CardController } from "../controllers/cardController";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  validateCardData,
  validateCardUpdateData,
  checkCardById,
  checkCardByTitle,
} from "../middlewares/cardMiddlewares";

const router = Router();
const cardController = new CardController();

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

// Buscar todos os cards
router.get("/cards", cardController.getAllCards);

// Buscar card por ID
router.get("/cards/:id", checkCardById, cardController.getCardById);

// Buscar card por título
router.get("/cards/title/:title", checkCardByTitle, cardController.getCardByTitle);

// Buscar cards por lista
router.get("/lists/:listId/cards", cardController.getCardsByListId);

// Criar um novo card
router.post("/cards", validateCardData, cardController.createCard);

// Dar like no card
router.post("/cards/:id/like", checkCardById, cardController.likeCard);

// Atualizar card
router.patch("/cards/:id", checkCardById, validateCardUpdateData, cardController.editCard);

// Deletar card
router.delete("/cards/:id", checkCardById, cardController.deleteCard);

export default router;
