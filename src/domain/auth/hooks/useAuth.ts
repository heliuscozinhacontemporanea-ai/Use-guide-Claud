import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import {
  loginWithEmailUseCase,
  registerWithEmailUseCase,
  loginWithGoogleUseCase,
  resetPasswordUseCase,
  logoutUseCase,
} from '../factory';
import { startEmailVerificationUseCase } from '../application/usecases/startEmailVerificationUseCase';
import { getCurrentUserUseCase } from '../../user/application/usecases/getCurrentUserUseCase';
import { updateCurrentUserUseCase } from '../../user/application/usecases/updateCurrentUserUseCase';

export function useAuth() {
  const { user, profile, loading: contextLoading, refreshProfile } = useAuthContext();
  const { i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const session = await loginWithEmailUseCase(email, password);
      await refreshProfile();
      return session;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Erro ao realizar login.';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const session = await registerWithEmailUseCase(email, password);
      await updateCurrentUserUseCase({
        firstName,
        lastName,
        phone: phone || '',
      });
      await startEmailVerificationUseCase(i18n.language);
      await refreshProfile();
      return session;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Erro ao cadastrar conta.';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await loginWithGoogleUseCase();
      const existingProfile = await getCurrentUserUseCase();
      if (!existingProfile?.firstName) {
        const rawName = (session.displayName || 'Novo Usuário').trim();
        const nameParts = rawName.split(/\s+/).filter(Boolean);
        const firstName = (nameParts[0] || 'Novo').slice(0, 50);
        const lastName = (nameParts.slice(1).join(' ') || 'Usuário').slice(0, 50);
        await updateCurrentUserUseCase({
          firstName,
          lastName,
          phone: '',
        });
      }
      await refreshProfile();
      return session;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Erro ao autenticar com Google.';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await resetPasswordUseCase(email);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Erro ao enviar e-mail de recuperação.';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutUseCase();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Erro ao encerrar sessão.';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    loading: contextLoading || loading,
    error,
    login,
    signUp,
    loginWithGoogle,
    forgotPassword,
    logout,
    refreshProfile,
  };
}
