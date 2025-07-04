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

// Rotas de manipulação básica
router.post("/cards", validateCardData, cardController.createCard);
router.patch("/cards/:id", validateRouteParams, checkCardById, checkCardOwnership, validateCardUpdateData, cardController.editCard);
router.delete("/cards/:id", validateRouteParams, checkCardById, checkCardOwnership, cardController.deleteCard);

// Rotas de interação (likes)
router.post("/cards/:id/like", validateRouteParams, checkCardById, validateLikeOperation, cardController.likeCard);
router.post("/cards/:id/unlike", validateRouteParams, checkCardById, validateLikeOperation, cardController.unlikeCard);

// Rotas de PDFs
router.get("/cards/:id/pdf/:pdfIndex/download", validateRouteParams, checkCardById, cardController.downloadPdf);
router.get("/cards/:id/pdf/:pdfIndex/view", validateRouteParams, checkCardById, cardController.viewPdf);
router.get('/cards/:id/pdfs/', validateRouteParams, checkCardById, cardController.getPdfsByCardId);
router.post('/cards/:id/files', validateRouteParams, checkCardById, checkCardOwnership, upload.array('pdfs', 5) as any, cardController.uploadPdfs);

// Rotas de imagem
router.get('/cards/:id/image/info', validateRouteParams, checkCardById, cardController.getImageInfo);
router.get("/cards/:id/image/view", validateRouteParams, checkCardById, cardController.viewImage);
router.get("/cards/:id/image/download", validateRouteParams, checkCardById, cardController.downloadImage);
router.delete('/cards/:id/image', validateRouteParams, checkCardById, checkCardOwnership, cardController.removeImage);
router.post('/cards/:id/image', validateRouteParams, checkCardById, checkCardOwnership, upload.single('image') as any, cardController.uploadImage);

export default router;
