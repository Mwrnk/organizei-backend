"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const planController_1 = require("../controllers/planController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const planController = new planController_1.PlanController();
// Rotas públicas
router.get("/plans", (req, res) => planController.listPlans(req, res));
router.use(authMiddleware_1.authMiddleware);
// Rotas protegidas
router.get("/users/:userId/plan", authMiddleware_1.authMiddleware, (req, res) => planController.getUserCurrentPlan(req, res));
router.get("/users/:userId/plan-history", authMiddleware_1.authMiddleware, (req, res) => planController.getUserPlanHistory(req, res));
router.post("/plans", authMiddleware_1.authMiddleware, (req, res) => planController.createPlan(req, res));
router.put("/users/:userId/plan", authMiddleware_1.authMiddleware, (req, res) => planController.updateUserPlan(req, res));
exports.default = router;
