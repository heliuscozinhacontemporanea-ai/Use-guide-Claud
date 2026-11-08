import type { NewNotification, NotificationPreferences } from '../types/notificationTypes';

export interface NotificationRepositoryPort {
  /** Grava o aviso e a entrada do push juntos. Falso quando o `dedupeKey` já existe. */
  create(notification: NewNotification, expiresAt: Date): Promise<boolean>;
  createMany(
    recipientUids: string[],
    data: Omit<NewNotification, 'recipientUid' | 'dedupeKey'>,
    expiresAt: Date
  ): Promise<void>;
  /** Falso quando o aviso não existe ou é de outra pessoa. */
  markAsRead(notificationId: string, recipientUid: string): Promise<boolean>;
  markAllAsRead(recipientUid: string): Promise<void>;
  getPreferences(uid: string): Promise<Partial<NotificationPreferences> | null>;
  savePreferences(uid: string, preferences: NotificationPreferences): Promise<void>;
  deleteAllForUser(uid: string): Promise<void>;
  /** Parceiros que escolheram o resumo no fim do dia. */
  listDailySalesRecipients(): Promise<string[]>;
  /** Avisos de venda e reserva gravados desde `since` (para o resumo do dia). */
  countSalesSince(uid: string, since: Date): Promise<number>;
}
