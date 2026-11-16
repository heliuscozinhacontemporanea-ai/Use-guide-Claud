import { Router } from 'express';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { PartnerClosureController } from './partnerClosureController';

const router = Router();

router.delete('/', verifyAuthToken, PartnerClosureController.close);
router.delete('/:partnerId', verifyAuthToken, PartnerClosureController.close);

export default router;
