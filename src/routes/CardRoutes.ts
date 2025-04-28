import { Router } from 'express';
import { CardController } from '../controllers/cardController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const cardController = new CardController();

router.post('/cards', authMiddleware, cardController.createCard);
router.put('/cards/:id', authMiddleware, cardController.editCard);
router.get('/cards/:id', authMiddleware, cardController.getCardById);
router.get('/cards/:name', authMiddleware, cardController.getCardByName);
router.delete('/cards/:id', authMiddleware, cardController.deleteCard);

export default router;
