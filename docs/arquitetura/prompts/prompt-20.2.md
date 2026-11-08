# Prompt 20.2 — Reutilizáveis num lugar só: controles, estados de lista e datas

> Lote 17, gerado dos commits de referência `748611c` e `d26ba13` da branch `claude/agents-md-v2`. Aplique depois do 20.1. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 20.2 — Reutilizáveis num lugar só

Reorganização autorizada em 2026-10-27, sem mudar o comportamento das telas.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e os apagados. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova. Nenhuma regra de negócio muda.

O QUE MUDA:
1) src/ui/styles/controls.ts: BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_DANGER e INPUT. Saem as cópias: src/domain/bookings/components/shared/ListState.tsx, src/domain/ticketing/components/manager/sessionButtons.ts, src/domain/payment/components/admin/adminFinanceStyles.ts e as constantes do DebtCard. Os botões ficam com o mesmo desenho; o texto de alguns sobe de xs para sm.
2) src/ui/components/ListState.tsx: ListLoading, ListEmpty e ListError para todos os domínios (com common.retry). Sai src/domain/payment/components/receivables/ReceivablesState.tsx.
3) src/shared/utils/businessDateTime.ts: formatBusinessDate, formatBusinessDay, formatBusinessWeekday e formatBusinessDateTime no fuso America/Fortaleza. Saem formatFortalezaDateTime e formatFortalezaDay (payment) e formatDayShort (bookings).
4) docs: onde ficam os reutilizáveis (docs/design/base-d17/README.md) e débito B33.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- docs/design/base-d17/README.md (alterar)
- src/domain/bookings/components/buyer/BookingCheckout.tsx (alterar)
- src/domain/bookings/components/buyer/BookingFlow.tsx (alterar)
- src/domain/bookings/components/buyer/BookingResultView.tsx (alterar)
- src/domain/bookings/components/buyer/BuyerBookingCard.tsx (alterar)
- src/domain/bookings/components/buyer/MyBookingsView.tsx (alterar)
- src/domain/bookings/components/buyer/ParticipantsForm.tsx (alterar)
- src/domain/bookings/components/buyer/SlotPicker.tsx (alterar)
- src/domain/bookings/components/partner/OfferPriceFields.tsx (alterar)
- src/domain/bookings/components/partner/OfferTextFields.tsx (alterar)
- src/domain/bookings/components/partner/PartnerBookingsList.tsx (alterar)
- src/domain/bookings/components/partner/PartnerOfferEditor.tsx (alterar)
- src/domain/bookings/components/partner/PartnerOfferRow.tsx (alterar)
- src/domain/bookings/components/partner/PartnerOffersManager.tsx (alterar)
- src/domain/bookings/components/partner/PartnerSlotsManager.tsx (alterar)
- src/domain/bookings/components/partner/SlotCancelDialog.tsx (alterar)
- src/domain/bookings/components/partner/SlotCreationForm.tsx (alterar)
- src/domain/bookings/components/partner/SlotRescheduleDialog.tsx (alterar)
- src/domain/bookings/components/shared/ListState.tsx (apagar)
- src/domain/bookings/utils/dates.ts (alterar)
- src/domain/payment/components/admin/AdminDebtQueue.tsx (alterar)
- src/domain/payment/components/admin/AdminQueueFrame.tsx (alterar)
- src/domain/payment/components/admin/ForceMajeureQueue.tsx (alterar)
- src/domain/payment/components/admin/ForceMajeureSheet.tsx (alterar)
- src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx (alterar)
- src/domain/payment/components/admin/SaleClaimQueue.tsx (alterar)
- src/domain/payment/components/admin/adminFinanceStyles.ts (apagar)
- src/domain/payment/components/claims/SaleClaimAction.tsx (alterar)
- src/domain/payment/components/receivables/DebtCard.tsx (alterar)
- src/domain/payment/components/receivables/DebtList.tsx (alterar)
- src/domain/payment/components/receivables/DebtPaymentDialog.tsx (alterar)
- src/domain/payment/components/receivables/PayoutEntryRow.tsx (alterar)
- src/domain/payment/components/receivables/PayoutStatement.tsx (alterar)
- src/domain/payment/components/receivables/ReceivablesState.tsx (apagar)
- src/domain/payment/utils/receivablesFormat.ts (alterar)
- src/domain/ticketing/components/manager/OccurrenceCancelDialog.tsx (alterar)
- src/domain/ticketing/components/manager/OccurrencePostponeDialog.tsx (alterar)
- src/domain/ticketing/components/manager/SessionActions.tsx (alterar)
- src/domain/ticketing/components/manager/sessionButtons.ts (apagar)
- src/domain/ticketing/components/wallet/WalletOrderCard.tsx (alterar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/utils/businessDateTime.ts (alterar)
- src/ui/components/ListState.tsx (criar)
- src/ui/styles/controls.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -22,6 +22,7 @@
 | B30 | `server/domain/payment/services/saleClaimService.ts` e `server/interfaces/http/saleClaims/`: o reembolso decidido numa reclamação não muda o status do pedido de ingresso nem da reserva; e a abertura de reclamação não tem rate limit (o app ainda não tem rate limit com armazenamento compartilhado) | §11.8 (o comprador vê o estado real da compra) e §7.4 (rate limit em rotas de pagamento) | baixo — uma reclamação por venda e só do próprio comprador; desde o 18.4f.1 a carteira e Minhas reservas mostram o status da reclamação ao lado do status da compra | atualizar o status do pedido e da reserva no reembolso da reclamação; rate limit junto com o das outras rotas de pagamento |
 | B31 | `src/domain/ticketing/components/manager/*` (abas do painel de ingressos: vendas, participantes, check-in, reembolsos; lotes e barra de abas já com tokens no 18.4e.3) e `hooks/useTicketLotForm.ts`, `hooks/useOfflineCheckIn.ts` | §12 (texto fixo em português, sem `useTranslation`) e §11.1 (cores fixas do tema escuro, `text-white`, `bg-black/40`) | médio — no tema claro dependem das sobrescritas globais (B25) e em `en`/`fr` aparecem em português | 19.x: chaves no namespace do ingresso e tokens `--ug-*`, aba por aba; a divisão do 18.4e.3.0 deixou cada aba num arquivo |
 | B32 | `src/domain/admin/components/AdminPanel.tsx`, `AdminDispatcher.tsx`, `subcomponents/*` (abas Relatórios, Parceiros, Guia Local, Agenda, Planos e Avisos, navegação e acesso negado) | §12 (texto fixo em português) e §11.1 (cores fixas do tema escuro, `bg-[#020508]`, `text-white/50`) | médio — painel só de admin, mas no tema claro depende das sobrescritas globais (B25) e em `en`/`fr` aparece em português | 19.x: namespace `admin` e tokens `--ug-*`; as abas Verificações e Financeiro já seguem o padrão |
+| B33 | telas ainda não levadas ao visual D17 (cerca de 15 arquivos com `Intl.DateTimeFormat` próprio no fuso de Fortaleza e botões com classes escritas à mão) | §13 (um lugar só para cada regra) e §11.1 | baixo — o comportamento está certo, mas cada tela repete a mesma formatação e o mesmo botão | ao levar cada tela ao visual D17, usar `src/ui/styles/controls.ts`, `src/ui/components/ListState.tsx` e `formatBusiness*` de `src/shared/utils/businessDateTime.ts` (20.2) |
 
 ## Resolvidos

=== docs/design/base-d17/README.md — diff ===
@@ -25,3 +25,12 @@ Prints aprovados em 2026-10-27, tirados do app depois dos prompts 20.0 e 20.1 (r
 - Voltar só com o chevron `<` (`BackButton`), sem caixa e sem seta.
 - Identificador (código do pedido) logo abaixo do nome, sem destaque: texto a 50% no escuro e 65% no claro (contraste AA).
 - Filas e listas longas em lista compacta (título, contexto, status e valor); detalhes e decisão na folha inferior (`Dialog`).
+
+## Onde ficam os reutilizáveis
+
+| O quê | Onde |
+|---|---|
+| Componentes visuais genéricos (`SegmentedControl`, `StatusText`, `TextButton`, `BackButton`, `ListState`, `Dialog`, `ConfirmDialog`…) | `src/ui/components/` |
+| Classes de botão e campo (`BUTTON_PRIMARY`, `BUTTON_SECONDARY`, `BUTTON_DANGER`, `INPUT`) | `src/ui/styles/controls.ts` |
+| Funções puras genéricas (datas no fuso do negócio, dinheiro) | `src/shared/utils/` |
+| Peças com regra de negócio (ex.: `SaleClaimAction`) | no próprio domínio, exportadas pelo `index.ts` para as composições |

=== src/domain/bookings/components/buyer/BookingCheckout.tsx — diff ===
@@ -4,7 +4,8 @@ import { useTranslation } from 'react-i18next';
 import { useBookingCheckout } from '../../hooks/useBookingCheckout';
 import type { CreateBookingPayload } from '../../types/bookings';
 import { formatMinor } from '../../utils/money';
-import { BUTTON_PRIMARY, BUTTON_SECONDARY, ListError, ListLoading } from '../shared/ListState';
+import { ListError, ListLoading } from '../../../../ui/components/ListState';
+import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
 import type { RenderPaymentElement } from './types';
 
 interface BookingCheckoutProps {

=== src/domain/bookings/components/buyer/BookingFlow.tsx — diff ===
@@ -4,7 +4,7 @@ import { useTranslation } from 'react-i18next';
 import { BUYER_TERMS_VERSION } from '../../../../shared/constants/legalTerms';
 import { TermsAcceptanceField } from '../../../../ui/legal/TermsAcceptanceField';
 import type { PublicOffer, PublicSlot } from '../../types/bookings';
-import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../shared/ListState';
+import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
 import { BookingCheckout } from './BookingCheckout';
 import { ParticipantsForm } from './ParticipantsForm';
 import { QuantitySelector } from './QuantitySelector';

=== src/domain/bookings/components/buyer/BookingResultView.tsx — diff ===
@@ -5,7 +5,8 @@ import { GlassCard } from '../../../../ui/components/GlassCard';
 import { getBookingUseCase } from '../../application/usecases/getBookingUseCase';
 import type { BookingStatus } from '../../types/bookings';
 import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
-import { BUTTON_PRIMARY, ListError, ListLoading } from '../shared/ListState';
+import { ListError, ListLoading } from '../../../../ui/components/ListState';
+import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
 
 /** Retorno do Stripe para reservas: só mostra o status; quem confirma é o webhook. */
 export function BookingResultView({

=== src/domain/bookings/components/buyer/BuyerBookingCard.tsx — diff ===
@@ -5,8 +5,9 @@ import { rescheduleRefundDeadline } from '../../../../shared/utils/rescheduleRef
 import { StatusText, type StatusTone } from '../../../../ui/components/StatusText';
 import { TextButton } from '../../../../ui/components/TextButton';
 import type { BookingStatus, BookingSummary } from '../../types/bookings';
-import { formatDayShort, formatSlotDateTime } from '../../utils/dates';
+import { formatSlotDateTime } from '../../utils/dates';
 import { formatMinor } from '../../utils/money';
+import { formatBusinessWeekday } from '../../../../shared/utils/businessDateTime';
 
 const STATUS_TONE: Partial<Record<BookingStatus, StatusTone>> = {
   pending_payment: 'warn',
@@ -89,7 +90,7 @@ export function BuyerBookingCard({
                   'bookings.bookingsList.participants',
                   { count: booking.participantsCount }
                 )}`
-              : `${formatDayShort(booking.offer.startsAt, i18n.language)} · ${price}`}
+              : `${formatBusinessWeekday(booking.offer.startsAt, i18n.language)} · ${price}`}
           </p>
         </div>
       </div>
@@ -97,7 +98,7 @@ export function BuyerBookingCard({
         <p className="mt-3 flex items-start gap-2 text-[13px] text-info">
           <CalendarClock size={16} className="shrink-0 mt-px" aria-hidden="true" />
           {t('bookings.buyer.rescheduledNotice', {
-            date: formatDayShort(refundUntil, i18n.language),
+            date: formatBusinessWeekday(refundUntil, i18n.language),
           })}
         </p>
       )}

=== src/domain/bookings/components/buyer/MyBookingsView.tsx — diff ===
@@ -8,7 +8,8 @@ import type { BookingSummary } from '../../types/bookings';
 import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
 import { formatMinor } from '../../utils/money';
 import { previewRefund } from '../../utils/refundPreview';
-import { BUTTON_SECONDARY, ListEmpty, ListError, ListLoading } from '../shared/ListState';
+import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
+import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
 import { BuyerBookingCard } from './BuyerBookingCard';
 
 /** Venda que o comprador pode reclamar; o formato é o de `ClaimableSale` do payment. */

=== src/domain/bookings/components/buyer/ParticipantsForm.tsx — diff ===
@@ -3,7 +3,7 @@ import { useMemo } from 'react';
 import { useForm } from 'react-hook-form';
 import { useTranslation } from 'react-i18next';
 import { participantsFormSchema } from '../../schemas/participantsFormSchema';
-import { BUTTON_PRIMARY, INPUT } from '../shared/ListState';
+import { BUTTON_PRIMARY, INPUT } from '../../../../ui/styles/controls';
 
 interface ParticipantsFormProps {
   count: number;

=== src/domain/bookings/components/buyer/SlotPicker.tsx — diff ===
@@ -2,7 +2,7 @@ import { useTranslation } from 'react-i18next';
 import { usePublicSlots } from '../../hooks/usePublicSlots';
 import type { PublicSlot } from '../../types/bookings';
 import { formatDayLabel, formatSlotTime, fortalezaDateKey } from '../../utils/dates';
-import { ListEmpty, ListError, ListLoading } from '../shared/ListState';
+import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
 
 interface SlotPickerProps {
   offerId: string;

=== src/domain/bookings/components/partner/OfferPriceFields.tsx — diff ===
@@ -7,7 +7,7 @@ import {
 } from 'react-hook-form';
 import { useTranslation } from 'react-i18next';
 import type { OfferFormInput } from '../../schemas/offerFormSchema';
-import { BUTTON_SECONDARY, INPUT } from '../shared/ListState';
+import { BUTTON_SECONDARY, INPUT } from '../../../../ui/styles/controls';
 
 interface OfferPriceFieldsProps {
   control: Control<OfferFormInput>;

=== src/domain/bookings/components/partner/OfferTextFields.tsx — diff ===
@@ -2,7 +2,7 @@ import { useState } from 'react';
 import type { FieldErrors, UseFormRegister } from 'react-hook-form';
 import { useTranslation } from 'react-i18next';
 import type { OfferFormInput } from '../../schemas/offerFormSchema';
-import { INPUT } from '../shared/ListState';
+import { INPUT } from '../../../../ui/styles/controls';
 
 const LANGUAGES = ['pt-BR', 'en', 'fr'] as const;
 type Language = (typeof LANGUAGES)[number];

=== src/domain/bookings/components/partner/PartnerBookingsList.tsx — diff ===
@@ -2,7 +2,8 @@ import { useTranslation } from 'react-i18next';
 import { useOfferBookings } from '../../hooks/useOfferBookings';
 import { formatSlotDateTime } from '../../utils/dates';
 import { formatMinor } from '../../utils/money';
-import { BUTTON_SECONDARY, ListEmpty, ListError, ListLoading } from '../shared/ListState';
+import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
+import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
 
 export function PartnerBookingsList({ offerId }: { offerId: string }) {
   const { t, i18n } = useTranslation();

=== src/domain/bookings/components/partner/PartnerOfferEditor.tsx — diff ===
@@ -12,7 +12,7 @@ import {
 import type { OfferFields } from '../../types/bookings';
 import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
 import { offerFormToFields } from '../../utils/offerFormMapping';
-import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT } from '../shared/ListState';
+import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT } from '../../../../ui/styles/controls';
 import { OfferPriceFields } from './OfferPriceFields';
 import { OfferTextFields } from './OfferTextFields';

=== src/domain/bookings/components/partner/PartnerOfferRow.tsx — diff ===
@@ -2,7 +2,7 @@ import { CalendarClock, Pencil, Users } from 'lucide-react';
 import { useTranslation } from 'react-i18next';
 import type { OfferStatus, PartnerOffer } from '../../types/bookings';
 import { formatMinor } from '../../utils/money';
-import { BUTTON_SECONDARY } from '../shared/ListState';
+import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
 
 const STATUS_STYLE: Record<OfferStatus, string> = {
   draft: 'bg-surface border border-line text-ink/80',

=== src/domain/bookings/components/partner/PartnerOffersManager.tsx — diff ===
@@ -7,7 +7,8 @@ import { usePartnerOffers } from '../../hooks/usePartnerOffers';
 import type { BookableGuideItem, OfferStatus, PartnerOffer } from '../../types/bookings';
 import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
 import { emptyOfferFormValues, offerToFormValues } from '../../utils/offerFormMapping';
-import { BUTTON_SECONDARY, ListEmpty, ListError, ListLoading } from '../shared/ListState';
+import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
+import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
 import { PartnerBookingsList } from './PartnerBookingsList';
 import { PartnerOfferEditor } from './PartnerOfferEditor';
 import { PartnerOfferRow } from './PartnerOfferRow';

=== src/domain/bookings/components/partner/PartnerSlotsManager.tsx — diff ===
@@ -11,7 +11,8 @@ import {
   fortalezaDateKey,
   startOfFortalezaWeek,
 } from '../../utils/dates';
-import { BUTTON_SECONDARY, ListEmpty, ListError, ListLoading } from '../shared/ListState';
+import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
+import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
 import { SlotCancelDialog } from './SlotCancelDialog';
 import { SlotCreationForm } from './SlotCreationForm';
 import { SlotRescheduleDialog } from './SlotRescheduleDialog';

=== src/domain/bookings/components/partner/SlotCancelDialog.tsx — diff ===
@@ -3,7 +3,7 @@ import { useTranslation } from 'react-i18next';
 import { Dialog } from '../../../../ui/components/Dialog';
 import type { PartnerSlot } from '../../types/bookings';
 import { formatSlotDateTime } from '../../utils/dates';
-import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../shared/ListState';
+import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
 
 const BUTTON_DANGER =
   'press min-h-11 px-4 rounded-xl bg-danger-soft border border-danger-line text-danger text-xs font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50';

=== src/domain/bookings/components/partner/SlotCreationForm.tsx — diff ===
@@ -2,7 +2,7 @@ import { useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import type { CreateSlotsPayload } from '../../types/bookings';
 import { fortalezaInputToIso } from '../../utils/dates';
-import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT } from '../shared/ListState';
+import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT } from '../../../../ui/styles/controls';
 
 const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

=== src/domain/bookings/components/partner/SlotRescheduleDialog.tsx — diff ===
@@ -5,7 +5,7 @@ import { Dialog } from '../../../../ui/components/Dialog';
 import type { PartnerSlot } from '../../types/bookings';
 import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
 import { formatSlotDateTime, fortalezaInputToIso } from '../../utils/dates';
-import { BUTTON_PRIMARY, INPUT } from '../shared/ListState';
+import { BUTTON_PRIMARY, INPUT } from '../../../../ui/styles/controls';
 
 const MIN_REASON = 3;
 const MAX_REASON = 300;

=== src/domain/bookings/components/shared/ListState.tsx — APAGUE este arquivo ===

=== src/domain/bookings/utils/dates.ts — diff ===
@@ -54,13 +54,3 @@ export function fortalezaInputToIso(value: string): string | null {
   const [, y, m, d, h, min] = match.map(Number) as [number, number, number, number, number, number];
   return new Date(Date.UTC(y, m - 1, d, h, min) + FORTALEZA_OFFSET_MS).toISOString();
 }
-
-/** Dia da semana, dia e mês, no fuso do negócio, para linhas curtas. */
-export function formatDayShort(iso: string, locale: string): string {
-  return new Intl.DateTimeFormat(locale, {
-    timeZone: BUSINESS_TIME_ZONE,
-    weekday: 'short',
-    day: 'numeric',
-    month: 'short',
-  }).format(new Date(iso));
-}

=== src/domain/payment/components/admin/AdminDebtQueue.tsx — diff ===
@@ -9,9 +9,9 @@ import { waiveAccountDebtUseCase } from '../../application/usecases/waiveAccount
 import { useAdminFinanceQueue } from '../../hooks/useAdminFinanceQueue';
 import type { AdminAccountDebt } from '../../types/adminFinance';
 import { adminFinanceErrorKey, errorCodeOf } from '../../utils/adminFinanceErrors';
-import { formatFortalezaDay } from '../../utils/receivablesFormat';
 import { AdminQueueFrame } from './AdminQueueFrame';
 import { QueueRow } from './QueueRow';
+import { formatBusinessDay } from '../../../../shared/utils/businessDateTime';
 
 export function AdminDebtQueue({
   onNotice,
@@ -67,7 +67,7 @@ export function AdminDebtQueue({
             status={
               <StatusText tone={debt.overdue ? 'danger' : 'muted'}>
                 {t(debt.overdue ? 'adminFinance.debts.overdueSince' : 'adminFinance.debts.dueOn', {
-                  date: formatFortalezaDay(debt.dueAt, i18n.language),
+                  date: formatBusinessDay(debt.dueAt, i18n.language),
                 })}
               </StatusText>
             }

=== src/domain/payment/components/admin/AdminQueueFrame.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { adminFinanceErrorKey } from '../../utils/adminFinanceErrors';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';

/** Carregando, erro, vazio e "carregar mais" de uma fila do admin (AGENTS.md §11.8). */
export function AdminQueueFrame({
  hint,
  loading,
  error,
  empty,
  emptyMessage,
  hasMore,
  onRetry,
  onLoadMore,
  children,
}: {
  hint: string;
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyMessage: string;
  hasMore: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-ink/70">{hint}</p>
      {error ? (
        <ListError message={t(adminFinanceErrorKey(error))} onRetry={onRetry} />
      ) : loading && empty ? (
        <ListLoading label={t('adminFinance.loading')} />
      ) : empty ? (
        <ListEmpty message={emptyMessage} />
      ) : (
        <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
          {children}
        </ul>
      )}
      {hasMore && !error && (
        <button
          type="button"
          disabled={loading}
          onClick={onLoadMore}
          className={`${BUTTON_SECONDARY} w-full`}
        >
          {t('adminFinance.loadMore')}
        </button>
      )}
    </div>
  );
}

=== src/domain/payment/components/admin/ForceMajeureQueue.tsx — diff ===
@@ -9,10 +9,10 @@ import { StatusText } from '../../../../ui/components/StatusText';
 import { useAdminFinanceQueue } from '../../hooks/useAdminFinanceQueue';
 import type { AdminForceMajeureReview } from '../../types/adminFinance';
 import { adminFinanceErrorKey, errorCodeOf } from '../../utils/adminFinanceErrors';
-import { formatFortalezaDay } from '../../utils/receivablesFormat';
 import { AdminQueueFrame } from './AdminQueueFrame';
 import { ForceMajeureSheet } from './ForceMajeureSheet';
 import { QueueRow } from './QueueRow';
+import { formatBusinessDay } from '../../../../shared/utils/businessDateTime';
 
 const OBJECT_URL_TTL_MS = 60_000;
 
@@ -93,7 +93,7 @@ export function ForceMajeureQueue({
             status={
               <StatusText tone="info">
                 {t('adminFinance.forceMajeure.declaredAt', {
-                  date: formatFortalezaDay(review.declaredAt, i18n.language),
+                  date: formatBusinessDay(review.declaredAt, i18n.language),
                 })}
               </StatusText>
             }

=== src/domain/payment/components/admin/ForceMajeureSheet.tsx — diff ===
@@ -4,8 +4,8 @@ import { formatMoneyMinor } from '../../../../shared/utils/money';
 import { Dialog } from '../../../../ui/components/Dialog';
 import { TextButton } from '../../../../ui/components/TextButton';
 import type { AdminForceMajeureReview } from '../../types/adminFinance';
-import { formatFortalezaDay } from '../../utils/receivablesFormat';
-import { PRIMARY_BUTTON } from './adminFinanceStyles';
+import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
+import { formatBusinessDay } from '../../../../shared/utils/businessDateTime';
 
 /** Detalhes da força maior declarada e a decisão do admin (D16, 3A). */
 export function ForceMajeureSheet({
@@ -43,7 +43,7 @@ export function ForceMajeureSheet({
             </p>
             <p className="text-[12px] text-ink/60">
               {t('adminFinance.forceMajeure.meta', {
-                date: formatFortalezaDay(review.declaredAt, i18n.language),
+                date: formatBusinessDay(review.declaredAt, i18n.language),
                 amount: formatMoneyMinor(review.remainingMinor, i18n.language),
               })}
             </p>
@@ -56,7 +56,7 @@ export function ForceMajeureSheet({
             type="button"
             disabled={busy}
             onClick={() => onDecide(review, true)}
-            className={`${PRIMARY_BUTTON} w-full min-h-12 text-[15px]`}
+            className={`${BUTTON_PRIMARY} w-full min-h-12 text-[15px]`}
           >
             {t('adminFinance.forceMajeure.approve')}
           </button>

=== src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx — diff ===
@@ -6,8 +6,8 @@ import { Dialog } from '../../../../ui/components/Dialog';
 import { decideSaleClaimUseCase } from '../../application/usecases/decideSaleClaimUseCase';
 import type { AdminSaleClaim, SaleClaimOutcome } from '../../types/adminFinance';
 import { adminFinanceErrorKey, errorCodeOf } from '../../utils/adminFinanceErrors';
-import { formatFortalezaDay } from '../../utils/receivablesFormat';
-import { PRIMARY_BUTTON } from './adminFinanceStyles';
+import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
+import { formatBusinessDay } from '../../../../shared/utils/businessDateTime';
 
 const OUTCOMES: SaleClaimOutcome[] = ['release', 'refund_full', 'refund_partial'];
 
@@ -90,12 +90,12 @@ export function SaleClaimDecisionDialog({
             )}
             <p className="text-[12px] text-ink/60">
               {t('adminFinance.claims.meta', {
-                opened: formatFortalezaDay(claim.openedAt, i18n.language),
+                opened: formatBusinessDay(claim.openedAt, i18n.language),
                 paid: money(claim.grossMinor),
               })}
               {claim.serviceEndsAt &&
                 ` · ${t('adminFinance.claims.metaEnd', {
-                  date: formatFortalezaDay(claim.serviceEndsAt, i18n.language),
+                  date: formatBusinessDay(claim.serviceEndsAt, i18n.language),
                 })}`}
             </p>
           </div>
@@ -183,7 +183,7 @@ export function SaleClaimDecisionDialog({
           <button
             type="submit"
             disabled={sending}
-            className={`${PRIMARY_BUTTON} w-full min-h-12 text-[15px] flex items-center justify-center gap-2`}
+            className={`${BUTTON_PRIMARY} w-full min-h-12 text-[15px] flex items-center justify-center gap-2`}
           >
             {sending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
             {t(sending ? 'adminFinance.sending' : 'adminFinance.claims.submit')}

=== src/domain/payment/components/admin/SaleClaimQueue.tsx — diff ===
@@ -5,10 +5,10 @@ import { StatusText } from '../../../../ui/components/StatusText';
 import { listAdminSaleClaimsUseCase } from '../../application/usecases/listAdminSaleClaimsUseCase';
 import { useAdminFinanceQueue } from '../../hooks/useAdminFinanceQueue';
 import type { AdminSaleClaim } from '../../types/adminFinance';
-import { formatFortalezaDay } from '../../utils/receivablesFormat';
 import { AdminQueueFrame } from './AdminQueueFrame';
 import { QueueRow } from './QueueRow';
 import { SaleClaimDecisionDialog } from './SaleClaimDecisionDialog';
+import { formatBusinessDay } from '../../../../shared/utils/businessDateTime';
 
 export function SaleClaimQueue({
   onNotice,
@@ -45,7 +45,7 @@ export function SaleClaimQueue({
                 ) : (
                   <StatusText tone="warn">
                     {t('adminFinance.claims.decideBy', {
-                      date: formatFortalezaDay(claim.decideBy, i18n.language),
+                      date: formatBusinessDay(claim.decideBy, i18n.language),
                     })}
                   </StatusText>
                 )

=== src/domain/payment/components/admin/adminFinanceStyles.ts — APAGUE este arquivo ===

=== src/domain/payment/components/claims/SaleClaimAction.tsx — diff ===
@@ -7,8 +7,8 @@ import { TextButton } from '../../../../ui/components/TextButton';
 import { useSaleClaimFor } from '../../hooks/mySaleClaimsContext';
 import type { ClaimableSale, SaleClaimStatus } from '../../types/saleClaims';
 import { CLAIM_WINDOW_HOURS, isWithinClaimWindow } from '../../utils/claimWindow';
-import { formatFortalezaDay } from '../../utils/receivablesFormat';
 import { SaleClaimDialog } from './SaleClaimDialog';
+import { formatBusinessDay } from '../../../../shared/utils/businessDateTime';
 
 const TONE: Record<SaleClaimStatus, StatusTone> = {
   open: 'warn',
@@ -28,7 +28,7 @@ export function SaleClaimAction({ sale }: { sale: ClaimableSale }) {
     return (
       <StatusText tone={TONE[claim.status]}>
         {t(`saleClaims.line.${claim.status}`, {
-          date: formatFortalezaDay(claim.decideBy, i18n.language),
+          date: formatBusinessDay(claim.decideBy, i18n.language),
           amount: formatMoneyMinor(claim.refundAmountMinor ?? 0, i18n.language),
         })}
       </StatusText>
@@ -42,7 +42,7 @@ export function SaleClaimAction({ sale }: { sale: ClaimableSale }) {
   return (
     <div className="flex items-center justify-between gap-3">
       <span className="text-[13px] text-ink/70">
-        {t('saleClaims.prompt', { date: formatFortalezaDay(until, i18n.language) })}
+        {t('saleClaims.prompt', { date: formatBusinessDay(until, i18n.language) })}
       </span>
       <TextButton tone="warn" onClick={() => setOpen(true)} aria-label={t('saleClaims.action')}>
         <MessageSquareWarning size={16} aria-hidden="true" />

=== src/domain/payment/components/receivables/DebtCard.tsx — diff ===
@@ -1,13 +1,9 @@
 import { useTranslation } from 'react-i18next';
+import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
 import { formatMoneyMinor } from '../../../../shared/utils/money';
 import type { AccountDebtView } from '../../types/receivables';
-import { formatFortalezaDateTime } from '../../utils/receivablesFormat';
 import { canDeclareForceMajeure, canPayDebt, debtStatusKey, debtStatusTone } from './debtStatus';
-
-const PRIMARY =
-  'press min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold focus-visible:ring-2 focus-visible:ring-teal-400/50';
-const SECONDARY =
-  'press min-h-11 px-4 rounded-xl border border-line text-xs font-bold text-ink hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-teal-400/50';
+import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
 
 export function DebtCard({
   debt,
@@ -62,19 +58,19 @@ export function DebtCard({
           {status === 'overdue'
             ? t('receivables.debts.overdueExplain')
             : t('receivables.debts.dueOn', {
-                date: formatFortalezaDateTime(debt.dueAt, i18n.language),
+                date: formatBusinessDateTime(debt.dueAt, i18n.language),
               })}
         </p>
       )}
       {(showPay || showDeclare) && (
         <div className="flex flex-wrap gap-2">
           {showPay && (
-            <button type="button" onClick={() => onPay(debt)} className={PRIMARY}>
+            <button type="button" onClick={() => onPay(debt)} className={BUTTON_PRIMARY}>
               {t('receivables.debts.pay')}
             </button>
           )}
           {showDeclare && (
-            <button type="button" onClick={() => onDeclare(debt)} className={SECONDARY}>
+            <button type="button" onClick={() => onDeclare(debt)} className={BUTTON_SECONDARY}>
               {t('receivables.debts.declare')}
             </button>
           )}

=== src/domain/payment/components/receivables/DebtList.tsx — diff ===
@@ -6,7 +6,7 @@ import type { AccountDebtView } from '../../types/receivables';
 import { DebtCard } from './DebtCard';
 import { DebtPaymentDialog } from './DebtPaymentDialog';
 import { ForceMajeureDialog } from './ForceMajeureDialog';
-import { ReceivablesEmpty, ReceivablesError, ReceivablesLoading } from './ReceivablesState';
+import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
 
 export function DebtList({
   accounts,
@@ -39,11 +39,11 @@ export function DebtList({
         </p>
       )}
       {error ? (
-        <ReceivablesError messageKey={error} onRetry={() => void reload()} />
+        <ListError message={t(error)} onRetry={() => void reload()} />
       ) : loading && debts.length === 0 ? (
-        <ReceivablesLoading label={t('receivables.debts.loading')} />
+        <ListLoading label={t('receivables.debts.loading')} />
       ) : debts.length === 0 ? (
-        <ReceivablesEmpty message={t('receivables.debts.empty')} />
+        <ListEmpty message={t('receivables.debts.empty')} />
       ) : (
         <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
           {debts.map((debt) => (

=== src/domain/payment/components/receivables/DebtPaymentDialog.tsx — diff ===
@@ -6,7 +6,7 @@ import { StripePaymentElement } from '../../adapters/ui/StripePaymentElement';
 import { startDebtPaymentUseCase } from '../../application/usecases/startDebtPaymentUseCase';
 import type { AccountDebtView } from '../../types/receivables';
 import { receivablesErrorKey } from '../../utils/receivablesFormat';
-import { ReceivablesLoading } from './ReceivablesState';
+import { ListLoading } from '../../../../ui/components/ListState';
 
 export function DebtPaymentDialog({
   debt,
@@ -60,7 +60,7 @@ export function DebtPaymentDialog({
           onError={setError}
         />
       ) : (
-        <ReceivablesLoading label={t('receivables.payDialog.loading')} />
+        <ListLoading label={t('receivables.payDialog.loading')} />
       )}
     </Dialog>
   );

=== src/domain/payment/components/receivables/PayoutEntryRow.tsx — diff ===
@@ -1,8 +1,8 @@
 import { useTranslation } from 'react-i18next';
 import { formatMoneyMinor } from '../../../../shared/utils/money';
 import type { PayoutEntryView } from '../../types/receivables';
-import { formatFortalezaDateTime } from '../../utils/receivablesFormat';
 import { payoutStatusKey, payoutStatusTone } from './payoutStatus';
+import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
 
 function AmountLine({
   label,
@@ -24,7 +24,7 @@ function AmountLine({
 export function PayoutEntryRow({ entry }: { entry: PayoutEntryView }) {
   const { t, i18n } = useTranslation();
   const money = (value: number) => formatMoneyMinor(value, i18n.language);
-  const date = (iso: string) => formatFortalezaDateTime(iso, i18n.language);
+  const date = (iso: string) => formatBusinessDateTime(iso, i18n.language);
   const status = payoutStatusKey(entry);
   const net = Math.max(0, entry.partnerAmountMinor - entry.offsetMinor);
   const title =

=== src/domain/payment/components/receivables/PayoutStatement.tsx — diff ===
@@ -3,7 +3,7 @@ import { useTranslation } from 'react-i18next';
 import { usePartnerPayouts } from '../../hooks/usePartnerPayouts';
 import type { PartnerPaymentAccount } from '../../types/payment';
 import { PayoutEntryRow } from './PayoutEntryRow';
-import { ReceivablesEmpty, ReceivablesError, ReceivablesLoading } from './ReceivablesState';
+import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
 
 export function PayoutStatement({ accounts }: { accounts: PartnerPaymentAccount[] }) {
   const { t } = useTranslation();
@@ -42,11 +42,11 @@ export function PayoutStatement({ accounts }: { accounts: PartnerPaymentAccount[
         </div>
       )}
       {error ? (
-        <ReceivablesError messageKey={error} onRetry={() => void reload()} />
+        <ListError message={t(error)} onRetry={() => void reload()} />
       ) : loading && entries.length === 0 ? (
-        <ReceivablesLoading label={t('receivables.statement.loading')} />
+        <ListLoading label={t('receivables.statement.loading')} />
       ) : entries.length === 0 ? (
-        <ReceivablesEmpty message={t('receivables.statement.empty')} />
+        <ListEmpty message={t('receivables.statement.empty')} />
       ) : (
         <>
           <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">

=== src/domain/payment/components/receivables/ReceivablesState.tsx — APAGUE este arquivo ===

=== src/domain/payment/utils/receivablesFormat.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
const KNOWN_ERRORS = [
  'NOT_FOUND',
  'DEBT_ALREADY_SETTLED',
  'DEBT_SUSPENDED',
  'FORCE_MAJEURE_ALREADY_DECLARED',
  'FORCE_MAJEURE_TOO_LATE',
  'FORCE_MAJEURE_NOT_ALLOWED',
  'INVALID_PROOF_FILE',
  'IMAGE_TOO_LARGE',
  'INVALID_DOCUMENT_FILE',
];

/** Erros chegam pelo `code` da API (AGENTS.md §12.5); o texto vem das traduções. */
export function receivablesErrorKey(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  return `receivables.errors.${KNOWN_ERRORS.includes(code) ? code : 'UNAVAILABLE'}`;
}

=== src/domain/ticketing/components/manager/OccurrenceCancelDialog.tsx — diff ===
@@ -3,7 +3,12 @@ import { useId, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { Dialog } from '../../../../ui/components/Dialog';
 import { cancelPartnerEventOccurrenceUseCase, type EventOccurrence } from '../../../events';
-import { BUTTON_DANGER, BUTTON_PRIMARY, BUTTON_SECONDARY, FIELD } from './sessionButtons';
+import {
+  BUTTON_DANGER,
+  BUTTON_PRIMARY,
+  BUTTON_SECONDARY,
+  INPUT,
+} from '../../../../ui/styles/controls';
 
 const MIN_REASON = 3;
 const MAX_REASON = 300;
@@ -82,7 +87,7 @@ export function OccurrenceCancelDialog({
               rows={2}
               onChange={(event) => setReason(event.target.value)}
               aria-describedby={`${id}-reason-hint`}
-              className={`${FIELD} py-2`}
+              className={`${INPUT} py-2`}
             />
             <p id={`${id}-reason-hint`} className="text-[11px] text-ink/70">
               {t('ticketSessions.cancelDialog.reasonHint')}

=== src/domain/ticketing/components/manager/OccurrencePostponeDialog.tsx — diff ===
@@ -4,7 +4,7 @@ import { useTranslation } from 'react-i18next';
 import { businessDateTimeToIso } from '../../../../shared/utils/businessDateTime';
 import { Dialog } from '../../../../ui/components/Dialog';
 import { type EventOccurrence, postponePartnerEventOccurrenceUseCase } from '../../../events';
-import { BUTTON_PRIMARY, FIELD } from './sessionButtons';
+import { BUTTON_PRIMARY, INPUT } from '../../../../ui/styles/controls';
 
 const MIN_REASON = 3;
 const MAX_REASON = 300;
@@ -78,7 +78,7 @@ export function OccurrencePostponeDialog({
             value={when}
             onChange={(event) => setWhen(event.target.value)}
             aria-describedby={`${id}-duration`}
-            className={FIELD}
+            className={INPUT}
           />
           <p id={`${id}-duration`} className="text-[11px] text-ink/70">
             {t('ticketSessions.postponeDialog.durationKept')}
@@ -95,7 +95,7 @@ export function OccurrencePostponeDialog({
             rows={3}
             onChange={(event) => setReason(event.target.value)}
             aria-describedby={`${id}-reason-hint`}
-            className={`${FIELD} py-2`}
+            className={`${INPUT} py-2`}
           />
           <p id={`${id}-reason-hint`} className="text-[11px] text-ink/70">
             {t('ticketSessions.postponeDialog.reasonHint')}

=== src/domain/ticketing/components/manager/SessionActions.tsx — diff ===
@@ -3,7 +3,7 @@ import { useTranslation } from 'react-i18next';
 import type { EventOccurrence } from '../../../events';
 import { OccurrenceCancelDialog } from './OccurrenceCancelDialog';
 import { OccurrencePostponeDialog } from './OccurrencePostponeDialog';
-import { BUTTON_SECONDARY } from './sessionButtons';
+import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
 
 /** Adiar ou cancelar a sessão escolhida; sessão já adiada ou cancelada só mostra o status. */
 export function SessionActions({

=== src/domain/ticketing/components/manager/sessionButtons.ts — APAGUE este arquivo ===

=== src/domain/ticketing/components/wallet/WalletOrderCard.tsx — diff ===
@@ -1,6 +1,7 @@
 import { CalendarClock, Ticket } from 'lucide-react';
 import type { ReactNode } from 'react';
 import { useTranslation } from 'react-i18next';
+import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
 import { formatMoneyMinor } from '../../../../shared/utils/money';
 import { rescheduleRefundDeadline } from '../../../../shared/utils/rescheduleRefundDeadline';
 import { StatusText, type StatusTone } from '../../../../ui/components/StatusText';
@@ -48,9 +49,7 @@ export function WalletOrderCard({
 }: WalletOrderCardProps) {
   const { t, i18n } = useTranslation();
   const format = (iso: string, options: Intl.DateTimeFormatOptions) =>
-    new Intl.DateTimeFormat(i18n.language, { timeZone: 'America/Fortaleza', ...options }).format(
-      new Date(iso)
-    );
+    formatBusinessDate(iso, i18n.language, options);
   const event = order.eventSnapshot;
   const upcoming = event ? new Date(event.startsAt).getTime() > Date.now() : false;
   const refundUntil =

=== src/shared/i18n/resources.ts — diff ===
@@ -97,6 +97,7 @@ export interface TranslationResource {
     language: string;
     cancel: string;
     confirm: string;
+    retry: string;
     /** Selo "Use Guide Verificado" explicado ao toque (D11). */
     seal: {
       label: string;
@@ -326,6 +327,7 @@ const ptBR: TranslationResource = {
   common: {
     language: 'Idioma',
     cancel: 'Cancelar',
+    retry: 'Tentar novamente',
     confirm: 'Confirmar',
     seal: {
       label: 'Ver o que significa o selo Use Guide Verificado',
@@ -607,6 +609,7 @@ const en: TranslationResource = {
   common: {
     language: 'Language',
     cancel: 'Cancel',
+    retry: 'Try again',
     confirm: 'Confirm',
     seal: {
       label: 'See what the Use Guide Verified badge means',
@@ -882,6 +885,7 @@ const fr: TranslationResource = {
   common: {
     language: 'Langue',
     cancel: 'Annuler',
+    retry: 'Réessayer',
     confirm: 'Confirmer',
     seal: {
       label: 'Voir ce que signifie le badge Use Guide Vérifié',

=== src/shared/utils/businessDateTime.ts — diff ===
@@ -24,3 +24,36 @@ export function isoToBusinessDateTime(value?: string): string {
   }
   return new Date(time - BUSINESS_OFFSET_MS).toISOString().slice(0, 16);
 }
+
+const BUSINESS_TIME_ZONE = 'America/Fortaleza';
+
+/** Data no fuso do negócio (AGENTS.md §12.4), com o formato que a tela pedir. */
+export function formatBusinessDate(
+  iso: string,
+  locale: string,
+  options: Intl.DateTimeFormatOptions
+): string {
+  return new Intl.DateTimeFormat(locale, { timeZone: BUSINESS_TIME_ZONE, ...options }).format(
+    new Date(iso)
+  );
+}
+
+/** "28 de out." — linhas curtas de status e prazo. */
+export function formatBusinessDay(iso: string, locale: string): string {
+  return formatBusinessDate(iso, locale, { day: 'numeric', month: 'short' });
+}
+
+/** "seg., 26 de out." — data de uma compra ou serviço. */
+export function formatBusinessWeekday(iso: string, locale: string): string {
+  return formatBusinessDate(iso, locale, { weekday: 'short', day: 'numeric', month: 'short' });
+}
+
+/** "26 de out., 14:30" — data e hora de um registro. */
+export function formatBusinessDateTime(iso: string, locale: string): string {
+  return formatBusinessDate(iso, locale, {
+    day: '2-digit',
+    month: 'short',
+    hour: '2-digit',
+    minute: '2-digit',
+  });
+}

=== src/ui/components/ListState.tsx — ARQUIVO NOVO, conteúdo completo ===
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from './Skeleton';

/** Estados de uma lista assíncrona (AGENTS.md §11.8): carregando, vazio e erro com nova tentativa. */
export function ListLoading({ label }: { label: string }) {
  return (
    <div role="status" className="space-y-2">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function ListEmpty({ message }: { message: string }) {
  return <p className="py-6 text-center text-sm text-ink/70">{message}</p>;
}

export function ListError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-danger-soft border border-danger-line"
    >
      <AlertCircle size={16} className="text-danger shrink-0" aria-hidden="true" />
      <p className="flex-1 text-xs text-danger">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="press min-h-11 px-3 rounded-lg bg-surface border border-line hover:bg-accent-soft text-ink text-xs font-semibold inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        <RefreshCw size={13} aria-hidden="true" />
        {t('common.retry')}
      </button>
    </div>
  );
}

=== src/ui/styles/controls.ts — ARQUIVO NOVO, conteúdo completo ===
/** Classes dos controles do design system (D17): botões e campos têm um lugar só. */
const FOCUS = 'focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';
const BUTTON_BASE = `press min-h-11 px-4 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed ${FOCUS}`;

/** A ação principal da tela; só uma por tela (AGENTS.md §11.1). */
export const BUTTON_PRIMARY = `${BUTTON_BASE} bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold`;
export const BUTTON_SECONDARY = `${BUTTON_BASE} bg-surface border border-line hover:bg-accent-soft text-ink font-semibold`;
export const BUTTON_DANGER = `${BUTTON_BASE} bg-danger-soft border border-danger-line text-danger font-semibold`;
export const INPUT = `w-full min-h-11 px-3 rounded-xl bg-surface border border-line text-sm text-ink ${FOCUS}`;

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run src/domain/bookings/components/buyer/BookingCheckout.tsx src/domain/bookings/components/buyer/BookingFlow.tsx src/domain/bookings/components/buyer/BookingResultView.tsx src/domain/bookings/components/buyer/BuyerBookingCard.tsx src/domain/bookings/components/buyer/MyBookingsView.tsx src/domain/bookings/components/buyer/ParticipantsForm.tsx src/domain/bookings/components/buyer/SlotPicker.tsx src/domain/bookings/components/partner/OfferPriceFields.tsx src/domain/bookings/components/partner/OfferTextFields.tsx src/domain/bookings/components/partner/PartnerBookingsList.tsx src/domain/bookings/components/partner/PartnerOfferEditor.tsx src/domain/bookings/components/partner/PartnerOfferRow.tsx src/domain/bookings/components/partner/PartnerOffersManager.tsx src/domain/bookings/components/partner/PartnerSlotsManager.tsx src/domain/bookings/components/partner/SlotCancelDialog.tsx src/domain/bookings/components/partner/SlotCreationForm.tsx src/domain/bookings/components/partner/SlotRescheduleDialog.tsx src/domain/bookings/utils/dates.ts src/domain/payment/components/admin/AdminDebtQueue.tsx src/domain/payment/components/admin/AdminQueueFrame.tsx src/domain/payment/components/admin/ForceMajeureQueue.tsx src/domain/payment/components/admin/ForceMajeureSheet.tsx src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx src/domain/payment/components/admin/SaleClaimQueue.tsx src/domain/payment/components/claims/SaleClaimAction.tsx src/domain/payment/components/receivables/DebtCard.tsx src/domain/payment/components/receivables/DebtList.tsx src/domain/payment/components/receivables/DebtPaymentDialog.tsx src/domain/payment/components/receivables/PayoutEntryRow.tsx src/domain/payment/components/receivables/PayoutStatement.tsx src/domain/payment/utils/receivablesFormat.ts src/domain/ticketing/components/manager/OccurrenceCancelDialog.tsx src/domain/ticketing/components/manager/OccurrencePostponeDialog.tsx src/domain/ticketing/components/manager/SessionActions.tsx src/domain/ticketing/components/wallet/WalletOrderCard.tsx src/shared/i18n/resources.ts src/shared/utils/businessDateTime.ts src/ui/components/ListState.tsx src/ui/styles/controls.ts` (todos verdes). Não precisa rodar a suíte inteira.
- abra Minhas reservas, Recebimentos do parceiro e Admin › Financeiro: as telas devem continuar iguais.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
