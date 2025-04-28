import { Router } from "express";
import { ListController } from "../controllers/listController";

const router = Router();
const listController = new ListController();

router.post("/lists", (req, res) => listController.createList(req, res));
router.get("/lists", (req, res) => listController.getLists(req, res));
router.get("/lists/:id", (req, res) => listController.getListById(req, res));
router.put("/lists/:id", (req, res) => listController.editList(req, res));

export default router;
