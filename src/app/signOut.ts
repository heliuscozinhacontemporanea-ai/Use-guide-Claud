import { logoutUseCase } from '../domain/auth';
import { disablePushOnThisDeviceUseCase } from '../domain/notifications';

/** Sair da conta: antes, este aparelho deixa de receber os avisos dela (D25). */
export async function signOut(): Promise<void> {
  await disablePushOnThisDeviceUseCase().catch(() => undefined);
  await logoutUseCase();
}
