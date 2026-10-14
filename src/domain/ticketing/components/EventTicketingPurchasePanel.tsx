import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  QrCode,
  ShieldCheck,
  Sparkles,
  Tag,
  Ticket as TicketIcon,
  User,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useAuthContext } from '../../auth/context/AuthContext';
import { useEventOccurrences, type EventOccurrence } from '../../events';
import { StripePaymentElement } from '../../payment';
import { GlassCard } from '../../../ui/components/GlassCard';
import { confirmTicketOrderPaymentReturnUseCase } from '../application/usecases/confirmTicketOrderPaymentReturnUseCase';
import { createTicketOrderPaymentIntentUseCase } from '../application/usecases/createTicketOrderPaymentIntentUseCase';
import { createTicketOrderUseCase } from '../application/usecases/createTicketOrderUseCase';
import { expireTicketOrderUseCase } from '../application/usecases/expireTicketOrderUseCase';
import { getTicketOrderUseCase } from '../application/usecases/getTicketOrderUseCase';
import { useCheckoutCountdown } from '../hooks/useCheckoutCountdown';
import { usePublicTicketTypes } from '../hooks/useTicketTypes';
import {
  formatMoneyMinorBrl,
  type PublicTicketTypeProjection,
  type Ticket,
  type TicketOrder,
} from '../types/ticketing';

interface EventTicketingPurchasePanelProps {
  eventId?: string;
  occurrenceId?: string;
  eventTitle: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  onRequireLogin?: () => void;
  maxTicketsPerUser?: number;
  refundPolicy?: {
    enabled: boolean;
    cancellationWindowHours?: number;
    allowBuyerCancellation?: boolean;
    buyerCancellationWindowHours?: number;
    allowTicketTransfer?: boolean;
    ticketTransferCutoffHours?: number;
  };
  onOrderCompleted?: (orderId: string) => void;
}

export function EventTicketingPurchasePanel({
  eventId,
  occurrenceId: initialOccurrenceId,
  eventTitle,
  userEmail,
  userName,
  onRequireLogin,
  maxTicketsPerUser = 5,
  refundPolicy,
  onOrderCompleted,
}: EventTicketingPurchasePanelProps) {
  const { user } = useAuthContext();
  const { occurrences, loading: occLoading } = useEventOccurrences(
    !initialOccurrenceId && eventId ? eventId : undefined
  );
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string>(
    initialOccurrenceId || ''
  );

  useEffect(() => {
    if (initialOccurrenceId) {
      setSelectedOccurrenceId(initialOccurrenceId);
    } else if (!selectedOccurrenceId && occurrences.length > 0 && occurrences[0]) {
      setSelectedOccurrenceId(occurrences[0].id);
    }
  }, [initialOccurrenceId, occurrences, selectedOccurrenceId]);

  const occurrenceId = initialOccurrenceId || selectedOccurrenceId;
  const { ticketTypes, loading, error: loadError, reload } = usePublicTicketTypes(
    occurrenceId || undefined
  );

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [buyerName, setBuyerName] = useState(userName || user?.displayName || '');
  const [buyerEmail, setBuyerEmail] = useState(userEmail || user?.email || '');
  const [holdersByItemKey, setHoldersByItemKey] = useState<
    Record<string, { name: string; email: string }>
  >({});
  const [promoCode, setPromoCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createdOrder, setCreatedOrder] = useState<TicketOrder | null>(null);
  const [serverNow, setServerNow] = useState<string>(new Date().toISOString());
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [issuedTickets, setIssuedTickets] = useState<
    Array<{ ticket: Ticket; rawQrToken?: string; qrDataUrl?: string }>
  >([]);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const countdown = useCheckoutCountdown({
    expiresAt:
      createdOrder?.expiresAt || new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    serverNow,
  });

  useEffect(() => {
    if (user) {
      if (!buyerName && user.displayName) setBuyerName(user.displayName);
      if (!buyerEmail && user.email) setBuyerEmail(user.email);
    }
  }, [user, buyerName, buyerEmail]);

  useEffect(() => {
    if (
      createdOrder &&
      createdOrder.status === 'pending_payment' &&
      countdown.isExpired
    ) {
      expireTicketOrderUseCase(createdOrder.id)
        .then(() => {
          setCreatedOrder((prev) =>
            prev ? { ...prev, status: 'expired' } : null
          );
          setClientSecret(null);
          setError('Sua reserva expirou após 10 minutos. Selecione os ingressos novamente.');
          void reload();
        })
        .catch(() => {
          setCreatedOrder((prev) =>
            prev ? { ...prev, status: 'expired' } : null
          );
        });
    }
  }, [createdOrder, countdown.isExpired, reload]);

  const enrichTicketsWithQr = async (
    rawList: Array<{ ticket: Ticket; rawQrToken?: string }>
  ) => {
    const enriched = await Promise.all(
      rawList.map(async (entry) => {
        const qrContent = entry.rawQrToken || entry.ticket.id;
        try {
          const qrDataUrl = await QRCode.toDataURL(qrContent, {
            width: 220,
            margin: 1,
          });
          return { ...entry, qrDataUrl };
        } catch {
          return entry;
        }
      })
    );
    setIssuedTickets(enriched);
  };

  const selectedItems = ticketTypes
    .map((tt) => ({
      ticketType: tt,
      quantity: quantities[tt.id] || 0,
    }))
    .filter((x) => x.quantity > 0);

  const totalQuantity = selectedItems.reduce((sum, x) => sum + x.quantity, 0);
  const estimatedSubtotalMinor = selectedItems.reduce(
    (sum, x) => sum + x.ticketType.priceMinor * x.quantity,
    0
  );
  const isAllFree = selectedItems.length > 0 && estimatedSubtotalMinor === 0;

  const effectiveMaxPerUser = Math.min(Math.max(maxTicketsPerUser || 5, 1), 100);

  const handleQuantityChange = (tt: PublicTicketTypeProjection, delta: number) => {
    setQuantities((prev) => {
      const current = prev[tt.id] || 0;
      const next = Math.max(0, current + delta);
      const otherTotal = Object.entries(prev).reduce(
        (acc, [k, v]) => (k === tt.id ? acc : acc + v),
        0
      );
      if (next > 0 && next < tt.minPerOrder) {
        return {
          ...prev,
          [tt.id]: delta > 0 ? Math.min(tt.minPerOrder, effectiveMaxPerUser - otherTotal) : 0,
        };
      }
      const maxAllowedForItem = Math.min(
        tt.maxPerOrder,
        tt.availableQuantity,
        Math.max(0, effectiveMaxPerUser - otherTotal)
      );
      if (next > maxAllowedForItem) {
        return prev;
      }
      return { ...prev, [tt.id]: next };
    });
  };

  const handleReserveOrIssueOrder = async () => {
    if (!user) {
      if (onRequireLogin) {
        onRequireLogin();
        return;
      }
      setError('Faça login na sua conta Use Guide para reservar ou adquirir ingressos.');
      return;
    }
    if (!occurrenceId) {
      setError('Selecione uma data/sessão do evento.');
      return;
    }
    if (selectedItems.length === 0) {
      setError('Selecione ao menos 1 ingresso.');
      return;
    }
    if (!buyerName.trim() || !buyerEmail.trim()) {
      setError('Preencha o nome e o e-mail do comprador.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const idempotencyKey = `ord_${occurrenceId}_${user.uid}_${crypto.randomUUID()}`;
      const res = await createTicketOrderUseCase({
        occurrenceId,
        items: selectedItems.map((x) => {
          const holders = Array.from({ length: x.quantity }, (_, idx) => {
            const key = `${x.ticketType.id}_${idx}`;
            const custom = holdersByItemKey[key];
            return {
              name: custom?.name?.trim() || buyerName.trim(),
              email: custom?.email?.trim() || buyerEmail.trim(),
            };
          });
          return {
            ticketTypeId: x.ticketType.id,
            quantity: x.quantity,
            holders,
          };
        }),
        buyer: {
          name: buyerName.trim(),
          email: buyerEmail.trim(),
        },
        ...(promoCode.trim() ? { promoCode: promoCode.trim().toUpperCase() } : {}),
        idempotencyKey,
      });

      setCreatedOrder(res.order);
      setServerNow(res.serverNow || new Date().toISOString());

      if (res.order.status === 'paid' || res.order.totalMinor === 0) {
        await enrichTicketsWithQr(res.issuedTickets);
        await reload();
        onOrderCompleted?.(res.order.id);
        return;
      }

      const piResult = await createTicketOrderPaymentIntentUseCase(res.order.id, {
        idempotencyKey: `pi_${res.order.id}_${crypto.randomUUID()}`,
      });

      if (piResult.orderStatus === 'paid' || piResult.status === 'succeeded') {
        const updatedOrder = await getTicketOrderUseCase(res.order.id);
        setCreatedOrder(updatedOrder.order);
        await enrichTicketsWithQr(
          updatedOrder.tickets.map((t) => ({ ticket: t }))
        );
        await reload();
        onOrderCompleted?.(res.order.id);
      } else {
        setClientSecret(piResult.clientSecret);
        setPaymentIntentId(piResult.paymentIntentId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar pedido de ingressos.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentConfirmedInElement = async (confirmedPiId?: string) => {
    if (!createdOrder) return;
    setPaymentProcessing(true);
    setError(null);
    try {
      const targetPi = confirmedPiId || paymentIntentId || '';
      if (targetPi) {
        await confirmTicketOrderPaymentReturnUseCase(createdOrder.id, {
          paymentIntentId: targetPi,
        });
      }
      const updated = await getTicketOrderUseCase(createdOrder.id);
      setCreatedOrder(updated.order);
      if (updated.order.status === 'paid') {
        await enrichTicketsWithQr(
          updated.tickets.map((t) => ({ ticket: t }))
        );
        await reload();
        onOrderCompleted?.(updated.order.id);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Pagamento enviado. Aguardando confirmação final do Stripe.'
      );
    } finally {
      setPaymentProcessing(false);
    }
  };

  const effectiveRefundPolicy = createdOrder?.refundPolicySnapshot || refundPolicy;
  const allowCancel =
    effectiveRefundPolicy?.allowBuyerCancellation ??
    effectiveRefundPolicy?.enabled ??
    true;
  const cancelHours =
    effectiveRefundPolicy?.buyerCancellationWindowHours ??
    effectiveRefundPolicy?.cancellationWindowHours ??
    24;
  const allowTransfer = effectiveRefundPolicy?.allowTicketTransfer ?? true;
  const transferHours = effectiveRefundPolicy?.ticketTransferCutoffHours ?? 4;

  if ((loading || occLoading) && ticketTypes.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3 text-white/60 text-xs">
        <Loader2 size={16} className="animate-spin text-teal-400" />
        <span>Carregando lotes de ingressos...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-center gap-2">
        <AlertCircle size={16} className="shrink-0 text-red-400" />
        <span>{loadError}</span>
      </div>
    );
  }

  if (ticketTypes.length === 0 && occurrences.length <= 1) {
    return null;
  }

  if (createdOrder && createdOrder.status === 'paid') {
    const isFreeOrder = createdOrder.totalMinor === 0;
    return (
      <GlassCard className="p-5 space-y-4 border-teal-500/30 bg-teal-950/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {isFreeOrder ? 'Inscrição Confirmada!' : 'Ingressos Emitidos com Sucesso!'}
            </h4>
            <p className="text-xs text-white/60">
              Pedido #{createdOrder.id.slice(0, 8)} • {eventTitle}
            </p>
          </div>
        </div>

        {issuedTickets.length > 0 && (
          <div className="space-y-3 pt-2">
            {issuedTickets.map(({ ticket, qrDataUrl }) => (
              <div
                key={ticket.id}
                className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center gap-4"
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code do ingresso ${ticket.id}`}
                    className="w-28 h-28 rounded-xl bg-white p-1.5 shrink-0"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
                    <QrCode size={36} />
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                    {ticket.ticketTypeSnapshot?.name || 'Credencial Oficial'}
                  </div>
                  <div className="text-sm font-bold text-white">{ticket.holderName}</div>
                  <div className="text-xs text-white/60">{ticket.holderEmail}</div>
                  <div className="text-[11px] text-white/50 font-mono">
                    ID: {ticket.id.slice(0, 12)} • Versão QR v{ticket.qrVersion}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setCreatedOrder(null);
            setClientSecret(null);
            setPaymentIntentId(null);
            setIssuedTickets([]);
            setQuantities({});
          }}
          className="w-full min-h-11 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors cursor-pointer"
        >
          Adquirir mais ingressos
        </button>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TicketIcon size={16} className="text-teal-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/80">
            Ingressos e Inscrições
          </h4>
        </div>
        <span className="text-[11px] text-white/50">
          Limite: até {effectiveMaxPerUser} por pessoa nesta sessão
        </span>
      </div>

      {!initialOccurrenceId && occurrences.length > 1 && !createdOrder && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {occurrences.map((occ: EventOccurrence) => (
            <button
              key={occ.id}
              type="button"
              onClick={() => {
                setSelectedOccurrenceId(occ.id);
                setQuantities({});
              }}
              className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                selectedOccurrenceId === occ.id
                  ? 'bg-teal-400 text-slate-950'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <Calendar size={13} />
              <span>
                {new Date(occ.startsAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </button>
          ))}
        </div>
      )}

      {!createdOrder ? (
        <>
          <div className="space-y-2.5">
            {ticketTypes.map((tt) => {
              const qty = quantities[tt.id] || 0;
              const isAvailable = tt.status === 'on_sale' && tt.availableQuantity > 0;

              return (
                <div
                  key={tt.id}
                  className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white truncate">{tt.name}</span>
                      <span className="text-xs font-black text-teal-300">
                        {tt.kind === 'free' ? 'Gratuito' : formatMoneyMinorBrl(tt.priceMinor)}
                      </span>
                    </div>
                    {tt.description && (
                      <p className="text-xs text-white/60 line-clamp-2">{tt.description}</p>
                    )}
                    <div className="text-[11px] text-white/50">
                      {tt.status === 'sold_out'
                        ? 'Esgotado'
                        : tt.status === 'not_started'
                          ? 'Vendas em breve'
                          : tt.status === 'ended'
                            ? 'Vendas encerradas'
                            : `${tt.availableQuantity} disponíveis`}
                    </div>
                  </div>

                  {isAvailable ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(tt, -1)}
                        disabled={qty === 0}
                        aria-label={`Diminuir quantidade de ${tt.name}`}
                        className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 border border-white/10 text-white font-bold flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-7 text-center text-sm font-bold text-white">{qty}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(tt, 1)}
                        disabled={
                          qty >= tt.maxPerOrder ||
                          qty >= tt.availableQuantity ||
                          totalQuantity >= effectiveMaxPerUser
                        }
                        aria-label={`Aumentar quantidade de ${tt.name}`}
                        className="w-11 h-11 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 disabled:opacity-40 border border-teal-500/30 text-teal-300 font-bold flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/50 text-[11px] font-semibold">
                      Indisponível
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {totalQuantity > 0 && (
            <GlassCard className="p-4 space-y-3 border-white/15 bg-white/[0.03]">
              <div className="text-xs font-bold text-white/80 uppercase tracking-wider">
                Dados do Comprador
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full min-h-11 px-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50 focus:outline-none focus:border-teal-400"
                />
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="E-mail para receber os ingressos"
                  className="w-full min-h-11 px-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50 focus:outline-none focus:border-teal-400"
                />
              </div>

              {totalQuantity > 1 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white/80">
                    <User size={13} className="text-teal-400" />
                    <span>Titulares dos Ingressos ({totalQuantity})</span>
                  </div>
                  {selectedItems.flatMap((x) =>
                    Array.from({ length: x.quantity }, (_, idx) => {
                      const key = `${x.ticketType.id}_${idx}`;
                      const currentHolder = holdersByItemKey[key] || {
                        name: idx === 0 ? buyerName : '',
                        email: idx === 0 ? buyerEmail : '',
                      };
                      return (
                        <div
                          key={key}
                          className="p-2.5 rounded-xl bg-black/30 border border-white/10 space-y-2"
                        >
                          <div className="text-[11px] font-bold text-teal-300">
                            Titular #{idx + 1} — {x.ticketType.name}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={currentHolder.name}
                              onChange={(e) =>
                                setHoldersByItemKey((prev) => ({
                                  ...prev,
                                  [key]: { ...currentHolder, name: e.target.value },
                                }))
                              }
                              placeholder="Nome do titular"
                              className="w-full min-h-11 px-3 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
                            />
                            <input
                              type="email"
                              value={currentHolder.email}
                              onChange={(e) =>
                                setHoldersByItemKey((prev) => ({
                                  ...prev,
                                  [key]: { ...currentHolder, email: e.target.value },
                                }))
                              }
                              placeholder="E-mail do titular"
                              className="w-full min-h-11 px-3 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {!isAllFree && (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
                    />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Cupom promocional (opcional)"
                      className="w-full min-h-11 pl-9 pr-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50 uppercase focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 text-[11px] text-white/70">
                <div className="flex items-center gap-1.5 font-bold text-white/90">
                  <Info size={13} className="text-teal-400" />
                  <span>Política de Cancelamento e Transferência</span>
                </div>
                <p>
                  • Cancelamento pelo comprador:{' '}
                  {allowCancel
                    ? `Permitido até ${cancelHours}h antes do início da sessão (reembolso integral do pedido).`
                    : 'Não reembolsável por iniciativa do comprador.'}
                </p>
                <p>
                  • Transferência de titularidade:{' '}
                  {allowTransfer
                    ? `Permitida até ${transferHours}h antes do início da sessão.`
                    : 'Transferência não habilitada para este evento.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div>
                  <span className="text-xs text-white/60 block">
                    {totalQuantity} {totalQuantity === 1 ? 'ingresso' : 'ingressos'}
                  </span>
                  <span className="text-base font-black text-teal-300">
                    {isAllFree ? 'Gratuito' : formatMoneyMinorBrl(estimatedSubtotalMinor)}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleReserveOrIssueOrder}
                  className="px-5 min-h-11 rounded-xl bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  <span>
                    {isAllFree ? 'Inscrever-se gratuitamente' : 'Reservar e Pagar'}
                  </span>
                </button>
              </div>
            </GlassCard>
          )}
        </>
      ) : (
        <GlassCard className="p-4 space-y-4 border-teal-500/30 bg-slate-900/80">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <div className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                Reserva #{createdOrder.id.slice(0, 8)}
              </div>
              <div className="text-base font-black text-white">
                Total: {formatMoneyMinorBrl(createdOrder.totalMinor)}
              </div>
            </div>

            <div
              className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${
                countdown.isExpired
                  ? 'bg-red-500/15 border-red-500/30 text-red-300'
                  : countdown.isWarning
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 animate-pulse'
                    : 'bg-teal-500/15 border-teal-500/30 text-teal-300'
              }`}
            >
              <Clock size={14} />
              <span>
                {countdown.isExpired
                  ? 'Reserva expirada (00:00)'
                  : countdown.isWarning
                    ? `Sua reserva expira em ${String(countdown.minutes).padStart(2, '0')}:${String(countdown.seconds).padStart(2, '0')}`
                    : `Tempo restante: ${String(countdown.minutes).padStart(2, '0')}:${String(countdown.seconds).padStart(2, '0')}`}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5 text-xs">
            <div className="flex justify-between text-white/70">
              <span>Subtotal</span>
              <span>{formatMoneyMinorBrl(createdOrder.subtotalMinor)}</span>
            </div>
            {createdOrder.discountMinor > 0 && (
              <div className="flex justify-between text-emerald-300">
                <span>Desconto</span>
                <span>- {formatMoneyMinorBrl(createdOrder.discountMinor)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-white pt-1 border-t border-white/10">
              <span>Total Final</span>
              <span className="text-teal-300">
                {formatMoneyMinorBrl(createdOrder.totalMinor)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 text-[11px] text-white/70">
            <div className="font-bold text-white/90">Política Aplicada a este Pedido</div>
            <p>
              • Reembolso integral:{' '}
              {allowCancel
                ? `Disponível até ${cancelHours}h antes do início da ocorrência.`
                : 'Não reembolsável por solicitação do comprador (exceto cancelamento oficial do evento).'}
            </p>
            <p>
              • Transferência:{' '}
              {allowTransfer
                ? `Permitida até ${transferHours}h antes do início da ocorrência.`
                : 'Transferência desabilitada.'}
            </p>
          </div>

          {paymentProcessing && (
            <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-200 flex items-center gap-2.5">
              <Loader2 size={16} className="animate-spin shrink-0" />
              <span>Confirmando pagamento e emitindo suas credenciais...</span>
            </div>
          )}

          {clientSecret && !countdown.isExpired ? (
            <StripePaymentElement
              clientSecret={clientSecret}
              orderId={createdOrder.id}
              disabled={countdown.isExpired || paymentProcessing}
              submitLabel={`Pagar ${formatMoneyMinorBrl(createdOrder.totalMinor)}`}
              onError={(msg) => setError(msg)}
              onSuccess={(piId) => void handlePaymentConfirmedInElement(piId)}
            />
          ) : countdown.isExpired ? (
            <button
              type="button"
              onClick={() => {
                setCreatedOrder(null);
                setClientSecret(null);
                setPaymentIntentId(null);
                setError(null);
              }}
              className="w-full min-h-11 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white cursor-pointer"
            >
              Nova Reserva
            </button>
          ) : (
            <div className="py-6 flex items-center justify-center gap-2 text-xs text-white/60">
              <Loader2 size={16} className="animate-spin text-teal-400" />
              <span>Carregando Stripe Payment Element...</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/50">
            <ShieldCheck size={14} className="text-teal-400" />
            <span>Pagamento transparente in-app via Stripe (Cartão e Pix)</span>
          </div>
        </GlassCard>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
