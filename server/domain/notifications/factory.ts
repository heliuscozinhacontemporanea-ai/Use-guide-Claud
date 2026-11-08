import { FcmPushSenderAdapter } from './adapters/fcmPushSenderAdapter';
import { FirebaseAdminNotificationAdapter } from './adapters/firebaseAdminNotificationAdapter';
import { FirestoreNotificationOutboxAdapter } from './adapters/firestoreNotificationOutboxAdapter';
import { FirestorePushDeviceAdapter } from './adapters/firestorePushDeviceAdapter';
import { NotificationService } from './services/notificationService';
import { PushDispatchService } from './services/pushDispatchService';

const notificationRepository = new FirebaseAdminNotificationAdapter();
export const notificationOutbox = new FirestoreNotificationOutboxAdapter();
export const pushDevices = new FirestorePushDeviceAdapter();

export const notificationService = new NotificationService(notificationRepository);
export const pushDispatchService = new PushDispatchService(
  notificationOutbox,
  pushDevices,
  new FcmPushSenderAdapter(),
  notificationRepository
);
