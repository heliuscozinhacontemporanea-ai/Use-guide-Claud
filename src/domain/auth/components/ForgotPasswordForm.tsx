import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextButton } from '../../../ui/components/TextButton';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../ui/styles/controls';
import { type ForgotPasswordFormData, forgotPasswordSchema } from '../schemas/authSchema';
import { AuthErrorMessage } from './AuthErrorMessage';
import { AuthField } from './AuthField';
import { getAuthErrorMessage } from './authErrorMapper';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
  forgotPassword: (email: string) => Promise<void>;
  apiError: string | null;
  setApiError: (error: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  initialEmail?: string;
}

export function ForgotPasswordForm({
  onSwitchToLogin,
  forgotPassword,
  apiError,
  setApiError,
  isLoading,
  setIsLoading,
  initialEmail,
}: ForgotPasswordFormProps) {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: initialEmail || '' },
    mode: 'onTouched',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await forgotPassword(data.email);
      setSent(true);
    } catch (err: unknown) {
      const message = getAuthErrorMessage(err);
      // E-mail sem cadastro recebe a mesma resposta: não revela quem tem conta.
      if (message === '') setSent(true);
      else setApiError(message === 'auth.errors.generic' ? 'auth.errors.recoveryFailed' : message);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="size-16 rounded-full bg-accent-soft text-accent flex items-center justify-center">
          <Mail size={28} aria-hidden="true" />
        </span>
        <div className="space-y-2" role="status">
          <p className="text-title text-ink">{t('auth.forgot.sentTitle')}</p>
          <p className="text-body text-ink-muted">{t('auth.forgot.sentText')}</p>
        </div>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className={`${BUTTON_SECONDARY} w-full min-h-12`}
        >
          {t('auth.forgot.backToLogin')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <AuthField
        id="forgot-email"
        type="email"
        label={t('auth.email')}
        placeholder={t('auth.loginEmailPlaceholder')}
        icon={Mail}
        autoComplete="email"
        registration={form.register('email')}
        error={form.formState.errors.email?.message}
      />
      <AuthErrorMessage message={apiError} />
      <button type="submit" disabled={isLoading} className={`${BUTTON_PRIMARY} w-full min-h-12`}>
        {isLoading ? (
          <RefreshCw size={20} className="mx-auto animate-spin" aria-hidden="true" />
        ) : (
          t('auth.forgot.submit')
        )}
      </button>
      <div className="flex justify-center">
        <TextButton tone="accent" onClick={onSwitchToLogin}>
          {t('auth.forgot.back')}
        </TextButton>
      </div>
    </form>
  );
}
