import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { INPUT } from '../../../../ui/styles/controls';
import type { OfferFormInput } from '../../schemas/offerFormSchema';

interface OfferTextFieldsProps {
  register: UseFormRegister<OfferFormInput>;
  errors: FieldErrors<OfferFormInput>;
}

/** Título e descrição num texto só (F3, D34); a tradução automática da D5 ainda não existe. */
export function OfferTextFields({ register, errors }: OfferTextFieldsProps) {
  const { t } = useTranslation();
  const titleError = errors.title?.message;
  const descriptionError = errors.description?.message;

  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="text-xs text-ink/70">{t('bookings.editor.titleLabel')}</span>
        <input
          {...register('title')}
          aria-invalid={Boolean(titleError)}
          aria-describedby={titleError ? 'offer-title-error' : undefined}
          className={INPUT}
        />
        {titleError && (
          <span id="offer-title-error" role="alert" className="block text-xs text-danger">
            {t(titleError)}
          </span>
        )}
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-ink/70">{t('bookings.editor.descriptionLabel')}</span>
        <textarea {...register('description')} rows={4} className={`${INPUT} py-2`} />
        {descriptionError && (
          <span role="alert" className="block text-xs text-danger">
            {t(descriptionError)}
          </span>
        )}
      </label>
    </div>
  );
}
