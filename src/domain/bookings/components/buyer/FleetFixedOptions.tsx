import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { ListEmpty } from '../../../../ui/components/ListState';
import type { PublicFleetDay } from '../../types/bookings';
import { formatSlotRange, formatSlotTime } from '../../utils/dates';

export const FLEET_OPTION =
  'press min-h-11 rounded-xl border text-left focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed';
export const FLEET_OPTION_SELECTED = 'bg-accent-soft border-teal-400 text-ink';
export const FLEET_OPTION_IDLE = 'bg-surface border-line text-ink/85';

/** Períodos do aluguel ("08:00–12:00") ou saídas do translado ("06:00"), com os veículos livres. */
export function FleetFixedOptions({
  kind,
  fixed,
  timeZone,
  selectedId,
  onSelect,
}: {
  kind: 'rental' | 'transfer';
  fixed: PublicFleetDay['fixed'];
  timeZone?: string;
  selectedId?: string;
  onSelect: (periodId: string) => void;
}) {
  const { t, i18n } = useTranslation();
  if (fixed.length === 0) return <ListEmpty message={t('fleet.booking.noTimes')} />;
  const time = (iso: string) => formatSlotTime(iso, i18n.language, timeZone);

  return (
    <div className="grid grid-cols-2 gap-2">
      {fixed.map((period) => {
        const soldOut = period.available <= 0;
        const selected = period.id === selectedId;
        return (
          <button
            key={period.id}
            type="button"
            disabled={soldOut}
            aria-pressed={selected}
            onClick={() => onSelect(period.id)}
            className={cn(
              FLEET_OPTION,
              'px-3 py-2',
              selected ? FLEET_OPTION_SELECTED : FLEET_OPTION_IDLE
            )}
          >
            <span className="block text-[15px] font-semibold">
              {kind === 'rental'
                ? formatSlotRange(period.startsAt, period.endsAt, i18n.language, timeZone)
                : time(period.startsAt)}
            </span>
            <span className="block text-[12px] text-ink/70">
              {soldOut
                ? t('fleet.booking.soldOut')
                : t('fleet.booking.free', { count: period.available })}
            </span>
          </button>
        );
      })}
    </div>
  );
}
