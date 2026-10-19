import express, { Router } from 'express';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { MediaController } from '../controllers/mediaController';

const router = Router();

// Autenticação antes do parser de 9 MB: anônimos não conseguem enviar corpos grandes.
router.post(
  '/images',
  verifyAuthToken,
  express.json({ limit: '9mb' }),
  MediaController.uploadImage
);
router.post(
  '/verification-files',
  verifyAuthToken,
  express.json({ limit: '9mb' }),
  MediaController.uploadVerificationFile
);

export default router;
