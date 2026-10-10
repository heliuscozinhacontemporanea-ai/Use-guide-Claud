import React, { useState } from 'react';
import { Mail, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../schemas/authSchema';
import { AuthErrorMessage } from './AuthErrorMessage';
import { getAuthErrorMessage } from './authErrorMapper';
import { cn } from '../../../shared/utils/cn';

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
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: initialEmail || '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      await forgotPassword(data.email);
      setResetEmailSent(true);
    } catch (err: unknown) {
      const code = (err as any)?.code;
      if (code === 'auth/user-not-found') {
        setResetEmailSent(true);
        return;
      }
      const mapped = getAuthErrorMessage(err);
      if (mapped === '') {
        setResetEmailSent(true);
        return;
      }
      const message = mapped || 'Não foi possível enviar o e-mail de recuperação. Tente novamente.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!resetEmailSent ? (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1">
            <label htmlFor="forgot-email" className="sr-only">
              E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Mail size={16} className="text-white/50" />
              </div>
              <input
                id="forgot-email"
                type="email"
                placeholder="Seu e-mail cadastrado"
                {...form.register('email')}
                maxLength={100}
                aria-invalid={!!form.formState.errors.email}
                aria-describedby={form.formState.errors.email ? 'forgot-email-error' : undefined}
                className={cn(
                  'w-full h-12 pl-12 pr-4 bg-white/5 border rounded-2xl text-base font-medium focus:outline-none transition-colors text-white',
                  form.formState.errors.email
                    ? 'border-rose-500/80 focus:border-rose-500'
                    : 'border-white/10 focus:border-teal-500/50'
                )}
              />
            </div>
            {form.formState.errors.email && (
              <p
                id="forgot-email-error"
                role="alert"
                className="text-[11px] text-rose-400 font-medium ml-1"
              >
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <AuthErrorMessage message={apiError} />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 min-h-[44px] glassmorphism-vibrant bg-teal-500/20 border-teal-500/30 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 group active:scale-95 transition-transform disabled:opacity-50 text-white"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Enviar Link</span>
                <ChevronRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform text-teal-400"
                />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto text-teal-400">
            <Mail size={32} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-white">Instruções enviadas!</p>
            <p className="text-xs text-white/60 leading-relaxed px-2">
              Se este e-mail estiver cadastrado em nosso sistema, você receberá um link com as
              instruções para redefinir sua senha. Verifique sua caixa de entrada e spam.
            </p>
          </div>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="w-full h-12 min-h-[44px] glassmorphism rounded-2xl font-bold uppercase tracking-widest text-xs text-white/70 hover:text-white transition-all flex items-center justify-center"
          >
            Voltar para o Login
          </button>
        </div>
      )}
    </div>
  );
}
