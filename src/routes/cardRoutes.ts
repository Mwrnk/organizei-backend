import { Router } from "express";
import { CardController, upload } from "../controllers/cardController";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  validateCardData,
  validateCardUpdateData,
  checkCardById,
  checkCardByTitle,
  checkCardOwnership,
  checkCardIsPublished
} from "../middlewares/cardMiddlewares";
import { AppError } from "../middlewares/errorHandler";
import { Request, Response, NextFunction } from "express";

const router = Router();
const cardController = new CardController();

// Middleware para validar parâmetros de rota
const validateRouteParams = (req: Request, res: Response, next: NextFunction) => {
  const { id, listId, title } = req.params;

  if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new AppError("ID inválido", 400);
  }

  if (listId && !listId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new AppError("ID da lista inválido", 400);
  }

  if (title && (title.length < 3 || title.length > 100)) {
    throw new AppError("Título inválido", 400);
  }

  next();
};

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

// Rotas de busca
router.get("/cards", cardController.getAllCards);
router.get("/cards/:id", validateRouteParams, checkCardById, cardController.getCardById);
router.get("/cards/title/:title", validateRouteParams, checkCardByTitle, cardController.getCardByTitle);
router.get("/lists/:listId/cards", validateRouteParams, cardController.getCardsByListId);
router.get('/cards/user/:userId', validateRouteParams, cardController.getCardsByUserId);

// Rotas de manipulação
router.post("/cards", validateCardData, cardController.createCard);
router.post("/cards/:id/like", validateRouteParams, checkCardById, checkCardIsPublished, cardController.likeCard);
router.post("/cards/:id/unlike", validateRouteParams, checkCardById, checkCardIsPublished, cardController.unlikeCard);

router.post("/cards/:id/files", validateRouteParams, checkCardById, checkCardOwnership, upload.array('files', 5) as any, cardController.uploadFiles);
router.get("/cards/:id/pdf/:pdfIndex", validateRouteParams, checkCardById, cardController.downloadPdf);
router.patch("/cards/:id", validateRouteParams, checkCardById, checkCardOwnership, validateCardUpdateData, cardController.editCard);
router.delete("/cards/:id", validateRouteParams, checkCardById, checkCardOwnership, cardController.deleteCard);

export default router;
