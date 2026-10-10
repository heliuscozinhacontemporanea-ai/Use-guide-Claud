import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { verifyAuthToken, verifyAdminToken } from '../../../infrastructure/auth/authMiddleware';

const router = Router();

// Envio de mensagens personalizadas do administrador para um ou múltiplos parceiros
router.post('/send-admin', verifyAdminToken, NotificationController.sendAdminMessage);

// Atualização de status de leitura de notificações
router.patch('/read-all', verifyAuthToken, NotificationController.markAllAsRead);
router.patch('/:id/read', verifyAuthToken, NotificationController.markAsRead);

// Configurações de notificação do parceiro
router.get('/settings', verifyAuthToken, NotificationController.getSettings);
router.put('/settings', verifyAuthToken, NotificationController.updateSettings);

export default router;
