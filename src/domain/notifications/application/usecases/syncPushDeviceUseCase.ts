import { notificationAdapter, pushTokenAdapter } from '../../factory';

/**
 * Com a permissão já dada, registra (ou atualiza) este aparelho para a conta logada. Chamado ao
 * ativar e a cada login: o FCM pode trocar o token. Falso quando o push não está disponível aqui.
 */
export async function syncPushDeviceUseCase(locale: string): Promise<boolean> {
  const token = await pushTokenAdapter.getToken();
  if (!token) return false;
  await notificationAdapter.registerDevice(token, locale);
  return true;
}
