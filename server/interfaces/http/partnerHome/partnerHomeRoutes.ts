import { Router } from 'express';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { PartnerHomeController } from './partnerHomeController';

const router = Router();

router.get('/', verifyAuthToken, PartnerHomeController.get);
router.put('/cards', verifyAuthToken, PartnerHomeController.saveCards);
router.get('/agenda', verifyAuthToken, PartnerHomeController.getAgenda);

export default router;
