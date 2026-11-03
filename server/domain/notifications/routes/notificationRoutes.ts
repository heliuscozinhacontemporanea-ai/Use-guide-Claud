import { Router } from 'express';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { NotificationController } from '../controllers/notificationController';

const router = Router();

router.patch('/read-all', verifyAuthToken, NotificationController.markAllAsRead);
router.patch('/:id/read', verifyAuthToken, NotificationController.markAsRead);
router.get('/preferences', verifyAuthToken, NotificationController.getPreferences);
router.patch('/preferences', verifyAuthToken, NotificationController.updatePreferences);
router.post('/devices', verifyAuthToken, NotificationController.registerDevice);
// DELETE com corpo: o token não vai na URL (AGENTS.md §7.9).
router.delete('/devices', verifyAuthToken, NotificationController.unregisterDevice);

export default router;
