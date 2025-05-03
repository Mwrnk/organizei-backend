import { Router } from 'express';
import { CommentController } from '../controllers/commentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const commentController = new CommentController(); 

router.post('/comments', authMiddleware, commentController.createComment);
router.get('/comments/:cardId', authMiddleware, commentController.getComments);
router.delete('/comments/:commentId', authMiddleware, commentController.deleteComment);
router.put('/comments/:commentId', authMiddleware, commentController.updateComment);

export default router;