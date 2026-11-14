import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Lock, RefreshCw } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
import { useUIStore } from '../../../shared/stores/useUIStore';
import { GlassCard } from '../../../ui/components/GlassCard';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../ui/styles/controls';
import { confirmPasswordResetUseCase, verifyPasswordResetCodeUseCase } from '../factory';
import { type ResetPasswordFormData, resetPasswordSchema } from '../schemas/authSchema';
import { AuthErrorMessage } from './AuthErrorMessage';
import { PasswordField } from './PasswordField';
import { PasswordRequirements } from './PasswordRequirements';

const REDIRECT_SECONDS = 5;

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full py-8 px-4 flex items-center justify-center">
      <GlassCard className="w-full max-w-sm p-6 flex flex-col gap-5">{children}</GlassCard>
    </div>
  );
}

/** Redefinir a senha pelo link do e-mail (`?oobCode=`), na página de ações da conta. */
export function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { goTo } = useLocalizedRouting();
  const oobCode = searchParams.get('oobCode');

  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<'form' | 'success' | 'error'>('form');
  // Chave de tradução do problema: do link (tela de erro) ou do salvamento (no formulário).
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onTouched',
  });
  const password = form.watch('password') || '';

  useEffect(() => {
    if (!oobCode) {
      setError('auth.errors.invalidLink');
      setStep('error');
      setIsLoading(false);
      return;
    }
    let active = true;
    verifyPasswordResetCodeUseCase(oobCode)
      .then((userEmail) => active && setEmail(userEmail))
      .catch(() => {
        if (!active) return;
        setError('auth.errors.expiredLink');
        setStep('error');
      })
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [oobCode]);

  const goToLogin = useCallback(() => {
    useUIStore.getState().openLoginModal();
    goTo('explore', '', { replace: true });
  }, [goTo]);

  useEffect(() => {
    if (step !== 'success') return;
    const interval = setInterval(() => setCountdown((left) => Math.max(0, left - 1)), 1000);
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    if (step === 'success' && countdown === 0) goToLogin();
  }, [step, countdown, goToLogin]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!oobCode) {
      setError('auth.errors.missingCode');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await confirmPasswordResetUseCase(oobCode, data.password);
      setStep('success');
    } catch {
      setError('auth.errors.saveFailed');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full py-8 flex items-center justify-center" role="status">
        <RefreshCw className="text-accent animate-spin" size={32} aria-hidden="true" />
        <span className="sr-only">{t('auth.reset.title')}</span>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <Card>
        <AlertCircle size={28} className="mx-auto text-danger" aria-hidden="true" />
        <div className="text-center space-y-2">
          <h1 className="text-heading font-display font-bold text-ink">
            {t('auth.reset.errorTitle')}
          </h1>
          {error && <p className="text-body text-ink-muted">{t(error)}</p>}
        </div>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              useUIStore.getState().openPasswordRecovery();
              goTo('explore');
            }}
            className={`${BUTTON_PRIMARY} w-full min-h-12`}
          >
            {t('auth.reset.requestNew')}
          </button>
          <button
            type="button"
            onClick={() => goTo('explore')}
            className={`${BUTTON_SECONDARY} w-full min-h-12`}
          >
            {t('auth.reset.backHome')}
          </button>
        </div>
      </Card>
    );
  }

  if (step === 'success') {
    return (
      <Card>
        <CheckCircle2 size={28} className="mx-auto text-success" aria-hidden="true" />
        <div className="text-center space-y-2" role="status">
          <h1 className="text-heading font-display font-bold text-ink">
            {t('auth.reset.successTitle')}
          </h1>
          <p className="text-body text-ink-muted">{t('auth.reset.successText')}</p>
          <p className="text-meta text-ink-muted tabular-nums">
            {t('auth.reset.redirect', { count: countdown })}
          </p>
        </div>
        <button type="button" onClick={goToLogin} className={`${BUTTON_PRIMARY} w-full min-h-12`}>
          {t('auth.reset.loginNow')}
        </button>
      </Card>
    );
  }

  return (
    <Card>
      <div className="text-center space-y-2">
        <Lock size={24} className="mx-auto text-accent" aria-hidden="true" />
        <h1 className="text-heading font-display font-bold text-ink">{t('auth.reset.title')}</h1>
        {email && <p className="text-meta text-ink-muted break-all">{email}</p>}
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <PasswordField
          id="reset-new-password"
          kind="new"
          registration={form.register('password')}
          error={form.formState.errors.password?.message}
          autoComplete="new-password"
        />
        <PasswordField
          id="reset-confirm-password"
          kind="confirm"
          registration={form.register('confirmPassword')}
          error={form.formState.errors.confirmPassword?.message}
          autoComplete="new-password"
        />
        <PasswordRequirements password={password} />
        <AuthErrorMessage message={error} />
        <button type="submit" disabled={isSaving} className={`${BUTTON_PRIMARY} w-full min-h-12`}>
          {isSaving ? (
            <RefreshCw size={20} className="mx-auto animate-spin" aria-hidden="true" />
          ) : (
            t('auth.reset.save')
          )}
        </button>
      </form>
    </Card>
  );
}
