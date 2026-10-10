import express, { Router } from 'express';
import { UserController } from '../controllers/userController';
import {
  verifyAuthToken,
  requireRecentAuthentication,
} from '../../../infrastructure/auth/authMiddleware';

const router = Router();

router.get('/me', verifyAuthToken, UserController.getProfile);
router.put('/me', verifyAuthToken, UserController.updateProfile);
router.post(
  '/me/photo',
  verifyAuthToken,
  express.json({ limit: '6mb' }),
  UserController.uploadPhoto
);
router.delete('/me', verifyAuthToken, requireRecentAuthentication, UserController.deleteAccount);

export default router;
