import { Router } from "express";
import { CommunityController } from "../controllers/communityController";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  validatePublishData,
  checkCardExists,
  checkCardIsPublished,
  checkCardOwnership
} from "../middlewares/communityMiddlewares";
import { AppError } from "../middlewares/errorHandler";
import { cacheMiddleware } from "../middlewares/cacheMiddleware";

const router = Router();
const communityController = new CommunityController();

// Middleware para validar parâmetros de rota
const validateRouteParams = (req: any, res: any, next: any) => {
  const { id } = req.params;

  if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new AppError("ID inválido", 400);
  }

  next();
};

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

// Rotas de publicação
router.post(
  "/publish/:id",
  validateRouteParams,
  validatePublishData,
  checkCardExists,
  checkCardOwnership,
  communityController.publishCard
);

// Rotas de visualização
router.get("/cards", cacheMiddleware(600), communityController.getPublishedCards);

// Rotas de interação
router.post(
  "/download/:id",
  validateRouteParams,
  checkCardExists,
  checkCardIsPublished,
  communityController.downloadCard
);

export default router;