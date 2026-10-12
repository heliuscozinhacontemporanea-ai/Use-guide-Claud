import { useTranslation } from 'react-i18next';
import { usePublicSlots } from '../../hooks/usePublicSlots';
import type { PublicSlot } from '../../types/bookings';
import { formatDayLabel, formatSlotTime, fortalezaDateKey } from '../../utils/dates';
import { ListEmpty, ListError, ListLoading } from '../shared/ListState';

interface SlotPickerProps {
  offerId: string;
  selectedId: string | null;
  onSelect: (slot: PublicSlot) => void;
}

export function SlotPicker({ offerId, selectedId, onSelect }: SlotPickerProps) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, reload } = usePublicSlots(offerId);

  if (loading) return <ListLoading label={t('bookings.buyer.loading')} />;
  if (error) return <ListError message={error} onRetry={() => void reload()} />;
  if (data.length === 0) return <ListEmpty message={t('bookings.buyer.noSlots')} />;

  const days = new Map<string, PublicSlot[]>();
  for (const slot of data) {
    const key = fortalezaDateKey(slot.startsAt);
    days.set(key, [...(days.get(key) ?? []), slot]);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-semibold text-white/70">
        {t('bookings.buyer.chooseSlot')}
      </legend>
      {[...days.entries()].map(([day, slots]) => (
        <div key={day} className="space-y-1.5">
          <p className="text-xs font-bold text-white/80">
            {formatDayLabel(slots[0]!.startsAt, i18n.language)}
          </p>
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => {
              const soldOut = slot.available <= 0;
              const selected = slot.id === selectedId;
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={soldOut}
                  aria-pressed={selected}
                  onClick={() => onSelect(slot)}
                  className={`min-h-11 px-3 rounded-xl text-left text-xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50 ${
                    selected
                      ? 'bg-teal-500/25 text-teal-100 ring-2 ring-teal-400/60'
                      : 'bg-white/5 text-white/80'
                  }`}
                >
                  <span className="block font-bold">
                    {formatSlotTime(slot.startsAt, i18n.language)}
                  </span>
                  <span className="block">
                    {soldOut
                      ? t('bookings.buyer.soldOut')
                      : t('bookings.buyer.spotsLeft', { count: slot.available })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </fieldset>
  );
}
