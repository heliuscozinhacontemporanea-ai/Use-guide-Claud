import QRCode from 'qrcode';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createTicketOrderPaymentIntentUseCase } from '../application/usecases/createTicketOrderPaymentIntentUseCase';
import type { Ticket, TicketOrder, TicketQrPass } from '../types/ticketing';
import type { useUserTicketsAndOrders } from './useUserTickets';

type WalletData = ReturnType<typeof useUserTicketsAndOrders>;

export interface WalletFeedback {
  type: 'success' | 'error';
  message: string;
}

/** QR e código de 8 caracteres de um ingresso aberto na carteira (D20). */
export interface TicketQrPreview {
  ticketId: string;
  dataUrl: string;
  code: string | null;
  codeVisibleFrom: string | null;
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
  const [qrPreview, setQrPreview] = useState<TicketQrPreview | null>(null);
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

  // Correção média (M): o QR assinado é longo e precisa continuar legível com o brilho baixo.
  const previewQr = async (pass: TicketQrPass) => {
    const dataUrl = await QRCode.toDataURL(pass.token, {
      errorCorrectionLevel: 'M',
      width: 480,
      margin: 1,
    });
    setQrPreview({
      ticketId: pass.ticketId,
      dataUrl,
      code: pass.code,
      codeVisibleFrom: pass.codeVisibleFrom,
    });
  };

  const showQr = (ticket: Ticket) =>
    run(async () => {
      await previewQr(await wallet.getSignedQrToken(ticket.id));
    }, 'ticketWallet.errors.qr');

  const swapQr = (ticket: Ticket) =>
    run(async () => {
      await previewQr(await wallet.swapSignedQrToken(ticket.id));
      setFeedback({ type: 'success', message: t('ticketWallet.feedback.qrSwapped') });
    }, 'ticketWallet.errors.qrSwap');

  // Erros com código ficam no formulário, que mostra o motivo traduzido junto do @.
  const submitTransfer = async (username: string) => {
    if (!transferTicket) return;
    await wallet.transferTicket(transferTicket.id, username);
    setTransferTicket(null);
    setFeedback({ type: 'success', message: t('username.transfer.done', { username }) });
  };

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
    swapQr,
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
