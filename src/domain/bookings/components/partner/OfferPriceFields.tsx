import { Plus, Trash2 } from 'lucide-react';
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  useFieldArray,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { OfferFormInput } from '../../schemas/offerFormSchema';
import { BUTTON_SECONDARY, INPUT } from '../../../../ui/styles/controls';

interface OfferPriceFieldsProps {
  control: Control<OfferFormInput>;
  register: UseFormRegister<OfferFormInput>;
  errors: FieldErrors<OfferFormInput>;
}

export function OfferPriceFields({ control, register, errors }: OfferPriceFieldsProps) {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({ control, name: 'priceOptions' });

  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-semibold text-white/70">
        {t('bookings.editor.pricingLegend')}
      </legend>
      {fields.map((field, index) => {
        const error = errors.priceOptions?.[index];
        return (
          <div
            key={field.id}
            className="grid grid-cols-1 sm:grid-cols-[1fr_8rem_auto] gap-2 items-end"
          >
            <label className="block space-y-1">
              <span className="text-xs text-white/70">{t('bookings.editor.priceLabel')}</span>
              <input {...register(`priceOptions.${index}.label`)} className={INPUT} />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-white/70">{t('bookings.editor.priceAmount')}</span>
              <input
                {...register(`priceOptions.${index}.amount`)}
                inputMode="decimal"
                className={INPUT}
              />
            </label>
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              aria-label={t('bookings.editor.removePriceOption')}
              className={`${BUTTON_SECONDARY} w-11 flex items-center justify-center`}
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
            {(error?.label?.message || error?.amount?.message) && (
              <p role="alert" className="sm:col-span-3 text-xs text-red-300">
                {t(error.label?.message ?? error.amount?.message ?? '')}
              </p>
            )}
          </div>
        );
      })}
      {errors.priceOptions?.root?.message && (
        <p role="alert" className="text-xs text-red-300">
          {t(errors.priceOptions.root.message)}
        </p>
      )}
      <button
        type="button"
        onClick={() => append({ id: `option${fields.length + 1}`, label: '', amount: '' })}
        disabled={fields.length >= 10}
        className={BUTTON_SECONDARY}
      >
        <Plus size={13} className="inline mr-1" aria-hidden="true" />
        {t('bookings.editor.addPriceOption')}
      </button>
    </fieldset>
  );
}
