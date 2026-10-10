import React from 'react';
import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../schemas/authSchema';
import { PasswordField } from './PasswordField';
import { AuthErrorMessage } from './AuthErrorMessage';
import { getAuthErrorMessage } from './authErrorMapper';
import { cn } from '../../../shared/utils/cn';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: (email?: string) => void;
  onSwitchToForgotPassword: (email?: string) => void;
  login: (email: string, pass: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  apiError: string | null;
  setApiError: (error: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
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
}: LoginFormProps) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const handleAuthError = (err: any) => {
    if (err?.code === 'auth/user-not-found') {
      setApiError('E-mail ou senha incorretos.');
      return;
    }
    const message = getAuthErrorMessage(err);
    if (message) {
      setApiError(message);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      await login(data.email, data.password);
      onSuccess();
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      await loginWithGoogle();
      onSuccess();
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-8" noValidate>
      <div className="space-y-1">
        <label htmlFor="login-email" className="sr-only">
          E-mail
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Mail size={16} className="text-white/50" />
          </div>
          <input
            id="login-email"
            type="email"
            placeholder="Seu e-mail cadastrado"
            {...form.register('email')}
            maxLength={100}
            aria-invalid={!!form.formState.errors.email}
            aria-describedby={form.formState.errors.email ? 'login-email-error' : undefined}
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
            id="login-email-error"
            role="alert"
            className="text-[11px] text-rose-400 font-medium ml-1"
          >
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <PasswordField
        id="login-password"
        placeholder="Sua senha"
        registration={form.register('password')}
        error={form.formState.errors.password?.message}
        autoComplete="current-password"
      />

      <div className="flex justify-end pr-1">
        <button
          type="button"
          onClick={() => onSwitchToForgotPassword(form.getValues('email'))}
          className="min-h-[44px] flex items-center px-1 text-xs text-teal-400/90 hover:text-teal-300 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded"
        >
          Esqueceu a senha?
        </button>
      </div>

      <AuthErrorMessage message={apiError} />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 min-h-[44px] glassmorphism-vibrant bg-teal-500/20 border-teal-500/30 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center group active:scale-95 transition-transform disabled:opacity-50 text-white"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <span>Login</span>
        )}
      </button>

      <div className="relative my-4 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <span className="relative px-3 bg-zinc-850 text-[10px] font-bold uppercase tracking-widest text-white/50">
          OU USE
        </span>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full h-12 min-h-[44px] bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform hover:bg-white/10 disabled:opacity-50 group text-white"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          className="w-5 h-5"
          alt="Google"
          loading="lazy"
        />
        <span className="text-xs font-bold text-white/70">Continuar com Google</span>
      </button>

      <p className="text-center text-xs text-white/60 mt-4 flex items-center justify-center gap-1">
        <span>Ainda não tem conta?</span>
        <button
          type="button"
          onClick={() => onSwitchToRegister(form.getValues('email'))}
          className="min-h-[44px] inline-flex items-center px-1 text-teal-400 font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded"
        >
          Cadastre-se
        </button>
      </p>
    </form>
  );
}
