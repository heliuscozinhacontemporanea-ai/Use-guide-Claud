import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextButton } from '../../../ui/components/TextButton';
import { TermsNotice } from '../../../ui/legal/TermsNotice';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../ui/styles/controls';
import { type LoginFormData, loginSchema } from '../schemas/authSchema';
import { AuthErrorMessage } from './AuthErrorMessage';
import { AuthField } from './AuthField';
import { getAuthErrorMessage } from './authErrorMapper';
import { PasswordField } from './PasswordField';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: (email?: string) => void;
  onSwitchToForgotPassword: (email?: string) => void;
  login: (email: string, pass: string) => Promise<unknown>;
  loginWithGoogle: () => Promise<unknown>;
  apiError: string | null;
  setApiError: (error: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onOpenTerms: () => void;
}

export function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onSwitchToForgotPassword,
  login,
  loginWithGoogle,
  apiError,
  setApiError,
  isLoading,
  setIsLoading,
  onOpenTerms,
}: LoginFormProps) {
  const { t } = useTranslation();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });
  const { errors } = form.formState;

  // E-mail sem cadastro aparece como "e-mail ou senha incorretos": não revela se a conta existe.
  const showError = (err: unknown) => {
    const message = getAuthErrorMessage(err);
    if (message === '') setApiError('auth.errors.wrongCredentials');
    else if (message) setApiError(message);
  };

  const run = async (action: () => Promise<unknown>) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await action();
      onSuccess();
    } catch (err: unknown) {
      showError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit((data) => run(() => login(data.email, data.password)))}
      className="flex flex-col gap-4"
      noValidate
    >
      <AuthField
        id="login-email"
        type="email"
        label={t('auth.email')}
        placeholder={t('auth.loginEmailPlaceholder')}
        icon={Mail}
        autoComplete="email"
        registration={form.register('email')}
        error={errors.email?.message}
      />
      <PasswordField
        id="login-password"
        registration={form.register('password')}
        error={errors.password?.message}
        autoComplete="current-password"
      />
      <div className="flex justify-end">
        <TextButton tone="accent" onClick={() => onSwitchToForgotPassword(form.getValues('email'))}>
          {t('auth.login.forgot')}
        </TextButton>
      </div>

      <AuthErrorMessage message={apiError} />

      <button type="submit" disabled={isLoading} className={`${BUTTON_PRIMARY} w-full min-h-12`}>
        {isLoading ? (
          <RefreshCw size={20} className="mx-auto animate-spin" aria-hidden="true" />
        ) : (
          t('auth.login.submit')
        )}
      </button>

      <div className="relative flex items-center justify-center">
        <div aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t border-line" />
        <span className="relative px-3 bg-sheet text-caption font-semibold uppercase tracking-wide text-ink-muted">
          {t('auth.login.orUse')}
        </span>
      </div>

      <button
        type="button"
        onClick={() => run(loginWithGoogle)}
        disabled={isLoading}
        className={`${BUTTON_SECONDARY} w-full min-h-12 inline-flex items-center justify-center gap-3`}
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          className="size-5"
          alt={t('auth.login.googleLogo')}
          loading="lazy"
        />
        {t('auth.login.google')}
      </button>
      <TermsNotice action="continue" onOpenTerms={onOpenTerms} />

      <p className="flex flex-wrap items-center justify-center gap-x-2 text-meta text-ink-muted">
        {t('auth.login.noAccount')}
        <TextButton tone="accent" onClick={() => onSwitchToRegister(form.getValues('email'))}>
          {t('auth.login.signUp')}
        </TextButton>
      </p>
    </form>
  );
}
