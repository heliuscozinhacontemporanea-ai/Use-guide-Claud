import { useTranslation } from 'react-i18next';
import { formatSessionLabel } from '../../../shared/utils/businessDateTime';
import type { PromoEventTarget } from '../types/promoCode';

/** Lotes escolhidos por evento marcado; `null` é todos os lotes. */
export type PromoTargetsValue = Record<string, string[] | null>;

const CHECK = 'w-5 h-5 shrink-0 accent-teal-400';
const LABEL =
  'flex items-center gap-3 min-h-11 cursor-pointer rounded-xl has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-400/50';

/** "Vale para": eventos do parceiro e, em cada um, todos os lotes ou só alguns. */
export function PromoTargetsField({
  events,
  value,
  onChange,
  disabled,
}: {
  events: PromoEventTarget[];
  value: PromoTargetsValue;
  onChange: (value: PromoTargetsValue) => void;
  disabled: boolean;
}) {
  const { t, i18n } = useTranslation();
  const set = (eventId: string, optionIds: string[] | null | undefined) => {
    const next = { ...value };
    if (optionIds === undefined) delete next[eventId];
    else next[eventId] = optionIds;
    onChange(next);
  };

  return (
    <fieldset disabled={disabled} className="space-y-2 disabled:opacity-60">
      <legend className="px-1 mb-2 text-[15px] font-semibold text-ink">
        {t('promoCodes.form.appliesTo')}
      </legend>
      {events.map((event) => {
        const selected = event.id in value;
        const optionIds = value[event.id] ?? null;
        return (
          <div
            key={event.id}
            className="px-4 py-1 rounded-2xl border bg-sheet-card border-sheet-card-line"
          >
            <label className={LABEL}>
              <input
                type="checkbox"
                className={CHECK}
                checked={selected}
                onChange={(input) => set(event.id, input.target.checked ? null : undefined)}
              />
              <span className="min-w-0 text-[16px] font-semibold text-ink break-words">
                {event.title}
              </span>
            </label>
            {selected && event.options.length > 0 && (
              <div className="pl-8 pb-2 space-y-1">
                <label className={LABEL}>
                  <input
                    type="radio"
                    name={`promo-options-${event.id}`}
                    className={CHECK}
                    checked={optionIds === null}
                    onChange={() => set(event.id, null)}
                  />
                  <span className="text-[15px] text-ink">{t('promoCodes.allOptions')}</span>
                </label>
                <label className={LABEL}>
                  <input
                    type="radio"
                    name={`promo-options-${event.id}`}
                    className={CHECK}
                    checked={optionIds !== null}
                    onChange={() => set(event.id, [])}
                  />
                  <span className="text-[15px] text-ink">{t('promoCodes.form.someOptions')}</span>
                </label>
                {optionIds !== null &&
                  event.options.map((option) => (
                    <label key={option.id} className={`${LABEL} pl-8`}>
                      <input
                        type="checkbox"
                        className={CHECK}
                        checked={optionIds.includes(option.id)}
                        onChange={(input) =>
                          set(
                            event.id,
                            input.target.checked
                              ? [...optionIds, option.id]
                              : optionIds.filter((id) => id !== option.id)
                          )
                        }
                      />
                      <span className="min-w-0 text-[15px] text-ink">
                        {option.name}
                        <span className="block text-[13px] text-ink/70">
                          {formatSessionLabel(option.sessionStartsAt, i18n.language)}
                        </span>
                      </span>
                    </label>
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}
