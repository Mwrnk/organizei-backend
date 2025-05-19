import { Router } from "express";
import { TagController } from "../controllers/tagController";
import { AppError } from "../middlewares/errorHandler";
import { authMiddleware } from "../middlewares/authMiddleware";
import { 
    validateTagData,
    checkTagById,
    checkTagByName
} from "../middlewares/tagMiddleware";

const router = Router();
const tagController = new TagController();

const validateRouteParams = (req: any, res: any, next: any) => {
    const { id, name } = req.params;

    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError("ID inválido", 400);
    }

    if (name && (name.length < 3 || name.length > 100)) {
        throw new AppError("Nome inválido", 400);
    }

    next();
}

router.use(authMiddleware);

router.get("/tags", tagController.getAllTag);
router.get("/tags/:id", validateRouteParams, checkTagById, tagController.getTagById);
router.get("/tags/name/:name", validateRouteParams, checkTagByName, tagController.getTagByName);

router.post("/tags", validateTagData, tagController.createTag);
router.put("/tags/:id", validateRouteParams, checkTagById, validateTagData, tagController.editTag);
router.delete("/tags/:id", validateRouteParams, checkTagById, tagController.deleteTag);

export default router;
