import { Router } from 'express';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { PartnerRegistrationController } from './partnerRegistrationController';

const router = Router();

router.post('/register', verifyAuthToken, PartnerRegistrationController.registerOrUpgrade);

export default router;
