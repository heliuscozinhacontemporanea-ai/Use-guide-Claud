import { useTranslation } from 'react-i18next';
import { formatSessionLabel } from '../../../shared/utils/businessDateTime';
import { type PromoListingTarget, promoTargetKey } from '../types/promoCode';

/** Escolhidos por `kind:id`: lotes ou opções, ou `null` para todos. */
export type PromoTargetsValue = Record<string, string[] | null>;

const CHECK = 'w-5 h-5 shrink-0 accent-teal-400';
const LABEL =
  'flex items-center gap-3 min-h-11 cursor-pointer rounded-xl has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-400/50';

/**
 * "Vale para": eventos (com os lotes de cada sessão) e ofertas de reserva (com as opções de preço) do
 * parceiro; em cada um, todos ou só alguns.
 */
export function PromoTargetsField({
  targets,
  value,
  onChange,
  disabled,
}: {
  targets: PromoListingTarget[];
  value: PromoTargetsValue;
  onChange: (value: PromoTargetsValue) => void;
  disabled: boolean;
}) {
  const { t, i18n } = useTranslation();
  const set = (key: string, optionIds: string[] | null | undefined) => {
    const next = { ...value };
    if (optionIds === undefined) delete next[key];
    else next[key] = optionIds;
    onChange(next);
  };

  const row = (target: PromoListingTarget) => {
    const key = promoTargetKey(target);
    const selected = key in value;
    const optionIds = value[key] ?? null;
    const isEvent = target.kind === 'event';
    return (
      <div key={key} className="px-4 py-1 rounded-2xl border bg-sheet-card border-sheet-card-line">
        <label className={LABEL}>
          <input
            type="checkbox"
            className={CHECK}
            checked={selected}
            onChange={(input) => set(key, input.target.checked ? null : undefined)}
          />
          <span className="min-w-0 text-[16px] font-semibold text-ink break-words">
            {target.title}
          </span>
        </label>
        {selected && target.options.length > 1 && (
          <div className="pl-8 pb-2 space-y-1">
            <label className={LABEL}>
              <input
                type="radio"
                name={`promo-options-${key}`}
                className={CHECK}
                checked={optionIds === null}
                onChange={() => set(key, null)}
              />
              <span className="text-[15px] text-ink">
                {t(isEvent ? 'promoCodes.allOptions' : 'promoCodes.allPriceOptions')}
              </span>
            </label>
            <label className={LABEL}>
              <input
                type="radio"
                name={`promo-options-${key}`}
                className={CHECK}
                checked={optionIds !== null}
                onChange={() => set(key, [])}
              />
              <span className="text-[15px] text-ink">
                {t(isEvent ? 'promoCodes.form.someOptions' : 'promoCodes.form.somePriceOptions')}
              </span>
            </label>
            {optionIds !== null &&
              target.options.map((option) => (
                <label key={option.id} className={`${LABEL} pl-8`}>
                  <input
                    type="checkbox"
                    className={CHECK}
                    checked={optionIds.includes(option.id)}
                    onChange={(input) =>
                      set(
                        key,
                        input.target.checked
                          ? [...optionIds, option.id]
                          : optionIds.filter((id) => id !== option.id)
                      )
                    }
                  />
                  <span className="min-w-0 text-[15px] text-ink">
                    {option.name}
                    {option.sessionStartsAt && (
                      <span className="block text-[13px] text-ink/70">
                        {formatSessionLabel(option.sessionStartsAt, i18n.language)}
                      </span>
                    )}
                  </span>
                </label>
              ))}
          </div>
        )}
      </div>
    );
  };

  const groups = [
    {
      id: 'event',
      title: t('promoCodes.form.events'),
      items: targets.filter((x) => x.kind === 'event'),
    },
    {
      id: 'offer',
      title: t('promoCodes.form.offers'),
      items: targets.filter((x) => x.kind === 'offer'),
    },
  ].filter((group) => group.items.length > 0);

  return (
    <fieldset disabled={disabled} className="space-y-3 disabled:opacity-60">
      <legend className="px-1 mb-2 text-[15px] font-semibold text-ink">
        {t('promoCodes.form.appliesTo')}
      </legend>
      {groups.map((group) => (
        <div key={group.id} className="space-y-2">
          {groups.length > 1 && (
            <p className="px-1 text-[13px] font-semibold text-ink/70">{group.title}</p>
          )}
          {group.items.map(row)}
        </div>
      ))}
    </fieldset>
  );
}
