import { Router } from "express";
import { CommunityController } from "../controllers/communityController";
import { checkCardById } from "../middlewares/cardMiddlewares";

const router = Router();
const communityController = new CommunityController();

// Publicar um card
router.post("/publish/:id", checkCardById, communityController.publishCard);

// Listar todos os cards publicados
router.get("/cards", communityController.getPublishedCards);

// Registrar download de um card
router.post("/download/:id", checkCardById, communityController.downloadCard);

export default router;