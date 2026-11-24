import { useTranslation } from 'react-i18next';
import {
  type AccountEntryActions,
  loginWithEmailUseCase,
  loginWithGoogleUseCase,
  registerWithEmailUseCase,
  resetPasswordUseCase,
  startEmailVerificationUseCase,
} from '../../auth';
import { getCurrentUserUseCase } from '../application/usecases/getCurrentUserUseCase';
import { updateCurrentUserUseCase } from '../application/usecases/updateCurrentUserUseCase';
import { useAccount } from '../context/AccountContext';
import { nameFromProvider } from '../utils/providerName';

/**
 * Entrar e criar conta com o perfil junto (B77): o `auth` cria a sessão; aqui a conta nova ganha nome,
 * telefone e o aceite dos Termos, que a pessoa viu abaixo do botão (D35 1b).
 */
export function useAccountEntry(): AccountEntryActions {
  const { t, i18n } = useTranslation();
  const { refreshProfile } = useAccount();

  const login = async (email: string, password: string) => {
    const session = await loginWithEmailUseCase(email, password);
    await refreshProfile();
    return session;
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) => {
    const session = await registerWithEmailUseCase(email, password);
    await updateCurrentUserUseCase({ firstName, lastName, phone, acceptedUseTerms: true });
    await startEmailVerificationUseCase(i18n.language);
    await refreshProfile();
    return session;
  };

  const loginWithGoogle = async () => {
    const session = await loginWithGoogleUseCase();
    const existing = await getCurrentUserUseCase();
    if (!existing?.firstName) {
      const name = nameFromProvider(session.displayName, {
        first: t('profile.defaultName.first'),
        last: t('profile.defaultName.last'),
      });
      await updateCurrentUserUseCase({ ...name, phone: '', acceptedUseTerms: true });
    }
    await refreshProfile();
    return session;
  };

  return { login, signUp, loginWithGoogle, forgotPassword: resetPasswordUseCase };
}
