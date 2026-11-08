import { NotificationDomainError } from '../errors/notificationErrors';
import type { NotificationRepositoryPort } from '../ports/notificationRepositoryPort';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NewNotification,
  NOTIFICATION_RETENTION_DAYS,
  NOTIFICATION_TYPES,
  type NotificationPreferences,
} from '../types/notificationTypes';

const DAY_MS = 24 * 60 * 60 * 1000;

export class NotificationService {
  constructor(
    private readonly repo: NotificationRepositoryPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  private expiresAt(): Date {
    return new Date(this.now().getTime() + NOTIFICATION_RETENTION_DAYS * DAY_MS);
  }

  async create(notification: NewNotification): Promise<boolean> {
    if (!notification.recipientUid || !(notification.type in NOTIFICATION_TYPES)) {
      throw new NotificationDomainError('VALIDATION_ERROR', 'Aviso inválido.');
    }
    return this.repo.create(notification, this.expiresAt());
  }

  /** Mensagem escrita pelo admin: vai como está, sem tradução. */
  async sendAdminMessage(recipientUids: string[], title: string, message: string): Promise<void> {
    const unique = [...new Set(recipientUids.filter(Boolean))];
    if (unique.length === 0) return;
    await this.repo.createMany(
      unique,
      { type: 'admin_message', params: { title, message } },
      this.expiresAt()
    );
  }

  async markAsRead(notificationId: string, recipientUid: string): Promise<void> {
    const updated = await this.repo.markAsRead(notificationId, recipientUid);
    if (!updated) {
      throw new NotificationDomainError('NOTIFICATION_NOT_FOUND', 'Notificação não encontrada.');
    }
  }

  markAllAsRead(recipientUid: string): Promise<void> {
    return this.repo.markAllAsRead(recipientUid);
  }

  async getPreferences(uid: string): Promise<NotificationPreferences> {
    const saved = await this.repo.getPreferences(uid);
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...(saved ?? {}) };
  }

  async updatePreferences(
    uid: string,
    patch: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const next = { ...(await this.getPreferences(uid)), ...patch };
    await this.repo.savePreferences(uid, next);
    return next;
  }

  deleteAllForUser(uid: string): Promise<void> {
    return this.repo.deleteAllForUser(uid);
  }
}
