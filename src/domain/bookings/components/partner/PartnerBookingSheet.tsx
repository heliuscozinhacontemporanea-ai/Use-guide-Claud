import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import type { PartnerSlotDetail } from '../../types/bookings';
import { bookingReference } from '../../utils/bookingReference';
import { formatMinor } from '../../utils/money';
import { BookingWhatsAppButton } from '../BookingWhatsAppButton';

type SlotBooking = PartnerSlotDetail['bookings'][number];

/**
 * Ficha da reserva no painel (print aprovado em 2026-11-10): quem, quantas pessoas, número, situação,
 * valor pago e o WhatsApp do cliente com mensagem pronta (C2/B37), sem o número na tela.
 */
export function PartnerBookingSheet({
  booking,
  offerTitle,
  when,
  canContact,
  onClose,
}: {
  booking: SlotBooking | null;
  offerTitle: string;
  when: string;
  canContact: boolean;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [contactError, setContactError] = useState<string | null>(null);
  if (!booking) return null;
  const name = booking.buyerName ?? t('bookings.slotSheet.noName');
  const units = t(
    booking.sellingUnit === 'group'
      ? 'serviceProof.units.groups'
      : 'bookings.bookingsList.participants',
    { count: booking.units }
  );
  const code = bookingReference(booking.id);
  const rows: Array<[string, string]> = [
    [t('bookings.contact.bookingRef'), code],
    [t('bookings.contact.situation'), t(`bookings.bookingStatus.${booking.status}`)],
    [t('bookings.contact.paid'), formatMinor(booking.totalMinor, i18n.language)],
  ];

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`${name} · ${units}`}
      description={`${offerTitle} · ${when}`}
    >
      <div className="space-y-3">
        <dl className="rounded-2xl bg-sheet-card border border-sheet-card-line px-4 divide-y divide-line">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 py-3 text-[15px]">
              <dt className="text-ink/70">{label}</dt>
              <dd className="text-ink font-medium text-right">{value}</dd>
            </div>
          ))}
        </dl>
        {canContact && booking.status === 'confirmed' && (
          <>
            <BookingWhatsAppButton
              bookingId={booking.id}
              label={t('bookings.contact.buyerButton')}
              message={
                booking.buyerName
                  ? t('bookings.contact.toBuyer', {
                      name: booking.buyerName,
                      title: offerTitle,
                      code,
                      when,
                    })
                  : t('bookings.contact.toBuyerNoName', { title: offerTitle, code, when })
              }
              onError={setContactError}
            />
            <p className="px-1 text-[13px] text-ink/70">{t('bookings.contact.buyerHint')}</p>
          </>
        )}
        {contactError && <StatusText tone="warn">{contactError}</StatusText>}
      </div>
    </Dialog>
  );
}
