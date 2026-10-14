import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  QrCode,
  RefreshCw,
  RotateCcw,
  Send,
  Ticket as TicketIcon,
} from 'lucide-react';
import QRCode from 'qrcode';
import { StripePaymentElement } from '../../payment';
import { GlassCard } from '../../../ui/components/GlassCard';
import { confirmTicketOrderPaymentReturnUseCase } from '../application/usecases/confirmTicketOrderPaymentReturnUseCase';
import { createTicketOrderPaymentIntentUseCase } from '../application/usecases/createTicketOrderPaymentIntentUseCase';
import { useUserTicketsAndOrders } from '../hooks/useUserTickets';
import { formatMoneyMinorBrl, type Ticket, type TicketOrder } from '../types/ticketing';

function getTicketStatusLabel(status: Ticket['status']) {
  switch (status) {
    case 'reserved':
      return 'Reservado';
    case 'issued':
      return 'Emitido';
    case 'checked_in':
      return 'Utilizado';
    case 'transferred':
      return 'Transferido';
    case 'refund_pending':
      return 'Reembolso em processamento';
    case 'refunded':
      return 'Reembolsado';
    case 'canceled':
      return 'Cancelado';
    case 'invalidated':
      return 'Inválido';
    case 'expired':
      return 'Expirado';
    default:
      return status;
  }
}

function getOrderStatusLabel(status: TicketOrder['status']) {
  switch (status) {
    case 'pending_payment':
      return 'Pagamento pendente';
    case 'payment_processing':
      return 'Pagamento em processamento';
    case 'paid':
      return 'Pago';
    case 'payment_failed':
      return 'Pagamento recusado';
    case 'expired':
      return 'Expirado';
    case 'refund_pending':
      return 'Reembolso em processamento';
    case 'partially_refunded':
      return 'Reembolsado parcialmente';
    case 'refunded':
      return 'Reembolsado';
    case 'canceled':
      return 'Cancelado';
    case 'disputed':
      return 'Em disputa';
    default:
      return status;
  }
}

interface UserTicketsHistoryViewProps {
  onBack?: () => void;
}

export function UserTicketsHistoryView({ onBack }: UserTicketsHistoryViewProps = {}) {
  const {
    tickets,
    orders,
    loading,
    error,
    reload,
    transferTicket,
    requestRefund,
    getSignedQrToken,
    reissueSignedQrToken,
  } = useUserTicketsAndOrders(true);

  const [activeTab, setActiveTab] = useState<'tickets' | 'orders'>('tickets');
  const [transferModalTicket, setTransferModalTicket] = useState<Ticket | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [qrPreview, setQrPreview] = useState<{
    ticketId: string;
    dataUrl: string;
    rawToken: string;
  } | null>(null);

  const [resumingOrder, setResumingOrder] = useState<{
    order: TicketOrder;
    clientSecret: string;
    paymentIntentId: string;
  } | null>(null);

  const handleShowQr = async (ticket: Ticket) => {
    try {
      setActionLoading(true);
      const { rawQrToken } = await getSignedQrToken(ticket.id);
      const dataUrl = await QRCode.toDataURL(rawQrToken, { width: 240, margin: 1 });
      setQrPreview({ ticketId: ticket.id, dataUrl, rawToken: rawQrToken });
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Não foi possível gerar o QR Code assinado.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReissueQr = async (ticket: Ticket) => {
    try {
      setActionLoading(true);
      const { rawQrToken } = await reissueSignedQrToken(ticket.id);
      const dataUrl = await QRCode.toDataURL(rawQrToken, { width: 240, margin: 1 });
      setQrPreview({ ticketId: ticket.id, dataUrl, rawToken: rawQrToken });
      setFeedback({
        type: 'success',
        message: 'QR Code rotacionado com sucesso. A versão anterior foi invalidada.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err instanceof Error ? err.message : 'Não foi possível reemitir o QR Code.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalTicket || !recipientEmail.trim()) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await transferTicket(
        transferModalTicket.id,
        recipientEmail.trim(),
        recipientName.trim() || undefined
      );
      setFeedback({
        type: 'success',
        message: 'Ingresso transferido com sucesso! Um novo QR foi emitido ao destinatário.',
      });
      setTransferModalTicket(null);
      setRecipientEmail('');
      setRecipientName('');
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Falha ao transferir ingresso.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefundOrder = async (order: TicketOrder) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      await requestRefund(order.id, 'Solicitado pelo comprador na carteira de ingressos');
      setFeedback({
        type: 'success',
        message: 'Solicitação de reembolso integral processada com sucesso.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Não foi possível solicitar reembolso.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumePendingOrder = async (order: TicketOrder) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const pi = await createTicketOrderPaymentIntentUseCase(order.id, {
        idempotencyKey: `resume_${order.id}_${crypto.randomUUID()}`,
      });
      if (pi.orderStatus === 'paid' || pi.status === 'succeeded') {
        await reload();
        setFeedback({
          type: 'success',
          message: 'Seu pagamento já estava confirmado! Ingressos atualizados.',
        });
        return;
      }
      setResumingOrder({
        order,
        clientSecret: pi.clientSecret,
        paymentIntentId: pi.paymentIntentId,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Não foi possível retomar o pagamento deste pedido.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const canTransferTicket = (ticket: Ticket): boolean => {
    if (ticket.status !== 'issued') return false;
    const parentOrder = orders.find((o) => o.id === ticket.orderId);
    const allow = parentOrder?.refundPolicySnapshot?.allowTicketTransfer ?? true;
    if (!allow) return false;
    if (ticket.eventSnapshot?.startsAt) {
      const cutoffHours =
        parentOrder?.refundPolicySnapshot?.ticketTransferCutoffHours ?? 4;
      const hoursLeft =
        (new Date(ticket.eventSnapshot.startsAt).getTime() - Date.now()) /
        (1000 * 60 * 60);
      if (hoursLeft < cutoffHours) return false;
    }
    return true;
  };

  const canRefundOrder = (order: TicketOrder): boolean => {
    if (order.status !== 'paid') return false;
    const allow =
      order.refundPolicySnapshot?.allowBuyerCancellation ??
      order.refundPolicySnapshot?.enabled ??
      false;
    if (!allow) return false;
    const orderTickets = tickets.filter((t) => t.orderId === order.id);
    if (orderTickets.some((t) => t.status === 'checked_in')) return false;
    if (order.eventSnapshot?.startsAt) {
      const windowHours =
        order.refundPolicySnapshot?.buyerCancellationWindowHours ??
        order.refundPolicySnapshot?.cancellationWindowHours ??
        24;
      const hoursLeft =
        (new Date(order.eventSnapshot.startsAt).getTime() - Date.now()) /
        (1000 * 60 * 60);
      if (hoursLeft < windowHours) return false;
    }
    return true;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Voltar"
              className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 focus-visible:ring-2 focus-visible:ring-teal-400/50 cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`min-h-11 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'tickets'
                ? 'bg-teal-400 text-slate-950'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Meus Ingressos ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`min-h-11 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-teal-400 text-slate-950'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Pedidos ({orders.length})
          </button>
        </div>

        <button
          type="button"
          onClick={() => void reload()}
          aria-label="Atualizar ingressos e pedidos"
          className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 focus-visible:ring-2 focus-visible:ring-teal-400/50 cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-teal-400' : ''} />
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-teal-500/10 border-teal-500/30 text-teal-200'
              : 'bg-red-500/10 border-red-500/30 text-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0 text-teal-400" />
          ) : (
            <AlertCircle size={16} className="shrink-0 text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-200">
          {error}
        </div>
      )}

      {loading && tickets.length === 0 && orders.length === 0 ? (
        <div className="p-8 flex items-center justify-center gap-2 text-white/60 text-xs">
          <Loader2 size={18} className="animate-spin text-teal-400" />
          <span>Carregando carteira de ingressos...</span>
        </div>
      ) : activeTab === 'tickets' ? (
        tickets.length === 0 ? (
          <GlassCard className="p-6 text-center space-y-2">
            <TicketIcon size={28} className="mx-auto text-white/50" />
            <p className="text-sm font-bold text-white/80">Nenhum ingresso encontrado</p>
            <p className="text-xs text-white/50">
              Os ingressos e inscrições adquiridos na agenda aparecerão aqui.
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tickets.map((t) => (
              <GlassCard key={t.id} className="p-4 space-y-3 border-white/10">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                      {t.ticketTypeSnapshot?.name || 'Ingresso'}
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {t.eventSnapshot?.title || t.holderName}
                    </h4>
                    <p className="text-xs text-white/60">
                      {t.holderName} • {t.holderEmail}
                    </p>
                    {t.eventSnapshot?.startsAt && (
                      <p className="text-[11px] text-white/50 mt-0.5">
                        Sessão: {new Date(t.eventSnapshot.startsAt).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      t.status === 'issued'
                        ? 'bg-teal-500/20 text-teal-300'
                        : t.status === 'checked_in'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {getTicketStatusLabel(t.status)}
                  </span>
                </div>

                {qrPreview?.ticketId === t.id && (
                  <div className="p-3 rounded-xl bg-white flex flex-col items-center gap-2">
                    <img
                      src={qrPreview.dataUrl}
                      alt={`QR Code ${t.id}`}
                      className="w-40 h-40"
                    />
                    <span className="text-[10px] font-mono text-slate-700">
                      Assinatura RSA-PSS • v{t.qrVersion}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-white/10 flex-wrap">
                  {t.status === 'issued' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => void handleShowQr(t)}
                      className="flex-1 min-h-11 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <QrCode size={14} className="text-teal-400" />
                      <span>Ver QR Assinado</span>
                    </button>
                  )}
                  {t.status === 'issued' && qrPreview?.ticketId === t.id && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => void handleReissueQr(t)}
                      className="min-h-11 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/80 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>Novo QR</span>
                    </button>
                  )}
                  {canTransferTicket(t) && (
                    <button
                      type="button"
                      onClick={() => setTransferModalTicket(t)}
                      className="flex-1 min-h-11 px-3 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-xs font-bold text-teal-300 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send size={14} />
                      <span>Transferir</span>
                    </button>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )
      ) : orders.length === 0 ? (
        <GlassCard className="p-6 text-center space-y-2">
          <p className="text-sm font-bold text-white/80">Nenhum pedido registrado</p>
          <p className="text-xs text-white/50">Você ainda não realizou pedidos de ingressos.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {orders.map((ord) => {
            const isPendingAndActive =
              (ord.status === 'pending_payment' || ord.status === 'payment_failed') &&
              (!ord.expiresAt || new Date(ord.expiresAt).getTime() > Date.now());

            return (
              <GlassCard
                key={ord.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-white/10"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white">
                    Pedido #{ord.id.slice(0, 8)} • {formatMoneyMinorBrl(ord.totalMinor)}
                  </div>
                  <div className="text-[11px] text-white/60">
                    {new Date(ord.createdAt).toLocaleDateString('pt-BR')} • Status:{' '}
                    <span className="font-semibold text-teal-300">
                      {getOrderStatusLabel(ord.status)}
                    </span>
                  </div>
                  {ord.expiresAt && ord.status === 'pending_payment' && (
                    <div className="text-[11px] text-amber-300 flex items-center gap-1">
                      <Clock size={12} />
                      <span>
                        Reserva válida até{' '}
                        {new Date(ord.expiresAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {isPendingAndActive && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => void handleResumePendingOrder(ord)}
                      className="min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Clock size={14} />
                      <span>Continuar Pagamento</span>
                    </button>
                  )}

                  {canRefundOrder(ord) && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => void handleRefundOrder(ord)}
                      className="min-h-11 px-3.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-xs font-bold text-red-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>Solicitar Reembolso</span>
                    </button>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {resumingOrder && (
        <GlassCard className="p-4 space-y-4 border-teal-500/30 bg-slate-900/90">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">
                Concluir Pagamento — Pedido #{resumingOrder.order.id.slice(0, 8)}
              </h4>
              <p className="text-xs text-white/60">
                Valor: {formatMoneyMinorBrl(resumingOrder.order.totalMinor)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setResumingOrder(null)}
              className="min-h-11 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/70 cursor-pointer"
            >
              Fechar
            </button>
          </div>

          <StripePaymentElement
            clientSecret={resumingOrder.clientSecret}
            orderId={resumingOrder.order.id}
            submitLabel={`Pagar ${formatMoneyMinorBrl(resumingOrder.order.totalMinor)}`}
            onError={(msg) => setFeedback({ type: 'error', message: msg })}
            onSuccess={async (piId) => {
              await confirmTicketOrderPaymentReturnUseCase(resumingOrder.order.id, {
                paymentIntentId: piId || resumingOrder.paymentIntentId,
              }).catch(() => undefined);
              setResumingOrder(null);
              await reload();
              setFeedback({
                type: 'success',
                message: 'Pagamento confirmado e ingressos emitidos!',
              });
            }}
          />
        </GlassCard>
      )}

      {transferModalTicket && (
        <GlassCard className="p-4 space-y-3 border-teal-500/30 bg-slate-900/90">
          <h4 className="text-sm font-bold text-white">
            Transferir Ingresso #{transferModalTicket.id.slice(0, 8)}
          </h4>
          <form onSubmit={handleTransferSubmit} className="space-y-2.5">
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Nome do novo titular"
              className="w-full min-h-11 px-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
            />
            <input
              type="email"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="E-mail do novo titular"
              className="w-full min-h-11 px-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setTransferModalTicket(null)}
                className="min-h-11 px-4 rounded-xl bg-white/5 text-xs font-bold text-white/70 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="min-h-11 px-4 rounded-xl bg-teal-400 text-slate-950 text-xs font-black cursor-pointer"
              >
                Confirmar Transferência
              </button>
            </div>
          </form>
        </GlassCard>
      )}
    </div>
  );
}
