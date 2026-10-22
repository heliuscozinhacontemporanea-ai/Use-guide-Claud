import { Router } from 'express';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { ListingStatsController } from './listingStatsController';

const router = Router();

router.get('/:itemCollection/:itemId', verifyAuthToken, ListingStatsController.get);

export default router;
