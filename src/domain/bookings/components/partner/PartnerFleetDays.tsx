import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { placeTimeFormNote } from '../../../../shared/utils/placeTime';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { BUTTON_PARTNER_WIDE, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { usePartnerFleetDays } from '../../hooks/usePartnerFleetDays';
import type { PartnerOffer } from '../../types/bookings';
import {
  addDays,
  formatDayLabel,
  formatSlotTime,
  placeDateKey,
  placeInputToIso,
  startOfPlaceWeek,
} from '../../utils/dates';
import { fleetBusyKind } from '../../utils/fleetBusyKind';
import { FleetDayBar } from './FleetDayBar';

/**
 * Dias e reservas do aluguel e do translado privativo (F3b): cada dia com os veículos, a barra de
 * ocupação e o que está ocupado (período, saída ou horário personalizado). "Abrir dias" abre a página
 * do formulário; ao voltar dela, a semana é relida (`reloadKey`).
 */
export function PartnerFleetDays({
  offer,
  onOpenForm,
  reloadKey = 0,
}: {
  offer: PartnerOffer;
  /** Abre "Abrir dias" com os veículos do último dia aberto como padrão. */
  onOpenForm: (defaultVehicles?: number) => void;
  reloadKey?: number;
}) {
  const { t, i18n } = useTranslation();
  const tz = offer.timeZone;
  const [weekStart, setWeekStart] = useState(() => startOfPlaceWeek(new Date(), tz));
  const from = placeDateKey(weekStart.toISOString(), tz);
  const to = placeDateKey(addDays(weekStart, 6).toISOString(), tz);
  const days = usePartnerFleetDays(offer.id, from, to);
  const zoneNote = placeTimeFormNote(t, { timeZone: offer.timeZone, city: offer.city });
  const time = (iso: string) => formatSlotTime(iso, i18n.language, tz);
  const kindOf = (busy: (typeof days.data)[number]['busy'][number]) =>
    fleetBusyKind(offer, busy, tz);
  const lastVehicles = [...days.data].reverse().find((day) => day.vehicles > 0)?.vehicles;

  const firstKey = useRef(reloadKey);
  const { reload } = days;
  useEffect(() => {
    if (reloadKey !== firstKey.current) void reload();
  }, [reloadKey, reload]);

  return (
    <section className="space-y-4" aria-label={t('fleet.days.title')}>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          aria-label={t('bookings.slots.previousWeek')}
          className={`${BUTTON_SECONDARY} w-11`}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <p className="text-sm font-semibold text-ink">
          {formatDayLabel(weekStart.toISOString(), i18n.language, tz)} –{' '}
          {formatDayLabel(addDays(weekStart, 6).toISOString(), i18n.language, tz)}
        </p>
        <button
          type="button"
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          aria-label={t('bookings.slots.nextWeek')}
          className={`${BUTTON_SECONDARY} w-11`}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
      {zoneNote && <p className="text-xs text-ink/70">{zoneNote}</p>}
      {days.loading && <ListLoading label={t('bookings.partner.loading')} />}
      {!days.loading && days.error && (
        <ListError message={days.error} onRetry={() => void days.reload()} />
      )}
      {!days.loading && !days.error && days.data.length === 0 && (
        <ListEmpty message={t('fleet.days.empty')} />
      )}
      {!days.loading && !days.error && days.data.length > 0 && (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {days.data.map((day) => (
            <li key={day.date} className="space-y-1.5 p-3">
              <p className="text-sm font-bold text-ink">
                {formatDayLabel(placeInputToIso(`${day.date}T12:00`, tz) ?? '', i18n.language, tz)}{' '}
                ·{' '}
                {day.vehicles > 0
                  ? t('fleet.days.vehiclesCount', { count: day.vehicles })
                  : t('fleet.days.closed')}
              </p>
              {day.busy.length === 0 ? (
                <p className="text-xs text-ink/70">{t('fleet.days.free')}</p>
              ) : (
                day.busy.map((busy) => (
                  <p key={`${busy.startsAt}-${busy.endsAt}`} className="text-xs text-ink/70">
                    {t('fleet.days.busyKind', {
                      count: busy.units,
                      start: time(busy.startsAt),
                      end: time(busy.endsAt),
                      kind: t(`fleet.days.kind.${kindOf(busy)}`),
                    })}
                  </p>
                ))
              )}
              {day.vehicles > 0 && <FleetDayBar day={day} kindOf={kindOf} />}
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => onOpenForm(lastVehicles)}
        className={BUTTON_PARTNER_WIDE}
      >
        <Plus size={16} aria-hidden="true" />
        {t('fleet.days.open')}
      </button>
      <p className="text-xs text-ink/70">{t('fleet.days.footnote')}</p>
    </section>
  );
}
