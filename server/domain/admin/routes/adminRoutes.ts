import { Router } from 'express';
import { verifyAdminToken } from '../../../infrastructure/auth/authMiddleware';
import { AdminPlansController } from '../controllers/adminPlansController';

const router = Router();

router.get('/plans', verifyAdminToken, AdminPlansController.getPlans);
router.put('/plans/:id', verifyAdminToken, AdminPlansController.updatePlan);

export default router;
