import { FcmPushTokenAdapter } from './adapters/fcmPushTokenAdapter';
import { FirestoreNotificationAdapter } from './adapters/firestoreNotificationAdapter';
import type { NotificationPort } from './ports/notificationPort';

export const notificationAdapter: NotificationPort = new FirestoreNotificationAdapter();
export const pushTokenAdapter = new FcmPushTokenAdapter();
