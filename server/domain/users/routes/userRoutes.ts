import express, { Router } from 'express';
import {
  requireRecentAuthentication,
  verifyAuthToken,
} from '../../../infrastructure/auth/authMiddleware';
import { rateLimitByUser } from '../../../infrastructure/http/rateLimitByUser';
import { UserController } from '../controllers/userController';
import { UsernameController } from '../controllers/usernameController';

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
// A busca do @ revela quem tem conta: limite por pessoa contra varredura (D21, §7.4).
router.get(
  '/by-username/:username',
  verifyAuthToken,
  rateLimitByUser('username-lookup', 30, 10 * 60_000),
  UsernameController.find
);
// Busca pelo começo do @ a cada letra: limite maior, ainda por pessoa (§7.4).
router.get(
  '/usernames',
  verifyAuthToken,
  rateLimitByUser('username-search', 120, 10 * 60_000),
  UsernameController.search
);
router.delete('/me', verifyAuthToken, requireRecentAuthentication, UserController.deleteAccount);

export default router;
