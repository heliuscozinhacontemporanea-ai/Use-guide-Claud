import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import {
  PurchaseReceiptSheet,
  type ReceiptLine,
} from '../../../../ui/components/purchases/PurchaseReceiptSheet';
import { TextButton } from '../../../../ui/components/TextButton';
import { BOOKING_CODE_LENGTH, type BookingPurchasesSource } from '../../hooks/useBookingPurchases';
import type { BookingSummary } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { formatSlotDateTime } from '../../utils/dates';
import { formatMinor } from '../../utils/money';
import { previewRefund } from '../../utils/refundPreview';

/** Venda que o comprador pode reclamar; o formato é o de `ClaimableSale` do payment. */
export interface BookingClaimSale {
  referenceType: 'booking';
  referenceId: string;
  serviceStartsAt: string;
  serviceEndsAt: string;
}

// Mesmos estados que o backend aceita para reclamar; `no_show` permite contestar a falta.
const CLAIMABLE = new Set(['confirmed', 'completed', 'no_show']);
const PAID = new Set(['confirmed', 'completed', 'no_show', 'disputed']);

function endsAtOf(booking: BookingSummary): string {
  return new Date(
    new Date(booking.offer.startsAt).getTime() + (booking.offer.durationMinutes ?? 0) * 60_000
  ).toISOString();
}

function claimSaleOf(booking: BookingSummary): BookingClaimSale | null {
  if (!CLAIMABLE.has(booking.status)) return null;
  return {
    referenceType: 'booking',
    referenceId: booking.id,
    serviceStartsAt: booking.offer.startsAt,
    serviceEndsAt: endsAtOf(booking),
  };
}

interface BookingPurchaseDetailsProps {
  source: BookingPurchasesSource;
  bookingId: string | null;
  onClose: () => void;
  onViewBooking: () => void;
  onNotice: (message: string) => void;
  /** Slot da composição para "Relatar problema" (D16, 2A). */
  renderClaimAction?: (sale: BookingClaimSale) => ReactNode;
}

/**
 * Folha de uma reserva em Compras: recibo, Ver reserva e, conforme o momento, cancelar ou relatar.
 * O valor do reembolso só aparece na confirmação, depois de tocar em cancelar.
 */
export function BookingPurchaseDetails({
  source,
  bookingId,
  onClose,
  onViewBooking,
  onNotice,
  renderClaimAction,
}: BookingPurchaseDetailsProps) {
  const { t, i18n } = useTranslation();
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const booking = source.data.find((candidate) => candidate.id === bookingId) ?? null;
  const now = new Date();
  const money = (minor: number) => formatMinor(minor, i18n.language);
  const family = (kind: string) => (kind === 'transfer' ? 'transfer' : 'booking');

  const askCancel = (target: BookingSummary) => {
    // Só para mostrar antes de confirmar; o valor devolvido é decidido pelo backend.
    const preview = previewRefund(target, now);
    if (preview.reason === 'none' || !preview.until) return;
    const date = formatBusinessDateTime(preview.until, i18n.language);
    const policyTitle = t(
      `salesPolicy.policies.${family(target.kind)}.${target.offer.cancellationPolicy}.title`
    );
    setConfirm({
      title: t('purchases.confirm.title'),
      highlight: {
        label: t('purchases.confirm.refundLabel'),
        value: money(preview.refundAmountMinor),
      },
      message:
        preview.reason === 'policy'
          ? t('purchases.confirm.policy', {
              policy: policyTitle,
              percent: preview.refundPercent,
              date,
            })
          : t(`purchases.confirm.${preview.reason}`, { date }),
      note: t('purchases.confirm.note'),
      confirmLabel: t('purchases.confirm.confirm'),
      cancelLabel: t('purchases.confirm.keep'),
      onCancel: () => setConfirm(null),
      onConfirm: async () => {
        setConfirm(null);
        onClose();
        try {
          await source.cancel(target.id);
          onNotice(t('purchases.feedback.canceled'));
          await source.reload();
        } catch (err: unknown) {
          onNotice(getBookingErrorMessage(err));
        }
      },
    });
  };

  let sheet: ReactNode = null;
  if (booking) {
    const upcoming = new Date(booking.offer.startsAt).getTime() > now.getTime();
    const refund = booking.cancellation?.refundAmountMinor ?? 0;
    const lines: ReceiptLine[] = [
      {
        label: t('purchases.receipt.participants', { count: booking.participantsCount }),
        value: money(booking.totalMinor),
      },
      { label: t('purchases.receipt.total'), value: money(booking.totalMinor), emphasis: 'total' },
    ];
    if (refund > 0) {
      lines.push(
        { label: t('purchases.receipt.refund'), value: `− ${money(refund)}`, emphasis: 'credit' },
        {
          label: t('purchases.receipt.finalAmount'),
          value: money(booking.totalMinor - refund),
          emphasis: 'strong',
        }
      );
    }
    const policyKey = `salesPolicy.policies.${family(booking.kind)}.${booking.offer.cancellationPolicy}`;
    let footer: ReactNode = null;
    if (booking.status === 'confirmed' && upcoming) {
      footer =
        previewRefund(booking, now).refundAmountMinor > 0 ? (
          <div className="flex justify-center">
            <TextButton tone="danger" onClick={() => askCancel(booking)}>
              {t('purchases.receipt.cancel')}
            </TextButton>
          </div>
        ) : (
          <p className="text-[13px] text-ink/70 text-center">
            {t('purchases.receipt.cancelEndedBooking')}
          </p>
        );
    } else if (!upcoming) {
      const sale = renderClaimAction ? claimSaleOf(booking) : null;
      footer = sale ? renderClaimAction?.(sale) : null;
    }

    sheet = (
      <PurchaseReceiptSheet
        open
        onClose={onClose}
        title={booking.offer.title}
        code={booking.id.slice(0, BOOKING_CODE_LENGTH)}
        purchasedAt={booking.createdAt}
        serviceLine={[
          booking.offer.meetingPoint,
          formatSlotDateTime(booking.offer.startsAt, i18n.language),
        ]
          .filter(Boolean)
          .join(' · ')}
        lines={lines}
        policy={t('purchases.receipt.policy', {
          title: t(`${policyKey}.title`),
          description: t(`${policyKey}.description`),
        })}
        primaryAction={
          PAID.has(booking.status)
            ? { label: t('purchases.receipt.viewBooking'), onClick: onViewBooking }
            : undefined
        }
        footer={footer}
      />
    );
  }

  return (
    <>
      {sheet}
      <ConfirmDialog data={confirm} />
    </>
  );
}
