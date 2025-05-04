import { Router } from "express";
import { AreaController } from "../controllers/areaController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateAreaData } from "../middlewares/areaMiddleware";  

const router = Router();
const areaController = new AreaController();

// Rotas públicas
router.get("/areas", (req, res) => areaController.getAreas(req, res));
router.get("/areas/:id", (req, res) => areaController.getAreaById(req, res));
router.get("/areas/user/:userId", (req, res) => areaController.getAreaByUserId(req, res));
router.get("/areas/:id/cards", (req, res) => areaController.getCardsByArea(req, res));

// Rotas protegidas com autenticação e validação
router.post("/areas", authMiddleware, validateAreaData, (req, res) => areaController.createArea(req, res));
router.put("/areas/:id", authMiddleware, validateAreaData, (req, res) => areaController.editArea(req, res));
router.delete("/areas/:id", authMiddleware, (req, res) => areaController.deleteArea(req, res));

export default router;
