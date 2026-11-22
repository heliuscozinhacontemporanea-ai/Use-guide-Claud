import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { OfferFormInput } from '../../../schemas/offerFormSchema';
import { OfferDurationInput } from '../OfferDurationInput';

/** Duração do passeio ou tempo de viagem do translado, em horas e minutos (F3). */
export function OfferDurationFields({
  legend,
  register,
  errors,
}: {
  legend: string;
  register: UseFormRegister<OfferFormInput>;
  errors: FieldErrors<OfferFormInput>;
}) {
  const { t } = useTranslation();
  const error = errors.durationHours?.message ?? errors.durationMins?.message;
  return (
    <fieldset className="space-y-1">
      <legend className="text-xs text-ink/70">{legend}</legend>
      <div className="grid grid-cols-2 gap-3">
        <OfferDurationInput
          label={t('bookings.editor.durationHours')}
          unit="h"
          field={register('durationHours')}
          invalid={Boolean(error)}
        />
        <OfferDurationInput
          label={t('bookings.editor.durationMinutes')}
          unit="min"
          field={register('durationMins')}
          invalid={Boolean(error)}
        />
      </div>
      {error && (
        <span role="alert" className="block text-xs text-danger">
          {t(error)}
        </span>
      )}
    </fieldset>
  );
}
