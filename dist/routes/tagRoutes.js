"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tagController_1 = require("../controllers/tagController");
const errorHandler_1 = require("../middlewares/errorHandler");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const tagMiddleware_1 = require("../middlewares/tagMiddleware");
const router = (0, express_1.Router)();
const tagController = new tagController_1.TagController();
const validateRouteParams = (req, res, next) => {
    const { id, name } = req.params;
    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new errorHandler_1.AppError("ID inválido", 400);
    }
    if (name && (name.length < 3 || name.length > 100)) {
        throw new errorHandler_1.AppError("Nome inválido", 400);
    }
    next();
};
router.use(authMiddleware_1.authMiddleware);
router.get("/tags", tagController.getAllTag);
router.get("/tags/:id", validateRouteParams, tagMiddleware_1.checkTagById, tagController.getTagById);
router.get("/tags/name/:name", validateRouteParams, tagMiddleware_1.checkTagByName, tagController.getTagByName);
router.post("/tags", tagMiddleware_1.validateTagData, tagController.createTag);
router.put("/tags/:id", validateRouteParams, tagMiddleware_1.checkTagById, tagMiddleware_1.validateTagData, tagController.editTag);
router.delete("/tags/:id", validateRouteParams, tagMiddleware_1.checkTagById, tagController.deleteTag);
exports.default = router;
