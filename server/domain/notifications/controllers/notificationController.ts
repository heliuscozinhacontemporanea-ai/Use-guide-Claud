import { Request, Response } from 'express';
import { notificationService } from '../factory';
import { SendAdminMessageDTO } from '../dtos/SendAdminMessageDTO';
import { UpdateNotificationSettingsDTO } from '../dtos/UpdateNotificationSettingsDTO';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
import {
  NotificationNotFoundError,
  NotificationForbiddenError,
} from '../errors/notificationErrors';
import {
  sendAdminMessageSchema,
  updateNotificationSettingsSchema,
} from '../schemas/notificationSchema';

export class NotificationController {
  static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const rawNotificationId = req.params.id;
      const notificationId = Array.isArray(rawNotificationId)
        ? rawNotificationId[0]
        : rawNotificationId;
      if (!notificationId) {
        res.status(400).json({ error: 'ID da notificação é obrigatório' });
        return;
      }

      await notificationService.markAsRead(notificationId, uid);
      res.status(200).json({ success: true, message: 'Notificação marcada como lida.' });
    } catch (error: unknown) {
      if (error instanceof NotificationNotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error instanceof NotificationForbiddenError) {
        res.status(403).json({ error: error.message });
        return;
      }
      const msg = error instanceof Error ? error.message : 'Erro ao atualizar notificação';
      if (msg === 'Notificação não encontrada') {
        res.status(404).json({ error: msg });
        return;
      }
      if (msg === 'Não autorizado a alterar esta notificação') {
        res.status(403).json({ error: msg });
        return;
      }
      console.error('[NotificationController.markAsRead Error]:', error);
      res.status(500).json({ error: msg });
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      await notificationService.markAllAsRead(uid);
      res
        .status(200)
        .json({ success: true, message: 'Todas as notificações foram marcadas como lidas.' });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao atualizar notificações';
      console.error('[NotificationController.markAllAsRead Error]:', error);
      res.status(500).json({ error: msg });
    }
  }

  static async sendAdminMessage(req: Request, res: Response): Promise<void> {
    try {
      // 1. Camada 2: Validação de Entrada no Backend (Zod safeParse)
      const parseResult = sendAdminMessageSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Erro de validação no payload de mensagem administrativa',
          details: parseResult.error.issues,
        });
        return;
      }

      // 2. Camada 3: Mapeamento e Higienização via DTO
      const dto = SendAdminMessageDTO.fromRaw(parseResult.data);

      await notificationService.sendAdminMessage(dto.recipientIds, dto.title, dto.message);

      res
        .status(200)
        .json({ success: true, message: 'Mensagem do administrador enviada com sucesso.' });
    } catch (error) {
      console.error('[Send Admin Message Controller Error]:', error);
      res.status(500).json({ error: 'Erro interno ao enviar mensagem do administrador.' });
    }
  }

  static async getSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }
      const settings = await notificationService.getSettings(uid);
      res.status(200).json(settings);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao buscar configurações';
      console.error('[NotificationController.getSettings Error]:', error);
      res.status(500).json({ error: msg });
    }
  }

  static async updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      // 1. Camada 2: Validação Zod com strict
      const parseResult = updateNotificationSettingsSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Erro de validação nas configurações de notificação',
          details: parseResult.error.issues,
        });
        return;
      }

      // 2. Camada 3: Mapeamento e Higienização via DTO
      const dto = UpdateNotificationSettingsDTO.fromRaw(parseResult.data);

      await notificationService.updateSettings(uid, dto);
      res.status(200).json({ success: true, message: 'Configurações atualizadas com sucesso.' });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao salvar configurações';
      console.error('[NotificationController.updateSettings Error]:', error);
      res.status(500).json({ error: msg });
    }
  }
}
