import { FirebaseAdminNotificationAdapter } from './adapters/firebaseAdminNotificationAdapter';
import { NotificationService } from './services/notificationService';

export const notificationService = new NotificationService(new FirebaseAdminNotificationAdapter());
