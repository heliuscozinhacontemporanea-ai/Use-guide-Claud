# Prompt 18.4b.3 — Termos com aceite registrado (D15)

> Lote 16, gerado do commit de referência `642dc1b` da branch `claude/agents-md-v2`. Aplique depois do 18.4b.2. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4b.3 — Termos com aceite registrado (D15)

Termos neutros em Sobre o app, link e caixa de aceite no checkout e em Recebimentos, versão aceita gravada no pedido, na reserva e no perfil do parceiro.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8); os dados de teste podem ser recriados.

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e as remoções. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova.

DECISÃO D15 (docs/arquitetura/decisoes.md, registrada neste prompt): termos neutros da plataforma com aceite registrado; idioma do editor fica para o 19.1 (débito B28).

O QUE MUDA:
Backend
1) server/shared/kernel/legalTerms.ts: BUYER_TERMS_VERSION e PARTNER_TERMS_VERSION ('2026-10-25'), espelhadas em src/shared/constants/legalTerms.ts com teste de paridade. Mudou o texto dos termos, muda a versão.
2) ticketing: POST /api/ticketing/orders exige acceptedTermsVersion; versão diferente da atual → 422 'Aceite os termos de compra para continuar.'; o pedido grava termsAcceptance { version, acceptedAt }.
3) bookings: POST /api/bookings exige acceptedTermsVersion; versão diferente → 422 TERMS_NOT_ACCEPTED; a reserva grava termsAcceptance.
4) partners: o perfil do parceiro (partners/{uid}, só o documento interno, nunca a projeção pública) grava termsAcceptance; UseCases getPartnerTermsStatusUseCase, acceptPartnerTermsUseCase e assertPartnerTermsAcceptedUseCase; código PARTNER_TERMS_NOT_ACCEPTED.
5) HTTP: GET /api/payment-accounts/terms (situação do aceite e as taxas vigentes para o texto, ou null sem configuração) e POST /api/payment-accounts/terms { version } (token não revogado). Abrir o cadastro da conta Stripe exige o aceite (422 PARTNER_TERMS_NOT_ACCEPTED).
Frontend
6) Texto dos termos em src/shared/i18n/legalResources.ts (namespace legal, 3 idiomas, vale a versão em português): termos de uso, compras e cancelamento (com todas as políticas), termos do parceiro (taxas vindas do backend) e privacidade.
7) Design system: src/ui/legal/LegalTermsDocument.tsx (o documento) e TermsAcceptanceField.tsx (caixa 'Li e aceito' com o link que abre os termos num diálogo, sem sair da tela); Dialog ganha a prop nested para abrir por cima de outro modal.
8) Compra de ingresso: a política vira uma linha ('Política Moderada: …'); a caixa de aceite é obrigatória para reservar; o pedido manda acceptedTermsVersion. O resumo do pagamento continua com a taxa de serviço destacada.
9) Reserva: a caixa de aceite antes de continuar; a reserva manda acceptedTermsVersion; erro TERMS_NOT_ACCEPTED traduzido.
10) Recebimentos do parceiro: cartão 'Termos do parceiro' com a caixa de aceite e o botão Aceitar termos; sem o aceite, a conta de um CNPJ ainda não iniciada não abre o cadastro.
11) Sobre o app: AboutView (461 linhas) dividido em about/AboutGeneralTab, AboutLicensesTab e AboutTermsTab; a aba Termos mostra o documento novo; título e abas traduzidos.
12) docs/arquitetura/decisoes.md ganha a D15; debitos.md ganha B28 (abas de idioma do editor de oferta e editor de evento só em português, corrigidos no 19.1) e B16 passa a citar as abas Geral e Licenças.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- docs/arquitetura/decisoes.md (alterar)
- server/application/usecases/bookings/bookingApplicationUseCases.test.ts (alterar)
- server/application/usecases/paymentAccounts/acceptPartnerTermsApplicationUseCase.ts (criar)
- server/application/usecases/paymentAccounts/getPartnerTermsApplicationUseCase.ts (criar)
- server/application/usecases/paymentAccounts/paymentAccountApplicationUseCases.test.ts (alterar)
- server/application/usecases/paymentAccounts/startPaymentAccountSessionApplicationUseCase.ts (alterar)
- server/domain/bookings/errors/bookingDomainError.ts (alterar)
- server/domain/bookings/services/bookingService.test.ts (alterar)
- server/domain/bookings/services/bookingService.ts (alterar)
- server/domain/bookings/types/bookingTypes.ts (alterar)
- server/domain/partners/adapters/firestorePartnerAdapter.ts (alterar)
- server/domain/partners/errors/partnerDomainError.ts (alterar)
- server/domain/partners/index.ts (alterar)
- server/domain/partners/ports/partnerPort.ts (alterar)
- server/domain/partners/services/partnerService.test.ts (alterar)
- server/domain/partners/services/partnerService.ts (alterar)
- server/domain/partners/usecases/acceptPartnerTermsUseCase.ts (criar)
- server/domain/partners/usecases/assertPartnerTermsAcceptedUseCase.ts (criar)
- server/domain/partners/usecases/getPartnerTermsStatusUseCase.ts (criar)
- server/domain/ticketing/adapters/firestoreOrderReservationStore.ts (alterar)
- server/domain/ticketing/dtos/ticketingPersistenceMappers.ts (alterar)
- server/domain/ticketing/ports/ticketingPort.ts (alterar)
- server/domain/ticketing/schemas/ticketingSchema.ts (alterar)
- server/domain/ticketing/services/ticketOrderService.ts (alterar)
- server/domain/ticketing/services/ticketingServices.test.ts (alterar)
- server/domain/ticketing/types/ticketingTypes.ts (alterar)
- server/interfaces/http/bookings/bookingsController.test.ts (alterar)
- server/interfaces/http/bookings/schemas/bookingSchemas.ts (alterar)
- server/interfaces/http/paymentAccounts/paymentAccountController.test.ts (alterar)
- server/interfaces/http/paymentAccounts/paymentAccountController.ts (alterar)
- server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts (alterar)
- server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts (alterar)
- server/shared/kernel/legalTerms.parity.test.ts (criar)
- server/shared/kernel/legalTerms.ts (criar)
- src/domain/bookings/components/buyer/BookingFlow.tsx (alterar)
- src/domain/bookings/components/buyer/OfferPolicySummary.tsx (alterar)
- src/domain/bookings/components/buyer/buyerComponents.test.tsx (alterar)
- src/domain/bookings/types/bookings.ts (alterar)
- src/domain/bookings/utils/bookingErrorMessage.ts (alterar)
- src/domain/content/components/AboutView.tsx (alterar)
- src/domain/content/components/about/AboutGeneralTab.tsx (criar)
- src/domain/content/components/about/AboutLicensesTab.tsx (criar)
- src/domain/content/components/about/AboutTermsTab.tsx (criar)
- src/domain/payment/api/apiPaymentAdapter.ts (alterar)
- src/domain/payment/application/usecases/acceptPartnerTermsUseCase.ts (criar)
- src/domain/payment/application/usecases/getPartnerTermsUseCase.ts (criar)
- src/domain/payment/components/PartnerStripeConnectPortal.test.tsx (alterar)
- src/domain/payment/components/PartnerStripeConnectPortal.tsx (alterar)
- src/domain/payment/components/accounts/PartnerTermsCard.tsx (criar)
- src/domain/payment/components/accounts/PaymentAccountCard.tsx (alterar)
- src/domain/payment/index.ts (alterar)
- src/domain/payment/ports/paymentApiPort.ts (alterar)
- src/domain/payment/types/payment.ts (alterar)
- src/domain/ticketing/components/EventTicketingPurchasePanel.tsx (alterar)
- src/domain/ticketing/components/checkout/SalesPolicyNotice.tsx (alterar)
- src/domain/ticketing/components/checkout/TicketOrderPaymentStep.test.tsx (alterar)
- src/domain/ticketing/components/checkout/TicketOrderPaymentStep.tsx (alterar)
- src/domain/ticketing/hooks/useTicketCheckout.ts (alterar)
- src/domain/ticketing/ports/ticketingPort.ts (alterar)
- src/shared/constants/legalTerms.ts (criar)
- src/shared/i18n/bookingsResources.ts (alterar)
- src/shared/i18n/legalResources.ts (criar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/i18n/ticketCheckoutResources.ts (alterar)
- src/ui/components/Dialog.tsx (alterar)
- src/ui/legal/LegalTermsDocument.tsx (criar)
- src/ui/legal/TermsAcceptanceField.test.tsx (criar)
- src/ui/legal/TermsAcceptanceField.tsx (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -12,7 +12,7 @@
 | B12 | `application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.ts` (notificação de falha de cobrança) | §12.5 (texto do backend em pt-BR) | baixo | `notifications` passar a aceitar chave de tradução e gerar no idioma do parceiro |
 | B13 | `application/usecases/bookings/*` (horário cancelado, reembolso que falhou) | §8.7 (avisar o comprador) e §7.10 A09 (alerta ao admin) | médio — o comprador só descobre o cancelamento em "Minhas reservas" e a falha de reembolso fica só no log | `notifications` aceitar destinatário usuário e admin (hoje só `recipientPartnerId`) |
 | B14 | UX — itens da auditoria de 2026-10-12 que pedem decisão de produto | §11 (UX) e §15 item 4 | baixo a médio | (a) preferências de notificação do parceiro estão em "Sobre o app" (`content/components/AboutView.tsx`), deveriam ir para Configurações; (b) "Ver todos" da Explore abre a listagem sem a busca e os filtros aplicados (`GridView` não tem filtros); (c) modais de hospedagem e restaurante não têm botão de mapa (`mapLink`); (d) "Programa de Parceiros" aberto pelo menu não volta ao menu ao fechar |
-| B16 | textos fixos em pt-BR ainda em `user/components/AccountView.tsx`, `ticketing/components/CheckoutResultView.tsx`, `partners/components/PartnersModal.tsx`, `guide/components/ExploreView.tsx` | §12.3 | médio para en/fr | traduzir tela a tela; o Prompt 16 traduziu menu, configurações, favoritos e portal do parceiro; o 18.4b traduziu a compra de ingressos e a carteira |
+| B16 | textos fixos em pt-BR ainda em `user/components/AccountView.tsx`, `ticketing/components/CheckoutResultView.tsx`, `content/components/about/AboutGeneralTab.tsx` e `AboutLicensesTab.tsx`, `partners/components/PartnersModal.tsx`, `guide/components/ExploreView.tsx` | §12.3 | médio para en/fr | traduzir tela a tela; o Prompt 16 traduziu menu, configurações, favoritos e portal do parceiro; o 18.4b traduziu a compra de ingressos e a carteira |
 | B17 | Painel do parceiro — itens da auditoria de 2026-10-12 ainda abertos | §11.8, §11.10, §12.4, §11.7, §13 | médio | seção de reservas aparece para hospedagem/restaurante; ingressos ocultos em evento novo sem aviso; relatórios bloqueados só na UI; quem já assina vê a compra de novo; erros de catálogo/notificações aparecem como lista vazia; excluir lote e "não compareceu" sem confirmação; `PartnerItemForms.tsx` sem uso; `Step2ContactInfo.tsx` (516 linhas) e `Step5Media.tsx` (756) acima de 400 linhas |
 | B18 | Painel admin — itens da auditoria de 2026-10-12 ainda abertos | §6.2, §6.4, §8, §11.7, §11.8 | médio | preço de planos em reais (Prompt 17.1); preço de item gravado como texto; catálogo e planos lidos direto do Firestore (deveria ser API, com limite); relatórios em branco antes de carregar e média 0.0 sem avaliações; card de eventos conta rascunhos; duas entradas (`/admin` e `?admin=1`); visitante sem login redirecionado sem aviso; tabs sem `role="tablist"` |
 | B20 | `operationalInfoSchema` duplicado em `server/domain/guide/schemas/guideSchema.ts` e `server/domain/partners/schemas/partnerContentSchema.ts` | §5.3 | baixo — as duas cópias precisam mudar juntas | rotas de conteúdo do parceiro passarem a validar com o schema publicado pelo `guide` (Published Language) |
@@ -20,6 +20,7 @@
 | B25 | `src/index.css`: o tema claro ainda depende de sobrescritas globais com `!important` (`:root.light .text-white`, `.bg-white/5`, `.border-white/10`…) para as telas que usam cores fixas; `biome-ignore-all lint/complexity/noImportantStyles` no topo do arquivo | §11.1 (tokens, nunca `text-white` fixo em superfície que muda) e §13 (sem avisos) | médio — cor nova sem token pode sair ilegível no claro; as sobrescritas valem para o app todo | cada tela tocada passa a usar os tokens `--ug-*` (`text-ink`, `bg-surface`, `border-line`, `text-warn`…); quando nenhuma usar mais as classes fixas, as sobrescritas e o `biome-ignore-all` saem |
 | B26 | Avisos de conta financeira no painel de ingressos (`usePartnerMerchantAccount`) e de reservas (`PartnerBookingsComposition`): consideram pronto quando **algum** CNPJ da conta está pronto para receber, não o CNPJ do evento ou da oferta | D14 (conta por documento) | baixo — só o aviso na tela; a venda e a publicação conferem a conta do CNPJ certo no backend (`assertListingCanSellUseCase` + `assertPaymentAccountReadyUseCase`) | Prompt 18.4e: aviso por estabelecimento; `PartnerEventTicketingManager` (1111 linhas) dividido ao tocar |
 | B27 | `createTicketOrderPaymentIntentApplicationUseCase` e `processProviderRefundUseCase` (cobrança com destino até o 18.4c) | D14 (taxa de serviço não volta fora do arrependimento) | baixo — num reembolso parcial o Stripe devolve à plataforma parte proporcional do `application_fee`, que inclui a taxa de serviço; a plataforma deixa de reter essa parte | 18.4c: cobrança na plataforma com transferência separada; o repasse é calculado pelo valor que o proprietário fica |
+| B28 | `bookings/components/partner/OfferTextFields.tsx` (abas pt-BR/en/fr com tradução à mão) e editor de evento do parceiro (texto só em português) | D5 e AGENTS.md §12.6 (editar no idioma ativo, tradução automática) | médio — visitante em inglês ou francês vê o português, e o parceiro digita traduções que a D5 proíbe | 19.1: `LocalizedText`, `MachineTranslationPort` e outbox; o editor mostra o idioma de Configurações e o salvo vira o original |
 
 ## Resolvidos

=== docs/arquitetura/decisoes.md — diff ===
@@ -24,6 +24,7 @@
 | D12 | Verificação e documento por estabelecimento; venda só com verificação | ✅ Aprovada | 2026-10-19 |
 | D13 | Troca de período do plano na próxima renovação | ✅ Aprovada | 2026-10-24 |
 | D14 | Repasse por documento, retenção até o serviço, taxas e cancelamentos | ✅ Aprovada | 2026-10-24 |
+| D15 | Termos com aceite registrado e idioma do editor de conteúdo | ✅ Aprovada | 2026-10-25 |
 
 ---
 
@@ -220,3 +221,13 @@ Objetivo: proteger os dois lados, o consumidor (o dinheiro só sai depois do ser
 * **Validação jurídica antes das chaves `sk_live_` (junto com a condição da D1):** termos do parceiro (multa de 20%, inclusive em força maior — Código Civil art. 393 —, compensação com repasses, bloqueio), limite de 48 h do arrependimento, políticas de cancelamento e a guarda do dinheiro no saldo do Stripe até o serviço (regulação do Banco Central).
 * **Prompts:** 18.4 (contas por documento, retenção e liberação) e seguintes; desenho apresentado para aprovação antes do código.
 
+## D15 — Termos com aceite registrado e idioma do editor de conteúdo (2026-10-25)
+
+* **Termos neutros da plataforma** em Sobre o app → Termos: termos de uso; compras, cancelamento e reembolso (todas as políticas, arrependimento, no-show, cancelamento pelo organizador, reagendamento por força maior, contestações); termos do parceiro; privacidade. Texto fixo da plataforma nos arquivos de tradução, com versão e data e o aviso de que vale a versão em português. Fonte: `src/shared/i18n/legalResources.ts`.
+* **Checkout (2A):** uma linha com a política deste evento ou desta oferta, o link para os termos (abre num diálogo, sem perder a reserva) e a caixa "Li e aceito", obrigatória para continuar. O total com a taxa de serviço destacada continua no resumo (AGENTS.md §8.7; CDC art. 6º, III, e art. 31; Decreto 7.962/2013).
+* **Prova do aceite (3A):** o pedido de ingresso e a reserva gravam `termsAcceptance { version, acceptedAt }`; o backend recusa a compra sem a versão atual (`BUYER_TERMS_VERSION` em `server/shared/kernel/legalTerms.ts`, espelhada no frontend com teste de paridade). Mudou o texto, muda a versão.
+* **Termos do parceiro (4A):** aceite com versão e data no perfil do parceiro (`partners/{uid}.termsAcceptance`), pedido em Recebimentos antes de cadastrar a conta Stripe de qualquer CNPJ — passo obrigatório antes de qualquer venda paga, de evento ou de oferta. O texto mostra as taxas vigentes vindas do backend. O aceite de "termos de parceria" no cadastro de parceiro continua como está.
+* **Idioma do editor (1A):** as abas de idioma do editor de oferta e o texto só em português do editor de evento contrariam a D5 e o AGENTS.md §12.6. Corrige no 19.1, junto com a tradução automática (débito B28).
+* **Validação jurídica** dos textos antes das chaves `sk_live_`, como na D14.
+* **Prompt:** 18.4b.3.
+

=== server/application/usecases/bookings/bookingApplicationUseCases.test.ts — diff ===
@@ -52,6 +52,7 @@ const INPUT = {
   participants: [],
   idempotencyKey: 'key-12345',
   locale: 'pt-BR' as const,
+  acceptedTermsVersion: '2026-10-25',
 };
 const BUYER = { uid: 'buyer-1', admin: false, emailVerified: true };

=== server/application/usecases/paymentAccounts/acceptPartnerTermsApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { acceptPartnerTermsUseCase } from '../../../domain/partners';
import {
  getPartnerTermsApplicationUseCase,
  type PartnerTermsView,
} from './getPartnerTermsApplicationUseCase';

export async function acceptPartnerTermsApplicationUseCase(
  ownerUid: string,
  version: string
): Promise<PartnerTermsView> {
  await acceptPartnerTermsUseCase(ownerUid, version);
  return getPartnerTermsApplicationUseCase(ownerUid);
}

=== server/application/usecases/paymentAccounts/getPartnerTermsApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getPartnerTermsStatusUseCase } from '../../../domain/partners';
import {
  type PlatformFeeConfig,
  PlatformFeeConfigError,
  resolvePlatformFeeConfig,
} from '../../../shared/kernel/platformFees';

export interface PartnerTermsView {
  currentVersion: string;
  accepted: boolean;
  acceptedAt: string | null;
  /** Taxas vigentes para o texto dos termos; `null` quando a venda está sem configuração. */
  fees: PlatformFeeConfig | null;
}

function currentFees(): PlatformFeeConfig | null {
  try {
    return resolvePlatformFeeConfig();
  } catch (error) {
    if (error instanceof PlatformFeeConfigError) return null;
    throw error;
  }
}

/** Situação do aceite dos termos do parceiro (D15) com as taxas que o texto mostra. */
export async function getPartnerTermsApplicationUseCase(
  ownerUid: string
): Promise<PartnerTermsView> {
  const status = await getPartnerTermsStatusUseCase(ownerUid);
  return {
    currentVersion: status.currentVersion,
    accepted: status.accepted,
    acceptedAt: status.accepted ? (status.acceptance?.acceptedAt ?? null) : null,
    fees: currentFees(),
  };
}

=== server/application/usecases/paymentAccounts/paymentAccountApplicationUseCases.test.ts — diff ===
@@ -3,6 +3,7 @@ import { beforeEach, describe, expect, it, vi } from 'vitest';
 vi.mock('../../../domain/partners', () => ({
   listOwnerSalesDocumentsUseCase: vi.fn(),
   getOwnerSalesDocumentUseCase: vi.fn(),
+  assertPartnerTermsAcceptedUseCase: vi.fn(),
 }));
 vi.mock('../../../domain/payment', () => ({
   listOwnerPaymentAccountsUseCase: vi.fn(),
@@ -10,6 +11,7 @@ vi.mock('../../../domain/payment', () => ({
 }));
 
 import {
+  assertPartnerTermsAcceptedUseCase,
   getOwnerSalesDocumentUseCase,
   listOwnerSalesDocumentsUseCase,
 } from '../../../domain/partners';
@@ -81,4 +83,12 @@ describe('contas de recebimento por CNPJ (D14)', () => {
     ).rejects.toMatchObject({ code: 'NOT_FOUND' });
     expect(createPaymentAccountSessionUseCase).not.toHaveBeenCalled();
   });
+
+  it('sem os termos do parceiro aceitos, não abre o cadastro no Stripe (D15)', async () => {
+    vi.mocked(assertPartnerTermsAcceptedUseCase).mockRejectedValueOnce(new Error('terms'));
+    await expect(
+      startPaymentAccountSessionApplicationUseCase({ uid: 'owner-1', email: 'a@b.c' }, 'key-1')
+    ).rejects.toThrow('terms');
+    expect(createPaymentAccountSessionUseCase).not.toHaveBeenCalled();
+  });
 });

=== server/application/usecases/paymentAccounts/startPaymentAccountSessionApplicationUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import {
  assertPartnerTermsAcceptedUseCase,
  getOwnerSalesDocumentUseCase,
} from '../../../domain/partners';
import { createPaymentAccountSessionUseCase } from '../../../domain/payment';

/**
 * Abre o cadastro no Stripe da conta de um CNPJ do próprio parceiro. O CNPJ vem da verificação aprovada
 * (nunca do cliente) e vai pré-preenchido para o Stripe conferir que a conta é dessa empresa (D14).
 * Antes de receber, o parceiro aceita os termos da versão atual (D15).
 */
export async function startPaymentAccountSessionApplicationUseCase(
  owner: { uid: string; email: string },
  accountKey: string
): Promise<{ clientSecret: string }> {
  await assertPartnerTermsAcceptedUseCase(owner.uid);
  const companyTaxId = await getOwnerSalesDocumentUseCase(owner.uid, accountKey);
  return createPaymentAccountSessionUseCase({
    accountKey,
    ownerUid: owner.uid,
    email: owner.email,
    companyTaxId,
  });
}

=== server/domain/bookings/errors/bookingDomainError.ts — diff ===
@@ -11,6 +11,7 @@ export type BookingErrorCode =
   | 'CANCELLATION_NOT_ALLOWED'
   | 'PARTNER_SUSPENDED'
   | 'POLICY_CHANGE_NOT_ALLOWED'
+  | 'TERMS_NOT_ACCEPTED'
   | 'SERVICE_UNAVAILABLE';
 
 const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
@@ -26,6 +27,7 @@ const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
   CANCELLATION_NOT_ALLOWED: 422,
   PARTNER_SUSPENDED: 403,
   POLICY_CHANGE_NOT_ALLOWED: 422,
+  TERMS_NOT_ACCEPTED: 422,
   SERVICE_UNAVAILABLE: 503,
 };

=== server/domain/bookings/services/bookingService.test.ts — diff ===
@@ -1,3 +1,4 @@
+import { BUYER_TERMS_VERSION } from '../../../shared/kernel/legalTerms';
 import { describe, expect, it } from 'vitest';
 import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
 import type { BookableOffer } from '../types/bookingTypes';
@@ -67,6 +68,7 @@ const INPUT: CreatePendingBookingInput = {
   participants: [],
   idempotencyKey: 'key-12345',
   locale: 'pt-BR',
+  acceptedTermsVersion: BUYER_TERMS_VERSION,
 };
 
 describe('BookingService', () => {
@@ -83,6 +85,18 @@ describe('BookingService', () => {
     expect(port.slots.get('slot-1')?.capacityReserved).toBe(2);
   });
 
+  it('recusa sem o aceite da versão atual dos termos e grava a versão aceita (D15)', async () => {
+    const { service } = setup();
+    await expect(
+      service.createPendingBooking(BUYER, { ...INPUT, acceptedTermsVersion: 'antiga' }, FEES)
+    ).rejects.toMatchObject({ code: 'TERMS_NOT_ACCEPTED' });
+    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
+    expect(booking.termsAcceptance).toEqual({
+      version: BUYER_TERMS_VERSION,
+      acceptedAt: '2026-11-01T12:00:00.000Z',
+    });
+  });
+
   it('mesma chave de idempotência devolve a mesma reserva sem reservar de novo', async () => {
     const { service, port } = setup();
     const first = await service.createPendingBooking(BUYER, INPUT, FEES);

=== server/domain/bookings/services/bookingService.ts — diff ===
@@ -12,6 +12,7 @@ import {
 import { buildBookingId } from '../utils/buildBookingId';
 import { priceBookingLines } from '../utils/bookingPricing';
 import { calculateBuyerRefund } from '../../../shared/kernel/cancellationPolicy';
+import { isCurrentBuyerTermsVersion } from '../../../shared/kernel/legalTerms';
 import type { PlatformFeeConfig } from '../../../shared/kernel/platformFees';
 
 // Tempo para pagar antes de a vaga voltar para a venda (inclui o Pix, que é assíncrono).
@@ -25,6 +26,7 @@ export interface CreatePendingBookingInput {
   participants: Array<{ name: string }>;
   idempotencyKey: string;
   locale: Locale;
+  acceptedTermsVersion: string;
 }
 
 export interface BuyerCancellationResult {
@@ -49,6 +51,13 @@ export class BookingService {
     input: CreatePendingBookingInput,
     feeConfig: PlatformFeeConfig
   ): Promise<Booking> {
+    // D15: sem o aceite da versão atual dos termos não há compra.
+    if (!isCurrentBuyerTermsVersion(input.acceptedTermsVersion)) {
+      throw new BookingDomainError(
+        'TERMS_NOT_ACCEPTED',
+        'Aceite os termos de compra para continuar.'
+      );
+    }
     const offer = await this.port.getOffer(input.offerId);
     if (offer?.status !== 'published') {
       throw new BookingDomainError('NOT_FOUND', 'Oferta não encontrada.');
@@ -89,6 +98,7 @@ export class BookingService {
         ...(offer.meetingPoint ? { meetingPoint: offer.meetingPoint.address } : {}),
         cancellationPolicy: offer.cancellationPolicy,
       },
+      termsAcceptance: { version: input.acceptedTermsVersion, acceptedAt: timestamp },
       locale: input.locale,
       idempotencyKey: input.idempotencyKey,
       createdAt: timestamp,

=== server/domain/bookings/types/bookingTypes.ts — diff ===
@@ -1,3 +1,4 @@
+import type { TermsAcceptance } from '../../../shared/kernel/legalTerms';
 import type { BookingCancellationPolicy } from '../../../shared/kernel/cancellationPolicy';
 import type { Locale } from '../../../shared/kernel/locale';
 
@@ -123,6 +124,8 @@ export interface Booking {
   };
   /** Gravado ao cancelar: torna o cancelamento repetível sem recalcular o reembolso. */
   cancellation?: BookingCancellation;
+  /** Versão dos termos aceita na compra (D15). */
+  termsAcceptance?: TermsAcceptance;
   locale: Locale;
   idempotencyKey: string;
   createdAt: string;

=== server/domain/partners/adapters/firestorePartnerAdapter.ts — diff ===
@@ -1,3 +1,4 @@
+import type { TermsAcceptance } from '../../../shared/kernel/legalTerms';
 import { FieldValue } from 'firebase-admin/firestore';
 import { adminDb } from '../../../infrastructure/firebase/adminClient';
 import { PartnerDomainError } from '../errors/partnerDomainError';
@@ -53,6 +54,28 @@ export class FirestorePartnerAdapter implements PartnerPort {
     return toPartnerProfileDTO(partnerId, raw);
   }
 
+  async getTermsAcceptance(partnerId: string): Promise<TermsAcceptance | null> {
+    const docSnap = await adminDb.collection('partners').doc(partnerId).get();
+    const raw = docSnap.data()?.termsAcceptance as Record<string, unknown> | undefined;
+    if (typeof raw?.version !== 'string' || typeof raw.acceptedAt !== 'string') return null;
+    return { version: raw.version, acceptedAt: raw.acceptedAt };
+  }
+
+  async recordTermsAcceptance(partnerId: string, acceptance: TermsAcceptance): Promise<void> {
+    const partnerRef = adminDb.collection('partners').doc(partnerId);
+    // Só no documento interno: o aceite não vai para a projeção pública (AGENTS.md §6.3).
+    await adminDb.runTransaction(async (transaction) => {
+      const snapshot = await transaction.get(partnerRef);
+      if (!snapshot.exists) {
+        throw new PartnerDomainError('NOT_FOUND', 'Perfil de parceiro não encontrado');
+      }
+      transaction.update(partnerRef, {
+        termsAcceptance: acceptance,
+        updatedAt: FieldValue.serverTimestamp(),
+      });
+    });
+  }
+
   async updatePartnerStatus(partnerId: string, status: PartnerStatus): Promise<void> {
     await this.mutatePartnerAtomically(partnerId, () => ({
       status,

=== server/domain/partners/errors/partnerDomainError.ts — diff ===
@@ -1,4 +1,9 @@
-export type PartnerErrorCode = 'INVALID_ARGUMENT' | 'NOT_FOUND' | 'FORBIDDEN' | 'CONFLICT';
+export type PartnerErrorCode =
+  | 'INVALID_ARGUMENT'
+  | 'NOT_FOUND'
+  | 'FORBIDDEN'
+  | 'CONFLICT'
+  | 'PARTNER_TERMS_NOT_ACCEPTED';
 
 export class PartnerDomainError extends Error {
   constructor(

=== server/domain/partners/index.ts — diff ===
@@ -7,6 +7,10 @@ export { linkBusinessUseCase } from './usecases/linkBusinessUseCase';
 export { updateBusinessUseCase } from './usecases/updateBusinessUseCase';
 export { unlinkBusinessUseCase } from './usecases/unlinkBusinessUseCase';
 export { deletePartnerProfileUseCase } from './usecases/deletePartnerProfileUseCase';
+export { getPartnerTermsStatusUseCase } from './usecases/getPartnerTermsStatusUseCase';
+export { acceptPartnerTermsUseCase } from './usecases/acceptPartnerTermsUseCase';
+export { assertPartnerTermsAcceptedUseCase } from './usecases/assertPartnerTermsAcceptedUseCase';
+export type { PartnerTermsStatus } from './services/partnerService';
 export { submitListingVerificationUseCase } from './usecases/submitListingVerificationUseCase';
 export { reviewListingVerificationUseCase } from './usecases/reviewListingVerificationUseCase';
 export { getListingVerificationUseCase } from './usecases/getListingVerificationUseCase';

=== server/domain/partners/ports/partnerPort.ts — diff ===
@@ -1,3 +1,4 @@
+import type { TermsAcceptance } from '../../../shared/kernel/legalTerms';
 import type {
   PartnerBusiness,
   PartnerProfileDocument,
@@ -16,4 +17,7 @@ export interface PartnerPort {
   getAllPartnerIds(): Promise<string[]>;
   getAllPartners(): Promise<PartnerProfileDocument[]>;
   deletePartnerProfile(partnerId: string): Promise<void>;
+  getTermsAcceptance(partnerId: string): Promise<TermsAcceptance | null>;
+  /** Lança `NOT_FOUND` quando o parceiro não tem perfil. */
+  recordTermsAcceptance(partnerId: string, acceptance: TermsAcceptance): Promise<void>;
 }

=== server/domain/partners/services/partnerService.test.ts — diff ===
@@ -1,3 +1,4 @@
+import { PARTNER_TERMS_VERSION } from '../../../shared/kernel/legalTerms';
 import { beforeEach, describe, expect, it, vi } from 'vitest';
 import { PartnerService } from './partnerService';
 import { PartnerPort } from '../ports/partnerPort';
@@ -13,6 +14,8 @@ function createPartnerPortMock(): PartnerPort {
     linkBusiness: vi.fn(),
     updateBusiness: vi.fn(),
     unlinkBusiness: vi.fn(),
+    getTermsAcceptance: vi.fn().mockResolvedValue(null),
+    recordTermsAcceptance: vi.fn(),
   };
 }
 
@@ -39,4 +42,25 @@ describe('PartnerService', () => {
       ).rejects.toThrow('É necessário aceitar os termos de parceria');
     });
   });
+
+  describe('termos do parceiro (D15)', () => {
+    it('sem aceite da versão atual, bloqueia; aceitar grava versão e data', async () => {
+      await expect(service.assertTermsAccepted('p1')).rejects.toMatchObject({
+        code: 'PARTNER_TERMS_NOT_ACCEPTED',
+      });
+      await expect(service.acceptTerms('p1', '2020-01-01')).rejects.toThrow(/desatualizada/);
+      const now = new Date('2026-10-25T12:00:00.000Z');
+      const status = await service.acceptTerms('p1', PARTNER_TERMS_VERSION, now);
+      expect(status.accepted).toBe(true);
+      expect(partnerPort.recordTermsAcceptance).toHaveBeenCalledWith('p1', {
+        version: PARTNER_TERMS_VERSION,
+        acceptedAt: '2026-10-25T12:00:00.000Z',
+      });
+      vi.mocked(partnerPort.getTermsAcceptance).mockResolvedValue({
+        version: PARTNER_TERMS_VERSION,
+        acceptedAt: '2026-10-25T12:00:00.000Z',
+      });
+      await expect(service.assertTermsAccepted('p1')).resolves.toBeUndefined();
+    });
+  });
 });

=== server/domain/partners/services/partnerService.ts — diff ===
@@ -1,3 +1,8 @@
+import {
+  isCurrentPartnerTerms,
+  PARTNER_TERMS_VERSION,
+  type TermsAcceptance,
+} from '../../../shared/kernel/legalTerms';
 import { PartnerDomainError } from '../errors/partnerDomainError';
 import { PartnerPort } from '../ports/partnerPort';
 import type {
@@ -8,6 +13,12 @@ import type {
   RegisterPartnerResult,
 } from '../types/partnerTypes';
 
+export interface PartnerTermsStatus {
+  currentVersion: string;
+  accepted: boolean;
+  acceptance: TermsAcceptance | null;
+}
+
 export class PartnerService {
   constructor(private readonly partnerPort: PartnerPort) {}
 
@@ -30,6 +41,39 @@ export class PartnerService {
     return this.partnerPort.registerPartner(uid, data);
   }
 
+  async getTermsStatus(partnerId: string): Promise<PartnerTermsStatus> {
+    const acceptance = await this.partnerPort.getTermsAcceptance(partnerId);
+    return {
+      currentVersion: PARTNER_TERMS_VERSION,
+      accepted: isCurrentPartnerTerms(acceptance),
+      acceptance,
+    };
+  }
+
+  /** Grava o aceite dos termos do parceiro (D15); só a versão atual é aceita. */
+  async acceptTerms(
+    partnerId: string,
+    version: string,
+    now = new Date()
+  ): Promise<PartnerTermsStatus> {
+    if (version !== PARTNER_TERMS_VERSION) {
+      throw new PartnerDomainError('INVALID_ARGUMENT', 'Versão dos termos desatualizada.');
+    }
+    const acceptance = { version, acceptedAt: now.toISOString() };
+    await this.partnerPort.recordTermsAcceptance(partnerId, acceptance);
+    return { currentVersion: PARTNER_TERMS_VERSION, accepted: true, acceptance };
+  }
+
+  async assertTermsAccepted(partnerId: string): Promise<void> {
+    const status = await this.getTermsStatus(partnerId);
+    if (!status.accepted) {
+      throw new PartnerDomainError(
+        'PARTNER_TERMS_NOT_ACCEPTED',
+        'Aceite os termos do parceiro para cadastrar a conta de recebimento.'
+      );
+    }
+  }
+
   async getProfile(partnerId: string): Promise<PartnerProfileDocument | null> {
     if (!partnerId?.trim()) {
       throw new PartnerDomainError('INVALID_ARGUMENT', 'ID do parceiro é obrigatório');

=== server/domain/partners/usecases/acceptPartnerTermsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { partnerService } from '../factory';
import type { PartnerTermsStatus } from '../services/partnerService';

export function acceptPartnerTermsUseCase(
  partnerId: string,
  version: string
): Promise<PartnerTermsStatus> {
  return partnerService.acceptTerms(partnerId, version);
}

=== server/domain/partners/usecases/assertPartnerTermsAcceptedUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { partnerService } from '../factory';

/** Lança `PartnerDomainError` (`PARTNER_TERMS_NOT_ACCEPTED`) sem o aceite da versão atual (D15). */
export function assertPartnerTermsAcceptedUseCase(partnerId: string): Promise<void> {
  return partnerService.assertTermsAccepted(partnerId);
}

=== server/domain/partners/usecases/getPartnerTermsStatusUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { partnerService } from '../factory';
import type { PartnerTermsStatus } from '../services/partnerService';

export function getPartnerTermsStatusUseCase(partnerId: string): Promise<PartnerTermsStatus> {
  return partnerService.getTermsStatus(partnerId);
}

=== server/domain/ticketing/adapters/firestoreOrderReservationStore.ts — diff ===
@@ -120,6 +120,7 @@ export class FirestoreOrderReservationStore {
         buyerSnapshot: input.buyerSnapshot,
         eventSnapshot: input.eventSnapshot,
         salesPolicySnapshot: input.salesPolicySnapshot,
+        termsAcceptance: input.termsAcceptance,
         idempotencyKey: input.idempotencyKey,
         expiresAt: input.expiresAt,
         createdAt: nowIso,

=== server/domain/ticketing/dtos/ticketingPersistenceMappers.ts — diff ===
@@ -1,3 +1,4 @@
+import type { TermsAcceptance } from '../../../shared/kernel/legalTerms';
 import { isCancellationPolicyAllowed } from '../../../shared/kernel/cancellationPolicy';
 import type {
   EventCheckIn,
@@ -45,6 +46,12 @@ function normalizeSalesPolicySnapshot(
   };
 }
 
+function toTermsAcceptance(raw: unknown): { termsAcceptance?: TermsAcceptance } {
+  const value = raw as Record<string, unknown> | undefined;
+  if (typeof value?.version !== 'string' || typeof value.acceptedAt !== 'string') return {};
+  return { termsAcceptance: { version: value.version, acceptedAt: value.acceptedAt } };
+}
+
 export class TicketTypePersistenceMapper {
   static toDomain(id: string, raw: Record<string, unknown>): TicketType {
     const now = new Date().toISOString();
@@ -139,6 +146,7 @@ export class TicketOrderPersistenceMapper {
           }
         : undefined,
       salesPolicySnapshot: normalizeSalesPolicySnapshot(rawPolicy),
+      ...toTermsAcceptance(raw.termsAcceptance),
       idempotencyKey: String(raw.idempotencyKey || ''),
       expiresAt: typeof raw.expiresAt === 'string' ? raw.expiresAt : undefined,
       createdAt: toIso(raw.createdAt, now),

=== server/domain/ticketing/ports/ticketingPort.ts — diff ===
@@ -1,3 +1,4 @@
+import type { TermsAcceptance } from '../../../shared/kernel/legalTerms';
 import type {
   EventCheckIn,
   EventPromoCode,
@@ -44,6 +45,7 @@ export interface ReserveOrderTransactionInput {
     locationName?: string;
   };
   salesPolicySnapshot: TicketOrderSalesPolicySnapshot;
+  termsAcceptance: TermsAcceptance;
   expiresAt: string;
   items: Array<{
     ticketTypeId: string;

=== server/domain/ticketing/schemas/ticketingSchema.ts — diff ===
@@ -103,6 +103,7 @@ export const createTicketOrderSchema = z
     promoCode: z.string().trim().max(80).optional(),
     promoterCode: z.string().trim().max(80).optional(),
     idempotencyKey: z.string().trim().min(1).max(150),
+    acceptedTermsVersion: z.string().trim().min(1).max(40),
   })
   .strict();

=== server/domain/ticketing/services/ticketOrderService.ts — diff ===
@@ -1,6 +1,7 @@
 import { createEventAuditLogUseCase, getEventListingByIdUseCase } from '../../events';
 import { OrderNotFoundError, TicketingDomainError } from '../errors/ticketingDomainError';
 import type { TicketingPort } from '../ports/ticketingPort';
+import { isCurrentBuyerTermsVersion } from '../../../shared/kernel/legalTerms';
 import {
   PlatformFeeConfigError,
   resolvePlatformFeeConfig,
@@ -52,6 +53,7 @@ export class TicketOrderService {
       promoCode?: string;
       promoterCode?: string;
       idempotencyKey: string;
+      acceptedTermsVersion: string;
     }
   ): Promise<{
     order: TicketOrder;
@@ -60,6 +62,13 @@ export class TicketOrderService {
     isIdempotentReplay: boolean;
     serverNow: string;
   }> {
+    // D15: sem o aceite da versão atual dos termos não há compra.
+    if (!isCurrentBuyerTermsVersion(input.acceptedTermsVersion)) {
+      throw new TicketingDomainError(
+        'UNPROCESSABLE_ENTITY',
+        'Aceite os termos de compra para continuar.'
+      );
+    }
     const nowMs = Date.now();
     const { occurrence, listing } = await loadOccurrenceOnSale(input.occurrenceId, nowMs);
 
@@ -134,6 +143,10 @@ export class TicketOrderService {
         locationName: occurrence.locationOverride?.name || listing.location.name,
       },
       salesPolicySnapshot: { ...listing.salesPolicy },
+      termsAcceptance: {
+        version: input.acceptedTermsVersion,
+        acceptedAt: new Date(nowMs).toISOString(),
+      },
       expiresAt,
       items: preparedItems,
       issueImmediately,

=== server/domain/ticketing/services/ticketingServices.test.ts — diff ===
@@ -1,3 +1,4 @@
+import { BUYER_TERMS_VERSION } from '../../../shared/kernel/legalTerms';
 import { beforeEach, describe, expect, it, vi } from 'vitest';
 import { CheckInService } from './checkInService';
 import { TicketHolderService } from './ticketHolderService';
@@ -206,6 +207,21 @@ describe('serviços de ticketing', () => {
     ).rejects.toThrow(/Não é permitido alterar o preço/);
   });
 
+  it('recusa a compra sem o aceite da versão atual dos termos (D15)', async () => {
+    await expect(
+      services.orders.createTicketOrder(
+        { uid: 'buyer_1' },
+        {
+          occurrenceId: 'occ_1',
+          items: [{ ticketTypeId: 'tt_1', quantity: 1 }],
+          buyer: { name: 'Maria', email: 'maria@example.com' },
+          idempotencyKey: 'idem_terms_old',
+          acceptedTermsVersion: '2020-01-01',
+        }
+      )
+    ).rejects.toThrow(/Aceite os termos/);
+  });
+
   it('creates an order with minor units and calculates platform fee without floating point errors', async () => {
     const res = await services.orders.createTicketOrder(
       { uid: 'buyer_1' },
@@ -214,12 +230,16 @@ describe('serviços de ticketing', () => {
         items: [{ ticketTypeId: 'tt_1', quantity: 2 }],
         buyer: { name: 'Maria', email: 'maria@example.com' },
         idempotencyKey: 'idem_12345678',
+        acceptedTermsVersion: BUYER_TERMS_VERSION,
       }
     );
 
     expect(res.order.subtotalMinor).toBe(10000);
     expect(res.order.platformFeeMinor).toBe(1000);
     expect(res.order.serviceFeeMinor).toBe(600);
+    expect(
+      vi.mocked(mockPort.reserveInventoryAndCreateOrderAtomic).mock.calls[0]?.[0].termsAcceptance
+    ).toMatchObject({ version: BUYER_TERMS_VERSION });
     expect(res.order.totalMinor).toBe(10600);
     expect(res.order.status).toBe('pending_payment');
   });
@@ -299,6 +319,7 @@ describe('serviços de ticketing', () => {
         items: [{ ticketTypeId: 'tt_free', quantity: 2 }],
         buyer: { name: 'João', email: 'joao@example.com' },
         idempotencyKey: 'idem_free_1',
+        acceptedTermsVersion: BUYER_TERMS_VERSION,
       }
     );
 
@@ -337,6 +358,7 @@ describe('serviços de ticketing', () => {
           items: [{ ticketTypeId: 'tt_b', quantity: 2 }],
           buyer: { name: 'Pedro', email: 'pedro@example.com' },
           idempotencyKey: 'idem_cap_exceed',
+          acceptedTermsVersion: BUYER_TERMS_VERSION,
         }
       )
     ).rejects.toThrow(/não está disponível para compra|esgotar|Restam apenas/);

=== server/domain/ticketing/types/ticketingTypes.ts — diff ===
@@ -1,3 +1,4 @@
+import type { TermsAcceptance } from '../../../shared/kernel/legalTerms';
 import type { EventCancellationPolicy } from '../../../shared/kernel/cancellationPolicy';
 import type { ServiceFeeMode } from '../../../shared/kernel/platformFees';
 export type MoneyMinor = number;
@@ -119,6 +120,8 @@ export interface TicketOrder {
     locationName?: string;
   };
   salesPolicySnapshot: TicketOrderSalesPolicySnapshot;
+  /** Versão dos termos aceita na compra (D15). */
+  termsAcceptance?: TermsAcceptance;
   idempotencyKey: string;
   expiresAt?: string;
   createdAt: string;

=== server/interfaces/http/bookings/bookingsController.test.ts — diff ===
@@ -64,7 +64,7 @@ const BOOKING = {
   offerSnapshot: {
     title: 'Passeio',
     startsAt: '2026-11-10T11:00:00.000Z',
-    cancellationPolicy: { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 50 },
+    cancellationPolicy: 'flexible',
   },
   locale: 'pt-BR',
   createdAt: '',
@@ -76,6 +76,7 @@ const VALID_BODY = {
   slotId: 'slot-1',
   lines: [{ priceOptionId: 'adult', quantity: 2 }],
   locale: 'pt-BR',
+  acceptedTermsVersion: '2026-10-25',
 };
 
 describe('BookingsController', () => {

=== server/interfaces/http/bookings/schemas/bookingSchemas.ts — diff ===
@@ -116,6 +116,7 @@ export const CreateBookingSchema = z
       .default([]),
     idempotencyKey: idempotencyKey.optional(),
     locale,
+    acceptedTermsVersion: z.string().trim().min(1).max(40),
   })
   .strict();

=== server/interfaces/http/paymentAccounts/paymentAccountController.test.ts — diff ===
@@ -2,7 +2,12 @@ import type { Response } from 'express';
 import { beforeEach, describe, expect, it, vi } from 'vitest';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 
-const m = vi.hoisted(() => ({ list: vi.fn(), session: vi.fn() }));
+const m = vi.hoisted(() => ({
+  list: vi.fn(),
+  session: vi.fn(),
+  getTerms: vi.fn(),
+  acceptTerms: vi.fn(),
+}));
 
 vi.mock(
   '../../../application/usecases/paymentAccounts/listPartnerPaymentAccountsApplicationUseCase',
@@ -13,6 +18,17 @@ vi.mock(
   () => ({ startPaymentAccountSessionApplicationUseCase: m.session })
 );
 
+vi.mock('../../../application/usecases/paymentAccounts/getPartnerTermsApplicationUseCase', () => ({
+  getPartnerTermsApplicationUseCase: m.getTerms,
+}));
+vi.mock(
+  '../../../application/usecases/paymentAccounts/acceptPartnerTermsApplicationUseCase',
+  () => ({
+    acceptPartnerTermsApplicationUseCase: m.acceptTerms,
+  })
+);
+
+import { PartnerDomainError } from '../../../domain/partners/errors/partnerDomainError';
 import { ListingVerificationError } from '../../../domain/partners/errors/listingVerificationError';
 import { PaymentAccountController } from './paymentAccountController';
 
@@ -103,4 +119,34 @@ describe('PaymentAccountController (D14)', () => {
     expect(res.status).toHaveBeenCalledWith(503);
     expect(JSON.stringify(res.json.mock.calls)).not.toContain('sk_test');
   });
+
+  it('sessão sem os termos do parceiro aceitos: 422 com código estável (D15)', async () => {
+    m.session.mockRejectedValue(
+      new PartnerDomainError('PARTNER_TERMS_NOT_ACCEPTED', 'Aceite os termos do parceiro.')
+    );
+    const res = response();
+    await PaymentAccountController.createSession(
+      request({ body: { accountKey: KEY } }),
+      res as unknown as Response
+    );
+    expect(res.status).toHaveBeenCalledWith(422);
+    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
+      error: { code: 'PARTNER_TERMS_NOT_ACCEPTED' },
+    });
+  });
+
+  it('aceite dos termos: só a versão, sempre em nome de quem está logado', async () => {
+    m.acceptTerms.mockResolvedValue({ accepted: true });
+    const res = response();
+    await PaymentAccountController.acceptTerms(
+      request({ body: { version: '2026-10-25', ownerUid: 'owner-2' } }),
+      res as unknown as Response
+    );
+    expect(res.status).toHaveBeenCalledWith(400);
+    await PaymentAccountController.acceptTerms(
+      request({ body: { version: '2026-10-25' } }),
+      res as unknown as Response
+    );
+    expect(m.acceptTerms).toHaveBeenCalledWith('owner-1', '2026-10-25');
+  });
 });

=== server/interfaces/http/paymentAccounts/paymentAccountController.ts — diff ===
@@ -1,10 +1,13 @@
 import type { Response } from 'express';
 import { listPartnerPaymentAccountsApplicationUseCase } from '../../../application/usecases/paymentAccounts/listPartnerPaymentAccountsApplicationUseCase';
 import { startPaymentAccountSessionApplicationUseCase } from '../../../application/usecases/paymentAccounts/startPaymentAccountSessionApplicationUseCase';
-import { ListingVerificationError } from '../../../domain/partners';
+import { acceptPartnerTermsApplicationUseCase } from '../../../application/usecases/paymentAccounts/acceptPartnerTermsApplicationUseCase';
+import { getPartnerTermsApplicationUseCase } from '../../../application/usecases/paymentAccounts/getPartnerTermsApplicationUseCase';
+import { ListingVerificationError, PartnerDomainError } from '../../../domain/partners';
 import { PaymentDomainError } from '../../../domain/payment';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import {
+  AcceptPartnerTermsSchema,
   ListPaymentAccountsQuerySchema,
   PaymentAccountSessionSchema,
 } from './schemas/paymentAccountSchemas';
@@ -17,6 +20,10 @@ function handleError(res: Response, error: unknown, operation: string): Response
   if (error instanceof ListingVerificationError || error instanceof PaymentDomainError) {
     return sendError(res, error.statusCode, error.code, error.message);
   }
+  if (error instanceof PartnerDomainError) {
+    const status = { NOT_FOUND: 404, PARTNER_TERMS_NOT_ACCEPTED: 422 }[error.code as string] ?? 400;
+    return sendError(res, status, error.code, error.message);
+  }
   console.error(`[PaymentAccountController.${operation}]`, {
     name: error instanceof Error ? error.name : 'UnknownError',
   });
@@ -45,6 +52,27 @@ export class PaymentAccountController {
     }
   }
 
+  static async getTerms(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    try {
+      return res.status(200).json({ data: await getPartnerTermsApplicationUseCase(req.user.uid) });
+    } catch (error) {
+      return handleError(res, error, 'getTerms');
+    }
+  }
+
+  static async acceptTerms(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    const body = AcceptPartnerTermsSchema.safeParse(req.body);
+    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Versão inválida.');
+    try {
+      const terms = await acceptPartnerTermsApplicationUseCase(req.user.uid, body.data.version);
+      return res.status(200).json({ data: terms });
+    } catch (error) {
+      return handleError(res, error, 'acceptTerms');
+    }
+  }
+
   static async createSession(req: AuthenticatedRequest, res: Response): Promise<Response> {
     if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
     const body = PaymentAccountSessionSchema.safeParse(req.body);

=== server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts — diff ===
@@ -12,5 +12,7 @@ const router = Router();
 
 router.get('/', verifyAuthToken, PaymentAccountController.list);
 router.post('/session', verifyAuthTokenStrict, PaymentAccountController.createSession);
+router.get('/terms', verifyAuthToken, PaymentAccountController.getTerms);
+router.post('/terms', verifyAuthTokenStrict, PaymentAccountController.acceptTerms);
 
 export default router;

=== server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts — diff ===
@@ -5,6 +5,10 @@ export const PaymentAccountSessionSchema = z
   .object({ accountKey: z.string().regex(/^[\w-]{43}$/) })
   .strict();
 
+export const AcceptPartnerTermsSchema = z
+  .object({ version: z.string().trim().min(1).max(40) })
+  .strict();
+
 export const ListPaymentAccountsQuerySchema = z
   .object({
     ownerUid: z

=== server/shared/kernel/legalTerms.parity.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import * as frontend from '../../../src/shared/constants/legalTerms';
import { BUYER_TERMS_VERSION, PARTNER_TERMS_VERSION } from './legalTerms';

describe('paridade das versões dos termos', () => {
  it('frontend e backend pedem a mesma versão', () => {
    expect(frontend.BUYER_TERMS_VERSION).toBe(BUYER_TERMS_VERSION);
    expect(frontend.PARTNER_TERMS_VERSION).toBe(PARTNER_TERMS_VERSION);
  });
});

=== server/shared/kernel/legalTerms.ts — ARQUIVO NOVO, conteúdo completo ===
/**
 * Versões dos termos da plataforma (D15). Mudou o texto, muda a versão: compras e vendas novas exigem o
 * aceite da versão atual, e o pedido guarda a versão aceita como prova.
 */
export const BUYER_TERMS_VERSION = '2026-10-25';
export const PARTNER_TERMS_VERSION = '2026-10-25';

export interface TermsAcceptance {
  version: string;
  acceptedAt: string;
}

export function isCurrentBuyerTermsVersion(version: unknown): version is string {
  return version === BUYER_TERMS_VERSION;
}

export function isCurrentPartnerTerms(acceptance: TermsAcceptance | null | undefined): boolean {
  return acceptance?.version === PARTNER_TERMS_VERSION;
}

=== src/domain/bookings/components/buyer/BookingFlow.tsx — diff ===
@@ -1,6 +1,8 @@
 import { ArrowLeft } from 'lucide-react';
 import { useMemo, useState } from 'react';
 import { useTranslation } from 'react-i18next';
+import { BUYER_TERMS_VERSION } from '../../../../shared/constants/legalTerms';
+import { TermsAcceptanceField } from '../../../../ui/legal/TermsAcceptanceField';
 import type { PublicOffer, PublicSlot } from '../../types/bookings';
 import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../shared/ListState';
 import { BookingCheckout } from './BookingCheckout';
@@ -31,6 +33,7 @@ export function BookingFlow({
   const [slot, setSlot] = useState<PublicSlot | null>(null);
   const [quantities, setQuantities] = useState<Record<string, number>>({});
   const [names, setNames] = useState<string[]>([]);
+  const [termsAccepted, setTermsAccepted] = useState(false);
   const participants = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
   const maxParticipants = Math.min(offer.maxParticipantsPerBooking, slot?.available ?? 0);
 
@@ -42,6 +45,7 @@ export function BookingFlow({
         .filter(([, quantity]) => quantity > 0)
         .map(([priceOptionId, quantity]) => ({ priceOptionId, quantity })),
       participants: names.map((name) => ({ name })),
+      acceptedTermsVersion: BUYER_TERMS_VERSION,
     }),
     [offer.id, slot?.id, quantities, names]
   );
@@ -111,10 +115,17 @@ export function BookingFlow({
       {slot && participants > 0 && !isAuthenticated && (
         <p className="text-xs text-white/70">{t('bookings.buyer.loginRequired')}</p>
       )}
+      {slot && participants > 0 && (
+        <TermsAcceptanceField
+          audience="buyer"
+          checked={termsAccepted}
+          onChange={setTermsAccepted}
+        />
+      )}
       {slot && (
         <button
           type="button"
-          disabled={participants === 0}
+          disabled={participants === 0 || !termsAccepted}
           onClick={proceed}
           className={`${BUTTON_PRIMARY} w-full`}
         >

=== src/domain/bookings/components/buyer/OfferPolicySummary.tsx — diff ===
@@ -30,7 +30,6 @@ export function OfferPolicySummary({ offer }: { offer: PublicOffer }) {
           {t(`salesPolicy.policies.${family}.${policy}.description`)} {t('salesPolicy.noShow')}
         </span>
       </li>
-      <li className="text-ink/70">{t('salesPolicy.withdrawalNoFee')}</li>
     </ul>
   );
 }

=== src/domain/bookings/components/buyer/buyerComponents.test.tsx — diff ===
@@ -124,7 +124,6 @@ describe('componentes de compra', () => {
     expect(
       screen.getByText(/Full refund up to 5 days before the start; 50% up to 24 h before/)
     ).toBeTruthy();
-    expect(screen.getByText(/Right of withdrawal: full refund if/)).toBeTruthy();
     await i18n.changeLanguage('pt-BR');
   });
 });
@@ -140,6 +139,7 @@ describe('useBookingCheckout', () => {
       slotId: 's',
       lines: [{ priceOptionId: 'adult', quantity: 1 }],
       participants: [],
+      acceptedTermsVersion: '2026-10-25',
     };
     await act(async () => {
       await result.current.start(request);

=== src/domain/bookings/types/bookings.ts — diff ===
@@ -137,6 +137,7 @@ export interface CreateBookingPayload {
   participants: Array<{ name: string }>;
   idempotencyKey: string;
   locale: 'pt-BR' | 'en' | 'fr';
+  acceptedTermsVersion: string;
 }
 
 export interface CreateBookingResponse {

=== src/domain/bookings/utils/bookingErrorMessage.ts — diff ===
@@ -11,6 +11,7 @@ const KNOWN_CODES = [
   'LATE_PAYMENT_REJECTED',
   'KIND_NOT_AVAILABLE',
   'CANCELLATION_NOT_ALLOWED',
+  'TERMS_NOT_ACCEPTED',
   'SELLER_ACCOUNT_NOT_ELIGIBLE',
   'INTERNAL_ERROR',
 ] as const;

=== src/domain/content/components/AboutView.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ChevronLeft, Palette, Shield, Terminal } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../shared/utils/cn';
import { useAppVersion } from '../hooks/useAppVersion';
import { AboutGeneralTab } from './about/AboutGeneralTab';
import { AboutLicensesTab } from './about/AboutLicensesTab';
import { AboutTermsTab } from './about/AboutTermsTab';

interface AboutViewProps {
  onBack: () => void;
}

type TabType = 'general' | 'licenses' | 'terms';

export function AboutView({ onBack }: AboutViewProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const { appVersion } = useAppVersion();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center relative mb-6 pt-2 pr-2">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('legal.about.back')}
          className="absolute left-0 p-2 text-white/70 hover:text-white active:scale-90 transition-all z-10"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-display font-black mb-1 text-orange-400 leading-tight">
            {t('legal.about.title')}
          </h2>
          <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
            Use Guide v{appVersion?.version || '1.0.0'}{' '}
            {appVersion?.revision ? `(${appVersion.revision})` : ''}
          </p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-black/20 rounded-2xl border border-white/5 mb-4">
        {[
          { id: 'general', label: t('legal.about.general'), icon: Palette },
          { id: 'licenses', label: t('legal.about.licenses'), icon: Terminal },
          { id: 'terms', label: t('legal.about.terms'), icon: Shield },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all duration-300',
                isActive
                  ? 'bg-white/10 text-white border border-white/10 shadow-md'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              )}
            >
              <TabIcon size={10} className={cn(isActive ? 'text-orange-400' : 'opacity-60')} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'general' && <AboutGeneralTab key="general" />}
          {activeTab === 'licenses' && <AboutLicensesTab key="licenses" />}
          {activeTab === 'terms' && <AboutTermsTab key="terms" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

=== src/domain/content/components/about/AboutGeneralTab.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Copyright, Palette, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../../../shared/utils/cn';
import { useAuthContext } from '../../../auth/context/AuthContext';
import { UserRole } from '../../../auth/types/auth';
import { useNotificationSettings } from '../../../notifications';

export function AboutGeneralTab() {
  const { user } = useAuthContext();
  const isPartner = user?.role === UserRole.PARTNER;
  const { settings, updateSetting } = useNotificationSettings(isPartner ? user.uid : undefined);

  return (
    <motion.div
      key="general-tab"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
      className="space-y-4 text-left"
    >
      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-16 h-16 bg-orange-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-1.5 text-orange-400 font-display font-black text-[10px] uppercase tracking-wider">
          <Sparkles size={11} />
          <span>A Essência do Guia</span>
        </div>
        <p className="text-[11px] text-white/80 leading-relaxed font-sans font-medium">
          Guia de viagem de luxo sob medida e meticulosamente desenvolvido para desbravar os
          destinos paradisíacos de <strong>Jericoacoara</strong>, <strong>Preá</strong> e{' '}
          <strong>Barrinha de Baixo</strong>.
        </p>
        <p className="text-[10px] text-white/55 leading-relaxed font-sans">
          Equipado com a estética líquida <i>Glassmorphism</i> e transições inspiradas no design
          nativo Arredondados, o app oferece curadoria premium de hospedagens, cafés, picos
          ecológicos e condições de vento do momento.
        </p>
      </div>

      {isPartner && settings && (
        <div className="space-y-2">
          <h3 className="text-[9px] font-black uppercase tracking-widest text-white/50 flex items-center gap-1.5 ml-1">
            <Palette size={10} className="text-teal-400" />
            Preferências de Notificação
          </h3>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-white">Avaliações Recebidas</span>
                <span className="text-[8px] text-white/50">
                  Receber alertas de novas avaliações no seu item
                </span>
              </div>
              <button
                onClick={() => updateSetting('reviewNotifications', !settings.reviewNotifications)}
                aria-label="Alternar notificações de novas avaliações"
                className={cn(
                  'w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex items-center',
                  settings.reviewNotifications ? 'bg-teal-500' : 'bg-white/10'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-md',
                    settings.reviewNotifications ? 'translate-x-4' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-white">Vencimento de Plano</span>
                <span className="text-[8px] text-white/50">
                  Receber alertas quando o plano estiver próximo do vencimento
                </span>
              </div>
              <button
                onClick={() =>
                  updateSetting('planExpiringNotifications', !settings.planExpiringNotifications)
                }
                aria-label="Alternar notificações de vencimento de plano"
                className={cn(
                  'w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex items-center',
                  settings.planExpiringNotifications ? 'bg-teal-500' : 'bg-white/10'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-md',
                    settings.planExpiringNotifications ? 'translate-x-4' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-white/50">
        <span className="flex items-center gap-1">
          <Copyright size={8} strokeWidth={2.5} />
          2026 Use Guide
        </span>
        <span>Use Group</span>
      </div>
    </motion.div>
  );
}

=== src/domain/content/components/about/AboutLicensesTab.tsx — ARQUIVO NOVO, conteúdo completo ===
import { motion } from 'motion/react';
import { LICENSES } from '../../data/licenses';

export function AboutLicensesTab() {
  return (
    <motion.div
      key="licenses-tab"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
      className="space-y-2 text-left"
    >
      {LICENSES.map((pkg, idx) => (
        <div
          key={idx}
          className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all text-left space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white">{pkg.name}</span>
            <span className="text-[7px] font-mono font-bold bg-white/10 text-white/80 px-1.5 py-0.5 rounded-full">
              {pkg.license}
            </span>
          </div>
          <p className="text-[8px] font-mono text-white/50">{pkg.copyright}</p>
          <p className="text-[9px] text-white/60 leading-snug font-sans">{pkg.description}</p>
        </div>
      ))}
    </motion.div>
  );
}

=== src/domain/content/components/about/AboutTermsTab.tsx — ARQUIVO NOVO, conteúdo completo ===
import { motion } from 'motion/react';
import { LegalTermsDocument } from '../../../../ui/legal/LegalTermsDocument';

/** Termos de uso, compras e cancelamento, termos do parceiro e privacidade (D15). */
export function AboutTermsTab() {
  return (
    <motion.div
      key="terms-tab"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
      className="p-4 rounded-2xl bg-surface border border-line text-left"
    >
      <LegalTermsDocument />
    </motion.div>
  );
}

=== src/domain/payment/api/apiPaymentAdapter.ts — diff ===
@@ -5,6 +5,7 @@ import type {
   CreatePlanPaymentIntentPayload,
   PaidPlanId,
   PartnerPaymentAccount,
+  PartnerTermsView,
   PaymentLocale,
   PlanSubscription,
   StartPlanSubscriptionPayload,
@@ -102,6 +103,30 @@ export class ApiPaymentAdapter implements PaymentApiPort {
     return { clientSecret: data.data.clientSecret };
   }
 
+  async getPartnerTerms(): Promise<PartnerTermsView> {
+    return this.partnerTermsRequest({ method: 'GET' });
+  }
+
+  async acceptPartnerTerms(version: string): Promise<PartnerTermsView> {
+    return this.partnerTermsRequest({
+      method: 'POST',
+      headers: { 'Content-Type': 'application/json' },
+      body: JSON.stringify({ version }),
+    });
+  }
+
+  private async partnerTermsRequest(init: RequestInit): Promise<PartnerTermsView> {
+    const response = await firebaseApiFetch('/api/payment-accounts/terms', init, {
+      requireAuth: true,
+      requireAppCheck: true,
+    });
+    const data = await response.json().catch(() => ({}));
+    if (!response.ok || !data.data) {
+      throw new Error(data.error?.code ?? 'PAYMENT_ACCOUNT_UNAVAILABLE');
+    }
+    return data.data as PartnerTermsView;
+  }
+
   async startPlanSubscription(
     payload: StartPlanSubscriptionPayload
   ): Promise<StartPlanSubscriptionResponse> {

=== src/domain/payment/application/usecases/acceptPartnerTermsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { paymentApiAdapter } from '../../factory';
import type { PartnerTermsView } from '../../types/payment';

export function acceptPartnerTermsUseCase(version: string): Promise<PartnerTermsView> {
  return paymentApiAdapter.acceptPartnerTerms(version);
}

=== src/domain/payment/application/usecases/getPartnerTermsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { paymentApiAdapter } from '../../factory';
import type { PartnerTermsView } from '../../types/payment';

export function getPartnerTermsUseCase(): Promise<PartnerTermsView> {
  return paymentApiAdapter.getPartnerTerms();
}

=== src/domain/payment/components/PartnerStripeConnectPortal.test.tsx — diff ===
@@ -2,7 +2,18 @@ import { fireEvent, render, screen, waitFor } from '@testing-library/react';
 import { beforeEach, describe, expect, it, vi } from 'vitest';
 import { i18n } from '../../../shared/i18n';
 
-const m = vi.hoisted(() => ({ list: vi.fn(), embed: vi.fn() }));
+const m = vi.hoisted(() => ({
+  list: vi.fn(),
+  embed: vi.fn(),
+  terms: vi.fn(),
+  accept: vi.fn(),
+}));
+vi.mock('../application/usecases/getPartnerTermsUseCase', () => ({
+  getPartnerTermsUseCase: m.terms,
+}));
+vi.mock('../application/usecases/acceptPartnerTermsUseCase', () => ({
+  acceptPartnerTermsUseCase: m.accept,
+}));
 vi.mock('../application/usecases/listPaymentAccountsUseCase', () => ({
   listPaymentAccountsUseCase: m.list,
 }));
@@ -41,11 +52,25 @@ const NOT_STARTED = {
   account: null,
 };
 
+const PENDING_TERMS = {
+  currentVersion: '2026-10-25',
+  accepted: false,
+  acceptedAt: null,
+  fees: {
+    bookingsBps: 1500,
+    ticketsBps: 1000,
+    ticketsAbsorbedBps: 1250,
+    ticketServiceFeeMinor: 300,
+  },
+};
+const ACCEPTED_TERMS = { ...PENDING_TERMS, accepted: true, acceptedAt: '2026-10-25T15:00:00.000Z' };
+
 describe('PartnerStripeConnectPortal (D14)', () => {
   beforeEach(async () => {
     vi.clearAllMocks();
     vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_x');
     await i18n.changeLanguage('pt-BR');
+    m.terms.mockResolvedValue(ACCEPTED_TERMS);
   });
 
   it('mostra um cartão por CNPJ com o status de cada conta', async () => {
@@ -84,4 +109,20 @@ describe('PartnerStripeConnectPortal (D14)', () => {
     fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
     await waitFor(() => expect(screen.getByText('Pronta para receber')).toBeTruthy());
   });
+
+  it('sem os termos do parceiro aceitos, a conta nova não começa (D15)', async () => {
+    m.list.mockResolvedValue([NOT_STARTED]);
+    m.terms.mockResolvedValue(PENDING_TERMS);
+    m.accept.mockResolvedValue(ACCEPTED_TERMS);
+    render(<PartnerStripeConnectPortal />);
+    const start = await screen.findByRole('button', { name: /Configurar recebimentos/ });
+    expect((start as HTMLButtonElement).disabled).toBe(true);
+    const acceptButton = screen.getByRole('button', { name: 'Aceitar termos' });
+    expect((acceptButton as HTMLButtonElement).disabled).toBe(true);
+    fireEvent.click(screen.getByRole('checkbox'));
+    fireEvent.click(acceptButton);
+    await waitFor(() => expect(m.accept).toHaveBeenCalledWith('2026-10-25'));
+    expect(await screen.findByText(/Termos do parceiro aceitos em/)).toBeTruthy();
+    expect((start as HTMLButtonElement).disabled).toBe(false);
+  });
 });

=== src/domain/payment/components/PartnerStripeConnectPortal.tsx — diff ===
@@ -2,8 +2,10 @@ import { Loader2, RefreshCw } from 'lucide-react';
 import { useCallback, useEffect, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { GlassCard } from '../../../ui/components/GlassCard';
+import { getPartnerTermsUseCase } from '../application/usecases/getPartnerTermsUseCase';
 import { listPaymentAccountsUseCase } from '../application/usecases/listPaymentAccountsUseCase';
-import type { PartnerPaymentAccount } from '../types/payment';
+import type { PartnerPaymentAccount, PartnerTermsView } from '../types/payment';
+import { PartnerTermsCard } from './accounts/PartnerTermsCard';
 import { PaymentAccountCard } from './accounts/PaymentAccountCard';
 import { PaymentAccountWorkspace } from './accounts/PaymentAccountWorkspace';
 import { accountErrorKey } from './accounts/paymentAccountStatus';
@@ -15,12 +17,18 @@ export function PartnerStripeConnectPortal() {
   const [error, setError] = useState<string | null>(null);
   const [loading, setLoading] = useState(true);
   const [openKey, setOpenKey] = useState<string | null>(null);
+  const [terms, setTerms] = useState<PartnerTermsView | null>(null);
 
   const load = useCallback(async () => {
     setLoading(true);
     setError(null);
     try {
-      setAccounts(await listPaymentAccountsUseCase());
+      const [list, currentTerms] = await Promise.all([
+        listPaymentAccountsUseCase(),
+        getPartnerTermsUseCase(),
+      ]);
+      setAccounts(list);
+      setTerms(currentTerms);
     } catch (err) {
       setError(accountErrorKey(err));
     } finally {
@@ -51,6 +59,8 @@ export function PartnerStripeConnectPortal() {
         </button>
       </div>
 
+      {terms && !open && <PartnerTermsCard terms={terms} onAccepted={setTerms} />}
+
       {loading && !accounts ? (
         <p className="flex items-center gap-2 text-xs text-ink/70" role="status">
           <Loader2 size={16} className="animate-spin text-accent" aria-hidden="true" />
@@ -83,6 +93,7 @@ export function PartnerStripeConnectPortal() {
               key={entry.accountKey}
               entry={entry}
               onOpen={(selected) => setOpenKey(selected.accountKey)}
+              startBlocked={!terms?.accepted}
             />
           ))}
         </div>

=== src/domain/payment/components/accounts/PartnerTermsCard.tsx — ARQUIVO NOVO, conteúdo completo ===
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PARTNER_TERMS_VERSION } from '../../../../shared/constants/legalTerms';
import { TermsAcceptanceField } from '../../../../ui/legal/TermsAcceptanceField';
import { acceptPartnerTermsUseCase } from '../../application/usecases/acceptPartnerTermsUseCase';
import type { PartnerTermsView } from '../../types/payment';

interface PartnerTermsCardProps {
  terms: PartnerTermsView;
  onAccepted: (terms: PartnerTermsView) => void;
}

/** Aceite dos termos do parceiro antes do cadastro da conta de recebimento (D15). */
export function PartnerTermsCard({ terms, onAccepted }: PartnerTermsCardProps) {
  const { t, i18n } = useTranslation();
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  if (terms.accepted && terms.acceptedAt) {
    const date = new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'medium',
      timeZone: 'America/Fortaleza',
    }).format(new Date(terms.acceptedAt));
    return (
      <p className="flex items-center gap-2 text-xs text-ink/70">
        <CheckCircle2 size={14} className="text-success shrink-0" aria-hidden="true" />
        {t('legal.partnerTerms.accepted', { date })}
      </p>
    );
  }

  const accept = async () => {
    setSaving(true);
    setFailed(false);
    try {
      onAccepted(await acceptPartnerTermsUseCase(PARTNER_TERMS_VERSION));
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      aria-labelledby="partner-terms-title"
      className="p-4 rounded-2xl bg-warn-soft border border-warn-line space-y-3"
    >
      <h5 id="partner-terms-title" className="text-sm font-bold text-ink">
        {t('legal.partnerTerms.title')}
      </h5>
      <p className="text-xs text-ink/80">{t('legal.partnerTerms.description')}</p>
      <TermsAcceptanceField
        audience="partner"
        checked={checked}
        onChange={setChecked}
        fees={terms.fees}
        version={terms.currentVersion}
      />
      {failed && (
        <p role="alert" className="text-xs text-danger">
          {t('legal.partnerTerms.error')}
        </p>
      )}
      <button
        type="button"
        disabled={!checked || saving}
        onClick={() => void accept()}
        className="press min-h-11 px-4 rounded-xl bg-teal-400 text-slate-950 text-xs font-black disabled:opacity-50 flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        {saving && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
        {t('legal.partnerTerms.button')}
      </button>
    </section>
  );
}

=== src/domain/payment/components/accounts/PaymentAccountCard.tsx — diff ===
@@ -6,15 +6,17 @@ import { accountStatusKey, accountStatusTone } from './paymentAccountStatus';
 export function PaymentAccountCard({
   entry,
   onOpen,
+  startBlocked = false,
 }: {
   entry: PartnerPaymentAccount;
   onOpen: (entry: PartnerPaymentAccount) => void;
+  /** Sem o aceite dos termos do parceiro, a conta nova não começa (D15). */
+  startBlocked?: boolean;
 }) {
   const { t } = useTranslation();
   const status = accountStatusKey(entry);
   const dueCount = entry.account?.requirementsDueCount ?? 0;
-  const action =
-    status === 'notStarted' ? 'start' : status === 'ready' ? 'manage' : 'continue';
+  const action = status === 'notStarted' ? 'start' : status === 'ready' ? 'manage' : 'continue';
 
   return (
     <article className="p-4 rounded-2xl bg-surface border border-line space-y-3">
@@ -44,7 +46,8 @@ export function PaymentAccountCard({
       <button
         type="button"
         onClick={() => onOpen(entry)}
-        className="press w-full min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
+        disabled={startBlocked && status === 'notStarted'}
+        className="press w-full disabled:opacity-50 min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
       >
         {t(`paymentAccounts.actions.${action}`)}
         <ChevronRight size={15} aria-hidden="true" />

=== src/domain/payment/index.ts — diff ===
@@ -5,6 +5,8 @@ export { PartnerStripeConnectPortal } from './components/PartnerStripeConnectPor
 export { confirmPlanPaymentReturnUseCase } from './application/usecases/confirmPlanPaymentReturnUseCase';
 export { createPlanPaymentIntentUseCase } from './application/usecases/createPlanPaymentIntentUseCase';
 export { listPaymentAccountsUseCase } from './application/usecases/listPaymentAccountsUseCase';
+export { getPartnerTermsUseCase } from './application/usecases/getPartnerTermsUseCase';
+export { acceptPartnerTermsUseCase } from './application/usecases/acceptPartnerTermsUseCase';
 export { isPaidPlanId } from './utils/planIds';
 export type {
   CreatePaymentIntentResponse,

=== src/domain/payment/ports/paymentApiPort.ts — diff ===
@@ -3,6 +3,7 @@ import type {
   PaidPlanId,
   CreatePlanPaymentIntentPayload,
   PartnerPaymentAccount,
+  PartnerTermsView,
   PaymentLocale,
   PlanSubscription,
   StartPlanSubscriptionPayload,
@@ -16,6 +17,8 @@ export interface PaymentApiPort {
   confirmPlanPaymentReturn(params: { paymentIntentId: string }): Promise<{ status: string }>;
   listPaymentAccounts(): Promise<PartnerPaymentAccount[]>;
   createPaymentAccountSession(accountKey: string): Promise<{ clientSecret: string }>;
+  getPartnerTerms(): Promise<PartnerTermsView>;
+  acceptPartnerTerms(version: string): Promise<PartnerTermsView>;
   startPlanSubscription(
     payload: StartPlanSubscriptionPayload
   ): Promise<StartPlanSubscriptionResponse>;

=== src/domain/payment/types/payment.ts — diff ===
@@ -25,6 +25,19 @@ export interface CreatePaymentIntentResponse {
   orderStatus?: string;
 }
 
+/** Aceite dos termos do parceiro (D15) e taxas vigentes para o texto dos termos. */
+export interface PartnerTermsView {
+  currentVersion: string;
+  accepted: boolean;
+  acceptedAt: string | null;
+  fees: {
+    bookingsBps: number;
+    ticketsBps: number;
+    ticketsAbsorbedBps: number;
+    ticketServiceFeeMinor: number;
+  } | null;
+}
+
 /** Conta Stripe de um CNPJ verificado (D14); `account` é `null` antes de o parceiro iniciar o cadastro. */
 export interface PartnerPaymentAccount {
   accountKey: string;

=== src/domain/ticketing/components/EventTicketingPurchasePanel.tsx — diff ===
@@ -2,6 +2,7 @@ import { AlertCircle, Loader2, Sparkles, Ticket as TicketIcon } from 'lucide-rea
 import { useEffect, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { GlassCard } from '../../../ui/components/GlassCard';
+import { TermsAcceptanceField } from '../../../ui/legal/TermsAcceptanceField';
 import { formatMoneyMinor } from '../../../shared/utils/money';
 import { useEventOccurrences } from '../../events';
 import { useEventSalesPolicy } from '../hooks/useEventSalesPolicy';
@@ -140,12 +141,12 @@ export function EventTicketingPurchasePanel({
           {checkout.totalQuantity > 0 && (
             <GlassCard className="p-4 space-y-3">
               <TicketBuyerForm checkout={checkout} />
-              {salesPolicy && !checkout.isAllFree && (
-                <SalesPolicyNotice
-                  policy={salesPolicy}
-                  showServiceFeeNote={salesPolicy.serviceFeeMode === 'pass_to_buyer'}
-                />
-              )}
+              {salesPolicy && !checkout.isAllFree && <SalesPolicyNotice policy={salesPolicy} />}
+              <TermsAcceptanceField
+                audience="buyer"
+                checked={checkout.termsAccepted}
+                onChange={checkout.setTermsAccepted}
+              />
               <div className="flex items-center justify-between gap-3 pt-2 border-t border-line">
                 <div>
                   <span className="text-xs text-ink/70 block">
@@ -164,7 +165,7 @@ export function EventTicketingPurchasePanel({
                 </div>
                 <button
                   type="button"
-                  disabled={checkout.submitting}
+                  disabled={checkout.submitting || !checkout.termsAccepted}
                   onClick={() => void checkout.reserve()}
                   className="px-5 min-h-11 rounded-xl bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
                 >

=== src/domain/ticketing/components/checkout/SalesPolicyNotice.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TicketOrderSalesPolicySnapshot } from '../../types/ticketing';

interface SalesPolicyNoticeProps {
  policy: Pick<TicketOrderSalesPolicySnapshot, 'cancellationPolicy'>;
  /** Depois de reservar, a política mostrada é a gravada no pedido. */
  applied?: boolean;
}

/**
 * Política deste evento numa linha, antes do pagamento (AGENTS.md §8.7). O texto completo, com o
 * arrependimento e as demais regras, fica nos termos (D15).
 */
export function SalesPolicyNotice({ policy, applied }: SalesPolicyNoticeProps) {
  const { t } = useTranslation();
  const key = `salesPolicy.policies.event.${policy.cancellationPolicy}`;
  return (
    <p className="flex items-start gap-2 text-xs text-ink/80">
      <ShieldCheck size={14} className="text-accent shrink-0 mt-0.5" aria-hidden="true" />
      <span>
        <span className="font-semibold">
          {t(applied ? 'ticketCheckout.policy.appliedTitle' : 'ticketCheckout.policy.title', {
            name: t(`${key}.title`),
          })}
          :
        </span>{' '}
        {t(`${key}.description`)}
      </span>
    </p>
  );
}

=== src/domain/ticketing/components/checkout/TicketOrderPaymentStep.test.tsx — diff ===
@@ -36,12 +36,12 @@ describe('TicketOrderPaymentStep', () => {
     await i18n.changeLanguage('pt-BR');
   });
 
-  it('destaca a taxa de serviço e a política gravada antes do pagamento', async () => {
+  it('destaca a taxa de serviço e a política gravada, numa linha, antes do pagamento', async () => {
     await i18n.changeLanguage('fr');
     render(<TicketOrderPaymentStep order={ORDER} checkout={CHECKOUT} />);
     expect(screen.getByText('Frais de service')).toBeTruthy();
     expect(screen.getByText(/^6,00/)).toBeTruthy();
+    expect(screen.getByText(/Politique de cette commande \(Modérée\)/)).toBeTruthy();
     expect(screen.getByText(/jusqu’à 7 jours avant le début/)).toBeTruthy();
-    expect(screen.getByText(/ne sont remboursés qu’en cas de rétractation/)).toBeTruthy();
   });
 });

=== src/domain/ticketing/components/checkout/TicketOrderPaymentStep.tsx — diff ===
@@ -74,11 +74,7 @@ export function TicketOrderPaymentStep({ order, checkout }: TicketOrderPaymentSt
       </dl>
 
       {order.salesPolicySnapshot && (
-        <SalesPolicyNotice
-          policy={order.salesPolicySnapshot}
-          applied
-          showServiceFeeNote={serviceFeeMinor > 0}
-        />
+        <SalesPolicyNotice policy={order.salesPolicySnapshot} applied />
       )}
 
       {paymentProcessing && (

=== src/domain/ticketing/hooks/useTicketCheckout.ts — diff ===
@@ -1,6 +1,7 @@
 import QRCode from 'qrcode';
 import { useEffect, useState } from 'react';
 import { useTranslation } from 'react-i18next';
+import { BUYER_TERMS_VERSION } from '../../../shared/constants/legalTerms';
 import { useAuthContext } from '../../auth';
 import { confirmTicketOrderPaymentReturnUseCase } from '../application/usecases/confirmTicketOrderPaymentReturnUseCase';
 import { createTicketOrderPaymentIntentUseCase } from '../application/usecases/createTicketOrderPaymentIntentUseCase';
@@ -66,6 +67,7 @@ export function useTicketCheckout({
   const [buyerEmail, setBuyerEmail] = useState(initialBuyer.email || user?.email || '');
   const [holders, setHolders] = useState<Record<string, HolderDraft>>({});
   const [promoCode, setPromoCode] = useState('');
+  const [termsAccepted, setTermsAccepted] = useState(false);
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [order, setOrder] = useState<TicketOrder | null>(null);
@@ -154,6 +156,7 @@ export function useTicketCheckout({
     if (!buyerName.trim() || !buyerEmail.trim()) {
       return setError(t('ticketCheckout.errors.buyerRequired'));
     }
+    if (!termsAccepted) return setError(t('legal.accept.required'));
 
     setSubmitting(true);
     setError(null);
@@ -174,6 +177,7 @@ export function useTicketCheckout({
         buyer: { name: buyerName.trim(), email: buyerEmail.trim() },
         ...(promoCode.trim() ? { promoCode: promoCode.trim().toUpperCase() } : {}),
         idempotencyKey: `ord_${occurrenceId}_${user.uid}_${crypto.randomUUID()}`,
+        acceptedTermsVersion: BUYER_TERMS_VERSION,
       });
       setOrder(result.order);
       setServerNow(result.serverNow || new Date().toISOString());
@@ -252,6 +256,8 @@ export function useTicketCheckout({
       setHolders((prev) => ({ ...prev, [key]: holder })),
     promoCode,
     setPromoCode,
+    termsAccepted,
+    setTermsAccepted,
     submitting,
     error,
     setError,

=== src/domain/ticketing/ports/ticketingPort.ts — diff ===
@@ -76,6 +76,7 @@ export interface TicketingPort {
     buyer: { name: string; email: string };
     promoCode?: string;
     idempotencyKey: string;
+    acceptedTermsVersion: string;
   }): Promise<CreateOrderResult>;
   createOrderPaymentIntent(
     orderId: string,

=== src/shared/constants/legalTerms.ts — ARQUIVO NOVO, conteúdo completo ===
/** Igual a server/shared/kernel/legalTerms.ts (D15), com teste de paridade. */
export const BUYER_TERMS_VERSION = '2026-10-25';
export const PARTNER_TERMS_VERSION = '2026-10-25';

=== src/shared/i18n/bookingsResources.ts — diff ===
@@ -171,6 +171,7 @@ export interface BookingsTranslation {
     LATE_PAYMENT_REJECTED: string;
     KIND_NOT_AVAILABLE: string;
     CANCELLATION_NOT_ALLOWED: string;
+    TERMS_NOT_ACCEPTED: string;
     SELLER_ACCOUNT_NOT_ELIGIBLE: string;
     INTERNAL_ERROR: string;
   };
@@ -352,6 +353,7 @@ export const bookingsPtBR: BookingsTranslation = {
     LATE_PAYMENT_REJECTED: 'O pagamento chegou depois do prazo e será devolvido.',
     KIND_NOT_AVAILABLE: 'Este tipo de oferta ainda não está disponível.',
     CANCELLATION_NOT_ALLOWED: 'Esta reserva não pode ser cancelada.',
+    TERMS_NOT_ACCEPTED: 'Aceite os termos para continuar.',
     SELLER_ACCOUNT_NOT_ELIGIBLE: 'O parceiro ainda não pode receber pagamentos online.',
     INTERNAL_ERROR: 'Algo deu errado. Tente novamente em instantes.',
   },
@@ -530,6 +532,7 @@ export const bookingsEn: BookingsTranslation = {
     LATE_PAYMENT_REJECTED: 'The payment arrived after the deadline and will be refunded.',
     KIND_NOT_AVAILABLE: 'This kind of offer is not available yet.',
     CANCELLATION_NOT_ALLOWED: 'This booking cannot be canceled.',
+    TERMS_NOT_ACCEPTED: 'Accept the terms to continue.',
     SELLER_ACCOUNT_NOT_ELIGIBLE: 'This partner cannot receive online payments yet.',
     INTERNAL_ERROR: 'Something went wrong. Please try again shortly.',
   },
@@ -713,6 +716,7 @@ export const bookingsFr: BookingsTranslation = {
     LATE_PAYMENT_REJECTED: 'Le paiement est arrivé après le délai et sera remboursé.',
     KIND_NOT_AVAILABLE: 'Ce type d’offre n’est pas encore disponible.',
     CANCELLATION_NOT_ALLOWED: 'Cette réservation ne peut pas être annulée.',
+    TERMS_NOT_ACCEPTED: 'Acceptez les conditions pour continuer.',
     SELLER_ACCOUNT_NOT_ELIGIBLE: 'Ce partenaire ne peut pas encore recevoir de paiements en ligne.',
     INTERNAL_ERROR: 'Un problème est survenu. Réessayez dans un instant.',
   },

=== src/shared/i18n/legalResources.ts — ARQUIVO NOVO, conteúdo completo ===
/**
 * Termos e políticas da plataforma (D15). pt-BR é a fonte e a versão que vale; mudou o texto, muda
 * BUYER_TERMS_VERSION ou PARTNER_TERMS_VERSION. Precisa de validação jurídica antes das chaves live (D14).
 */
interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalTranslation {
  title: string;
  version: string;
  prevailing: string;
  use: LegalSection;
  purchases: LegalSection & {
    policiesTitle: string;
    families: { event: string; booking: string; transfer: string };
  };
  partner: LegalSection & { feesWithValues: string; feesGeneric: string };
  privacy: LegalSection;
  accept: { buyer: string; partner: string; required: string; close: string };
  partnerTerms: {
    title: string;
    description: string;
    button: string;
    accepted: string;
    error: string;
  };
  about: { title: string; back: string; general: string; licenses: string; terms: string };
}

export const legalPtBR: LegalTranslation = {
  title: 'Termos e políticas',
  version: 'Versão de {{date}}',
  prevailing: 'Em caso de divergência entre idiomas, vale a versão em português.',
  use: {
    title: 'Termos de uso',
    paragraphs: [
      'Ao usar o Use Guide, você concorda com estes termos e com a política de privacidade abaixo. Se não concordar, não use o aplicativo.',
      'O Use Guide reúne informações, mapas e recomendações sobre Jericoacoara, Preá e Barrinha de Baixo, e vende ingressos, passeios e entradas de organizadores e estabelecimentos cadastrados.',
      'Você deve informar dados verdadeiros e manter suas credenciais em sigilo. A conta é pessoal e intransferível.',
      'É proibido usar o aplicativo para atividades ilegais, copiar ou distribuir o conteúdo sem autorização e tentar acessar áreas restritas.',
      'As informações de rotas, trilhas e condições do tempo são orientativas. Avalie os riscos antes de seguir uma rota sugerida.',
      'O aplicativo usa serviços de terceiros, como Google Maps, Firebase e Stripe, sujeitos às regras desses serviços.',
      'Estes termos podem mudar. Compras e vendas novas pedem o aceite da versão atual; o seu pedido segue a versão que você aceitou.',
      'Dúvidas: ajuda@useguide.com.br.',
    ],
  },
  purchases: {
    title: 'Compras, cancelamento e reembolso',
    paragraphs: [
      'Você paga ao Use Guide, que repassa o valor ao organizador depois do serviço.',
      'Antes do pagamento aparecem o total e a taxa de serviço destacada. A taxa de serviço remunera a plataforma.',
      'Cada organizador escolhe uma das políticas de cancelamento da plataforma, listadas abaixo. A política escolhida aparece antes do pagamento e fica gravada no pedido: mudanças posteriores no anúncio não alteram o seu pedido.',
      'Direito de arrependimento (Código de Defesa do Consumidor, art. 49): cancelando em até 7 dias da compra e até 48 horas antes do início, o reembolso é integral, inclusive a taxa de serviço, quando houver.',
      'Fora desse prazo vale a política do pedido, e a taxa de serviço não é devolvida. Depois do início, ou se você não comparecer, não há reembolso.',
      'Cancelamento pelo organizador: reembolso integral, inclusive a taxa de serviço. Em caso de força maior comprovada, o organizador pode oferecer uma nova data; se você não aceitar, recebe o reembolso integral.',
      'O reembolso volta pelo mesmo meio de pagamento usado na compra.',
      'Transferência de ingresso: permitida quando o organizador autoriza, até o prazo informado no pedido.',
      'Se você contestar a compra no cartão, o pedido fica suspenso até a decisão.',
    ],
    policiesTitle: 'Políticas de cancelamento da plataforma',
    families: {
      event: 'Eventos',
      booking: 'Passeios, aluguéis e entradas',
      transfer: 'Translados (Código Civil, art. 740)',
    },
  },
  partner: {
    title: 'Termos do parceiro',
    paragraphs: [
      'Cada CNPJ verificado recebe numa conta própria no Stripe, e cada estabelecimento vende pela conta do seu CNPJ. CPF não vende.',
      'As tarifas do Stripe são pagas pela plataforma. Num reembolso parcial, a taxa da plataforma incide sobre o valor que você fica.',
      'Repasse: o valor de cada venda é transferido 48 horas depois do fim do serviço. Uma reclamação aberta nesse prazo suspende o repasse daquela venda por até 5 dias.',
      'Política de cancelamento: você escolhe uma das opções da plataforma. Depois de publicar, só pode trocar por uma opção mais flexível. O direito de arrependimento do comprador vale sempre.',
      'Cancelamento pelo proprietário: os compradores recebem reembolso integral, inclusive a taxa de serviço, pago pela plataforma antes do repasse. Você paga multa de 20% sobre o valor vendido (sem as taxas de serviço), no cartão ou por Pix, em até 24 horas. Sem pagamento, a multa é descontada dos repasses pendentes e futuros do CNPJ, que fica bloqueado para novas vendas até quitar.',
      'Força maior comprovada: a primeira solução é remarcar. Quem não aceitar a nova data recebe reembolso integral, sem multa para você.',
      'Contestação no cartão: com prova de uso (check-in), a plataforma contesta e arca com o resultado. Sem prova, o valor contestado vira dívida do CNPJ.',
    ],
    feesWithValues:
      'Taxa da plataforma: {{bookings}} nas reservas (passeios, aluguéis, translados e entradas). Nos ingressos, {{tickets}} mais a taxa de serviço de {{serviceFee}} por ingresso pago, cobrada do comprador; ou {{absorbed}} quando você absorve a taxa de serviço.',
    feesGeneric:
      'Taxa da plataforma: os percentuais vigentes aparecem em Recebimentos, no painel do parceiro, antes do aceite destes termos.',
  },
  privacy: {
    title: 'Privacidade de dados',
    paragraphs: [
      'Coletamos só o necessário, como nome, e-mail, localização e dados de uso, com o seu consentimento, para oferecer uma experiência personalizada (Lei 13.709/2018, LGPD).',
      'Usamos os dados para mostrar lugares e produtos, personalizar recomendações, melhorar o desempenho e a segurança e enviar notificações.',
      'Serviços de terceiros, como os do Google e o Stripe, seguem regras de privacidade próprias e compatíveis com a LGPD. Dados de cartão ficam no Stripe e nunca passam pelo Use Guide.',
      'Os dados ficam em servidores protegidos por criptografia e são acessados só por pessoas autorizadas.',
      'Você pode pedir acesso, correção ou exclusão dos seus dados pelo e-mail ajuda@useguide.com.br. Registros de compra são anonimizados, e não apagados, pelo prazo legal.',
    ],
  },
  accept: {
    buyer: 'Li e aceito os <terms>termos e a política de cancelamento</terms>',
    partner: 'Li e aceito os <terms>termos do parceiro</terms>',
    required: 'Aceite os termos para continuar.',
    close: 'Fechar',
  },
  partnerTerms: {
    title: 'Termos do parceiro',
    description:
      'Antes de cadastrar a conta de recebimento, leia e aceite as regras de taxa, repasse, cancelamento e multa.',
    button: 'Aceitar termos',
    accepted: 'Termos do parceiro aceitos em {{date}}.',
    error: 'Não foi possível registrar o aceite. Tente de novo.',
  },
  about: {
    title: 'Sobre o app',
    back: 'Voltar',
    general: 'Geral',
    licenses: 'Licenças',
    terms: 'Termos',
  },
};

export const legalEn: LegalTranslation = {
  title: 'Terms and policies',
  version: 'Version of {{date}}',
  prevailing: 'If the languages differ, the Portuguese version prevails.',
  use: {
    title: 'Terms of use',
    paragraphs: [
      'By using Use Guide, you agree to these terms and to the privacy policy below. If you do not agree, do not use the app.',
      'Use Guide brings together information, maps and tips about Jericoacoara, Preá and Barrinha de Baixo, and sells tickets, tours and entries from registered organizers and businesses.',
      'You must provide true information and keep your credentials secret. Your account is personal and non-transferable.',
      'You may not use the app for illegal activities, copy or distribute its content without permission, or try to access restricted areas.',
      'Route, trail and weather information is for guidance only. Assess the risks before following a suggested route.',
      'The app uses third-party services such as Google Maps, Firebase and Stripe, subject to their own rules.',
      'These terms may change. New purchases and sales require accepting the current version; your order follows the version you accepted.',
      'Questions: ajuda@useguide.com.br.',
    ],
  },
  purchases: {
    title: 'Purchases, cancellation and refunds',
    paragraphs: [
      'You pay Use Guide, which passes the amount on to the organizer after the service.',
      'Before payment you see the total with the service fee shown separately. The service fee pays the platform.',
      'Each organizer chooses one of the platform cancellation policies listed below. The chosen policy is shown before payment and saved with the order: later changes to the listing do not affect your order.',
      'Right of withdrawal (Brazilian Consumer Code, art. 49): if you cancel within 7 days of purchase and at least 48 hours before the start, you get a full refund, including any service fee.',
      'Outside that window the order policy applies and the service fee is not refunded. After the start, or if you do not show up, there is no refund.',
      'Cancellation by the organizer: full refund, service fee included. In proven force majeure, the organizer may offer a new date; if you do not accept it, you get a full refund.',
      'Refunds go back to the payment method used for the purchase.',
      'Ticket transfer: allowed when the organizer permits it, up to the deadline shown on the order.',
      'If you dispute the purchase with your card issuer, the order is suspended until the decision.',
    ],
    policiesTitle: 'Platform cancellation policies',
    families: {
      event: 'Events',
      booking: 'Tours, rentals and entries',
      transfer: 'Transfers (Brazilian Civil Code, art. 740)',
    },
  },
  partner: {
    title: 'Partner terms',
    paragraphs: [
      'Each verified CNPJ receives into its own Stripe account, and each business sells through the account of its CNPJ. Individual CPFs do not sell.',
      'Stripe fees are paid by the platform. On a partial refund, the platform fee applies to the amount you keep.',
      'Payouts: the amount of each sale is transferred 48 hours after the service ends. A complaint opened in that window holds that sale’s payout for up to 5 days.',
      'Cancellation policy: you choose one of the platform options. After publishing, you can only switch to a more flexible option. The buyer’s right of withdrawal always applies.',
      'Cancellation by the owner: buyers get a full refund, service fee included, paid by the platform before the payout. You pay a penalty of 20% of the amount sold (excluding service fees), by card or Pix, within 24 hours. If unpaid, the penalty is deducted from the CNPJ’s pending and future payouts, and the CNPJ is blocked from new sales until it is settled.',
      'Proven force majeure: the first solution is rescheduling. Buyers who do not accept the new date get a full refund, with no penalty for you.',
      'Card disputes: with proof of use (check-in), the platform contests and bears the outcome. Without proof, the disputed amount becomes a debt of the CNPJ.',
    ],
    feesWithValues:
      'Platform fee: {{bookings}} on bookings (tours, rentals, transfers and entries). On tickets, {{tickets}} plus a service fee of {{serviceFee}} per paid ticket, charged to the buyer; or {{absorbed}} when you absorb the service fee.',
    feesGeneric:
      'Platform fee: the current rates are shown under Payouts, in the partner panel, before you accept these terms.',
  },
  privacy: {
    title: 'Data privacy',
    paragraphs: [
      'We collect only what is needed, such as name, email, location and usage data, with your consent, to offer a personalized experience (Brazilian Law 13.709/2018, LGPD).',
      'We use the data to show places and products, personalize recommendations, improve performance and security, and send notifications.',
      'Third-party services such as Google and Stripe follow their own privacy rules, compatible with the LGPD. Card data stays with Stripe and never passes through Use Guide.',
      'Data is stored on servers protected by encryption and accessed only by authorized people.',
      'You can request access to, correction of or deletion of your data at ajuda@useguide.com.br. Purchase records are anonymized, not deleted, for the legal period.',
    ],
  },
  accept: {
    buyer: 'I have read and accept the <terms>terms and cancellation policy</terms>',
    partner: 'I have read and accept the <terms>partner terms</terms>',
    required: 'Accept the terms to continue.',
    close: 'Close',
  },
  partnerTerms: {
    title: 'Partner terms',
    description:
      'Before setting up your payout account, read and accept the rules on fees, payouts, cancellations and penalties.',
    button: 'Accept terms',
    accepted: 'Partner terms accepted on {{date}}.',
    error: 'Could not record your acceptance. Try again.',
  },
  about: {
    title: 'About the app',
    back: 'Back',
    general: 'General',
    licenses: 'Licenses',
    terms: 'Terms',
  },
};

export const legalFr: LegalTranslation = {
  title: 'Conditions et politiques',
  version: 'Version du {{date}}',
  prevailing: 'En cas de divergence entre les langues, la version portugaise prévaut.',
  use: {
    title: 'Conditions d’utilisation',
    paragraphs: [
      'En utilisant Use Guide, vous acceptez ces conditions et la politique de confidentialité ci-dessous. Si vous n’êtes pas d’accord, n’utilisez pas l’application.',
      'Use Guide rassemble des informations, des cartes et des conseils sur Jericoacoara, Preá et Barrinha de Baixo, et vend des billets, des excursions et des entrées d’organisateurs et d’établissements inscrits.',
      'Vous devez fournir des informations exactes et garder vos identifiants secrets. Le compte est personnel et non transférable.',
      'Il est interdit d’utiliser l’application pour des activités illégales, de copier ou diffuser son contenu sans autorisation et de tenter d’accéder à des zones restreintes.',
      'Les informations sur les itinéraires, les sentiers et la météo sont indicatives. Évaluez les risques avant de suivre un itinéraire proposé.',
      'L’application utilise des services tiers, comme Google Maps, Firebase et Stripe, soumis à leurs propres règles.',
      'Ces conditions peuvent changer. Les nouveaux achats et ventes demandent l’acceptation de la version actuelle ; votre commande suit la version que vous avez acceptée.',
      'Questions : ajuda@useguide.com.br.',
    ],
  },
  purchases: {
    title: 'Achats, annulation et remboursement',
    paragraphs: [
      'Vous payez Use Guide, qui reverse le montant à l’organisateur après la prestation.',
      'Avant le paiement, le total s’affiche avec les frais de service séparés. Les frais de service rémunèrent la plateforme.',
      'Chaque organisateur choisit l’une des politiques d’annulation de la plateforme, listées ci-dessous. La politique choisie s’affiche avant le paiement et est enregistrée avec la commande : les modifications ultérieures de l’annonce ne changent pas votre commande.',
      'Droit de rétractation (Code brésilien de la consommation, art. 49) : en annulant dans les 7 jours suivant l’achat et au moins 48 heures avant le début, le remboursement est intégral, frais de service éventuels compris.',
      'En dehors de ce délai, la politique de la commande s’applique et les frais de service ne sont pas remboursés. Après le début, ou en cas d’absence, il n’y a pas de remboursement.',
      'Annulation par l’organisateur : remboursement intégral, frais de service compris. En cas de force majeure prouvée, l’organisateur peut proposer une nouvelle date ; si vous ne l’acceptez pas, vous êtes remboursé intégralement.',
      'Le remboursement est effectué sur le moyen de paiement utilisé pour l’achat.',
      'Transfert de billet : autorisé lorsque l’organisateur le permet, jusqu’au délai indiqué sur la commande.',
      'Si vous contestez l’achat auprès de votre banque, la commande est suspendue jusqu’à la décision.',
    ],
    policiesTitle: 'Politiques d’annulation de la plateforme',
    families: {
      event: 'Événements',
      booking: 'Excursions, locations et entrées',
      transfer: 'Transferts (Code civil brésilien, art. 740)',
    },
  },
  partner: {
    title: 'Conditions du partenaire',
    paragraphs: [
      'Chaque CNPJ vérifié reçoit sur son propre compte Stripe, et chaque établissement vend via le compte de son CNPJ. Les CPF ne vendent pas.',
      'Les frais Stripe sont pris en charge par la plateforme. En cas de remboursement partiel, la commission de la plateforme porte sur le montant que vous conservez.',
      'Versement : le montant de chaque vente est transféré 48 heures après la fin de la prestation. Une réclamation ouverte dans ce délai suspend le versement de cette vente jusqu’à 5 jours.',
      'Politique d’annulation : vous choisissez l’une des options de la plateforme. Après la publication, vous ne pouvez passer qu’à une option plus flexible. Le droit de rétractation de l’acheteur s’applique toujours.',
      'Annulation par le propriétaire : les acheteurs sont remboursés intégralement, frais de service compris, par la plateforme avant le versement. Vous payez une pénalité de 20 % du montant vendu (hors frais de service), par carte ou Pix, sous 24 heures. À défaut, la pénalité est déduite des versements en attente et futurs du CNPJ, qui est bloqué pour de nouvelles ventes jusqu’au paiement.',
      'Force majeure prouvée : la première solution est le report. Les acheteurs qui n’acceptent pas la nouvelle date sont remboursés intégralement, sans pénalité pour vous.',
      'Contestations de carte : avec une preuve d’utilisation (check-in), la plateforme conteste et assume le résultat. Sans preuve, le montant contesté devient une dette du CNPJ.',
    ],
    feesWithValues:
      'Commission de la plateforme : {{bookings}} sur les réservations (excursions, locations, transferts et entrées). Sur les billets, {{tickets}} plus des frais de service de {{serviceFee}} par billet payant, facturés à l’acheteur ; ou {{absorbed}} lorsque vous prenez les frais de service en charge.',
    feesGeneric:
      'Commission de la plateforme : les taux en vigueur s’affichent dans Versements, sur le panneau du partenaire, avant l’acceptation de ces conditions.',
  },
  privacy: {
    title: 'Confidentialité des données',
    paragraphs: [
      'Nous ne collectons que le nécessaire, comme le nom, l’e-mail, la localisation et les données d’utilisation, avec votre consentement, pour offrir une expérience personnalisée (loi brésilienne 13.709/2018, LGPD).',
      'Nous utilisons ces données pour afficher des lieux et des produits, personnaliser les recommandations, améliorer les performances et la sécurité et envoyer des notifications.',
      'Les services tiers, comme Google et Stripe, suivent leurs propres règles de confidentialité, compatibles avec la LGPD. Les données de carte restent chez Stripe et ne passent jamais par Use Guide.',
      'Les données sont stockées sur des serveurs protégés par chiffrement et consultées uniquement par des personnes autorisées.',
      'Vous pouvez demander l’accès, la correction ou la suppression de vos données à ajuda@useguide.com.br. Les données d’achat sont anonymisées, et non supprimées, pendant la durée légale.',
    ],
  },
  accept: {
    buyer: 'J’ai lu et j’accepte les <terms>conditions et la politique d’annulation</terms>',
    partner: 'J’ai lu et j’accepte les <terms>conditions du partenaire</terms>',
    required: 'Acceptez les conditions pour continuer.',
    close: 'Fermer',
  },
  partnerTerms: {
    title: 'Conditions du partenaire',
    description:
      'Avant de configurer votre compte de versement, lisez et acceptez les règles sur les commissions, versements, annulations et pénalités.',
    button: 'Accepter les conditions',
    accepted: 'Conditions du partenaire acceptées le {{date}}.',
    error: 'Impossible d’enregistrer votre acceptation. Réessayez.',
  },
  about: {
    title: 'À propos',
    back: 'Retour',
    general: 'Général',
    licenses: 'Licences',
    terms: 'Conditions',
  },
};

=== src/shared/i18n/resources.ts — diff ===
@@ -46,6 +46,7 @@ import {
   ticketWalletFr,
   ticketWalletPtBR,
 } from './ticketWalletResources';
+import { type LegalTranslation, legalEn, legalFr, legalPtBR } from './legalResources';
 import {
   type VerificationTranslation,
   verificationEn,
@@ -62,6 +63,7 @@ export interface TranslationResource {
   salesPolicy: SalesPolicyTranslation;
   ticketCheckout: TicketCheckoutTranslation;
   ticketWallet: TicketWalletTranslation;
+  legal: LegalTranslation;
   verification: VerificationTranslation;
   common: {
     language: string;
@@ -285,6 +287,7 @@ const ptBR: TranslationResource = {
   salesPolicy: salesPolicyPtBR,
   ticketCheckout: ticketCheckoutPtBR,
   ticketWallet: ticketWalletPtBR,
+  legal: legalPtBR,
   verification: verificationPtBR,
   common: {
     language: 'Idioma',
@@ -558,6 +561,7 @@ const en: TranslationResource = {
   salesPolicy: salesPolicyEn,
   ticketCheckout: ticketCheckoutEn,
   ticketWallet: ticketWalletEn,
+  legal: legalEn,
   verification: verificationEn,
   common: {
     language: 'Language',
@@ -825,6 +829,7 @@ const fr: TranslationResource = {
   salesPolicy: salesPolicyFr,
   ticketCheckout: ticketCheckoutFr,
   ticketWallet: ticketWalletFr,
+  legal: legalFr,
   verification: verificationFr,
   common: {
     language: 'Langue',

=== src/shared/i18n/ticketCheckoutResources.ts — diff ===
@@ -21,8 +21,6 @@ export interface TicketCheckoutTranslation {
   policy: {
     title: string;
     appliedTitle: string;
-    transferAllowed: string;
-    transferDisabled: string;
   };
   ticketCount_one: string;
   ticketCount_other: string;
@@ -92,10 +90,8 @@ export const ticketCheckoutPtBR: TicketCheckoutTranslation = {
   },
   promoCode: 'Cupom promocional (opcional)',
   policy: {
-    title: 'Cancelamento e transferência',
-    appliedTitle: 'Política aplicada a este pedido',
-    transferAllowed: 'Transferência de titularidade permitida até {{hours}} h antes do início.',
-    transferDisabled: 'Transferência de titularidade não habilitada para este evento.',
+    title: 'Política {{name}}',
+    appliedTitle: 'Política deste pedido ({{name}})',
   },
   ticketCount_one: '{{count}} ingresso',
   ticketCount_other: '{{count}} ingressos',
@@ -165,10 +161,8 @@ export const ticketCheckoutEn: TicketCheckoutTranslation = {
   },
   promoCode: 'Promo code (optional)',
   policy: {
-    title: 'Cancellation and transfer',
-    appliedTitle: 'Policy applied to this order',
-    transferAllowed: 'Ticket transfer allowed up to {{hours}} h before the start.',
-    transferDisabled: 'Ticket transfer is not enabled for this event.',
+    title: '{{name}} policy',
+    appliedTitle: 'Policy for this order ({{name}})',
   },
   ticketCount_one: '{{count}} ticket',
   ticketCount_other: '{{count}} tickets',
@@ -238,10 +232,8 @@ export const ticketCheckoutFr: TicketCheckoutTranslation = {
   },
   promoCode: 'Code promo (facultatif)',
   policy: {
-    title: 'Annulation et transfert',
-    appliedTitle: 'Politique appliquée à cette commande',
-    transferAllowed: 'Transfert du billet autorisé jusqu’à {{hours}} h avant le début.',
-    transferDisabled: 'Le transfert de billet n’est pas activé pour cet événement.',
+    title: 'Politique {{name}}',
+    appliedTitle: 'Politique de cette commande ({{name}})',
   },
   ticketCount_one: '{{count}} billet',
   ticketCount_other: '{{count}} billets',

=== src/ui/components/Dialog.tsx — diff ===
@@ -11,6 +11,8 @@ interface DialogProps {
   description?: string;
   children: ReactNode;
   className?: string;
+  /** Aberto por cima de outro modal (ex.: termos dentro do checkout). */
+  nested?: boolean;
 }
 
 export function Dialog({
@@ -20,13 +22,14 @@ export function Dialog({
   description,
   children,
   className,
+  nested = false,
 }: DialogProps) {
   return (
     <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
       <RadixDialog.Portal>
         <RadixDialog.Overlay
           className="fixed inset-0 bg-scrim backdrop-blur-md animate-fade-in data-[state=closed]:animate-fade-out motion-reduce:animate-none"
-          style={{ zIndex: Z_INDEX.overlay }}
+          style={{ zIndex: nested ? Z_INDEX.modalNested : Z_INDEX.overlay }}
         />
         {/* Celular: folha que sobe da borda (como num app nativo). Do sm em diante: cartão central. */}
         <RadixDialog.Content
@@ -35,7 +38,7 @@ export function Dialog({
             'sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[calc(100%-2rem)] sm:pb-6 sm:rounded-3xl sm:animate-scale-in sm:data-[state=closed]:animate-scale-out',
             className
           )}
-          style={{ zIndex: Z_INDEX.modal }}
+          style={{ zIndex: nested ? Z_INDEX.modalNested : Z_INDEX.modal }}
           // O Radix foca o primeiro controle (o botão fechar) e o anel de foco aparece sem o usuário usar o teclado.
           // Focar a própria folha mantém o Tab e o leitor de tela começando dentro do diálogo.
           onOpenAutoFocus={(event) => {

=== src/ui/legal/LegalTermsDocument.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../shared/utils/money';
import { type CancellationPolicyFamily, policiesOf } from '../../shared/utils/cancellationPolicy';
import { BUYER_TERMS_VERSION } from '../../shared/constants/legalTerms';

export type LegalSectionKey = 'use' | 'purchases' | 'partner' | 'privacy';

export interface PlatformFeesView {
  bookingsBps: number;
  ticketsBps: number;
  ticketsAbsorbedBps: number;
  ticketServiceFeeMinor: number;
}

interface LegalTermsDocumentProps {
  sections?: LegalSectionKey[];
  /** Rola até esta seção ao abrir (ex.: o link do checkout abre direto no cancelamento). */
  focusSection?: LegalSectionKey;
  /** Taxas vigentes vindas do backend; sem elas, o texto aponta para o painel de recebimentos. */
  fees?: PlatformFeesView | null;
  version?: string;
}

const FAMILIES: CancellationPolicyFamily[] = ['event', 'booking', 'transfer'];
const ALL_SECTIONS: LegalSectionKey[] = ['use', 'purchases', 'partner', 'privacy'];

/** Termos e políticas da plataforma (D15), o mesmo texto em Sobre o app e nos diálogos de aceite. */
export function LegalTermsDocument({
  sections = ALL_SECTIONS,
  focusSection,
  fees,
  version = BUYER_TERMS_VERSION,
}: LegalTermsDocumentProps) {
  const { t, i18n } = useTranslation();
  const focusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    focusRef.current?.scrollIntoView?.({ block: 'start' });
  }, []);

  const percent = (bps: number) =>
    new Intl.NumberFormat(i18n.language, { style: 'percent', maximumFractionDigits: 2 }).format(
      bps / 10_000
    );
  const paragraphs = (key: LegalSectionKey) =>
    t(`legal.${key}.paragraphs`, { returnObjects: true }) as unknown as string[];
  const date = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'long',
    timeZone: 'America/Fortaleza',
  }).format(new Date(`${version}T12:00:00-03:00`));

  return (
    <article className="space-y-6 text-sm text-ink/80 leading-relaxed">
      <header className="space-y-1">
        <p className="text-xs text-ink/70">{t('legal.version', { date })}</p>
        <p className="text-xs text-ink/70">{t('legal.prevailing')}</p>
      </header>
      {sections.map((key) => (
        <section
          key={key}
          id={`legal-${key}`}
          ref={key === focusSection ? focusRef : undefined}
          aria-labelledby={`legal-${key}-title`}
          className="space-y-2 scroll-mt-4"
        >
          <h3 id={`legal-${key}-title`} className="text-base font-bold text-ink">
            {t(`legal.${key}.title`)}
          </h3>
          {key === 'partner' && (
            <p>
              {fees
                ? t('legal.partner.feesWithValues', {
                    bookings: percent(fees.bookingsBps),
                    tickets: percent(fees.ticketsBps),
                    absorbed: percent(fees.ticketsAbsorbedBps),
                    serviceFee: formatMoneyMinor(fees.ticketServiceFeeMinor, i18n.language),
                  })
                : t('legal.partner.feesGeneric')}
            </p>
          )}
          {paragraphs(key).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {key === 'purchases' && (
            <div className="space-y-3 pt-1">
              <h4 className="text-sm font-bold text-ink">{t('legal.purchases.policiesTitle')}</h4>
              {FAMILIES.map((family) => (
                <div key={family} className="space-y-1">
                  <p className="text-xs font-semibold text-ink">
                    {t(`legal.purchases.families.${family}`)}
                  </p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {policiesOf(family).map((policy) => (
                      <li key={policy}>
                        <span className="font-semibold">
                          {t(`salesPolicy.policies.${family}.${policy}.title`)}:
                        </span>{' '}
                        {t(`salesPolicy.policies.${family}.${policy}.description`)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </article>
  );
}

=== src/ui/legal/TermsAcceptanceField.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../shared/i18n';
import { TermsAcceptanceField } from './TermsAcceptanceField';

describe('TermsAcceptanceField (D15)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('o link abre os termos sem marcar a caixa; marcar avisa o formulário', () => {
    const onChange = vi.fn();
    render(<TermsAcceptanceField audience="buyer" checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'termos e a política de cancelamento' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Compras, cancelamento e reembolso')).toBeTruthy();
    expect(screen.getAllByText(/Direito de arrependimento/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('termos do parceiro mostram as taxas vindas do backend', () => {
    render(
      <TermsAcceptanceField
        audience="partner"
        checked={false}
        onChange={() => {}}
        fees={{
          bookingsBps: 1500,
          ticketsBps: 1000,
          ticketsAbsorbedBps: 1250,
          ticketServiceFeeMinor: 300,
        }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'termos do parceiro' }));
    expect(screen.getByText(/15% nas reservas/)).toBeTruthy();
    expect(screen.getByText(/R\$\s3,00 por ingresso pago/)).toBeTruthy();
    expect(screen.getByText(/multa de 20%/)).toBeTruthy();
  });
});

=== src/ui/legal/TermsAcceptanceField.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Dialog } from '../components/Dialog';
import {
  type LegalSectionKey,
  LegalTermsDocument,
  type PlatformFeesView,
} from './LegalTermsDocument';

interface TermsAcceptanceFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  audience: 'buyer' | 'partner';
  fees?: PlatformFeesView | null;
  version?: string;
}

const SECTIONS: Record<
  'buyer' | 'partner',
  { sections: LegalSectionKey[]; focus: LegalSectionKey }
> = {
  buyer: { sections: ['purchases', 'use', 'privacy'], focus: 'purchases' },
  partner: { sections: ['partner', 'purchases'], focus: 'partner' },
};

/** Caixa de aceite com link para os termos, abertos num diálogo sem sair da tela (D15). */
export function TermsAcceptanceField({
  checked,
  onChange,
  audience,
  fees,
  version,
}: TermsAcceptanceFieldProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const config = SECTIONS[audience];
  return (
    <>
      <label className="flex items-start gap-3 min-h-11 text-xs text-ink/80 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 w-5 h-5 shrink-0 accent-teal-400"
        />
        <span>
          <Trans
            i18nKey={`legal.accept.${audience}`}
            // `link` é elemento vazio do HTML e perderia o texto; por isso a tag se chama `terms`.
            components={{
              terms: (
                <button
                  type="button"
                  onClick={(event) => {
                    // O link fica dentro do rótulo: abrir os termos não pode marcar a caixa.
                    event.preventDefault();
                    setOpen(true);
                  }}
                  className="text-accent font-semibold underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded"
                />
              ),
            }}
          />
        </span>
      </label>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={t('legal.title')}
        nested
        className="sm:max-w-lg"
      >
        <LegalTermsDocument
          sections={config.sections}
          focusSection={config.focus}
          fees={fees}
          version={version}
        />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="press mt-6 w-full min-h-11 rounded-xl bg-surface border border-line text-sm font-semibold text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {t('legal.accept.close')}
        </button>
      </Dialog>
    </>
  );
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/application/usecases/bookings/bookingApplicationUseCases.test.ts server/application/usecases/paymentAccounts/acceptPartnerTermsApplicationUseCase.ts server/application/usecases/paymentAccounts/getPartnerTermsApplicationUseCase.ts server/application/usecases/paymentAccounts/paymentAccountApplicationUseCases.test.ts server/application/usecases/paymentAccounts/startPaymentAccountSessionApplicationUseCase.ts server/domain/bookings/errors/bookingDomainError.ts server/domain/bookings/services/bookingService.test.ts server/domain/bookings/services/bookingService.ts server/domain/bookings/types/bookingTypes.ts server/domain/partners/adapters/firestorePartnerAdapter.ts server/domain/partners/errors/partnerDomainError.ts server/domain/partners/index.ts server/domain/partners/ports/partnerPort.ts server/domain/partners/services/partnerService.test.ts server/domain/partners/services/partnerService.ts server/domain/partners/usecases/acceptPartnerTermsUseCase.ts server/domain/partners/usecases/assertPartnerTermsAcceptedUseCase.ts server/domain/partners/usecases/getPartnerTermsStatusUseCase.ts server/domain/ticketing/adapters/firestoreOrderReservationStore.ts server/domain/ticketing/dtos/ticketingPersistenceMappers.ts server/domain/ticketing/ports/ticketingPort.ts server/domain/ticketing/schemas/ticketingSchema.ts server/domain/ticketing/services/ticketOrderService.ts server/domain/ticketing/services/ticketingServices.test.ts server/domain/ticketing/types/ticketingTypes.ts server/interfaces/http/bookings/bookingsController.test.ts server/interfaces/http/bookings/schemas/bookingSchemas.ts server/interfaces/http/paymentAccounts/paymentAccountController.test.ts server/interfaces/http/paymentAccounts/paymentAccountController.ts server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts server/shared/kernel/legalTerms.parity.test.ts server/shared/kernel/legalTerms.ts src/domain/bookings/components/buyer/BookingFlow.tsx src/domain/bookings/components/buyer/OfferPolicySummary.tsx src/domain/bookings/components/buyer/buyerComponents.test.tsx src/domain/bookings/types/bookings.ts src/domain/bookings/utils/bookingErrorMessage.ts src/domain/content/components/AboutView.tsx src/domain/content/components/about/AboutGeneralTab.tsx src/domain/content/components/about/AboutLicensesTab.tsx src/domain/content/components/about/AboutTermsTab.tsx src/domain/payment/api/apiPaymentAdapter.ts src/domain/payment/application/usecases/acceptPartnerTermsUseCase.ts src/domain/payment/application/usecases/getPartnerTermsUseCase.ts src/domain/payment/components/PartnerStripeConnectPortal.test.tsx src/domain/payment/components/PartnerStripeConnectPortal.tsx src/domain/payment/components/accounts/PartnerTermsCard.tsx src/domain/payment/components/accounts/PaymentAccountCard.tsx src/domain/payment/index.ts src/domain/payment/ports/paymentApiPort.ts src/domain/payment/types/payment.ts src/domain/ticketing/components/EventTicketingPurchasePanel.tsx src/domain/ticketing/components/checkout/SalesPolicyNotice.tsx src/domain/ticketing/components/checkout/TicketOrderPaymentStep.test.tsx src/domain/ticketing/components/checkout/TicketOrderPaymentStep.tsx src/domain/ticketing/hooks/useTicketCheckout.ts src/domain/ticketing/ports/ticketingPort.ts src/shared/constants/legalTerms.ts src/shared/i18n/bookingsResources.ts src/shared/i18n/legalResources.ts src/shared/i18n/resources.ts src/shared/i18n/ticketCheckoutResources.ts src/ui/components/Dialog.tsx src/ui/legal/LegalTermsDocument.tsx src/ui/legal/TermsAcceptanceField.test.tsx src/ui/legal/TermsAcceptanceField.tsx` (todos verdes). Não precisa rodar a suíte inteira.
- `firestore.rules` não muda: o aceite fica no documento do próprio parceiro, já legível só por ele e pelo admin.
- confira em pt-BR e fr, nos temas claro e escuro: compra de ingresso (linha da política, caixa de aceite, termos no diálogo), reserva, Recebimentos (aceite dos termos do parceiro com as taxas) e Sobre o app → Termos.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~
