import { Router } from "express";
import { FlashcardsController } from "../controllers/flashcardsController";
import { AppError } from "../middlewares/errorHandler";
import { authMiddleware } from "../middlewares/authMiddleware";
import { 
    checkFlashcardById,
    checkFlashcardOwnership,
    validateFlashcardWithAIData,
    validateFlashcardData,
    validateFlashcardReviewData,
    validateFlashcardUpdateData
} from "../middlewares/flashcardMiddleware";

const router = Router();
const flashcardsController = new FlashcardsController();

const validateRouteParams = (req: any, res: any, next: any) => {
    const { id, cardId } = req.params;

    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError("ID inválido", 400);
    }

    if (cardId && !cardId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError("ID do card inválido", 400);
    }

    next();
}

router.use(authMiddleware);

router.get("/flashcards", flashcardsController.getAllFlashcards);
router.get("/flashcards/:id", validateRouteParams, checkFlashcardById, flashcardsController.getFlashcardById);
router.get("/flashcards/card/:cardId", validateRouteParams, flashcardsController.getlFlashcardsByCard);
router.get("/flashcards/startreview/:cardId", validateRouteParams, flashcardsController.startReview);

router.post("/flashcards/", validateFlashcardData, flashcardsController.createFlashcard);
router.post("/flashcards/withAI", validateFlashcardWithAIData, flashcardsController.createFlashcardWithAI);
router.patch(
    "/flashcards/:id", 
    validateRouteParams, 
    checkFlashcardById, 
    checkFlashcardOwnership, 
    validateFlashcardUpdateData, 
    flashcardsController.editFlashcard
);
router.patch(
    "/flashcards/doreview/:id", 
    validateRouteParams, 
    checkFlashcardById, 
    checkFlashcardOwnership, 
    validateFlashcardReviewData, 
    flashcardsController.handleReview
);
router.delete("/flashcards/:id", validateRouteParams, checkFlashcardById, checkFlashcardOwnership, flashcardsController.deteleFlashcard);

export default router;
