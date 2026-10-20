import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { maskCpfCnpj } from '../../../../shared/utils/documentValidator';
import { cn } from '../../../../shared/utils/cn';
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
}

const INPUT =
  'w-full min-h-[44px] bg-white/5 border rounded-2xl px-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50';

export function DocumentVerificationForm({ submitting, onSubmit }: DocumentVerificationFormProps) {
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
      <p className="text-xs text-white/60">{t('verification.form.cnpjHint')}</p>

      <div className="space-y-1.5">
        <label htmlFor={documentId} className="block text-xs font-semibold text-white/80">
          {t('verification.form.document')}
        </label>
        <input
          id={documentId}
          inputMode="numeric"
          autoComplete="off"
          maxLength={documentType === 'cnpj' ? 18 : 14}
          className={cn(INPUT, errors.document ? 'border-rose-500/50' : 'border-white/10')}
          {...register('document', {
            onChange: (event) => setValue('document', maskCpfCnpj(event.target.value)),
          })}
        />
        {errors.document && (
          <p className="text-xs text-rose-300">{errorText(errors.document.message)}</p>
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
        <h4 className="text-xs font-semibold text-white/80">{t('verification.form.filesTitle')}</h4>
        <p className="text-xs text-white/60">{t('verification.form.fileHint')}</p>
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
          <p className="text-xs text-white/60">{t('verification.form.cpfReuseHint')}</p>
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
        <label htmlFor={cadasturId} className="block text-xs font-semibold text-white/80">
          {t('verification.form.cadastur')}
        </label>
        <input
          id={cadasturId}
          maxLength={30}
          autoComplete="off"
          className={cn(INPUT, 'border-white/10')}
          {...register('cadastur')}
        />
        <p className="text-xs text-white/60">{t('verification.form.cadasturHint')}</p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl bg-teal-500 text-black text-xs font-bold hover:bg-teal-400 disabled:opacity-60 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        {submitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
        {submitting ? t('verification.form.submitting') : t('verification.form.submit')}
      </button>
    </form>
  );
}
