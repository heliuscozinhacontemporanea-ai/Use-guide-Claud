import { Router } from 'express';
import { identifyUserIfPresent } from '../../../infrastructure/auth/authMiddleware';
import { InsightsController } from '../controllers/insightsController';

const router = Router();

// Visitante sem login também é contado (decisão de 2026-10-19); o App Check de /api continua valendo.
router.post('/track', identifyUserIfPresent, InsightsController.trackInteraction);

export default router;
