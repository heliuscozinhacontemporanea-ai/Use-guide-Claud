import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BUYER_TERMS_VERSION } from '../../../shared/constants/legalTerms';
import { openEmailVerificationPromptUseCase, useAuthContext } from '../../auth';
import { confirmTicketOrderPaymentReturnUseCase } from '../application/usecases/confirmTicketOrderPaymentReturnUseCase';
import { createTicketOrderPaymentIntentUseCase } from '../application/usecases/createTicketOrderPaymentIntentUseCase';
import { createTicketOrderUseCase } from '../application/usecases/createTicketOrderUseCase';
import { expireTicketOrderUseCase } from '../application/usecases/expireTicketOrderUseCase';
import { getTicketOrderUseCase } from '../application/usecases/getTicketOrderUseCase';
import type { PublicTicketTypeProjection, Ticket, TicketOrder } from '../types/ticketing';
import { useCheckoutCountdown } from './useCheckoutCountdown';

export interface IssuedTicketView {
  ticket: Ticket;
  rawQrToken?: string;
  qrDataUrl?: string;
}

export interface HolderDraft {
  name: string;
  email: string;
}

interface UseTicketCheckoutParams {
  occurrenceId: string;
  ticketTypes: PublicTicketTypeProjection[];
  maxTicketsPerUser: number;
  initialBuyer: { name?: string; email?: string };
  reloadTicketTypes: () => Promise<void> | void;
  onRequireLogin?: () => void;
  onOrderCompleted?: (orderId: string) => void;
}

async function withQrCodes(
  rawList: Array<{ ticket: Ticket; rawQrToken?: string }>
): Promise<IssuedTicketView[]> {
  return Promise.all(
    rawList.map(async (entry) => {
      try {
        const qrDataUrl = await QRCode.toDataURL(entry.rawQrToken || entry.ticket.id, {
          width: 220,
          margin: 1,
        });
        return { ...entry, qrDataUrl };
      } catch {
        return entry;
      }
    })
  );
}

/** Seleção, reserva, pagamento e emissão de ingressos de uma sessão. */
export function useTicketCheckout({
  occurrenceId,
  ticketTypes,
  maxTicketsPerUser,
  initialBuyer,
  reloadTicketTypes,
  onRequireLogin,
  onOrderCompleted,
}: UseTicketCheckoutParams) {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [buyerName, setBuyerName] = useState(initialBuyer.name || user?.displayName || '');
  const [buyerEmail, setBuyerEmail] = useState(initialBuyer.email || user?.email || '');
  const [holders, setHolders] = useState<Record<string, HolderDraft>>({});
  const [promoCode, setPromoCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TicketOrder | null>(null);
  const [serverNow, setServerNow] = useState(() => new Date().toISOString());
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [issuedTickets, setIssuedTickets] = useState<IssuedTicketView[]>([]);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const countdown = useCheckoutCountdown({
    expiresAt: order?.expiresAt || new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    serverNow,
  });

  useEffect(() => {
    if (!user) return;
    if (!buyerName && user.displayName) setBuyerName(user.displayName);
    if (!buyerEmail && user.email) setBuyerEmail(user.email);
  }, [user, buyerName, buyerEmail]);

  useEffect(() => {
    if (order?.status !== 'pending_payment' || !countdown.isExpired) return;
    const markExpired = () => setOrder((prev) => (prev ? { ...prev, status: 'expired' } : null));
    expireTicketOrderUseCase(order.id)
      .then(() => {
        markExpired();
        setClientSecret(null);
        setError(t('ticketCheckout.errors.expired'));
        void reloadTicketTypes();
      })
      .catch(markExpired);
  }, [order, countdown.isExpired, reloadTicketTypes, t]);

  const selectedItems = ticketTypes
    .map((ticketType) => ({ ticketType, quantity: quantities[ticketType.id] || 0 }))
    .filter((entry) => entry.quantity > 0);
  const totalQuantity = selectedItems.reduce((sum, entry) => sum + entry.quantity, 0);
  const estimatedSubtotalMinor = selectedItems.reduce(
    (sum, entry) => sum + entry.ticketType.priceMinor * entry.quantity,
    0
  );
  const isAllFree = selectedItems.length > 0 && estimatedSubtotalMinor === 0;
  const effectiveMaxPerUser = Math.min(Math.max(maxTicketsPerUser || 5, 1), 100);

  const changeQuantity = (ticketType: PublicTicketTypeProjection, delta: number) => {
    setQuantities((prev) => {
      const current = prev[ticketType.id] || 0;
      const next = Math.max(0, current + delta);
      const otherTotal = Object.entries(prev).reduce(
        (acc, [id, quantity]) => (id === ticketType.id ? acc : acc + quantity),
        0
      );
      if (next > 0 && next < ticketType.minPerOrder) {
        return {
          ...prev,
          [ticketType.id]:
            delta > 0 ? Math.min(ticketType.minPerOrder, effectiveMaxPerUser - otherTotal) : 0,
        };
      }
      const maxAllowed = Math.min(
        ticketType.maxPerOrder,
        ticketType.availableQuantity,
        Math.max(0, effectiveMaxPerUser - otherTotal)
      );
      return next > maxAllowed ? prev : { ...prev, [ticketType.id]: next };
    });
  };

  const finishWithTickets = async (
    orderId: string,
    tickets: Array<{ ticket: Ticket; rawQrToken?: string }>
  ) => {
    setIssuedTickets(await withQrCodes(tickets));
    await reloadTicketTypes();
    onOrderCompleted?.(orderId);
  };

  const reserve = async () => {
    if (!user) {
      if (onRequireLogin) onRequireLogin();
      else setError(t('ticketCheckout.errors.loginRequired'));
      return;
    }
    if (!occurrenceId) return setError(t('ticketCheckout.errors.selectSession'));
    if (selectedItems.length === 0) return setError(t('ticketCheckout.errors.selectTicket'));
    if (!buyerName.trim() || !buyerEmail.trim()) {
      return setError(t('ticketCheckout.errors.buyerRequired'));
    }
    if (!termsAccepted) return setError(t('legal.accept.required'));
    // O servidor também recusa (AGENTS.md §7.10); aqui só evita a viagem e abre o aviso (D22).
    if (!user.emailVerified) {
      setError(t('ticketCheckout.errors.emailNotVerified'));
      openEmailVerificationPromptUseCase();
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await createTicketOrderUseCase({
        occurrenceId,
        items: selectedItems.map(({ ticketType, quantity }) => ({
          ticketTypeId: ticketType.id,
          quantity,
          holders: Array.from({ length: quantity }, (_, index) => {
            const custom = holders[`${ticketType.id}_${index}`];
            return {
              name: custom?.name?.trim() || buyerName.trim(),
              email: custom?.email?.trim() || buyerEmail.trim(),
            };
          }),
        })),
        buyer: { name: buyerName.trim(), email: buyerEmail.trim() },
        ...(promoCode.trim() ? { promoCode: promoCode.trim().toUpperCase() } : {}),
        idempotencyKey: `ord_${occurrenceId}_${user.uid}_${crypto.randomUUID()}`,
        acceptedTermsVersion: BUYER_TERMS_VERSION,
      });
      setOrder(result.order);
      setServerNow(result.serverNow || new Date().toISOString());

      if (result.order.status === 'paid' || result.order.totalMinor === 0) {
        await finishWithTickets(result.order.id, result.issuedTickets);
        return;
      }

      const intent = await createTicketOrderPaymentIntentUseCase(result.order.id, {
        idempotencyKey: `pi_${result.order.id}_${crypto.randomUUID()}`,
      });
      if (intent.orderStatus === 'paid' || intent.status === 'succeeded') {
        const updated = await getTicketOrderUseCase(result.order.id);
        setOrder(updated.order);
        await finishWithTickets(
          result.order.id,
          updated.tickets.map((ticket) => ({ ticket }))
        );
      } else {
        setClientSecret(intent.clientSecret);
        setPaymentIntentId(intent.paymentIntentId);
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'EMAIL_NOT_VERIFIED') {
        setError(t('ticketCheckout.errors.emailNotVerified'));
        openEmailVerificationPromptUseCase();
      } else {
        setError(err instanceof Error ? err.message : t('ticketCheckout.errors.createFailed'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmPayment = async (confirmedPaymentIntentId?: string) => {
    if (!order) return;
    setPaymentProcessing(true);
    setError(null);
    try {
      const target = confirmedPaymentIntentId || paymentIntentId || '';
      if (target) {
        await confirmTicketOrderPaymentReturnUseCase(order.id, { paymentIntentId: target });
      }
      const updated = await getTicketOrderUseCase(order.id);
      setOrder(updated.order);
      if (updated.order.status === 'paid') {
        await finishWithTickets(
          updated.order.id,
          updated.tickets.map((ticket) => ({ ticket }))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ticketCheckout.errors.awaitingStripe'));
    } finally {
      setPaymentProcessing(false);
    }
  };

  const reset = () => {
    setOrder(null);
    setClientSecret(null);
    setPaymentIntentId(null);
    setIssuedTickets([]);
    setQuantities({});
    setError(null);
  };

  return {
    quantities,
    selectedItems,
    totalQuantity,
    estimatedSubtotalMinor,
    isAllFree,
    effectiveMaxPerUser,
    changeQuantity,
    clearQuantities: () => setQuantities({}),
    buyer: { name: buyerName, email: buyerEmail, setName: setBuyerName, setEmail: setBuyerEmail },
    holders,
    setHolder: (key: string, holder: HolderDraft) =>
      setHolders((prev) => ({ ...prev, [key]: holder })),
    promoCode,
    setPromoCode,
    termsAccepted,
    setTermsAccepted,
    submitting,
    error,
    setError,
    order,
    clientSecret,
    issuedTickets,
    paymentProcessing,
    countdown,
    reserve,
    confirmPayment,
    reset,
  };
}

export type TicketCheckoutState = ReturnType<typeof useTicketCheckout>;
