import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';

/** Escolha da entrada quando a reserva tem mais de uma, como cartões de embarque (D20). */
export function UnitPicker({
  units,
  selected,
  onSelect,
}: {
  units: Array<{ unit: number; label: string; used: boolean }>;
  selected: number;
  onSelect: (unit: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="group"
      aria-label={t('serviceProof.pass.unitsLabel')}
      className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
    >
      {units.map((item) => (
        <button
          key={item.unit}
          type="button"
          aria-pressed={item.unit === selected}
          onClick={() => onSelect(item.unit)}
          className={cn(
            'press shrink-0 inline-flex items-center gap-1.5 min-h-11 max-w-[12rem] px-4 rounded-full text-sm font-semibold focus-visible:ring-2 focus-visible:ring-teal-400/50',
            item.unit === selected ? 'bg-ink text-app' : 'bg-ink/[0.06] text-ink/80'
          )}
        >
          {item.used && <Check size={14} className="shrink-0" aria-hidden="true" />}
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
