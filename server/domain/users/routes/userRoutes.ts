import express, { Router } from 'express';
import { rateLimitByUser } from '../../../infrastructure/http/rateLimitByUser';
import { UserController } from '../controllers/userController';
import { UsernameController } from '../controllers/usernameController';
import {
  verifyAuthToken,
  requireRecentAuthentication,
} from '../../../infrastructure/auth/authMiddleware';

const router = Router();

router.get('/me', verifyAuthToken, UserController.getProfile);
router.put('/me', verifyAuthToken, UserController.updateProfile);
router.put('/me/preferences', verifyAuthToken, UserController.updatePreferences);
router.post(
  '/me/photo',
  verifyAuthToken,
  express.json({ limit: '6mb' }),
  UserController.uploadPhoto
);
router.get('/me/username-suggestion', verifyAuthToken, UsernameController.suggest);
router.put('/me/username', verifyAuthToken, UsernameController.claim);
// A busca do @ revela quem tem conta: limite por pessoa contra varredura (D21, §7.4).
router.get(
  '/by-username/:username',
  verifyAuthToken,
  rateLimitByUser('username-lookup', 30, 10 * 60_000),
  UsernameController.find
);
router.delete('/me', verifyAuthToken, requireRecentAuthentication, UserController.deleteAccount);

export default router;
