import { Router } from 'express';
import { verifyAdminToken } from '../../../infrastructure/auth/authMiddleware';
import { AdminPartnersController } from './adminPartnersController';
import { AdminStatsController } from './adminStatsController';

// Relatórios do painel do admin: juntam vários domínios pela camada de aplicação (B2).
const router = Router();

router.get('/stats', verifyAdminToken, AdminStatsController.getStats);
router.get('/partners', verifyAdminToken, AdminPartnersController.getPartners);

export default router;
