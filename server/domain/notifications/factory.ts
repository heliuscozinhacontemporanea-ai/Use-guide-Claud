import { FirebaseAdminNotificationAdapter } from './adapters/firebaseAdminNotificationAdapter';
import { NotificationService } from './services/notificationService';

const notificationRepository = new FirebaseAdminNotificationAdapter();
export const notificationService = new NotificationService(notificationRepository);
