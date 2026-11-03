import { createNotificationUseCase } from '../../../domain/notifications';
import { claimUsernameUseCase } from '../../../domain/users';

/** Troca do @ avisa a própria conta (segurança, D25); a primeira escolha não gera aviso. */
export async function claimUsernameApplicationUseCase(uid: string, username: string): Promise<string> {
  const result = await claimUsernameUseCase(uid, username);
  if (result.previous && result.previous !== result.username) {
    await createNotificationUseCase({
      recipientUid: uid,
      type: 'account_username_changed',
      params: { username: result.username },
      link: { screen: 'account' },
    }).catch(() => undefined);
  }
  return result.username;
}
