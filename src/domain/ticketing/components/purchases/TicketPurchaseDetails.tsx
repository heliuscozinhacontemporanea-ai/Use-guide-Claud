import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatBusinessDate,
  formatBusinessDateTime,
} from '../../../../shared/utils/businessDateTime';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import {
  PurchaseReceiptSheet,
  type ReceiptLine,
} from '../../../../ui/components/purchases/PurchaseReceiptSheet';
import { TextButton } from '../../../../ui/components/TextButton';
import { ORDER_CODE_LENGTH, type TicketPurchasesSource } from '../../hooks/useTicketPurchases';
import type { TicketOrder } from '../../types/ticketing';
import { isOrderPayable } from '../../utils/ticketPurchaseSection';
import { canRequestRefund, previewOrderRefund } from '../../utils/ticketWalletRules';
import { ResumePaymentCard } from '../wallet/ResumePaymentCard';

/** Venda que o comprador pode reclamar; o formato é o de `ClaimableSale` do payment. */
export interface TicketOrderClaimSale {
  referenceType: 'ticket_order';
  referenceId: string;
  serviceStartsAt: string;
  serviceEndsAt: string;
}

const PAID = new Set<TicketOrder['status']>(['paid', 'partially_refunded', 'disputed']);

function claimSaleOf(order: TicketOrder): TicketOrderClaimSale | null {
  if (!order.eventSnapshot) return null;
  if (order.status !== 'paid' && order.status !== 'partially_refunded') return null;
  return {
    referenceType: 'ticket_order',
    referenceId: order.id,
    serviceStartsAt: order.eventSnapshot.startsAt,
    serviceEndsAt: order.eventSnapshot.endsAt || order.eventSnapshot.startsAt,
  };
}

interface TicketPurchaseDetailsProps {
  source: TicketPurchasesSource;
  orderId: string | null;
  onClose: () => void;
  onViewTickets: () => void;
  /** Slot da composição para "Relatar problema" (D16, 2A). */
  renderClaimAction?: (sale: TicketOrderClaimSale) => ReactNode;
}

/**
 * Folha de um pedido de ingresso em Compras: recibo, Ver ingressos e, conforme o momento, pagar,
 * cancelar ou relatar. O valor do reembolso só aparece na confirmação, depois de tocar em cancelar.
 */
export function TicketPurchaseDetails({
  source,
  orderId,
  onClose,
  onViewTickets,
  renderClaimAction,
}: TicketPurchaseDetailsProps) {
  const { t, i18n } = useTranslation();
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const { actions, orders, tickets } = source;
  const order = orders.find((candidate) => candidate.id === orderId) ?? null;
  const now = new Date();
  const money = (minor: number) => formatMoneyMinor(minor, i18n.language);

  const askCancel = (target: TicketOrder) => {
    // Só para mostrar antes de confirmar; o valor devolvido é decidido pelo backend.
    const refund = previewOrderRefund(target, now);
    if (!refund || refund.reason === 'none' || !refund.until) return;
    const date = formatBusinessDateTime(refund.until, i18n.language);
    const policyTitle = t(
      `salesPolicy.policies.event.${target.salesPolicySnapshot.cancellationPolicy}.title`
    );
    const message =
      refund.reason === 'policy'
        ? t(
            (target.serviceFeeMinor ?? 0) > 0
              ? 'purchases.confirm.policyKeepsFee'
              : 'purchases.confirm.policy',
            { policy: policyTitle, percent: refund.percent, date }
          )
        : t(
            `purchases.confirm.${refund.reason}${refund.serviceFeeRefundMinor > 0 ? 'WithFee' : ''}`,
            { date }
          );
    setConfirm({
      title: t('purchases.confirm.title'),
      highlight: {
        label: t('purchases.confirm.refundLabel'),
        value: money(refund.refundMinor + refund.serviceFeeRefundMinor),
      },
      message,
      note: t('purchases.confirm.note'),
      confirmLabel: t('purchases.confirm.confirm'),
      cancelLabel: t('purchases.confirm.keep'),
      onCancel: () => setConfirm(null),
      onConfirm: () => {
        setConfirm(null);
        onClose();
        void actions.requestRefund(target);
      },
    });
  };

  let sheet: ReactNode = null;
  if (order) {
    const event = order.eventSnapshot;
    const ticketCount = tickets.filter((ticket) => ticket.orderId === order.id).length;
    const upcoming = event ? new Date(event.startsAt).getTime() > now.getTime() : false;
    const lines: ReceiptLine[] = [
      {
        label:
          ticketCount > 0
            ? t('purchases.receipt.tickets', { count: ticketCount })
            : t('ticketWallet.title'),
        value: money(order.subtotalMinor),
      },
    ];
    if (order.discountMinor > 0) {
      lines.push({
        label: t('purchases.receipt.discount'),
        value: `− ${money(order.discountMinor)}`,
      });
    }
    if ((order.serviceFeeMinor ?? 0) > 0) {
      lines.push({ label: t('purchases.receipt.serviceFee'), value: money(order.serviceFeeMinor) });
    }
    lines.push({
      label: t('purchases.receipt.total'),
      value: money(order.totalMinor),
      emphasis: 'total',
    });

    const policy = order.salesPolicySnapshot?.cancellationPolicy;
    const payable = isOrderPayable(order, now);
    let footer: ReactNode = null;
    if (PAID.has(order.status) && upcoming) {
      footer = canRequestRefund(order, tickets, now) ? (
        <div className="flex justify-center">
          <TextButton tone="danger" disabled={actions.busy} onClick={() => askCancel(order)}>
            {t('purchases.receipt.cancel')}
          </TextButton>
        </div>
      ) : (
        <p className="text-[13px] text-ink/70 text-center">
          {t('purchases.receipt.cancelEndedTickets')}
        </p>
      );
    } else if (!upcoming) {
      const sale = renderClaimAction ? claimSaleOf(order) : null;
      footer = sale ? renderClaimAction?.(sale) : null;
    }

    sheet = (
      <PurchaseReceiptSheet
        open
        onClose={onClose}
        title={
          event?.title ?? t('ticketWallet.order', { id: order.id.slice(0, ORDER_CODE_LENGTH) })
        }
        code={order.id.slice(0, ORDER_CODE_LENGTH)}
        purchasedAt={order.createdAt}
        serviceLine={
          event
            ? [
                event.locationName,
                formatBusinessDate(event.startsAt, i18n.language, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              ]
                .filter(Boolean)
                .join(' · ')
            : ''
        }
        lines={lines}
        policy={
          policy
            ? t('purchases.receipt.policy', {
                title: t(`salesPolicy.policies.event.${policy}.title`),
                description: t(`salesPolicy.policies.event.${policy}.description`),
              })
            : undefined
        }
        primaryAction={
          payable
            ? {
                label: t('purchases.pay'),
                onClick: () => {
                  onClose();
                  void actions.resumePayment(order);
                },
              }
            : PAID.has(order.status) && ticketCount > 0
              ? { label: t('purchases.receipt.viewTickets'), onClick: onViewTickets }
              : undefined
        }
        footer={footer}
      />
    );
  }

  return (
    <>
      {actions.resumingOrder && (
        <ResumePaymentCard
          resuming={actions.resumingOrder}
          onClose={() => actions.setResumingOrder(null)}
          onError={(message) => actions.setFeedback({ type: 'error', message })}
          onPaid={async () => {
            actions.setResumingOrder(null);
            await source.reload();
            actions.setFeedback({ type: 'success', message: t('ticketWallet.feedback.paid') });
          }}
        />
      )}
      {sheet}
      <ConfirmDialog data={confirm} />
    </>
  );
}
