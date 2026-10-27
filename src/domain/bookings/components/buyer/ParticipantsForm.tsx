import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { participantsFormSchema } from '../../schemas/participantsFormSchema';
import { BUTTON_PRIMARY, INPUT } from '../../../../ui/styles/controls';

interface ParticipantsFormProps {
  count: number;
  onSubmit: (names: string[]) => void;
}

export function ParticipantsForm({ count, onSubmit }: ParticipantsFormProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => participantsFormSchema(count), [count]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ names: string[] }>({
    resolver: zodResolver(schema),
    defaultValues: { names: Array.from({ length: count }, () => '') },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values.names.map((name) => name.trim())))}
      className="space-y-2"
      noValidate
    >
      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold text-white/70">
          {t('bookings.buyer.participantsLegend')}
        </legend>
        {Array.from({ length: count }, (_, index) => (
          <label key={index} className="block space-y-1">
            <span className="text-xs text-white/70">
              {t('bookings.buyer.participantName', { index: index + 1 })}
            </span>
            <input {...register(`names.${index}`)} autoComplete="name" className={INPUT} />
            {errors.names?.[index]?.message && (
              <span role="alert" className="text-xs text-red-300">
                {t(errors.names[index]?.message ?? '')}
              </span>
            )}
          </label>
        ))}
      </fieldset>
      <button type="submit" className={BUTTON_PRIMARY}>
        {t('bookings.buyer.continue')}
      </button>
    </form>
  );
}
