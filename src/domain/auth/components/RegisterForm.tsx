import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, RefreshCw, User } from 'lucide-react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PhoneInputField, type PhoneInputFieldRef } from '../../../ui/components/PhoneInputField';
import { TextButton } from '../../../ui/components/TextButton';
import { TermsNotice } from '../../../ui/legal/TermsNotice';
import { BUTTON_PRIMARY } from '../../../ui/styles/controls';
import { type RegisterFormData, registerSchema } from '../schemas/authSchema';
import { AuthErrorMessage } from './AuthErrorMessage';
import { AuthField } from './AuthField';
import { getAuthErrorMessage } from './authErrorMapper';
import { PasswordField } from './PasswordField';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: (email?: string) => void;
  signUp: (
    email: string,
    pass: string,
    firstName: string,
    lastName: string,
    phone: string
  ) => Promise<unknown>;
  apiError: string | null;
  setApiError: (error: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  initialEmail?: string;
  onOpenTerms: () => void;
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
  onOpenTerms,
}: RegisterFormProps) {
  const { t } = useTranslation();
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
  const { errors } = form.formState;

  const onSubmit = async (data: RegisterFormData) => {
    if (phoneRef.current && !phoneRef.current.validate()) return;
    setIsLoading(true);
    setApiError(null);
    try {
      const fullPhone = `${data.countryCode || '+55'} ${data.phone}`;
      await signUp(data.email, data.password, data.firstName, data.lastName, fullPhone);
      onSuccess();
    } catch (err: unknown) {
      const message = getAuthErrorMessage(err);
      if (message) setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <AuthField
          id="register-first-name"
          type="text"
          label={t('auth.firstName')}
          placeholder={t('auth.firstName')}
          icon={User}
          autoComplete="given-name"
          registration={form.register('firstName')}
          error={errors.firstName?.message}
        />
        <AuthField
          id="register-last-name"
          type="text"
          label={t('auth.lastName')}
          placeholder={t('auth.lastName')}
          autoComplete="family-name"
          registration={form.register('lastName')}
          error={errors.lastName?.message}
        />
      </div>

      <div>
        <label htmlFor="register-phone-field" className="sr-only">
          {t('auth.phone')}
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
        {errors.phone?.message && (
          <p id="register-phone-error" role="alert" className="px-1 mt-1 text-caption text-danger">
            {t(errors.phone.message)}
          </p>
        )}
      </div>

      <AuthField
        id="register-email"
        type="email"
        label={t('auth.email')}
        placeholder={t('auth.registerEmailPlaceholder')}
        icon={Mail}
        autoComplete="email"
        registration={form.register('email')}
        error={errors.email?.message}
      />
      <PasswordField
        id="register-password"
        kind="new"
        registration={form.register('password')}
        error={errors.password?.message}
        autoComplete="new-password"
      />
      <PasswordField
        id="register-confirm-password"
        kind="confirm"
        registration={form.register('confirmPassword')}
        error={errors.confirmPassword?.message}
        autoComplete="new-password"
      />

      <AuthErrorMessage message={apiError} />

      <button
        id="register-submit-btn"
        type="submit"
        disabled={isLoading}
        className={`${BUTTON_PRIMARY} w-full min-h-12`}
      >
        {isLoading ? (
          <RefreshCw size={20} className="mx-auto animate-spin" aria-hidden="true" />
        ) : (
          t('auth.register.submit')
        )}
      </button>
      <TermsNotice action="create" onOpenTerms={onOpenTerms} />

      <p className="flex flex-wrap items-center justify-center gap-x-2 text-meta text-ink-muted">
        {t('auth.register.hasAccount')}
        <TextButton tone="accent" onClick={() => onSwitchToLogin(form.getValues('email'))}>
          {t('auth.register.login')}
        </TextButton>
      </p>
    </form>
  );
}
