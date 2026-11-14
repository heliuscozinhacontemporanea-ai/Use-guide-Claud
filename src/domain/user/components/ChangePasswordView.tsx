import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Eye, EyeOff } from 'lucide-react';
import { type Dispatch, type SetStateAction, useEffect, useId } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../shared/utils/cn';
import { BUTTON_PRIMARY, INPUT } from '../../../ui/styles/controls';
import { checkPasswordRequirements } from '../../auth';
import { type UpdatePasswordFormData, updatePasswordSchema } from '../schemas/userSchema';
import type { PasswordData, ShowPasswordsData } from '../types/user';

interface ChangePasswordViewProps {
  passwordData: PasswordData;
  setPasswordData: Dispatch<SetStateAction<PasswordData>>;
  showPasswords: ShowPasswordsData;
  setShowPasswords: Dispatch<SetStateAction<ShowPasswordsData>>;
  isLoading: boolean;
  onUpdatePassword: () => void;
}

type Field = keyof PasswordData;

const FIELDS: Array<{ name: Field; labelKey: string; autoComplete: string }> = [
  { name: 'current', labelKey: 'account.password.current', autoComplete: 'current-password' },
  { name: 'new', labelKey: 'account.password.new', autoComplete: 'new-password' },
  { name: 'confirm', labelKey: 'account.password.confirm', autoComplete: 'new-password' },
];

/** Minha conta › Nova senha. O `<` e o título ficam na barra fixa da folha do perfil (D33). */
export function ChangePasswordView({
  passwordData,
  setPasswordData,
  showPasswords,
  setShowPasswords,
  isLoading,
  onUpdatePassword,
}: ChangePasswordViewProps) {
  const { t } = useTranslation();
  const ids = useId();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      current: passwordData.current || '',
      new: passwordData.new || '',
      confirm: passwordData.confirm || '',
    },
  });

  const newPassword = watch('new', passwordData.new || '');
  const checks = checkPasswordRequirements(newPassword);
  const rules = [
    { key: 'upper', ok: checks.hasUppercase },
    { key: 'lower', ok: checks.hasLowercase },
    { key: 'number', ok: checks.hasNumber },
    { key: 'length', ok: checks.hasMinLength && newPassword.length <= 20 },
  ] as const;

  useEffect(() => {
    setValue('current', passwordData.current || '');
    setValue('new', passwordData.new || '');
    setValue('confirm', passwordData.confirm || '');
  }, [passwordData, setValue]);

  const onSubmit = (data: UpdatePasswordFormData) => {
    setPasswordData(data);
    onUpdatePassword();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {FIELDS.map(({ name, labelKey, autoComplete }) => {
        const field = register(name);
        const error = errors[name]?.message;
        const visible = showPasswords[name];
        return (
          <div key={name}>
            <label
              htmlFor={`${ids}-${name}`}
              className="block px-1 mb-1.5 text-meta font-semibold text-ink-muted"
            >
              {t(labelKey)}
            </label>
            <div className="relative">
              <input
                id={`${ids}-${name}`}
                type={visible ? 'text' : 'password'}
                autoComplete={autoComplete}
                required
                aria-invalid={Boolean(error)}
                {...field}
                onChange={(e) => {
                  void field.onChange(e);
                  setPasswordData((prev) => ({ ...prev, [name]: e.target.value }));
                }}
                className={`${INPUT} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => ({ ...prev, [name]: !prev[name] }))}
                aria-label={visible ? t('account.hidePassword') : t('account.showPassword')}
                className="absolute right-0 top-0 w-11 h-11 flex items-center justify-center text-ink-muted rounded-control focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
              >
                {visible ? (
                  <EyeOff size={20} aria-hidden="true" />
                ) : (
                  <Eye size={20} aria-hidden="true" />
                )}
              </button>
            </div>
            {error && <p className="px-1 mt-1 text-caption text-danger">{t(error)}</p>}
          </div>
        );
      })}

      <div className="p-4 rounded-card bg-surface border border-line">
        <p className="mb-2 text-meta font-semibold text-ink">
          {t('account.password.requirements')}
        </p>
        <ul className="flex flex-col gap-1.5">
          {rules.map((rule) => (
            <li
              key={rule.key}
              className={cn(
                'flex items-center gap-1.5 text-meta',
                rule.ok ? 'text-success' : 'text-ink-muted'
              )}
            >
              {rule.ok ? (
                <Check size={16} className="shrink-0" aria-hidden="true" />
              ) : (
                <span aria-hidden="true" className="w-4 flex justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                </span>
              )}
              {t(`account.password.rules.${rule.key}`)}
            </li>
          ))}
        </ul>
      </div>

      <button type="submit" disabled={isLoading} className={`${BUTTON_PRIMARY} w-full min-h-12`}>
        {isLoading ? t('account.password.saving') : t('account.password.submit')}
      </button>
    </form>
  );
}
