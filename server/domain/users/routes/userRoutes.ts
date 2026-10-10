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
  express.json({ limit: '6mb' }),
  verifyAuthToken,
  UserController.uploadPhoto
);
router.delete('/me', verifyAuthToken, requireRecentAuthentication, UserController.deleteAccount);

export default router;
