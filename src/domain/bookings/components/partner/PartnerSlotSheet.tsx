import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { capitalizeFirst } from '../../../../shared/utils/formatters';
import { Dialog } from '../../../../ui/components/Dialog';
import { ListError, ListLoading } from '../../../../ui/components/ListState';
import { StatusText } from '../../../../ui/components/StatusText';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import { cancelSlotUseCase } from '../../application/usecases/cancelSlotUseCase';
import { getPartnerSlotDetailUseCase } from '../../application/usecases/getPartnerSlotDetailUseCase';
import { rescheduleSlotUseCase } from '../../application/usecases/rescheduleSlotUseCase';
import type { PartnerSlot, PartnerSlotDetail } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { bookingReference } from '../../utils/bookingReference';
import { BookingWhatsAppButton } from '../BookingWhatsAppButton';
import { SlotCancelDialog } from './SlotCancelDialog';
import { SlotCheckInSheet } from './SlotCheckInSheet';
import { SlotRescheduleDialog } from './SlotRescheduleDialog';

const BLOCK = 'rounded-2xl bg-sheet-card border border-sheet-card-line';

/**
 * Folha do horário de reserva no painel (p06): números, reservas com o nome público do cliente e
 * as ações que já existem (código, remarcar, cancelar).
 */
export function PartnerSlotSheet({
  offerId,
  slotId,
  startAtCheckIn = false,
  onClose,
  onChanged,
}: {
  offerId: string;
  slotId: string;
  /** Aberta pelo cartão de portaria de "Agora" (D27): começa na portaria da entrada. */
  startAtCheckIn?: boolean;
  onClose: () => void;
  /** Depois de check-in, remarcação ou cancelamento, para a agenda recarregar. */
  onChanged: (message?: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const [detail, setDetail] = useState<PartnerSlotDetail | null>(null);
  const [error, setError] = useState(false);
  const [checkingIn, setCheckingIn] = useState(startAtCheckIn);
  const [rescheduling, setRescheduling] = useState<PartnerSlot | null>(null);
  const [canceling, setCanceling] = useState<PartnerSlot | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(false);
    try {
      setDetail(await getPartnerSlotDetailUseCase(offerId, slotId));
    } catch {
      setError(true);
    }
  }, [offerId, slotId]);

  useEffect(() => {
    void load();
  }, [load]);

  const lang = i18n.language;
  const slot = detail?.slot;
  const when = slot
    ? t('bookings.slotSheet.when', {
        date: formatBusinessDate(slot.startsAt, lang, {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
        }),
        time: formatBusinessDate(slot.startsAt, lang, { hour: '2-digit', minute: '2-digit' }),
      })
    : undefined;
  const description = when
    ? capitalizeFirst(
        detail?.offer.meetingPoint
          ? `${when} · ${t('bookings.slotSheet.meetingPoint', { place: detail.offer.meetingPoint })}`
          : when,
        lang
      )
    : undefined;
  const units = detail?.bookings.reduce((sum, booking) => sum + booking.units, 0) ?? 0;
  const arrived = detail?.bookings.reduce((sum, booking) => sum + booking.checkedInUnits, 0) ?? 0;

  return (
    <>
      <Dialog
        open={!checkingIn && !rescheduling && !canceling}
        onOpenChange={(open) => !open && onClose()}
        title={detail?.offer.title ?? t('bookings.slots.title')}
        description={description}
      >
        {error ? (
          <ListError message={t('bookings.slotSheet.error')} onRetry={() => void load()} />
        ) : !detail || !slot ? (
          <ListLoading label={t('bookings.slotSheet.bookings')} />
        ) : (
          <div className="space-y-4">
            <dl className={`${BLOCK} p-4 space-y-2`}>
              {[
                [t('bookings.slotSheet.bookings'), String(detail.bookings.length)],
                [
                  t('bookings.slotSheet.people'),
                  t('bookings.slotSheet.peopleOf', { sold: units, capacity: slot.capacityTotal }),
                ],
                [t('bookings.slotSheet.arrived'), String(arrived)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 text-[14px]">
                  <dt className="text-ink/70">{label}</dt>
                  <dd className="text-ink font-semibold text-right">{value}</dd>
                </div>
              ))}
            </dl>
            {detail.bookings.length > 0 && (
              <ul className={`${BLOCK} divide-y divide-line overflow-hidden`}>
                {detail.bookings.map((booking) => (
                  <li
                    key={booking.id}
                    className="px-4 py-2.5 flex items-center justify-between gap-3 text-[14px]"
                  >
                    <span className="flex-1 min-w-0 text-ink font-semibold truncate">
                      {booking.buyerName ?? t('bookings.slotSheet.noName')} ·{' '}
                      {t('bookings.slotSheet.units', { count: booking.units })}
                    </span>
                    {booking.checkedInUnits > 0 ? (
                      <StatusText tone="success">
                        {t('bookings.slotSheet.statusArrived')}
                      </StatusText>
                    ) : (
                      <StatusText tone="muted">{t('bookings.slotSheet.statusWaiting')}</StatusText>
                    )}
                    {slot.status === 'open' && (
                      <BookingWhatsAppButton
                        iconOnly
                        bookingId={booking.id}
                        label={t('bookings.contact.buyerButton')}
                        ariaLabel={t('bookings.contact.buyerAria', {
                          name: booking.buyerName ?? t('bookings.slotSheet.noName'),
                        })}
                        message={
                          booking.buyerName
                            ? t('bookings.contact.toBuyer', {
                                name: booking.buyerName,
                                title: detail.offer.title,
                                code: bookingReference(booking.id),
                                when,
                              })
                            : t('bookings.contact.toBuyerNoName', {
                                title: detail.offer.title,
                                code: bookingReference(booking.id),
                                when,
                              })
                        }
                        onError={setContactError}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
            {contactError && <StatusText tone="warn">{contactError}</StatusText>}
            {slot.status === 'open' && (
              <>
                <button
                  type="button"
                  onClick={() => setCheckingIn(true)}
                  className={`${BUTTON_PRIMARY} w-full`}
                >
                  {t('bookings.slotSheet.confirmCode')}
                </button>
                <div className="flex justify-center gap-6">
                  <button
                    type="button"
                    onClick={() => setRescheduling(slot)}
                    className="press min-h-11 px-2 rounded-xl text-[14px] font-semibold text-ink/80 focus-visible:ring-2 focus-visible:ring-teal-400/50"
                  >
                    {t('bookings.slotSheet.reschedule')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCanceling(slot)}
                    className="press min-h-11 px-2 rounded-xl text-[14px] font-semibold text-danger focus-visible:ring-2 focus-visible:ring-teal-400/50"
                  >
                    {t('bookings.slotSheet.cancel')}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Dialog>
      {checkingIn && detail && slot && (
        <SlotCheckInSheet
          offerId={offerId}
          kind={detail.offer.kind}
          slot={slot}
          onClose={() => {
            if (startAtCheckIn) return onClose();
            setCheckingIn(false);
            void load();
          }}
          onCheckedIn={() => onChanged()}
        />
      )}
      <SlotRescheduleDialog
        slot={rescheduling}
        onClose={() => setRescheduling(null)}
        onSubmit={async (target, change) => {
          const result = await rescheduleSlotUseCase(offerId, target.id, change);
          setRescheduling(null);
          onChanged(t('bookings.slots.rescheduled', { count: result.rescheduledBookings }));
          onClose();
        }}
      />
      <SlotCancelDialog
        slot={canceling}
        onClose={() => setCanceling(null)}
        onReschedule={(target) => {
          setCanceling(null);
          setRescheduling(target);
        }}
        onConfirm={async (target) => {
          setCanceling(null);
          try {
            const result = await cancelSlotUseCase(offerId, target.id);
            onChanged(t('bookings.slots.canceled', { count: result.canceledBookings }));
          } catch (err: unknown) {
            onChanged(getBookingErrorMessage(err));
          }
          onClose();
        }}
      />
    </>
  );
}
