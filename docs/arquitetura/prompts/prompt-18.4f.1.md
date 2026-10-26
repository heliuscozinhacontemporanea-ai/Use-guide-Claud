# Prompt 18.4f.1 — Relatar problema e aviso de remarcação nas compras do comprador (D16)

> Lote 17, gerado do commit de referência `097336f` da branch `claude/agents-md-v2`. Aplique depois do 18.4e.3. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4f.1 — Relatar problema e aviso de remarcação nas compras do comprador (D16)

Primeira parte das telas do comprador e do admin (18.4f). Telas conferidas por prints e aprovadas em 2026-10-26.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Telas nos dois temas, com folha inferior no celular (§11.1, §11.11), e textos nos 3 idiomas (§12). Nenhuma dependência nova e nenhuma mudança no backend: as rotas GET /api/sale-claims/mine e POST /api/sale-claims já existem (18.4d.2).

O QUE MUDA:
1) Domínio payment (app): tipos de reclamação do comprador (types/saleClaims.ts), métodos listMySaleClaims e openSaleClaim no adaptador de recebimentos, casos de uso listMySaleClaimsUseCase e openSaleClaimUseCase, janela de 48 h depois do fim (utils/claimWindow.ts) e erros por code (utils/saleClaimErrors.ts).
2) Componentes públicos do payment: MySaleClaimsProvider (busca as reclamações do comprador uma vez por tela) e SaleClaimAction. Dentro da janela, o SaleClaimAction mostra o botão Relatar problema com o prazo; o diálogo tem lista fechada de 5 motivos e detalhes opcionais até 500 caracteres. Com reclamação aberta ou decidida, mostra só o status (em análise com a data da resposta, reembolso em andamento, reembolsado com o valor, análise concluída ou encerrada).
3) Ticketing e bookings: UserTicketsHistoryView e MyBookingsView ganham o slot renderClaimAction, só para compras pagas (pedido paid/partially_refunded; reserva confirmed/completed/no_show). Os cartões mostram o aviso de reembolso integral por 7 dias depois da remarcação, sem passar do início (src/shared/utils/rescheduleRefundDeadline.ts). O cartão de reserva vai para BuyerBookingCard.tsx, nos tokens de tema.
4) Composições novas em src/app/compositions (BuyerTicketWalletComposition e BuyerBookingsComposition) ligam o SaleClaimAction às duas telas; o SideMenu passa a usá-las (AGENTS.md §5.2).
5) Textos novos no namespace saleClaims (src/shared/i18n/saleClaimsResources.ts) e os avisos de remarcação em ticketWallet e bookings.

ARQUIVOS (crie, altere ou apague exatamente estes):
- src/app/compositions/BuyerBookingsComposition.tsx (criar)
- src/app/compositions/BuyerTicketWalletComposition.tsx (criar)
- src/app/menu/SideMenu.tsx (alterar)
- src/domain/bookings/components/buyer/BuyerBookingCard.tsx (criar)
- src/domain/bookings/components/buyer/MyBookingsView.tsx (alterar)
- src/domain/payment/api/apiReceivablesAdapter.ts (alterar)
- src/domain/payment/application/usecases/listMySaleClaimsUseCase.ts (criar)
- src/domain/payment/application/usecases/openSaleClaimUseCase.ts (criar)
- src/domain/payment/components/claims/MySaleClaimsProvider.tsx (criar)
- src/domain/payment/components/claims/SaleClaimAction.tsx (criar)
- src/domain/payment/components/claims/SaleClaimDialog.tsx (criar)
- src/domain/payment/components/claims/saleClaims.test.tsx (criar)
- src/domain/payment/hooks/mySaleClaimsContext.ts (criar)
- src/domain/payment/index.ts (alterar)
- src/domain/payment/ports/receivablesApiPort.ts (alterar)
- src/domain/payment/types/saleClaims.ts (criar)
- src/domain/payment/utils/claimWindow.ts (criar)
- src/domain/payment/utils/saleClaimErrors.ts (criar)
- src/domain/ticketing/components/UserTicketsHistoryView.tsx (alterar)
- src/domain/ticketing/components/wallet/WalletOrderCard.tsx (alterar)
- src/shared/i18n/bookingsResources.ts (alterar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/i18n/saleClaimsResources.ts (criar)
- src/shared/i18n/ticketWalletResources.ts (alterar)
- src/shared/utils/rescheduleRefundDeadline.test.ts (criar)
- src/shared/utils/rescheduleRefundDeadline.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== src/app/compositions/BuyerBookingsComposition.tsx — ARQUIVO NOVO, conteúdo completo ===
import { MyBookingsView } from '../../domain/bookings';
import { MySaleClaimsProvider, SaleClaimAction } from '../../domain/payment';

/** Reservas do comprador com "Relatar problema" do payment em cada reserva (D16, 2A). */
export function BuyerBookingsComposition({ onBack }: { onBack: () => void }) {
  return (
    <MySaleClaimsProvider>
      <MyBookingsView
        onBack={onBack}
        renderClaimAction={(sale) => <SaleClaimAction sale={sale} />}
      />
    </MySaleClaimsProvider>
  );
}

=== src/app/compositions/BuyerTicketWalletComposition.tsx — ARQUIVO NOVO, conteúdo completo ===
import { MySaleClaimsProvider, SaleClaimAction } from '../../domain/payment';
import { UserTicketsHistoryView } from '../../domain/ticketing';

/** Carteira de ingressos com "Relatar problema" do payment em cada pedido (D16, 2A). */
export function BuyerTicketWalletComposition({ onBack }: { onBack: () => void }) {
  return (
    <MySaleClaimsProvider>
      <UserTicketsHistoryView
        onBack={onBack}
        renderClaimAction={(sale) => <SaleClaimAction sale={sale} />}
      />
    </MySaleClaimsProvider>
  );
}

=== src/app/menu/SideMenu.tsx — diff ===
@@ -3,10 +3,8 @@ import { motion, AnimatePresence } from 'motion/react';
 import { hasPasswordSignInUseCase, logoutUseCase } from '../../domain/auth';
 import { useAuthContext } from '../../domain/auth/context/AuthContext';
 import { UserRole } from '../../domain/auth/types/auth';
-import { MyBookingsView } from '../../domain/bookings';
 import { AboutView, SupportView } from '../../domain/content';
 import { FavoritesList } from '../../domain/favorites';
-import { UserTicketsHistoryView } from '../../domain/ticketing';
 import {
   useUserProfile,
   useUserPhoto,
@@ -21,6 +19,8 @@ import {
 import { Z_INDEX } from '../../shared/constants/zIndex';
 import { cn } from '../../shared/utils/cn';
 import { SidebarLayout } from '../../ui/layouts/SidebarLayout';
+import { BuyerBookingsComposition } from '../compositions/BuyerBookingsComposition';
+import { BuyerTicketWalletComposition } from '../compositions/BuyerTicketWalletComposition';
 import { type MenuView, parentMenuView, visibleMenuView } from './menuViews';
 import { useSideMenu } from './useSideMenu';
 import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
@@ -158,9 +158,9 @@ export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
       case 'support':
         return <SupportView onBack={goBack} userEmail={user?.email} />;
       case 'tickets':
-        return <UserTicketsHistoryView onBack={goBack} />;
+        return <BuyerTicketWalletComposition onBack={goBack} />;
       case 'bookings':
-        return <MyBookingsView onBack={goBack} />;
+        return <BuyerBookingsComposition onBack={goBack} />;
       case 'favorites':
         return <FavoritesList onBack={goBack} onSelectItem={closeMenuAndOpenItem} />;
       case 'account':

=== src/domain/bookings/components/buyer/BuyerBookingCard.tsx — ARQUIVO NOVO, conteúdo completo ===
import { CalendarClock } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { rescheduleRefundDeadline } from '../../../../shared/utils/rescheduleRefundDeadline';
import type { BookingSummary } from '../../types/bookings';
import { formatSlotDateTime } from '../../utils/dates';
import { formatMinor } from '../../utils/money';
import { BUTTON_SECONDARY } from '../shared/ListState';

export function BuyerBookingCard({
  booking,
  onCancel,
  claimAction,
}: {
  booking: BookingSummary;
  onCancel?: () => void;
  /** "Relatar problema", montado pela composição (D16, 2A). */
  claimAction?: ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const refundUntil =
    booking.status === 'confirmed'
      ? rescheduleRefundDeadline(booking.rescheduledAt, booking.offer.startsAt, new Date())
      : null;
  return (
    <li className="p-4 rounded-2xl bg-surface border border-line space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink break-words">{booking.offer.title}</p>
          <p className="text-xs text-ink/70">
            {formatSlotDateTime(booking.offer.startsAt, i18n.language)}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface border border-line text-ink/80">
          {t(`bookings.bookingStatus.${booking.status}`)}
        </span>
      </div>
      <p className="text-xs text-ink/70">
        {t('bookings.bookingsList.participants', { count: booking.participantsCount })} ·{' '}
        {formatMinor(booking.totalMinor, i18n.language)}
      </p>
      {booking.offer.meetingPoint && (
        <p className="text-xs text-ink/70">
          {t('bookings.buyer.meetingPoint', { address: booking.offer.meetingPoint })}
        </p>
      )}
      {refundUntil && (
        <p className="px-3 py-2 rounded-xl border border-info-line bg-info-soft text-xs text-info flex items-start gap-2">
          <CalendarClock size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
          {t('bookings.buyer.rescheduledNotice', {
            date: formatSlotDateTime(refundUntil, i18n.language),
          })}
        </p>
      )}
      {claimAction}
      {onCancel && (
        <button type="button" onClick={onCancel} className={BUTTON_SECONDARY}>
          {t('bookings.buyer.cancelBooking')}
        </button>
      )}
    </li>
  );
}

=== src/domain/bookings/components/buyer/MyBookingsView.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ArrowLeft } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { useMyBookings } from '../../hooks/useMyBookings';
import type { BookingSummary } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { formatMinor } from '../../utils/money';
import { previewRefund } from '../../utils/refundPreview';
import { BUTTON_SECONDARY, ListEmpty, ListError, ListLoading } from '../shared/ListState';
import { BuyerBookingCard } from './BuyerBookingCard';

/** Venda que o comprador pode reclamar; o formato é o de `ClaimableSale` do payment. */
export interface BookingClaimSale {
  referenceType: 'booking';
  referenceId: string;
  serviceStartsAt: string;
  serviceEndsAt: string;
}

// Mesmos estados que o backend aceita para reclamar; `no_show` permite contestar a falta.
const CLAIMABLE = new Set(['confirmed', 'completed', 'no_show']);

function claimSaleOf(booking: BookingSummary): BookingClaimSale | null {
  if (!CLAIMABLE.has(booking.status)) return null;
  const startsAt = booking.offer.startsAt;
  const endsAt = new Date(
    new Date(startsAt).getTime() + (booking.offer.durationMinutes ?? 0) * 60_000
  ).toISOString();
  return {
    referenceType: 'booking',
    referenceId: booking.id,
    serviceStartsAt: startsAt,
    serviceEndsAt: endsAt,
  };
}

/** Lista de reservas do comprador, aberta como sub-tela do menu lateral. */
export function MyBookingsView({
  onBack,
  renderClaimAction,
}: {
  onBack: () => void;
  /** Slot da composição para "Relatar problema" (D16, 2A). */
  renderClaimAction?: (sale: BookingClaimSale) => ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, hasMore, reload, loadMore, cancel } = useMyBookings();
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const now = new Date();
  const upcoming = data.filter((booking) => new Date(booking.offer.startsAt) > now);
  const past = data.filter((booking) => new Date(booking.offer.startsAt) <= now);

  const claimActionOf = (booking: BookingSummary) => {
    const sale = renderClaimAction ? claimSaleOf(booking) : null;
    return sale ? renderClaimAction?.(sale) : null;
  };

  const requestCancel = (booking: BookingSummary) => {
    // Só para mostrar antes de confirmar; o valor devolvido é decidido pelo backend.
    const preview = previewRefund(booking, new Date());
    const amount = formatMinor(preview.refundAmountMinor, i18n.language);
    setConfirm({
      message:
        preview.refundAmountMinor > 0
          ? t('bookings.buyer.confirmCancelRefund', { amount })
          : t('bookings.buyer.confirmCancelNoRefund'),
      onCancel: () => setConfirm(null),
      onConfirm: async () => {
        setConfirm(null);
        try {
          const result = await cancel(booking.id);
          setNotice(
            result.refundAmountMinor > 0
              ? t('bookings.buyer.canceledWithRefund', {
                  amount: formatMinor(result.refundAmountMinor, i18n.language),
                })
              : t('bookings.buyer.canceledNoRefund')
          );
        } catch (err: unknown) {
          setNotice(getBookingErrorMessage(err));
        }
      },
    });
  };

  return (
    <section className="w-full space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('bookings.buyer.back')}
          className="w-11 h-11 shrink-0 rounded-xl bg-surface hover:bg-accent-soft border border-line flex items-center justify-center text-ink/70 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
        <h2 className="text-xl font-display font-black text-ink">
          {t('bookings.buyer.myBookingsTitle')}
        </h2>
      </div>
      {notice && (
        <p role="status" className="text-sm text-accent">
          {notice}
        </p>
      )}
      {error && <ListError message={error} onRetry={() => void reload()} />}
      {!error && !loading && data.length === 0 && (
        <ListEmpty message={t('bookings.buyer.emptyBookings')} />
      )}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-ink/80">{t('bookings.buyer.upcoming')}</h2>
          <ul className="space-y-2">
            {upcoming.map((booking) => (
              <BuyerBookingCard
                key={booking.id}
                booking={booking}
                claimAction={claimActionOf(booking)}
                onCancel={booking.status === 'confirmed' ? () => requestCancel(booking) : undefined}
              />
            ))}
          </ul>
        </div>
      )}
      {past.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-ink/80">{t('bookings.buyer.past')}</h2>
          <ul className="space-y-2">
            {past.map((booking) => (
              <BuyerBookingCard
                key={booking.id}
                booking={booking}
                claimAction={claimActionOf(booking)}
              />
            ))}
          </ul>
        </div>
      )}
      {loading && <ListLoading label={t('bookings.buyer.loading')} />}
      {!loading && hasMore && (
        <button type="button" onClick={() => void loadMore()} className={BUTTON_SECONDARY}>
          {t('bookings.buyer.loadMore')}
        </button>
      )}
      <ConfirmDialog data={confirm} />
    </section>
  );
}

=== src/domain/payment/api/apiReceivablesAdapter.ts — diff ===
@@ -1,6 +1,7 @@
 import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
 import type { ReceivablesApiPort } from '../ports/receivablesApiPort';
 import type { AccountDebtView, PayoutPage } from '../types/receivables';
+import type { BuyerSaleClaim, SaleClaimReason } from '../types/saleClaims';
 
 const API_OPTIONS = { requireAuth: true, requireAppCheck: true } as const;
 
@@ -68,4 +69,23 @@ export class ApiReceivablesAdapter implements ReceivablesApiPort {
     );
     return (await readJsonOrThrow<{ data: AccountDebtView }>(response)).data;
   }
+
+  async listMySaleClaims(): Promise<BuyerSaleClaim[]> {
+    const response = await firebaseApiFetch(
+      '/api/sale-claims/mine',
+      { method: 'GET' },
+      API_OPTIONS
+    );
+    return (await readJsonOrThrow<{ data: BuyerSaleClaim[] }>(response)).data;
+  }
+
+  async openSaleClaim(input: {
+    referenceType: 'ticket_order' | 'booking';
+    referenceId: string;
+    reason: SaleClaimReason;
+    details?: string;
+  }): Promise<BuyerSaleClaim> {
+    const response = await postJson('/api/sale-claims', input);
+    return (await readJsonOrThrow<{ data: BuyerSaleClaim }>(response)).data;
+  }
 }

=== src/domain/payment/application/usecases/listMySaleClaimsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { receivablesApiAdapter } from '../../factory';
import type { BuyerSaleClaim } from '../../types/saleClaims';

export function listMySaleClaimsUseCase(): Promise<BuyerSaleClaim[]> {
  return receivablesApiAdapter.listMySaleClaims();
}

=== src/domain/payment/application/usecases/openSaleClaimUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { receivablesApiAdapter } from '../../factory';
import type { BuyerSaleClaim, SaleClaimReason } from '../../types/saleClaims';

/** O backend confere que quem reclama é o comprador e que está dentro do prazo (D16, 2A). */
export function openSaleClaimUseCase(input: {
  referenceType: 'ticket_order' | 'booking';
  referenceId: string;
  reason: SaleClaimReason;
  details?: string;
}): Promise<BuyerSaleClaim> {
  return receivablesApiAdapter.openSaleClaim(input);
}

=== src/domain/payment/components/claims/MySaleClaimsProvider.tsx — ARQUIVO NOVO, conteúdo completo ===
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { listMySaleClaimsUseCase } from '../../application/usecases/listMySaleClaimsUseCase';
import { MySaleClaimsContext } from '../../hooks/mySaleClaimsContext';
import type { BuyerSaleClaim } from '../../types/saleClaims';

/** Busca as reclamações do comprador uma vez para todos os cartões da lista. */
export function MySaleClaimsProvider({ children }: { children: ReactNode }) {
  const [claims, setClaims] = useState<BuyerSaleClaim[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    listMySaleClaimsUseCase()
      // Sem a lista o botão continua disponível; o backend recusa a duplicada com CLAIM_ALREADY_EXISTS.
      .then((list) => active && setClaims(list))
      .catch(() => undefined)
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  const add = useCallback(
    (claim: BuyerSaleClaim) =>
      setClaims((current) => [claim, ...current.filter((entry) => entry.id !== claim.id)]),
    []
  );
  const value = useMemo(() => ({ claims, loaded, add }), [claims, loaded, add]);
  return <MySaleClaimsContext.Provider value={value}>{children}</MySaleClaimsContext.Provider>;
}

=== src/domain/payment/components/claims/SaleClaimAction.tsx — ARQUIVO NOVO, conteúdo completo ===
import { MessageSquareWarning } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { useSaleClaimFor } from '../../hooks/mySaleClaimsContext';
import type { BuyerSaleClaim, ClaimableSale, SaleClaimStatus } from '../../types/saleClaims';
import { CLAIM_WINDOW_HOURS, isWithinClaimWindow } from '../../utils/claimWindow';
import { formatFortalezaDateTime } from '../../utils/receivablesFormat';
import { SaleClaimDialog } from './SaleClaimDialog';

const TONE: Record<SaleClaimStatus, string> = {
  open: 'bg-warn-soft text-warn border-warn-line',
  refund_pending: 'bg-info-soft text-info border-info-line',
  refunded: 'bg-success-soft text-success border-success-line',
  released: 'bg-surface text-ink/80 border-line',
  expired: 'bg-surface text-ink/80 border-line',
};

function ClaimStatus({ claim }: { claim: BuyerSaleClaim }) {
  const { t, i18n } = useTranslation();
  return (
    <p
      role="status"
      className={`px-3 py-2 rounded-xl border text-xs flex items-start gap-2 ${TONE[claim.status]}`}
    >
      <MessageSquareWarning size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
      <span>
        <span className="font-bold">{t(`saleClaims.status.${claim.status}`)}</span>{' '}
        {t(`saleClaims.statusDetail.${claim.status}`, {
          date: formatFortalezaDateTime(claim.decideBy, i18n.language),
          amount: formatMoneyMinor(claim.refundAmountMinor ?? 0, i18n.language),
        })}
      </span>
    </p>
  );
}

/** "Relatar problema" do início do serviço até 48 h depois do fim (D16, 2A); depois, o status. */
export function SaleClaimAction({ sale }: { sale: ClaimableSale }) {
  const { t, i18n } = useTranslation();
  const { claim, add } = useSaleClaimFor(sale.referenceType, sale.referenceId);
  const [open, setOpen] = useState(false);

  if (claim) return <ClaimStatus claim={claim} />;
  if (claim === undefined || !isWithinClaimWindow(sale, new Date())) return null;

  const until = new Date(
    new Date(sale.serviceEndsAt).getTime() + CLAIM_WINDOW_HOURS * 3_600_000
  ).toISOString();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press min-h-11 px-3.5 rounded-xl border border-warn-line bg-warn-soft text-xs font-bold text-warn flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        <MessageSquareWarning size={14} aria-hidden="true" />
        {t('saleClaims.action')}
      </button>
      <span className="text-[11px] text-ink/70">
        {t('saleClaims.until', { date: formatFortalezaDateTime(until, i18n.language) })}
      </span>
      <SaleClaimDialog
        sale={sale}
        open={open}
        onClose={() => setOpen(false)}
        onOpened={(created) => {
          setOpen(false);
          add(created);
        }}
      />
    </div>
  );
}

=== src/domain/payment/components/claims/SaleClaimDialog.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Loader2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { openSaleClaimUseCase } from '../../application/usecases/openSaleClaimUseCase';
import {
  type BuyerSaleClaim,
  type ClaimableSale,
  SALE_CLAIM_REASONS,
  type SaleClaimReason,
} from '../../types/saleClaims';
import { saleClaimErrorKey } from '../../utils/saleClaimErrors';

const MAX_DETAILS = 500;

export function SaleClaimDialog({
  sale,
  open,
  onClose,
  onOpened,
}: {
  sale: ClaimableSale;
  open: boolean;
  onClose: () => void;
  onOpened: (claim: BuyerSaleClaim) => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  const [reason, setReason] = useState<SaleClaimReason | null>(null);
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reason) return setError(t('saleClaims.dialog.reasonRequired'));
    setSending(true);
    setError(null);
    try {
      const claim = await openSaleClaimUseCase({
        referenceType: sale.referenceType,
        referenceId: sale.referenceId,
        reason,
        ...(details.trim() ? { details: details.trim() } : {}),
      });
      onOpened(claim);
    } catch (err) {
      setError(t(saleClaimErrorKey(err)));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={t('saleClaims.dialog.title')}
      description={t('saleClaims.dialog.description')}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <fieldset className="space-y-2">
          <legend className="text-xs font-bold text-ink mb-1.5">
            {t('saleClaims.dialog.reasonLabel')}
          </legend>
          {SALE_CLAIM_REASONS.map((value) => (
            <label
              key={value}
              className="press min-h-11 px-3 py-2.5 rounded-xl border border-line bg-surface flex items-center gap-3 text-sm text-ink cursor-pointer has-[:checked]:border-accent-line has-[:checked]:bg-accent-soft focus-within:ring-2 focus-within:ring-teal-400/50"
            >
              <input
                type="radio"
                name={`${id}-reason`}
                value={value}
                checked={reason === value}
                onChange={() => {
                  setReason(value);
                  setError(null);
                }}
                className="w-4 h-4 accent-teal-500"
              />
              {t(`saleClaims.reason.${value}`)}
            </label>
          ))}
        </fieldset>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-details`} className="text-xs font-bold text-ink">
            {t('saleClaims.dialog.detailsLabel')}
          </label>
          <textarea
            id={`${id}-details`}
            value={details}
            maxLength={MAX_DETAILS}
            rows={4}
            onChange={(event) => setDetails(event.target.value)}
            aria-describedby={`${id}-details-hint`}
            className="w-full p-3 rounded-xl bg-surface border border-line text-sm text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50"
          />
          <p id={`${id}-details-hint`} className="text-[11px] text-ink/70">
            {t('saleClaims.dialog.detailsHint', { max: MAX_DETAILS })}
          </p>
        </div>
        {error && (
          <p
            role="alert"
            className="p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className="press w-full min-h-12 rounded-xl bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 text-sm font-bold flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {sending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {t(sending ? 'saleClaims.dialog.sending' : 'saleClaims.dialog.submit')}
        </button>
      </form>
    </Dialog>
  );
}

=== src/domain/payment/components/claims/saleClaims.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({ list: vi.fn(), open: vi.fn() }));
vi.mock('../../application/usecases/listMySaleClaimsUseCase', () => ({
  listMySaleClaimsUseCase: m.list,
}));
vi.mock('../../application/usecases/openSaleClaimUseCase', () => ({
  openSaleClaimUseCase: m.open,
}));

import type { BuyerSaleClaim, ClaimableSale } from '../../types/saleClaims';
import { isWithinClaimWindow } from '../../utils/claimWindow';
import { MySaleClaimsProvider } from './MySaleClaimsProvider';
import { SaleClaimAction } from './SaleClaimAction';

const HOUR = 3_600_000;
const now = Date.now();
const SALE: ClaimableSale = {
  referenceType: 'booking',
  referenceId: 'booking-1',
  serviceStartsAt: new Date(now - 3 * HOUR).toISOString(),
  serviceEndsAt: new Date(now - HOUR).toISOString(),
};
const CLAIM: BuyerSaleClaim = {
  id: 'booking_booking-1',
  referenceType: 'booking',
  referenceId: 'booking-1',
  reason: 'did_not_happen',
  status: 'open',
  openedAt: new Date(now).toISOString(),
  decideBy: new Date(now + 5 * 24 * HOUR).toISOString(),
};

function renderAction(sale: ClaimableSale = SALE) {
  return render(
    <MySaleClaimsProvider>
      <SaleClaimAction sale={sale} />
    </MySaleClaimsProvider>
  );
}

describe('relatar problema (D16, 2A)', () => {
  beforeEach(async () => {
    m.list.mockReset();
    m.open.mockReset();
    await i18n.changeLanguage('pt-BR');
  });

  it('janela: do início do serviço até 48 h depois do fim', () => {
    const at = (hours: number) => new Date(new Date(SALE.serviceEndsAt).getTime() + hours * HOUR);
    expect(isWithinClaimWindow(SALE, new Date(new Date(SALE.serviceStartsAt).getTime() - 1))).toBe(
      false
    );
    expect(isWithinClaimWindow(SALE, at(47))).toBe(true);
    expect(isWithinClaimWindow(SALE, at(49))).toBe(false);
  });

  it('sem reclamação, dentro do prazo: botão; envia o motivo e mostra o status', async () => {
    m.list.mockResolvedValue([]);
    m.open.mockResolvedValue(CLAIM);
    renderAction();
    fireEvent.click(await screen.findByRole('button', { name: 'Relatar problema' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar relato' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Escolha o que aconteceu.');
    fireEvent.click(screen.getByLabelText('Não aconteceu'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar relato' }));
    await waitFor(() =>
      expect(m.open).toHaveBeenCalledWith({
        referenceType: 'booking',
        referenceId: 'booking-1',
        reason: 'did_not_happen',
      })
    );
    expect(await screen.findByText('Problema relatado.')).toBeInTheDocument();
  });

  it('erro da API pelo code', async () => {
    m.list.mockResolvedValue([]);
    m.open.mockRejectedValue(new Error('CLAIM_ALREADY_EXISTS'));
    renderAction();
    fireEvent.click(await screen.findByRole('button', { name: 'Relatar problema' }));
    fireEvent.click(screen.getByLabelText('Outro motivo'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar relato' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Você já relatou um problema nesta compra.'
    );
  });

  it('com reclamação: só o status, com o valor reembolsado', async () => {
    m.list.mockResolvedValue([{ ...CLAIM, status: 'refunded', refundAmountMinor: 12000 }]);
    renderAction();
    expect(await screen.findByText('Reembolsado.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('R$');
    expect(screen.queryByRole('button', { name: 'Relatar problema' })).toBeNull();
  });

  it('fora do prazo e sem reclamação: nada', async () => {
    m.list.mockResolvedValue([]);
    const old = new Date(now - 72 * HOUR).toISOString();
    const { container } = renderAction({ ...SALE, serviceStartsAt: old, serviceEndsAt: old });
    await waitFor(() => expect(m.list).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});

=== src/domain/payment/hooks/mySaleClaimsContext.ts — ARQUIVO NOVO, conteúdo completo ===
import { createContext, useContext } from 'react';
import type { BuyerSaleClaim } from '../types/saleClaims';

export interface MySaleClaimsState {
  claims: BuyerSaleClaim[];
  loaded: boolean;
  add: (claim: BuyerSaleClaim) => void;
}

export const MySaleClaimsContext = createContext<MySaleClaimsState | null>(null);

/** Reclamação já aberta para a venda, se houver; `undefined` enquanto a lista não chegou. */
export function useSaleClaimFor(
  referenceType: string,
  referenceId: string
): { claim: BuyerSaleClaim | null | undefined; add: (claim: BuyerSaleClaim) => void } {
  const state = useContext(MySaleClaimsContext);
  if (!state) throw new Error('useSaleClaimFor precisa de MySaleClaimsProvider.');
  const claim = state.loaded
    ? (state.claims.find(
        (entry) => entry.referenceType === referenceType && entry.referenceId === referenceId
      ) ?? null)
    : undefined;
  return { claim, add: state.add };
}

=== src/domain/payment/index.ts — diff ===
@@ -3,6 +3,8 @@ export { PlanSubscriptionCard } from './components/PlanSubscriptionCard';
 export { StripePaymentElement } from './adapters/ui/StripePaymentElement';
 export { PartnerStripeConnectPortal } from './components/PartnerStripeConnectPortal';
 export { PaymentAccountNotice } from './components/PaymentAccountNotice';
+export { MySaleClaimsProvider } from './components/claims/MySaleClaimsProvider';
+export { SaleClaimAction } from './components/claims/SaleClaimAction';
 export { confirmPlanPaymentReturnUseCase } from './application/usecases/confirmPlanPaymentReturnUseCase';
 export { createPlanPaymentIntentUseCase } from './application/usecases/createPlanPaymentIntentUseCase';
 export { listPaymentAccountsUseCase } from './application/usecases/listPaymentAccountsUseCase';
@@ -17,3 +19,4 @@ export type {
   PaymentStatus,
   PlanPeriodOption,
 } from './types/payment';
+export type { ClaimableSale } from './types/saleClaims';

=== src/domain/payment/ports/receivablesApiPort.ts — diff ===
@@ -1,4 +1,5 @@
 import type { AccountDebtView, PayoutPage } from '../types/receivables';
+import type { BuyerSaleClaim, SaleClaimReason } from '../types/saleClaims';
 
 export interface ReceivablesApiPort {
   listPayouts(query: { accountKey?: string; cursor?: string; limit?: number }): Promise<PayoutPage>;
@@ -8,4 +9,11 @@ export interface ReceivablesApiPort {
     debtId: string,
     declaration: { reason: string; proofPath: string }
   ): Promise<AccountDebtView>;
+  listMySaleClaims(): Promise<BuyerSaleClaim[]>;
+  openSaleClaim(input: {
+    referenceType: 'ticket_order' | 'booking';
+    referenceId: string;
+    reason: SaleClaimReason;
+    details?: string;
+  }): Promise<BuyerSaleClaim>;
 }

=== src/domain/payment/types/saleClaims.ts — ARQUIVO NOVO, conteúdo completo ===
/** Reclamação do comprador (D16, 2A), como a API devolve. */
export const SALE_CLAIM_REASONS = [
  'did_not_happen',
  'not_as_described',
  'changed_without_notice',
  'safety_issue',
  'other',
] as const;

export type SaleClaimReason = (typeof SALE_CLAIM_REASONS)[number];

export type SaleClaimStatus = 'open' | 'refund_pending' | 'refunded' | 'released' | 'expired';

export interface BuyerSaleClaim {
  id: string;
  referenceType: 'ticket_order' | 'booking' | string;
  referenceId: string;
  reason: SaleClaimReason;
  status: SaleClaimStatus;
  openedAt: string;
  decideBy: string;
  refundAmountMinor?: number;
}

/** A venda sobre a qual o comprador pode reclamar; as datas vêm do pedido ou da reserva. */
export interface ClaimableSale {
  referenceType: 'ticket_order' | 'booking';
  referenceId: string;
  serviceStartsAt: string;
  serviceEndsAt: string;
}

=== src/domain/payment/utils/claimWindow.ts — ARQUIVO NOVO, conteúdo completo ===
import type { ClaimableSale } from '../types/saleClaims';

/** Janela de reclamação depois do fim do serviço, igual à do backend (D14). */
export const CLAIM_WINDOW_HOURS = 48;

/** Do início do serviço até 48 h depois do fim; quem decide é o backend. */
export function isWithinClaimWindow(sale: ClaimableSale, now: Date): boolean {
  const start = new Date(sale.serviceStartsAt).getTime();
  const end = new Date(sale.serviceEndsAt).getTime() + CLAIM_WINDOW_HOURS * 3_600_000;
  return now.getTime() >= start && now.getTime() <= end;
}

=== src/domain/payment/utils/saleClaimErrors.ts — ARQUIVO NOVO, conteúdo completo ===
const KNOWN_ERRORS = [
  'NOT_FOUND',
  'CLAIM_NOT_ALLOWED',
  'CLAIM_TOO_EARLY',
  'CLAIM_WINDOW_CLOSED',
  'CLAIM_ALREADY_EXISTS',
];

/** Erros chegam pelo `code` da API (AGENTS.md §12.5); o texto vem das traduções. */
export function saleClaimErrorKey(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  return `saleClaims.errors.${KNOWN_ERRORS.includes(code) ? code : 'UNAVAILABLE'}`;
}

=== src/domain/ticketing/components/UserTicketsHistoryView.tsx — diff ===
@@ -6,7 +6,7 @@ import {
   RefreshCw,
   Ticket as TicketIcon,
 } from 'lucide-react';
-import { useState } from 'react';
+import { type ReactNode, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { ConfirmDialog, type ConfirmDialogData } from '../../../ui/components/ConfirmDialog';
 import { GlassCard } from '../../../ui/components/GlassCard';
@@ -25,8 +25,29 @@ import { TransferTicketForm } from './wallet/TransferTicketForm';
 import { WalletOrderCard } from './wallet/WalletOrderCard';
 import { WalletTicketCard } from './wallet/WalletTicketCard';
 
+/** Venda que o comprador pode reclamar; o formato é o de `ClaimableSale` do payment. */
+export interface TicketOrderClaimSale {
+  referenceType: 'ticket_order';
+  referenceId: string;
+  serviceStartsAt: string;
+  serviceEndsAt: string;
+}
+
 interface UserTicketsHistoryViewProps {
   onBack?: () => void;
+  /** Slot da composição para "Relatar problema" (D16, 2A). */
+  renderClaimAction?: (sale: TicketOrderClaimSale) => ReactNode;
+}
+
+function claimSaleOf(order: TicketOrder): TicketOrderClaimSale | null {
+  if (!order.eventSnapshot) return null;
+  if (order.status !== 'paid' && order.status !== 'partially_refunded') return null;
+  return {
+    referenceType: 'ticket_order',
+    referenceId: order.id,
+    serviceStartsAt: order.eventSnapshot.startsAt,
+    serviceEndsAt: order.eventSnapshot.endsAt || order.eventSnapshot.startsAt,
+  };
 }
 
 const SQUARE_BUTTON =
@@ -39,7 +60,10 @@ function tabClass(active: boolean) {
   );
 }
 
-export function UserTicketsHistoryView({ onBack }: UserTicketsHistoryViewProps = {}) {
+export function UserTicketsHistoryView({
+  onBack,
+  renderClaimAction,
+}: UserTicketsHistoryViewProps = {}) {
   const { t, i18n } = useTranslation();
   const wallet = useUserTicketsAndOrders(true);
   const { tickets, orders, loading, error, reload } = wallet;
@@ -188,17 +212,21 @@ export function UserTicketsHistoryView({ onBack }: UserTicketsHistoryViewProps =
         </GlassCard>
       ) : (
         <div className="space-y-3">
-          {orders.map((order) => (
-            <WalletOrderCard
-              key={order.id}
-              order={order}
-              canResume={isPendingAndActive(order)}
-              canRefund={canRequestRefund(order, tickets, now)}
-              busy={actions.busy}
-              onResume={() => void actions.resumePayment(order)}
-              onRefund={() => askRefund(order)}
-            />
-          ))}
+          {orders.map((order) => {
+            const claimSale = renderClaimAction ? claimSaleOf(order) : null;
+            return (
+              <WalletOrderCard
+                key={order.id}
+                order={order}
+                canResume={isPendingAndActive(order)}
+                canRefund={canRequestRefund(order, tickets, now)}
+                busy={actions.busy}
+                onResume={() => void actions.resumePayment(order)}
+                onRefund={() => askRefund(order)}
+                claimAction={claimSale && renderClaimAction?.(claimSale)}
+              />
+            );
+          })}
         </div>
       )}

=== src/domain/ticketing/components/wallet/WalletOrderCard.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { CalendarClock, Clock, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../../ui/components/GlassCard';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { rescheduleRefundDeadline } from '../../../../shared/utils/rescheduleRefundDeadline';
import type { TicketOrder } from '../../types/ticketing';

interface WalletOrderCardProps {
  order: TicketOrder;
  canResume: boolean;
  canRefund: boolean;
  busy: boolean;
  onResume: () => void;
  onRefund: () => void;
  /** "Relatar problema", montado pela composição (D16, 2A). */
  claimAction?: ReactNode;
}

export function WalletOrderCard({
  order,
  canResume,
  canRefund,
  busy,
  onResume,
  onRefund,
  claimAction,
}: WalletOrderCardProps) {
  const { t, i18n } = useTranslation();
  const dateFormat = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(i18n.language, { timeZone: 'America/Fortaleza', ...options });
  const refundUntil =
    order.eventSnapshot && order.status !== 'refunded' && order.status !== 'canceled'
      ? rescheduleRefundDeadline(order.rescheduledAt, order.eventSnapshot.startsAt, new Date())
      : null;
  return (
    <GlassCard className="p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-bold text-ink">
            {t('ticketWallet.order', {
              id: order.id.slice(0, 8),
              amount: formatMoneyMinor(order.totalMinor, i18n.language),
            })}
          </p>
          <p className="text-xs text-ink/70">
            {dateFormat({ dateStyle: 'medium' }).format(new Date(order.createdAt))} •{' '}
            <span className="font-semibold text-accent">
              {t(`ticketWallet.orderStatus.${order.status}`, { defaultValue: order.status })}
            </span>
          </p>
          {order.expiresAt && order.status === 'pending_payment' && (
            <p className="text-xs text-warn flex items-center gap-1">
              <Clock size={12} aria-hidden="true" />
              {t('ticketWallet.reservedUntil', {
                time: dateFormat({ timeStyle: 'short' }).format(new Date(order.expiresAt)),
              })}
            </p>
          )}
        </div>

        {(canResume || canRefund) && (
          <div className="flex items-center gap-2 flex-wrap">
            {canResume && (
              <button
                type="button"
                disabled={busy}
                onClick={onResume}
                className="min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <Clock size={14} aria-hidden="true" />
                {t('ticketWallet.actions.resume')}
              </button>
            )}
            {canRefund && (
              <button
                type="button"
                disabled={busy}
                onClick={onRefund}
                className="min-h-11 px-3.5 rounded-xl bg-danger-soft border border-danger-line text-xs font-bold text-danger flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <RotateCcw size={14} aria-hidden="true" />
                {t('ticketWallet.actions.refund')}
              </button>
            )}
          </div>
        )}
      </div>
      {refundUntil && (
        <p className="px-3 py-2 rounded-xl border border-info-line bg-info-soft text-xs text-info flex items-start gap-2">
          <CalendarClock size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
          {t('ticketWallet.rescheduledNotice', {
            date: dateFormat({ dateStyle: 'medium', timeStyle: 'short' }).format(
              new Date(refundUntil)
            ),
          })}
        </p>
      )}
      {claimAction}
    </GlassCard>
  );
}

=== src/shared/i18n/bookingsResources.ts — diff ===
@@ -7,6 +7,7 @@ export interface BookingsTranslation {
     retry: string;
     duration: string;
     meetingPoint: string;
+    rescheduledNotice: string;
     chooseSlot: string;
     noSlots: string;
     spotsLeft_one: string;
@@ -204,6 +205,8 @@ export const bookingsPtBR: BookingsTranslation = {
     retry: 'Tentar novamente',
     duration: 'Duração: {{minutes}} min',
     meetingPoint: 'Ponto de encontro: {{address}}',
+    rescheduledNotice:
+      'Nova data marcada pelo parceiro. Até {{date}} você pode cancelar com reembolso integral.',
     chooseSlot: 'Escolha o horário',
     noSlots: 'Nenhum horário disponível nos próximos 30 dias.',
     spotsLeft_one: '{{count}} vaga',
@@ -412,6 +415,8 @@ export const bookingsEn: BookingsTranslation = {
     retry: 'Try again',
     duration: 'Duration: {{minutes}} min',
     meetingPoint: 'Meeting point: {{address}}',
+    rescheduledNotice:
+      'The partner set a new date. Until {{date}} you can cancel for a full refund.',
     chooseSlot: 'Choose a time',
     noSlots: 'No time slots available in the next 30 days.',
     spotsLeft_one: '{{count}} spot',
@@ -616,6 +621,8 @@ export const bookingsFr: BookingsTranslation = {
     retry: 'Réessayer',
     duration: 'Durée : {{minutes}} min',
     meetingPoint: 'Point de rendez-vous : {{address}}',
+    rescheduledNotice:
+      'Le partenaire a fixé une nouvelle date. Jusqu’au {{date}}, vous pouvez annuler avec un remboursement intégral.',
     chooseSlot: 'Choisissez un créneau',
     noSlots: 'Aucun créneau disponible dans les 30 prochains jours.',
     spotsLeft_one: '{{count}} place',

=== src/shared/i18n/resources.ts — diff ===
@@ -28,6 +28,12 @@ import {
   receivablesFr,
   receivablesPtBR,
 } from './receivablesResources';
+import {
+  saleClaimsEn,
+  saleClaimsFr,
+  saleClaimsPtBR,
+  type SaleClaimsTranslation,
+} from './saleClaimsResources';
 import {
   type TicketSessionsTranslation,
   ticketSessionsEn,
@@ -73,6 +79,7 @@ export interface TranslationResource {
   partners: PartnersTranslation;
   paymentAccounts: PaymentAccountsTranslation;
   receivables: ReceivablesTranslation;
+  saleClaims: SaleClaimsTranslation;
   ticketSessions: TicketSessionsTranslation;
   salesPolicy: SalesPolicyTranslation;
   ticketCheckout: TicketCheckoutTranslation;
@@ -301,6 +308,7 @@ const ptBR: TranslationResource = {
   partners: partnersPtBR,
   paymentAccounts: paymentAccountsPtBR,
   receivables: receivablesPtBR,
+  saleClaims: saleClaimsPtBR,
   ticketSessions: ticketSessionsPtBR,
   salesPolicy: salesPolicyPtBR,
   ticketCheckout: ticketCheckoutPtBR,
@@ -580,6 +588,7 @@ const en: TranslationResource = {
   partners: partnersEn,
   paymentAccounts: paymentAccountsEn,
   receivables: receivablesEn,
+  saleClaims: saleClaimsEn,
   ticketSessions: ticketSessionsEn,
   salesPolicy: salesPolicyEn,
   ticketCheckout: ticketCheckoutEn,
@@ -853,6 +862,7 @@ const fr: TranslationResource = {
   partners: partnersFr,
   paymentAccounts: paymentAccountsFr,
   receivables: receivablesFr,
+  saleClaims: saleClaimsFr,
   ticketSessions: ticketSessionsFr,
   salesPolicy: salesPolicyFr,
   ticketCheckout: ticketCheckoutFr,

=== src/shared/i18n/saleClaimsResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos de "Relatar problema" do comprador (D16, 2A). pt-BR é a fonte. */
type ClaimReasons = {
  did_not_happen: string;
  not_as_described: string;
  changed_without_notice: string;
  safety_issue: string;
  other: string;
};
type ClaimStatuses = {
  open: string;
  refund_pending: string;
  refunded: string;
  released: string;
  expired: string;
};

export interface SaleClaimsTranslation {
  action: string;
  until: string;
  dialog: {
    title: string;
    description: string;
    reasonLabel: string;
    reasonRequired: string;
    detailsLabel: string;
    detailsHint: string;
    submit: string;
    sending: string;
  };
  reason: ClaimReasons;
  status: ClaimStatuses;
  statusDetail: ClaimStatuses;
  errors: {
    NOT_FOUND: string;
    CLAIM_NOT_ALLOWED: string;
    CLAIM_TOO_EARLY: string;
    CLAIM_WINDOW_CLOSED: string;
    CLAIM_ALREADY_EXISTS: string;
    UNAVAILABLE: string;
  };
}

export const saleClaimsPtBR: SaleClaimsTranslation = {
  action: 'Relatar problema',
  until: 'Até {{date}}',
  dialog: {
    title: 'Relatar problema',
    description:
      'Conte o que aconteceu. O pagamento ao organizador fica retido até a nossa análise, em até 5 dias.',
    reasonLabel: 'O que aconteceu?',
    reasonRequired: 'Escolha o que aconteceu.',
    detailsLabel: 'Detalhes (opcional)',
    detailsHint: 'Até {{max}} caracteres. Não inclua documentos nem dados de cartão.',
    submit: 'Enviar relato',
    sending: 'Enviando…',
  },
  reason: {
    did_not_happen: 'Não aconteceu',
    not_as_described: 'Diferente do anunciado',
    changed_without_notice: 'Mudou sem aviso',
    safety_issue: 'Problema de segurança',
    other: 'Outro motivo',
  },
  status: {
    open: 'Problema relatado.',
    refund_pending: 'Reembolso em andamento.',
    refunded: 'Reembolsado.',
    released: 'Análise concluída.',
    expired: 'Análise encerrada.',
  },
  statusDetail: {
    open: 'Vamos responder até {{date}}.',
    refund_pending: 'O valor volta pelo mesmo meio de pagamento.',
    refunded: '{{amount}} devolvidos pelo mesmo meio de pagamento.',
    released: 'Não houve reembolso nesta compra.',
    expired: 'O prazo de análise terminou sem reembolso.',
  },
  errors: {
    NOT_FOUND: 'Compra não encontrada.',
    CLAIM_NOT_ALLOWED: 'Esta compra não tem valor a reclamar.',
    CLAIM_TOO_EARLY: 'Antes do início, use o cancelamento da compra.',
    CLAIM_WINDOW_CLOSED: 'O prazo para relatar um problema era de 48 h depois do fim.',
    CLAIM_ALREADY_EXISTS: 'Você já relatou um problema nesta compra.',
    UNAVAILABLE: 'Não foi possível enviar agora. Tente de novo.',
  },
};

export const saleClaimsEn: SaleClaimsTranslation = {
  action: 'Report a problem',
  until: 'Until {{date}}',
  dialog: {
    title: 'Report a problem',
    description:
      'Tell us what happened. The organizer’s payment is held until we review it, within 5 days.',
    reasonLabel: 'What happened?',
    reasonRequired: 'Choose what happened.',
    detailsLabel: 'Details (optional)',
    detailsHint: 'Up to {{max}} characters. Don’t include documents or card details.',
    submit: 'Send report',
    sending: 'Sending…',
  },
  reason: {
    did_not_happen: 'It didn’t happen',
    not_as_described: 'Not as described',
    changed_without_notice: 'Changed without notice',
    safety_issue: 'Safety issue',
    other: 'Other reason',
  },
  status: {
    open: 'Problem reported.',
    refund_pending: 'Refund in progress.',
    refunded: 'Refunded.',
    released: 'Review completed.',
    expired: 'Review closed.',
  },
  statusDetail: {
    open: 'We’ll reply by {{date}}.',
    refund_pending: 'The amount goes back to the same payment method.',
    refunded: '{{amount}} returned to the same payment method.',
    released: 'There was no refund for this purchase.',
    expired: 'The review period ended with no refund.',
  },
  errors: {
    NOT_FOUND: 'Purchase not found.',
    CLAIM_NOT_ALLOWED: 'This purchase has no amount to claim.',
    CLAIM_TOO_EARLY: 'Before it starts, cancel the purchase instead.',
    CLAIM_WINDOW_CLOSED: 'Problems had to be reported within 48 h after the end.',
    CLAIM_ALREADY_EXISTS: 'You already reported a problem with this purchase.',
    UNAVAILABLE: 'Couldn’t send it now. Try again.',
  },
};

export const saleClaimsFr: SaleClaimsTranslation = {
  action: 'Signaler un problème',
  until: 'Jusqu’au {{date}}',
  dialog: {
    title: 'Signaler un problème',
    description:
      'Dites-nous ce qui s’est passé. Le paiement de l’organisateur est retenu jusqu’à notre examen, sous 5 jours.',
    reasonLabel: 'Que s’est-il passé ?',
    reasonRequired: 'Choisissez ce qui s’est passé.',
    detailsLabel: 'Détails (facultatif)',
    detailsHint: 'Jusqu’à {{max}} caractères. N’indiquez ni documents ni données de carte.',
    submit: 'Envoyer le signalement',
    sending: 'Envoi…',
  },
  reason: {
    did_not_happen: 'Cela n’a pas eu lieu',
    not_as_described: 'Différent de l’annonce',
    changed_without_notice: 'Modifié sans prévenir',
    safety_issue: 'Problème de sécurité',
    other: 'Autre motif',
  },
  status: {
    open: 'Problème signalé.',
    refund_pending: 'Remboursement en cours.',
    refunded: 'Remboursé.',
    released: 'Examen terminé.',
    expired: 'Examen clos.',
  },
  statusDetail: {
    open: 'Nous répondrons avant le {{date}}.',
    refund_pending: 'Le montant revient sur le même moyen de paiement.',
    refunded: '{{amount}} remboursés sur le même moyen de paiement.',
    released: 'Aucun remboursement pour cet achat.',
    expired: 'Le délai d’examen s’est terminé sans remboursement.',
  },
  errors: {
    NOT_FOUND: 'Achat introuvable.',
    CLAIM_NOT_ALLOWED: 'Cet achat n’a aucun montant à réclamer.',
    CLAIM_TOO_EARLY: 'Avant le début, annulez plutôt l’achat.',
    CLAIM_WINDOW_CLOSED: 'Le signalement devait être fait dans les 48 h après la fin.',
    CLAIM_ALREADY_EXISTS: 'Vous avez déjà signalé un problème pour cet achat.',
    UNAVAILABLE: 'Envoi impossible pour le moment. Réessayez.',
  },
};

=== src/shared/i18n/ticketWalletResources.ts — diff ===
@@ -34,6 +34,7 @@ export interface TicketWalletTranslation {
   qrSigned: string;
   order: string;
   reservedUntil: string;
+  rescheduledNotice: string;
   refundConfirm: string;
   actions: { showQr: string; reissueQr: string; transfer: string; resume: string; refund: string };
   ticketStatus: Record<TicketStatusKey, string>;
@@ -63,6 +64,8 @@ export const ticketWalletPtBR: TicketWalletTranslation = {
   qrSigned: 'QR assinado • v{{version}}',
   order: 'Pedido #{{id}} • {{amount}}',
   reservedUntil: 'Reserva válida até {{time}}',
+  rescheduledNotice:
+    'Nova data marcada pelo organizador. Até {{date}} você pode cancelar com reembolso integral, inclusive a taxa de serviço.',
   refundConfirm: 'Cancelar o pedido e receber {{amount}} de reembolso?',
   actions: {
     showQr: 'Ver QR',
@@ -130,6 +133,8 @@ export const ticketWalletEn: TicketWalletTranslation = {
   qrSigned: 'Signed QR • v{{version}}',
   order: 'Order #{{id}} • {{amount}}',
   reservedUntil: 'Reservation valid until {{time}}',
+  rescheduledNotice:
+    'The organizer set a new date. Until {{date}} you can cancel for a full refund, service fee included.',
   refundConfirm: 'Cancel the order and get a {{amount}} refund?',
   actions: {
     showQr: 'Show QR',
@@ -197,6 +202,8 @@ export const ticketWalletFr: TicketWalletTranslation = {
   qrSigned: 'QR signé • v{{version}}',
   order: 'Commande n° {{id}} • {{amount}}',
   reservedUntil: 'Réservation valable jusqu’à {{time}}',
+  rescheduledNotice:
+    'L’organisateur a fixé une nouvelle date. Jusqu’au {{date}}, vous pouvez annuler avec un remboursement intégral, frais de service compris.',
   refundConfirm: 'Annuler la commande et recevoir un remboursement de {{amount}} ?',
   actions: {
     showQr: 'Voir le QR',

=== src/shared/utils/rescheduleRefundDeadline.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { rescheduleRefundDeadline } from './rescheduleRefundDeadline';

const AT = '2026-11-01T12:00:00.000Z';

describe('rescheduleRefundDeadline', () => {
  it('7 dias depois do aviso quando o serviço é depois disso', () => {
    expect(rescheduleRefundDeadline(AT, '2026-12-01T12:00:00.000Z', new Date(AT))).toBe(
      '2026-11-08T12:00:00.000Z'
    );
  });

  it('não passa do início do serviço', () => {
    expect(rescheduleRefundDeadline(AT, '2026-11-03T12:00:00.000Z', new Date(AT))).toBe(
      '2026-11-03T12:00:00.000Z'
    );
  });

  it('null sem remarcação ou com o prazo vencido', () => {
    expect(rescheduleRefundDeadline(null, '2026-12-01T12:00:00.000Z', new Date(AT))).toBeNull();
    expect(
      rescheduleRefundDeadline(AT, '2026-12-01T12:00:00.000Z', new Date('2026-11-09T00:00:00Z'))
    ).toBeNull();
  });
});

=== src/shared/utils/rescheduleRefundDeadline.ts — ARQUIVO NOVO, conteúdo completo ===
import { RESCHEDULE_REFUND_DAYS } from './cancellationPolicy';

const DAY_MS = 24 * 3_600_000;

/**
 * Até quando a compra remarcada pode ser cancelada com reembolso integral (D16, 4A): 7 dias depois
 * do aviso, sem passar do início. `null` quando o prazo já acabou ou não houve remarcação.
 */
export function rescheduleRefundDeadline(
  rescheduledAt: string | null | undefined,
  startsAt: string,
  now: Date
): string | null {
  if (!rescheduledAt) return null;
  const end = Math.min(
    new Date(rescheduledAt).getTime() + RESCHEDULE_REFUND_DAYS * DAY_MS,
    new Date(startsAt).getTime()
  );
  return now.getTime() < end ? new Date(end).toISOString() : null;
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run src/app/compositions/BuyerBookingsComposition.tsx src/app/compositions/BuyerTicketWalletComposition.tsx src/app/menu/SideMenu.tsx src/domain/bookings/components/buyer/BuyerBookingCard.tsx src/domain/bookings/components/buyer/MyBookingsView.tsx src/domain/payment/api/apiReceivablesAdapter.ts src/domain/payment/application/usecases/listMySaleClaimsUseCase.ts src/domain/payment/application/usecases/openSaleClaimUseCase.ts src/domain/payment/components/claims/MySaleClaimsProvider.tsx src/domain/payment/components/claims/SaleClaimAction.tsx src/domain/payment/components/claims/SaleClaimDialog.tsx src/domain/payment/components/claims/saleClaims.test.tsx src/domain/payment/hooks/mySaleClaimsContext.ts src/domain/payment/index.ts src/domain/payment/ports/receivablesApiPort.ts src/domain/payment/types/saleClaims.ts src/domain/payment/utils/claimWindow.ts src/domain/payment/utils/saleClaimErrors.ts src/domain/ticketing/components/UserTicketsHistoryView.tsx src/domain/ticketing/components/wallet/WalletOrderCard.tsx src/shared/i18n/bookingsResources.ts src/shared/i18n/resources.ts src/shared/i18n/saleClaimsResources.ts src/shared/i18n/ticketWalletResources.ts src/shared/utils/rescheduleRefundDeadline.test.ts src/shared/utils/rescheduleRefundDeadline.ts` (todos verdes). Não precisa rodar a suíte inteira.
- abra Minhas reservas e Ingressos › Pedidos nos temas claro e escuro: Relatar problema numa compra cujo serviço terminou há menos de 48 h, o status depois de enviar e o aviso numa compra remarcada.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
