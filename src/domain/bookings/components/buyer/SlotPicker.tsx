import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { type PlaceTime, placeTimeFormNote } from '../../../../shared/utils/placeTime';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { usePublicSlots } from '../../hooks/usePublicSlots';
import type { PublicSlot } from '../../types/bookings';
import { formatSlotTime, placeDateKey } from '../../utils/dates';

interface SlotPickerProps {
  offerId: string;
  selectedId: string | null;
  onSelect: (slot: PublicSlot) => void;
  /** Hora do lugar da oferta; quem está em outro fuso vê o lugar e a diferença (D28). */
  place?: PlaceTime;
}

/** Hoje, Amanhã ou o dia da semana com a data, na hora do lugar. */
function dayLabel(
  iso: string,
  locale: string,
  timeZone: string | undefined,
  labels: { today: string; tomorrow: string }
) {
  const key = placeDateKey(iso, timeZone);
  const today = placeDateKey(new Date().toISOString(), timeZone);
  const tomorrow = placeDateKey(new Date(Date.now() + 86_400_000).toISOString(), timeZone);
  if (key === today) return labels.today;
  if (key === tomorrow) return labels.tomorrow;
  // Rótulo curto para caber em botão ("qua. 11"); a data completa fica no resumo da reserva.
  return new Intl.DateTimeFormat(locale, { timeZone, weekday: 'short', day: 'numeric' }).format(
    new Date(iso)
  );
}

/** Horários em botões ("Hoje 14:00"), como no print aprovado (2026-11-10). */
export function SlotPicker({ offerId, selectedId, onSelect, place }: SlotPickerProps) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, reload } = usePublicSlots(offerId);
  const tz = place?.timeZone;
  const labels = { today: t('bookings.buyer.today'), tomorrow: t('bookings.buyer.tomorrow') };

  if (loading) return <ListLoading label={t('bookings.buyer.loading')} />;
  if (error) return <ListError message={error} onRetry={() => void reload()} />;
  if (data.length === 0) return <ListEmpty message={t('bookings.buyer.noSlots')} />;

  return (
    <fieldset className="space-y-2">
      <legend className="sr-only">{t('bookings.buyer.chooseSlot')}</legend>
      {placeTimeFormNote(t, place) && (
        <p className="text-[13px] text-ink/70">{placeTimeFormNote(t, place)}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {data.map((slot) => {
          const soldOut = slot.available <= 0;
          const selected = slot.id === selectedId;
          return (
            <button
              key={slot.id}
              type="button"
              disabled={soldOut}
              aria-pressed={selected}
              aria-label={
                soldOut
                  ? `${dayLabel(slot.startsAt, i18n.language, tz, labels)} ${formatSlotTime(slot.startsAt, i18n.language, tz)} · ${t('bookings.buyer.soldOut')}`
                  : undefined
              }
              onClick={() => onSelect(slot)}
              className={cn(
                'press min-h-11 px-3.5 rounded-xl border text-[14px] font-medium focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none disabled:opacity-40 disabled:line-through disabled:cursor-not-allowed',
                selected
                  ? 'bg-accent-soft border-teal-400 text-ink'
                  : 'bg-surface border-line text-ink/85'
              )}
            >
              {dayLabel(slot.startsAt, i18n.language, tz, labels)}{' '}
              {formatSlotTime(slot.startsAt, i18n.language, tz)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
