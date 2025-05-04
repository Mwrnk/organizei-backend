import { Router } from "express";
import { CardController } from "../controllers/cardController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const cardController = new CardController();

router.post("/cards", authMiddleware, cardController.createCard);
router.put("/cards/:id", authMiddleware, cardController.editCard);
router.get("/cards/:id", authMiddleware, cardController.getCardById);
router.get("/cards/:title", authMiddleware, cardController.getCardByTitle);
router.delete("/cards/:id", authMiddleware, cardController.deleteCard);
//nova rota criada para buscar lista com cards criados
router.get("/cards/list/:listId", authMiddleware, (req, res) => cardController.getCardsByListId(req, res));
 //FEITO POR MATHEUS RIBAS
 //ROTA PARA BUSCAR TODOS OS CARDS
router.get("/cards", authMiddleware, cardController.getAllCards);

export default router;
