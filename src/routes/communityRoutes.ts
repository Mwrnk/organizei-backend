import { Router } from "express";
import { CommunityController } from "../controllers/communityController";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  validatePublishData,
  checkCardExists,
  checkCardIsPublished,
  checkCardOwnership
} from "../middlewares/communityMiddlewares";

const router = Router();
const communityController = new CommunityController();

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

// Publicar um card
router.post(
  "/publish/:id",
  validatePublishData,
  checkCardExists,
  checkCardOwnership,
  communityController.publishCard
);

// Listar cards publicados
router.get("/cards", communityController.getPublishedCards);

// Download de um card
router.post(
  "/download/:id",
  validatePublishData,
  checkCardExists,
  checkCardIsPublished,
  communityController.downloadCard
);

export default router;