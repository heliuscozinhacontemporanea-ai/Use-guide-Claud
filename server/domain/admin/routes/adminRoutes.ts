import { Router } from 'express';
import { verifyAdminToken } from '../../../infrastructure/auth/authMiddleware';
import { AdminPartnersController } from '../controllers/adminPartnersController';
import { AdminPlansController } from '../controllers/adminPlansController';
import { AdminStatsController } from '../controllers/adminStatsController';

const router = Router();

router.get('/stats', verifyAdminToken, AdminStatsController.getStats);
router.get('/plans', verifyAdminToken, AdminPlansController.getPlans);
router.put('/plans/:id', verifyAdminToken, AdminPlansController.updatePlan);
router.get('/partners', verifyAdminToken, AdminPartnersController.getPartners);

export default router;
