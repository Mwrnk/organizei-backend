import { Router } from 'express';
import { CommentController } from '../controllers/commentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const commentController = new CommentController(); 

router.use(authMiddleware);

router.get('/comments/:cardId', authMiddleware, commentController.getComments);
router.post('/comments', authMiddleware, commentController.createComment);
router.put('/comments/:commentId', authMiddleware, commentController.updateComment);
router.delete('/comments/:commentId', authMiddleware, commentController.deleteComment);

export default router;