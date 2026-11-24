import { Router } from 'express';
import { verifyAdminToken } from '../../../infrastructure/auth/authMiddleware';
import { AdminListingController } from './adminListingController';

const router = Router();

router.get('/:itemId', verifyAdminToken, AdminListingController.get);

export default router;
