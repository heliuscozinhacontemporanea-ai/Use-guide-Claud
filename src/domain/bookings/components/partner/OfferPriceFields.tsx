import { Plus, Trash2 } from 'lucide-react';
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  useFieldArray,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BUTTON_SECONDARY, INPUT } from '../../../../ui/styles/controls';
import type { OfferFormInput } from '../../schemas/offerFormSchema';

interface OfferPriceFieldsProps {
  control: Control<OfferFormInput>;
  register: UseFormRegister<OfferFormInput>;
  errors: FieldErrors<OfferFormInput>;
}

/** Opções de preço numa linha cada: nome, valor e remover (protótipo da F3, tela 7). */
export function OfferPriceFields({ control, register, errors }: OfferPriceFieldsProps) {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({ control, name: 'priceOptions' });

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-xs font-semibold text-ink/70">
        {t('bookings.editor.pricingLegend')}
      </legend>
      {fields.map((field, index) => {
        const error = errors.priceOptions?.[index];
        const message = error?.label?.message ?? error?.amount?.message;
        return (
          <div key={field.id} className="space-y-1">
            <div className="grid grid-cols-[minmax(0,1fr)_7.5rem_2.75rem] items-center gap-2">
              <label className="block">
                <span className="sr-only">{t('bookings.editor.priceLabel')}</span>
                <input
                  {...register(`priceOptions.${index}.label`)}
                  placeholder={t('bookings.editor.optionPlaceholder')}
                  aria-invalid={Boolean(error?.label)}
                  className={INPUT}
                />
              </label>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm text-ink/60"
                >
                  R$
                </span>
                <label className="block">
                  <span className="sr-only">{t('bookings.editor.priceAmount')}</span>
                  <input
                    {...register(`priceOptions.${index}.amount`)}
                    inputMode="decimal"
                    placeholder="0,00"
                    aria-invalid={Boolean(error?.amount)}
                    className={`${INPUT} pl-9`}
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                aria-label={t('bookings.editor.removePriceOption')}
                className={`${BUTTON_SECONDARY} w-11 flex items-center justify-center`}
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </div>
            {message && (
              <p role="alert" className="text-xs text-danger">
                {t(message)}
              </p>
            )}
          </div>
        );
      })}
      {errors.priceOptions?.root?.message && (
        <p role="alert" className="text-xs text-danger">
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
