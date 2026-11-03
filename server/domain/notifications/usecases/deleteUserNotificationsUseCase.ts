import { notificationService } from '../factory';

/** Exclusão de conta (§7.5): apaga os avisos e as escolhas da pessoa. */
export function deleteUserNotificationsUseCase(uid: string): Promise<void> {
  return notificationService.deleteAllForUser(uid);
}
