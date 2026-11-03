import { notificationAdapter, pushTokenAdapter } from '../../factory';

/** Ao sair da conta: este aparelho para de receber avisos dela (privacidade, D25). */
export async function disablePushOnThisDeviceUseCase(): Promise<void> {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  const token = await pushTokenAdapter.getToken();
  if (!token) return;
  await notificationAdapter.unregisterDevice(token);
  await pushTokenAdapter.deleteToken();
}
