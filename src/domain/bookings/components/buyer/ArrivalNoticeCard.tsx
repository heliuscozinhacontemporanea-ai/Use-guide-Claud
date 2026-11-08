import { Ticket } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { BUTTON_DANGER, BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { respondToArrivalUseCase } from '../../application/usecases/respondToArrivalUseCase';
import type { ArrivalResponse, BookingSummary } from '../../types/bookings';
import { placeTimeSuffix } from '../../../../shared/utils/placeTime';
import { formatSlotDateTime } from '../../utils/dates';
import { BookingCheckInPass } from './BookingCheckInPass';

/**
 * Aviso "chegou" no topo de Minhas reservas (p45, D27): "Seu código" abre o código e as respostas
 * aparecem no cartão do parceiro. "Não vou mais" confirma numa folha que diz que é ausência (p46).
 */
export function ArrivalNoticeCard({
  booking,
  onChanged,
}: {
  booking: BookingSummary;
  onChanged: () => Promise<void> | void;
}) {
  const { t, i18n } = useTranslation();
  const [showCode, setShowCode] = useState(false);
  const [asking, setAsking] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const business = booking.businessName;
  const coming = booking.arrivalResponse?.response === 'coming';
  const started = Date.now() >= new Date(booking.offer.startsAt).getTime();

  const respond = async (response: ArrivalResponse) => {
    setSending(true);
    setError(false);
    try {
      await respondToArrivalUseCase(booking.id, response);
      setAsking(false);
      await onChanged();
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      aria-labelledby={`arrival-${booking.id}`}
      className="p-4 rounded-[20px] bg-surface border border-line space-y-4"
    >
      <div className="space-y-2">
        <h3 id={`arrival-${booking.id}`} className="text-[17px] font-semibold text-ink">
          {business ? t('arrivalNotice.title', { business }) : t('arrivalNotice.titleFallback')}
        </h3>
        <p className="text-[15px] text-ink/70">{t('arrivalNotice.message')}</p>
      </div>
      <button
        type="button"
        onClick={() => setShowCode(true)}
        className="press min-h-11 px-4 rounded-2xl bg-accent-soft text-accent text-[15px] font-semibold inline-flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        <Ticket size={18} aria-hidden="true" />
        {t('arrivalNotice.yourCode')}
      </button>
      {coming ? <StatusText tone="info">{t('arrivalNotice.comingSent')}</StatusText> : null}
      <div className="grid grid-cols-2 gap-3">
        {!coming && (
          <button
            type="button"
            disabled={sending}
            onClick={() => void respond('coming')}
            className={BUTTON_PRIMARY}
          >
            {t('arrivalNotice.coming')}
          </button>
        )}
        <button
          type="button"
          disabled={sending}
          onClick={() => setAsking(true)}
          className={`${BUTTON_SECONDARY} ${coming ? 'col-span-2' : ''}`}
        >
          {t('arrivalNotice.notGoing')}
        </button>
      </div>
      {error && !asking && <StatusText tone="danger">{t('arrivalNotice.error')}</StatusText>}

      <Dialog
        open={showCode}
        onOpenChange={setShowCode}
        title={t('arrivalNotice.yourCode')}
        description={booking.offer.title}
      >
        <BookingCheckInPass booking={booking} />
      </Dialog>
      <Dialog
        open={asking}
        onOpenChange={(open) => !open && setAsking(false)}
        title={t('arrivalNotice.sheetTitle')}
        description={t('arrivalNotice.sheetDescription', {
          title: booking.offer.title,
          when: `${formatSlotDateTime(booking.offer.startsAt, i18n.language, booking.offer.timeZone ?? undefined)}${placeTimeSuffix(t, { timeZone: booking.offer.timeZone ?? undefined, city: booking.offer.city ?? undefined }, booking.offer.startsAt)}`,
        })}
      >
        <div className="space-y-4">
          <p className="text-[15px] text-ink/80">
            {t(
              started ? 'arrivalNotice.sheetMessageStarted' : 'arrivalNotice.sheetMessageArrived',
              {
                business: business ?? t('serviceProof.buyer.businessFallback'),
              }
            )}
          </p>
          {error && <StatusText tone="danger">{t('arrivalNotice.error')}</StatusText>}
          <button
            type="button"
            disabled={sending}
            onClick={() => void respond('not_going')}
            className={`${BUTTON_DANGER} w-full`}
          >
            {t('arrivalNotice.sheetConfirm')}
          </button>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setAsking(false)}
              className="press min-h-11 px-3 rounded-xl text-[15px] font-semibold text-ink/80 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              {t('arrivalNotice.back')}
            </button>
          </div>
        </div>
      </Dialog>
    </section>
  );
}
