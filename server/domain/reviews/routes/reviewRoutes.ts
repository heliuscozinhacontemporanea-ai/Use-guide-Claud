import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';

const router = Router();

router.post('/', verifyAuthToken, ReviewController.submitReview);
router.patch('/:id/respond', verifyAuthToken, ReviewController.respondToReview);
router.delete('/:id', verifyAuthToken, ReviewController.deleteReview);

export default router;
