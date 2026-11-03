import { Router } from 'express';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { NotificationController } from '../controllers/notificationController';

const router = Router();

router.patch('/read-all', verifyAuthToken, NotificationController.markAllAsRead);
router.patch('/:id/read', verifyAuthToken, NotificationController.markAsRead);
router.get('/preferences', verifyAuthToken, NotificationController.getPreferences);
router.patch('/preferences', verifyAuthToken, NotificationController.updatePreferences);

export default router;
