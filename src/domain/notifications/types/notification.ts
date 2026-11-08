export interface TimestampLike {
  seconds?: number;
  nanoseconds?: number;
  toDate?: () => Date;
}

export type NotificationDate = string | number | Date | TimestampLike | null;

/** Para onde o toque leva (definido pelo servidor). */
export interface NotificationLink {
  screen:
    | 'tickets'
    | 'bookings'
    | 'purchases'
    | 'reviews'
    | 'account'
    | 'partner'
    | 'item'
    | 'event';
  id?: string;
}

/** Aviso como está no Firestore (D25): tipo + dados, sem texto pronto. */
export interface StoredNotification {
  id: string;
  recipientUid: string;
  type: string;
  params?: Record<string, string | number>;
  link?: NotificationLink | null;
  read: boolean;
  createdAt: NotificationDate;
}

export interface SendAdminNotificationPayload {
  recipientIds: string[] | 'all';
  title: string;
  message: string;
}
