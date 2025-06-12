import { Router } from "express";
import { CardController, upload } from "../controllers/cardController";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  validateCardData,
  validateCardUpdateData,
  checkCardById,
  checkCardByTitle,
  checkCardOwnership,
  checkCardIsPublished,
  validateLikeOperation
} from "../middlewares/cardMiddlewares";
import { AppError } from "../middlewares/errorHandler";
import { Request, Response, NextFunction } from "express";

const router = Router();
const cardController = new CardController();

// Middleware para validar parâmetros de rota
const validateRouteParams = (req: Request, res: Response, next: NextFunction) => {
  const { id, listId, title, imageIndex, pdfIndex } = req.params;

  if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new AppError("ID inválido", 400);
  }

  if (listId && !listId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new AppError("ID da lista inválido", 400);
  }

  if (title && (title.length < 3 || title.length > 100)) {
    throw new AppError("Título inválido", 400);
  }

  if (imageIndex && isNaN(parseInt(imageIndex))) {
    throw new AppError("Índice da imagem inválido", 400);
  }

  if (pdfIndex && isNaN(parseInt(pdfIndex))) {
    throw new AppError("Índice do PDF inválido", 400);
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
router.post("/cards/:id/like", validateRouteParams, checkCardById, validateLikeOperation, cardController.likeCard);
router.post("/cards/:id/unlike", validateRouteParams, checkCardById, validateLikeOperation, cardController.unlikeCard);

// Rotas de arquivos
router.post("/cards/:id/files", validateRouteParams, checkCardById, checkCardOwnership, upload.array('files', 5) as any, cardController.uploadFiles);

// Rotas de PDFs
router.get("/cards/:id/pdf/:pdfIndex/download", validateRouteParams, checkCardById, cardController.downloadPdf);
router.get("/cards/:id/pdf/:pdfIndex/view", validateRouteParams, checkCardById, cardController.viewPdf);
router.get('/cards/:id/pdfs/', validateRouteParams, cardController.getPdfsByCardId);

<<<<<<< Updated upstream
// Novas rotas para imagens
=======
// Rotas de Imagens
>>>>>>> Stashed changes
router.get("/cards/:id/image/:imageIndex/view", validateRouteParams, checkCardById, cardController.viewImage);
router.get("/cards/:id/image/:imageIndex/download", validateRouteParams, checkCardById, cardController.downloadImage);
router.get('/cards/:id/images/', validateRouteParams, cardController.getImagesByCardId);

router.patch("/cards/:id", validateRouteParams, checkCardById, checkCardOwnership, validateCardUpdateData, cardController.editCard);
router.delete("/cards/:id", validateRouteParams, checkCardById, checkCardOwnership, cardController.deleteCard);

export default router;
