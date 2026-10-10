import {
  NotificationRepositoryPort,
  CreateNotificationInput,
} from '../ports/notificationRepositoryPort';
import { NotificationSettingsPatch } from '../dtos/UpdateNotificationSettingsDTO';
import { getAllPartnerIdsUseCase } from '../../partners';

export class NotificationService {
  constructor(private repo: NotificationRepositoryPort) {}

  async createNotification(input: CreateNotificationInput): Promise<void> {
    // If the type is configurable, check if the partner opted in
    if (input.type === 'review' || input.type === 'plan_expiring') {
      const enabled = await this.repo.isNotificationTypeEnabled(
        input.recipientPartnerId,
        input.type
      );
      if (!enabled) return;
    }

    await this.repo.createNotification(input);
  }

  async sendAdminMessage(
    recipientIds: string[] | 'all',
    title: string,
    message: string
  ): Promise<void> {
    const data = {
      type: 'admin_message' as const,
      title,
      message,
    };

    if (recipientIds === 'all') {
      const allPartners = await getAllPartnerIdsUseCase();
      await this.repo.createBulkNotifications(allPartners, data);
    } else {
      await this.repo.createBulkNotifications(recipientIds, data);
    }
  }

  async markAsRead(notificationId: string, recipientId: string): Promise<void> {
    if (!notificationId || !recipientId) {
      throw new Error('ID da notificação e do destinatário são obrigatórios');
    }
    await this.repo.markAsRead(notificationId, recipientId);
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    if (!recipientId) {
      throw new Error('ID do destinatário é obrigatório');
    }
    await this.repo.markAllAsRead(recipientId);
  }

  async getSettings(partnerId: string): Promise<Record<string, unknown>> {
    if (!partnerId) {
      throw new Error('ID do parceiro é obrigatório');
    }
    return this.repo.getSettings(partnerId);
  }

  async updateSettings(partnerId: string, settings: NotificationSettingsPatch): Promise<void> {
    if (!partnerId) {
      throw new Error('ID do parceiro é obrigatório');
    }
    await this.repo.updateSettings(partnerId, settings);
  }
}
