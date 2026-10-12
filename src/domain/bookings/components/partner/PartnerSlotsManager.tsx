import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { usePartnerSlots } from '../../hooks/usePartnerSlots';
import type { CreateSlotsPayload, PartnerSlot } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import {
  addDays,
  formatDayLabel,
  formatSlotTime,
  fortalezaDateKey,
  startOfFortalezaWeek,
} from '../../utils/dates';
import { BUTTON_SECONDARY, ListEmpty, ListError, ListLoading } from '../shared/ListState';
import { SlotCreationForm } from './SlotCreationForm';

function groupByDay(slots: PartnerSlot[]): Array<[string, PartnerSlot[]]> {
  const groups = new Map<string, PartnerSlot[]>();
  for (const slot of slots) {
    const key = fortalezaDateKey(slot.startsAt);
    groups.set(key, [...(groups.get(key) ?? []), slot]);
  }
  return [...groups.entries()];
}

export function PartnerSlotsManager({ offerId }: { offerId: string }) {
  const { t, i18n } = useTranslation();
  const [weekStart, setWeekStart] = useState(() => startOfFortalezaWeek(new Date()));
  const { data, loading, error, reload, create, cancel } = usePartnerSlots(offerId, weekStart);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const days = useMemo(() => groupByDay(data), [data]);

  const handleCreate = async (payload: CreateSlotsPayload) => {
    try {
      const created = await create(payload);
      setNotice(t('bookings.slots.created', { count: created.length }));
    } catch (err: unknown) {
      setNotice(getBookingErrorMessage(err));
    }
  };

  const requestCancel = (slot: PartnerSlot) =>
    setConfirm({
      message: t('bookings.slots.confirmCancelSlot'),
      onCancel: () => setConfirm(null),
      onConfirm: async () => {
        setConfirm(null);
        try {
          const result = await cancel(slot.id);
          setNotice(t('bookings.slots.canceled', { count: result.canceledBookings }));
        } catch (err: unknown) {
          setNotice(getBookingErrorMessage(err));
        }
      },
    });

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
        <p className="text-sm font-semibold text-white">
          {formatDayLabel(weekStart.toISOString(), i18n.language)} –{' '}
          {formatDayLabel(addDays(weekStart, 6).toISOString(), i18n.language)}
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
      {notice && (
        <p role="status" className="text-xs text-teal-200">
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
            <h4 className="text-xs font-bold uppercase tracking-wide text-white/70">
              {formatDayLabel(slots[0]!.startsAt, i18n.language)}
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
                    className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">
                        {formatSlotTime(slot.startsAt, i18n.language)}
                      </p>
                      <p className="text-xs text-white/60">
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
                      <button
                        type="button"
                        onClick={() => requestCancel(slot)}
                        className={BUTTON_SECONDARY}
                      >
                        {t('bookings.slots.cancelSlot')}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      <SlotCreationForm onCreate={handleCreate} />
      <ConfirmDialog data={confirm} />
    </section>
  );
}
