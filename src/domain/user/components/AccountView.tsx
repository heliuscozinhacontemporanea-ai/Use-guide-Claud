import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ChevronRight, Eye, EyeOff, Lock } from 'lucide-react';
import { type Dispatch, type SetStateAction, useEffect, useId, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PhoneInputField, type PhoneInputFieldRef } from '../../../ui/components/PhoneInputField';
import { TextButton } from '../../../ui/components/TextButton';
import { BUTTON_DANGER, BUTTON_PRIMARY, INPUT } from '../../../ui/styles/controls';
import type { UserSession } from '../../auth/types/auth';
import { type UpdateProfileFormData, updateProfileSchema } from '../schemas/userSchema';

type ProfileData = { firstName: string; lastName: string; phone: string };

interface AccountViewProps {
  user: UserSession | null;
  userData: ProfileData;
  setUserData: Dispatch<SetStateAction<ProfileData>>;
  isLoading: boolean;
  isPartner: boolean;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  onUpdateProfile: () => void;
  onChangePassword: () => void;
  onDeleteAccount: (password?: string) => void;
  /** Conta com login por senha; quem entra só com Google confirma pelo popup do Google. */
  hasPassword: boolean;
}

const LABEL = 'block px-1 mb-1.5 text-meta font-semibold text-ink-muted';
const FIELD_ERROR = 'px-1 mt-1 text-caption text-danger';

/** Divide o telefone salvo ("+55 85 99999-9999") em DDI e número para o campo. */
function splitPhone(phone: string): { ddi: string; number: string } {
  if (!phone) return { ddi: '+55', number: '' };
  if (!phone.startsWith('+')) return { ddi: '+55', number: phone };
  const [ddi = '+55', ...rest] = phone.split(' ');
  return { ddi, number: rest.join(' ') };
}

/** Menu › Minha conta. O `<` e o título ficam na barra fixa da folha do perfil (D33). */
export function AccountView({
  user,
  userData,
  setUserData,
  isLoading,
  isPartner,
  showDeleteConfirm,
  setShowDeleteConfirm,
  onUpdateProfile,
  onChangePassword,
  onDeleteAccount,
  hasPassword,
}: AccountViewProps) {
  const { t } = useTranslation();
  const ids = useId();
  const [deletePassword, setDeletePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ddi, setDdi] = useState('+55');
  const [phoneOnly, setPhoneOnly] = useState('');
  const phoneRef = useRef<PhoneInputFieldRef>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: userData,
  });

  useEffect(() => {
    setValue('firstName', userData.firstName);
    setValue('lastName', userData.lastName);
    setValue('phone', userData.phone);
    const parts = splitPhone(userData.phone);
    setDdi(parts.ddi);
    setPhoneOnly(parts.number);
  }, [userData, setValue]);

  const changePhone = (nextDdi: string, nextNumber: string) => {
    setDdi(nextDdi);
    setPhoneOnly(nextNumber);
    const fullPhone = `${nextDdi} ${nextNumber}`;
    setValue('phone', fullPhone);
    setUserData((prev) => ({ ...prev, phone: fullPhone }));
  };

  const onSubmit = (data: UpdateProfileFormData) => {
    if (phoneRef.current && !phoneRef.current.validate()) return;
    setUserData(data);
    onUpdateProfile();
  };

  const closeDelete = () => {
    setShowDeleteConfirm(false);
    setDeletePassword('');
  };

  const firstName = register('firstName');
  const lastName = register('lastName');

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
          <div>
            <label htmlFor={`${ids}-first`} className={LABEL}>
              {t('account.firstName')}
            </label>
            <input
              id={`${ids}-first`}
              type="text"
              autoComplete="given-name"
              maxLength={100}
              aria-invalid={Boolean(errors.firstName)}
              {...firstName}
              onChange={(e) => {
                void firstName.onChange(e);
                setUserData((prev) => ({ ...prev, firstName: e.target.value }));
              }}
              className={INPUT}
            />
            {errors.firstName?.message && (
              <p className={FIELD_ERROR}>{t(errors.firstName.message)}</p>
            )}
          </div>
          <div>
            <label htmlFor={`${ids}-last`} className={LABEL}>
              {t('account.lastName')}
            </label>
            <input
              id={`${ids}-last`}
              type="text"
              autoComplete="family-name"
              maxLength={100}
              aria-invalid={Boolean(errors.lastName)}
              {...lastName}
              onChange={(e) => {
                void lastName.onChange(e);
                setUserData((prev) => ({ ...prev, lastName: e.target.value }));
              }}
              className={INPUT}
            />
            {errors.lastName?.message && (
              <p className={FIELD_ERROR}>{t(errors.lastName.message)}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="account-phone-field" className={LABEL}>
            {t('account.phone')}
          </label>
          <Controller
            name="phone"
            control={control}
            render={() => (
              <PhoneInputField
                ref={phoneRef}
                id="account-phone-field"
                phone={phoneOnly}
                ddi={ddi}
                onPhoneChange={(next) => changePhone(ddi, next)}
                onDdiChange={(next) => changePhone(next, phoneOnly)}
                required
              />
            )}
          />
          {errors.phone?.message && <p className={FIELD_ERROR}>{t(errors.phone.message)}</p>}
        </div>

        <button type="submit" disabled={isLoading} className={`${BUTTON_PRIMARY} w-full min-h-12`}>
          {isLoading ? t('account.saving') : t('account.save')}
        </button>
      </form>

      <div className="flex flex-col gap-3">
        <div>
          <p className={LABEL}>{t('account.email')}</p>
          <p className="min-h-11 px-3 flex items-center rounded-control bg-surface border border-line text-control text-ink-muted break-all">
            {user?.email}
          </p>
        </div>
        {hasPassword && (
          <button
            type="button"
            onClick={onChangePassword}
            disabled={isLoading}
            className="press w-full min-h-14 px-4 flex items-center gap-3 rounded-card bg-surface border border-line text-left hover:bg-ink/[0.03] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none disabled:opacity-50"
          >
            <Lock size={20} className="text-ink-muted shrink-0" aria-hidden="true" />
            <span className="flex-1 text-body font-semibold text-ink">
              {t('account.changePassword')}
            </span>
            <ChevronRight size={20} className="text-ink-subtle shrink-0" aria-hidden="true" />
          </button>
        )}
      </div>

      {showDeleteConfirm ? (
        <section
          aria-labelledby={`${ids}-delete`}
          className="p-4 rounded-card bg-danger-soft border border-danger-line flex flex-col gap-3"
        >
          <h3
            id={`${ids}-delete`}
            className="flex items-center gap-2 text-body font-semibold text-danger"
          >
            <AlertTriangle size={20} className="shrink-0" aria-hidden="true" />
            {t('account.delete.title')}
          </h3>
          <p className="text-meta text-ink">
            {t('account.delete.message')}
            {isPartner && ` ${t('account.delete.partnerNote')}`}
          </p>
          {hasPassword && (
            <div>
              <label htmlFor={`${ids}-delete-password`} className={LABEL}>
                {t('account.delete.passwordLabel')}
              </label>
              <div className="relative">
                <input
                  id={`${ids}-delete-password`}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  maxLength={20}
                  className={`${INPUT} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('account.hidePassword') : t('account.showPassword')}
                  className="absolute right-0 top-0 w-11 h-11 flex items-center justify-center text-ink-muted rounded-control focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
                >
                  {showPassword ? (
                    <EyeOff size={20} aria-hidden="true" />
                  ) : (
                    <Eye size={20} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onDeleteAccount(hasPassword ? deletePassword : undefined)}
              disabled={isLoading || (hasPassword && !deletePassword)}
              className={`${BUTTON_DANGER} flex-1`}
            >
              {isLoading ? t('account.delete.deleting') : t('account.delete.confirm')}
            </button>
            <TextButton onClick={closeDelete}>{t('account.delete.cancel')}</TextButton>
          </div>
        </section>
      ) : (
        <div className="flex justify-center">
          <TextButton tone="danger" onClick={() => setShowDeleteConfirm(true)}>
            {t('account.delete.action')}
          </TextButton>
        </div>
      )}
    </div>
  );
}
