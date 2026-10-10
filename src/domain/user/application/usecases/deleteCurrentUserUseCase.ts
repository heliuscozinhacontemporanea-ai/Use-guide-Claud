import { userAdapter } from '../../factory';
import { reauthenticateUseCase, getIdTokenUseCase, logoutUseCase } from '../../../auth';

export async function deleteCurrentUserUseCase(email?: string, password?: string): Promise<void> {
  if (email && password) {
    await reauthenticateUseCase(email, password);
    await getIdTokenUseCase(true);
  }

  try {
    await userAdapter.deleteCurrentUser();
  } catch (error: any) {
    if (
      error?.message === 'REAUTHENTICATION_REQUIRED' ||
      error?.code === 'REAUTHENTICATION_REQUIRED'
    ) {
      if (email && password) {
        await reauthenticateUseCase(email, password);
        await getIdTokenUseCase(true);
        await userAdapter.deleteCurrentUser();
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }

  await logoutUseCase().catch(() => {});
}
