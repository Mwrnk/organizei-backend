import { Router } from 'express';
import { PlanController } from '../controllers/planController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const planController = new PlanController();

// Rotas públicas
router.get("/plans", (req, res) => planController.listPlans(req, res));

router.use(authMiddleware);
// Rotas protegidas
router.get("/users/:userId/plan", authMiddleware, (req, res) =>    planController.getUserCurrentPlan(req, res));
router.get("/users/:userId/plan-history", authMiddleware, (req, res) => planController.getUserPlanHistory(req, res));
router.post("/plans", authMiddleware, (req, res) => planController.createPlan(req, res));
router.put("/users/:userId/plan", authMiddleware, (req, res) => planController.updateUserPlan(req, res));
router.put("/users/:userId/plan/points", authMiddleware, (req, res) => planController.updateUserPlanPoints(req, res));

export default router;
