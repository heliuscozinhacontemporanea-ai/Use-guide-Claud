# Prompt 20.3 — Compras em Configurações (D18)

> Lote 17, gerado do commit de referência `b99f6e3` da branch `claude/agents-md-v2`. Aplique depois do 20.2. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 20.3 — Compras em Configurações

Telas aprovadas em 2026-10-27 (prints reais). Muda comportamento visível e uma regra de cancelamento, decididos na D18.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e os apagados. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova.

O QUE MUDA (decisão D18, já registrada em docs/arquitetura/decisoes.md):
1) Configurações › Compras (sub-tela `purchases` do menu, privada, volta para Configurações): pedidos de ingresso e reservas num histórico só, com Finalizadas, Pendentes e Canceladas, agrupadas pelo mês da compra. Composição em src/app/compositions/BuyerPurchasesComposition.tsx; lista e folha neutras em src/ui/components/purchases/; cada domínio monta as próprias linhas (useTicketPurchases, useBookingPurchases) e a própria folha (TicketPurchaseDetails, BookingPurchaseDetails). O "Relatar problema" continua vindo do payment pela composição.
2) Folha de detalhes: nome em cima, código e data da compra abaixo, recibo, política, Ver ingressos ou Ver reserva e, conforme o caso, Pagar, Cancelar compra, o aviso de prazo encerrado ou Relatar problema. A folha NÃO mostra o valor do reembolso.
3) Confirmação do cancelamento: mostra o valor, o motivo (arrependimento, nova data ou política) e até quando vale. calculateBuyerRefund passa a devolver `until` nos dois espelhos (src/shared/utils e server/shared/kernel), com o teste de paridade.
4) Prazo terminado não invalida a compra: sem reembolso a folha não oferece cancelar e avisa que os ingressos ou a reserva continuam valendo. O backend de reservas passa a recusar o cancelamento sem reembolso (CANCELLATION_NOT_ALLOWED) e a vaga não volta para venda, como já acontecia com os ingressos.
5) Ingressos e Minhas reservas por tempo (Próximos/Anteriores), sem a aba Pedidos e sem cancelar ou relatar. Saem WalletOrderCard, BuyerTicketWalletComposition e BuyerBookingsComposition.
6) ConfirmDialog e Dialog com os tokens dos dois temas; ConfirmDialog ganha title, highlight, note e cancelLabel; nova chave common.close e BUTTON_POSITIVE em src/ui/styles/controls.ts. Configurações com o visual D17 (lista em cartão).

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/decisoes.md (alterar)
- server/application/usecases/bookings/bookingApplicationUseCases.test.ts (alterar)
- server/domain/bookings/services/bookingService.test.ts (alterar)
- server/domain/bookings/services/bookingService.ts (alterar)
- server/shared/kernel/cancellationPolicy.test.ts (alterar)
- server/shared/kernel/cancellationPolicy.ts (alterar)
- src/app/compositions/BuyerBookingsComposition.tsx (apagar)
- src/app/compositions/BuyerPurchasesComposition.tsx (criar)
- src/app/compositions/BuyerTicketWalletComposition.tsx (apagar)
- src/app/menu/SideMenu.tsx (alterar)
- src/app/menu/menuViews.test.ts (alterar)
- src/app/menu/menuViews.ts (alterar)
- src/domain/bookings/components/buyer/BookingPurchaseDetails.test.tsx (criar)
- src/domain/bookings/components/buyer/BookingPurchaseDetails.tsx (criar)
- src/domain/bookings/components/buyer/BuyerBookingCard.tsx (alterar)
- src/domain/bookings/components/buyer/MyBookingsView.tsx (alterar)
- src/domain/bookings/components/buyer/buyerComponents.test.tsx (alterar)
- src/domain/bookings/hooks/useBookingPurchases.ts (criar)
- src/domain/bookings/index.ts (alterar)
- src/domain/bookings/utils/bookingPurchaseSection.ts (criar)
- src/domain/bookings/utils/refundPreview.ts (alterar)
- src/domain/ticketing/components/UserTicketsHistoryView.tsx (alterar)
- src/domain/ticketing/components/purchases/TicketPurchaseDetails.tsx (criar)
- src/domain/ticketing/components/wallet/WalletOrderCard.tsx (apagar)
- src/domain/ticketing/hooks/useTicketPurchases.ts (criar)
- src/domain/ticketing/index.ts (alterar)
- src/domain/ticketing/utils/ticketPurchaseSection.ts (criar)
- src/domain/ticketing/utils/ticketWalletRules.test.ts (alterar)
- src/domain/ticketing/utils/ticketWalletRules.ts (alterar)
- src/domain/user/components/SettingsView.tsx (alterar)
- src/shared/i18n/bookingsResources.ts (alterar)
- src/shared/i18n/purchasesResources.ts (criar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/i18n/ticketWalletResources.ts (alterar)
- src/shared/utils/cancellationPolicy.ts (alterar)
- src/ui/components/ConfirmDialog.tsx (alterar)
- src/ui/components/Dialog.tsx (alterar)
- src/ui/components/purchases/PurchaseHistoryView.tsx (criar)
- src/ui/components/purchases/PurchaseReceiptSheet.tsx (criar)
- src/ui/components/purchases/purchaseEntry.ts (criar)
- src/ui/legal/TermsAcceptanceField.test.tsx (alterar)
- src/ui/styles/controls.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/decisoes.md — diff ===
@@ -27,6 +27,7 @@
 | D15 | Termos com aceite registrado e idioma do editor de conteúdo | ✅ Aprovada | 2026-10-25 |
 | D16 | Dívidas, reclamações, força maior e reagendamento | ✅ Aprovada | 2026-10-25 |
 | D17 | Visual: fundo neutro, superfícies sólidas e menos informação por tela | ✅ Aprovada | 2026-10-27 |
+| D18 | Compras em Configurações; cancelar só com reembolso; valor só na confirmação | ✅ Aprovada | 2026-10-27 |
 
 ---
 
@@ -262,3 +263,13 @@ Propostas montadas em preview (Minhas reservas, Pedidos e Financeiro do admin) e
 * **AGENTS.md §11.1** atualizado pela S16 (prompt A6).
 * **Prompts:** A6 (regra), 20.0 (base visual: tokens, fundo e `GlassCard` sólido) e 20.1 (as três telas das propostas), no fim do lote 17; as demais telas seguem tela a tela, junto com o 19.x.
 
+## D18 — Compras em Configurações, cancelamento e reembolso (2026-10-27)
+
+* **Compras:** histórico de tudo que a pessoa comprou (ingressos e reservas), em Configurações, organizado pelo estado do dinheiro: **Finalizadas · Pendentes · Canceladas**, agrupadas pelo mês da compra. Os planos do parceiro ficam fora.
+* **Ingressos e Reservas:** abas próprias organizadas por tempo (Próximos e Anteriores), só com QR Code e detalhes. A aba Pedidos sai de Meus ingressos.
+* **Ações da compra na folha de detalhes:** Pagar, Cancelar compra e Relatar problema ficam em Compras. Na folha, o nome do evento ou serviço fica em cima, com o código do pedido e a data da compra logo abaixo.
+* **Valor do reembolso só na confirmação:** a folha não mostra quanto volta, para não induzir o cancelamento. Depois de tocar em Cancelar compra, a confirmação mostra o valor, o motivo (arrependimento, nova data ou política) e até quando ele vale, antes de qualquer ação.
+* **Prazo terminado não invalida a compra:** sem reembolso, não há o que cancelar. A folha não oferece cancelar e avisa que os ingressos ou a reserva continuam valendo; o backend recusa o cancelamento sem reembolso em ingressos e reservas (`CANCELLATION_NOT_ALLOWED`), e a vaga não volta para venda.
+* **Fora por enquanto:** o meio de pagamento na folha ("Pago no cartão"), que exige o backend guardar esse dado.
+* **Prompt:** 20.3.
+

=== server/application/usecases/bookings/bookingApplicationUseCases.test.ts — diff ===
@@ -170,18 +170,6 @@ describe('cancelBookingByBuyerApplicationUseCase', () => {
       expect.objectContaining({ amountMinor: 10000 })
     );
   });
-
-  it('0% não chama o Stripe', async () => {
-    vi.mocked(requestCancellationByBuyerUseCase).mockResolvedValue({
-      booking: { ...BOOKING, status: 'canceled' },
-      refundPercent: 0,
-      refundAmountMinor: 0,
-    } as never);
-    await expect(
-      cancelBookingByBuyerApplicationUseCase({ uid: 'buyer-1', admin: false }, 'bk_1', '')
-    ).resolves.toEqual({ status: 'canceled', refundPercent: 0, refundAmountMinor: 0 });
-    expect(processProviderRefundUseCase).not.toHaveBeenCalled();
-  });
 });
 
 describe('cancelSlotByPartnerApplicationUseCase', () => {

=== server/domain/bookings/services/bookingService.test.ts — diff ===
@@ -188,6 +188,18 @@ describe('BookingService', () => {
     });
   });
 
+  it('sem reembolso o cancelamento é recusado e a reserva continua valendo', async () => {
+    const { service, port, setNow } = setup();
+    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
+    await service.confirmBookingPayment(booking.id, 'pi_1');
+    setNow(new Date(new Date(STARTS_AT).getTime() - 12 * 3_600_000).toISOString());
+    await expect(service.requestCancellationByBuyer(BUYER, booking.id, '')).rejects.toMatchObject({
+      code: 'CANCELLATION_NOT_ALLOWED',
+    });
+    expect(port.bookings.get(booking.id)?.status).toBe('confirmed');
+    expect(port.slots.get('slot-1')?.capacitySold).toBe(2);
+  });
+
   it('reagendada pelo parceiro: até 7 dias depois do aviso devolve tudo, mesmo fora da política (D16)', async () => {
     const { service, port, setNow } = setup();
     const booking = await service.createPendingBooking(BUYER, INPUT, FEES);

=== server/domain/bookings/services/bookingService.ts — diff ===
@@ -198,6 +198,13 @@ export class BookingService {
       serviceFeeMinor: 0,
       rescheduledAt: booking.rescheduledAt,
     });
+    // Sem reembolso não há o que cancelar: a reserva paga continua valendo até a data do serviço.
+    if (calculated.refundMinor <= 0) {
+      throw new BookingDomainError(
+        'CANCELLATION_NOT_ALLOWED',
+        'O prazo de cancelamento terminou. Sua reserva continua valendo.'
+      );
+    }
     const refund = {
       refundPercent: calculated.percent,
       refundAmountMinor: calculated.refundMinor,

=== server/shared/kernel/cancellationPolicy.test.ts — diff ===
@@ -30,11 +30,13 @@ function refund(
 describe('políticas de cancelamento (D14)', () => {
   it('arrependimento: 7 dias da compra e 48 h antes do início devolve tudo, com a taxa de serviço', () => {
     const purchased = hoursBefore(100).toISOString();
+    // Vale até 48 h antes do início, que chega antes dos 7 dias da compra.
     expect(refund('event', 'none', 72, purchased)).toEqual({
       reason: 'withdrawal',
       percent: 100,
       refundMinor: 10000,
       serviceFeeRefundMinor: 300,
+      until: hoursBefore(48).toISOString(),
     });
     // Menos de 48 h antes do início: vale a política, e a taxa de serviço não volta.
     expect(refund('event', 'none', 40, purchased)).toMatchObject({
@@ -59,11 +61,13 @@ describe('políticas de cancelamento (D14)', () => {
     };
     const now = hoursBefore(24);
     const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();
+    // Aviso de 7 dias atrás: o prazo termina agora.
     expect(calculateBuyerRefund({ ...base, now, rescheduledAt: daysAgo(7) })).toEqual({
       reason: 'reschedule',
       percent: 100,
       refundMinor: 10000,
       serviceFeeRefundMinor: 300,
+      until: now.toISOString(),
     });
     expect(calculateBuyerRefund({ ...base, now, rescheduledAt: daysAgo(7.1) })).toMatchObject({
       reason: 'none',
@@ -73,6 +77,18 @@ describe('políticas de cancelamento (D14)', () => {
     ).toMatchObject({ reason: 'none', refundMinor: 0 });
   });
 
+  it('informa até quando vale o reembolso de agora', () => {
+    const purchased = hoursBefore(30 * 24).toISOString();
+    // Arrependimento termina 7 dias depois da compra, antes das 48 h do início.
+    expect(refund('booking', 'none', 29 * 24, purchased).until).toBe(
+      hoursBefore(23 * 24).toISOString()
+    );
+    // Moderada das reservas: 100% até 5 dias antes, depois 50% até 24 h antes.
+    expect(refund('booking', 'moderate', 6 * 24).until).toBe(hoursBefore(5 * 24).toISOString());
+    expect(refund('booking', 'moderate', 3 * 24).until).toBe(hoursBefore(24).toISOString());
+    expect(refund('booking', 'moderate', 12).until).toBeNull();
+  });
+
   it('eventos: flexível 24 h, moderada 7 dias, rígida 30 dias', () => {
     expect(refund('event', 'flexible', 25).refundMinor).toBe(10000);
     expect(refund('event', 'flexible', 23).refundMinor).toBe(0);

=== server/shared/kernel/cancellationPolicy.ts — diff ===
@@ -82,6 +82,8 @@ export interface BuyerRefund {
   percent: number;
   refundMinor: number;
   serviceFeeRefundMinor: number;
+  /** Até quando vale este reembolso (ISO); depois o valor muda ou acaba. `null` quando não há reembolso. */
+  until: string | null;
 }
 
 /**
@@ -102,21 +104,25 @@ export function calculateBuyerRefund(params: {
   const nowMs = params.now.getTime();
   const startsAtMs = new Date(params.startsAt).getTime();
   const hoursUntilStart = (startsAtMs - nowMs) / HOUR_MS;
+  const iso = (ms: number) => new Date(ms).toISOString();
   if (hoursUntilStart <= 0) {
-    return { reason: 'none', percent: 0, refundMinor: 0, serviceFeeRefundMinor: 0 };
+    return { reason: 'none', percent: 0, refundMinor: 0, serviceFeeRefundMinor: 0, until: null };
   }
   const daysSinceReschedule = params.rescheduledAt
     ? (nowMs - new Date(params.rescheduledAt).getTime()) / (24 * HOUR_MS)
     : Number.POSITIVE_INFINITY;
   if (daysSinceReschedule >= 0 && daysSinceReschedule <= RESCHEDULE_REFUND_DAYS) {
+    const rescheduledAtMs = new Date(params.rescheduledAt as string).getTime();
     return {
       reason: 'reschedule',
       percent: 100,
       refundMinor: params.paidMinor,
       serviceFeeRefundMinor: params.serviceFeeMinor,
+      until: iso(Math.min(rescheduledAtMs + RESCHEDULE_REFUND_DAYS * 24 * HOUR_MS, startsAtMs)),
     };
   }
-  const daysSincePurchase = (nowMs - new Date(params.purchasedAt).getTime()) / (24 * HOUR_MS);
+  const purchasedAtMs = new Date(params.purchasedAt).getTime();
+  const daysSincePurchase = (nowMs - purchasedAtMs) / (24 * HOUR_MS);
   if (
     daysSincePurchase <= WITHDRAWAL_DAYS &&
     hoursUntilStart >= WITHDRAWAL_MIN_HOURS_BEFORE_START
@@ -126,15 +132,23 @@ export function calculateBuyerRefund(params: {
       percent: 100,
       refundMinor: params.paidMinor,
       serviceFeeRefundMinor: params.serviceFeeMinor,
+      until: iso(
+        Math.min(
+          purchasedAtMs + WITHDRAWAL_DAYS * 24 * HOUR_MS,
+          startsAtMs - WITHDRAWAL_MIN_HOURS_BEFORE_START * HOUR_MS
+        )
+      ),
     };
   }
   const tiers = POLICY_TIERS[params.family][params.policy] ?? [];
-  const percent = tiers.find((tier) => hoursUntilStart >= tier.hoursBefore)?.percent ?? 0;
+  const tier = tiers.find((candidate) => hoursUntilStart >= candidate.hoursBefore);
+  const percent = tier?.percent ?? 0;
   return {
     reason: percent > 0 ? 'policy' : 'none',
     percent,
     // Arredonda para baixo: nunca devolve mais do que o percentual da política.
     refundMinor: Math.floor((params.paidMinor * percent) / 100),
     serviceFeeRefundMinor: 0,
+    until: tier && percent > 0 ? iso(startsAtMs - tier.hoursBefore * HOUR_MS) : null,
   };
 }

=== src/app/compositions/BuyerBookingsComposition.tsx — APAGUE este arquivo ===

=== src/app/compositions/BuyerPurchasesComposition.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useState } from 'react';
import { BookingPurchaseDetails, useBookingPurchases } from '../../domain/bookings';
import { MySaleClaimsProvider, SaleClaimAction } from '../../domain/payment';
import { TicketPurchaseDetails, useTicketPurchases } from '../../domain/ticketing';
import { PurchaseHistoryView } from '../../ui/components/purchases/PurchaseHistoryView';
import type { PurchaseEntry } from '../../ui/components/purchases/purchaseEntry';
import { BUTTON_SECONDARY } from '../../ui/styles/controls';
import { useTranslation } from 'react-i18next';

interface BuyerPurchasesCompositionProps {
  onBack: () => void;
  onOpenTickets: () => void;
  onOpenBookings: () => void;
}

/**
 * Configurações › Compras: junta pedidos de ingresso e reservas num histórico só. Cada domínio
 * monta as próprias linhas e a folha de detalhes; o "Relatar problema" vem do payment (D16, 2A).
 */
export function BuyerPurchasesComposition(props: BuyerPurchasesCompositionProps) {
  return (
    <MySaleClaimsProvider>
      <BuyerPurchases {...props} />
    </MySaleClaimsProvider>
  );
}

function BuyerPurchases({ onBack, onOpenTickets, onOpenBookings }: BuyerPurchasesCompositionProps) {
  const { t } = useTranslation();
  const tickets = useTicketPurchases();
  const bookings = useBookingPurchases();
  const [open, setOpen] = useState<PurchaseEntry | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const idOf = (prefix: string) =>
    open?.key.startsWith(prefix) ? open.key.slice(prefix.length) : null;
  const close = () => setOpen(null);

  return (
    <PurchaseHistoryView
      entries={[...tickets.entries, ...bookings.entries]}
      loading={tickets.loading || bookings.loading}
      error={tickets.error ?? bookings.error}
      notice={notice ?? tickets.actions.feedback?.message}
      onRetry={() => {
        void tickets.reload();
        void bookings.reload();
      }}
      onBack={onBack}
      onOpen={(entry) => {
        setNotice(null);
        tickets.actions.setFeedback(null);
        setOpen(entry);
      }}
      footer={
        !bookings.loading &&
        bookings.hasMore && (
          <button
            type="button"
            onClick={() => void bookings.loadMore()}
            className={BUTTON_SECONDARY}
          >
            {t('bookings.buyer.loadMore')}
          </button>
        )
      }
    >
      <TicketPurchaseDetails
        source={tickets}
        orderId={idOf('ticket:')}
        onClose={close}
        onViewTickets={onOpenTickets}
        renderClaimAction={(sale) => <SaleClaimAction sale={sale} />}
      />
      <BookingPurchaseDetails
        source={bookings}
        bookingId={idOf('booking:')}
        onClose={close}
        onViewBooking={onOpenBookings}
        onNotice={setNotice}
        renderClaimAction={(sale) => <SaleClaimAction sale={sale} />}
      />
    </PurchaseHistoryView>
  );
}

=== src/app/compositions/BuyerTicketWalletComposition.tsx — APAGUE este arquivo ===

=== src/app/menu/SideMenu.tsx — diff ===
@@ -19,8 +19,9 @@ import {
 import { Z_INDEX } from '../../shared/constants/zIndex';
 import { cn } from '../../shared/utils/cn';
 import { SidebarLayout } from '../../ui/layouts/SidebarLayout';
-import { BuyerBookingsComposition } from '../compositions/BuyerBookingsComposition';
-import { BuyerTicketWalletComposition } from '../compositions/BuyerTicketWalletComposition';
+import { MyBookingsView } from '../../domain/bookings';
+import { UserTicketsHistoryView } from '../../domain/ticketing';
+import { BuyerPurchasesComposition } from '../compositions/BuyerPurchasesComposition';
 import { type MenuView, parentMenuView, visibleMenuView } from './menuViews';
 import { useSideMenu } from './useSideMenu';
 import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
@@ -39,9 +40,9 @@ const FULL_HEIGHT_VIEWS: readonly MenuView[] = [
   'about',
 ];
 
-const SETTINGS_VIEWS: readonly MenuView[] = ['settings', 'language', 'appearance'];
+const SETTINGS_VIEWS: readonly MenuView[] = ['settings', 'purchases', 'language', 'appearance'];
 
-/** Compõe as telas de vários domínios (usuário, ingressos, reservas, favoritos, conteúdo) no menu. */
+/** Compõe as telas de vários domínios (usuário, ingressos, reservas, compras, favoritos, conteúdo) no menu. */
 export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
   const { user } = useAuthContext();
   const { goTo } = useLocalizedRouting();
@@ -138,6 +139,15 @@ export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
             onBack={goBack}
             onOpenLanguage={() => showView('language')}
             onOpenAppearance={() => showView('appearance')}
+            onOpenPurchases={user ? () => showView('purchases') : undefined}
+          />
+        );
+      case 'purchases':
+        return (
+          <BuyerPurchasesComposition
+            onBack={goBack}
+            onOpenTickets={() => showView('tickets')}
+            onOpenBookings={() => showView('bookings')}
           />
         );
       case 'password':
@@ -158,9 +168,9 @@ export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
       case 'support':
         return <SupportView onBack={goBack} userEmail={user?.email} />;
       case 'tickets':
-        return <BuyerTicketWalletComposition onBack={goBack} />;
+        return <UserTicketsHistoryView onBack={goBack} />;
       case 'bookings':
-        return <BuyerBookingsComposition onBack={goBack} />;
+        return <MyBookingsView onBack={goBack} />;
       case 'favorites':
         return <FavoritesList onBack={goBack} onSelectItem={closeMenuAndOpenItem} />;
       case 'account':

=== src/app/menu/menuViews.test.ts — diff ===
@@ -24,6 +24,7 @@ describe('sub-telas do menu', () => {
   it('voltar leva à tela-mãe: idioma e aparência voltam para configurações, senha para a conta', () => {
     expect(parentMenuView('language')).toBe('settings');
     expect(parentMenuView('appearance')).toBe('settings');
+    expect(parentMenuView('purchases')).toBe('settings');
     expect(parentMenuView('password')).toBe('account');
     expect(parentMenuView('favorites')).toBe('main');
     expect(parentMenuView('bookings')).toBe('main');
@@ -31,7 +32,14 @@ describe('sub-telas do menu', () => {
   });
 
   it('sem login, telas com dados do usuário mostram a tela principal (com o login)', () => {
-    for (const view of ['account', 'password', 'tickets', 'bookings', 'favorites'] as const) {
+    for (const view of [
+      'account',
+      'password',
+      'tickets',
+      'bookings',
+      'favorites',
+      'purchases',
+    ] as const) {
       expect(visibleMenuView(view, false)).toBe('main');
       expect(visibleMenuView(view, true)).toBe(view);
     }

=== src/app/menu/menuViews.ts — diff ===
@@ -10,6 +10,7 @@ export const MENU_VIEWS = [
   'bookings',
   'favorites',
   'settings',
+  'purchases',
   'language',
   'appearance',
   'support',
@@ -27,6 +28,7 @@ const PARENT_VIEW: Record<Exclude<MenuView, 'main'>, MenuView> = {
   bookings: 'main',
   favorites: 'main',
   settings: 'main',
+  purchases: 'settings',
   language: 'settings',
   appearance: 'settings',
   support: 'main',
@@ -40,6 +42,7 @@ const PRIVATE_VIEWS: readonly MenuView[] = [
   'tickets',
   'bookings',
   'favorites',
+  'purchases',
 ];
 
 function isMenuView(value: string): value is MenuView {

=== src/domain/bookings/components/buyer/BookingPurchaseDetails.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { BookingPurchasesSource } from '../../hooks/useBookingPurchases';
import type { BookingSummary } from '../../types/bookings';
import { bookingPurchaseSection } from '../../utils/bookingPurchaseSection';
import { BookingPurchaseDetails } from './BookingPurchaseDetails';

const NOW = new Date('2026-11-01T12:00:00.000Z');

function booking(overrides: Partial<BookingSummary> = {}): BookingSummary {
  return {
    id: 'bk_0123456789xyz',
    offerId: 'of_1',
    slotId: 'sl_1',
    guideItemId: 'it_1',
    kind: 'tour',
    status: 'confirmed',
    lines: [{ priceOptionId: 'adult', quantity: 2, unitAmountMinor: 18000 }],
    participantsCount: 2,
    totalMinor: 36000,
    expiresAt: null,
    offer: {
      title: 'Passeio de barco',
      startsAt: '2026-11-20T12:00:00.000Z',
      durationMinutes: 120,
      meetingPoint: 'Praça Principal',
      cancellationPolicy: 'moderate',
    },
    cancellation: null,
    rescheduledAt: null,
    createdAt: '2026-10-01T12:00:00.000Z',
    ...overrides,
  };
}

function source(data: BookingSummary[]): BookingPurchasesSource {
  return {
    data,
    entries: [],
    loading: false,
    error: null,
    hasMore: false,
    reload: vi.fn(async () => undefined),
    loadMore: vi.fn(async () => undefined),
    cancel: vi.fn(async () => ({
      status: 'canceled',
      refundPercent: 100,
      refundAmountMinor: 36000,
    })),
  } as unknown as BookingPurchasesSource;
}

function renderDetails(target: BookingSummary) {
  const src = source([target]);
  render(
    <BookingPurchaseDetails
      source={src}
      bookingId={target.id}
      onClose={vi.fn()}
      onViewBooking={vi.fn()}
      onNotice={vi.fn()}
    />
  );
  return src;
}

describe('folha da reserva em Compras', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    await i18n.changeLanguage('pt-BR');
  });
  afterEach(() => vi.useRealTimers());

  it('a folha não mostra o valor do reembolso; a confirmação mostra valor, motivo e prazo', () => {
    const src = renderDetails(booking());
    expect(screen.getByText(/#bk_0123456 · comprado em/)).toBeTruthy();
    expect(screen.queryByText('Reembolso')).toBeNull();
    expect(screen.queryByText(/Vale até/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar compra' }));
    expect(screen.getByText('Reembolso')).toBeTruthy();
    expect(screen.getByText(/R\$\s?360,00/, { selector: 'p.text-2xl' })).toBeTruthy();
    expect(screen.getByText(/Pela política Moderada, você recebe 100% do valor/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Manter compra' }));
    expect(src.cancel).not.toHaveBeenCalled();
  });

  it('depois do prazo não oferece cancelar: a reserva continua valendo', () => {
    renderDetails(booking({ offer: { ...booking().offer, startsAt: '2026-11-02T00:00:00.000Z' } }));
    expect(screen.queryByRole('button', { name: 'Cancelar compra' })).toBeNull();
    expect(screen.getByText(/Sua reserva continua valendo/)).toBeTruthy();
  });

  it('confirmar cancela pela API e recarrega', async () => {
    const src = renderDetails(booking());
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar compra' }));
    const buttons = screen.getAllByRole('button', { name: 'Cancelar compra' });
    fireEvent.click(buttons[buttons.length - 1] as HTMLElement);
    await vi.waitFor(() => expect(src.reload).toHaveBeenCalled());
    expect(src.cancel).toHaveBeenCalledWith('bk_0123456789xyz');
  });
});

describe('seção da reserva no histórico', () => {
  it('paga em Finalizadas, esperando pagamento em Pendentes, expirada ou devolvida em Canceladas', () => {
    expect(bookingPurchaseSection(booking(), NOW)).toBe('done');
    expect(bookingPurchaseSection(booking({ status: 'no_show' }), NOW)).toBe('done');
    expect(
      bookingPurchaseSection(
        booking({ status: 'pending_payment', expiresAt: '2026-11-01T12:10:00.000Z' }),
        NOW
      )
    ).toBe('pending');
    expect(
      bookingPurchaseSection(
        booking({ status: 'pending_payment', expiresAt: '2026-11-01T11:50:00.000Z' }),
        NOW
      )
    ).toBe('canceled');
    expect(bookingPurchaseSection(booking({ status: 'refunded' }), NOW)).toBe('canceled');
  });
});

=== src/domain/bookings/components/buyer/BookingPurchaseDetails.tsx — ARQUIVO NOVO, conteúdo completo ===
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

=== src/domain/bookings/components/buyer/BuyerBookingCard.tsx — diff ===
@@ -3,7 +3,6 @@ import type { ReactNode } from 'react';
 import { useTranslation } from 'react-i18next';
 import { rescheduleRefundDeadline } from '../../../../shared/utils/rescheduleRefundDeadline';
 import { StatusText, type StatusTone } from '../../../../ui/components/StatusText';
-import { TextButton } from '../../../../ui/components/TextButton';
 import type { BookingStatus, BookingSummary } from '../../types/bookings';
 import { formatSlotDateTime } from '../../utils/dates';
 import { formatMinor } from '../../utils/money';
@@ -20,19 +19,14 @@ const STATUS_TONE: Partial<Record<BookingStatus, StatusTone>> = {
 
 /**
  * Cartão de reserva do comprador (D17): o que foi comprado e quando, e uma linha só com o que a
- * pessoa precisa saber ou fazer agora.
+ * pessoa precisa saber agora.
  */
 export function BuyerBookingCard({
   booking,
   upcoming,
-  onCancel,
-  claimAction,
 }: {
   booking: BookingSummary;
   upcoming: boolean;
-  onCancel?: () => void;
-  /** "Relatar", montado pela composição (D16, 2A). */
-  claimAction?: ReactNode;
 }) {
   const { t, i18n } = useTranslation();
   const Icon = booking.kind === 'private_entry' ? Ticket : Compass;
@@ -51,27 +45,14 @@ export function BuyerBookingCard({
         : t(`bookings.bookingStatus.${booking.status}`)}
     </StatusText>
   ) : upcoming ? (
-    (booking.offer.meetingPoint || onCancel) && (
-      <div className="flex items-center justify-between gap-3">
-        <span className="min-w-0 inline-flex items-center gap-1.5 text-[13px] text-ink/70">
-          {booking.offer.meetingPoint && (
-            <>
-              <MapPin size={15} className="shrink-0" aria-hidden="true" />
-              <span className="truncate">{booking.offer.meetingPoint}</span>
-            </>
-          )}
-        </span>
-        {onCancel && (
-          <TextButton tone="danger" onClick={onCancel}>
-            {t('bookings.buyer.cancelShort')}
-          </TextButton>
-        )}
-      </div>
+    booking.offer.meetingPoint && (
+      <span className="min-w-0 inline-flex items-center gap-1.5 text-[13px] text-ink/70">
+        <MapPin size={15} className="shrink-0" aria-hidden="true" />
+        <span className="truncate">{booking.offer.meetingPoint}</span>
+      </span>
     )
   ) : (
-    claimAction || (
-      <StatusText tone="muted">{t(`bookings.bookingStatus.${booking.status}`)}</StatusText>
-    )
+    <StatusText tone="muted">{t(`bookings.bookingStatus.${booking.status}`)}</StatusText>
   );
 
   return (

=== src/domain/bookings/components/buyer/MyBookingsView.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { useMyBookings } from '../../hooks/useMyBookings';
import { BuyerBookingCard } from './BuyerBookingCard';

/**
 * Reservas do comprador por tempo (Próximas e Anteriores), com os detalhes do serviço. Cancelar e
 * relatar ficam em Configurações › Compras.
 */
export function MyBookingsView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { data, loading, error, hasMore, reload, loadMore } = useMyBookings();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const now = new Date();
  const upcoming = data.filter((booking) => new Date(booking.offer.startsAt) > now);
  const past = data.filter((booking) => new Date(booking.offer.startsAt) <= now);
  const shown = tab === 'upcoming' ? upcoming : past;

  return (
    <section className="w-full space-y-5">
      <div className="flex items-center gap-2">
        <BackButton label={t('bookings.buyer.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">
          {t('bookings.buyer.myBookingsTitle')}
        </h2>
      </div>
      <SegmentedControl
        label={t('bookings.buyer.tabsLabel')}
        value={tab}
        onChange={setTab}
        options={[
          { value: 'upcoming', label: t('bookings.buyer.upcomingTab', { count: upcoming.length }) },
          { value: 'past', label: t('bookings.buyer.pastTab', { count: past.length }) },
        ]}
      />
      {error && <ListError message={error} onRetry={() => void reload()} />}
      {!error && !loading && shown.length === 0 && (
        <ListEmpty
          message={t(
            tab === 'upcoming' ? 'bookings.buyer.emptyUpcoming' : 'bookings.buyer.emptyPast'
          )}
        />
      )}
      {shown.length > 0 && (
        <ul className="space-y-3">
          {shown.map((booking) => (
            <BuyerBookingCard key={booking.id} booking={booking} upcoming={tab === 'upcoming'} />
          ))}
        </ul>
      )}
      {loading && <ListLoading label={t('bookings.buyer.loading')} />}
      {!loading && hasMore && (
        <button type="button" onClick={() => void loadMore()} className={BUTTON_SECONDARY}>
          {t('bookings.buyer.loadMore')}
        </button>
      )}
    </section>
  );
}

=== src/domain/bookings/components/buyer/buyerComponents.test.tsx — diff ===
@@ -181,17 +181,22 @@ describe('previewRefund', () => {
   });
 
   it('segue a política gravada fora do arrependimento: 100%, 50% e 0%', () => {
-    expect(previewRefund(booking('moderate'), new Date('2026-11-04T11:00:00.000Z'))).toEqual({
+    expect(previewRefund(booking('moderate'), new Date('2026-11-04T11:00:00.000Z'))).toMatchObject({
       refundPercent: 100,
       refundAmountMinor: 20000,
     });
-    expect(previewRefund(booking('moderate'), new Date('2026-11-08T11:00:00.000Z'))).toEqual({
+    // 50% vale até 24 h antes do início.
+    expect(previewRefund(booking('moderate'), new Date('2026-11-08T11:00:00.000Z'))).toMatchObject({
       refundPercent: 50,
       refundAmountMinor: 10000,
+      reason: 'policy',
+      until: '2026-11-09T11:00:00.000Z',
     });
-    expect(previewRefund(booking('moderate'), new Date('2026-11-10T00:00:00.000Z'))).toEqual({
+    expect(previewRefund(booking('moderate'), new Date('2026-11-10T00:00:00.000Z'))).toMatchObject({
       refundPercent: 0,
       refundAmountMinor: 0,
+      reason: 'none',
+      until: null,
     });
   });
 
@@ -201,7 +206,7 @@ describe('previewRefund', () => {
         booking('none', '2026-10-01T12:00:00.000Z', '2026-11-08T00:00:00.000Z'),
         new Date('2026-11-09T00:00:00.000Z')
       )
-    ).toEqual({ refundPercent: 100, refundAmountMinor: 20000 });
+    ).toMatchObject({ refundPercent: 100, refundAmountMinor: 20000 });
   });
 
   it('arrependimento devolve tudo mesmo sem reembolso na política', () => {
@@ -210,6 +215,6 @@ describe('previewRefund', () => {
         booking('none', '2026-11-05T11:00:00.000Z'),
         new Date('2026-11-06T11:00:00.000Z')
       )
-    ).toEqual({ refundPercent: 100, refundAmountMinor: 20000 });
+    ).toMatchObject({ refundPercent: 100, refundAmountMinor: 20000 });
   });
 });

=== src/domain/bookings/hooks/useBookingPurchases.ts — ARQUIVO NOVO, conteúdo completo ===
import { createElement } from 'react';
import { Compass, Ticket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate, formatBusinessDay } from '../../../shared/utils/businessDateTime';
import type { PurchaseEntry } from '../../../ui/components/purchases/purchaseEntry';
import type { StatusTone } from '../../../ui/components/StatusText';
import type { BookingSummary } from '../types/bookings';
import { bookingPurchaseSection, isBookingAwaitingPayment } from '../utils/bookingPurchaseSection';
import { formatMinor } from '../utils/money';
import { useMyBookings } from './useMyBookings';

// Código curto da reserva para o atendimento; o ID completo continua no backend.
export const BOOKING_CODE_LENGTH = 10;

const DONE_STATUS: Partial<Record<BookingSummary['status'], { tone: StatusTone; key: string }>> = {
  confirmed: { tone: 'success', key: 'paid' },
  completed: { tone: 'success', key: 'paid' },
  no_show: { tone: 'danger', key: 'noShow' },
  disputed: { tone: 'warn', key: 'disputed' },
};

/** Reservas do comprador como linhas do histórico de Compras. */
export function useBookingPurchases() {
  const { t, i18n } = useTranslation();
  const bookings = useMyBookings();
  const now = new Date();

  const statusOf = (booking: BookingSummary): { tone: StatusTone; text: string } => {
    const done = DONE_STATUS[booking.status];
    if (done) return { tone: done.tone, text: t(`purchases.status.${done.key}`) };
    if (isBookingAwaitingPayment(booking, now)) {
      return {
        tone: 'warn',
        text: booking.expiresAt
          ? t('purchases.status.awaitingPayment', {
              time: formatBusinessDate(booking.expiresAt, i18n.language, { timeStyle: 'short' }),
            })
          : t('purchases.status.awaitingPaymentNoTime'),
      };
    }
    const refund = booking.cancellation?.refundAmountMinor ?? 0;
    if (booking.cancellation?.by === 'partner') {
      // Cancelamento pelo proprietário devolve sempre o valor inteiro (D14).
      return { tone: 'muted', text: t('purchases.status.canceledByPartner') };
    }
    if (refund > 0) {
      return {
        tone: 'muted',
        text: t('purchases.status.refundedAmount', { amount: formatMinor(refund, i18n.language) }),
      };
    }
    return { tone: 'muted', text: t('purchases.status.notCompleted') };
  };

  const entryOf = (booking: BookingSummary): PurchaseEntry => {
    const section = bookingPurchaseSection(booking, now);
    return {
      key: `booking:${booking.id}`,
      section,
      icon: createElement(booking.kind === 'private_entry' ? Ticket : Compass, {
        size: 18,
        'aria-hidden': true,
      }),
      title: booking.offer.title,
      code: booking.id.slice(0, BOOKING_CODE_LENGTH),
      purchasedAt: booking.createdAt,
      serviceLine: t(`purchases.service.${booking.kind}`, {
        date: formatBusinessDay(booking.offer.startsAt, i18n.language),
      }),
      amountMinor: booking.totalMinor,
      struck: section === 'canceled',
      status: statusOf(booking),
    };
  };

  return { ...bookings, entries: bookings.data.map(entryOf) };
}

export type BookingPurchasesSource = ReturnType<typeof useBookingPurchases>;

=== src/domain/bookings/index.ts — diff ===
@@ -2,6 +2,11 @@
 export { BookingOfferPanel } from './components/buyer/BookingOfferPanel';
 export { BookingResultView } from './components/buyer/BookingResultView';
 export { MyBookingsView } from './components/buyer/MyBookingsView';
+export {
+  BookingPurchaseDetails,
+  type BookingClaimSale,
+} from './components/buyer/BookingPurchaseDetails';
+export { useBookingPurchases } from './hooks/useBookingPurchases';
 export type { PaymentElementSlotProps, RenderPaymentElement } from './components/buyer/types';
 export { PartnerOffersManager } from './components/partner/PartnerOffersManager';
 export { isBookableCategory } from './utils/offerKindByCategory';

=== src/domain/bookings/utils/bookingPurchaseSection.ts — ARQUIVO NOVO, conteúdo completo ===
import type { PurchaseSection } from '../../../ui/components/purchases/purchaseEntry';
import type { BookingSummary } from '../types/bookings';

const DONE = new Set<BookingSummary['status']>(['confirmed', 'completed', 'no_show', 'disputed']);

/** Reserva ainda dentro da janela de pagamento. */
export function isBookingAwaitingPayment(booking: BookingSummary, now: Date): boolean {
  return (
    booking.status === 'pending_payment' &&
    (!booking.expiresAt || new Date(booking.expiresAt).getTime() > now.getTime())
  );
}

/** Seção da reserva no histórico de Compras: paga, esperando pagamento ou sem cobrança/devolvida. */
export function bookingPurchaseSection(booking: BookingSummary, now: Date): PurchaseSection {
  if (DONE.has(booking.status)) return 'done';
  return isBookingAwaitingPayment(booking, now) ? 'pending' : 'canceled';
}

=== src/domain/bookings/utils/refundPreview.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { type BuyerRefund, calculateBuyerRefund } from '../../../shared/utils/cancellationPolicy';
import type { BookingSummary } from '../types/bookings';

/**
 * Mesma regra do backend (arrependimento, reagendamento e política gravada na compra), só para mostrar o valor antes de
 * cancelar. Quem decide o reembolso é o backend.
 */
export function previewRefund(
  booking: Pick<BookingSummary, 'kind' | 'offer' | 'totalMinor' | 'createdAt' | 'rescheduledAt'>,
  now: Date
): {
  refundPercent: number;
  refundAmountMinor: number;
  reason: BuyerRefund['reason'];
  until: string | null;
} {
  const refund = calculateBuyerRefund({
    family: (booking.kind as string) === 'transfer' ? 'transfer' : 'booking',
    policy: booking.offer.cancellationPolicy,
    purchasedAt: booking.createdAt,
    startsAt: booking.offer.startsAt,
    now,
    paidMinor: booking.totalMinor,
    serviceFeeMinor: 0,
    rescheduledAt: booking.rescheduledAt ?? undefined,
  });
  return {
    refundPercent: refund.percent,
    refundAmountMinor: refund.refundMinor,
    reason: refund.reason,
    until: refund.until,
  };
}

=== src/domain/ticketing/components/UserTicketsHistoryView.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../ui/components/BackButton';
import { ListEmpty, ListError, ListLoading } from '../../../ui/components/ListState';
import { SegmentedControl } from '../../../ui/components/SegmentedControl';
import { cn } from '../../../shared/utils/cn';
import { useTicketWalletActions } from '../hooks/useTicketWalletActions';
import { useUserTicketsAndOrders } from '../hooks/useUserTickets';
import type { Ticket } from '../types/ticketing';
import { canTransferTicket } from '../utils/ticketWalletRules';
import { TransferTicketForm } from './wallet/TransferTicketForm';
import { WalletTicketCard } from './wallet/WalletTicketCard';

interface UserTicketsHistoryViewProps {
  onBack?: () => void;
}

const ROUND_BUTTON =
  'press w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-ink/80 hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50';

function endsAtOf(ticket: Ticket): number {
  const event = ticket.eventSnapshot;
  return event ? new Date(event.endsAt || event.startsAt).getTime() : Number.POSITIVE_INFINITY;
}

/**
 * Ingressos do comprador por tempo (Próximos e Anteriores), com QR Code e transferência. Pagar,
 * cancelar e relatar ficam em Configurações › Compras.
 */
export function UserTicketsHistoryView({ onBack }: UserTicketsHistoryViewProps = {}) {
  const { t } = useTranslation();
  const wallet = useUserTicketsAndOrders(true);
  const { tickets, orders, loading, error, reload } = wallet;
  const actions = useTicketWalletActions(wallet);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const now = new Date();
  const upcoming = tickets.filter((ticket) => endsAtOf(ticket) > now.getTime());
  const past = tickets.filter((ticket) => endsAtOf(ticket) <= now.getTime());
  const shown = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && <BackButton label={t('ticketWallet.back')} onClick={onBack} />}
          <h2 className="text-[22px] font-display font-bold text-ink">{t('ticketWallet.title')}</h2>
        </div>
        <button
          type="button"
          onClick={() => void reload()}
          aria-label={t('ticketWallet.refresh')}
          className={ROUND_BUTTON}
        >
          <RefreshCw
            size={18}
            className={loading ? 'animate-spin text-accent' : ''}
            aria-hidden="true"
          />
        </button>
      </div>

      <SegmentedControl
        label={t('ticketWallet.tabsLabel')}
        value={tab}
        onChange={setTab}
        options={[
          { value: 'upcoming', label: t('ticketWallet.tabs.upcoming', { count: upcoming.length }) },
          { value: 'past', label: t('ticketWallet.tabs.past', { count: past.length }) },
        ]}
      />

      {actions.feedback && (
        <p
          role={actions.feedback.type === 'error' ? 'alert' : 'status'}
          className={cn(
            'p-3 rounded-xl border text-xs flex items-center gap-2',
            actions.feedback.type === 'success'
              ? 'bg-success-soft border-success-line text-success'
              : 'bg-danger-soft border-danger-line text-danger'
          )}
        >
          {actions.feedback.type === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle size={16} className="shrink-0" aria-hidden="true" />
          )}
          {actions.feedback.message}
        </p>
      )}

      {error && <ListError message={error} onRetry={() => void reload()} />}

      {loading && tickets.length === 0 ? (
        <ListLoading label={t('ticketWallet.loading')} />
      ) : (
        !error &&
        shown.length === 0 && (
          <ListEmpty
            message={t(
              tab === 'upcoming' ? 'ticketWallet.emptyUpcoming' : 'ticketWallet.emptyPast'
            )}
          />
        )
      )}

      {shown.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shown.map((ticket) => (
            <WalletTicketCard
              key={ticket.id}
              ticket={ticket}
              qrDataUrl={
                actions.qrPreview?.ticketId === ticket.id ? actions.qrPreview.dataUrl : undefined
              }
              canTransfer={canTransferTicket(
                ticket,
                orders.find((order) => order.id === ticket.orderId),
                now
              )}
              busy={actions.busy}
              onShowQr={() => void actions.showQr(ticket)}
              onReissueQr={() => void actions.reissueQr(ticket)}
              onTransfer={() => actions.setTransferTicket(ticket)}
            />
          ))}
        </div>
      )}

      {actions.transferTicket && (
        <TransferTicketForm
          ticket={actions.transferTicket}
          busy={actions.busy}
          onSubmit={(recipient) => void actions.submitTransfer(recipient)}
          onCancel={() => actions.setTransferTicket(null)}
        />
      )}
    </div>
  );
}

=== src/domain/ticketing/components/purchases/TicketPurchaseDetails.tsx — ARQUIVO NOVO, conteúdo completo ===
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

=== src/domain/ticketing/components/wallet/WalletOrderCard.tsx — APAGUE este arquivo ===

=== src/domain/ticketing/hooks/useTicketPurchases.ts — ARQUIVO NOVO, conteúdo completo ===
import { createElement } from 'react';
import { Ticket as TicketIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate, formatBusinessDay } from '../../../shared/utils/businessDateTime';
import type { PurchaseEntry } from '../../../ui/components/purchases/purchaseEntry';
import type { StatusTone } from '../../../ui/components/StatusText';
import type { TicketOrder } from '../types/ticketing';
import { isOrderPayable, ticketPurchaseSection } from '../utils/ticketPurchaseSection';
import { useTicketWalletActions } from './useTicketWalletActions';
import { useUserTicketsAndOrders } from './useUserTickets';

// Código curto do pedido para o atendimento; o ID completo continua no backend.
export const ORDER_CODE_LENGTH = 10;

const STATUS: Record<TicketOrder['status'], { tone: StatusTone; key: string }> = {
  paid: { tone: 'success', key: 'paid' },
  partially_refunded: { tone: 'muted', key: 'partiallyRefunded' },
  disputed: { tone: 'warn', key: 'disputed' },
  pending_payment: { tone: 'warn', key: 'awaitingPayment' },
  payment_failed: { tone: 'warn', key: 'awaitingPayment' },
  payment_processing: { tone: 'info', key: 'processing' },
  refund_pending: { tone: 'info', key: 'refundPending' },
  refunded: { tone: 'muted', key: 'refunded' },
  canceled: { tone: 'muted', key: 'refunded' },
  expired: { tone: 'muted', key: 'notCompleted' },
};

/** Pedidos de ingresso como linhas do histórico de Compras, com as ações da carteira. */
export function useTicketPurchases() {
  const { t, i18n } = useTranslation();
  const wallet = useUserTicketsAndOrders(true);
  const actions = useTicketWalletActions(wallet);
  const now = new Date();

  const entryOf = (order: TicketOrder): PurchaseEntry => {
    const section = ticketPurchaseSection(order, now);
    const payable = isOrderPayable(order, now);
    const status =
      section === 'canceled' &&
      (order.status === 'pending_payment' || order.status === 'payment_failed')
        ? STATUS.expired
        : STATUS[order.status];
    const event = order.eventSnapshot;
    return {
      key: `ticket:${order.id}`,
      section,
      icon: createElement(TicketIcon, { size: 18, 'aria-hidden': true }),
      title: event?.title ?? t('ticketWallet.order', { id: order.id.slice(0, ORDER_CODE_LENGTH) }),
      code: order.id.slice(0, ORDER_CODE_LENGTH),
      purchasedAt: order.createdAt,
      serviceLine: event
        ? t('purchases.service.event', { date: formatBusinessDay(event.startsAt, i18n.language) })
        : '',
      amountMinor: order.totalMinor,
      struck: section === 'canceled',
      status: {
        tone: status.tone,
        text:
          status.key === 'awaitingPayment' && !order.expiresAt
            ? t('purchases.status.awaitingPaymentNoTime')
            : t(`purchases.status.${status.key}`, {
                time: order.expiresAt
                  ? formatBusinessDate(order.expiresAt, i18n.language, { timeStyle: 'short' })
                  : '',
              }),
      },
      quickAction: payable
        ? {
            label: t('purchases.pay'),
            disabled: actions.busy,
            onClick: () => void actions.resumePayment(order),
          }
        : undefined,
    };
  };

  return {
    ...wallet,
    actions,
    entries: wallet.orders.map(entryOf),
  };
}

export type TicketPurchasesSource = ReturnType<typeof useTicketPurchases>;

=== src/domain/ticketing/index.ts — diff ===
@@ -30,11 +30,16 @@ export {
 export { useCheckoutCountdown } from './hooks/useCheckoutCountdown';
 
 export { useUserTicketsAndOrders } from './hooks/useUserTickets';
+export { useTicketPurchases } from './hooks/useTicketPurchases';
 
 export { usePartnerEventSales } from './hooks/usePartnerEventSales';
 
 export { CheckoutResultView } from './components/CheckoutResultView';
 export { UserTicketsHistoryView } from './components/UserTicketsHistoryView';
+export {
+  TicketPurchaseDetails,
+  type TicketOrderClaimSale,
+} from './components/purchases/TicketPurchaseDetails';
 export { EventTicketingPurchasePanel } from './components/EventTicketingPurchasePanel';
 export { PartnerEventTicketingManager } from './components/PartnerEventTicketingManager';

=== src/domain/ticketing/utils/ticketPurchaseSection.ts — ARQUIVO NOVO, conteúdo completo ===
import type { PurchaseSection } from '../../../ui/components/purchases/purchaseEntry';
import type { TicketOrder } from '../types/ticketing';

const DONE = new Set<TicketOrder['status']>(['paid', 'partially_refunded', 'disputed']);

/** Pedido ainda pode ser pago: pendente ou recusado, dentro da reserva do estoque. */
export function isOrderPayable(order: TicketOrder, now: Date): boolean {
  return (
    (order.status === 'pending_payment' || order.status === 'payment_failed') &&
    (!order.expiresAt || new Date(order.expiresAt).getTime() > now.getTime())
  );
}

/** Seção do pedido no histórico de Compras: pago, esperando pagamento ou sem cobrança/devolvido. */
export function ticketPurchaseSection(order: TicketOrder, now: Date): PurchaseSection {
  if (DONE.has(order.status)) return 'done';
  if (order.status === 'payment_processing' || isOrderPayable(order, now)) return 'pending';
  return 'canceled';
}

=== src/domain/ticketing/utils/ticketWalletRules.test.ts — diff ===
@@ -1,6 +1,12 @@
 import { describe, expect, it } from 'vitest';
 import type { Ticket, TicketOrder } from '../types/ticketing';
-import { canRequestRefund, canTransferTicket, previewOrderRefundMinor } from './ticketWalletRules';
+import { ticketPurchaseSection } from './ticketPurchaseSection';
+import {
+  canRequestRefund,
+  canTransferTicket,
+  previewOrderRefund,
+  previewOrderRefundMinor,
+} from './ticketWalletRules';
 
 const STARTS = '2026-12-20T22:00:00.000Z';
 
@@ -57,3 +63,30 @@ describe('regras da carteira de ingressos', () => {
     expect(canTransferTicket(ticket('issued'), order(), daysBefore(1))).toBe(true);
   });
 });
+
+describe('pedido no histórico de Compras', () => {
+  it('a prévia informa o motivo e até quando vale (moderada: integral até 7 dias antes)', () => {
+    expect(previewOrderRefund(order(), daysBefore(10))).toMatchObject({
+      reason: 'policy',
+      refundMinor: 10000,
+      serviceFeeRefundMinor: 0,
+      until: daysBefore(7).toISOString(),
+    });
+    expect(previewOrderRefund(order({ status: 'pending_payment' }), daysBefore(10))).toBeNull();
+  });
+
+  it('pago em Finalizadas, aguardando em Pendentes, expirado ou devolvido em Canceladas', () => {
+    const now = daysBefore(10);
+    const inMinutes = (minutes: number) => new Date(now.getTime() + minutes * 60_000).toISOString();
+    expect(ticketPurchaseSection(order(), now)).toBe('done');
+    expect(ticketPurchaseSection(order({ status: 'partially_refunded' }), now)).toBe('done');
+    expect(ticketPurchaseSection(order({ status: 'payment_processing' }), now)).toBe('pending');
+    expect(
+      ticketPurchaseSection(order({ status: 'pending_payment', expiresAt: inMinutes(10) }), now)
+    ).toBe('pending');
+    expect(
+      ticketPurchaseSection(order({ status: 'payment_failed', expiresAt: inMinutes(-1) }), now)
+    ).toBe('canceled');
+    expect(ticketPurchaseSection(order({ status: 'refunded' }), now)).toBe('canceled');
+  });
+});

=== src/domain/ticketing/utils/ticketWalletRules.ts — diff ===
@@ -1,4 +1,4 @@
-import { calculateBuyerRefund } from '../../../shared/utils/cancellationPolicy';
+import { type BuyerRefund, calculateBuyerRefund } from '../../../shared/utils/cancellationPolicy';
 import type { Ticket, TicketOrder } from '../types/ticketing';
 
 const HOUR_MS = 60 * 60 * 1000;
@@ -14,15 +14,15 @@ export function canTransferTicket(ticket: Ticket, order: TicketOrder | undefined
 }
 
 /**
- * Mesma conta do backend (arrependimento ou política do pedido), só para mostrar o valor antes de pedir.
- * A taxa de serviço só volta no arrependimento (D14) e no reagendamento (D16).
+ * Mesma conta do backend (arrependimento, reagendamento ou política do pedido), só para mostrar antes de
+ * pedir. A taxa de serviço só volta no arrependimento (D14) e no reagendamento (D16).
  */
-export function previewOrderRefundMinor(order: TicketOrder, now: Date): number {
+export function previewOrderRefund(order: TicketOrder, now: Date): BuyerRefund | null {
   if (order.status !== 'paid' || !order.eventSnapshot?.startsAt || !order.salesPolicySnapshot) {
-    return 0;
+    return null;
   }
   const serviceFeeMinor = order.serviceFeeMinor ?? 0;
-  const refund = calculateBuyerRefund({
+  return calculateBuyerRefund({
     family: 'event',
     policy: order.salesPolicySnapshot.cancellationPolicy,
     purchasedAt: order.paidAt ?? order.createdAt,
@@ -32,7 +32,11 @@ export function previewOrderRefundMinor(order: TicketOrder, now: Date): number {
     serviceFeeMinor,
     rescheduledAt: order.rescheduledAt,
   });
-  return refund.refundMinor + refund.serviceFeeRefundMinor;
+}
+
+export function previewOrderRefundMinor(order: TicketOrder, now: Date): number {
+  const refund = previewOrderRefund(order, now);
+  return refund ? refund.refundMinor + refund.serviceFeeRefundMinor : 0;
 }
 
 export function canRequestRefund(order: TicketOrder, tickets: Ticket[], now: Date) {

=== src/domain/user/components/SettingsView.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import {
  ChevronRight,
  Languages,
  Monitor,
  Moon,
  ShoppingBag,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LOCALE, getLocaleDisplayLabel, i18n, normalizeLocale } from '../../../shared/i18n';
import { useTheme } from '../../../shared/context/ThemeContext';
import { BackButton } from '../../../ui/components/BackButton';

interface SettingsViewProps {
  onBack: () => void;
  onOpenLanguage: () => void;
  onOpenAppearance: () => void;
  /** Só com login: o histórico de compras é da conta. */
  onOpenPurchases?: () => void;
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full min-h-14 px-4 flex items-center gap-3 text-left hover:bg-ink/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50 focus-visible:outline-none"
      >
        <Icon size={20} className="text-ink/80 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-[15px] font-semibold text-ink">{label}</span>
        {value && <span className="text-[13px] text-ink/70">{value}</span>}
        <ChevronRight size={18} className="text-ink/40 shrink-0" aria-hidden="true" />
      </button>
    </li>
  );
}

export function SettingsView({
  onBack,
  onOpenLanguage,
  onOpenAppearance,
  onOpenPurchases,
}: SettingsViewProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const currentLocale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language) ?? DEFAULT_LOCALE;

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('settings.title')}</h2>
      </div>

      <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
        {onOpenPurchases && (
          <SettingsRow
            icon={ShoppingBag}
            label={t('purchases.settingsItem')}
            onClick={onOpenPurchases}
          />
        )}
        <SettingsRow
          icon={ThemeIcon}
          label={t('settings.appearance')}
          value={t(`settings.theme.${theme}`)}
          onClick={onOpenAppearance}
        />
        <SettingsRow
          icon={Languages}
          label={t('settings.language')}
          value={getLocaleDisplayLabel(currentLocale, currentLocale)}
          onClick={onOpenLanguage}
        />
      </ul>
    </div>
  );
}

=== src/shared/i18n/bookingsResources.ts — diff ===
@@ -13,7 +13,6 @@ export interface BookingsTranslation {
     pastTab: string;
     emptyUpcoming: string;
     emptyPast: string;
-    cancelShort: string;
     refundedAmount: string;
     chooseSlot: string;
     noSlots: string;
@@ -42,10 +41,6 @@ export interface BookingsTranslation {
     viewMyBookings: string;
     menuItem: string;
     myBookingsTitle: string;
-    confirmCancelRefund: string;
-    confirmCancelNoRefund: string;
-    canceledWithRefund: string;
-    canceledNoRefund: string;
     loadMore: string;
     resultTitle: string;
     resultLoading: string;
@@ -214,7 +209,6 @@ export const bookingsPtBR: BookingsTranslation = {
     pastTab: 'Anteriores ({{count}})',
     emptyUpcoming: 'Nenhuma reserva por vir.',
     emptyPast: 'Nenhuma reserva anterior.',
-    cancelShort: 'Cancelar',
     refundedAmount: 'Reembolsado {{amount}}',
     chooseSlot: 'Escolha o horário',
     noSlots: 'Nenhum horário disponível nos próximos 30 dias.',
@@ -245,11 +239,6 @@ export const bookingsPtBR: BookingsTranslation = {
     viewMyBookings: 'Ver minhas reservas',
     menuItem: 'Minhas reservas',
     myBookingsTitle: 'Minhas reservas',
-    confirmCancelRefund: 'Cancelar esta reserva? Você receberá {{amount}} de volta.',
-    confirmCancelNoRefund:
-      'Cancelar esta reserva? Pela política de cancelamento, não há reembolso.',
-    canceledWithRefund: 'Reserva cancelada. O reembolso de {{amount}} foi solicitado.',
-    canceledNoRefund: 'Reserva cancelada.',
     loadMore: 'Carregar mais',
     resultTitle: 'Pagamento da reserva',
     resultLoading: 'Verificando o pagamento…',
@@ -426,7 +415,6 @@ export const bookingsEn: BookingsTranslation = {
     pastTab: 'Past ({{count}})',
     emptyUpcoming: 'No upcoming bookings.',
     emptyPast: 'No past bookings.',
-    cancelShort: 'Cancel',
     refundedAmount: 'Refunded {{amount}}',
     chooseSlot: 'Choose a time',
     noSlots: 'No time slots available in the next 30 days.',
@@ -456,10 +444,6 @@ export const bookingsEn: BookingsTranslation = {
     viewMyBookings: 'View my bookings',
     menuItem: 'My bookings',
     myBookingsTitle: 'My bookings',
-    confirmCancelRefund: 'Cancel this booking? You will get {{amount}} back.',
-    confirmCancelNoRefund: 'Cancel this booking? Under the cancellation policy there is no refund.',
-    canceledWithRefund: 'Booking canceled. A refund of {{amount}} was requested.',
-    canceledNoRefund: 'Booking canceled.',
     loadMore: 'Load more',
     resultTitle: 'Booking payment',
     resultLoading: 'Checking the payment…',
@@ -635,7 +619,6 @@ export const bookingsFr: BookingsTranslation = {
     pastTab: 'Passées ({{count}})',
     emptyUpcoming: 'Aucune réservation à venir.',
     emptyPast: 'Aucune réservation passée.',
-    cancelShort: 'Annuler',
     refundedAmount: 'Remboursé {{amount}}',
     chooseSlot: 'Choisissez un créneau',
     noSlots: 'Aucun créneau disponible dans les 30 prochains jours.',
@@ -666,11 +649,6 @@ export const bookingsFr: BookingsTranslation = {
     viewMyBookings: 'Voir mes réservations',
     menuItem: 'Mes réservations',
     myBookingsTitle: 'Mes réservations',
-    confirmCancelRefund: 'Annuler cette réservation ? Vous serez remboursé de {{amount}}.',
-    confirmCancelNoRefund:
-      'Annuler cette réservation ? Selon la politique d’annulation, aucun remboursement n’est prévu.',
-    canceledWithRefund: 'Réservation annulée. Le remboursement de {{amount}} a été demandé.',
-    canceledNoRefund: 'Réservation annulée.',
     loadMore: 'Charger plus',
     resultTitle: 'Paiement de la réservation',
     resultLoading: 'Vérification du paiement…',

=== src/shared/i18n/purchasesResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos de Configurações › Compras: o histórico de tudo que a pessoa comprou. pt-BR é a fonte. */
export interface PurchasesTranslation {
  settingsItem: string;
  title: string;
  back: string;
  tabsLabel: string;
  tabs: { done: string; pending: string; pendingCount: string; canceled: string };
  empty: { done: string; pending: string; canceled: string };
  loading: string;
  service: { event: string; tour: string; private_entry: string };
  status: {
    paid: string;
    partiallyRefunded: string;
    awaitingPayment: string;
    awaitingPaymentNoTime: string;
    processing: string;
    disputed: string;
    noShow: string;
    refundPending: string;
    refunded: string;
    refundedAmount: string;
    notCompleted: string;
    canceledByPartner: string;
  };
  pay: string;
  receipt: {
    boughtAt: string;
    serviceAt: string;
    tickets_one: string;
    tickets_other: string;
    participants_one: string;
    participants_other: string;
    discount: string;
    serviceFee: string;
    total: string;
    refund: string;
    finalAmount: string;
    policy: string;
    viewTickets: string;
    viewBooking: string;
    cancel: string;
    cancelEndedTickets: string;
    cancelEndedBooking: string;
  };
  confirm: {
    title: string;
    refundLabel: string;
    withdrawal: string;
    withdrawalWithFee: string;
    reschedule: string;
    rescheduleWithFee: string;
    policy: string;
    policyKeepsFee: string;
    note: string;
    confirm: string;
    keep: string;
  };
  feedback: { canceled: string };
  errors: { cancel: string };
}

export const purchasesPtBR: PurchasesTranslation = {
  settingsItem: 'Compras',
  title: 'Compras',
  back: 'Voltar',
  tabsLabel: 'Compras',
  tabs: {
    done: 'Finalizadas',
    pending: 'Pendentes',
    pendingCount: 'Pendentes ({{count}})',
    canceled: 'Canceladas',
  },
  empty: {
    done: 'Nenhuma compra finalizada.',
    pending: 'Nenhuma compra esperando pagamento.',
    canceled: 'Nenhuma compra cancelada.',
  },
  loading: 'Carregando suas compras…',
  service: {
    event: 'Evento em {{date}}',
    tour: 'Passeio em {{date}}',
    private_entry: 'Entrada em {{date}}',
  },
  status: {
    paid: 'Pago',
    partiallyRefunded: 'Pago · reembolso parcial',
    awaitingPayment: 'Aguardando pagamento · até {{time}}',
    awaitingPaymentNoTime: 'Aguardando pagamento',
    processing: 'Pagamento em confirmação',
    disputed: 'Em análise',
    noShow: 'Não compareceu',
    refundPending: 'Reembolso em andamento',
    refunded: 'Reembolsado',
    refundedAmount: 'Reembolsado {{amount}}',
    notCompleted: 'Pagamento não concluído',
    canceledByPartner: 'Cancelado pelo organizador',
  },
  pay: 'Pagar',
  receipt: {
    boughtAt: '#{{code}} · comprado em {{date}}',
    serviceAt: '{{place}} · {{date}}',
    tickets_one: '{{count}} ingresso',
    tickets_other: '{{count}} ingressos',
    participants_one: '{{count}} participante',
    participants_other: '{{count}} participantes',
    discount: 'Desconto',
    serviceFee: 'Taxa de serviço',
    total: 'Total pago',
    refund: 'Reembolso',
    finalAmount: 'Valor final',
    policy: 'Política de cancelamento: {{title}}. {{description}}',
    viewTickets: 'Ver ingressos',
    viewBooking: 'Ver reserva',
    cancel: 'Cancelar compra',
    cancelEndedTickets:
      'O prazo para cancelar com reembolso terminou. Seus ingressos continuam valendo.',
    cancelEndedBooking:
      'O prazo para cancelar com reembolso terminou. Sua reserva continua valendo.',
  },
  confirm: {
    title: 'Cancelar compra?',
    refundLabel: 'Reembolso',
    withdrawal: 'Você está no prazo de arrependimento e recebe tudo de volta. Vale até {{date}}.',
    withdrawalWithFee:
      'Você está no prazo de arrependimento: recebe tudo de volta, inclusive a taxa de serviço. Vale até {{date}}.',
    reschedule: 'A data mudou e você recebe tudo de volta. Vale até {{date}}.',
    rescheduleWithFee:
      'A data mudou: você recebe tudo de volta, inclusive a taxa de serviço. Vale até {{date}}.',
    policy: 'Pela política {{policy}}, você recebe {{percent}}% do valor. Vale até {{date}}.',
    policyKeepsFee:
      'Pela política {{policy}}, você recebe {{percent}}% dos ingressos. A taxa de serviço não volta. Vale até {{date}}.',
    note: 'O valor volta para o mesmo meio de pagamento.',
    confirm: 'Cancelar compra',
    keep: 'Manter compra',
  },
  feedback: {
    canceled: 'Compra cancelada. O reembolso volta para o mesmo meio de pagamento.',
  },
  errors: { cancel: 'Não foi possível cancelar a compra.' },
};

export const purchasesEn: PurchasesTranslation = {
  settingsItem: 'Purchases',
  title: 'Purchases',
  back: 'Back',
  tabsLabel: 'Purchases',
  tabs: {
    done: 'Completed',
    pending: 'Pending',
    pendingCount: 'Pending ({{count}})',
    canceled: 'Canceled',
  },
  empty: {
    done: 'No completed purchases.',
    pending: 'No purchases waiting for payment.',
    canceled: 'No canceled purchases.',
  },
  loading: 'Loading your purchases…',
  service: {
    event: 'Event on {{date}}',
    tour: 'Tour on {{date}}',
    private_entry: 'Entry on {{date}}',
  },
  status: {
    paid: 'Paid',
    partiallyRefunded: 'Paid · partially refunded',
    awaitingPayment: 'Awaiting payment · until {{time}}',
    awaitingPaymentNoTime: 'Awaiting payment',
    processing: 'Payment being confirmed',
    disputed: 'Under review',
    noShow: 'No-show',
    refundPending: 'Refund in progress',
    refunded: 'Refunded',
    refundedAmount: 'Refunded {{amount}}',
    notCompleted: 'Payment not completed',
    canceledByPartner: 'Canceled by the organizer',
  },
  pay: 'Pay',
  receipt: {
    boughtAt: '#{{code}} · purchased on {{date}}',
    serviceAt: '{{place}} · {{date}}',
    tickets_one: '{{count}} ticket',
    tickets_other: '{{count}} tickets',
    participants_one: '{{count}} participant',
    participants_other: '{{count}} participants',
    discount: 'Discount',
    serviceFee: 'Service fee',
    total: 'Total paid',
    refund: 'Refund',
    finalAmount: 'Final amount',
    policy: 'Cancellation policy: {{title}}. {{description}}',
    viewTickets: 'View tickets',
    viewBooking: 'View booking',
    cancel: 'Cancel purchase',
    cancelEndedTickets: 'The refund cancellation period has ended. Your tickets are still valid.',
    cancelEndedBooking: 'The refund cancellation period has ended. Your booking is still valid.',
  },
  confirm: {
    title: 'Cancel purchase?',
    refundLabel: 'Refund',
    withdrawal:
      'You are within the withdrawal period and get everything back. Valid until {{date}}.',
    withdrawalWithFee:
      'You are within the withdrawal period: you get everything back, including the service fee. Valid until {{date}}.',
    reschedule: 'The date changed and you get everything back. Valid until {{date}}.',
    rescheduleWithFee:
      'The date changed: you get everything back, including the service fee. Valid until {{date}}.',
    policy: 'Under the {{policy}} policy, you get {{percent}}% back. Valid until {{date}}.',
    policyKeepsFee:
      'Under the {{policy}} policy, you get {{percent}}% of the tickets back. The service fee is not refunded. Valid until {{date}}.',
    note: 'The amount goes back to the same payment method.',
    confirm: 'Cancel purchase',
    keep: 'Keep purchase',
  },
  feedback: {
    canceled: 'Purchase canceled. The refund goes back to the same payment method.',
  },
  errors: { cancel: 'Could not cancel the purchase.' },
};

export const purchasesFr: PurchasesTranslation = {
  settingsItem: 'Achats',
  title: 'Achats',
  back: 'Retour',
  tabsLabel: 'Achats',
  tabs: {
    done: 'Terminés',
    pending: 'En attente',
    pendingCount: 'En attente ({{count}})',
    canceled: 'Annulés',
  },
  empty: {
    done: 'Aucun achat terminé.',
    pending: 'Aucun achat en attente de paiement.',
    canceled: 'Aucun achat annulé.',
  },
  loading: 'Chargement de vos achats…',
  service: {
    event: 'Événement le {{date}}',
    tour: 'Excursion le {{date}}',
    private_entry: 'Entrée le {{date}}',
  },
  status: {
    paid: 'Payé',
    partiallyRefunded: 'Payé · remboursé en partie',
    awaitingPayment: 'En attente de paiement · jusqu’à {{time}}',
    awaitingPaymentNoTime: 'En attente de paiement',
    processing: 'Paiement en cours de confirmation',
    disputed: 'En cours d’examen',
    noShow: 'Absent',
    refundPending: 'Remboursement en cours',
    refunded: 'Remboursé',
    refundedAmount: 'Remboursé {{amount}}',
    notCompleted: 'Paiement non finalisé',
    canceledByPartner: 'Annulé par l’organisateur',
  },
  pay: 'Payer',
  receipt: {
    boughtAt: '#{{code}} · acheté le {{date}}',
    serviceAt: '{{place}} · {{date}}',
    tickets_one: '{{count}} billet',
    tickets_other: '{{count}} billets',
    participants_one: '{{count}} participant',
    participants_other: '{{count}} participants',
    discount: 'Réduction',
    serviceFee: 'Frais de service',
    total: 'Total payé',
    refund: 'Remboursement',
    finalAmount: 'Montant final',
    policy: 'Politique d’annulation : {{title}}. {{description}}',
    viewTickets: 'Voir les billets',
    viewBooking: 'Voir la réservation',
    cancel: 'Annuler l’achat',
    cancelEndedTickets:
      'Le délai d’annulation avec remboursement est terminé. Vos billets restent valables.',
    cancelEndedBooking:
      'Le délai d’annulation avec remboursement est terminé. Votre réservation reste valable.',
  },
  confirm: {
    title: 'Annuler l’achat ?',
    refundLabel: 'Remboursement',
    withdrawal:
      'Vous êtes dans le délai de rétractation et tout vous est remboursé. Valable jusqu’au {{date}}.',
    withdrawalWithFee:
      'Vous êtes dans le délai de rétractation : tout vous est remboursé, frais de service compris. Valable jusqu’au {{date}}.',
    reschedule: 'La date a changé et tout vous est remboursé. Valable jusqu’au {{date}}.',
    rescheduleWithFee:
      'La date a changé : tout vous est remboursé, frais de service compris. Valable jusqu’au {{date}}.',
    policy:
      'Selon la politique {{policy}}, vous récupérez {{percent}} % du montant. Valable jusqu’au {{date}}.',
    policyKeepsFee:
      'Selon la politique {{policy}}, vous récupérez {{percent}} % des billets. Les frais de service ne sont pas remboursés. Valable jusqu’au {{date}}.',
    note: 'Le montant revient sur le même moyen de paiement.',
    confirm: 'Annuler l’achat',
    keep: 'Garder l’achat',
  },
  feedback: {
    canceled: 'Achat annulé. Le remboursement revient sur le même moyen de paiement.',
  },
  errors: { cancel: 'Impossible d’annuler l’achat.' },
};

=== src/shared/i18n/resources.ts — diff ===
@@ -40,6 +40,12 @@ import {
   saleClaimsPtBR,
   type SaleClaimsTranslation,
 } from './saleClaimsResources';
+import {
+  type PurchasesTranslation,
+  purchasesEn,
+  purchasesFr,
+  purchasesPtBR,
+} from './purchasesResources';
 import {
   type TicketSessionsTranslation,
   ticketSessionsEn,
@@ -86,6 +92,7 @@ export interface TranslationResource {
   paymentAccounts: PaymentAccountsTranslation;
   receivables: ReceivablesTranslation;
   saleClaims: SaleClaimsTranslation;
+  purchases: PurchasesTranslation;
   adminFinance: AdminFinanceTranslation;
   ticketSessions: TicketSessionsTranslation;
   salesPolicy: SalesPolicyTranslation;
@@ -97,6 +104,7 @@ export interface TranslationResource {
     language: string;
     cancel: string;
     confirm: string;
+    close: string;
     retry: string;
     /** Selo "Use Guide Verificado" explicado ao toque (D11). */
     seal: {
@@ -317,6 +325,7 @@ const ptBR: TranslationResource = {
   paymentAccounts: paymentAccountsPtBR,
   receivables: receivablesPtBR,
   saleClaims: saleClaimsPtBR,
+  purchases: purchasesPtBR,
   adminFinance: adminFinancePtBR,
   ticketSessions: ticketSessionsPtBR,
   salesPolicy: salesPolicyPtBR,
@@ -329,6 +338,7 @@ const ptBR: TranslationResource = {
     cancel: 'Cancelar',
     retry: 'Tentar novamente',
     confirm: 'Confirmar',
+    close: 'Fechar',
     seal: {
       label: 'Ver o que significa o selo Use Guide Verificado',
       title: 'Use Guide Verificado',
@@ -599,6 +609,7 @@ const en: TranslationResource = {
   paymentAccounts: paymentAccountsEn,
   receivables: receivablesEn,
   saleClaims: saleClaimsEn,
+  purchases: purchasesEn,
   adminFinance: adminFinanceEn,
   ticketSessions: ticketSessionsEn,
   salesPolicy: salesPolicyEn,
@@ -611,6 +622,7 @@ const en: TranslationResource = {
     cancel: 'Cancel',
     retry: 'Try again',
     confirm: 'Confirm',
+    close: 'Close',
     seal: {
       label: 'See what the Use Guide Verified badge means',
       title: 'Use Guide Verified',
@@ -875,6 +887,7 @@ const fr: TranslationResource = {
   paymentAccounts: paymentAccountsFr,
   receivables: receivablesFr,
   saleClaims: saleClaimsFr,
+  purchases: purchasesFr,
   adminFinance: adminFinanceFr,
   ticketSessions: ticketSessionsFr,
   salesPolicy: salesPolicyFr,
@@ -887,6 +900,7 @@ const fr: TranslationResource = {
     cancel: 'Annuler',
     retry: 'Réessayer',
     confirm: 'Confirmer',
+    close: 'Fermer',
     seal: {
       label: 'Voir ce que signifie le badge Use Guide Vérifié',
       title: 'Use Guide Vérifié',

=== src/shared/i18n/ticketWalletResources.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
/** Textos da carteira de ingressos do comprador. pt-BR é a fonte. */
type TicketStatusKey =
  | 'reserved'
  | 'issued'
  | 'checked_in'
  | 'transferred'
  | 'refund_pending'
  | 'refunded'
  | 'canceled'
  | 'invalidated'
  | 'expired';
export interface TicketWalletTranslation {
  title: string;
  tabsLabel: string;
  back: string;
  refresh: string;
  loading: string;
  tabs: { upcoming: string; past: string };
  emptyUpcoming: string;
  emptyPast: string;
  session: string;
  qrSigned: string;
  order: string;
  ticketCount_one: string;
  ticketCount_other: string;
  actions: { showQr: string; reissueQr: string; transfer: string };
  ticketStatus: Record<TicketStatusKey, string>;
  transfer: { title: string; name: string; email: string; confirm: string };
  resume: { title: string; close: string };
  feedback: {
    qrReissued: string;
    transferred: string;
    refundRequested: string;
    alreadyPaid: string;
    paid: string;
  };
  errors: { qr: string; qrReissue: string; transfer: string; refund: string; resume: string };
}

export const ticketWalletPtBR: TicketWalletTranslation = {
  title: 'Ingressos',
  tabsLabel: 'Ingressos por data',
  back: 'Voltar',
  refresh: 'Atualizar ingressos',
  loading: 'Carregando seus ingressos…',
  tabs: { upcoming: 'Próximos ({{count}})', past: 'Anteriores ({{count}})' },
  emptyUpcoming: 'Nenhum ingresso para os próximos eventos.',
  emptyPast: 'Nenhum ingresso de eventos passados.',
  session: 'Sessão: {{date}}',
  qrSigned: 'QR assinado • v{{version}}',
  order: 'Pedido #{{id}}',
  ticketCount_one: '{{count}} ingresso',
  ticketCount_other: '{{count}} ingressos',
  actions: {
    showQr: 'Ver QR',
    reissueQr: 'Novo QR',
    transfer: 'Transferir',
  },
  ticketStatus: {
    reserved: 'Reservado',
    issued: 'Emitido',
    checked_in: 'Utilizado',
    transferred: 'Transferido',
    refund_pending: 'Reembolso em processamento',
    refunded: 'Reembolsado',
    canceled: 'Cancelado',
    invalidated: 'Inválido',
    expired: 'Expirado',
  },
  transfer: {
    title: 'Transferir ingresso #{{id}}',
    name: 'Nome do novo titular',
    email: 'E-mail do novo titular',
    confirm: 'Confirmar transferência',
  },
  resume: { title: 'Concluir pagamento do pedido #{{id}}', close: 'Fechar' },
  feedback: {
    qrReissued: 'Novo QR Code emitido. O anterior deixou de valer.',
    transferred: 'Ingresso transferido. O novo titular recebeu um QR Code novo.',
    refundRequested: 'Reembolso solicitado. Você recebe pelo mesmo meio de pagamento.',
    alreadyPaid: 'Seu pagamento já estava confirmado. Ingressos atualizados.',
    paid: 'Pagamento confirmado e ingressos emitidos!',
  },
  errors: {
    qr: 'Não foi possível gerar o QR Code.',
    qrReissue: 'Não foi possível emitir um novo QR Code.',
    transfer: 'Não foi possível transferir o ingresso.',
    refund: 'Não foi possível pedir o reembolso.',
    resume: 'Não foi possível retomar o pagamento deste pedido.',
  },
};

export const ticketWalletEn: TicketWalletTranslation = {
  title: 'Tickets',
  tabsLabel: 'Tickets by date',
  back: 'Back',
  refresh: 'Refresh tickets',
  loading: 'Loading your tickets…',
  tabs: { upcoming: 'Upcoming ({{count}})', past: 'Past ({{count}})' },
  emptyUpcoming: 'No tickets for upcoming events.',
  emptyPast: 'No tickets for past events.',
  session: 'Session: {{date}}',
  qrSigned: 'Signed QR • v{{version}}',
  order: 'Order #{{id}}',
  ticketCount_one: '{{count}} ticket',
  ticketCount_other: '{{count}} tickets',
  actions: {
    showQr: 'Show QR',
    reissueQr: 'New QR',
    transfer: 'Transfer',
  },
  ticketStatus: {
    reserved: 'Reserved',
    issued: 'Issued',
    checked_in: 'Used',
    transferred: 'Transferred',
    refund_pending: 'Refund in progress',
    refunded: 'Refunded',
    canceled: 'Canceled',
    invalidated: 'Invalid',
    expired: 'Expired',
  },
  transfer: {
    title: 'Transfer ticket #{{id}}',
    name: 'New holder name',
    email: 'New holder email',
    confirm: 'Confirm transfer',
  },
  resume: { title: 'Complete payment for order #{{id}}', close: 'Close' },
  feedback: {
    qrReissued: 'New QR code issued. The previous one is no longer valid.',
    transferred: 'Ticket transferred. The new holder received a new QR code.',
    refundRequested: 'Refund requested. You will receive it through the same payment method.',
    alreadyPaid: 'Your payment was already confirmed. Tickets updated.',
    paid: 'Payment confirmed and tickets issued!',
  },
  errors: {
    qr: 'Could not generate the QR code.',
    qrReissue: 'Could not issue a new QR code.',
    transfer: 'Could not transfer the ticket.',
    refund: 'Could not request the refund.',
    resume: 'Could not resume payment for this order.',
  },
};

export const ticketWalletFr: TicketWalletTranslation = {
  title: 'Billets',
  tabsLabel: 'Billets par date',
  back: 'Retour',
  refresh: 'Actualiser les billets',
  loading: 'Chargement de vos billets…',
  tabs: { upcoming: 'À venir ({{count}})', past: 'Passés ({{count}})' },
  emptyUpcoming: 'Aucun billet pour les prochains événements.',
  emptyPast: 'Aucun billet pour les événements passés.',
  session: 'Séance : {{date}}',
  qrSigned: 'QR signé • v{{version}}',
  order: 'Commande n° {{id}}',
  ticketCount_one: '{{count}} billet',
  ticketCount_other: '{{count}} billets',
  actions: {
    showQr: 'Voir le QR',
    reissueQr: 'Nouveau QR',
    transfer: 'Transférer',
  },
  ticketStatus: {
    reserved: 'Réservé',
    issued: 'Émis',
    checked_in: 'Utilisé',
    transferred: 'Transféré',
    refund_pending: 'Remboursement en cours',
    refunded: 'Remboursé',
    canceled: 'Annulé',
    invalidated: 'Invalide',
    expired: 'Expiré',
  },
  transfer: {
    title: 'Transférer le billet n° {{id}}',
    name: 'Nom du nouveau titulaire',
    email: 'E-mail du nouveau titulaire',
    confirm: 'Confirmer le transfert',
  },
  resume: { title: 'Finaliser le paiement de la commande n° {{id}}', close: 'Fermer' },
  feedback: {
    qrReissued: 'Nouveau QR code émis. L’ancien n’est plus valable.',
    transferred: 'Billet transféré. Le nouveau titulaire a reçu un nouveau QR code.',
    refundRequested: 'Remboursement demandé. Vous le recevrez par le même moyen de paiement.',
    alreadyPaid: 'Votre paiement était déjà confirmé. Billets mis à jour.',
    paid: 'Paiement confirmé et billets émis !',
  },
  errors: {
    qr: 'Impossible de générer le QR code.',
    qrReissue: 'Impossible d’émettre un nouveau QR code.',
    transfer: 'Impossible de transférer le billet.',
    refund: 'Impossible de demander le remboursement.',
    resume: 'Impossible de reprendre le paiement de cette commande.',
  },
};

=== src/shared/utils/cancellationPolicy.ts — diff ===
@@ -82,6 +82,8 @@ export interface BuyerRefund {
   percent: number;
   refundMinor: number;
   serviceFeeRefundMinor: number;
+  /** Até quando vale este reembolso (ISO); depois o valor muda ou acaba. `null` quando não há reembolso. */
+  until: string | null;
 }
 
 /**
@@ -102,21 +104,25 @@ export function calculateBuyerRefund(params: {
   const nowMs = params.now.getTime();
   const startsAtMs = new Date(params.startsAt).getTime();
   const hoursUntilStart = (startsAtMs - nowMs) / HOUR_MS;
+  const iso = (ms: number) => new Date(ms).toISOString();
   if (hoursUntilStart <= 0) {
-    return { reason: 'none', percent: 0, refundMinor: 0, serviceFeeRefundMinor: 0 };
+    return { reason: 'none', percent: 0, refundMinor: 0, serviceFeeRefundMinor: 0, until: null };
   }
   const daysSinceReschedule = params.rescheduledAt
     ? (nowMs - new Date(params.rescheduledAt).getTime()) / (24 * HOUR_MS)
     : Number.POSITIVE_INFINITY;
   if (daysSinceReschedule >= 0 && daysSinceReschedule <= RESCHEDULE_REFUND_DAYS) {
+    const rescheduledAtMs = new Date(params.rescheduledAt as string).getTime();
     return {
       reason: 'reschedule',
       percent: 100,
       refundMinor: params.paidMinor,
       serviceFeeRefundMinor: params.serviceFeeMinor,
+      until: iso(Math.min(rescheduledAtMs + RESCHEDULE_REFUND_DAYS * 24 * HOUR_MS, startsAtMs)),
     };
   }
-  const daysSincePurchase = (nowMs - new Date(params.purchasedAt).getTime()) / (24 * HOUR_MS);
+  const purchasedAtMs = new Date(params.purchasedAt).getTime();
+  const daysSincePurchase = (nowMs - purchasedAtMs) / (24 * HOUR_MS);
   if (
     daysSincePurchase <= WITHDRAWAL_DAYS &&
     hoursUntilStart >= WITHDRAWAL_MIN_HOURS_BEFORE_START
@@ -126,15 +132,23 @@ export function calculateBuyerRefund(params: {
       percent: 100,
       refundMinor: params.paidMinor,
       serviceFeeRefundMinor: params.serviceFeeMinor,
+      until: iso(
+        Math.min(
+          purchasedAtMs + WITHDRAWAL_DAYS * 24 * HOUR_MS,
+          startsAtMs - WITHDRAWAL_MIN_HOURS_BEFORE_START * HOUR_MS
+        )
+      ),
     };
   }
   const tiers = POLICY_TIERS[params.family][params.policy] ?? [];
-  const percent = tiers.find((tier) => hoursUntilStart >= tier.hoursBefore)?.percent ?? 0;
+  const tier = tiers.find((candidate) => hoursUntilStart >= candidate.hoursBefore);
+  const percent = tier?.percent ?? 0;
   return {
     reason: percent > 0 ? 'policy' : 'none',
     percent,
     // Arredonda para baixo: nunca devolve mais do que o percentual da política.
     refundMinor: Math.floor((params.paidMinor * percent) / 100),
     serviceFeeRefundMinor: 0,
+    until: tier && percent > 0 ? iso(startsAtMs - tier.hoursBefore * HOUR_MS) : null,
   };
 }

=== src/ui/components/ConfirmDialog.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import * as RadixDialog from '@radix-ui/react-dialog';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../shared/utils/cn';
import { Z_INDEX } from '../../shared/constants/zIndex';
import { BUTTON_DANGER, BUTTON_POSITIVE } from '../styles/controls';
import { TextButton } from './TextButton';

/** `danger` (padrão) para excluir ou cancelar; `positive` para aprovar ou liberar algo. */
export type ConfirmDialogTone = 'danger' | 'positive';

export interface ConfirmDialogData {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  tone?: ConfirmDialogTone;
  /** Pergunta curta acima da mensagem; sem ela, a mensagem vira o título. */
  title?: string;
  /** Valor que a pessoa precisa ver antes de decidir (ex.: o reembolso). */
  highlight?: { label: string; value: string };
  /** Linha de apoio, menor, abaixo da mensagem. */
  note?: string;
  /** Rótulo do botão de confirmar; o padrão é "Confirmar". */
  confirmLabel?: string;
  /** Rótulo de desistir; o padrão é "Cancelar", que confunde quando a ação também é cancelar. */
  cancelLabel?: string;
}

interface ConfirmDialogProps {
  data: ConfirmDialogData | null;
}

export function ConfirmDialog({ data }: ConfirmDialogProps) {
  const { t } = useTranslation();
  const positive = data?.tone === 'positive';
  const Icon = positive ? CheckCircle2 : AlertTriangle;
  return (
    <RadixDialog.Root
      open={!!data}
      onOpenChange={(open) => {
        if (!open && data) data.onCancel();
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className="fixed inset-0 bg-scrim backdrop-blur-sm animate-fade-in data-[state=closed]:animate-fade-out motion-reduce:animate-none"
          style={{ zIndex: Z_INDEX.overlay }}
        />
        <RadixDialog.Content
          // Sem título a mensagem já é o título; `undefined` diz ao Radix que não há descrição.
          {...(data?.title ? {} : { 'aria-describedby': undefined })}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-xs p-6 rounded-3xl bg-surface-solid border border-line text-ink flex flex-col items-center text-center gap-3 outline-none animate-scale-in data-[state=closed]:animate-scale-out motion-reduce:animate-none"
          style={{ zIndex: Z_INDEX.modalNested }}
        >
          <Icon size={28} className={positive ? 'text-success' : 'text-warn'} aria-hidden="true" />
          {data?.title ? (
            <>
              <RadixDialog.Title className="text-base font-bold text-ink">
                {data.title}
              </RadixDialog.Title>
              {data.highlight && (
                <div>
                  <p className="text-[13px] text-ink/70">{data.highlight.label}</p>
                  <p className="text-2xl font-bold text-ink tabular-nums">{data.highlight.value}</p>
                </div>
              )}
              <RadixDialog.Description className="text-[13px] text-ink/70 leading-relaxed">
                {data.message}
              </RadixDialog.Description>
            </>
          ) : (
            <RadixDialog.Title className="text-sm font-medium text-ink leading-relaxed">
              {data?.message}
            </RadixDialog.Title>
          )}
          {data?.note && <p className="text-[12px] text-ink/60">{data.note}</p>}
          <div className="flex flex-col gap-1 w-full pt-1">
            <button
              type="button"
              onClick={data?.onConfirm}
              className={cn(positive ? BUTTON_POSITIVE : BUTTON_DANGER, 'w-full')}
            >
              {data?.confirmLabel ?? t('common.confirm')}
            </button>
            <TextButton onClick={data?.onCancel} className="justify-center mx-0">
              {data?.cancelLabel ?? t('common.cancel')}
            </TextButton>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

=== src/ui/components/Dialog.tsx — diff ===
@@ -1,6 +1,7 @@
 import { ReactNode } from 'react';
 import * as RadixDialog from '@radix-ui/react-dialog';
 import { X } from 'lucide-react';
+import { useTranslation } from 'react-i18next';
 import { cn } from '../../shared/utils/cn';
 import { Z_INDEX } from '../../shared/constants/zIndex';
 
@@ -24,6 +25,7 @@ export function Dialog({
   className,
   nested = false,
 }: DialogProps) {
+  const { t } = useTranslation();
   return (
     <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
       <RadixDialog.Portal>
@@ -56,7 +58,7 @@ export function Dialog({
             </RadixDialog.Title>
           )}
           {description && (
-            <RadixDialog.Description className="text-xs text-white/60 mb-4 leading-relaxed">
+            <RadixDialog.Description className="text-xs text-ink/70 mb-4 leading-relaxed">
               {description}
             </RadixDialog.Description>
           )}
@@ -64,8 +66,8 @@ export function Dialog({
           {children}
 
           <RadixDialog.Close
-            aria-label="Fechar modal"
-            className="press absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
+            aria-label={t('common.close')}
+            className="press absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full text-ink/60 hover:text-ink hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
           >
             <X size={20} />
           </RadixDialog.Close>

=== src/ui/components/purchases/PurchaseHistoryView.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ChevronRight } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate, formatBusinessDateTime } from '../../../shared/utils/businessDateTime';
import { formatMoneyMinor } from '../../../shared/utils/money';
import { cn } from '../../../shared/utils/cn';
import { BackButton } from '../BackButton';
import { ListEmpty, ListError, ListLoading } from '../ListState';
import { SegmentedControl } from '../SegmentedControl';
import { StatusText } from '../StatusText';
import { TextButton } from '../TextButton';
import type { PurchaseEntry, PurchaseSection } from './purchaseEntry';

interface PurchaseHistoryViewProps {
  entries: PurchaseEntry[];
  loading: boolean;
  error: string | null;
  notice?: string | null;
  onRetry: () => void;
  onBack: () => void;
  onOpen: (entry: PurchaseEntry) => void;
  /** Pagamento em andamento e folhas de detalhe, montados pela composição; ficam no topo. */
  children?: ReactNode;
  /** Fim da lista, como "carregar mais". */
  footer?: ReactNode;
}

function monthOf(iso: string, locale: string) {
  const label = formatBusinessDate(iso, locale, { month: 'long', year: 'numeric' });
  return label.charAt(0).toLocaleUpperCase(locale) + label.slice(1);
}

/** Histórico de compras (D17): Finalizadas, Pendentes e Canceladas, agrupadas pelo mês da compra. */
export function PurchaseHistoryView({
  entries,
  loading,
  error,
  notice,
  onRetry,
  onBack,
  onOpen,
  children,
  footer,
}: PurchaseHistoryViewProps) {
  const { t, i18n } = useTranslation();
  const [section, setSection] = useState<PurchaseSection>('done');
  const pendingCount = entries.filter((entry) => entry.section === 'pending').length;
  const shown = entries
    .filter((entry) => entry.section === section)
    .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
  const months = [...new Set(shown.map((entry) => monthOf(entry.purchasedAt, i18n.language)))];

  return (
    <section className="w-full space-y-5">
      <div className="flex items-center gap-2">
        <BackButton label={t('purchases.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('purchases.title')}</h2>
      </div>
      <SegmentedControl
        label={t('purchases.tabsLabel')}
        value={section}
        onChange={setSection}
        options={[
          { value: 'done', label: t('purchases.tabs.done') },
          {
            value: 'pending',
            label:
              pendingCount > 0
                ? t('purchases.tabs.pendingCount', { count: pendingCount })
                : t('purchases.tabs.pending'),
          },
          { value: 'canceled', label: t('purchases.tabs.canceled') },
        ]}
      />
      {notice && (
        <p role="status" className="text-sm text-accent">
          {notice}
        </p>
      )}
      {children}
      {error && <ListError message={error} onRetry={onRetry} />}
      {loading && entries.length === 0 && <ListLoading label={t('purchases.loading')} />}
      {!error && !loading && shown.length === 0 && (
        <ListEmpty message={t(`purchases.empty.${section}`)} />
      )}
      {months.map((month) => (
        <section key={month} className="space-y-2">
          <h3 className="text-[13px] font-semibold text-ink/70 px-1">{month}</h3>
          <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
            {shown
              .filter((entry) => monthOf(entry.purchasedAt, i18n.language) === month)
              .map((entry) => (
                <PurchaseRow key={entry.key} entry={entry} onOpen={() => onOpen(entry)} />
              ))}
          </ul>
        </section>
      ))}
      {footer}
    </section>
  );
}

function PurchaseRow({ entry, onOpen }: { entry: PurchaseEntry; onOpen: () => void }) {
  const { i18n } = useTranslation();
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="w-full px-4 py-3.5 flex gap-3 text-left hover:bg-ink/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50 focus-visible:outline-none"
      >
        <span className="w-10 h-10 shrink-0 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
          {entry.icon}
        </span>
        <span className="flex-1 min-w-0">
          <span className="flex items-start justify-between gap-3">
            <span className="text-[15px] font-semibold text-ink leading-snug break-words">
              {entry.title}
            </span>
            <span
              className={cn(
                'text-sm font-semibold tabular-nums shrink-0',
                entry.struck ? 'text-ink/50 [:root.light_&]:text-ink/65 line-through' : 'text-ink'
              )}
            >
              {formatMoneyMinor(entry.amountMinor, i18n.language)}
            </span>
          </span>
          <span className="block text-[13px] text-ink/50 [:root.light_&]:text-ink/65">
            #{entry.code} · {formatBusinessDateTime(entry.purchasedAt, i18n.language)}
          </span>
          <span className="block text-[13px] text-ink/70">{entry.serviceLine}</span>
          <span className="mt-1 flex items-center justify-between gap-3">
            <StatusText tone={entry.status.tone}>{entry.status.text}</StatusText>
            {!entry.quickAction && (
              <ChevronRight size={16} className="text-ink/40 shrink-0" aria-hidden="true" />
            )}
          </span>
        </span>
      </button>
      {entry.quickAction && (
        <div className="px-4 pb-3 -mt-2 flex justify-end">
          <TextButton
            tone="accent"
            disabled={entry.quickAction.disabled}
            onClick={entry.quickAction.onClick}
          >
            {entry.quickAction.label}
          </TextButton>
        </div>
      )}
    </li>
  );
}

=== src/ui/components/purchases/PurchaseReceiptSheet.tsx — ARQUIVO NOVO, conteúdo completo ===
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../shared/utils/businessDateTime';
import { cn } from '../../../shared/utils/cn';
import { BUTTON_PRIMARY } from '../../styles/controls';
import { Dialog } from '../Dialog';

export interface ReceiptLine {
  label: string;
  value: string;
  /** `total` abre a parte de baixo do recibo; `strong` só destaca (ex.: valor final). */
  emphasis?: 'total' | 'strong' | 'credit';
}

interface PurchaseReceiptSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  code: string;
  purchasedAt: string;
  /** Local e data do serviço, já traduzidos. */
  serviceLine: string;
  lines: ReceiptLine[];
  policy?: string;
  primaryAction?: { label: string; onClick: () => void };
  /** Cancelar, relatar ou o aviso de prazo encerrado; montado pelo domínio. */
  footer?: ReactNode;
}

/**
 * Detalhe de uma compra (D17): o nome em cima, o código e a data da compra logo abaixo, o recibo e
 * a política. O valor de um eventual reembolso só aparece na confirmação do cancelamento.
 */
export function PurchaseReceiptSheet({
  open,
  onClose,
  title,
  code,
  purchasedAt,
  serviceLine,
  lines,
  policy,
  primaryAction,
  footer,
}: PurchaseReceiptSheetProps) {
  const { t, i18n } = useTranslation();
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={title}
    >
      <div className="space-y-4">
        <div className="-mt-1">
          <p className="text-[13px] text-ink/50 [:root.light_&]:text-ink/65">
            {t('purchases.receipt.boughtAt', {
              code,
              date: formatBusinessDateTime(purchasedAt, i18n.language),
            })}
          </p>
          <p className="text-sm text-ink/70 mt-1">{serviceLine}</p>
        </div>
        {lines.length > 0 && (
          <dl className="p-4 rounded-2xl bg-ink/[0.04] space-y-2">
            {lines.map((line, index) => (
              <div
                key={`${line.label}-${index}`}
                className={cn(
                  'flex justify-between gap-3 text-sm',
                  line.emphasis === 'total' && 'border-t border-line pt-2'
                )}
              >
                <dt className="text-ink/70">{line.label}</dt>
                <dd
                  className={cn(
                    'tabular-nums',
                    (line.emphasis === 'total' || line.emphasis === 'strong') &&
                      'font-semibold text-ink',
                    line.emphasis === 'credit' && 'text-success',
                    !line.emphasis && 'text-ink'
                  )}
                >
                  {line.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
        {policy && <p className="text-[12px] text-ink/70">{policy}</p>}
        {primaryAction && (
          <button
            type="button"
            onClick={primaryAction.onClick}
            className={cn(BUTTON_PRIMARY, 'w-full min-h-12')}
          >
            {primaryAction.label}
          </button>
        )}
        {footer && <div className="pt-1">{footer}</div>}
      </div>
    </Dialog>
  );
}

=== src/ui/components/purchases/purchaseEntry.ts — ARQUIVO NOVO, conteúdo completo ===
import type { ReactNode } from 'react';
import type { StatusTone } from '../StatusText';

/** Em que seção do histórico a compra aparece: o estado do dinheiro, não a data do serviço. */
export type PurchaseSection = 'done' | 'pending' | 'canceled';

/** Uma linha do histórico de compras, montada pelo domínio que vendeu (ingresso, reserva…). */
export interface PurchaseEntry {
  /** Único entre todos os domínios (ex.: `ticket:<id>`). */
  key: string;
  section: PurchaseSection;
  icon: ReactNode;
  title: string;
  code: string;
  purchasedAt: string;
  /** "Evento em 8 de nov.", já traduzido. */
  serviceLine: string;
  amountMinor: number;
  /** Valor riscado: a compra não foi cobrada ou voltou inteira. */
  struck: boolean;
  status: { tone: StatusTone; text: string };
  /** Ação rápida na própria linha, como "Pagar" numa compra pendente. */
  quickAction?: { label: string; onClick: () => void; disabled?: boolean };
}

=== src/ui/legal/TermsAcceptanceField.test.tsx — diff ===
@@ -16,7 +16,7 @@ describe('TermsAcceptanceField (D15)', () => {
     expect(screen.getByRole('dialog')).toBeTruthy();
     expect(screen.getByText('Compras, cancelamento e reembolso')).toBeTruthy();
     expect(screen.getAllByText(/Direito de arrependimento/).length).toBeGreaterThan(0);
-    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
+    fireEvent.click(screen.getByText('Fechar'));
     fireEvent.click(screen.getByRole('checkbox'));
     expect(onChange).toHaveBeenCalledWith(true);
   });

=== src/ui/styles/controls.ts — diff ===
@@ -6,4 +6,5 @@ const BUTTON_BASE = `press min-h-11 px-4 rounded-xl text-sm disabled:opacity-50
 export const BUTTON_PRIMARY = `${BUTTON_BASE} bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold`;
 export const BUTTON_SECONDARY = `${BUTTON_BASE} bg-surface border border-line hover:bg-accent-soft text-ink font-semibold`;
 export const BUTTON_DANGER = `${BUTTON_BASE} bg-danger-soft border border-danger-line text-danger font-semibold`;
+export const BUTTON_POSITIVE = `${BUTTON_BASE} bg-success-soft border border-success-line text-success font-semibold`;
 export const INPUT = `w-full min-h-11 px-3 rounded-xl bg-surface border border-line text-sm text-ink ${FOCUS}`;

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/application/usecases/bookings/bookingApplicationUseCases.test.ts server/domain/bookings/services/bookingService.test.ts server/domain/bookings/services/bookingService.ts server/shared/kernel/cancellationPolicy.test.ts server/shared/kernel/cancellationPolicy.ts src/app/compositions/BuyerPurchasesComposition.tsx src/app/menu/SideMenu.tsx src/app/menu/menuViews.test.ts src/app/menu/menuViews.ts src/domain/bookings/components/buyer/BookingPurchaseDetails.test.tsx src/domain/bookings/components/buyer/BookingPurchaseDetails.tsx src/domain/bookings/components/buyer/BuyerBookingCard.tsx src/domain/bookings/components/buyer/MyBookingsView.tsx src/domain/bookings/components/buyer/buyerComponents.test.tsx src/domain/bookings/hooks/useBookingPurchases.ts src/domain/bookings/index.ts src/domain/bookings/utils/bookingPurchaseSection.ts src/domain/bookings/utils/refundPreview.ts src/domain/ticketing/components/UserTicketsHistoryView.tsx src/domain/ticketing/components/purchases/TicketPurchaseDetails.tsx src/domain/ticketing/hooks/useTicketPurchases.ts src/domain/ticketing/index.ts src/domain/ticketing/utils/ticketPurchaseSection.ts src/domain/ticketing/utils/ticketWalletRules.test.ts src/domain/ticketing/utils/ticketWalletRules.ts src/domain/user/components/SettingsView.tsx src/shared/i18n/bookingsResources.ts src/shared/i18n/purchasesResources.ts src/shared/i18n/resources.ts src/shared/i18n/ticketWalletResources.ts src/shared/utils/cancellationPolicy.ts src/ui/components/ConfirmDialog.tsx src/ui/components/Dialog.tsx src/ui/components/purchases/PurchaseHistoryView.tsx src/ui/components/purchases/PurchaseReceiptSheet.tsx src/ui/components/purchases/purchaseEntry.ts src/ui/legal/TermsAcceptanceField.test.tsx src/ui/styles/controls.ts` (todos verdes). Não precisa rodar a suíte inteira.
- abra o menu › Configurações › Compras nos temas claro e escuro: as três seções, a folha de uma compra futura (sem valor de reembolso; o valor só aparece ao tocar em Cancelar compra), de uma compra fora do prazo (sem cancelar, com o aviso) e de uma passada (Relatar problema). Abra Ingressos e Minhas reservas: só Próximos e Anteriores.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
