import { Router } from 'express';
import {
  identifyUserIfPresent,
  verifyAuthToken,
} from '../../../infrastructure/auth/authMiddleware';
import { InsightsController } from '../controllers/insightsController';

const router = Router();

// Visitante sem login também é contado (decisão de 2026-10-19); o App Check de /api continua valendo.
router.post('/track', identifyUserIfPresent, InsightsController.trackInteraction);
router.get('/stats/:itemCollection/:itemId', verifyAuthToken, InsightsController.getItemStats);

export default router;
