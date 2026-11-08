import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type PlaceTime, placeTimeFormNote } from '../../../../shared/utils/placeTime';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { usePartnerSlots } from '../../hooks/usePartnerSlots';
import type { CreateSlotsPayload, OfferKind, PartnerSlot } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import {
  addDays,
  formatDayLabel,
  formatSlotTime,
  placeDateKey,
  startOfPlaceWeek,
} from '../../utils/dates';
import { SlotCancelDialog } from './SlotCancelDialog';
import { SlotCheckInSheet } from './SlotCheckInSheet';
import { SlotCreationForm } from './SlotCreationForm';
import { SlotRescheduleDialog } from './SlotRescheduleDialog';

function groupByDay(slots: PartnerSlot[], timeZone?: string): Array<[string, PartnerSlot[]]> {
  const groups = new Map<string, PartnerSlot[]>();
  for (const slot of slots) {
    const key = placeDateKey(slot.startsAt, timeZone);
    groups.set(key, [...(groups.get(key) ?? []), slot]);
  }
  return [...groups.entries()];
}

export function PartnerSlotsManager({
  offerId,
  kind = 'tour',
  place,
}: {
  offerId: string;
  kind?: OfferKind;
  /** Fuso e cidade da oferta: os horários são digitados e mostrados na hora do lugar (D28). */
  place?: PlaceTime;
}) {
  const { t, i18n } = useTranslation();
  const tz = place?.timeZone;
  const [weekStart, setWeekStart] = useState(() => startOfPlaceWeek(new Date(), tz));
  const { data, loading, error, reload, create, cancel, reschedule } = usePartnerSlots(
    offerId,
    weekStart
  );
  const [canceling, setCanceling] = useState<PartnerSlot | null>(null);
  const [rescheduling, setRescheduling] = useState<PartnerSlot | null>(null);
  const [checkingIn, setCheckingIn] = useState<PartnerSlot | null>(null);
  const today = placeDateKey(new Date().toISOString(), tz);
  const zoneNote = placeTimeFormNote(t, place);
  const [notice, setNotice] = useState<string | null>(null);
  const days = useMemo(() => groupByDay(data, tz), [data, tz]);

  const handleCreate = async (payload: CreateSlotsPayload) => {
    try {
      const created = await create(payload);
      setNotice(t('bookings.slots.created', { count: created.length }));
    } catch (err: unknown) {
      setNotice(getBookingErrorMessage(err));
    }
  };

  const confirmCancel = async (slot: PartnerSlot) => {
    setCanceling(null);
    try {
      const result = await cancel(slot.id);
      setNotice(t('bookings.slots.canceled', { count: result.canceledBookings }));
    } catch (err: unknown) {
      setNotice(getBookingErrorMessage(err));
    }
  };

  const submitReschedule = async (
    slot: PartnerSlot,
    change: { startsAt: string; reason: string }
  ) => {
    const result = await reschedule(slot.id, change);
    setRescheduling(null);
    setNotice(t('bookings.slots.rescheduled', { count: result.rescheduledBookings }));
  };

  return (
    <section className="space-y-4" aria-label={t('bookings.slots.title')}>
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
      {notice && (
        <p role="status" className="text-xs text-accent">
          {notice}
        </p>
      )}
      {loading && <ListLoading label={t('bookings.partner.loading')} />}
      {!loading && error && <ListError message={error} onRetry={() => void reload()} />}
      {!loading && !error && days.length === 0 && (
        <ListEmpty message={t('bookings.slots.emptyWeek')} />
      )}
      {!loading &&
        !error &&
        days.map(([day, slots]) => (
          <div key={day} className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wide text-ink/70">
              {formatDayLabel(slots[0]!.startsAt, i18n.language, tz)}
            </h4>
            <ul className="space-y-2">
              {slots.map((slot) => {
                const free = Math.max(
                  0,
                  slot.capacityTotal - slot.capacityReserved - slot.capacitySold
                );
                return (
                  <li
                    key={slot.id}
                    className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-surface border border-line"
                  >
                    <div>
                      <p className="text-sm font-bold text-ink">
                        {formatSlotTime(slot.startsAt, i18n.language, tz)}
                      </p>
                      <p className="text-xs text-ink/70">
                        {slot.status === 'open'
                          ? t('bookings.slots.capacity', {
                              sold: slot.capacitySold,
                              reserved: slot.capacityReserved,
                              free,
                            })
                          : t(
                              slot.status === 'canceled'
                                ? 'bookings.slots.statusCanceled'
                                : 'bookings.slots.statusClosed'
                            )}
                      </p>
                    </div>
                    {slot.status === 'open' && (
                      <div className="flex flex-wrap gap-2">
                        {/* Check-in só no dia do horário (D20). */}
                        {placeDateKey(slot.startsAt, tz) === today && slot.capacitySold > 0 && (
                          <button
                            type="button"
                            onClick={() => setCheckingIn(slot)}
                            className={BUTTON_SECONDARY}
                          >
                            {t(
                              kind === 'private_entry'
                                ? 'serviceProof.partner.entry'
                                : 'serviceProof.partner.checkIn'
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setRescheduling(slot)}
                          className={BUTTON_SECONDARY}
                        >
                          {t('bookings.slots.reschedule')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCanceling(slot)}
                          className={BUTTON_SECONDARY}
                        >
                          {t('bookings.slots.cancelSlot')}
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      {checkingIn && (
        <SlotCheckInSheet
          offerId={offerId}
          kind={kind}
          slot={checkingIn}
          timeZone={tz}
          onClose={() => setCheckingIn(null)}
        />
      )}
      <SlotCreationForm onCreate={handleCreate} timeZone={tz} />
      <SlotCancelDialog
        slot={canceling}
        timeZone={tz}
        onClose={() => setCanceling(null)}
        onConfirm={(slot) => void confirmCancel(slot)}
        onReschedule={(slot) => {
          setCanceling(null);
          setRescheduling(slot);
        }}
      />
      {/* A chave recria o formulário vazio para cada horário. */}
      <SlotRescheduleDialog
        key={rescheduling?.id ?? 'none'}
        slot={rescheduling}
        place={place}
        onClose={() => setRescheduling(null)}
        onSubmit={submitReschedule}
      />
    </section>
  );
}
