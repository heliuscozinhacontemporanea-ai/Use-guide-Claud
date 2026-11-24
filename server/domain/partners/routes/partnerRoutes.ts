import { Router } from 'express';
import { verifyAdminToken, verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { PartnerController } from '../controllers/partnerController';

const router = Router();

router.get('/profile', verifyAuthToken, PartnerController.getProfile);
router.get('/profile/:partnerId', verifyAuthToken, PartnerController.getProfile);
router.patch('/status', verifyAdminToken, PartnerController.updateStatus);

export default router;
