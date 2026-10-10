import { FirestoreNotificationAdapter } from './adapters/firestoreNotificationAdapter';
import { NotificationPort } from './ports/notificationPort';

export const notificationAdapter: NotificationPort = new FirestoreNotificationAdapter();
