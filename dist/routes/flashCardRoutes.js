"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const flashcardsController_1 = require("../controllers/flashcardsController");
const errorHandler_1 = require("../middlewares/errorHandler");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const flashcardMiddleware_1 = require("../middlewares/flashcardMiddleware");
const router = (0, express_1.Router)();
const flashcardsController = new flashcardsController_1.FlashcardsController();
const validateRouteParams = (req, res, next) => {
    const { id, cardId } = req.params;
    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new errorHandler_1.AppError("ID inválido", 400);
    }
    if (cardId && !cardId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new errorHandler_1.AppError("ID do card inválido", 400);
    }
    next();
};
router.use(authMiddleware_1.authMiddleware);
router.get("/flashcards", flashcardsController.getAllFlashcards);
router.get("/flashcards/:id", validateRouteParams, flashcardMiddleware_1.checkFlashcardById, flashcardsController.getFlashcardById);
router.get("/flashcards/card/:cardId", validateRouteParams, flashcardsController.getlFlashcardsByCard);
router.get("/flashcards/startreview/:cardId", validateRouteParams, flashcardsController.startReview);
router.post("/flashcards/", flashcardMiddleware_1.validateFlashcardData, flashcardsController.createFlashcard);
router.post("/flashcards/withAI", flashcardMiddleware_1.validateFlashcardWithAIData, flashcardsController.createFlashcardWithAI);
router.patch("/flashcards/:id", validateRouteParams, flashcardMiddleware_1.checkFlashcardById, flashcardMiddleware_1.checkFlashcardOwnership, flashcardMiddleware_1.validateFlashcardUpdateData, flashcardsController.editFlashcard);
router.patch("/flashcards/doreview/:id", validateRouteParams, flashcardMiddleware_1.checkFlashcardById, flashcardMiddleware_1.checkFlashcardOwnership, flashcardMiddleware_1.validateFlashcardReviewData, flashcardsController.handleReview);
router.delete("/flashcards/:id", validateRouteParams, flashcardMiddleware_1.checkFlashcardById, flashcardMiddleware_1.checkFlashcardOwnership, flashcardsController.deteleFlashcard);
exports.default = router;
