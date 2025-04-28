import { Router } from "express";
import { ListController } from "../controllers/listController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const listController = new ListController();

router.post("/lists", authMiddleware, (req, res) => listController.createList(req, res));
router.get("/lists", authMiddleware, (req, res) => listController.getLists(req, res));
router.get("/lists/:id", authMiddleware, (req, res) => listController.getListById(req, res));
router.put("/lists/:id", authMiddleware, (req, res) => listController.editList(req, res));

export default router;
