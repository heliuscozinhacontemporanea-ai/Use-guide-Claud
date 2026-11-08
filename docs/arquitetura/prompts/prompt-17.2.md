# Prompt 17.2 — Oferta só é publicada com Stripe pronto; parceiro suspenso não vende

> Lote 9, gerado do commit de referência `5d66eea` da branch `claude/agents-md-v2`. Aplique depois do Prompt 16.1, na ordem 16.1 → 17 → 17.1 → 17.2. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 17.2 — Oferta só é publicada com Stripe pronto; parceiro suspenso não vende

Decisão D8 e auditoria: ofertas podiam ser publicadas sem conta Stripe pronta e o "pronto para receber" tinha três critérios diferentes.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

O QUE MUDA:
1) Critério único isSellerAccountReady no servidor; /api/payment/connect/status devolve readyForSales.
2) Publicar oferta passa por setBookableOfferStatusApplicationUseCase (parceiro ativo + Stripe pronto).
3) Reserva e pagamento de ingresso de parceiro suspenso são recusados.
4) Botão Publicar desabilitado com explicação; falha ao consultar a conta mostra erro com nova tentativa.
5) docs/arquitetura/decisoes.md: decisão D9.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/decisoes.md (alterar)
- server/application/usecases/bookings/bookingApplicationUseCases.test.ts (alterar)
- server/application/usecases/bookings/createBookingApplicationUseCase.ts (alterar)
- server/application/usecases/bookings/setBookableOfferStatusApplicationUseCase.test.ts (criar)
- server/application/usecases/bookings/setBookableOfferStatusApplicationUseCase.ts (criar)
- server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.ts (alterar)
- server/application/usecases/isPartnerSuspended.ts (criar)
- server/domain/bookings/errors/bookingDomainError.ts (alterar)
- server/domain/bookings/services/offerService.test.ts (alterar)
- server/domain/bookings/services/offerService.ts (alterar)
- server/domain/bookings/usecases/setBookableOfferStatusUseCase.ts (alterar)
- server/domain/payment/services/stripePaymentService.ts (alterar)
- server/domain/payment/usecases/getPartnerConnectAccountStatusUseCase.ts (alterar)
- server/domain/payment/utils/sellerReadiness.test.ts (criar)
- server/domain/payment/utils/sellerReadiness.ts (criar)
- server/interfaces/http/bookings/partnerOffersController.ts (alterar)
- src/app/compositions/PartnerBookingsComposition.tsx (alterar)
- src/domain/bookings/components/partner/PartnerOfferRow.test.tsx (criar)
- src/domain/bookings/components/partner/PartnerOfferRow.tsx (alterar)
- src/domain/bookings/components/partner/PartnerOffersManager.test.tsx (alterar)
- src/domain/bookings/components/partner/PartnerOffersManager.tsx (alterar)
- src/domain/payment/types/payment.ts (alterar)
- src/domain/ticketing/components/PartnerEventTicketingManager.tsx (alterar)
- src/domain/ticketing/types/ticketing.ts (alterar)
- src/shared/i18n/bookingsResources.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/decisoes.md — diff ===
@@ -85,3 +85,13 @@
 * **Oferta de reserva só é publicada com o Stripe do parceiro pronto** (bloqueio no servidor e botão desabilitado com explicação).
 * **Editor único** de item e evento para parceiro e admin (Prompts 18–19).
 * **Prompt:** 17, 17.1, 17.2, 18, 19.
+
+## D9 — Parceiros com vários estabelecimentos e novas categorias (2026-10-12)
+
+* **Três níveis**, como Airbnb, Google e TripAdvisor: **conta** (login) → **empresa** (CPF/CNPJ, conta Stripe) → **estabelecimentos**. A categoria pertence ao estabelecimento, não ao parceiro: uma conta pode ter pousada, restaurante e passeio, cada um com o formulário da sua categoria.
+* **Produtor de eventos** (empresas com eventos esporádicos, sem estabelecimento): deixa de ser categoria do parceiro e passa a ser um **perfil de produtor**, cadastrado como os estabelecimentos (nome, descrição, fotos, contatos). Todo evento pertence a um estabelecimento **ou** ao perfil de produtor. *Aguardando confirmação do responsável (resposta à ressalva do item 1).*
+* **Selo e plano por estabelecimento** (cada estabelecimento, ou perfil de produtor, tem o seu plano e o seu selo).
+* **Categorias novas:** Passeios (`tour`, já existente), **Translados** (`transfer`) e **Aluguéis** (`rental`), separadas. Regra: atividade guiada com roteiro é Passeio; o turista usa o veículo sozinho por um período é Aluguel.
+* **Rotas novas** (altera D6): `/translados`, `/en/transfers`, `/fr/transferts`; `/alugueis`, `/en/rentals`, `/fr/locations`.
+* **Formulário:** campo de arquivo do cardápio removido (fica só o link). **Telefone em E.164**, com o link do WhatsApp montado a partir dele.
+* **Ordem:** Prompt 17.2 (publicar só com Stripe pronto) → Prompt 18 (modelo de categorias + editor único).

=== server/application/usecases/bookings/bookingApplicationUseCases.test.ts — diff ===
@@ -15,6 +15,7 @@ vi.mock('../../../domain/payment', () => ({
   createMarketplacePaymentIntentUseCase: vi.fn(),
   processProviderRefundUseCase: vi.fn().mockResolvedValue({}),
 }));
+vi.mock('../isPartnerSuspended', () => ({ isPartnerSuspended: vi.fn().mockResolvedValue(false) }));
 
 import {
   cancelBookingForCanceledSlotUseCase,
@@ -30,6 +31,7 @@ import {
 import { cancelBookingByBuyerApplicationUseCase } from './cancelBookingByBuyerApplicationUseCase';
 import { cancelSlotByPartnerApplicationUseCase } from './cancelSlotByPartnerApplicationUseCase';
 import { createBookingApplicationUseCase } from './createBookingApplicationUseCase';
+import { isPartnerSuspended } from '../isPartnerSuspended';
 
 const BOOKING = {
   id: 'bk_1',
@@ -92,6 +94,16 @@ describe('createBookingApplicationUseCase', () => {
     await expect(createBookingApplicationUseCase(BUYER, INPUT)).rejects.toThrow('stripe down');
     expect(cancelPendingBookingUseCase).toHaveBeenCalledWith('bk_1', 'payment_init_failed');
   });
+
+  it('parceiro suspenso: não cria pagamento e libera a vaga', async () => {
+    vi.mocked(createPendingBookingUseCase).mockResolvedValue(BOOKING as never);
+    vi.mocked(isPartnerSuspended).mockResolvedValueOnce(true);
+    await expect(createBookingApplicationUseCase(BUYER, INPUT)).rejects.toMatchObject({
+      code: 'PARTNER_SUSPENDED',
+    });
+    expect(createMarketplacePaymentIntentUseCase).not.toHaveBeenCalled();
+    expect(cancelPendingBookingUseCase).toHaveBeenCalledWith('bk_1', 'payment_init_failed');
+  });
 });
 
 describe('cancelBookingByBuyerApplicationUseCase', () => {

=== server/application/usecases/bookings/createBookingApplicationUseCase.ts — diff ===
@@ -6,6 +6,7 @@ import {
 } from '../../../domain/bookings';
 import { createMarketplacePaymentIntentUseCase } from '../../../domain/payment';
 import { resolvePlatformFeePercent } from '../../../shared/kernel/platformFee';
+import { isPartnerSuspended } from '../isPartnerSuspended';
 
 export interface BookingBuyer {
   uid: string;
@@ -38,6 +39,12 @@ export async function createBookingApplicationUseCase(
   );
 
   try {
+    if (await isPartnerSuspended(booking.sellerPartnerId)) {
+      throw new BookingDomainError(
+        'PARTNER_SUSPENDED',
+        'Este parceiro não está aceitando reservas no momento.'
+      );
+    }
     const payment = await createMarketplacePaymentIntentUseCase({
       referenceType: 'booking',
       referenceId: booking.id,

=== server/application/usecases/bookings/setBookableOfferStatusApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/bookings', async () => {
  const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
  return { BookingDomainError, setBookableOfferStatusUseCase: vi.fn() };
});
vi.mock('../../../domain/payment', () => ({ assertPartnerReadyForPaidEventUseCase: vi.fn() }));
vi.mock('../isPartnerSuspended', () => ({ isPartnerSuspended: vi.fn() }));

import { setBookableOfferStatusUseCase } from '../../../domain/bookings';
import { assertPartnerReadyForPaidEventUseCase } from '../../../domain/payment';
import { isPartnerSuspended } from '../isPartnerSuspended';
import { setBookableOfferStatusApplicationUseCase } from './setBookableOfferStatusApplicationUseCase';

const ACTOR = { uid: 'p1', admin: false };
const OFFER = { id: 'o1', partnerId: 'p1' };

/** Executa a verificação que o domínio chama antes de publicar. */
async function runPublishGuard() {
  const call = vi.mocked(setBookableOfferStatusUseCase).mock.calls[0];
  const guard = call?.[3];
  if (!guard) throw new Error('guard ausente');
  return guard(OFFER as never);
}

describe('setBookableOfferStatusApplicationUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isPartnerSuspended).mockResolvedValue(false);
  });

  it('publica quando o parceiro está ativo e o Stripe está pronto', async () => {
    await setBookableOfferStatusApplicationUseCase(ACTOR, 'o1', 'published');
    await runPublishGuard();
    expect(assertPartnerReadyForPaidEventUseCase).toHaveBeenCalledWith('p1');
  });

  it('Stripe não pronto: a publicação é recusada', async () => {
    vi.mocked(assertPartnerReadyForPaidEventUseCase).mockRejectedValue(
      Object.assign(new Error('Conclua a configuração financeira.'), {
        code: 'SELLER_ACCOUNT_NOT_ELIGIBLE',
      })
    );
    await setBookableOfferStatusApplicationUseCase(ACTOR, 'o1', 'published');
    await expect(runPublishGuard()).rejects.toMatchObject({ code: 'SELLER_ACCOUNT_NOT_ELIGIBLE' });
  });

  it('parceiro suspenso: a publicação é recusada antes de consultar o Stripe', async () => {
    vi.mocked(isPartnerSuspended).mockResolvedValue(true);
    await setBookableOfferStatusApplicationUseCase(ACTOR, 'o1', 'published');
    await expect(runPublishGuard()).rejects.toMatchObject({ code: 'PARTNER_SUSPENDED' });
    expect(assertPartnerReadyForPaidEventUseCase).not.toHaveBeenCalled();
  });
});

=== server/application/usecases/bookings/setBookableOfferStatusApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  type BookableOffer,
  type BookableOfferStatus,
  type BookingActor,
  BookingDomainError,
  setBookableOfferStatusUseCase,
} from '../../../domain/bookings';
import { assertPartnerReadyForPaidEventUseCase } from '../../../domain/payment';
import { isPartnerSuspended } from '../isPartnerSuspended';

/**
 * Publicar exige parceiro ativo e conta Stripe pronta para vender (decisão D8): sem isso o turista
 * veria uma oferta pública cujo pagamento falha.
 */
export async function setBookableOfferStatusApplicationUseCase(
  actor: BookingActor,
  offerId: string,
  status: Exclude<BookableOfferStatus, 'draft'>
): Promise<BookableOffer> {
  return setBookableOfferStatusUseCase(actor, offerId, status, async (offer) => {
    if (await isPartnerSuspended(offer.partnerId)) {
      throw new BookingDomainError(
        'PARTNER_SUSPENDED',
        'Conta de parceiro suspensa: não é possível publicar ofertas.'
      );
    }
    await assertPartnerReadyForPaidEventUseCase(offer.partnerId);
  });
}

=== server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.ts — diff ===
@@ -6,6 +6,7 @@ import {
   TicketingDomainError,
   type TicketOrder,
 } from '../../domain/ticketing';
+import { isPartnerSuspended } from './isPartnerSuspended';
 import { OrchestrationActor } from './orchestrationActor';
 
 export async function createTicketOrderPaymentIntentApplicationUseCase(
@@ -70,6 +71,12 @@ export async function createTicketOrderPaymentIntentApplicationUseCase(
   }
 
   const partnerId = listing.partnerId || listing.ownerId;
+  if (await isPartnerSuspended(partnerId)) {
+    throw new TicketingDomainError(
+      'FORBIDDEN',
+      'Este organizador não está vendendo ingressos no momento.'
+    );
+  }
 
   const paymentResult = await createPaymentForTicketOrderUseCase({
     orderId: order.id,

=== server/application/usecases/isPartnerSuspended.ts — ARQUIVO NOVO, conteúdo completo ===
import { getPartnerProfileUseCase } from '../../domain/partners';

/** Parceiro suspenso pelo admin não publica nem vende (decisão D8). */
export async function isPartnerSuspended(partnerId: string): Promise<boolean> {
  const partner = await getPartnerProfileUseCase(partnerId);
  return partner?.status === 'suspended';
}

=== server/domain/bookings/errors/bookingDomainError.ts — diff ===
@@ -8,7 +8,8 @@ export type BookingErrorCode =
   | 'INVALID_TRANSITION'
   | 'LATE_PAYMENT_REJECTED'
   | 'KIND_NOT_AVAILABLE'
-  | 'CANCELLATION_NOT_ALLOWED';
+  | 'CANCELLATION_NOT_ALLOWED'
+  | 'PARTNER_SUSPENDED';
 
 const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
   VALIDATION_ERROR: 400,
@@ -21,6 +22,7 @@ const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
   LATE_PAYMENT_REJECTED: 409,
   KIND_NOT_AVAILABLE: 422,
   CANCELLATION_NOT_ALLOWED: 422,
+  PARTNER_SUSPENDED: 403,
 };
 
 export class BookingDomainError extends Error {

=== server/domain/bookings/services/offerService.test.ts — diff ===
@@ -104,6 +104,21 @@ describe('OfferService', () => {
     expect(port.publicOffers.has(offer.id)).toBe(false);
   });
 
+  it('verificação antes de publicar que recusa mantém a oferta fora do ar', async () => {
+    const { service, port } = setup();
+    const offer = await service.createOffer(OWNER, {
+      ...INPUT,
+      guideItemId: 'item-1',
+      kind: 'tour',
+    });
+    await expect(
+      service.setOfferStatus(OWNER, offer.id, 'published', async () => {
+        throw new Error('Stripe não está pronto');
+      })
+    ).rejects.toThrow('Stripe não está pronto');
+    expect(port.publicOffers.has(offer.id)).toBe(false);
+  });
+
   it('oferta de outro parceiro responde como inexistente', async () => {
     const { service } = setup();
     const offer = await service.createOffer(OWNER, {

=== server/domain/bookings/services/offerService.ts — diff ===
@@ -127,16 +127,21 @@ export class OfferService {
     return updated;
   }
 
+  /** `beforePublish` recebe a oferta antes de ela ficar pública e pode recusar lançando um erro. */
   async setOfferStatus(
     actor: BookingActor,
     offerId: string,
-    status: Exclude<BookableOfferStatus, 'draft'>
+    status: Exclude<BookableOfferStatus, 'draft'>,
+    beforePublish?: (offer: BookableOffer) => Promise<void>
   ): Promise<BookableOffer> {
     const offer = await this.getOwnedOffer(actor, offerId);
     if (offer.status === status) return offer;
     if (!OFFER_STATUS_TRANSITIONS[offer.status].includes(status)) {
       throw new BookingDomainError('INVALID_TRANSITION', 'Mudança de status não permitida.');
     }
+    if (status === 'published' && beforePublish) {
+      await beforePublish(offer);
+    }
     const updated: BookableOffer = { ...offer, status, updatedAt: this.now().toISOString() };
     await this.port.saveOffer(updated);
     if (status === 'published') {

=== server/domain/bookings/usecases/setBookableOfferStatusUseCase.ts — diff ===
@@ -5,7 +5,8 @@ import type { BookableOffer, BookableOfferStatus, BookingActor } from '../types/
 export async function setBookableOfferStatusUseCase(
   actor: BookingActor,
   offerId: string,
-  status: Exclude<BookableOfferStatus, 'draft'>
+  status: Exclude<BookableOfferStatus, 'draft'>,
+  beforePublish?: (offer: BookableOffer) => Promise<void>
 ): Promise<BookableOffer> {
-  return getOfferService().setOfferStatus(actor, offerId, status);
+  return getOfferService().setOfferStatus(actor, offerId, status, beforePublish);
 }

=== server/domain/payment/services/stripePaymentService.ts — diff ===
@@ -10,6 +10,7 @@ import type {
   VerifiedWebhookEvent,
 } from '../ports/paymentGatewayPort';
 import type { TransactionRepositoryPort } from '../ports/transactionRepositoryPort';
+import { isSellerAccountReady } from '../utils/sellerReadiness';
 
 export class PaymentDomainError extends Error {
   constructor(
@@ -100,6 +101,7 @@ export class StripePaymentService {
     payoutsEnabled: boolean;
     detailsSubmitted: boolean;
     status: ConnectedAccountStatus['status'];
+    readyForSales: boolean;
   }> {
     const existing =
       await this.transactionRepo.getConnectedAccountRecord(partnerId);
@@ -110,6 +112,7 @@ export class StripePaymentService {
         payoutsEnabled: false,
         detailsSubmitted: false,
         status: 'pending',
+        readyForSales: false,
       };
     }
 
@@ -138,6 +141,7 @@ export class StripePaymentService {
       payoutsEnabled: status.payoutsEnabled,
       detailsSubmitted: status.detailsSubmitted,
       status: status.status,
+      readyForSales: isSellerAccountReady(status),
     };
   }
 
@@ -172,12 +176,7 @@ export class StripePaymentService {
     };
     await this.transactionRepo.saveConnectedAccountRecord(synced);
 
-    if (
-      !synced.chargesEnabled ||
-      !synced.payoutsEnabled ||
-      !synced.detailsSubmitted ||
-      synced.status !== 'enabled'
-    ) {
+    if (!isSellerAccountReady(synced)) {
       throw new PaymentDomainError(
         'SELLER_ACCOUNT_NOT_ELIGIBLE',
         'Vendas online indisponíveis. Conclua a configuração financeira.',

=== server/domain/payment/usecases/getPartnerConnectAccountStatusUseCase.ts — diff ===
@@ -8,6 +8,7 @@ export async function getPartnerConnectAccountStatusUseCase(partnerId: string):
   payoutsEnabled: boolean;
   detailsSubmitted: boolean;
   status: ConnectedAccountStatus['status'];
+  readyForSales: boolean;
 }> {
   return stripePaymentService.getPartnerAccountStatus(partnerId);
 }

=== server/domain/payment/utils/sellerReadiness.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { isSellerAccountReady } from './sellerReadiness';

const READY = {
  chargesEnabled: true,
  payoutsEnabled: true,
  detailsSubmitted: true,
  status: 'enabled',
};

describe('isSellerAccountReady', () => {
  it('pronta só com cobrança, repasse, dados enviados e status enabled', () => {
    expect(isSellerAccountReady(READY)).toBe(true);
    expect(isSellerAccountReady({ ...READY, chargesEnabled: false })).toBe(false);
    expect(isSellerAccountReady({ ...READY, payoutsEnabled: false })).toBe(false);
    expect(isSellerAccountReady({ ...READY, detailsSubmitted: false })).toBe(false);
    expect(isSellerAccountReady({ ...READY, status: 'restricted' })).toBe(false);
  });
});

=== server/domain/payment/utils/sellerReadiness.ts — ARQUIVO NOVO, conteúdo completo ===
/**
 * Critério único de "conta pronta para vender": o mesmo para publicar oferta, vender ingresso e
 * para o painel do parceiro, que recebe o resultado pronto em `readyForSales`.
 */
export function isSellerAccountReady(account: {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  status: string;
}): boolean {
  return (
    account.chargesEnabled &&
    account.payoutsEnabled &&
    account.detailsSubmitted &&
    account.status === 'enabled'
  );
}

=== server/interfaces/http/bookings/partnerOffersController.ts — diff ===
@@ -1,12 +1,12 @@
 import type { Response } from 'express';
 import { cancelSlotByPartnerApplicationUseCase } from '../../../application/usecases/bookings/cancelSlotByPartnerApplicationUseCase';
+import { setBookableOfferStatusApplicationUseCase } from '../../../application/usecases/bookings/setBookableOfferStatusApplicationUseCase';
 import {
   createAvailabilitySlotsUseCase,
   createBookableOfferUseCase,
   listOfferBookingsForPartnerUseCase,
   listOfferSlotsForPartnerUseCase,
   listPartnerOffersUseCase,
-  setBookableOfferStatusUseCase,
   updateBookableOfferUseCase,
 } from '../../../domain/bookings';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
@@ -77,7 +77,11 @@ export class PartnerOffersController {
       return sendError(res, 400, 'VALIDATION_ERROR', 'Status inválido.');
     }
     try {
-      const offer = await setBookableOfferStatusUseCase(actor, offerId.data, parsed.data.status);
+      const offer = await setBookableOfferStatusApplicationUseCase(
+        actor,
+        offerId.data,
+        parsed.data.status
+      );
       return res.status(200).json(toPartnerOffer(offer));
     } catch (error) {
       return handleBookingError(res, 'setOfferStatus', error);

=== src/app/compositions/PartnerBookingsComposition.tsx — diff ===
@@ -1,36 +1,57 @@
-import { useEffect, useState } from 'react';
+import { useCallback, useEffect, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { type BookableGuideItem, PartnerOffersManager } from '../../domain/bookings';
 import { getPartnerConnectStatusUseCase, PartnerStripeConnectPortal } from '../../domain/payment';
 
+type AccountState = 'loading' | 'ready' | 'not_ready' | 'error';
+
 /** Junta o gerenciador de reservas (bookings) e o onboarding financeiro (payment) na área do parceiro. */
 export function PartnerBookingsComposition({ items }: { items: BookableGuideItem[] }) {
   const { t } = useTranslation();
-  const [paymentsReady, setPaymentsReady] = useState<boolean | null>(null);
+  const [account, setAccount] = useState<AccountState>('loading');
 
-  useEffect(() => {
+  const loadStatus = useCallback(() => {
     let active = true;
+    setAccount('loading');
     getPartnerConnectStatusUseCase()
       .then((status) => {
-        if (active) setPaymentsReady(status.chargesEnabled && status.payoutsEnabled);
+        if (active) setAccount(status.readyForSales ? 'ready' : 'not_ready');
       })
       .catch(() => {
-        if (active) setPaymentsReady(false);
+        // Falha de rede não significa conta incompleta: não mostra o onboarding por engano.
+        if (active) setAccount('error');
       });
     return () => {
       active = false;
     };
   }, []);
 
+  useEffect(() => loadStatus(), [loadStatus]);
+
   return (
     <PartnerOffersManager
       items={items}
+      canPublish={account === 'ready'}
       accountNotice={
-        paymentsReady === false ? (
+        account === 'not_ready' ? (
           <div className="space-y-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
             <p className="text-xs text-amber-200">{t('bookings.partner.stripeRequired')}</p>
             <PartnerStripeConnectPortal />
           </div>
+        ) : account === 'error' ? (
+          <div
+            role="alert"
+            className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
+          >
+            <p className="text-xs text-white/80">{t('bookings.partner.accountStatusError')}</p>
+            <button
+              type="button"
+              onClick={loadStatus}
+              className="min-h-11 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white focus-visible:ring-2 focus-visible:ring-teal-400/50"
+            >
+              {t('bookings.partner.retry')}
+            </button>
+          </div>
         ) : null
       }
     />

=== src/domain/bookings/components/partner/PartnerOfferRow.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerOffer } from '../../types/bookings';
import { PartnerOfferRow } from './PartnerOfferRow';

const OFFER = {
  id: 'o1',
  guideItemId: 'item-1',
  kind: 'tour',
  status: 'draft',
  title: { 'pt-BR': 'Passeio de buggy' },
  pricing: { priceOptions: [{ id: 'a', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 15000 }] },
  createdAt: '',
  updatedAt: '',
} as unknown as PartnerOffer;

function renderRow(canPublish: boolean, onStatus = vi.fn()) {
  render(
    <PartnerOfferRow
      offer={OFFER}
      busy={false}
      canPublish={canPublish}
      onEdit={vi.fn()}
      onSlots={vi.fn()}
      onBookings={vi.fn()}
      onStatus={onStatus}
    />
  );
  return onStatus;
}

describe('PartnerOfferRow', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('sem conta financeira pronta, "Publicar" fica desabilitado e explica o motivo', () => {
    const onStatus = renderRow(false);
    const publish = screen.getByRole('button', { name: 'Publicar' });
    expect((publish as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('Conclua a configuração financeira para publicar.')).toBeTruthy();
    fireEvent.click(publish);
    expect(onStatus).not.toHaveBeenCalled();
  });

  it('com a conta pronta, publica', () => {
    const onStatus = renderRow(true);
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));
    expect(onStatus).toHaveBeenCalledWith('published');
  });
});

=== src/domain/bookings/components/partner/PartnerOfferRow.tsx — diff ===
@@ -14,6 +14,7 @@ const STATUS_STYLE: Record<OfferStatus, string> = {
 interface PartnerOfferRowProps {
   offer: PartnerOffer;
   busy: boolean;
+  canPublish: boolean;
   onEdit: () => void;
   onSlots: () => void;
   onBookings: () => void;
@@ -23,6 +24,7 @@ interface PartnerOfferRowProps {
 export function PartnerOfferRow({
   offer,
   busy,
+  canPublish,
   onEdit,
   onSlots,
   onBookings,
@@ -74,7 +76,9 @@ export function PartnerOfferRow({
           ) : (
             <button
               type="button"
-              disabled={busy}
+              disabled={busy || !canPublish}
+              title={canPublish ? undefined : t('bookings.partner.publishNeedsStripe')}
+              aria-describedby={canPublish ? undefined : `publish-hint-${offer.id}`}
               onClick={() => onStatus('published')}
               className={BUTTON_SECONDARY}
             >
@@ -91,6 +95,11 @@ export function PartnerOfferRow({
           </button>
         </div>
       )}
+      {!canPublish && offer.status !== 'published' && !archived && (
+        <p id={`publish-hint-${offer.id}`} className="text-[11px] text-amber-200">
+          {t('bookings.partner.publishNeedsStripe')}
+        </p>
+      )}
     </li>
   );
 }

=== src/domain/bookings/components/partner/PartnerOffersManager.test.tsx — diff ===
@@ -36,7 +36,10 @@ describe('PartnerOffersManager', () => {
     vi.mocked(listPartnerOffersUseCase).mockResolvedValue([]);
     await i18n.changeLanguage('fr');
     render(
-      <PartnerOffersManager items={[{ id: 'r1', name: 'Restaurante', category: 'restaurant' }]} />
+      <PartnerOffersManager
+        canPublish
+        items={[{ id: 'r1', name: 'Restaurante', category: 'restaurant' }]}
+      />
     );
     expect(
       await screen.findByText(
@@ -56,6 +59,7 @@ describe('PartnerOffersManager', () => {
     }));
     render(
       <PartnerOffersManager
+        canPublish
         items={[{ id: 'item-1', name: 'Lagoa do Paraíso', category: 'tour' }]}
       />
     );

=== src/domain/bookings/components/partner/PartnerOffersManager.tsx — diff ===
@@ -28,9 +28,15 @@ interface PartnerOffersManagerProps {
   items: BookableGuideItem[];
   /** Aviso montado pela composição quando a conta financeira ainda não está habilitada. */
   accountNotice?: ReactNode;
+  /** Publicar só com a conta financeira pronta; o servidor confere de novo. */
+  canPublish: boolean;
 }
 
-export function PartnerOffersManager({ items, accountNotice }: PartnerOffersManagerProps) {
+export function PartnerOffersManager({
+  items,
+  accountNotice,
+  canPublish,
+}: PartnerOffersManagerProps) {
   const { t } = useTranslation();
   const offers = usePartnerOffers();
   const [view, setView] = useState<View>({ type: 'list' });
@@ -156,6 +162,7 @@ export function PartnerOffersManager({ items, accountNotice }: PartnerOffersMana
                           key={offer.id}
                           offer={offer}
                           busy={busyId === offer.id}
+                          canPublish={canPublish}
                           onEdit={() => setView({ type: 'editor', item, offer })}
                           onSlots={() => setView({ type: 'slots', offer })}
                           onBookings={() => setView({ type: 'bookings', offer })}

=== src/domain/payment/types/payment.ts — diff ===
@@ -32,6 +32,8 @@ export interface PartnerConnectStatusResponse {
   requirementsCurrentlyDue?: string[];
   requirementsPastDue?: string[];
   status: 'pending' | 'restricted' | 'enabled' | 'disabled';
+  /** Calculado no servidor: mesmo critério usado para vender. */
+  readyForSales: boolean;
 }
 
 export type PaymentLocale = 'pt-BR' | 'en' | 'fr';

=== src/domain/ticketing/components/PartnerEventTicketingManager.tsx — diff ===
@@ -461,12 +461,7 @@ export function PartnerEventTicketingManager({
     await executeTokenOrIdValidation(checkInInput);
   };
 
-  const isStripeReady = Boolean(
-    merchantStatus?.connected &&
-      merchantStatus.chargesEnabled &&
-      merchantStatus.payoutsEnabled &&
-      merchantStatus.detailsSubmitted
-  );
+  const isStripeReady = merchantStatus?.readyForSales === true;
 
   return (
     <div className="space-y-4">

=== src/domain/ticketing/types/ticketing.ts — diff ===
@@ -228,6 +228,8 @@ export interface PartnerMerchantStatus {
   payoutsEnabled: boolean;
   detailsSubmitted: boolean;
   status: 'pending' | 'restricted' | 'enabled' | 'disabled';
+  /** Calculado no servidor: mesmo critério usado para vender. */
+  readyForSales: boolean;
 }
 
 export interface OfflineCheckInSessionResponse {

=== src/shared/i18n/bookingsResources.ts — diff ===
@@ -66,6 +66,8 @@ export interface BookingsTranslation {
     confirmArchive: string;
     actionFailed: string;
     stripeRequired: string;
+    publishNeedsStripe: string;
+    accountStatusError: string;
     fromPrice: string;
   };
   status: {
@@ -254,6 +256,8 @@ export const bookingsPtBR: BookingsTranslation = {
     confirmArchive: 'Arquivar esta oferta? Ela sai do site e não pode ser reaberta.',
     actionFailed: 'Não foi possível concluir a ação.',
     stripeRequired: 'Para vender reservas, conclua a configuração financeira da sua conta.',
+    publishNeedsStripe: 'Conclua a configuração financeira para publicar.',
+    accountStatusError: 'Não foi possível verificar sua conta financeira agora.',
     fromPrice: 'a partir de {{amount}}',
   },
   status: {
@@ -440,6 +444,8 @@ export const bookingsEn: BookingsTranslation = {
     confirmArchive: 'Archive this offer? It leaves the site and cannot be reopened.',
     actionFailed: 'The action could not be completed.',
     stripeRequired: 'To sell bookings, finish your account payment setup.',
+    publishNeedsStripe: 'Finish your payment setup to publish.',
+    accountStatusError: 'We couldn’t check your payment account right now.',
     fromPrice: 'from {{amount}}',
   },
   status: {
@@ -630,6 +636,8 @@ export const bookingsFr: BookingsTranslation = {
     actionFailed: 'L’action n’a pas pu aboutir.',
     stripeRequired:
       'Pour vendre des réservations, terminez la configuration financière de votre compte.',
+    publishNeedsStripe: 'Terminez la configuration financière pour publier.',
+    accountStatusError: 'Impossible de vérifier votre compte financier pour le moment.',
     fromPrice: 'à partir de {{amount}}',
   },
   status: {

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros), `npm test` → 136 arquivos, 776 testes, `npm run build`.
Responda no formato do AGENTS.md §16.3.
~~~~
