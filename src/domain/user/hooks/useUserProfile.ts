import { useEffect, useState } from 'react';
import { useAuthContext } from '../../auth/context/AuthContext';
import { UserRole } from '../../auth/types/auth';
import { deleteCurrentUserUseCase } from '../application/usecases/deleteCurrentUserUseCase';
import { getCurrentUserUseCase } from '../application/usecases/getCurrentUserUseCase';
import { updateCurrentUserUseCase } from '../application/usecases/updateCurrentUserUseCase';
import { updatePasswordUseCase } from '../application/usecases/updatePasswordUseCase';
import { PasswordData, ShowPasswordsData, UserData } from '../types/user';

export function useUserProfile(onAccountDeleted?: () => void) {
  const { user } = useAuthContext();
  const [isPartner, setIsPartner] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState<ShowPasswordsData>({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const userDoc = await getCurrentUserUseCase();
          if (userDoc) {
            setUserData({
              firstName: userDoc.firstName || '',
              lastName: userDoc.lastName || '',
              phone: userDoc.phone || '',
            });
            setIsPartner(userDoc.role === UserRole.PARTNER);
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Não foi possível carregar o perfil.';
          console.error('[useUserProfile] Error fetching user data:', err);
          setError(errMsg);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
      setIsPartner(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const updateProfile = async (): Promise<boolean> => {
    if (!user) return false;
    setIsLoading(true);
    setMessage(null);
    setError(null);
    try {
      await updateCurrentUserUseCase(userData);
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      return true;
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      console.error('[useUserProfile] Error updating profile:', error);
      const msg = err?.message || 'Erro ao atualizar perfil.';
      setError(msg);
      setMessage({ type: 'error', text: msg });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (): Promise<boolean> => {
    if (!user || !user.email) return false;

    setIsLoading(true);
    setMessage(null);
    setError(null);
    try {
      await updatePasswordUseCase(user.email, passwordData);
      setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
      return true;
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      console.error('[useUserProfile] Error updating password:', error);
      let text = err?.message || 'Erro ao atualizar senha. Siga os requisitos mínimos.';
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        text = 'Senha atual incorreta.';
      }
      setError(text);
      setMessage({ type: 'error', text });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (password: string) => {
    if (!user || !user.email) return;
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      await deleteCurrentUserUseCase(user.email, password);
      if (onAccountDeleted) {
        onAccountDeleted();
      }
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      console.error('[useUserProfile] Error deleting account:', error);
      let text = 'Erro ao excluir conta. Verifique sua conexão.';
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        text = 'Senha incorreta. Verifique e tente novamente.';
      } else if (
        err?.code === 'auth/requires-recent-login' ||
        err?.message === 'REAUTHENTICATION_REQUIRED' ||
        err?.code === 'REAUTHENTICATION_REQUIRED'
      ) {
        text =
          'Para sua segurança, confirme suas credenciais recentemente antes de excluir sua conta.';
      } else if (err?.message) {
        text = err.message;
      }
      setError(text);
      setMessage({ type: 'error', text });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    userData,
    setUserData,
    passwordData,
    setPasswordData,
    showPasswords,
    setShowPasswords,
    isLoading,
    error,
    isPartner,
    isAdmin,
    showDeleteConfirm,
    setShowDeleteConfirm,
    message,
    setMessage,
    updateProfile,
    updatePassword,
    deleteAccount,
  };
}
