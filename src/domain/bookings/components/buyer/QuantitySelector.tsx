import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PriceOption } from '../../types/bookings';
import { formatMinor } from '../../utils/money';

interface QuantitySelectorProps {
  options: PriceOption[];
  /** Limite da reserva, já limitado às vagas livres do horário. */
  maxParticipants: number;
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
  /** Venda por grupo (D20): cada unidade é um grupo de até este número de pessoas. */
  groupMaxPeople?: number;
}

function labelOf(option: PriceOption, language: string): string {
  const key = language === 'en' || language === 'fr' ? language : 'pt-BR';
  return option.label[key] || option.label['pt-BR'];
}

export function QuantitySelector({
  options,
  maxParticipants,
  value,
  onChange,
  groupMaxPeople,
}: QuantitySelectorProps) {
  const { t, i18n } = useTranslation();
  const total = Object.values(value).reduce((sum, quantity) => sum + quantity, 0);
  // Só para exibição: o backend recalcula o preço a partir da oferta (AGENTS.md §8.5).
  const totalMinor = options.reduce(
    (sum, option) => sum + (value[option.id] ?? 0) * option.unitAmountMinor,
    0
  );

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold text-ink/70">
        {t(groupMaxPeople ? 'serviceProof.checkout.groupLegend' : 'bookings.buyer.quantityLegend')}
      </legend>
      {groupMaxPeople && (
        <p className="text-xs text-ink/70">
          {t('serviceProof.checkout.groupNote', { max: groupMaxPeople })}
        </p>
      )}
      {options.map((option) => {
        const quantity = value[option.id] ?? 0;
        const label = labelOf(option, i18n.language);
        const canIncrease =
          total < maxParticipants &&
          (option.maxQuantity === undefined || quantity < option.maxQuantity);
        return (
          <div
            key={option.id}
            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-line"
          >
            <div>
              <p className="text-sm font-semibold text-ink">{label}</p>
              <p className="text-xs text-ink/70">
                {formatMinor(option.unitAmountMinor, i18n.language)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={t('bookings.buyer.decrease', { label })}
                disabled={quantity === 0}
                onClick={() => onChange({ ...value, [option.id]: quantity - 1 })}
                className="w-11 h-11 rounded-xl bg-ink/[0.06] text-ink flex items-center justify-center disabled:opacity-40 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <Minus size={16} aria-hidden="true" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-ink" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                aria-label={t('bookings.buyer.increase', { label })}
                disabled={!canIncrease}
                onClick={() => onChange({ ...value, [option.id]: quantity + 1 })}
                className="w-11 h-11 rounded-xl bg-ink/[0.06] text-ink flex items-center justify-center disabled:opacity-40 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        );
      })}
      {!groupMaxPeople && (
        <p className="text-xs text-ink/70">
          {t('bookings.buyer.maxParticipants', { count: maxParticipants })}
        </p>
      )}
      <p className="flex justify-between text-sm font-bold text-ink">
        <span>{t('bookings.buyer.totalLabel')}</span>
        <span>{formatMinor(totalMinor, i18n.language)}</span>
      </p>
    </fieldset>
  );
}
