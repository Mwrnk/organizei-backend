import { Router } from "express";
import { ListController } from "../controllers/listController";
import { validateCreateList, validateEditList, validateGetListById } from "../middlewares/listMiddlewares";

const router = Router();
const listController = new ListController();

router.post("/lists", validateCreateList, (req, res) => listController.createList(req, res));
router.get("/lists", (req, res) => listController.getLists(req, res));
router.get("/lists/:id", validateGetListById, (req, res) => listController.getListById(req, res));
router.put("/lists/:id", validateEditList, (req, res) => listController.editList(req, res));

export default router;
