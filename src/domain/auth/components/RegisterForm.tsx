import React, { useRef } from 'react';
import { Mail, ChevronRight, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '../schemas/authSchema';
import { PhoneInputField, PhoneInputFieldRef } from '../../../ui/components/PhoneInputField';
import { PasswordField } from './PasswordField';
import { AuthErrorMessage } from './AuthErrorMessage';
import { getAuthErrorMessage } from './authErrorMapper';
import { cn } from '../../../shared/utils/cn';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: (email?: string) => void;
  signUp: (
    email: string,
    pass: string,
    firstName: string,
    lastName: string,
    phone: string
  ) => Promise<any>;
  apiError: string | null;
  setApiError: (error: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  initialEmail?: string;
}

export function RegisterForm({
  onSuccess,
  onSwitchToLogin,
  signUp,
  apiError,
  setApiError,
  isLoading,
  setIsLoading,
  initialEmail,
}: RegisterFormProps) {
  const phoneRef = useRef<PhoneInputFieldRef>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: initialEmail || '',
      countryCode: '+55',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (phoneRef.current && !phoneRef.current.validate()) {
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const fullPhone = `${data.countryCode || '+55'} ${data.phone}`;
      await signUp(data.email, data.password, data.firstName, data.lastName, fullPhone);
      onSuccess();
    } catch (err: any) {
      const message = getAuthErrorMessage(err);
      if (message) {
        setApiError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-8" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="register-first-name" className="sr-only">
              Nome
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <User size={14} className="text-white/50" />
              </div>
              <input
                id="register-first-name"
                type="text"
                placeholder="Nome"
                {...form.register('firstName')}
                maxLength={100}
                aria-invalid={!!form.formState.errors.firstName}
                aria-describedby={
                  form.formState.errors.firstName ? 'register-first-name-error' : undefined
                }
                className={cn(
                  'w-full h-12 pl-9 pr-3 bg-white/5 border rounded-2xl text-base font-medium focus:outline-none transition-colors text-white',
                  form.formState.errors.firstName
                    ? 'border-rose-500/80 focus:border-rose-500'
                    : 'border-white/10 focus:border-teal-500/50'
                )}
              />
            </div>
            {form.formState.errors.firstName && (
              <p
                id="register-first-name-error"
                role="alert"
                className="text-[11px] text-rose-400 font-medium ml-1"
              >
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="register-last-name" className="sr-only">
              Sobrenome
            </label>
            <div className="relative">
              <input
                id="register-last-name"
                type="text"
                placeholder="Sobrenome"
                {...form.register('lastName')}
                maxLength={100}
                aria-invalid={!!form.formState.errors.lastName}
                aria-describedby={
                  form.formState.errors.lastName ? 'register-last-name-error' : undefined
                }
                className={cn(
                  'w-full h-12 px-4 bg-white/5 border rounded-2xl text-base font-medium focus:outline-none transition-colors text-white',
                  form.formState.errors.lastName
                    ? 'border-rose-500/80 focus:border-rose-500'
                    : 'border-white/10 focus:border-teal-500/50'
                )}
              />
            </div>
            {form.formState.errors.lastName && (
              <p
                id="register-last-name-error"
                role="alert"
                className="text-[11px] text-rose-400 font-medium ml-1"
              >
                {form.formState.errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="register-phone-field" className="sr-only">
            Telefone / WhatsApp
          </label>
          <PhoneInputField
            ref={phoneRef}
            id="register-phone-field"
            phone={form.watch('phone')}
            ddi={form.watch('countryCode') || '+55'}
            onPhoneChange={(val) => form.setValue('phone', val, { shouldValidate: true })}
            onDdiChange={(val) => form.setValue('countryCode', val, { shouldValidate: true })}
            required
          />
          {form.formState.errors.phone && (
            <p
              id="register-phone-error"
              role="alert"
              className="text-[11px] text-rose-400 font-medium ml-1"
            >
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="register-email" className="sr-only">
            E-mail
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Mail size={16} className="text-white/50" />
            </div>
            <input
              id="register-email"
              type="email"
              placeholder="Seu e-mail"
              {...form.register('email')}
              maxLength={100}
              aria-invalid={!!form.formState.errors.email}
              aria-describedby={form.formState.errors.email ? 'register-email-error' : undefined}
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
              id="register-email-error"
              role="alert"
              className="text-[11px] text-rose-400 font-medium ml-1"
            >
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <PasswordField
          id="register-password"
          label="Senha"
          placeholder="Sua senha"
          registration={form.register('password')}
          error={form.formState.errors.password?.message}
          autoComplete="new-password"
        />

        <PasswordField
          id="register-confirm-password"
          label="Confirmar Senha"
          placeholder="Confirmar senha"
          registration={form.register('confirmPassword')}
          error={form.formState.errors.confirmPassword?.message}
          autoComplete="new-password"
        />

        <AuthErrorMessage message={apiError} />

        <button
          id="register-submit-btn"
          type="submit"
          disabled={isLoading}
          className="w-full h-12 min-h-[44px] glassmorphism-vibrant bg-teal-500/20 border-teal-500/30 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 group active:scale-95 transition-transform disabled:opacity-50 text-white"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Cadastrar</span>
              <ChevronRight
                size={14}
                className="group-hover:translate-x-1 transition-transform text-teal-400"
              />
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-center pb-2 flex items-center justify-center gap-1 text-xs text-white/60">
        <span>Já tem conta?</span>
        <button
          type="button"
          onClick={() => onSwitchToLogin(form.getValues('email'))}
          className="min-h-[44px] inline-flex items-center px-1 text-teal-400 font-bold hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded"
        >
          Entrar
        </button>
      </div>
    </>
  );
}
