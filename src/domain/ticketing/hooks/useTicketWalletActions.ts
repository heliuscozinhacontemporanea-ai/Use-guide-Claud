import QRCode from 'qrcode';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createTicketOrderPaymentIntentUseCase } from '../application/usecases/createTicketOrderPaymentIntentUseCase';
import type { Ticket, TicketOrder } from '../types/ticketing';
import type { useUserTicketsAndOrders } from './useUserTickets';

type WalletData = ReturnType<typeof useUserTicketsAndOrders>;

export interface WalletFeedback {
  type: 'success' | 'error';
  message: string;
}

export interface ResumingOrder {
  order: TicketOrder;
  clientSecret: string;
  paymentIntentId: string;
}

/** Ações da carteira: QR assinado, transferência, reembolso e retomada do pagamento. */
export function useTicketWalletActions(wallet: WalletData) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<WalletFeedback | null>(null);
  const [qrPreview, setQrPreview] = useState<{ ticketId: string; dataUrl: string } | null>(null);
  const [resumingOrder, setResumingOrder] = useState<ResumingOrder | null>(null);
  const [transferTicket, setTransferTicket] = useState<Ticket | null>(null);

  const run = async (action: () => Promise<void>, fallbackKey: string) => {
    setBusy(true);
    setFeedback(null);
    try {
      await action();
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : t(fallbackKey) });
    } finally {
      setBusy(false);
    }
  };

  const previewQr = async (ticketId: string, rawQrToken: string) => {
    const dataUrl = await QRCode.toDataURL(rawQrToken, { width: 240, margin: 1 });
    setQrPreview({ ticketId, dataUrl });
  };

  const showQr = (ticket: Ticket) =>
    run(async () => {
      const { rawQrToken } = await wallet.getSignedQrToken(ticket.id);
      await previewQr(ticket.id, rawQrToken);
    }, 'ticketWallet.errors.qr');

  const reissueQr = (ticket: Ticket) =>
    run(async () => {
      const { rawQrToken } = await wallet.reissueSignedQrToken(ticket.id);
      await previewQr(ticket.id, rawQrToken);
      setFeedback({ type: 'success', message: t('ticketWallet.feedback.qrReissued') });
    }, 'ticketWallet.errors.qrReissue');

  const submitTransfer = (recipient: { email: string; name?: string }) =>
    run(async () => {
      if (!transferTicket) return;
      await wallet.transferTicket(transferTicket.id, recipient.email, recipient.name);
      setTransferTicket(null);
      setFeedback({ type: 'success', message: t('ticketWallet.feedback.transferred') });
    }, 'ticketWallet.errors.transfer');

  const requestRefund = (order: TicketOrder) =>
    run(async () => {
      await wallet.requestRefund(order.id, 'buyer_wallet');
      setFeedback({ type: 'success', message: t('ticketWallet.feedback.refundRequested') });
    }, 'ticketWallet.errors.refund');

  const resumePayment = (order: TicketOrder) =>
    run(async () => {
      const intent = await createTicketOrderPaymentIntentUseCase(order.id, {
        idempotencyKey: `resume_${order.id}_${crypto.randomUUID()}`,
      });
      if (intent.orderStatus === 'paid' || intent.status === 'succeeded') {
        await wallet.reload();
        setFeedback({ type: 'success', message: t('ticketWallet.feedback.alreadyPaid') });
        return;
      }
      setResumingOrder({
        order,
        clientSecret: intent.clientSecret,
        paymentIntentId: intent.paymentIntentId,
      });
    }, 'ticketWallet.errors.resume');

  return {
    busy,
    feedback,
    setFeedback,
    qrPreview,
    showQr,
    reissueQr,
    transferTicket,
    setTransferTicket,
    submitTransfer,
    requestRefund,
    resumingOrder,
    setResumingOrder,
    resumePayment,
  };
}

export type TicketWalletActions = ReturnType<typeof useTicketWalletActions>;
