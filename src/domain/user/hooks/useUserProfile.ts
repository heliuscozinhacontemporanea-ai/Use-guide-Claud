import { useEffect, useState } from 'react';
import { useAuthContext } from '../../auth/context/AuthContext';
import { deleteCurrentUserUseCase } from '../application/usecases/deleteCurrentUserUseCase';
import { getCurrentUserUseCase } from '../application/usecases/getCurrentUserUseCase';
import { updateCurrentUserUseCase } from '../application/usecases/updateCurrentUserUseCase';
import { updatePasswordUseCase } from '../application/usecases/updatePasswordUseCase';
import { PasswordData, ShowPasswordsData, UserData } from '../types/user';

export function useUserProfile(onAccountDeleted?: () => void) {
  const { user } = useAuthContext();
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
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // `text` é a chave de tradução do aviso; quem mostra traduz.
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
            const created = userDoc.createdAt ? new Date(userDoc.createdAt) : null;
            setMemberSince(
              created && !Number.isNaN(created.getTime()) ? created.toISOString() : null
            );
          }
        } catch (err: unknown) {
          console.error('[useUserProfile] Error fetching user data:', err);
          setError('account.feedback.profileLoadError');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

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
      setMessage({ type: 'success', text: 'account.feedback.profileSaved' });
      return true;
    } catch (error: unknown) {
      console.error('[useUserProfile] Error updating profile:', error);
      // Nunca a mensagem crua do SDK para quem usa o app (AGENTS.md §10.2): só a chave do aviso.
      const msg = 'account.feedback.profileError';
      setError(msg);
      setMessage({ type: 'error', text: msg });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (): Promise<boolean> => {
    if (!user?.email) return false;

    setIsLoading(true);
    setMessage(null);
    setError(null);
    try {
      await updatePasswordUseCase(user.email, passwordData);
      setMessage({ type: 'success', text: 'account.feedback.passwordSaved' });
      return true;
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      console.error('[useUserProfile] Error updating password:', error);
      let text = 'account.feedback.passwordError';
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        text = 'account.feedback.googleCanceled';
      } else if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        text = 'account.feedback.wrongPassword';
      }
      setError(text);
      setMessage({ type: 'error', text });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (password?: string) => {
    if (!user?.email) return;
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
      let text = 'account.feedback.deleteError';
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        text = 'account.feedback.wrongPassword';
      } else if (
        err?.code === 'auth/requires-recent-login' ||
        err?.message === 'REAUTHENTICATION_REQUIRED' ||
        err?.code === 'REAUTHENTICATION_REQUIRED'
      ) {
        text = 'account.feedback.recentLogin';
      } else if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        text = 'account.feedback.googleCanceled';
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
    memberSince,
    passwordData,
    setPasswordData,
    showPasswords,
    setShowPasswords,
    isLoading,
    error,
    showDeleteConfirm,
    setShowDeleteConfirm,
    message,
    setMessage,
    updateProfile,
    updatePassword,
    deleteAccount,
  };
}
