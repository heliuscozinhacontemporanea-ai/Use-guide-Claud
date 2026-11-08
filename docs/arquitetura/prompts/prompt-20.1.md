# Prompt 20.1 — Reservas, pedidos e Financeiro do admin no visual novo (D17)

> Lote 17, gerado dos commits de referência `1bcb82b`, `c3ac39f` e `f5d23ad` da branch `claude/agents-md-v2`. Aplique depois do 20.0. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 20.1 — Reservas, pedidos e Financeiro do admin no visual novo (D17)

Segunda parte do visual novo. Telas conferidas por prints e aprovadas em 2026-10-27; referência em docs/design/base-d17.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e os apagados. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova. Telas nos dois temas e textos nos 3 idiomas (§11, §12).

O QUE MUDA:
1) Design system (src/ui/components): SegmentedControl (abas em pílula, a ativa invertida), StatusText (status com ponto colorido, sem caixa), TextButton (ação secundária em texto) e BackButton (voltar só com o chevron <).
2) Minhas reservas: abas Próximas e Anteriores; BuyerBookingCard com ícone, o que foi comprado e quando, e uma linha com o que fazer agora (cancelar, relatar ou status).
3) Ingressos: abas segmentadas; o pedido mostra o nome e a data do evento, o código curto (#10 caracteres, sem destaque: 50% no escuro e 65% no claro), a quantidade de ingressos e o valor.
4) Relatar problema (payment): linha "Algo deu errado? Até…" com a ação em texto; status da reclamação em uma linha.
5) Financeiro do admin: filas em lista compacta (QueueRow); detalhes e decisão em folha (reclamação e força maior: ForceMajeureSheet); multa como interruptor; perdão de dívida em texto; rótulos curtos das dívidas. Saem SaleClaimQueueCard, ForceMajeureReviewCard, AdminDebtCard e SellerLine.
6) Voltar com o chevron também nos demais botões de voltar (seta trocada).
7) docs/design/base-d17/README.md: os padrões das telas de referência (os prints ficam só na branch de referência). docs/arquitetura/decisoes.md: D17 com o voltar e o código do pedido.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/decisoes.md (alterar)
- docs/design/base-d17/README.md (criar)
- src/domain/bookings/components/buyer/BookingFlow.tsx (alterar)
- src/domain/bookings/components/buyer/BuyerBookingCard.tsx (alterar)
- src/domain/bookings/components/buyer/MyBookingsView.tsx (alterar)
- src/domain/bookings/components/partner/PartnerOffersManager.tsx (alterar)
- src/domain/bookings/utils/dates.ts (alterar)
- src/domain/insights/components/ReportsView.tsx (alterar)
- src/domain/payment/components/accounts/PaymentAccountWorkspace.tsx (alterar)
- src/domain/payment/components/admin/AdminDebtCard.tsx (apagar)
- src/domain/payment/components/admin/AdminDebtQueue.tsx (alterar)
- src/domain/payment/components/admin/AdminFinanceQueues.tsx (alterar)
- src/domain/payment/components/admin/AdminQueueFrame.tsx (alterar)
- src/domain/payment/components/admin/ForceMajeureQueue.tsx (alterar)
- src/domain/payment/components/admin/ForceMajeureReviewCard.tsx (apagar)
- src/domain/payment/components/admin/ForceMajeureSheet.tsx (criar)
- src/domain/payment/components/admin/QueueRow.tsx (criar)
- src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx (alterar)
- src/domain/payment/components/admin/SaleClaimQueue.tsx (alterar)
- src/domain/payment/components/admin/SaleClaimQueueCard.tsx (apagar)
- src/domain/payment/components/admin/SellerLine.tsx (apagar)
- src/domain/payment/components/admin/adminFinance.test.tsx (alterar)
- src/domain/payment/components/admin/adminFinanceStyles.ts (alterar)
- src/domain/payment/components/claims/SaleClaimAction.tsx (alterar)
- src/domain/payment/components/claims/saleClaims.test.tsx (alterar)
- src/domain/payment/utils/receivablesFormat.ts (alterar)
- src/domain/ticketing/components/CheckoutResultView.tsx (alterar)
- src/domain/ticketing/components/UserTicketsHistoryView.tsx (alterar)
- src/domain/ticketing/components/wallet/WalletOrderCard.tsx (alterar)
- src/shared/i18n/adminFinanceResources.ts (alterar)
- src/shared/i18n/bookingsResources.ts (alterar)
- src/shared/i18n/saleClaimsResources.ts (alterar)
- src/shared/i18n/ticketWalletResources.ts (alterar)
- src/ui/components/BackButton.tsx (criar)
- src/ui/components/SegmentedControl.tsx (criar)
- src/ui/components/StatusText.tsx (criar)
- src/ui/components/TextButton.tsx (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/decisoes.md — diff ===
@@ -255,6 +255,9 @@ Propostas montadas em preview (Minhas reservas, Pedidos e Financeiro do admin) e
 * **Cor com significado:** verde-água para ação, amarelo para pendente, verde para concluído, vermelho para perigo. Status como texto com ponto colorido, sem caixa com borda.
 * **Menos informação por vez:** cartão com o que foi comprado e quando, e uma linha com o que a pessoa precisa saber ou fazer agora. Detalhes ao tocar (folha). Abas no lugar de listas longas (ex.: Próximas e Anteriores).
 * **Uma ação principal por tela** (botão cheio); as demais como texto ou ícone.
+* **Voltar** só com o chevron `<` (`BackButton` do design system), sem caixa e sem seta.
+* **Identificadores** (ex.: código do pedido `#vdV5jh456n`) logo abaixo do nome do serviço, discretos.
+* **Referência visual:** `docs/design/base-d17/`.
 * **Foto do item** nos cartões sempre que houver; sem foto, ícone do tipo de serviço.
 * **AGENTS.md §11.1** atualizado pela S16 (prompt A6).
 * **Prompts:** A6 (regra), 20.0 (base visual: tokens, fundo e `GlassCard` sólido) e 20.1 (as três telas das propostas), no fim do lote 17; as demais telas seguem tela a tela, junto com o 19.x.

=== docs/design/base-d17/README.md — ARQUIVO NOVO, conteúdo completo ===
# Base visual D17 — telas de referência

Prints aprovados em 2026-10-27, tirados do app depois dos prompts 20.0 e 20.1 (reservas e pedidos atualizados com o voltar `<` e o código do pedido). São a referência para levar as demais telas ao visual novo (AGENTS.md §11.1, decisão D17 em `docs/arquitetura/decisoes.md`).

| Arquivo | Tela | Tema |
|---|---|---|
| `dark-1-reservas-proximas.png` | Minhas reservas › Próximas (remarcação e cancelar) | escuro |
| `dark-2-reservas-anteriores.png` | Minhas reservas › Anteriores (relatar, em análise, reembolsado) | escuro |
| `light-2-reservas-anteriores.png` | Minhas reservas › Anteriores | claro |
| `dark-4-pedidos.png` / `light-4-pedidos.png` | Ingressos › Pedidos | escuro / claro |
| `dark-5-admin-reclamacoes.png` | Admin › Financeiro › Reclamações (lista compacta) | escuro |
| `light-6-admin-decidir.png` | Folha de decisão da reclamação | claro |
| `dark-8-admin-forca-maior-folha.png` | Folha da força maior | escuro |
| `dark-9-admin-dividas.png` | Admin › Financeiro › Dívidas | escuro |
| `fr-reservas-anteriores.png` | Minhas reservas em francês | escuro |
| `light-desktop-admin.png` | Financeiro do admin no desktop | claro |

## Padrões que estas telas fixam

- Fundo liso (`bg-app`) e cartões sólidos (`bg-surface`, borda `border-line`, cantos de 20 px).
- Cartão com o que é e quando; uma linha só, separada por divisória, com o que a pessoa precisa saber ou fazer agora.
- Status como texto com ponto colorido (`StatusText`), sem caixa com borda.
- Abas em pílula com a ativa invertida (`SegmentedControl`).
- Ação secundária em texto (`TextButton`); botão cheio só na ação principal da tela.
- Voltar só com o chevron `<` (`BackButton`), sem caixa e sem seta.
- Identificador (código do pedido) logo abaixo do nome, sem destaque: texto a 50% no escuro e 65% no claro (contraste AA).
- Filas e listas longas em lista compacta (título, contexto, status e valor); detalhes e decisão na folha inferior (`Dialog`).

=== src/domain/bookings/components/buyer/BookingFlow.tsx — diff ===
@@ -1,4 +1,4 @@
-import { ArrowLeft } from 'lucide-react';
+import { ChevronLeft } from 'lucide-react';
 import { useMemo, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { BUYER_TERMS_VERSION } from '../../../../shared/constants/legalTerms';
@@ -80,7 +80,7 @@ export function BookingFlow({
     return (
       <div className="space-y-3">
         <button type="button" onClick={() => setStep('select')} className={BUTTON_SECONDARY}>
-          <ArrowLeft size={13} className="inline mr-1" aria-hidden="true" />
+          <ChevronLeft size={13} className="inline mr-1" aria-hidden="true" />
           {t('bookings.buyer.back')}
         </button>
         <ParticipantsForm

=== src/domain/bookings/components/buyer/BuyerBookingCard.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { CalendarClock, Compass, MapPin, Ticket } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { rescheduleRefundDeadline } from '../../../../shared/utils/rescheduleRefundDeadline';
import { StatusText, type StatusTone } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import type { BookingStatus, BookingSummary } from '../../types/bookings';
import { formatDayShort, formatSlotDateTime } from '../../utils/dates';
import { formatMinor } from '../../utils/money';

const STATUS_TONE: Partial<Record<BookingStatus, StatusTone>> = {
  pending_payment: 'warn',
  canceled: 'muted',
  refunded: 'muted',
  expired: 'muted',
  no_show: 'danger',
  disputed: 'warn',
};

/**
 * Cartão de reserva do comprador (D17): o que foi comprado e quando, e uma linha só com o que a
 * pessoa precisa saber ou fazer agora.
 */
export function BuyerBookingCard({
  booking,
  upcoming,
  onCancel,
  claimAction,
}: {
  booking: BookingSummary;
  upcoming: boolean;
  onCancel?: () => void;
  /** "Relatar", montado pela composição (D16, 2A). */
  claimAction?: ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const Icon = booking.kind === 'private_entry' ? Ticket : Compass;
  const refundUntil =
    booking.status === 'confirmed'
      ? rescheduleRefundDeadline(booking.rescheduledAt, booking.offer.startsAt, new Date())
      : null;
  const price = formatMinor(booking.totalMinor, i18n.language);
  const statusTone = STATUS_TONE[booking.status];
  const refund = booking.cancellation?.refundAmountMinor ?? 0;

  const footer: ReactNode = statusTone ? (
    <StatusText tone={statusTone}>
      {refund > 0
        ? t('bookings.buyer.refundedAmount', { amount: formatMinor(refund, i18n.language) })
        : t(`bookings.bookingStatus.${booking.status}`)}
    </StatusText>
  ) : upcoming ? (
    (booking.offer.meetingPoint || onCancel) && (
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 inline-flex items-center gap-1.5 text-[13px] text-ink/70">
          {booking.offer.meetingPoint && (
            <>
              <MapPin size={15} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{booking.offer.meetingPoint}</span>
            </>
          )}
        </span>
        {onCancel && (
          <TextButton tone="danger" onClick={onCancel}>
            {t('bookings.buyer.cancelShort')}
          </TextButton>
        )}
      </div>
    )
  ) : (
    claimAction || (
      <StatusText tone="muted">{t(`bookings.bookingStatus.${booking.status}`)}</StatusText>
    )
  );

  return (
    <li className="p-4 rounded-[20px] bg-surface border border-line">
      <div className="flex gap-3">
        <div className="w-12 h-12 shrink-0 rounded-2xl bg-accent-soft text-accent flex items-center justify-center">
          <Icon size={22} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-ink leading-snug break-words">
            {booking.offer.title}
          </p>
          <p className="text-sm text-ink/70 mt-0.5">
            {upcoming
              ? `${formatSlotDateTime(booking.offer.startsAt, i18n.language)} · ${t(
                  'bookings.bookingsList.participants',
                  { count: booking.participantsCount }
                )}`
              : `${formatDayShort(booking.offer.startsAt, i18n.language)} · ${price}`}
          </p>
        </div>
      </div>
      {refundUntil && (
        <p className="mt-3 flex items-start gap-2 text-[13px] text-info">
          <CalendarClock size={16} className="shrink-0 mt-px" aria-hidden="true" />
          {t('bookings.buyer.rescheduledNotice', {
            date: formatDayShort(refundUntil, i18n.language),
          })}
        </p>
      )}
      {footer && <div className="mt-3 pt-3 border-t border-line">{footer}</div>}
    </li>
  );
}

=== src/domain/bookings/components/buyer/MyBookingsView.tsx — diff ===
@@ -1,7 +1,8 @@
-import { ArrowLeft } from 'lucide-react';
 import { type ReactNode, useState } from 'react';
 import { useTranslation } from 'react-i18next';
+import { BackButton } from '../../../../ui/components/BackButton';
 import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
+import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
 import { useMyBookings } from '../../hooks/useMyBookings';
 import type { BookingSummary } from '../../types/bookings';
 import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
@@ -48,6 +49,7 @@ export function MyBookingsView({
   const { data, loading, error, hasMore, reload, loadMore, cancel } = useMyBookings();
   const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
   const [notice, setNotice] = useState<string | null>(null);
+  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
   const now = new Date();
   const upcoming = data.filter((booking) => new Date(booking.offer.startsAt) > now);
   const past = data.filter((booking) => new Date(booking.offer.startsAt) <= now);
@@ -85,58 +87,54 @@ export function MyBookingsView({
     });
   };
 
+  const shown = tab === 'upcoming' ? upcoming : past;
+
   return (
     <section className="w-full space-y-5">
-      <div className="flex items-center gap-3">
-        <button
-          type="button"
-          onClick={onBack}
-          aria-label={t('bookings.buyer.back')}
-          className="w-11 h-11 shrink-0 rounded-xl bg-surface hover:bg-accent-soft border border-line flex items-center justify-center text-ink/70 focus-visible:ring-2 focus-visible:ring-teal-400/50"
-        >
-          <ArrowLeft size={16} aria-hidden="true" />
-        </button>
-        <h2 className="text-xl font-display font-black text-ink">
+      <div className="flex items-center gap-2">
+        <BackButton label={t('bookings.buyer.back')} onClick={onBack} />
+        <h2 className="text-[22px] font-display font-bold text-ink">
           {t('bookings.buyer.myBookingsTitle')}
         </h2>
       </div>
+      <SegmentedControl
+        label={t('bookings.buyer.tabsLabel')}
+        value={tab}
+        onChange={setTab}
+        options={[
+          { value: 'upcoming', label: t('bookings.buyer.upcomingTab', { count: upcoming.length }) },
+          { value: 'past', label: t('bookings.buyer.pastTab', { count: past.length }) },
+        ]}
+      />
       {notice && (
         <p role="status" className="text-sm text-accent">
           {notice}
         </p>
       )}
       {error && <ListError message={error} onRetry={() => void reload()} />}
-      {!error && !loading && data.length === 0 && (
-        <ListEmpty message={t('bookings.buyer.emptyBookings')} />
-      )}
-      {upcoming.length > 0 && (
-        <div className="space-y-2">
-          <h2 className="text-sm font-bold text-ink/80">{t('bookings.buyer.upcoming')}</h2>
-          <ul className="space-y-2">
-            {upcoming.map((booking) => (
-              <BuyerBookingCard
-                key={booking.id}
-                booking={booking}
-                claimAction={claimActionOf(booking)}
-                onCancel={booking.status === 'confirmed' ? () => requestCancel(booking) : undefined}
-              />
-            ))}
-          </ul>
-        </div>
+      {!error && !loading && shown.length === 0 && (
+        <ListEmpty
+          message={t(
+            tab === 'upcoming' ? 'bookings.buyer.emptyUpcoming' : 'bookings.buyer.emptyPast'
+          )}
+        />
       )}
-      {past.length > 0 && (
-        <div className="space-y-2">
-          <h2 className="text-sm font-bold text-ink/80">{t('bookings.buyer.past')}</h2>
-          <ul className="space-y-2">
-            {past.map((booking) => (
-              <BuyerBookingCard
-                key={booking.id}
-                booking={booking}
-                claimAction={claimActionOf(booking)}
-              />
-            ))}
-          </ul>
-        </div>
+      {shown.length > 0 && (
+        <ul className="space-y-3">
+          {shown.map((booking) => (
+            <BuyerBookingCard
+              key={booking.id}
+              booking={booking}
+              upcoming={tab === 'upcoming'}
+              claimAction={claimActionOf(booking)}
+              onCancel={
+                tab === 'upcoming' && booking.status === 'confirmed'
+                  ? () => requestCancel(booking)
+                  : undefined
+              }
+            />
+          ))}
+        </ul>
       )}
       {loading && <ListLoading label={t('bookings.buyer.loading')} />}
       {!loading && hasMore && (

=== src/domain/bookings/components/partner/PartnerOffersManager.tsx — diff ===
@@ -1,4 +1,4 @@
-import { ArrowLeft, Plus } from 'lucide-react';
+import { ChevronLeft, Plus } from 'lucide-react';
 import { type ReactNode, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
@@ -74,7 +74,7 @@ export function PartnerOffersManager({
       aria-label={t('bookings.editor.cancel')}
       className={`${BUTTON_SECONDARY} w-11`}
     >
-      <ArrowLeft size={16} aria-hidden="true" />
+      <ChevronLeft size={16} aria-hidden="true" />
     </button>
   );

=== src/domain/bookings/utils/dates.ts — diff ===
@@ -54,3 +54,13 @@ export function fortalezaInputToIso(value: string): string | null {
   const [, y, m, d, h, min] = match.map(Number) as [number, number, number, number, number, number];
   return new Date(Date.UTC(y, m - 1, d, h, min) + FORTALEZA_OFFSET_MS).toISOString();
 }
+
+/** Dia da semana, dia e mês, no fuso do negócio, para linhas curtas. */
+export function formatDayShort(iso: string, locale: string): string {
+  return new Intl.DateTimeFormat(locale, {
+    timeZone: BUSINESS_TIME_ZONE,
+    weekday: 'short',
+    day: 'numeric',
+    month: 'short',
+  }).format(new Date(iso));
+}

=== src/domain/insights/components/ReportsView.tsx — diff ===
@@ -1,4 +1,4 @@
-import { ArrowLeft, Lock } from 'lucide-react';
+import { ChevronLeft, Lock } from 'lucide-react';
 import { motion } from 'motion/react';
 import { useState } from 'react';
 import { useTranslation } from 'react-i18next';
@@ -68,7 +68,7 @@ export function ReportsView({ items, events }: ReportsViewProps) {
             aria-label={t('insights.reports.seeAllLabel')}
             className="p-3 min-w-[44px] min-h-[44px] rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
           >
-            <ArrowLeft size={18} aria-hidden="true" />
+            <ChevronLeft size={18} aria-hidden="true" />
             <span className="text-[10px] font-semibold tracking-wide">
               {t('insights.reports.seeAll')}
             </span>

=== src/domain/payment/components/accounts/PaymentAccountWorkspace.tsx — diff ===
@@ -1,4 +1,4 @@
-import { ArrowLeft } from 'lucide-react';
+import { ChevronLeft } from 'lucide-react';
 import { useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { useTheme } from '../../../../shared/context/ThemeContext';
@@ -37,14 +37,18 @@ export function PaymentAccountWorkspace({
           onClick={onBack}
           className="press min-h-11 px-3 rounded-xl border border-line text-xs font-bold text-ink flex items-center gap-2 hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-teal-400/50"
         >
-          <ArrowLeft size={15} aria-hidden="true" />
+          <ChevronLeft size={15} aria-hidden="true" />
           {t('paymentAccounts.actions.back')}
         </button>
         <p className="text-sm font-bold text-ink font-mono break-all">{entry.maskedDocument}</p>
       </div>
 
       {sections.length > 1 && (
-        <div className="flex flex-wrap gap-2" role="group" aria-label={t('paymentAccounts.tabs.label')}>
+        <div
+          className="flex flex-wrap gap-2"
+          role="group"
+          aria-label={t('paymentAccounts.tabs.label')}
+        >
           {sections.map((key) => (
             <button
               key={key}
@@ -78,7 +82,10 @@ export function PaymentAccountWorkspace({
           />
         </div>
       ) : (
-        <p role="alert" className="p-3 rounded-xl bg-warn-soft border border-warn-line text-xs text-warn">
+        <p
+          role="alert"
+          className="p-3 rounded-xl bg-warn-soft border border-warn-line text-xs text-warn"
+        >
           {t('paymentAccounts.missingKey')}
         </p>
       )}

=== src/domain/payment/components/admin/AdminDebtCard.tsx — APAGUE este arquivo ===

=== src/domain/payment/components/admin/AdminDebtQueue.tsx — diff ===
@@ -2,13 +2,16 @@ import { useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { formatMoneyMinor } from '../../../../shared/utils/money';
 import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
+import { StatusText } from '../../../../ui/components/StatusText';
+import { TextButton } from '../../../../ui/components/TextButton';
 import { listAdminAccountDebtsUseCase } from '../../application/usecases/listAdminAccountDebtsUseCase';
 import { waiveAccountDebtUseCase } from '../../application/usecases/waiveAccountDebtUseCase';
 import { useAdminFinanceQueue } from '../../hooks/useAdminFinanceQueue';
 import type { AdminAccountDebt } from '../../types/adminFinance';
 import { adminFinanceErrorKey, errorCodeOf } from '../../utils/adminFinanceErrors';
-import { AdminDebtCard } from './AdminDebtCard';
+import { formatFortalezaDay } from '../../utils/receivablesFormat';
 import { AdminQueueFrame } from './AdminQueueFrame';
+import { QueueRow } from './QueueRow';
 
 export function AdminDebtQueue({
   onNotice,
@@ -19,12 +22,11 @@ export function AdminDebtQueue({
   const queue = useAdminFinanceQueue(listAdminAccountDebtsUseCase);
   const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
   const [busy, setBusy] = useState(false);
+  const money = (value: number) => formatMoneyMinor(value, i18n.language);
 
   const waive = (debt: AdminAccountDebt) =>
     setConfirm({
-      message: t('adminFinance.debts.waiveConfirm', {
-        amount: formatMoneyMinor(debt.remainingMinor, i18n.language),
-      }),
+      message: t('adminFinance.debts.waiveConfirm', { amount: money(debt.remainingMinor) }),
       tone: 'danger',
       confirmLabel: t('adminFinance.debts.waive'),
       onCancel: () => setConfirm(null),
@@ -56,7 +58,26 @@ export function AdminDebtQueue({
         onLoadMore={() => void queue.loadMore()}
       >
         {queue.data.map((debt) => (
-          <AdminDebtCard key={debt.id} debt={debt} busy={busy} onWaive={waive} />
+          <QueueRow
+            key={debt.id}
+            title={t(`adminFinance.debts.reason.${debt.reason}`)}
+            subtitle={[debt.sellerName ?? t('adminFinance.unknownSeller'), debt.maskedDocument]
+              .filter(Boolean)
+              .join(' · ')}
+            status={
+              <StatusText tone={debt.overdue ? 'danger' : 'muted'}>
+                {t(debt.overdue ? 'adminFinance.debts.overdueSince' : 'adminFinance.debts.dueOn', {
+                  date: formatFortalezaDay(debt.dueAt, i18n.language),
+                })}
+              </StatusText>
+            }
+            amount={money(debt.remainingMinor)}
+            action={
+              <TextButton tone="danger" disabled={busy} onClick={() => waive(debt)}>
+                {t('adminFinance.debts.waiveShort')}
+              </TextButton>
+            }
+          />
         ))}
       </AdminQueueFrame>
       <ConfirmDialog data={confirm} />

=== src/domain/payment/components/admin/AdminFinanceQueues.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
import { AdminDebtQueue } from './AdminDebtQueue';
import { ForceMajeureQueue } from './ForceMajeureQueue';
import { SaleClaimQueue } from './SaleClaimQueue';

type FinanceTab = 'claims' | 'forceMajeure' | 'debts';
const TABS: FinanceTab[] = ['claims', 'forceMajeure', 'debts'];

/** Filas financeiras do admin (D16): reclamações, força maior e dívidas dos CNPJs. */
export function AdminFinanceQueues() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<FinanceTab>('claims');
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null);
  const show = (message: string, error = false) => setNotice({ message, error });
  return (
    <section className="space-y-4" aria-labelledby="admin-finance-title">
      <h2 id="admin-finance-title" className="text-[22px] font-display font-bold text-ink">
        {t('adminFinance.title')}
      </h2>
      <SegmentedControl
        label={t('adminFinance.tabsLabel')}
        value={tab}
        onChange={(value) => {
          setTab(value);
          setNotice(null);
        }}
        options={TABS.map((value) => ({ value, label: t(`adminFinance.tabs.${value}`) }))}
      />
      {notice && (
        <p
          role={notice.error ? 'alert' : 'status'}
          className={`p-3 rounded-xl border text-xs ${
            notice.error
              ? 'bg-danger-soft border-danger-line text-danger'
              : 'bg-success-soft border-success-line text-success'
          }`}
        >
          {notice.message}
        </p>
      )}
      {tab === 'claims' ? (
        <SaleClaimQueue onNotice={show} />
      ) : tab === 'forceMajeure' ? (
        <ForceMajeureQueue onNotice={show} />
      ) : (
        <AdminDebtQueue onNotice={show} />
      )}
    </section>
  );
}

=== src/domain/payment/components/admin/AdminQueueFrame.tsx — diff ===
@@ -33,7 +33,7 @@ export function AdminQueueFrame({
   const { t } = useTranslation();
   return (
     <div className="space-y-3">
-      <p className="text-xs text-ink/70">{hint}</p>
+      <p className="text-[13px] text-ink/70">{hint}</p>
       {error ? (
         <ReceivablesError messageKey={adminFinanceErrorKey(error)} onRetry={onRetry} />
       ) : loading && empty ? (
@@ -41,7 +41,9 @@ export function AdminQueueFrame({
       ) : empty ? (
         <ReceivablesEmpty message={emptyMessage} />
       ) : (
-        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">{children}</ul>
+        <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
+          {children}
+        </ul>
       )}
       {hasMore && !error && (
         <button

=== src/domain/payment/components/admin/ForceMajeureQueue.tsx — diff ===
@@ -4,11 +4,15 @@ import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components
 import { decideForceMajeureUseCase } from '../../application/usecases/decideForceMajeureUseCase';
 import { listForceMajeureReviewsUseCase } from '../../application/usecases/listForceMajeureReviewsUseCase';
 import { readForceMajeureProofUseCase } from '../../application/usecases/readForceMajeureProofUseCase';
+import { formatMoneyMinor } from '../../../../shared/utils/money';
+import { StatusText } from '../../../../ui/components/StatusText';
 import { useAdminFinanceQueue } from '../../hooks/useAdminFinanceQueue';
 import type { AdminForceMajeureReview } from '../../types/adminFinance';
 import { adminFinanceErrorKey, errorCodeOf } from '../../utils/adminFinanceErrors';
+import { formatFortalezaDay } from '../../utils/receivablesFormat';
 import { AdminQueueFrame } from './AdminQueueFrame';
-import { ForceMajeureReviewCard } from './ForceMajeureReviewCard';
+import { ForceMajeureSheet } from './ForceMajeureSheet';
+import { QueueRow } from './QueueRow';
 
 const OBJECT_URL_TTL_MS = 60_000;
 
@@ -21,8 +25,9 @@ export function ForceMajeureQueue({
 }: {
   onNotice: (message: string, error?: boolean) => void;
 }) {
-  const { t } = useTranslation();
+  const { t, i18n } = useTranslation();
   const queue = useAdminFinanceQueue(listAll);
+  const [open, setOpen] = useState<AdminForceMajeureReview | null>(null);
   const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
   const [busy, setBusy] = useState(false);
 
@@ -50,6 +55,7 @@ export function ForceMajeureQueue({
       onCancel: () => setConfirm(null),
       onConfirm: async () => {
         setConfirm(null);
+        setOpen(null);
         setBusy(true);
         try {
           await decideForceMajeureUseCase(review.id, approve);
@@ -78,15 +84,31 @@ export function ForceMajeureQueue({
         onLoadMore={() => undefined}
       >
         {queue.data.map((review) => (
-          <ForceMajeureReviewCard
+          <QueueRow
             key={review.id}
-            review={review}
-            busy={busy}
-            onOpenProof={(entry) => void openProof(entry)}
-            onDecide={decide}
+            title={t(`adminFinance.debts.reason.${review.reason}`)}
+            subtitle={[review.sellerName ?? t('adminFinance.unknownSeller'), review.maskedDocument]
+              .filter(Boolean)
+              .join(' · ')}
+            status={
+              <StatusText tone="info">
+                {t('adminFinance.forceMajeure.declaredAt', {
+                  date: formatFortalezaDay(review.declaredAt, i18n.language),
+                })}
+              </StatusText>
+            }
+            amount={formatMoneyMinor(review.remainingMinor, i18n.language)}
+            onOpen={() => setOpen(review)}
           />
         ))}
       </AdminQueueFrame>
+      <ForceMajeureSheet
+        review={open}
+        busy={busy}
+        onClose={() => setOpen(null)}
+        onOpenProof={(entry) => void openProof(entry)}
+        onDecide={decide}
+      />
       <ConfirmDialog data={confirm} />
     </>
   );

=== src/domain/payment/components/admin/ForceMajeureReviewCard.tsx — APAGUE este arquivo ===

=== src/domain/payment/components/admin/ForceMajeureSheet.tsx — ARQUIVO NOVO, conteúdo completo ===
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { Dialog } from '../../../../ui/components/Dialog';
import { TextButton } from '../../../../ui/components/TextButton';
import type { AdminForceMajeureReview } from '../../types/adminFinance';
import { formatFortalezaDay } from '../../utils/receivablesFormat';
import { PRIMARY_BUTTON } from './adminFinanceStyles';

/** Detalhes da força maior declarada e a decisão do admin (D16, 3A). */
export function ForceMajeureSheet({
  review,
  busy,
  onClose,
  onOpenProof,
  onDecide,
}: {
  review: AdminForceMajeureReview | null;
  busy: boolean;
  onClose: () => void;
  onOpenProof: (review: AdminForceMajeureReview) => void;
  onDecide: (review: AdminForceMajeureReview, approve: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  return (
    <Dialog
      open={review !== null}
      onOpenChange={(open) => !open && onClose()}
      title={review ? t(`adminFinance.debts.reason.${review.reason}`) : ''}
      description={
        review
          ? [review.sellerName ?? t('adminFinance.unknownSeller'), review.maskedDocument]
              .filter(Boolean)
              .join(' · ')
          : undefined
      }
    >
      {review && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-ink/[0.04] space-y-2">
            <p className="text-sm text-ink/80 whitespace-pre-line break-words">
              “{review.forceMajeureReason}”
            </p>
            <p className="text-[12px] text-ink/60">
              {t('adminFinance.forceMajeure.meta', {
                date: formatFortalezaDay(review.declaredAt, i18n.language),
                amount: formatMoneyMinor(review.remainingMinor, i18n.language),
              })}
            </p>
          </div>
          <TextButton onClick={() => onOpenProof(review)}>
            <FileText size={16} aria-hidden="true" />
            {t('adminFinance.forceMajeure.openProof')}
          </TextButton>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDecide(review, true)}
            className={`${PRIMARY_BUTTON} w-full min-h-12 text-[15px]`}
          >
            {t('adminFinance.forceMajeure.approve')}
          </button>
          <div className="flex justify-center">
            <TextButton tone="danger" disabled={busy} onClick={() => onDecide(review, false)}>
              {t('adminFinance.forceMajeure.reject')}
            </TextButton>
          </div>
        </div>
      )}
    </Dialog>
  );
}

=== src/domain/payment/components/admin/QueueRow.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

/** Linha de uma fila do admin (D17): título, uma linha de contexto, status e valor; o resto na folha. */
export function QueueRow({
  title,
  subtitle,
  status,
  amount,
  onOpen,
  action,
}: {
  title: string;
  subtitle: string;
  status: ReactNode;
  amount: string;
  onOpen?: () => void;
  /** Ação em texto à direita, para filas sem folha de detalhes. */
  action?: ReactNode;
}) {
  const body = (
    <>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-ink truncate">{title}</p>
        <p className="text-[13px] text-ink/70 truncate">{subtitle}</p>
        <div className="mt-1">{status}</div>
      </div>
      <span className="text-sm font-semibold text-ink tabular-nums">{amount}</span>
    </>
  );
  return (
    <li>
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="w-full text-left px-4 py-3.5 min-h-16 flex items-center gap-3 hover:bg-ink/[0.03] focus-visible:outline-none focus-visible:bg-ink/[0.05]"
        >
          {body}
          <ChevronRight size={18} className="text-ink/40 shrink-0" aria-hidden="true" />
        </button>
      ) : (
        <div className="px-4 py-3.5 min-h-16 flex items-center gap-3">
          {body}
          {action}
        </div>
      )}
    </li>
  );
}

=== src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx — diff ===
@@ -1,4 +1,4 @@
-import { Loader2 } from 'lucide-react';
+import { AlertCircle, Loader2 } from 'lucide-react';
 import { useId, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { formatMoneyMinor } from '../../../../shared/utils/money';
@@ -6,12 +6,13 @@ import { Dialog } from '../../../../ui/components/Dialog';
 import { decideSaleClaimUseCase } from '../../application/usecases/decideSaleClaimUseCase';
 import type { AdminSaleClaim, SaleClaimOutcome } from '../../types/adminFinance';
 import { adminFinanceErrorKey, errorCodeOf } from '../../utils/adminFinanceErrors';
+import { formatFortalezaDay } from '../../utils/receivablesFormat';
 import { PRIMARY_BUTTON } from './adminFinanceStyles';
 
 const OUTCOMES: SaleClaimOutcome[] = ['release', 'refund_full', 'refund_partial'];
 
 const OPTION =
-  'press min-h-11 px-3 py-2.5 rounded-xl border border-line bg-surface flex items-start gap-3 text-sm text-ink cursor-pointer has-[:checked]:border-accent-line has-[:checked]:bg-accent-soft focus-within:ring-2 focus-within:ring-teal-400/50';
+  'press min-h-14 px-4 py-2.5 rounded-2xl bg-ink/[0.04] flex items-center gap-3 text-sm text-ink cursor-pointer has-[:checked]:bg-accent-soft has-[:checked]:ring-1 has-[:checked]:ring-accent-line focus-within:ring-2 focus-within:ring-teal-400/50';
 
 /** Decisão do admin (D16, 2A); o backend recalcula os valores e confere a multa. */
 export function SaleClaimDecisionDialog({
@@ -66,11 +67,39 @@ export function SaleClaimDecisionDialog({
     <Dialog
       open={claim !== null}
       onOpenChange={(open) => !open && onClose()}
-      title={t('adminFinance.claims.decideTitle')}
-      description={t('adminFinance.claims.decideDescription')}
+      title={claim?.title ?? t('adminFinance.claims.decideTitle')}
+      description={
+        claim
+          ? [claim.sellerName ?? t('adminFinance.unknownSeller'), claim.maskedDocument]
+              .filter(Boolean)
+              .join(' · ')
+          : undefined
+      }
     >
       {claim && (
         <form onSubmit={submit} className="space-y-4" noValidate>
+          <div className="p-4 rounded-2xl bg-ink/[0.04] space-y-1.5">
+            <p className="text-[13px] font-semibold text-warn flex items-center gap-1.5">
+              <AlertCircle size={15} aria-hidden="true" />
+              {t(`saleClaims.reason.${claim.reason}`)}
+            </p>
+            {claim.details && (
+              <p className="text-sm text-ink/80 whitespace-pre-line break-words">
+                “{claim.details}”
+              </p>
+            )}
+            <p className="text-[12px] text-ink/60">
+              {t('adminFinance.claims.meta', {
+                opened: formatFortalezaDay(claim.openedAt, i18n.language),
+                paid: money(claim.grossMinor),
+              })}
+              {claim.serviceEndsAt &&
+                ` · ${t('adminFinance.claims.metaEnd', {
+                  date: formatFortalezaDay(claim.serviceEndsAt, i18n.language),
+                })}`}
+            </p>
+          </div>
+          <p className="text-[12px] text-ink/60">{t('adminFinance.claims.decideDescription')}</p>
           <fieldset className="space-y-2">
             <legend className="text-xs font-bold text-ink mb-1.5">
               {t('adminFinance.claims.outcomeLabel')}
@@ -86,15 +115,15 @@ export function SaleClaimDecisionDialog({
                     setOutcome(value);
                     setError(null);
                   }}
-                  className="w-4 h-4 mt-0.5 accent-teal-500"
+                  className="w-4 h-4 shrink-0 accent-teal-500"
                 />
                 <span className="space-y-0.5">
-                  <span className="block font-bold">
+                  <span className="block font-semibold">
                     {t(`adminFinance.claims.outcome.${value}`, {
                       amount: money(claim.refundableMinor),
                     })}
                   </span>
-                  <span className="block text-xs text-ink/70">
+                  <span className="block text-[13px] text-ink/70">
                     {t(`adminFinance.claims.outcomeHint.${value}`, {
                       max: money(claim.maxPartialRefundMinor),
                     })}
@@ -121,19 +150,26 @@ export function SaleClaimDecisionDialog({
             </div>
           )}
           {penaltyAllowed && (
-            <label className={OPTION}>
+            <label className="press min-h-14 px-4 py-2.5 rounded-2xl bg-ink/[0.04] flex items-center justify-between gap-3 cursor-pointer focus-within:ring-2 focus-within:ring-teal-400/50">
+              <span className="space-y-0.5">
+                <span className="block text-sm font-semibold text-ink">
+                  {t('adminFinance.claims.penaltyLabel')}
+                </span>
+                <span className="block text-[13px] text-ink/70">
+                  {t('adminFinance.claims.penaltyHint')}
+                </span>
+              </span>
               <input
                 type="checkbox"
+                role="switch"
                 checked={chargePenalty}
                 onChange={(event) => setChargePenalty(event.target.checked)}
-                className="w-4 h-4 mt-0.5 accent-teal-500"
+                className="peer sr-only"
+              />
+              <span
+                aria-hidden="true"
+                className="relative w-11 h-6 shrink-0 rounded-full bg-ink/20 transition-colors peer-checked:bg-teal-500 after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-surface-solid after:shadow after:transition-[translate] peer-checked:after:translate-x-5"
               />
-              <span className="space-y-0.5">
-                <span className="block font-bold">{t('adminFinance.claims.penaltyLabel')}</span>
-                <span className="block text-xs text-ink/70">
-                  {t('adminFinance.claims.penaltyHint')}
-                </span>
-              </span>
             </label>
           )}
           {error && (
@@ -147,7 +183,7 @@ export function SaleClaimDecisionDialog({
           <button
             type="submit"
             disabled={sending}
-            className={`${PRIMARY_BUTTON} w-full min-h-12 text-sm flex items-center justify-center gap-2`}
+            className={`${PRIMARY_BUTTON} w-full min-h-12 text-[15px] flex items-center justify-center gap-2`}
           >
             {sending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
             {t(sending ? 'adminFinance.sending' : 'adminFinance.claims.submit')}

=== src/domain/payment/components/admin/SaleClaimQueue.tsx — diff ===
@@ -1,18 +1,21 @@
 import { useState } from 'react';
 import { useTranslation } from 'react-i18next';
+import { formatMoneyMinor } from '../../../../shared/utils/money';
+import { StatusText } from '../../../../ui/components/StatusText';
 import { listAdminSaleClaimsUseCase } from '../../application/usecases/listAdminSaleClaimsUseCase';
 import { useAdminFinanceQueue } from '../../hooks/useAdminFinanceQueue';
 import type { AdminSaleClaim } from '../../types/adminFinance';
+import { formatFortalezaDay } from '../../utils/receivablesFormat';
 import { AdminQueueFrame } from './AdminQueueFrame';
+import { QueueRow } from './QueueRow';
 import { SaleClaimDecisionDialog } from './SaleClaimDecisionDialog';
-import { SaleClaimQueueCard } from './SaleClaimQueueCard';
 
 export function SaleClaimQueue({
   onNotice,
 }: {
   onNotice: (message: string, error?: boolean) => void;
 }) {
-  const { t } = useTranslation();
+  const { t, i18n } = useTranslation();
   const queue = useAdminFinanceQueue(listAdminSaleClaimsUseCase);
   const [deciding, setDeciding] = useState<AdminSaleClaim | null>(null);
   return (
@@ -27,9 +30,31 @@ export function SaleClaimQueue({
         onRetry={() => void queue.reload()}
         onLoadMore={() => void queue.loadMore()}
       >
-        {queue.data.map((claim) => (
-          <SaleClaimQueueCard key={claim.id} claim={claim} onDecide={setDeciding} />
-        ))}
+        {queue.data.map((claim) => {
+          const pending = claim.status === 'refund_pending';
+          return (
+            <QueueRow
+              key={claim.id}
+              title={claim.title ?? t(`adminFinance.claims.fallbackTitle.${claim.referenceType}`)}
+              subtitle={`${claim.sellerName ?? t('adminFinance.unknownSeller')} · ${t(
+                `saleClaims.reason.${claim.reason}`
+              )}`}
+              status={
+                pending ? (
+                  <StatusText tone="info">{t('adminFinance.claims.refundPending')}</StatusText>
+                ) : (
+                  <StatusText tone="warn">
+                    {t('adminFinance.claims.decideBy', {
+                      date: formatFortalezaDay(claim.decideBy, i18n.language),
+                    })}
+                  </StatusText>
+                )
+              }
+              amount={formatMoneyMinor(claim.refundableMinor, i18n.language)}
+              onOpen={pending ? undefined : () => setDeciding(claim)}
+            />
+          );
+        })}
       </AdminQueueFrame>
       <SaleClaimDecisionDialog
         key={deciding?.id ?? 'none'}

=== src/domain/payment/components/admin/SaleClaimQueueCard.tsx — APAGUE este arquivo ===

=== src/domain/payment/components/admin/SellerLine.tsx — APAGUE este arquivo ===

=== src/domain/payment/components/admin/adminFinance.test.tsx — diff ===
@@ -64,9 +64,9 @@ describe('filas financeiras do admin (D16)', () => {
   it('multa só no serviço que não aconteceu com reembolso integral', async () => {
     m.decide.mockResolvedValue(undefined);
     const onDecided = renderDialog();
-    expect(screen.queryByText('Cobrar multa de 20% do parceiro')).toBeNull();
-    fireEvent.click(screen.getByLabelText(/Reembolso integral/));
-    fireEvent.click(screen.getByLabelText(/Cobrar multa de 20% do parceiro/));
+    expect(screen.queryByText('Multa de 20% ao parceiro')).toBeNull();
+    fireEvent.click(screen.getByLabelText(/Reembolso total/));
+    fireEvent.click(screen.getByLabelText(/Multa de 20% ao parceiro/));
     fireEvent.click(screen.getByRole('button', { name: 'Confirmar decisão' }));
     await waitFor(() =>
       expect(m.decide).toHaveBeenCalledWith('booking_b1', {
@@ -79,8 +79,8 @@ describe('filas financeiras do admin (D16)', () => {
 
   it('outro motivo: sem a opção de multa', () => {
     renderDialog({ ...CLAIM, reason: 'not_as_described' });
-    fireEvent.click(screen.getByLabelText(/Reembolso integral/));
-    expect(screen.queryByText('Cobrar multa de 20% do parceiro')).toBeNull();
+    fireEvent.click(screen.getByLabelText(/Reembolso total/));
+    expect(screen.queryByText('Multa de 20% ao parceiro')).toBeNull();
   });
 
   it('parcial acima do teto é recusado antes de enviar', async () => {
@@ -117,8 +117,8 @@ describe('filas financeiras do admin (D16)', () => {
     const onNotice = vi.fn();
     render(<AdminDebtQueue onNotice={onNotice} />);
     expect(await screen.findByText(/Buggy do Preá/)).toBeInTheDocument();
-    expect(screen.getByText(/Vendas do CNPJ pausadas/)).toBeInTheDocument();
-    fireEvent.click(screen.getByRole('button', { name: 'Perdoar dívida' }));
+    expect(screen.getByText(/Vencida desde/)).toBeInTheDocument();
+    fireEvent.click(screen.getByRole('button', { name: 'Perdoar' }));
     const dialog = await screen.findByRole('dialog');
     fireEvent.click(within(dialog).getByRole('button', { name: 'Perdoar dívida' }));
     await waitFor(() => expect(m.waive).toHaveBeenCalledWith('debt-1'));

=== src/domain/payment/components/admin/adminFinanceStyles.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
export const PRIMARY_BUTTON =
  'press min-h-11 px-4 rounded-2xl bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 text-sm font-bold focus-visible:ring-2 focus-visible:ring-teal-400/50';
export const SECONDARY_BUTTON =
  'press min-h-11 px-4 rounded-xl border border-line text-xs font-bold text-ink hover:bg-accent-soft disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50';

=== src/domain/payment/components/claims/SaleClaimAction.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { MessageSquareWarning } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { StatusText, type StatusTone } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { useSaleClaimFor } from '../../hooks/mySaleClaimsContext';
import type { ClaimableSale, SaleClaimStatus } from '../../types/saleClaims';
import { CLAIM_WINDOW_HOURS, isWithinClaimWindow } from '../../utils/claimWindow';
import { formatFortalezaDay } from '../../utils/receivablesFormat';
import { SaleClaimDialog } from './SaleClaimDialog';

const TONE: Record<SaleClaimStatus, StatusTone> = {
  open: 'warn',
  refund_pending: 'info',
  refunded: 'success',
  released: 'muted',
  expired: 'muted',
};

/** "Relatar" do início do serviço até 48 h depois do fim (D16, 2A); depois, o status em uma linha. */
export function SaleClaimAction({ sale }: { sale: ClaimableSale }) {
  const { t, i18n } = useTranslation();
  const { claim, add } = useSaleClaimFor(sale.referenceType, sale.referenceId);
  const [open, setOpen] = useState(false);

  if (claim) {
    return (
      <StatusText tone={TONE[claim.status]}>
        {t(`saleClaims.line.${claim.status}`, {
          date: formatFortalezaDay(claim.decideBy, i18n.language),
          amount: formatMoneyMinor(claim.refundAmountMinor ?? 0, i18n.language),
        })}
      </StatusText>
    );
  }
  if (claim === undefined || !isWithinClaimWindow(sale, new Date())) return null;

  const until = new Date(
    new Date(sale.serviceEndsAt).getTime() + CLAIM_WINDOW_HOURS * 3_600_000
  ).toISOString();
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-ink/70">
        {t('saleClaims.prompt', { date: formatFortalezaDay(until, i18n.language) })}
      </span>
      <TextButton tone="warn" onClick={() => setOpen(true)} aria-label={t('saleClaims.action')}>
        <MessageSquareWarning size={16} aria-hidden="true" />
        {t('saleClaims.actionShort')}
      </TextButton>
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

=== src/domain/payment/components/claims/saleClaims.test.tsx — diff ===
@@ -73,7 +73,7 @@ describe('relatar problema (D16, 2A)', () => {
         reason: 'did_not_happen',
       })
     );
-    expect(await screen.findByText('Problema relatado.')).toBeInTheDocument();
+    expect(await screen.findByText(/Problema em análise/)).toBeInTheDocument();
   });
 
   it('erro da API pelo code', async () => {
@@ -91,8 +91,7 @@ describe('relatar problema (D16, 2A)', () => {
   it('com reclamação: só o status, com o valor reembolsado', async () => {
     m.list.mockResolvedValue([{ ...CLAIM, status: 'refunded', refundAmountMinor: 12000 }]);
     renderAction();
-    expect(await screen.findByText('Reembolsado.')).toBeInTheDocument();
-    expect(screen.getByRole('status')).toHaveTextContent('R$');
+    expect(await screen.findByText(/Reembolsado R\$\s?120,00/)).toBeInTheDocument();
     expect(screen.queryByRole('button', { name: 'Relatar problema' })).toBeNull();
   });

=== src/domain/payment/utils/receivablesFormat.ts — diff ===
@@ -26,3 +26,12 @@ export function receivablesErrorKey(error: unknown): string {
   const code = error instanceof Error ? error.message : '';
   return `receivables.errors.${KNOWN_ERRORS.includes(code) ? code : 'UNAVAILABLE'}`;
 }
+
+/** Só dia e mês, no fuso do negócio, para linhas curtas de status. */
+export function formatFortalezaDay(iso: string, locale: string): string {
+  return new Intl.DateTimeFormat(locale, {
+    timeZone: 'America/Fortaleza',
+    day: 'numeric',
+    month: 'short',
+  }).format(new Date(iso));
+}

=== src/domain/ticketing/components/CheckoutResultView.tsx — diff ===
@@ -1,8 +1,8 @@
-import React, { useEffect, useState } from 'react';
+import { useEffect, useState } from 'react';
 import {
   AlertTriangle,
-  ArrowLeft,
   CheckCircle2,
+  ChevronLeft,
   Clock,
   Loader2,
   Ticket as TicketIcon,
@@ -48,9 +48,7 @@ export function CheckoutResultView({
       } catch (err: unknown) {
         if (active) {
           setError(
-            err instanceof Error
-              ? err.message
-              : 'Não foi possível verificar o status do pedido.'
+            err instanceof Error ? err.message : 'Não foi possível verificar o status do pedido.'
           );
         }
       } finally {
@@ -91,9 +89,7 @@ export function CheckoutResultView({
               <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-300 mx-auto">
                 <AlertTriangle size={26} />
               </div>
-              <h2 className="text-lg font-bold text-white">
-                Não foi possível confirmar o pedido
-              </h2>
+              <h2 className="text-lg font-bold text-white">Não foi possível confirmar o pedido</h2>
               <p className="text-xs text-white/60">{error}</p>
               {onBackHome && (
                 <button
@@ -101,7 +97,7 @@ export function CheckoutResultView({
                   onClick={onBackHome}
                   className="w-full min-h-11 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
                 >
-                  <ArrowLeft size={15} />
+                  <ChevronLeft size={15} />
                   <span>Voltar ao Guia</span>
                 </button>
               )}
@@ -148,9 +144,7 @@ export function CheckoutResultView({
                 <AlertTriangle size={30} />
               </div>
               <h2 className="text-lg font-bold text-white">
-                {order.status === 'expired'
-                  ? 'Reserva Expirada'
-                  : 'Pagamento Não Aprovado'}
+                {order.status === 'expired' ? 'Reserva Expirada' : 'Pagamento Não Aprovado'}
               </h2>
               <p className="text-xs text-white/60">
                 {order.status === 'expired'

=== src/domain/ticketing/components/UserTicketsHistoryView.tsx — diff ===
@@ -1,15 +1,10 @@
-import {
-  AlertCircle,
-  ArrowLeft,
-  CheckCircle2,
-  Loader2,
-  RefreshCw,
-  Ticket as TicketIcon,
-} from 'lucide-react';
+import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Ticket as TicketIcon } from 'lucide-react';
 import { type ReactNode, useState } from 'react';
 import { useTranslation } from 'react-i18next';
+import { BackButton } from '../../../ui/components/BackButton';
 import { ConfirmDialog, type ConfirmDialogData } from '../../../ui/components/ConfirmDialog';
 import { GlassCard } from '../../../ui/components/GlassCard';
+import { SegmentedControl } from '../../../ui/components/SegmentedControl';
 import { formatMoneyMinor } from '../../../shared/utils/money';
 import { cn } from '../../../shared/utils/cn';
 import { useTicketWalletActions } from '../hooks/useTicketWalletActions';
@@ -50,15 +45,8 @@ function claimSaleOf(order: TicketOrder): TicketOrderClaimSale | null {
   };
 }
 
-const SQUARE_BUTTON =
-  'w-11 h-11 rounded-xl bg-surface hover:bg-white/10 border border-line flex items-center justify-center text-ink/70 focus-visible:ring-2 focus-visible:ring-teal-400/50 cursor-pointer';
-
-function tabClass(active: boolean) {
-  return cn(
-    'min-h-11 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50',
-    active ? 'bg-teal-400 text-slate-950' : 'bg-surface text-ink/70 hover:bg-white/10'
-  );
-}
+const ROUND_BUTTON =
+  'press w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-ink/80 hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50';
 
 export function UserTicketsHistoryView({
   onBack,
@@ -101,48 +89,34 @@ export function UserTicketsHistoryView({
   return (
     <div className="space-y-4">
       <div className="flex items-center justify-between gap-2">
-        <div className="flex items-center gap-2 flex-wrap">
-          {onBack && (
-            <button
-              type="button"
-              onClick={onBack}
-              aria-label={t('ticketWallet.back')}
-              className={SQUARE_BUTTON}
-            >
-              <ArrowLeft size={16} aria-hidden="true" />
-            </button>
-          )}
-          <button
-            type="button"
-            aria-pressed={activeTab === 'tickets'}
-            onClick={() => setActiveTab('tickets')}
-            className={tabClass(activeTab === 'tickets')}
-          >
-            {t('ticketWallet.tabs.tickets', { count: tickets.length })}
-          </button>
-          <button
-            type="button"
-            aria-pressed={activeTab === 'orders'}
-            onClick={() => setActiveTab('orders')}
-            className={tabClass(activeTab === 'orders')}
-          >
-            {t('ticketWallet.tabs.orders', { count: orders.length })}
-          </button>
+        <div className="flex items-center gap-2 min-w-0">
+          {onBack && <BackButton label={t('ticketWallet.back')} onClick={onBack} />}
+          <h2 className="text-[22px] font-display font-bold text-ink">{t('ticketWallet.title')}</h2>
         </div>
         <button
           type="button"
           onClick={() => void reload()}
           aria-label={t('ticketWallet.refresh')}
-          className={SQUARE_BUTTON}
+          className={ROUND_BUTTON}
         >
           <RefreshCw
-            size={16}
-            className={loading ? 'animate-spin text-teal-400' : ''}
+            size={18}
+            className={loading ? 'animate-spin text-accent' : ''}
             aria-hidden="true"
           />
         </button>
       </div>
 
+      <SegmentedControl
+        label={t('ticketWallet.tabsLabel')}
+        value={activeTab}
+        onChange={setActiveTab}
+        options={[
+          { value: 'tickets', label: t('ticketWallet.tabs.tickets', { count: tickets.length }) },
+          { value: 'orders', label: t('ticketWallet.tabs.orders', { count: orders.length }) },
+        ]}
+      />
+
       {actions.feedback && (
         <p
           role={actions.feedback.type === 'error' ? 'alert' : 'status'}
@@ -211,13 +185,14 @@ export function UserTicketsHistoryView({
           <p className="text-xs text-ink/70">{t('ticketWallet.emptyOrdersHint')}</p>
         </GlassCard>
       ) : (
-        <div className="space-y-3">
+        <ul className="space-y-3">
           {orders.map((order) => {
             const claimSale = renderClaimAction ? claimSaleOf(order) : null;
             return (
               <WalletOrderCard
                 key={order.id}
                 order={order}
+                ticketCount={tickets.filter((ticket) => ticket.orderId === order.id).length}
                 canResume={isPendingAndActive(order)}
                 canRefund={canRequestRefund(order, tickets, now)}
                 busy={actions.busy}
@@ -227,7 +202,7 @@ export function UserTicketsHistoryView({
               />
             );
           })}
-        </div>
+        </ul>
       )}
 
       {actions.resumingOrder && (

=== src/domain/ticketing/components/wallet/WalletOrderCard.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { CalendarClock, Ticket } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { rescheduleRefundDeadline } from '../../../../shared/utils/rescheduleRefundDeadline';
import { StatusText, type StatusTone } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import type { TicketOrder } from '../../types/ticketing';

interface WalletOrderCardProps {
  order: TicketOrder;
  ticketCount: number;
  canResume: boolean;
  canRefund: boolean;
  busy: boolean;
  onResume: () => void;
  onRefund: () => void;
  /** "Relatar", montado pela composição (D16, 2A). */
  claimAction?: ReactNode;
}

// Código curto do pedido para o atendimento; o ID completo continua no backend.
const ORDER_CODE_LENGTH = 10;

const STATUS_TONE: Partial<Record<TicketOrder['status'], StatusTone>> = {
  payment_processing: 'info',
  payment_failed: 'danger',
  expired: 'muted',
  refund_pending: 'info',
  refunded: 'muted',
  canceled: 'muted',
  disputed: 'warn',
};

/**
 * Pedido de ingresso (D17): o evento e quando, e uma linha só com o que a pessoa precisa saber ou
 * fazer agora.
 */
export function WalletOrderCard({
  order,
  ticketCount,
  canResume,
  canRefund,
  busy,
  onResume,
  onRefund,
  claimAction,
}: WalletOrderCardProps) {
  const { t, i18n } = useTranslation();
  const format = (iso: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(i18n.language, { timeZone: 'America/Fortaleza', ...options }).format(
      new Date(iso)
    );
  const event = order.eventSnapshot;
  const upcoming = event ? new Date(event.startsAt).getTime() > Date.now() : false;
  const refundUntil =
    event && (order.status === 'paid' || order.status === 'partially_refunded')
      ? rescheduleRefundDeadline(order.rescheduledAt, event.startsAt, new Date())
      : null;
  const statusTone = STATUS_TONE[order.status];
  const status = t(`ticketWallet.orderStatus.${order.status}`, { defaultValue: order.status });

  let footer: ReactNode = null;
  if (canResume) {
    footer = (
      <div className="flex items-center justify-between gap-3">
        <StatusText tone="warn">
          {order.expiresAt
            ? t('ticketWallet.reservedUntil', {
                time: format(order.expiresAt, { timeStyle: 'short' }),
              })
            : status}
        </StatusText>
        <TextButton tone="accent" disabled={busy} onClick={onResume}>
          {t('ticketWallet.payShort')}
        </TextButton>
      </div>
    );
  } else if (statusTone) {
    footer = <StatusText tone={statusTone}>{status}</StatusText>;
  } else if (upcoming) {
    footer = (refundUntil || canRefund) && (
      <div className="flex items-start justify-between gap-3">
        {refundUntil ? (
          <span className="flex items-start gap-2 text-[13px] text-info">
            <CalendarClock size={16} className="shrink-0 mt-px" aria-hidden="true" />
            {t('ticketWallet.rescheduledNotice', {
              date: format(refundUntil, { day: 'numeric', month: 'short' }),
            })}
          </span>
        ) : (
          <span />
        )}
        {canRefund && (
          <TextButton tone="danger" disabled={busy} onClick={onRefund} className="-my-2.5">
            {t('ticketWallet.cancelShort')}
          </TextButton>
        )}
      </div>
    );
  } else {
    footer = claimAction || <StatusText tone="muted">{status}</StatusText>;
  }

  const details = [
    ticketCount > 0 ? t('ticketWallet.ticketCount', { count: ticketCount }) : null,
    formatMoneyMinor(order.totalMinor, i18n.language),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="p-4 rounded-[20px] bg-surface border border-line">
      <div className="flex gap-3">
        <div className="w-12 h-12 shrink-0 rounded-2xl bg-accent-soft text-accent flex items-center justify-center">
          <Ticket size={22} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-ink leading-snug break-words">
            {event?.title ?? t('ticketWallet.order', { id: order.id.slice(0, ORDER_CODE_LENGTH) })}
          </p>
          {event && (
            <p className="text-[13px] text-ink/50 [:root.light_&]:text-ink/65">
              #{order.id.slice(0, ORDER_CODE_LENGTH)}
            </p>
          )}
          {event && (
            <p className="text-sm text-ink/70 mt-0.5">
              {format(event.startsAt, {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
          <p className="text-sm text-ink/70">{details}</p>
        </div>
      </div>
      {footer && <div className="mt-3 pt-3 border-t border-line">{footer}</div>}
    </li>
  );
}

=== src/shared/i18n/adminFinanceResources.ts — diff ===
@@ -14,18 +14,14 @@ export interface AdminFinanceTranslation {
   claims: {
     hint: string;
     empty: string;
-    open: string;
     refundPending: string;
-    refundPendingHint: string;
     fallbackTitle: {
       ticket_order: string;
       booking: string;
     };
-    paid: string;
-    refundable: string;
-    serviceEnd: string;
-    openedAt: string;
     decideBy: string;
+    meta: string;
+    metaEnd: string;
     decide: string;
     decideTitle: string;
     decideDescription: string;
@@ -56,6 +52,7 @@ export interface AdminFinanceTranslation {
     hint: string;
     empty: string;
     declaredAt: string;
+    meta: string;
     openProof: string;
     approve: string;
     reject: string;
@@ -70,6 +67,12 @@ export interface AdminFinanceTranslation {
     dueOn: string;
     overdueSince: string;
     waive: string;
+    waiveShort: string;
+    reason: {
+      cancellation_penalty: string;
+      dispute_lost: string;
+      post_release_refund: string;
+    };
     waiveConfirm: string;
     waived: string;
   };
@@ -101,18 +104,14 @@ export const adminFinancePtBR: AdminFinanceTranslation = {
   claims: {
     hint: 'Compras com problema relatado pelo comprador. O repasse fica retido até a decisão; sem decisão no prazo, é liberado.',
     empty: 'Nenhuma reclamação para decidir.',
-    open: 'Para decidir',
     refundPending: 'Reembolso em andamento',
-    refundPendingHint: 'O meio de pagamento ainda está processando o reembolso.',
     fallbackTitle: {
       ticket_order: 'Pedido de ingresso',
       booking: 'Reserva',
     },
-    paid: 'Pago pelo comprador',
-    refundable: 'Ainda pode voltar',
-    serviceEnd: 'Fim do serviço',
-    openedAt: 'Relatado em',
     decideBy: 'Decidir até {{date}}',
+    meta: 'Relatado {{opened}} · pago {{paid}}',
+    metaEnd: 'serviço terminou {{date}}',
     decide: 'Decidir',
     decideTitle: 'Decidir reclamação',
     decideDescription:
@@ -121,19 +120,18 @@ export const adminFinancePtBR: AdminFinanceTranslation = {
     outcomeRequired: 'Escolha a decisão.',
     outcome: {
       release: 'Liberar o repasse',
-      refund_full: 'Reembolso integral ({{amount}})',
+      refund_full: 'Reembolso total · {{amount}}',
       refund_partial: 'Reembolso parcial',
     },
     outcomeHint: {
-      release: 'O problema não procede. O parceiro recebe normalmente.',
-      refund_full: 'Devolve tudo o que resta, inclusive a taxa de serviço.',
-      refund_partial: 'Até {{max}}, sem a taxa de serviço. Sai do valor do parceiro.',
+      release: 'O parceiro recebe normalmente.',
+      refund_full: 'Inclui a taxa de serviço.',
+      refund_partial: 'Até {{max}}, sem a taxa de serviço.',
     },
     partialLabel: 'Valor do reembolso',
     partialInvalid: 'Informe um valor de até {{max}}.',
-    penaltyLabel: 'Cobrar multa de 20% do parceiro',
-    penaltyHint:
-      'O serviço não aconteceu: vale como cancelamento pelo proprietário, com 24 h para pagar.',
+    penaltyLabel: 'Multa de 20% ao parceiro',
+    penaltyHint: 'Serviço que não aconteceu; 24 h para pagar.',
     submit: 'Confirmar decisão',
     decided: {
       release: 'Repasse liberado.',
@@ -145,6 +143,7 @@ export const adminFinancePtBR: AdminFinanceTranslation = {
     hint: 'Multas de cancelamento com força maior declarada. Enquanto em análise, a multa fica suspensa.',
     empty: 'Nenhuma declaração para analisar.',
     declaredAt: 'Declarada em {{date}}',
+    meta: 'Declarada {{date}} · multa de {{amount}}',
     openProof: 'Abrir comprovante',
     approve: 'Aprovar',
     reject: 'Recusar',
@@ -157,8 +156,14 @@ export const adminFinancePtBR: AdminFinanceTranslation = {
     hint: 'Dívidas em aberto dos CNPJs. Vencida, a dívida pausa as vendas do CNPJ e é descontada dos repasses.',
     empty: 'Nenhuma dívida em aberto.',
     dueOn: 'Vence em {{date}}',
-    overdueSince: 'Vencida desde {{date}}. Vendas do CNPJ pausadas.',
+    overdueSince: 'Vencida desde {{date}} · vendas pausadas',
     waive: 'Perdoar dívida',
+    waiveShort: 'Perdoar',
+    reason: {
+      cancellation_penalty: 'Multa de cancelamento',
+      dispute_lost: 'Contestação perdida',
+      post_release_refund: 'Reembolso após o repasse',
+    },
     waiveConfirm:
       'Perdoar {{amount}}? A dívida deixa de ser cobrada e as vendas do CNPJ voltam se não houver outra vencida.',
     waived: 'Dívida perdoada.',
@@ -191,18 +196,14 @@ export const adminFinanceEn: AdminFinanceTranslation = {
   claims: {
     hint: 'Purchases with a problem reported by the buyer. The payout is held until the decision; with no decision in time, it is released.',
     empty: 'No claims to decide.',
-    open: 'To decide',
     refundPending: 'Refund in progress',
-    refundPendingHint: 'The payment method is still processing the refund.',
     fallbackTitle: {
       ticket_order: 'Ticket order',
       booking: 'Booking',
     },
-    paid: 'Paid by the buyer',
-    refundable: 'Still refundable',
-    serviceEnd: 'Service end',
-    openedAt: 'Reported on',
     decideBy: 'Decide by {{date}}',
+    meta: 'Reported {{opened}} · paid {{paid}}',
+    metaEnd: 'service ended {{date}}',
     decide: 'Decide',
     decideTitle: 'Decide claim',
     decideDescription:
@@ -211,19 +212,18 @@ export const adminFinanceEn: AdminFinanceTranslation = {
     outcomeRequired: 'Choose the decision.',
     outcome: {
       release: 'Release the payout',
-      refund_full: 'Full refund ({{amount}})',
+      refund_full: 'Full refund · {{amount}}',
       refund_partial: 'Partial refund',
     },
     outcomeHint: {
-      release: 'The problem is not upheld. The partner is paid as usual.',
-      refund_full: 'Returns everything left, service fee included.',
-      refund_partial: 'Up to {{max}}, without the service fee. Comes from the partner’s amount.',
+      release: 'The partner is paid as usual.',
+      refund_full: 'Service fee included.',
+      refund_partial: 'Up to {{max}}, without the service fee.',
     },
     partialLabel: 'Refund amount',
     partialInvalid: 'Enter an amount up to {{max}}.',
-    penaltyLabel: 'Charge the partner a 20% penalty',
-    penaltyHint:
-      'The service didn’t happen: it counts as a cancellation by the owner, with 24 h to pay.',
+    penaltyLabel: '20% penalty for the partner',
+    penaltyHint: 'Service that didn’t happen; 24 h to pay.',
     submit: 'Confirm decision',
     decided: {
       release: 'Payout released.',
@@ -235,6 +235,7 @@ export const adminFinanceEn: AdminFinanceTranslation = {
     hint: 'Cancellation penalties with declared force majeure. While under review, the penalty is suspended.',
     empty: 'No declarations to review.',
     declaredAt: 'Declared on {{date}}',
+    meta: 'Declared {{date}} · penalty of {{amount}}',
     openProof: 'Open proof',
     approve: 'Approve',
     reject: 'Reject',
@@ -247,8 +248,14 @@ export const adminFinanceEn: AdminFinanceTranslation = {
     hint: 'Open debts of each CNPJ. Once overdue, the debt pauses the CNPJ’s sales and is deducted from payouts.',
     empty: 'No open debts.',
     dueOn: 'Due on {{date}}',
-    overdueSince: 'Overdue since {{date}}. The CNPJ’s sales are paused.',
+    overdueSince: 'Overdue since {{date}} · sales paused',
     waive: 'Waive debt',
+    waiveShort: 'Waive',
+    reason: {
+      cancellation_penalty: 'Cancellation penalty',
+      dispute_lost: 'Lost dispute',
+      post_release_refund: 'Refund after payout',
+    },
     waiveConfirm:
       'Waive {{amount}}? The debt is no longer charged and the CNPJ’s sales resume if no other is overdue.',
     waived: 'Debt waived.',
@@ -282,18 +289,14 @@ export const adminFinanceFr: AdminFinanceTranslation = {
   claims: {
     hint: 'Achats avec un problème signalé par l’acheteur. Le versement est retenu jusqu’à la décision ; sans décision dans le délai, il est libéré.',
     empty: 'Aucune réclamation à traiter.',
-    open: 'À traiter',
     refundPending: 'Remboursement en cours',
-    refundPendingHint: 'Le moyen de paiement traite encore le remboursement.',
     fallbackTitle: {
       ticket_order: 'Commande de billets',
       booking: 'Réservation',
     },
-    paid: 'Payé par l’acheteur',
-    refundable: 'Encore remboursable',
-    serviceEnd: 'Fin du service',
-    openedAt: 'Signalé le',
     decideBy: 'Décider avant le {{date}}',
+    meta: 'Signalé le {{opened}} · payé {{paid}}',
+    metaEnd: 'service terminé le {{date}}',
     decide: 'Décider',
     decideTitle: 'Traiter la réclamation',
     decideDescription:
@@ -302,20 +305,18 @@ export const adminFinanceFr: AdminFinanceTranslation = {
     outcomeRequired: 'Choisissez la décision.',
     outcome: {
       release: 'Libérer le versement',
-      refund_full: 'Remboursement intégral ({{amount}})',
+      refund_full: 'Remboursement intégral · {{amount}}',
       refund_partial: 'Remboursement partiel',
     },
     outcomeHint: {
-      release: 'Le problème n’est pas retenu. Le partenaire est payé normalement.',
-      refund_full: 'Rembourse tout ce qui reste, frais de service compris.',
-      refund_partial:
-        'Jusqu’à {{max}}, sans les frais de service. Prélevé sur le montant du partenaire.',
+      release: 'Le partenaire est payé normalement.',
+      refund_full: 'Frais de service compris.',
+      refund_partial: 'Jusqu’à {{max}}, sans les frais de service.',
     },
     partialLabel: 'Montant du remboursement',
     partialInvalid: 'Indiquez un montant jusqu’à {{max}}.',
-    penaltyLabel: 'Facturer une pénalité de 20 % au partenaire',
-    penaltyHint:
-      'Le service n’a pas eu lieu : cela compte comme une annulation par le propriétaire, avec 24 h pour payer.',
+    penaltyLabel: 'Pénalité de 20 % au partenaire',
+    penaltyHint: 'Service qui n’a pas eu lieu ; 24 h pour payer.',
     submit: 'Confirmer la décision',
     decided: {
       release: 'Versement libéré.',
@@ -327,6 +328,7 @@ export const adminFinanceFr: AdminFinanceTranslation = {
     hint: 'Pénalités d’annulation avec force majeure déclarée. Pendant l’examen, la pénalité est suspendue.',
     empty: 'Aucune déclaration à examiner.',
     declaredAt: 'Déclarée le {{date}}',
+    meta: 'Déclarée le {{date}} · pénalité de {{amount}}',
     openProof: 'Ouvrir le justificatif',
     approve: 'Approuver',
     reject: 'Refuser',
@@ -340,8 +342,14 @@ export const adminFinanceFr: AdminFinanceTranslation = {
     hint: 'Dettes ouvertes des CNPJ. Échue, la dette suspend les ventes du CNPJ et est déduite des versements.',
     empty: 'Aucune dette ouverte.',
     dueOn: 'Échéance le {{date}}',
-    overdueSince: 'Échue depuis le {{date}}. Ventes du CNPJ suspendues.',
+    overdueSince: 'Échue depuis le {{date}} · ventes suspendues',
     waive: 'Annuler la dette',
+    waiveShort: 'Annuler',
+    reason: {
+      cancellation_penalty: 'Pénalité d’annulation',
+      dispute_lost: 'Litige perdu',
+      post_release_refund: 'Remboursement après versement',
+    },
     waiveConfirm:
       'Annuler {{amount}} ? La dette n’est plus réclamée et les ventes du CNPJ reprennent s’il n’y en a pas d’autre échue.',
     waived: 'Dette annulée.',

=== src/shared/i18n/bookingsResources.ts — diff ===
@@ -8,6 +8,13 @@ export interface BookingsTranslation {
     duration: string;
     meetingPoint: string;
     rescheduledNotice: string;
+    tabsLabel: string;
+    upcomingTab: string;
+    pastTab: string;
+    emptyUpcoming: string;
+    emptyPast: string;
+    cancelShort: string;
+    refundedAmount: string;
     chooseSlot: string;
     noSlots: string;
     spotsLeft_one: string;
@@ -35,10 +42,6 @@ export interface BookingsTranslation {
     viewMyBookings: string;
     menuItem: string;
     myBookingsTitle: string;
-    upcoming: string;
-    past: string;
-    emptyBookings: string;
-    cancelBooking: string;
     confirmCancelRefund: string;
     confirmCancelNoRefund: string;
     canceledWithRefund: string;
@@ -205,8 +208,14 @@ export const bookingsPtBR: BookingsTranslation = {
     retry: 'Tentar novamente',
     duration: 'Duração: {{minutes}} min',
     meetingPoint: 'Ponto de encontro: {{address}}',
-    rescheduledNotice:
-      'Nova data marcada pelo parceiro. Até {{date}} você pode cancelar com reembolso integral.',
+    rescheduledNotice: 'Nova data. Cancelamento com reembolso total até {{date}}',
+    tabsLabel: 'Reservas',
+    upcomingTab: 'Próximas ({{count}})',
+    pastTab: 'Anteriores ({{count}})',
+    emptyUpcoming: 'Nenhuma reserva por vir.',
+    emptyPast: 'Nenhuma reserva anterior.',
+    cancelShort: 'Cancelar',
+    refundedAmount: 'Reembolsado {{amount}}',
     chooseSlot: 'Escolha o horário',
     noSlots: 'Nenhum horário disponível nos próximos 30 dias.',
     spotsLeft_one: '{{count}} vaga',
@@ -236,10 +245,6 @@ export const bookingsPtBR: BookingsTranslation = {
     viewMyBookings: 'Ver minhas reservas',
     menuItem: 'Minhas reservas',
     myBookingsTitle: 'Minhas reservas',
-    upcoming: 'Próximas',
-    past: 'Anteriores',
-    emptyBookings: 'Você ainda não tem reservas.',
-    cancelBooking: 'Cancelar reserva',
     confirmCancelRefund: 'Cancelar esta reserva? Você receberá {{amount}} de volta.',
     confirmCancelNoRefund:
       'Cancelar esta reserva? Pela política de cancelamento, não há reembolso.',
@@ -415,8 +420,14 @@ export const bookingsEn: BookingsTranslation = {
     retry: 'Try again',
     duration: 'Duration: {{minutes}} min',
     meetingPoint: 'Meeting point: {{address}}',
-    rescheduledNotice:
-      'The partner set a new date. Until {{date}} you can cancel for a full refund.',
+    rescheduledNotice: 'New date. Full refund if you cancel by {{date}}',
+    tabsLabel: 'Bookings',
+    upcomingTab: 'Upcoming ({{count}})',
+    pastTab: 'Past ({{count}})',
+    emptyUpcoming: 'No upcoming bookings.',
+    emptyPast: 'No past bookings.',
+    cancelShort: 'Cancel',
+    refundedAmount: 'Refunded {{amount}}',
     chooseSlot: 'Choose a time',
     noSlots: 'No time slots available in the next 30 days.',
     spotsLeft_one: '{{count}} spot',
@@ -445,10 +456,6 @@ export const bookingsEn: BookingsTranslation = {
     viewMyBookings: 'View my bookings',
     menuItem: 'My bookings',
     myBookingsTitle: 'My bookings',
-    upcoming: 'Upcoming',
-    past: 'Past',
-    emptyBookings: 'You have no bookings yet.',
-    cancelBooking: 'Cancel booking',
     confirmCancelRefund: 'Cancel this booking? You will get {{amount}} back.',
     confirmCancelNoRefund: 'Cancel this booking? Under the cancellation policy there is no refund.',
     canceledWithRefund: 'Booking canceled. A refund of {{amount}} was requested.',
@@ -622,7 +629,14 @@ export const bookingsFr: BookingsTranslation = {
     duration: 'Durée : {{minutes}} min',
     meetingPoint: 'Point de rendez-vous : {{address}}',
     rescheduledNotice:
-      'Le partenaire a fixé une nouvelle date. Jusqu’au {{date}}, vous pouvez annuler avec un remboursement intégral.',
+      'Nouvelle date. Remboursement intégral en cas d’annulation avant le {{date}}',
+    tabsLabel: 'Réservations',
+    upcomingTab: 'À venir ({{count}})',
+    pastTab: 'Passées ({{count}})',
+    emptyUpcoming: 'Aucune réservation à venir.',
+    emptyPast: 'Aucune réservation passée.',
+    cancelShort: 'Annuler',
+    refundedAmount: 'Remboursé {{amount}}',
     chooseSlot: 'Choisissez un créneau',
     noSlots: 'Aucun créneau disponible dans les 30 prochains jours.',
     spotsLeft_one: '{{count}} place',
@@ -652,10 +666,6 @@ export const bookingsFr: BookingsTranslation = {
     viewMyBookings: 'Voir mes réservations',
     menuItem: 'Mes réservations',
     myBookingsTitle: 'Mes réservations',
-    upcoming: 'À venir',
-    past: 'Passées',
-    emptyBookings: 'Vous n’avez pas encore de réservation.',
-    cancelBooking: 'Annuler la réservation',
     confirmCancelRefund: 'Annuler cette réservation ? Vous serez remboursé de {{amount}}.',
     confirmCancelNoRefund:
       'Annuler cette réservation ? Selon la politique d’annulation, aucun remboursement n’est prévu.',

=== src/shared/i18n/saleClaimsResources.ts — diff ===
@@ -16,7 +16,8 @@ type ClaimStatuses = {
 
 export interface SaleClaimsTranslation {
   action: string;
-  until: string;
+  actionShort: string;
+  prompt: string;
   dialog: {
     title: string;
     description: string;
@@ -28,8 +29,7 @@ export interface SaleClaimsTranslation {
     sending: string;
   };
   reason: ClaimReasons;
-  status: ClaimStatuses;
-  statusDetail: ClaimStatuses;
+  line: ClaimStatuses;
   errors: {
     NOT_FOUND: string;
     CLAIM_NOT_ALLOWED: string;
@@ -42,7 +42,8 @@ export interface SaleClaimsTranslation {
 
 export const saleClaimsPtBR: SaleClaimsTranslation = {
   action: 'Relatar problema',
-  until: 'Até {{date}}',
+  actionShort: 'Relatar',
+  prompt: 'Algo deu errado? Até {{date}}',
   dialog: {
     title: 'Relatar problema',
     description:
@@ -61,19 +62,12 @@ export const saleClaimsPtBR: SaleClaimsTranslation = {
     safety_issue: 'Problema de segurança',
     other: 'Outro motivo',
   },
-  status: {
-    open: 'Problema relatado.',
-    refund_pending: 'Reembolso em andamento.',
-    refunded: 'Reembolsado.',
-    released: 'Análise concluída.',
-    expired: 'Análise encerrada.',
-  },
-  statusDetail: {
-    open: 'Vamos responder até {{date}}.',
-    refund_pending: 'O valor volta pelo mesmo meio de pagamento.',
-    refunded: '{{amount}} devolvidos pelo mesmo meio de pagamento.',
-    released: 'Não houve reembolso nesta compra.',
-    expired: 'O prazo de análise terminou sem reembolso.',
+  line: {
+    open: 'Problema em análise · resposta até {{date}}',
+    refund_pending: 'Reembolso em andamento',
+    refunded: 'Reembolsado {{amount}}',
+    released: 'Análise concluída, sem reembolso',
+    expired: 'Análise encerrada, sem reembolso',
   },
   errors: {
     NOT_FOUND: 'Compra não encontrada.',
@@ -87,7 +81,8 @@ export const saleClaimsPtBR: SaleClaimsTranslation = {
 
 export const saleClaimsEn: SaleClaimsTranslation = {
   action: 'Report a problem',
-  until: 'Until {{date}}',
+  actionShort: 'Report',
+  prompt: 'Something went wrong? Until {{date}}',
   dialog: {
     title: 'Report a problem',
     description:
@@ -106,19 +101,12 @@ export const saleClaimsEn: SaleClaimsTranslation = {
     safety_issue: 'Safety issue',
     other: 'Other reason',
   },
-  status: {
-    open: 'Problem reported.',
-    refund_pending: 'Refund in progress.',
-    refunded: 'Refunded.',
-    released: 'Review completed.',
-    expired: 'Review closed.',
-  },
-  statusDetail: {
-    open: 'We’ll reply by {{date}}.',
-    refund_pending: 'The amount goes back to the same payment method.',
-    refunded: '{{amount}} returned to the same payment method.',
-    released: 'There was no refund for this purchase.',
-    expired: 'The review period ended with no refund.',
+  line: {
+    open: 'Problem under review · reply by {{date}}',
+    refund_pending: 'Refund in progress',
+    refunded: 'Refunded {{amount}}',
+    released: 'Review completed, no refund',
+    expired: 'Review closed, no refund',
   },
   errors: {
     NOT_FOUND: 'Purchase not found.',
@@ -132,7 +120,8 @@ export const saleClaimsEn: SaleClaimsTranslation = {
 
 export const saleClaimsFr: SaleClaimsTranslation = {
   action: 'Signaler un problème',
-  until: 'Jusqu’au {{date}}',
+  actionShort: 'Signaler',
+  prompt: 'Un souci ? Jusqu’au {{date}}',
   dialog: {
     title: 'Signaler un problème',
     description:
@@ -151,19 +140,12 @@ export const saleClaimsFr: SaleClaimsTranslation = {
     safety_issue: 'Problème de sécurité',
     other: 'Autre motif',
   },
-  status: {
-    open: 'Problème signalé.',
-    refund_pending: 'Remboursement en cours.',
-    refunded: 'Remboursé.',
-    released: 'Examen terminé.',
-    expired: 'Examen clos.',
-  },
-  statusDetail: {
-    open: 'Nous répondrons avant le {{date}}.',
-    refund_pending: 'Le montant revient sur le même moyen de paiement.',
-    refunded: '{{amount}} remboursés sur le même moyen de paiement.',
-    released: 'Aucun remboursement pour cet achat.',
-    expired: 'Le délai d’examen s’est terminé sans remboursement.',
+  line: {
+    open: 'Problème en cours d’examen · réponse avant le {{date}}',
+    refund_pending: 'Remboursement en cours',
+    refunded: 'Remboursé {{amount}}',
+    released: 'Examen terminé, sans remboursement',
+    expired: 'Examen clos, sans remboursement',
   },
   errors: {
     NOT_FOUND: 'Achat introuvable.',

=== src/shared/i18n/ticketWalletResources.ts — diff ===
@@ -22,6 +22,8 @@ type OrderStatusKey =
   | 'disputed';
 
 export interface TicketWalletTranslation {
+  title: string;
+  tabsLabel: string;
   back: string;
   refresh: string;
   loading: string;
@@ -33,6 +35,10 @@ export interface TicketWalletTranslation {
   session: string;
   qrSigned: string;
   order: string;
+  ticketCount_one: string;
+  ticketCount_other: string;
+  payShort: string;
+  cancelShort: string;
   reservedUntil: string;
   rescheduledNotice: string;
   refundConfirm: string;
@@ -52,6 +58,8 @@ export interface TicketWalletTranslation {
 }
 
 export const ticketWalletPtBR: TicketWalletTranslation = {
+  title: 'Ingressos',
+  tabsLabel: 'Ingressos e pedidos',
   back: 'Voltar',
   refresh: 'Atualizar ingressos e pedidos',
   loading: 'Carregando seus ingressos…',
@@ -62,10 +70,13 @@ export const ticketWalletPtBR: TicketWalletTranslation = {
   emptyOrdersHint: 'Você ainda não fez pedidos de ingressos.',
   session: 'Sessão: {{date}}',
   qrSigned: 'QR assinado • v{{version}}',
-  order: 'Pedido #{{id}} • {{amount}}',
+  order: 'Pedido #{{id}}',
+  ticketCount_one: '{{count}} ingresso',
+  ticketCount_other: '{{count}} ingressos',
+  payShort: 'Pagar',
+  cancelShort: 'Cancelar',
   reservedUntil: 'Reserva válida até {{time}}',
-  rescheduledNotice:
-    'Nova data marcada pelo organizador. Até {{date}} você pode cancelar com reembolso integral, inclusive a taxa de serviço.',
+  rescheduledNotice: 'Nova data. Cancelamento com reembolso total, inclusive a taxa, até {{date}}',
   refundConfirm: 'Cancelar o pedido e receber {{amount}} de reembolso?',
   actions: {
     showQr: 'Ver QR',
@@ -121,6 +132,8 @@ export const ticketWalletPtBR: TicketWalletTranslation = {
 };
 
 export const ticketWalletEn: TicketWalletTranslation = {
+  title: 'Tickets',
+  tabsLabel: 'Tickets and orders',
   back: 'Back',
   refresh: 'Refresh tickets and orders',
   loading: 'Loading your tickets…',
@@ -131,10 +144,13 @@ export const ticketWalletEn: TicketWalletTranslation = {
   emptyOrdersHint: 'You have not ordered tickets yet.',
   session: 'Session: {{date}}',
   qrSigned: 'Signed QR • v{{version}}',
-  order: 'Order #{{id}} • {{amount}}',
+  order: 'Order #{{id}}',
+  ticketCount_one: '{{count}} ticket',
+  ticketCount_other: '{{count}} tickets',
+  payShort: 'Pay',
+  cancelShort: 'Cancel',
   reservedUntil: 'Reservation valid until {{time}}',
-  rescheduledNotice:
-    'The organizer set a new date. Until {{date}} you can cancel for a full refund, service fee included.',
+  rescheduledNotice: 'New date. Full refund, fee included, if you cancel by {{date}}',
   refundConfirm: 'Cancel the order and get a {{amount}} refund?',
   actions: {
     showQr: 'Show QR',
@@ -190,6 +206,8 @@ export const ticketWalletEn: TicketWalletTranslation = {
 };
 
 export const ticketWalletFr: TicketWalletTranslation = {
+  title: 'Billets',
+  tabsLabel: 'Billets et commandes',
   back: 'Retour',
   refresh: 'Actualiser les billets et commandes',
   loading: 'Chargement de vos billets…',
@@ -200,10 +218,14 @@ export const ticketWalletFr: TicketWalletTranslation = {
   emptyOrdersHint: 'Vous n’avez pas encore commandé de billets.',
   session: 'Séance : {{date}}',
   qrSigned: 'QR signé • v{{version}}',
-  order: 'Commande n° {{id}} • {{amount}}',
+  order: 'Commande n° {{id}}',
+  ticketCount_one: '{{count}} billet',
+  ticketCount_other: '{{count}} billets',
+  payShort: 'Payer',
+  cancelShort: 'Annuler',
   reservedUntil: 'Réservation valable jusqu’à {{time}}',
   rescheduledNotice:
-    'L’organisateur a fixé une nouvelle date. Jusqu’au {{date}}, vous pouvez annuler avec un remboursement intégral, frais de service compris.',
+    'Nouvelle date. Remboursement intégral, frais compris, en cas d’annulation avant le {{date}}',
   refundConfirm: 'Annuler la commande et recevoir un remboursement de {{amount}} ?',
   actions: {
     showQr: 'Voir le QR',

=== src/ui/components/BackButton.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ChevronLeft } from 'lucide-react';

/** Voltar no topo das telas (D17): só o chevron, sem caixa, com área de toque de 44 px. */
export function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="press w-11 h-11 -ml-2 shrink-0 rounded-full flex items-center justify-center text-ink/80 hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50"
    >
      <ChevronLeft size={26} strokeWidth={2.25} aria-hidden="true" />
    </button>
  );
}

=== src/ui/components/SegmentedControl.tsx — ARQUIVO NOVO, conteúdo completo ===
import { cn } from '../../shared/utils/cn';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/** Abas em pílula (D17): a ativa fica invertida, sem cor de destaque. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex p-1 rounded-full bg-ink/[0.06]">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'press flex-1 min-h-11 px-3 rounded-full text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50',
            value === option.value ? 'bg-ink text-app' : 'text-ink/70 hover:text-ink'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

=== src/ui/components/StatusText.tsx — ARQUIVO NOVO, conteúdo completo ===
import type { ReactNode } from 'react';
import { cn } from '../../shared/utils/cn';

export type StatusTone = 'success' | 'warn' | 'info' | 'danger' | 'muted';

const TEXT: Record<StatusTone, string> = {
  success: 'text-success',
  warn: 'text-warn',
  info: 'text-info',
  danger: 'text-danger',
  muted: 'text-ink/70',
};

const DOT: Record<StatusTone, string> = {
  success: 'bg-success',
  warn: 'bg-warn',
  info: 'bg-info',
  danger: 'bg-danger',
  muted: 'bg-ink/40',
};

/** Status como texto com ponto colorido, sem caixa (D17). */
export function StatusText({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-1.5 text-[13px] font-semibold',
        TEXT[tone],
        className
      )}
    >
      <span
        className={cn('inline-block w-1.5 h-1.5 shrink-0 rounded-full -translate-y-px', DOT[tone])}
        aria-hidden="true"
      />
      <span>{children}</span>
    </span>
  );
}

=== src/ui/components/TextButton.tsx — ARQUIVO NOVO, conteúdo completo ===
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../shared/utils/cn';

export type TextButtonTone = 'ink' | 'accent' | 'warn' | 'danger';

const TONE: Record<TextButtonTone, string> = {
  ink: 'text-ink',
  accent: 'text-accent',
  warn: 'text-warn',
  danger: 'text-danger',
};

/** Ação secundária em texto (D17): a ação principal da tela continua como botão cheio. */
export function TextButton({
  tone = 'ink',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: TextButtonTone }) {
  return (
    <button
      type={type}
      className={cn(
        'press min-h-11 px-2 -mx-2 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50',
        TONE[tone],
        className
      )}
      {...props}
    />
  );
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run src/domain/bookings/components/buyer/BookingFlow.tsx src/domain/bookings/components/buyer/BuyerBookingCard.tsx src/domain/bookings/components/buyer/MyBookingsView.tsx src/domain/bookings/components/partner/PartnerOffersManager.tsx src/domain/bookings/utils/dates.ts src/domain/insights/components/ReportsView.tsx src/domain/payment/components/accounts/PaymentAccountWorkspace.tsx src/domain/payment/components/admin/AdminDebtQueue.tsx src/domain/payment/components/admin/AdminFinanceQueues.tsx src/domain/payment/components/admin/AdminQueueFrame.tsx src/domain/payment/components/admin/ForceMajeureQueue.tsx src/domain/payment/components/admin/ForceMajeureSheet.tsx src/domain/payment/components/admin/QueueRow.tsx src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx src/domain/payment/components/admin/SaleClaimQueue.tsx src/domain/payment/components/admin/adminFinance.test.tsx src/domain/payment/components/admin/adminFinanceStyles.ts src/domain/payment/components/claims/SaleClaimAction.tsx src/domain/payment/components/claims/saleClaims.test.tsx src/domain/payment/utils/receivablesFormat.ts src/domain/ticketing/components/CheckoutResultView.tsx src/domain/ticketing/components/UserTicketsHistoryView.tsx src/domain/ticketing/components/wallet/WalletOrderCard.tsx src/shared/i18n/adminFinanceResources.ts src/shared/i18n/bookingsResources.ts src/shared/i18n/saleClaimsResources.ts src/shared/i18n/ticketWalletResources.ts src/ui/components/BackButton.tsx src/ui/components/SegmentedControl.tsx src/ui/components/StatusText.tsx src/ui/components/TextButton.tsx` (todos verdes). Não precisa rodar a suíte inteira.
- abra Minhas reservas, Ingressos › Pedidos e Admin › Financeiro nos temas claro e escuro e em francês.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
