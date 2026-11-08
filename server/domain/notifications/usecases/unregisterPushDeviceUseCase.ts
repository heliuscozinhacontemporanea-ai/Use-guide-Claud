import { pushDevices } from '../factory';

/** Ao sair da conta neste aparelho, ele para de receber (termos de privacidade, D25). */
export function unregisterPushDeviceUseCase(uid: string, token: string): Promise<void> {
  return pushDevices.unregister(uid, token);
}
