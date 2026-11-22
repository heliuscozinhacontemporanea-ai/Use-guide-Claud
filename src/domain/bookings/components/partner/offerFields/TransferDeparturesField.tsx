import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  useFieldArray,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../../shared/utils/cn';
import { BUTTON_SECONDARY } from '../../../../../ui/styles/controls';
import type { OfferFormInput } from '../../../schemas/offerFormSchema';
import { OfferNumberField } from './OfferNumberField';

const CHIP =
  'press min-h-11 min-w-[4.25rem] rounded-xl border px-3 text-[14px] font-medium focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';

/**
 * Saídas fixas do translado em botões ("06:00 · 09:00 · 13:00"), como no protótipo do horário
 * personalizado (tela 4). O toque abre a hora daquela saída para trocar ou remover.
 */
export function TransferDeparturesField({
  control,
  register,
  errors,
}: {
  control: Control<OfferFormInput>;
  register: UseFormRegister<OfferFormInput>;
  errors: FieldErrors<OfferFormInput>;
}) {
  const { t } = useTranslation();
  const departures = useFieldArray({ control, name: 'departures' });
  const values = useWatch({ control, name: 'departures' }) ?? [];
  const [selected, setSelected] = useState<string | null>(null);
  const departuresError = errors.departures?.root?.message ?? errors.departures?.message;
  const withError = departures.fields.find((_, index) => errors.departures?.[index]);
  const openId = withError?.id ?? selected;
  const openIndex = departures.fields.findIndex((field) => field.id === openId);

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-xs text-ink/70">
        {t('fleet.editor.departuresLegend')} {t('fleet.editor.optional')}
      </legend>
      <div className="flex flex-wrap gap-2">
        {departures.fields.map((departure, index) => {
          const on = departure.id === openId;
          return (
            <button
              key={departure.id}
              type="button"
              aria-pressed={on}
              aria-label={t('fleet.editor.departureChip', { time: values[index]?.start ?? '' })}
              onClick={() => setSelected(on ? null : departure.id)}
              className={cn(
                CHIP,
                on
                  ? 'bg-accent-soft border-teal-400 text-ink'
                  : 'bg-surface border-line text-ink/85',
                errors.departures?.[index] && 'border-danger'
              )}
            >
              {values[index]?.start || '--:--'}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            const id = `d${Date.now().toString(36)}`;
            departures.append({ id, start: '06:00' });
            setSelected(id);
          }}
          disabled={departures.fields.length >= 12}
          className={BUTTON_SECONDARY}
        >
          <Plus size={13} className="inline mr-1" aria-hidden="true" />
          {t('fleet.editor.addDeparture')}
        </button>
      </div>
      {openIndex >= 0 && (
        <div className="grid grid-cols-[1fr_auto] items-end gap-2 rounded-2xl border border-line bg-surface p-3">
          <OfferNumberField
            label={t('fleet.editor.departureTime')}
            type="time"
            field={register(`departures.${openIndex}.start`)}
            error={errors.departures?.[openIndex]?.start?.message}
          />
          <button
            type="button"
            onClick={() => {
              departures.remove(openIndex);
              setSelected(null);
            }}
            aria-label={t('fleet.editor.removeDeparture')}
            className={`${BUTTON_SECONDARY} w-11 flex items-center justify-center`}
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      )}
      {departuresError && (
        <p role="alert" className="text-xs text-danger">
          {t(departuresError)}
        </p>
      )}
    </fieldset>
  );
}
