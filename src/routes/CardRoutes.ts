import { Router } from 'express';
import { CardController } from '../controllers/cardController';

const router = Router();
const cardController = new CardController();

router.post('/cards', cardController.createCard);
router.put('/cards/:id', cardController.editCard);
router.get('/cards/:id', cardController.getCardById);
router.get('/cards/:name', cardController.getCardByName);
router.delete('/cards/:id', cardController.deleteCard);

export default router;
