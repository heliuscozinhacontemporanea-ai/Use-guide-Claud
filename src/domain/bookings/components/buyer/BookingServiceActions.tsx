import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { answerServiceConfirmationUseCase } from '../../application/usecases/answerServiceConfirmationUseCase';
import { reportProviderAbsentUseCase } from '../../application/usecases/reportProviderAbsentUseCase';
import type { BookingSummary } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { canReportProviderAbsent, isConfirmationPending } from '../../utils/serviceProofTiming';

/** Verdadeiro quando a folha da compra mostra uma ação ou um status da prova do serviço (D20). */
export function hasServiceActions(booking: BookingSummary, now: Date): boolean {
  return (
    canReportProviderAbsent(booking, now) ||
    isConfirmationPending(booking, now) ||
    !!booking.providerAbsence
  );
}

/** "O prestador não veio" e "O serviço aconteceu?" na folha da compra (D20). */
export function BookingServiceActions({
  booking,
  onNotice,
  onChanged,
}: {
  booking: BookingSummary;
  onNotice: (message: string) => void;
  onChanged: () => Promise<void> | void;
}) {
  const { t, i18n } = useTranslation();
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [sending, setSending] = useState(false);
  const now = new Date();
  const date = (iso: string) => formatBusinessDateTime(iso, i18n.language);
  const business = booking.businessName || t('serviceProof.buyer.businessFallback');

  const run = async (action: () => Promise<unknown>, success: string) => {
    setSending(true);
    try {
      await action();
      onNotice(success);
      await onChanged();
    } catch (err: unknown) {
      onNotice(getBookingErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const askAbsent = () =>
    setConfirm({
      title: t('serviceProof.buyer.providerAbsentTitle', { business }),
      message: t('serviceProof.buyer.providerAbsentMessage', { business }),
      confirmLabel: t('serviceProof.buyer.providerAbsentConfirm'),
      cancelLabel: t('serviceProof.buyer.keep'),
      tone: 'danger',
      onCancel: () => setConfirm(null),
      onConfirm: () => {
        setConfirm(null);
        void run(
          () => reportProviderAbsentUseCase(booking.id),
          t('serviceProof.buyer.absenceSent', {
            business,
            date: date(new Date(Date.now() + 2 * 3_600_000).toISOString()),
          })
        );
      },
    });

  const askNo = () => {
    // Sem registro do serviço o reembolso é na hora; depois do "Cliente sem código", vai ao admin.
    // A pergunta não fala de dinheiro (D20, textos neutros): só o resultado, depois da resposta.
    const refundNow = booking.checkIns.length === 0;
    setConfirm({
      title: t('serviceProof.buyer.noTitle'),
      message: t('serviceProof.buyer.noMessage'),
      confirmLabel: t('serviceProof.buyer.noConfirm'),
      cancelLabel: t('serviceProof.buyer.keep'),
      tone: 'danger',
      onCancel: () => setConfirm(null),
      onConfirm: () => {
        setConfirm(null);
        void run(
          () => answerServiceConfirmationUseCase(booking.id, 'no'),
          t(refundNow ? 'serviceProof.buyer.refunded' : 'serviceProof.buyer.denied')
        );
      },
    });
  };

  let content = null;
  const absence = booking.providerAbsence;
  if (isConfirmationPending(booking, now) && booking.serviceConfirmation) {
    content = (
      <div className="p-4 rounded-2xl bg-ink/[0.04] space-y-3">
        <div className="space-y-1">
          <p className="text-[15px] font-semibold text-ink">
            {t('serviceProof.buyer.questionTitle')}
          </p>
          <p className="text-[13px] text-ink/70">
            {t('serviceProof.buyer.questionMessage', {
              date: date(booking.serviceConfirmation.answerBy),
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            disabled={sending}
            onClick={() =>
              void run(
                () => answerServiceConfirmationUseCase(booking.id, 'yes'),
                t('serviceProof.buyer.confirmed')
              )
            }
            className={BUTTON_SECONDARY}
          >
            {t('serviceProof.buyer.yes')}
          </button>
          <TextButton tone="danger" disabled={sending} onClick={askNo}>
            {t('serviceProof.buyer.no')}
          </TextButton>
        </div>
      </div>
    );
  } else if (absence) {
    const key =
      absence.resolution === 'refunded'
        ? 'absenceRefunded'
        : absence.resolution === 'withdrawn'
          ? 'absenceWithdrawn'
          : absence.resolution === 'admin'
            ? 'absenceAdmin'
            : 'absenceSent';
    content = (
      <StatusText tone={absence.resolution === 'refunded' ? 'success' : 'warn'}>
        {t(`serviceProof.buyer.${key}`, { business, date: date(absence.respondBy) })}
      </StatusText>
    );
  } else if (canReportProviderAbsent(booking, now)) {
    content = (
      <div className="flex justify-center">
        <TextButton tone="danger" disabled={sending} onClick={askAbsent}>
          {t('serviceProof.buyer.providerAbsent', { business })}
        </TextButton>
      </div>
    );
  }

  return (
    <>
      {content}
      <ConfirmDialog data={confirm} />
    </>
  );
}
