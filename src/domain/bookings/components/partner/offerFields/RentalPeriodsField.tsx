import { ChevronDown, Plus, Trash2 } from 'lucide-react';
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
import { formatDuration } from '../../../utils/formatDuration';
import { formatMinor, parseReaisToMinor } from '../../../utils/money';
import { OfferDurationInput } from '../OfferDurationInput';
import { OfferNumberField } from './OfferNumberField';

/**
 * Períodos fixos do aluguel em linhas compactas ("08:00 · 4 h — R$ 300,00 por veículo"), como no
 * protótipo do horário personalizado (tela 1). O toque abre os campos do período; período sem preço ou
 * com erro já aparece aberto.
 */
export function RentalPeriodsField({
  control,
  register,
  errors,
}: {
  control: Control<OfferFormInput>;
  register: UseFormRegister<OfferFormInput>;
  errors: FieldErrors<OfferFormInput>;
}) {
  const { t, i18n } = useTranslation();
  const periods = useFieldArray({ control, name: 'periods' });
  const values = useWatch({ control, name: 'periods' }) ?? [];
  const [opened, setOpened] = useState<Set<string>>(() => new Set());
  const periodsError = errors.periods?.root?.message ?? errors.periods?.message;
  const toggle = (id: string) =>
    setOpened((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-xs text-ink/70">
        {t('fleet.editor.periodsLegend')} {t('fleet.editor.optional')}
      </legend>
      <p className="text-xs text-ink/70">{t('fleet.editor.periodsHint')}</p>
      {periods.fields.length > 0 && (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {periods.fields.map((period, index) => {
            const value = values[index];
            const error = errors.periods?.[index];
            const minor = parseReaisToMinor(String(value?.amount ?? ''));
            const open = opened.has(period.id) || minor === null || Boolean(error);
            const minutes = Number(value?.hours ?? 0) * 60 + Number(value?.mins ?? 0);
            const panelId = `period-${period.id}`;
            return (
              <li key={period.id}>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggle(period.id)}
                  className="press flex w-full min-h-12 items-center justify-between gap-3 px-3 py-2 text-left focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
                >
                  <span className="text-[14px] font-semibold text-ink">
                    {t('fleet.editor.periodSummary', {
                      time: value?.start ?? '',
                      duration: minutes > 0 ? formatDuration(minutes) : '—',
                    })}
                  </span>
                  <span className="flex items-center gap-2 text-[13px] text-ink/70">
                    {minor === null
                      ? t('fleet.editor.noPrice')
                      : t('fleet.booking.vehicleLine', {
                          price: formatMinor(minor, i18n.language),
                        })}
                    <ChevronDown
                      size={16}
                      aria-hidden="true"
                      className={cn('shrink-0 transition-transform', open && 'rotate-180')}
                    />
                  </span>
                </button>
                {open && (
                  <div id={panelId} className="space-y-2 border-t border-line px-3 pb-3 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <OfferNumberField
                        label={t('fleet.editor.periodStart')}
                        type="time"
                        field={register(`periods.${index}.start`)}
                        error={error?.start?.message}
                      />
                      <OfferNumberField
                        label={t('fleet.editor.periodPrice')}
                        decimal
                        field={register(`periods.${index}.amount`)}
                        error={error?.amount?.message}
                      />
                    </div>
                    <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                      <OfferDurationInput
                        label={t('bookings.editor.durationHours')}
                        unit="h"
                        field={register(`periods.${index}.hours`)}
                        invalid={Boolean(error?.start)}
                      />
                      <OfferDurationInput
                        label={t('bookings.editor.durationMinutes')}
                        unit="min"
                        field={register(`periods.${index}.mins`)}
                        invalid={Boolean(error?.start)}
                      />
                      <button
                        type="button"
                        onClick={() => periods.remove(index)}
                        aria-label={t('fleet.editor.removePeriod')}
                        className={`${BUTTON_SECONDARY} w-11 flex items-center justify-center`}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {periodsError && (
        <p role="alert" className="text-xs text-danger">
          {t(periodsError)}
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          const id = `p${Date.now().toString(36)}`;
          periods.append({ id, start: '08:00', hours: 4, mins: 0, amount: '' });
          setOpened((current) => new Set(current).add(id));
        }}
        disabled={periods.fields.length >= 12}
        className={BUTTON_SECONDARY}
      >
        <Plus size={13} className="inline mr-1" aria-hidden="true" />
        {t('fleet.editor.addPeriod')}
      </button>
    </fieldset>
  );
}
