import { notificationOutbox, notificationService, pushDevices } from '../factory';

/** Exclusão de conta (§7.5): avisos, escolhas, aparelhos e o que ainda ia sair por push. */
export async function deleteUserNotificationsUseCase(uid: string): Promise<void> {
  await notificationService.deleteAllForUser(uid);
  await notificationOutbox.deleteAllForUser(uid);
  await pushDevices.deleteAllForUser(uid);
}
