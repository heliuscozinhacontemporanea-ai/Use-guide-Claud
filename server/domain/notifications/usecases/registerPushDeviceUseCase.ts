import { pushDevices } from '../factory';
import { toLocale } from '../utils/renderNotificationText';

/** Liga o push neste aparelho; o idioma vale para os textos que ele recebe (§12.5). */
export function registerPushDeviceUseCase(
  uid: string,
  token: string,
  locale: string
): Promise<void> {
  return pushDevices.register(uid, token, toLocale(locale));
}
