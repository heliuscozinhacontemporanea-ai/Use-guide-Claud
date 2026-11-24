import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { type ReactNode, useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { maskCpfCnpj } from '../../../../shared/utils/documentValidator';
import { cn } from '../../../../shared/utils/cn';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import {
  type DocumentVerificationFormValues,
  documentVerificationFormSchema,
  EMPTY_DOCUMENT_VERIFICATION_FORM,
} from '../../schemas/listingVerificationFormSchema';
import { VerificationFileField } from './VerificationFileField';
import { VerificationRadioGroup } from './VerificationRadioGroup';

interface DocumentVerificationFormProps {
  submitting: boolean;
  onSubmit: (values: DocumentVerificationFormValues) => Promise<void>;
  /** Antes do botão: aceite dos Termos e aviso do "Assumir anúncio" (D35). */
  extra?: ReactNode;
  submitLabel?: string;
}

const INPUT =
  'w-full min-h-[44px] bg-surface border rounded-2xl px-4 text-sm text-ink placeholder:text-ink/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50';

export function DocumentVerificationForm({
  submitting,
  onSubmit,
  extra,
  submitLabel,
}: DocumentVerificationFormProps) {
  const { t } = useTranslation();
  const documentId = useId();
  const cadasturId = useId();
  const { control, register, handleSubmit, watch, setValue, formState } =
    useForm<DocumentVerificationFormValues>({
      resolver: zodResolver(documentVerificationFormSchema),
      defaultValues: EMPTY_DOCUMENT_VERIFICATION_FORM,
    });
  const documentType = watch('documentType');
  const holderRole = watch('holderRole');
  const errors = formState.errors;
  const errorText = (message?: string) => (message ? t(message) : undefined);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Controller
        control={control}
        name="documentType"
        render={({ field }) => (
          <VerificationRadioGroup
            legend={t('verification.form.documentType')}
            name={field.name}
            value={field.value}
            options={[
              { value: 'cnpj', label: t('verification.form.cnpj') },
              { value: 'cpf', label: t('verification.form.cpf') },
            ]}
            onChange={(value) => {
              field.onChange(value);
              setValue('document', '');
            }}
          />
        )}
      />
      <p className="text-xs text-ink-muted">{t('verification.form.cnpjHint')}</p>

      <div className="space-y-1.5">
        <label htmlFor={documentId} className="block text-xs font-semibold text-ink/80">
          {t('verification.form.document')}
        </label>
        <input
          id={documentId}
          inputMode="numeric"
          autoComplete="off"
          maxLength={documentType === 'cnpj' ? 18 : 14}
          className={cn(INPUT, errors.document ? 'border-danger-line' : 'border-line')}
          {...register('document', {
            onChange: (event) => setValue('document', maskCpfCnpj(event.target.value)),
          })}
        />
        {errors.document && (
          <p className="text-xs text-danger">{errorText(errors.document.message)}</p>
        )}
      </div>

      <Controller
        control={control}
        name="holderRole"
        render={({ field }) => (
          <VerificationRadioGroup
            legend={t('verification.form.holderRole')}
            name={field.name}
            value={field.value}
            error={errorText(errors.holderRole?.message)}
            options={[
              { value: 'owner', label: t('verification.form.owner') },
              { value: 'representative', label: t('verification.form.representative') },
            ]}
            onChange={field.onChange}
          />
        )}
      />

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-ink/80">{t('verification.form.filesTitle')}</h4>
        <p className="text-xs text-ink-muted">{t('verification.form.fileHint')}</p>
        {documentType === 'cnpj' && (
          <Controller
            control={control}
            name="cnpjCard"
            render={({ field }) => (
              <VerificationFileField
                label={t('verification.files.cnpjCard')}
                file={field.value}
                error={errorText(errors.cnpjCard?.message)}
                onChange={field.onChange}
              />
            )}
          />
        )}
        <Controller
          control={control}
          name="identity"
          render={({ field }) => (
            <VerificationFileField
              label={t('verification.files.identity')}
              file={field.value}
              error={errorText(errors.identity?.message)}
              onChange={field.onChange}
            />
          )}
        />
        {documentType === 'cpf' && (
          <p className="text-xs text-ink-muted">{t('verification.form.cpfReuseHint')}</p>
        )}
        {holderRole === 'representative' && (
          <Controller
            control={control}
            name="authorization"
            render={({ field }) => (
              <VerificationFileField
                label={t('verification.files.authorization')}
                file={field.value}
                error={errorText(errors.authorization?.message)}
                onChange={field.onChange}
              />
            )}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={cadasturId} className="block text-xs font-semibold text-ink/80">
          {t('verification.form.cadastur')}
        </label>
        <input
          id={cadasturId}
          maxLength={30}
          autoComplete="off"
          className={cn(INPUT, 'border-line')}
          {...register('cadastur')}
        />
        <p className="text-xs text-ink-muted">{t('verification.form.cadasturHint')}</p>
      </div>

      {extra}
      <button
        type="submit"
        disabled={submitting}
        className={`${BUTTON_PRIMARY} press w-full min-h-12 inline-flex items-center justify-center gap-2`}
      >
        {submitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
        {submitting
          ? t('verification.form.submitting')
          : (submitLabel ?? t('verification.form.submit'))}
      </button>
    </form>
  );
}
