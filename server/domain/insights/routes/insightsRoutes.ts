import { Router } from 'express';
import { InsightsController } from '../controllers/insightsController';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';

const router = Router();

router.post('/track', verifyAuthToken, InsightsController.trackInteraction);
router.get('/stats/:itemCollection/:itemId', verifyAuthToken, InsightsController.getItemStats);
router.get('/stats/:itemId', verifyAuthToken, InsightsController.getItemStats);

export default router;
