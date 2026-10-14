import { userAdapter } from '../../factory';
import {
  getIdTokenUseCase,
  hasPasswordSignInUseCase,
  logoutUseCase,
  reauthenticateUseCase,
  reauthenticateWithGoogleUseCase,
} from '../../../auth';

/** Excluir a conta exige login recente: senha para conta de e-mail, popup do Google para as demais. */
async function confirmIdentity(email: string | undefined, password: string | undefined) {
  if (hasPasswordSignInUseCase()) {
    if (!email || !password) {
      throw new Error('REAUTHENTICATION_REQUIRED');
    }
    await reauthenticateUseCase(email, password);
  } else {
    await reauthenticateWithGoogleUseCase();
  }
  await getIdTokenUseCase(true);
}

export async function deleteCurrentUserUseCase(email?: string, password?: string): Promise<void> {
  await confirmIdentity(email, password);
  await userAdapter.deleteCurrentUser();
  await logoutUseCase().catch(() => {});
}
