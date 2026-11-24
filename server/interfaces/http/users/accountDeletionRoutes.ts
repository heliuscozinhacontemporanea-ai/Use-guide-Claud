import { Router } from 'express';
import {
  requireRecentAuthentication,
  verifyAuthToken,
} from '../../../infrastructure/auth/authMiddleware';
import { AccountDeletionController } from './accountDeletionController';

const router = Router();

router.delete(
  '/me',
  verifyAuthToken,
  requireRecentAuthentication,
  AccountDeletionController.deleteAccount
);

export default router;
