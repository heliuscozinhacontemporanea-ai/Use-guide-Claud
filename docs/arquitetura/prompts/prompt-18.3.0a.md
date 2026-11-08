# Prompt 18.3.0a — Verificação por estabelecimento (backend)

> Lote 13, gerado do commit de referência `3cc54e6` da branch `claude/agents-md-v2`. Aplique depois do 18.2.5. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.3.0a — Verificação por estabelecimento (backend, D12)

Decisão D12 (2026-10-19).

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint (AGENTS.md §13).

ANTES DE TUDO: rode `npm install --save-exact @google-cloud/kms@6.2.1`. Isso atualiza o package.json, como no diff abaixo, e o package-lock.json, que não vem no diff.

DECISÃO D12 (docs/arquitetura/decisoes.md): verificação por estabelecimento.
- O parceiro informa CPF ou CNPJ de cada estabelecimento.
- O admin confere o Cartão CNPJ na Receita, o vínculo da pessoa com a empresa (QSA ou MEI) e o documento de identidade.
- Só estabelecimento verificado e com CNPJ vende.

Este prompt é só o BACKEND e não muda o cadastro atual. As telas e a retirada do CPF/CNPJ da conta vêm no 18.3.0b.

O QUE MUDA:
1) Criptografia de campo (AGENTS.md §7.7):
   - server/shared/kernel/fieldEncryption.ts: FieldEncryptionPort, BlindIndexPort e CryptoUnavailableError;
   - server/infrastructure/crypto/:
     - AES-256-GCM (aesGcm.ts);
     - adapter Cloud KMS com envelope encryption (kmsFieldEncryptionAdapter.ts);
     - adapter com chave de teste, que recusa produção (localFieldEncryptionAdapter.ts);
     - índice cego HMAC (hmacBlindIndexAdapter.ts);
     - fábrica lazy (fieldEncryptionFactory.ts).
2) Domínio media: documentos privados (privateDocumentService.ts), com fotos reprocessadas sem EXIF e PDF guardado como PDF, na pasta verification/{uid}/. Nova rota POST /api/media/verification-files, que devolve só o fileId, sem URL.
3) Domínio partners: verificação por estabelecimento:
   - tipos, port, adapter Firestore (listingVerifications, verificationDocuments, verificationOwners), service e casos de uso;
   - CNPJ 1:1;
   - CPF conferido uma vez vale para os outros estabelecimentos da conta;
   - perfil de produtor usa o documento de um estabelecimento da conta;
   - documento sempre cifrado; o dono e o admin só veem a forma mascarada.
4) server/application/usecases/listingVerification/: envio, consulta, leitura de arquivo pelo admin (com log de auditoria) e exclusão de arquivos. A exclusão do estabelecimento e a da conta apagam verificação, índices e arquivos.
5) server/interfaces/http/listingVerifications/: rotas /api/listing-verifications:
   - GET e PUT /:itemId (dono);
   - GET / (fila do admin);
   - POST /:itemId/review (admin);
   - GET /:itemId/files/:kind (admin).
6) Venda bloqueada sem estabelecimento verificado com CNPJ:
   - publicar oferta (setBookableOfferStatus);
   - criar reserva (createBooking);
   - pagar pedido de ingresso (createTicketOrderPaymentIntent).
   Até o 18.4, só o primeiro CNPJ aprovado da conta vende (débito B22).
7) firestore.rules (3 coleções com `if false`) com testes; storage.rules (verification/** negado); índice listingVerifications (status + submittedAt); .env.example (FIELD_ENCRYPTION_KMS_KEY, FIELD_ENCRYPTION_DEV_KEY, PII_BLIND_INDEX_KEY); debitos.md (B21, B22, B23).

ARQUIVOS (crie, altere ou apague exatamente estes):
- .env.example (alterar)
- docs/arquitetura/debitos.md (alterar)
- firestore.indexes.json (alterar)
- firestore.rules (alterar)
- firestore.rules.security.test.ts (alterar)
- package.json (alterar)
- server.ts (alterar)
- server/application/usecases/bookings/bookingApplicationUseCases.test.ts (alterar)
- server/application/usecases/bookings/createBookingApplicationUseCase.ts (alterar)
- server/application/usecases/bookings/setBookableOfferStatusApplicationUseCase.test.ts (alterar)
- server/application/usecases/bookings/setBookableOfferStatusApplicationUseCase.ts (alterar)
- server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.test.ts (criar)
- server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.ts (alterar)
- server/application/usecases/deletePartnerItemApplicationUseCase.test.ts (alterar)
- server/application/usecases/deletePartnerItemApplicationUseCase.ts (alterar)
- server/application/usecases/deleteUserAccountApplicationUseCase.ts (alterar)
- server/application/usecases/listingVerification/deleteVerificationFiles.ts (criar)
- server/application/usecases/listingVerification/getListingVerificationApplicationUseCase.ts (criar)
- server/application/usecases/listingVerification/loadVerificationListing.ts (criar)
- server/application/usecases/listingVerification/readListingVerificationFileApplicationUseCase.ts (criar)
- server/application/usecases/listingVerification/submitListingVerificationApplicationUseCase.test.ts (criar)
- server/application/usecases/listingVerification/submitListingVerificationApplicationUseCase.ts (criar)
- server/domain/media/adapters/firebaseStorageObjectAdapter.ts (alterar)
- server/domain/media/controllers/mediaController.ts (alterar)
- server/domain/media/errors/mediaDomainError.ts (alterar)
- server/domain/media/factory.ts (alterar)
- server/domain/media/index.ts (alterar)
- server/domain/media/ports/objectStoragePort.ts (alterar)
- server/domain/media/routes/mediaRoutes.ts (alterar)
- server/domain/media/schemas/mediaSchema.ts (alterar)
- server/domain/media/services/mediaService.test.ts (alterar)
- server/domain/media/services/privateDocumentService.test.ts (criar)
- server/domain/media/services/privateDocumentService.ts (criar)
- server/domain/media/types/mediaTypes.ts (alterar)
- server/domain/media/usecases/deleteVerificationFileUseCase.ts (criar)
- server/domain/media/usecases/isOwnVerificationFileUseCase.ts (criar)
- server/domain/media/usecases/readVerificationFileUseCase.ts (criar)
- server/domain/media/usecases/storeVerificationFileUseCase.ts (criar)
- server/domain/media/utils/detectDocumentType.ts (criar)
- server/domain/partners/adapters/firestoreListingVerificationAdapter.ts (criar)
- server/domain/partners/errors/listingVerificationError.ts (criar)
- server/domain/partners/factory.ts (alterar)
- server/domain/partners/index.ts (alterar)
- server/domain/partners/ports/listingVerificationRepositoryPort.ts (criar)
- server/domain/partners/services/listingVerificationService.test.ts (criar)
- server/domain/partners/services/listingVerificationService.ts (criar)
- server/domain/partners/types/listingVerification.ts (criar)
- server/domain/partners/usecases/assertListingCanSellUseCase.ts (criar)
- server/domain/partners/usecases/deleteListingVerificationUseCase.ts (criar)
- server/domain/partners/usecases/deleteOwnerListingVerificationsUseCase.ts (criar)
- server/domain/partners/usecases/getListingVerificationFilePathUseCase.ts (criar)
- server/domain/partners/usecases/getListingVerificationStatusUseCase.ts (criar)
- server/domain/partners/usecases/getListingVerificationUseCase.ts (criar)
- server/domain/partners/usecases/listListingVerificationsUseCase.ts (criar)
- server/domain/partners/usecases/reviewListingVerificationUseCase.ts (criar)
- server/domain/partners/usecases/submitListingVerificationUseCase.ts (criar)
- server/domain/partners/utils/listingVerificationView.ts (criar)
- server/domain/partners/utils/maskDocument.ts (criar)
- server/infrastructure/crypto/aesGcm.ts (criar)
- server/infrastructure/crypto/fieldEncryption.test.ts (criar)
- server/infrastructure/crypto/fieldEncryptionFactory.ts (criar)
- server/infrastructure/crypto/hmacBlindIndexAdapter.ts (criar)
- server/infrastructure/crypto/kmsFieldEncryptionAdapter.ts (criar)
- server/infrastructure/crypto/localFieldEncryptionAdapter.ts (criar)
- server/interfaces/http/bookings/bookingHttpErrors.ts (alterar)
- server/interfaces/http/listingVerifications/listingVerificationController.test.ts (criar)
- server/interfaces/http/listingVerifications/listingVerificationController.ts (criar)
- server/interfaces/http/listingVerifications/listingVerificationRoutes.ts (criar)
- server/interfaces/http/listingVerifications/schemas/listingVerificationSchemas.ts (criar)
- server/shared/kernel/fieldEncryption.ts (criar)
- storage.rules (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== .env.example — diff ===
@@ -63,3 +63,12 @@ TRUST_PROXY_HOPS=
 # Insights: chave HMAC (≥ 32 caracteres) que pseudonimiza uid/IP na deduplicação de visualizações.
 # Secret Manager em produção; chave diferente no AI Studio. Sem ela, /api/insights/track responde 503.
 INSIGHTS_VIEWER_KEY=
+
+# Criptografia de CPF/CNPJ por estabelecimento (AGENTS.md §7.7, decisão D12).
+# Produção: nome completo da chave do Cloud KMS (projects/<p>/locations/<l>/keyRings/<r>/cryptoKeys/<k>);
+# a conta de serviço do Cloud Run precisa de cloudkms.cryptoKeyEncrypterDecrypter só nessa chave.
+FIELD_ENCRYPTION_KMS_KEY=
+# AI Studio: 32 bytes aleatórios em base64 (ex.: openssl rand -base64 32). Recusada com NODE_ENV=production.
+FIELD_ENCRYPTION_DEV_KEY=
+# HMAC (≥ 32 caracteres) para checar documento repetido sem gravar o número. Trocar exige reindexar.
+PII_BLIND_INDEX_KEY=

=== docs/arquitetura/debitos.md — diff ===
@@ -16,6 +16,9 @@
 | B17 | Painel do parceiro — itens da auditoria de 2026-10-12 ainda abertos | §11.8, §11.10, §12.4, §11.7, §13 | médio | seção de reservas aparece para hospedagem/restaurante; ingressos ocultos em evento novo sem aviso; relatórios bloqueados só na UI; quem já assina vê a compra de novo; erros de catálogo/notificações aparecem como lista vazia; excluir lote e "não compareceu" sem confirmação; `PartnerItemForms.tsx` sem uso; `Step2ContactInfo.tsx` (516 linhas) e `Step5Media.tsx` (756) acima de 400 linhas |
 | B18 | Painel admin — itens da auditoria de 2026-10-12 ainda abertos | §6.2, §6.4, §8, §11.7, §11.8 | médio | preço de planos em reais (Prompt 17.1); preço de item gravado como texto; catálogo e planos lidos direto do Firestore (deveria ser API, com limite); relatórios em branco antes de carregar e média 0.0 sem avaliações; card de eventos conta rascunhos; duas entradas (`/admin` e `?admin=1`); visitante sem login redirecionado sem aviso; tabs sem `role="tablist"` |
 | B20 | `operationalInfoSchema` duplicado em `server/domain/guide/schemas/guideSchema.ts` e `server/domain/partners/schemas/partnerContentSchema.ts` | §5.3 | baixo — as duas cópias precisam mudar juntas | rotas de conteúdo do parceiro passarem a validar com o schema publicado pelo `guide` (Published Language) |
+| B21 | `package-lock.json`: `npm audit --omit=dev` aponta 10 vulnerabilidades (1 crítica, 7 altas) em `firebase`, `@firebase/firestore`, `@grpc/grpc-js`, `gaxios`, `proxy-addr`, `uuid` e outras | §7.4 e §7.10 A06 (sem high/critical para merge) | alto — já existiam antes do Prompt 18.3.0a; a dependência nova (`@google-cloud/kms` 6.2.1) não acrescentou nenhuma | prompt próprio de atualização de dependências, testando cada salto de versão |
+| B22 | `listingVerificationService.assertCanSell`: até o Prompt 18.4, só o primeiro CNPJ aprovado de cada conta vende (`SALES_DOCUMENT_MISMATCH`) | D12 (P8): repasse por documento | médio — conta com dois CNPJs só vende por um deles | Prompt 18.4: conta Stripe por documento |
+| B23 | `partners/{uid}.cpfCnpj` e `partnerDocumentKeys/{cpfCnpj}` ainda existem (cadastro da conta com documento em texto puro) | §7.7 e D12 (P0) | alto — dado Restrito sem criptografia | Prompt 18.3.0b: cadastro da conta sem documento; o documento passa a existir só, cifrado, na verificação do estabelecimento |
 
 ## Resolvidos

=== firestore.indexes.json — diff ===
@@ -285,6 +285,20 @@
           "order": "ASCENDING"
         }
       ]
+    },
+    {
+      "collectionGroup": "listingVerifications",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "status",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "submittedAt",
+          "order": "ASCENDING"
+        }
+      ]
     }
   ],
   "fieldOverrides": [

=== firestore.rules — diff ===
@@ -149,6 +149,16 @@ service cloud.firestore {
     match /paymentTransactions/{transactionId} {
       allow read, write: if false;
     }
+    // Verificação dos estabelecimentos (D12): documento cifrado e arquivos privados, só pelo backend.
+    match /listingVerifications/{itemId} {
+      allow read, write: if false;
+    }
+    match /verificationDocuments/{documentIndex} {
+      allow read, write: if false;
+    }
+    match /verificationOwners/{ownerId} {
+      allow read, write: if false;
+    }
     // Métricas lidas só pela API (dono do item ou admin); as guardas de deduplicação nunca saem do backend.
     match /interactionStats/{statId} {
       allow read, write: if false;

=== firestore.rules.security.test.ts — diff ===
@@ -345,6 +345,18 @@ describe('Firestore Rules — Security Suite', () => {
       await assertFails(deleteDoc(doc(db, 'transactions/tx-1')));
     });
 
+    it('verificação (D12): listingVerifications, verificationDocuments e verificationOwners negados até para o dono e admin', async () => {
+      const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();
+      const ownerDb = testEnv.authenticatedContext('partner-1').firestore();
+      for (const db of [adminDb, ownerDb]) {
+        await assertFails(getDoc(doc(db, 'listingVerifications/item-1')));
+        await assertFails(getDoc(doc(db, 'verificationDocuments/idx-1')));
+        await assertFails(getDoc(doc(db, 'verificationOwners/partner-1')));
+        await assertFails(setDoc(doc(db, 'listingVerifications/item-1'), { status: 'approved' }));
+        await assertFails(setDoc(doc(db, 'verificationOwners/partner-1'), { salesDocumentIndex: 'x' }));
+      }
+    });
+
     it('client → interactionStats e interactionGuards write negado', async () => {
       const db = testEnv.authenticatedContext('user-1').firestore();
       const statPath = 'interactionStats/items_item-1_2026-10-19';

=== package.json — diff ===
@@ -28,6 +28,7 @@
     "deploy:firestore": "firebase deploy --only firestore"
   },
   "dependencies": {
+    "@google-cloud/kms": "6.2.1",
     "@google/genai": "^2.27.0",
     "@hookform/resolvers": "^5.9.1",
     "@radix-ui/react-dialog": "^1.1.23",

=== server.ts — diff ===
@@ -20,6 +20,7 @@ import adminRouter from './server/domain/admin/routes/adminRoutes';
 import favoriteRouter from './server/domain/favorites/routes/favoriteRoutes';
 import mediaRouter from './server/domain/media/routes/mediaRoutes';
 import billingRouter from './server/interfaces/http/billing/billingRoutes';
+import listingVerificationRouter from './server/interfaces/http/listingVerifications/listingVerificationRoutes';
 import {
   bookingsRouter,
   partnerOffersRouter,
@@ -193,6 +194,7 @@ async function startServer() {
   app.use('/api/weather', climaWindRouter);
   app.use('/api/notifications', notificationRouter);
   app.use('/api/users', userRouter);
+  app.use('/api/listing-verifications', listingVerificationRouter);
   app.use('/api/partners/offers', partnerOffersRouter);
   app.use('/api/partners', partnerRouter);
   app.use('/api/items', itemRouter);

=== server/application/usecases/bookings/bookingApplicationUseCases.test.ts — diff ===
@@ -16,7 +16,7 @@ vi.mock('../../../domain/payment', () => ({
   processProviderRefundUseCase: vi.fn().mockResolvedValue({}),
 }));
 vi.mock('../isPartnerSuspended', () => ({ isPartnerSuspended: vi.fn().mockResolvedValue(false) }));
-
+vi.mock('../../../domain/partners', () => ({ assertListingCanSellUseCase: vi.fn() }));
 
 import {
   cancelBookingForCanceledSlotUseCase,
@@ -33,6 +33,7 @@ import { cancelBookingByBuyerApplicationUseCase } from './cancelBookingByBuyerAp
 import { cancelSlotByPartnerApplicationUseCase } from './cancelSlotByPartnerApplicationUseCase';
 import { createBookingApplicationUseCase } from './createBookingApplicationUseCase';
 import { isPartnerSuspended } from '../isPartnerSuspended';
+import { assertListingCanSellUseCase } from '../../../domain/partners';
 
 const BOOKING = {
   id: 'bk_1',
@@ -105,6 +106,18 @@ describe('createBookingApplicationUseCase', () => {
     expect(createMarketplacePaymentIntentUseCase).not.toHaveBeenCalled();
     expect(cancelPendingBookingUseCase).toHaveBeenCalledWith('bk_1', 'payment_init_failed');
   });
+
+  it('estabelecimento sem verificação: não cria pagamento e libera a vaga (D12)', async () => {
+    vi.mocked(createPendingBookingUseCase).mockResolvedValue(BOOKING as never);
+    vi.mocked(assertListingCanSellUseCase).mockRejectedValueOnce(
+      Object.assign(new Error('não verificado'), { code: 'LISTING_NOT_VERIFIED' })
+    );
+    await expect(createBookingApplicationUseCase(BUYER, INPUT)).rejects.toMatchObject({
+      code: 'LISTING_NOT_VERIFIED',
+    });
+    expect(createMarketplacePaymentIntentUseCase).not.toHaveBeenCalled();
+    expect(cancelPendingBookingUseCase).toHaveBeenCalledWith('bk_1', 'payment_init_failed');
+  });
 });
 
 describe('cancelBookingByBuyerApplicationUseCase', () => {

=== server/application/usecases/bookings/createBookingApplicationUseCase.ts — diff ===
@@ -4,6 +4,7 @@ import {
   cancelPendingBookingUseCase,
   createPendingBookingUseCase,
 } from '../../../domain/bookings';
+import { assertListingCanSellUseCase } from '../../../domain/partners';
 import { createMarketplacePaymentIntentUseCase } from '../../../domain/payment';
 import { resolvePlatformFeePercent } from '../../../shared/kernel/platformFee';
 import { isPartnerSuspended } from '../isPartnerSuspended';
@@ -45,6 +46,8 @@ export async function createBookingApplicationUseCase(
         'Este parceiro não está aceitando reservas no momento.'
       );
     }
+    // Rechecado na compra: a verificação pode ter sido revista depois de a oferta ser publicada.
+    await assertListingCanSellUseCase(booking.guideItemId);
     const payment = await createMarketplacePaymentIntentUseCase({
       referenceType: 'booking',
       referenceId: booking.id,

=== server/application/usecases/bookings/setBookableOfferStatusApplicationUseCase.test.ts — diff ===
@@ -6,14 +6,16 @@ vi.mock('../../../domain/bookings', async () => {
 });
 vi.mock('../../../domain/payment', () => ({ assertPartnerReadyForPaidEventUseCase: vi.fn() }));
 vi.mock('../isPartnerSuspended', () => ({ isPartnerSuspended: vi.fn() }));
+vi.mock('../../../domain/partners', () => ({ assertListingCanSellUseCase: vi.fn() }));
 
 import { setBookableOfferStatusUseCase } from '../../../domain/bookings';
+import { assertListingCanSellUseCase } from '../../../domain/partners';
 import { assertPartnerReadyForPaidEventUseCase } from '../../../domain/payment';
 import { isPartnerSuspended } from '../isPartnerSuspended';
 import { setBookableOfferStatusApplicationUseCase } from './setBookableOfferStatusApplicationUseCase';
 
 const ACTOR = { uid: 'p1', admin: false };
-const OFFER = { id: 'o1', partnerId: 'p1' };
+const OFFER = { id: 'o1', partnerId: 'p1', guideItemId: 'item-1' };
 
 /** Executa a verificação que o domínio chama antes de publicar. */
 async function runPublishGuard() {
@@ -33,6 +35,16 @@ describe('setBookableOfferStatusApplicationUseCase', () => {
     await setBookableOfferStatusApplicationUseCase(ACTOR, 'o1', 'published');
     await runPublishGuard();
     expect(assertPartnerReadyForPaidEventUseCase).toHaveBeenCalledWith('p1');
+    expect(assertListingCanSellUseCase).toHaveBeenCalledWith('item-1');
+  });
+
+  it('estabelecimento sem verificação: a publicação é recusada (D12)', async () => {
+    vi.mocked(assertListingCanSellUseCase).mockRejectedValueOnce(
+      Object.assign(new Error('não verificado'), { code: 'LISTING_NOT_VERIFIED' })
+    );
+    await setBookableOfferStatusApplicationUseCase(ACTOR, 'o1', 'published');
+    await expect(runPublishGuard()).rejects.toMatchObject({ code: 'LISTING_NOT_VERIFIED' });
+    expect(assertPartnerReadyForPaidEventUseCase).not.toHaveBeenCalled();
   });
 
   it('Stripe não pronto: a publicação é recusada', async () => {

=== server/application/usecases/bookings/setBookableOfferStatusApplicationUseCase.ts — diff ===
@@ -5,12 +5,13 @@ import {
   BookingDomainError,
   setBookableOfferStatusUseCase,
 } from '../../../domain/bookings';
+import { assertListingCanSellUseCase } from '../../../domain/partners';
 import { assertPartnerReadyForPaidEventUseCase } from '../../../domain/payment';
 import { isPartnerSuspended } from '../isPartnerSuspended';
 
 /**
- * Publicar exige parceiro ativo e conta Stripe pronta para vender (decisão D8): sem isso o turista
- * veria uma oferta pública cujo pagamento falha.
+ * Publicar exige parceiro ativo, estabelecimento verificado com CNPJ (D12) e conta Stripe pronta para
+ * vender (D8): sem isso o turista veria uma oferta pública cujo pagamento falha.
  */
 export async function setBookableOfferStatusApplicationUseCase(
   actor: BookingActor,
@@ -24,6 +25,7 @@ export async function setBookableOfferStatusApplicationUseCase(
         'Conta de parceiro suspensa: não é possível publicar ofertas.'
       );
     }
+    await assertListingCanSellUseCase(offer.guideItemId);
     await assertPartnerReadyForPaidEventUseCase(offer.partnerId);
   });
 }

=== server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getOrder: vi.fn(),
  getListing: vi.fn(),
  createPayment: vi.fn(),
  assertCanSell: vi.fn(),
}));

vi.mock('../../domain/ticketing', async () => {
  const { TicketingDomainError } = await import(
    '../../domain/ticketing/errors/ticketingDomainError'
  );
  return {
    TicketingDomainError,
    getTicketOrderUseCase: mocks.getOrder,
    confirmTicketOrderPaymentUseCase: vi.fn(),
  };
});
vi.mock('../../domain/events', () => ({ getEventListingByIdUseCase: mocks.getListing }));
vi.mock('../../domain/payment', () => ({
  createPaymentForTicketOrderUseCase: mocks.createPayment,
}));
vi.mock('../../domain/partners', async () => {
  const { ListingVerificationError } = await import(
    '../../domain/partners/errors/listingVerificationError'
  );
  return { ListingVerificationError, assertListingCanSellUseCase: mocks.assertCanSell };
});
vi.mock('./isPartnerSuspended', () => ({ isPartnerSuspended: vi.fn().mockResolvedValue(false) }));

import { ListingVerificationError } from '../../domain/partners/errors/listingVerificationError';
import { createTicketOrderPaymentIntentApplicationUseCase } from './createTicketOrderPaymentIntentApplicationUseCase';

const ORDER = {
  id: 'ord-1',
  buyerId: 'buyer-1',
  status: 'pending_payment',
  totalMinor: 5000,
  platformFeeMinor: 500,
  eventListingId: 'ev-1',
  occurrenceId: 'oc-1',
  expiresAt: null,
};

describe('createTicketOrderPaymentIntentApplicationUseCase (D12)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getOrder.mockResolvedValue({ order: ORDER });
    mocks.getListing.mockResolvedValue({
      id: 'ev-1',
      ownerId: 'p1',
      establishmentId: 'item-1',
      title: 'Luau',
    });
    mocks.createPayment.mockResolvedValue({
      paymentIntentId: 'pi_1',
      clientSecret: 'cs',
      status: 'requires_payment_method',
    });
  });

  it('confere a verificação do estabelecimento do evento antes de cobrar', async () => {
    await createTicketOrderPaymentIntentApplicationUseCase(
      { uid: 'buyer-1' },
      { orderId: 'ord-1', idempotencyKey: 'k-12345678' }
    );
    expect(mocks.assertCanSell).toHaveBeenCalledWith('item-1');
    expect(mocks.createPayment).toHaveBeenCalled();
  });

  it('estabelecimento não verificado: não cria o pagamento', async () => {
    mocks.assertCanSell.mockRejectedValueOnce(
      new ListingVerificationError('LISTING_NOT_VERIFIED', 'x')
    );
    await expect(
      createTicketOrderPaymentIntentApplicationUseCase(
        { uid: 'buyer-1' },
        { orderId: 'ord-1', idempotencyKey: 'k-12345678' }
      )
    ).rejects.toMatchObject({ code: 'UNPROCESSABLE_ENTITY' });
    expect(mocks.createPayment).not.toHaveBeenCalled();
  });
});

=== server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.ts — diff ===
@@ -1,4 +1,5 @@
 import { getEventListingByIdUseCase } from '../../domain/events';
+import { assertListingCanSellUseCase, ListingVerificationError } from '../../domain/partners';
 import { createPaymentForTicketOrderUseCase } from '../../domain/payment';
 import {
   confirmTicketOrderPaymentUseCase,
@@ -79,6 +80,19 @@ export async function createTicketOrderPaymentIntentApplicationUseCase(
     );
   }
 
+  // Ingresso pago só de evento cujo estabelecimento ou perfil de produtor foi verificado (D12).
+  try {
+    await assertListingCanSellUseCase(listing.establishmentId ?? '');
+  } catch (error) {
+    if (error instanceof ListingVerificationError) {
+      throw new TicketingDomainError(
+        'UNPROCESSABLE_ENTITY',
+        'Este organizador ainda não está liberado para vender ingressos.'
+      );
+    }
+    throw error;
+  }
+
   const paymentResult = await createPaymentForTicketOrderUseCase({
     orderId: order.id,
     buyerId: order.buyerId,

=== server/application/usecases/deletePartnerItemApplicationUseCase.test.ts — diff ===
@@ -6,7 +6,12 @@ import {
   getItemByIdUseCase,
   type PublicResourceDTO,
 } from '../../domain/guide';
-import { linkBusinessUseCase, unlinkBusinessUseCase } from '../../domain/partners';
+import {
+  deleteListingVerificationUseCase,
+  linkBusinessUseCase,
+  unlinkBusinessUseCase,
+} from '../../domain/partners';
+import { deleteVerificationFileUseCase } from '../../domain/media';
 
 vi.mock('../../domain/guide', () => ({
   getItemByIdUseCase: vi.fn(),
@@ -16,6 +21,11 @@ vi.mock('../../domain/guide', () => ({
 vi.mock('../../domain/partners', () => ({
   linkBusinessUseCase: vi.fn(),
   unlinkBusinessUseCase: vi.fn(),
+  deleteListingVerificationUseCase: vi.fn().mockResolvedValue(['verification/partner-B/c.pdf']),
+}));
+
+vi.mock('../../domain/media', () => ({
+  deleteVerificationFileUseCase: vi.fn().mockResolvedValue(undefined),
 }));
 
 describe('deletePartnerItemApplicationUseCase', () => {
@@ -51,6 +61,8 @@ describe('deletePartnerItemApplicationUseCase', () => {
     expect(unlinkBusinessUseCase).toHaveBeenCalledWith('partner-B', 'item-100');
     expect(deleteGuideItemUseCase).toHaveBeenCalledWith(regularUser, 'item-100');
     expect(linkBusinessUseCase).not.toHaveBeenCalled();
+    expect(deleteListingVerificationUseCase).toHaveBeenCalledWith('item-100');
+    expect(deleteVerificationFileUseCase).toHaveBeenCalledWith('verification/partner-B/c.pdf');
   });
 
   it('unlink falha + Guide não é apagado', async () => {

=== server/application/usecases/deletePartnerItemApplicationUseCase.ts — diff ===
@@ -1,6 +1,11 @@
 import type { AuthenticatedUserContext } from '../security/authenticatedUserContext';
 import { getItemByIdUseCase, deleteGuideItemUseCase } from '../../domain/guide';
-import { linkBusinessUseCase, unlinkBusinessUseCase } from '../../domain/partners';
+import {
+  deleteListingVerificationUseCase,
+  linkBusinessUseCase,
+  unlinkBusinessUseCase,
+} from '../../domain/partners';
+import { deleteVerificationFiles } from './listingVerification/deleteVerificationFiles';
 
 function isNotFoundError(error: unknown): boolean {
   if (!error) return false;
@@ -56,4 +61,7 @@ export async function deletePartnerItemApplicationUseCase(
 
     throw error;
   }
+
+  // Documento e arquivos de verificação saem junto com o estabelecimento (LGPD, §7.5).
+  await deleteVerificationFiles(await deleteListingVerificationUseCase(id));
 }

=== server/application/usecases/deleteUserAccountApplicationUseCase.ts — diff ===
@@ -1,14 +1,20 @@
 import { deleteResourcesByOwnerUseCase } from '../../domain/guide';
 import { deleteEventsByOwnerUseCase } from '../../domain/events';
-import { deletePartnerProfileUseCase } from '../../domain/partners';
+import {
+  deleteOwnerListingVerificationsUseCase,
+  deletePartnerProfileUseCase,
+} from '../../domain/partners';
 import { deleteReviewsByUserUseCase } from '../../domain/reviews';
 import { deleteUserAccountUseCase } from '../../domain/users';
+import { deleteVerificationFiles } from './listingVerification/deleteVerificationFiles';
 
 export interface UserDeletionCoordinatorDependencies {
   deleteReviewsByUser: (uid: string) => Promise<void>;
   deletePartnerProfile: (uid: string) => Promise<void>;
   deleteResourcesByOwner: (uid: string) => Promise<void>;
   deleteEventsByOwner?: (uid: string) => Promise<void>;
+  /** Verificações, documentos cifrados e arquivos enviados (D12). */
+  deleteListingVerifications?: (uid: string) => Promise<void>;
   deleteUserAccount: (uid: string) => Promise<void>;
 }
 
@@ -19,6 +25,8 @@ export async function deleteUserAccountApplicationUseCase(
     deletePartnerProfile: (id) => deletePartnerProfileUseCase(id),
     deleteResourcesByOwner: (id) => deleteResourcesByOwnerUseCase(id),
     deleteEventsByOwner: (id) => deleteEventsByOwnerUseCase(id),
+    deleteListingVerifications: async (id) =>
+      deleteVerificationFiles(await deleteOwnerListingVerificationsUseCase(id)),
     deleteUserAccount: (id) => deleteUserAccountUseCase(id),
   }
 ): Promise<void> {
@@ -31,6 +39,9 @@ export async function deleteUserAccountApplicationUseCase(
   if (deps.deleteEventsByOwner) {
     await deps.deleteEventsByOwner(uid);
   }
+  if (deps.deleteListingVerifications) {
+    await deps.deleteListingVerifications(uid);
+  }
   await deps.deletePartnerProfile(uid);
   await deps.deleteUserAccount(uid);
 }

=== server/application/usecases/listingVerification/deleteVerificationFiles.ts — ARQUIVO NOVO, conteúdo completo ===
import { deleteVerificationFileUseCase } from '../../../domain/media';

/** Falha em um arquivo não interrompe a exclusão; fica no log para limpeza manual. */
export async function deleteVerificationFiles(paths: string[]): Promise<void> {
  const results = await Promise.allSettled(
    paths.map((path) => deleteVerificationFileUseCase(path))
  );
  const failed = results.filter((result) => result.status === 'rejected').length;
  if (failed > 0) {
    console.error('[deleteVerificationFiles] arquivos não apagados', { failed });
  }
}

=== server/application/usecases/listingVerification/getListingVerificationApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  getListingVerificationUseCase,
  ListingVerificationError,
  type ListingVerificationView,
} from '../../../domain/partners';
import { loadVerificationListing } from './loadVerificationListing';

export async function getListingVerificationApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string
): Promise<ListingVerificationView> {
  const listing = await loadVerificationListing(itemId);
  if (!listing) {
    throw new ListingVerificationError('NOT_FOUND', 'Estabelecimento não encontrado.');
  }
  return getListingVerificationUseCase(actor, listing);
}

=== server/application/usecases/listingVerification/loadVerificationListing.ts — ARQUIVO NOVO, conteúdo completo ===
import { getItemByIdUseCase } from '../../../domain/guide';
import type { VerificationListing } from '../../../domain/partners';

/** Estabelecimento como a verificação o enxerga: só id, dono e categoria. */
export async function loadVerificationListing(itemId: string): Promise<VerificationListing | null> {
  const item = await getItemByIdUseCase(itemId);
  if (!item || typeof item.ownerId !== 'string' || !item.ownerId) return null;
  return { id: item.id, ownerId: item.ownerId, category: String(item.category ?? '') };
}

=== server/application/usecases/listingVerification/readListingVerificationFileApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { readVerificationFileUseCase } from '../../../domain/media';
import {
  getListingVerificationFilePathUseCase,
  type ListingVerificationFiles,
} from '../../../domain/partners';

/** Admin abre o documento pelo backend: o arquivo nunca ganha URL pública nem assinada. */
export async function readListingVerificationFileApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string,
  kind: keyof ListingVerificationFiles
): Promise<{ data: Buffer; contentType: string } | null> {
  const path = await getListingVerificationFilePathUseCase(actor, itemId, kind);
  if (!path) return null;
  // Auditoria (AGENTS.md §7.10 A09): quem abriu qual documento, sem dado pessoal no log.
  console.info('[audit] verification_file_read', { adminUid: actor.uid, itemId, kind });
  return readVerificationFileUseCase(path);
}

=== server/application/usecases/listingVerification/submitListingVerificationApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getItem: vi.fn(),
  isOwnFile: vi.fn(),
  submit: vi.fn(),
}));

vi.mock('../../../domain/guide', () => ({ getItemByIdUseCase: mocks.getItem }));
vi.mock('../../../domain/media', () => ({ isOwnVerificationFileUseCase: mocks.isOwnFile }));
vi.mock('../../../domain/partners', async () => {
  const { ListingVerificationError } = await import(
    '../../../domain/partners/errors/listingVerificationError'
  );
  return { ListingVerificationError, submitListingVerificationUseCase: mocks.submit };
});

import { submitListingVerificationApplicationUseCase } from './submitListingVerificationApplicationUseCase';

const actor = { uid: 'owner-1' };

describe('submitListingVerificationApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('recusa arquivo de outra conta antes de gravar', async () => {
    mocks.getItem.mockResolvedValue({ id: 'item-1', ownerId: 'owner-1', category: 'hotel' });
    mocks.isOwnFile.mockReturnValue(false);
    await expect(
      submitListingVerificationApplicationUseCase(actor, 'item-1', {
        mode: 'document',
        files: { identity: 'verification/owner-2/i.webp' },
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(mocks.submit).not.toHaveBeenCalled();
  });

  it('estabelecimento inexistente: NOT_FOUND', async () => {
    mocks.getItem.mockResolvedValue(null);
    await expect(
      submitListingVerificationApplicationUseCase(actor, 'item-x', {
        mode: 'linked',
        sourceItemId: 'item-1',
      })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('perfil de produtor carrega o estabelecimento de origem', async () => {
    mocks.getItem.mockImplementation(async (id: string) =>
      id === 'item-3'
        ? { id: 'item-3', ownerId: 'owner-1', category: 'producer' }
        : { id: 'item-1', ownerId: 'owner-1', category: 'hotel' }
    );
    await submitListingVerificationApplicationUseCase(actor, 'item-3', {
      mode: 'linked',
      sourceItemId: 'item-1',
    });
    expect(mocks.submit).toHaveBeenCalledWith(
      actor,
      { id: 'item-3', ownerId: 'owner-1', category: 'producer' },
      { mode: 'linked', sourceItemId: 'item-1' },
      { id: 'item-1', ownerId: 'owner-1', category: 'hotel' }
    );
  });
});

=== server/application/usecases/listingVerification/submitListingVerificationApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { isOwnVerificationFileUseCase } from '../../../domain/media';
import {
  ListingVerificationError,
  type ListingVerificationView,
  type SubmitListingVerificationInput,
  submitListingVerificationUseCase,
} from '../../../domain/partners';
import { loadVerificationListing } from './loadVerificationListing';

/** Envio da verificação do estabelecimento (D12): confere dono, origem do perfil de produtor e os arquivos. */
export async function submitListingVerificationApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string,
  input: SubmitListingVerificationInput
): Promise<ListingVerificationView> {
  const listing = await loadVerificationListing(itemId);
  if (!listing) {
    throw new ListingVerificationError('NOT_FOUND', 'Estabelecimento não encontrado.');
  }
  for (const path of Object.values(input.files ?? {})) {
    if (path && !isOwnVerificationFileUseCase(actor.uid, path)) {
      throw new ListingVerificationError('FORBIDDEN', 'Arquivo de verificação inválido.');
    }
  }
  const source = input.sourceItemId ? await loadVerificationListing(input.sourceItemId) : null;
  return submitListingVerificationUseCase(actor, listing, input, source);
}

=== server/domain/media/adapters/firebaseStorageObjectAdapter.ts — diff ===
@@ -19,6 +19,24 @@ export class FirebaseStorageObjectAdapter implements ObjectStoragePort {
     return { path, url };
   }
 
+  async savePrivate(path: string, data: Buffer, contentType: string): Promise<void> {
+    await adminStorage
+      .bucket()
+      .file(path)
+      .save(data, {
+        resumable: false,
+        metadata: { contentType, cacheControl: 'private, no-store' },
+      });
+  }
+
+  async readPrivate(path: string): Promise<{ data: Buffer; contentType: string } | null> {
+    const file = adminStorage.bucket().file(path);
+    const [exists] = await file.exists();
+    if (!exists) return null;
+    const [[data], [metadata]] = await Promise.all([file.download(), file.getMetadata()]);
+    return { data, contentType: String(metadata.contentType ?? 'application/octet-stream') };
+  }
+
   async delete(path: string): Promise<void> {
     await adminStorage.bucket().file(path).delete({ ignoreNotFound: true });
   }

=== server/domain/media/controllers/mediaController.ts — diff ===
@@ -1,7 +1,8 @@
 import type { Response } from 'express';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import { MediaDomainError } from '../errors/mediaDomainError';
-import { UploadContentImageSchema } from '../schemas/mediaSchema';
+import { UploadContentImageSchema, UploadVerificationFileSchema } from '../schemas/mediaSchema';
+import { storeVerificationFileUseCase } from '../usecases/storeVerificationFileUseCase';
 import { uploadContentImageUseCase } from '../usecases/uploadContentImageUseCase';
 
 export class MediaController {
@@ -35,4 +36,39 @@ export class MediaController {
         .json({ error: { code: 'INTERNAL_ERROR', message: 'Não foi possível enviar a imagem.' } });
     }
   }
+
+  static async uploadVerificationFile(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    const uid = req.user?.uid;
+    if (!uid) {
+      return res
+        .status(401)
+        .json({ error: { code: 'UNAUTHENTICATED', message: 'Não autenticado.' } });
+    }
+    const parsed = UploadVerificationFileSchema.safeParse(req.body);
+    if (!parsed.success) {
+      return res
+        .status(400)
+        .json({ error: { code: 'VALIDATION_ERROR', message: 'Arquivo inválido.' } });
+    }
+    try {
+      const stored = await storeVerificationFileUseCase({
+        uid,
+        fileBase64: parsed.data.fileBase64,
+      });
+      // Sem URL: o arquivo é privado e só o admin o lê pelo backend.
+      return res.status(201).json({ fileId: stored.path, contentType: stored.contentType });
+    } catch (error: unknown) {
+      if (error instanceof MediaDomainError) {
+        return res
+          .status(error.statusCode)
+          .json({ error: { code: error.code, message: error.message } });
+      }
+      console.error('[MediaController.uploadVerificationFile]', {
+        name: error instanceof Error ? error.name : 'UnknownError',
+      });
+      return res
+        .status(500)
+        .json({ error: { code: 'INTERNAL_ERROR', message: 'Não foi possível enviar o arquivo.' } });
+    }
+  }
 }

=== server/domain/media/errors/mediaDomainError.ts — diff ===
@@ -1,4 +1,8 @@
-export type MediaErrorCode = 'INVALID_IMAGE' | 'IMAGE_TOO_LARGE' | 'STORAGE_UNAVAILABLE';
+export type MediaErrorCode =
+  | 'INVALID_IMAGE'
+  | 'IMAGE_TOO_LARGE'
+  | 'INVALID_DOCUMENT_FILE'
+  | 'STORAGE_UNAVAILABLE';
 
 export class MediaDomainError extends Error {
   constructor(

=== server/domain/media/factory.ts — diff ===
@@ -1,8 +1,10 @@
 import { FirebaseStorageObjectAdapter } from './adapters/firebaseStorageObjectAdapter';
 import { SharpImageProcessorAdapter } from './adapters/sharpImageProcessorAdapter';
 import { MediaService } from './services/mediaService';
+import { PrivateDocumentService } from './services/privateDocumentService';
 
 let mediaService: MediaService | undefined;
+let privateDocumentService: PrivateDocumentService | undefined;
 
 export function getMediaService(): MediaService {
   mediaService ??= new MediaService(
@@ -11,3 +13,11 @@ export function getMediaService(): MediaService {
   );
   return mediaService;
 }
+
+export function getPrivateDocumentService(): PrivateDocumentService {
+  privateDocumentService ??= new PrivateDocumentService(
+    new SharpImageProcessorAdapter(),
+    new FirebaseStorageObjectAdapter()
+  );
+  return privateDocumentService;
+}

=== server/domain/media/index.ts — diff ===
@@ -1,5 +1,10 @@
 export { uploadContentImageUseCase } from './usecases/uploadContentImageUseCase';
 export { prepareImageForStorageUseCase } from './usecases/prepareImageForStorageUseCase';
+export { storeVerificationFileUseCase } from './usecases/storeVerificationFileUseCase';
+export { isOwnVerificationFileUseCase } from './usecases/isOwnVerificationFileUseCase';
+export { readVerificationFileUseCase } from './usecases/readVerificationFileUseCase';
+export { deleteVerificationFileUseCase } from './usecases/deleteVerificationFileUseCase';
+export type { StoredPrivateDocument } from './services/privateDocumentService';
 export { MediaDomainError } from './errors/mediaDomainError';
 export type { ProcessedImage } from './ports/imageProcessorPort';
 export type { ContentImageFolder } from './types/mediaTypes';

=== server/domain/media/ports/objectStoragePort.ts — diff ===
@@ -6,4 +6,7 @@ export interface StoredObject {
 export interface ObjectStoragePort {
   savePublic(path: string, data: Buffer, contentType: string): Promise<StoredObject>;
   delete(path: string): Promise<void>;
+  /** Sem URL pública nem token: o arquivo só é lido pelo backend (documentos de verificação). */
+  savePrivate(path: string, data: Buffer, contentType: string): Promise<void>;
+  readPrivate(path: string): Promise<{ data: Buffer; contentType: string } | null>;
 }

=== server/domain/media/routes/mediaRoutes.ts — diff ===
@@ -5,6 +5,17 @@ import { MediaController } from '../controllers/mediaController';
 const router = Router();
 
 // Autenticação antes do parser de 9 MB: anônimos não conseguem enviar corpos grandes.
-router.post('/images', verifyAuthToken, express.json({ limit: '9mb' }), MediaController.uploadImage);
+router.post(
+  '/images',
+  verifyAuthToken,
+  express.json({ limit: '9mb' }),
+  MediaController.uploadImage
+);
+router.post(
+  '/verification-files',
+  verifyAuthToken,
+  express.json({ limit: '9mb' }),
+  MediaController.uploadVerificationFile
+);
 
 export default router;

=== server/domain/media/schemas/mediaSchema.ts — diff ===
@@ -1,6 +1,13 @@
 import { z } from 'zod';
 import { CONTENT_IMAGE_FOLDERS } from '../types/mediaTypes';
 
+/** PDF ou foto de documento (D12); tipo conferido pelo conteúdo no service. */
+export const UploadVerificationFileSchema = z
+  .object({
+    fileBase64: z.string().min(16).max(8_500_000),
+  })
+  .strict();
+
 export const UploadContentImageSchema = z
   .object({
     imageBase64: z.string().min(16).max(8_500_000),

=== server/domain/media/services/mediaService.test.ts — diff ===
@@ -4,7 +4,9 @@ import type { ImageProcessorPort } from '../ports/imageProcessorPort';
 import type { ObjectStoragePort } from '../ports/objectStoragePort';
 import { MediaService } from './mediaService';
 
-const JPEG_HEADER = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
+const JPEG_HEADER = Buffer.from([
+  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
+]);
 
 function createService() {
   const processor: ImageProcessorPort = {
@@ -18,6 +20,8 @@ function createService() {
   const storage: ObjectStoragePort = {
     savePublic: vi.fn(async (path: string) => ({ path, url: `https://cdn.test/${path}` })),
     delete: vi.fn(),
+    savePrivate: vi.fn(),
+    readPrivate: vi.fn(),
   };
   return { service: new MediaService(processor, storage), processor, storage };
 }
@@ -28,7 +32,11 @@ describe('MediaService', () => {
     const big = Buffer.alloc(6 * 1024 * 1024 + 1);
     JPEG_HEADER.copy(big);
     await expect(
-      service.uploadContentImage({ uid: 'u1', folder: 'guia_local', imageBase64: big.toString('base64') })
+      service.uploadContentImage({
+        uid: 'u1',
+        folder: 'guia_local',
+        imageBase64: big.toString('base64'),
+      })
     ).rejects.toMatchObject({ code: 'IMAGE_TOO_LARGE', statusCode: 413 });
   });
 
@@ -37,7 +45,9 @@ describe('MediaService', () => {
     const gif = Buffer.from('GIF89a-xxxxxxxx').toString('base64');
     const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>').toString('base64');
     expect(() => service.decodeBase64Image(gif)).toThrow(MediaDomainError);
-    expect(() => service.decodeBase64Image(`data:image/png;base64,${svg}`)).toThrow(MediaDomainError);
+    expect(() => service.decodeBase64Image(`data:image/png;base64,${svg}`)).toThrow(
+      MediaDomainError
+    );
   });
 
   it('processa e grava em content/<pasta>/<uid>/<uuid>.webp', async () => {
@@ -55,14 +65,20 @@ describe('MediaService', () => {
   it('converte falha do processador em INVALID_IMAGE', async () => {
     const { service, processor } = createService();
     vi.mocked(processor.process).mockRejectedValueOnce(new Error('corrupt'));
-    await expect(service.processImage(JPEG_HEADER, 1024)).rejects.toMatchObject({ code: 'INVALID_IMAGE' });
+    await expect(service.processImage(JPEG_HEADER, 1024)).rejects.toMatchObject({
+      code: 'INVALID_IMAGE',
+    });
   });
 
   it('converte falha do storage em STORAGE_UNAVAILABLE', async () => {
     const { service, storage } = createService();
     vi.mocked(storage.savePublic).mockRejectedValueOnce(new Error('quota'));
     await expect(
-      service.uploadContentImage({ uid: 'u1', folder: 'partners', imageBase64: JPEG_HEADER.toString('base64') })
+      service.uploadContentImage({
+        uid: 'u1',
+        folder: 'partners',
+        imageBase64: JPEG_HEADER.toString('base64'),
+      })
     ).rejects.toMatchObject({ code: 'STORAGE_UNAVAILABLE', statusCode: 503 });
   });
 });

=== server/domain/media/services/privateDocumentService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it, vi } from 'vitest';
import type { ImageProcessorPort } from '../ports/imageProcessorPort';
import type { ObjectStoragePort } from '../ports/objectStoragePort';
import { PrivateDocumentService } from './privateDocumentService';

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1]);
const PDF = Buffer.from('%PDF-1.7\n1 0 obj\n');

function setup() {
  const processor: ImageProcessorPort = {
    process: vi.fn().mockResolvedValue({
      buffer: Buffer.from('webp-sem-exif'),
      contentType: 'image/webp',
      width: 10,
      height: 10,
    }),
  };
  const storage: ObjectStoragePort = {
    savePublic: vi.fn(),
    delete: vi.fn(),
    savePrivate: vi.fn(),
    readPrivate: vi.fn(),
  };
  return { service: new PrivateDocumentService(processor, storage), processor, storage };
}

describe('PrivateDocumentService (D12)', () => {
  it('foto vira WebP sem metadados, em pasta privada com nome do servidor', async () => {
    const { service, processor, storage } = setup();
    const stored = await service.storeVerificationFile({
      uid: 'u1',
      fileBase64: `data:image/jpeg;base64,${JPEG.toString('base64')}`,
    });
    expect(processor.process).toHaveBeenCalled();
    expect(stored.path).toMatch(/^verification\/u1\/[0-9a-f-]{36}\.webp$/);
    expect(storage.savePrivate).toHaveBeenCalledWith(
      stored.path,
      Buffer.from('webp-sem-exif'),
      'image/webp'
    );
    expect(storage.savePublic).not.toHaveBeenCalled();
  });

  it('PDF é guardado como PDF, sem reprocessar', async () => {
    const { service, processor, storage } = setup();
    const stored = await service.storeVerificationFile({
      uid: 'u1',
      fileBase64: PDF.toString('base64'),
    });
    expect(processor.process).not.toHaveBeenCalled();
    expect(stored.contentType).toBe('application/pdf');
    expect(storage.savePrivate).toHaveBeenCalledWith(stored.path, PDF, 'application/pdf');
  });

  it('recusa SVG e HTML pelo conteúdo', async () => {
    const { service } = setup();
    for (const text of ['<svg xmlns="http://www.w3.org/2000/svg"/>', '<html><script>x</script>']) {
      await expect(
        service.storeVerificationFile({
          uid: 'u1',
          fileBase64: Buffer.from(text).toString('base64'),
        })
      ).rejects.toMatchObject({ code: 'INVALID_DOCUMENT_FILE' });
    }
  });

  it('só aceita referência a arquivo da pasta do próprio dono', () => {
    const { service } = setup();
    expect(service.isOwnVerificationFile('u1', 'verification/u1/a.pdf')).toBe(true);
    expect(service.isOwnVerificationFile('u1', 'verification/u2/a.pdf')).toBe(false);
    expect(service.isOwnVerificationFile('u1', 'verification/u1/../u2/a.pdf')).toBe(false);
    expect(service.isOwnVerificationFile('u1', 'content/partners/u1/a.webp')).toBe(false);
  });

  it('não lê nem apaga fora da pasta de verificação', async () => {
    const { service, storage } = setup();
    expect(await service.readVerificationFile('profiles/u1')).toBeNull();
    await service.deleteVerificationFile('content/x.webp');
    expect(storage.readPrivate).not.toHaveBeenCalled();
    expect(storage.delete).not.toHaveBeenCalled();
  });
});

=== server/domain/media/services/privateDocumentService.ts — ARQUIVO NOVO, conteúdo completo ===
import { randomUUID } from 'crypto';
import { MediaDomainError } from '../errors/mediaDomainError';
import type { ImageProcessorPort } from '../ports/imageProcessorPort';
import type { ObjectStoragePort } from '../ports/objectStoragePort';
import { MAX_IMAGE_BYTES, VERIFICATION_FILES_PREFIX } from '../types/mediaTypes';
import { detectDocumentType } from '../utils/detectDocumentType';

const MAX_DOCUMENT_DIMENSION = 2400;

export interface StoredPrivateDocument {
  path: string;
  contentType: string;
}

/** Documentos de verificação (D12): pasta privada, nome gerado pelo servidor, fotos sem metadados (EXIF/GPS). */
export class PrivateDocumentService {
  constructor(
    private readonly processor: ImageProcessorPort,
    private readonly storage: ObjectStoragePort
  ) {}

  async storeVerificationFile(params: {
    uid: string;
    fileBase64: string;
  }): Promise<StoredPrivateDocument> {
    const clean = params.fileBase64.replace(/^data:[a-z/+.-]+;base64,/i, '');
    const buffer = Buffer.from(clean, 'base64');
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      throw new MediaDomainError('IMAGE_TOO_LARGE', 'Arquivo acima de 6 MB.', 413);
    }
    const type = detectDocumentType(buffer);
    if (!type) {
      throw new MediaDomainError(
        'INVALID_DOCUMENT_FILE',
        'Envie um PDF ou uma foto JPEG, PNG ou WebP.',
        400
      );
    }

    let data: Buffer = buffer;
    let contentType: string = type;
    if (type !== 'application/pdf') {
      try {
        const processed = await this.processor.process(buffer, {
          maxDimension: MAX_DOCUMENT_DIMENSION,
        });
        data = processed.buffer;
        contentType = processed.contentType;
      } catch {
        throw new MediaDomainError('INVALID_DOCUMENT_FILE', 'Não foi possível ler a foto.', 400);
      }
    }

    const extension = contentType === 'application/pdf' ? 'pdf' : 'webp';
    const path = `${VERIFICATION_FILES_PREFIX}/${params.uid}/${randomUUID()}.${extension}`;
    try {
      await this.storage.savePrivate(path, data, contentType);
    } catch {
      throw new MediaDomainError('STORAGE_UNAVAILABLE', 'Falha ao salvar o arquivo.', 503);
    }
    return { path, contentType };
  }

  /** Só caminhos da pasta privada do próprio dono; impede referenciar o arquivo de outra conta. */
  isOwnVerificationFile(uid: string, path: string): boolean {
    return (
      path.startsWith(`${VERIFICATION_FILES_PREFIX}/${uid}/`) &&
      !path.includes('..') &&
      /^[\w/.-]+$/.test(path)
    );
  }

  readVerificationFile(path: string): Promise<{ data: Buffer; contentType: string } | null> {
    if (!path.startsWith(`${VERIFICATION_FILES_PREFIX}/`)) return Promise.resolve(null);
    return this.storage.readPrivate(path);
  }

  async deleteVerificationFile(path: string): Promise<void> {
    if (!path.startsWith(`${VERIFICATION_FILES_PREFIX}/`)) return;
    await this.storage.delete(path);
  }
}

=== server/domain/media/types/mediaTypes.ts — diff ===
@@ -1,3 +1,6 @@
 export const CONTENT_IMAGE_FOLDERS = ['guia_local', 'agenda_eventos', 'partners'] as const;
 export type ContentImageFolder = (typeof CONTENT_IMAGE_FOLDERS)[number];
 export const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
+
+/** Prefixo privado dos documentos de verificação (D12); `storage.rules` nega qualquer leitura do cliente. */
+export const VERIFICATION_FILES_PREFIX = 'verification';

=== server/domain/media/usecases/deleteVerificationFileUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getPrivateDocumentService } from '../factory';

export function deleteVerificationFileUseCase(path: string): Promise<void> {
  return getPrivateDocumentService().deleteVerificationFile(path);
}

=== server/domain/media/usecases/isOwnVerificationFileUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getPrivateDocumentService } from '../factory';

export function isOwnVerificationFileUseCase(uid: string, path: string): boolean {
  return getPrivateDocumentService().isOwnVerificationFile(uid, path);
}

=== server/domain/media/usecases/readVerificationFileUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getPrivateDocumentService } from '../factory';

export function readVerificationFileUseCase(
  path: string
): Promise<{ data: Buffer; contentType: string } | null> {
  return getPrivateDocumentService().readVerificationFile(path);
}

=== server/domain/media/usecases/storeVerificationFileUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getPrivateDocumentService } from '../factory';
import type { StoredPrivateDocument } from '../services/privateDocumentService';

export function storeVerificationFileUseCase(params: {
  uid: string;
  fileBase64: string;
}): Promise<StoredPrivateDocument> {
  return getPrivateDocumentService().storeVerificationFile(params);
}

=== server/domain/media/utils/detectDocumentType.ts — ARQUIVO NOVO, conteúdo completo ===
import { detectImageType, type SupportedImageType } from './detectImageType';

export type SupportedDocumentType = SupportedImageType | 'application/pdf';

/** Tipo pelo conteúdo (magic bytes), nunca pela extensão (AGENTS.md §7.10). SVG e HTML são recusados. */
export function detectDocumentType(buffer: Buffer): SupportedDocumentType | null {
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return 'application/pdf';
  }
  return detectImageType(buffer);
}

=== server/domain/partners/adapters/firestoreListingVerificationAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import type { DocumentData, Transaction } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { ListingVerificationError } from '../errors/listingVerificationError';
import type {
  ListingVerificationPage,
  ListingVerificationRepositoryPort,
} from '../ports/listingVerificationRepositoryPort';
import type {
  ListingVerificationRecord,
  ListingVerificationStatus,
  VerificationDocumentEntry,
} from '../types/listingVerification';

const VERIFICATIONS = 'listingVerifications';
const DOCUMENTS = 'verificationDocuments';
const OWNERS = 'verificationOwners';

function toRecord(data: DocumentData): ListingVerificationRecord {
  return data as ListingVerificationRecord;
}

/** Coleções só de backend (`allow read, write: if false`): o cliente lê pela API (§6.2). */
export class FirestoreListingVerificationAdapter implements ListingVerificationRepositoryPort {
  async get(itemId: string): Promise<ListingVerificationRecord | null> {
    const snapshot = await adminDb.collection(VERIFICATIONS).doc(itemId).get();
    return snapshot.exists ? toRecord(snapshot.data() as DocumentData) : null;
  }

  async getDocumentEntry(documentIndex: string): Promise<VerificationDocumentEntry | null> {
    const snapshot = await adminDb.collection(DOCUMENTS).doc(documentIndex).get();
    return snapshot.exists ? (snapshot.data() as VerificationDocumentEntry) : null;
  }

  async saveSubmission(record: ListingVerificationRecord): Promise<void> {
    await adminDb.runTransaction(async (transaction) => {
      const recordRef = adminDb.collection(VERIFICATIONS).doc(record.itemId);
      const previousSnapshot = await transaction.get(recordRef);
      const previous = previousSnapshot.exists
        ? toRecord(previousSnapshot.data() as DocumentData)
        : null;

      let entry: VerificationDocumentEntry | null = null;
      const entryRef = record.documentIndex
        ? adminDb.collection(DOCUMENTS).doc(record.documentIndex)
        : null;
      if (entryRef) {
        const entrySnapshot = await transaction.get(entryRef);
        entry = entrySnapshot.exists ? (entrySnapshot.data() as VerificationDocumentEntry) : null;
        // Rechecado dentro da transação: dois envios simultâneos não podem reservar o mesmo documento.
        if (entry && entry.ownerId !== record.ownerId) {
          throw new ListingVerificationError(
            'DOCUMENT_IN_USE',
            'Este documento já está em outra conta.'
          );
        }
        if (record.documentType === 'cnpj' && entry?.itemId && entry.itemId !== record.itemId) {
          throw new ListingVerificationError(
            'CNPJ_ALREADY_USED',
            'Cada CNPJ vale para um estabelecimento. Filiais usam o CNPJ da filial.'
          );
        }
      }

      this.releasePreviousCnpj(transaction, previous, record.documentIndex);
      transaction.set(recordRef, record);
      if (entryRef && record.documentIndex && record.documentType) {
        transaction.set(entryRef, {
          documentIndex: record.documentIndex,
          ownerId: record.ownerId,
          documentType: record.documentType,
          itemId: record.documentType === 'cnpj' ? record.itemId : null,
          verifiedAt: entry?.verifiedAt ?? null,
        } satisfies VerificationDocumentEntry);
      }
    });
  }

  async saveReview(record: ListingVerificationRecord): Promise<void> {
    await adminDb.runTransaction(async (transaction) => {
      const ownerRef = adminDb.collection(OWNERS).doc(record.ownerId);
      const ownerSnapshot = await transaction.get(ownerRef);
      transaction.set(adminDb.collection(VERIFICATIONS).doc(record.itemId), record);
      if (record.status !== 'approved' || !record.documentIndex) return;

      transaction.set(
        adminDb.collection(DOCUMENTS).doc(record.documentIndex),
        { verifiedAt: record.reviewedAt },
        { merge: true }
      );
      if (record.documentType === 'cnpj' && !ownerSnapshot.get('salesDocumentIndex')) {
        transaction.set(
          ownerRef,
          { ownerId: record.ownerId, salesDocumentIndex: record.documentIndex },
          { merge: true }
        );
      }
    });
  }

  async listByStatus(
    status: ListingVerificationStatus,
    limit: number,
    cursor: string | null
  ): Promise<ListingVerificationPage> {
    let query = adminDb
      .collection(VERIFICATIONS)
      .where('status', '==', status)
      .orderBy('submittedAt', 'asc')
      .limit(limit + 1);
    if (cursor) {
      const cursorSnapshot = await adminDb.collection(VERIFICATIONS).doc(cursor).get();
      if (cursorSnapshot.exists) query = query.startAfter(cursorSnapshot);
    }
    const snapshot = await query.get();
    const docs = snapshot.docs.slice(0, limit);
    return {
      data: docs.map((doc) => toRecord(doc.data())),
      nextCursor: snapshot.docs.length > limit ? (docs.at(-1)?.id ?? null) : null,
    };
  }

  async getSalesDocumentIndex(ownerId: string): Promise<string | null> {
    const snapshot = await adminDb.collection(OWNERS).doc(ownerId).get();
    const value = snapshot.get('salesDocumentIndex');
    return typeof value === 'string' ? value : null;
  }

  async delete(itemId: string): Promise<ListingVerificationRecord | null> {
    return adminDb.runTransaction(async (transaction) => {
      const recordRef = adminDb.collection(VERIFICATIONS).doc(itemId);
      const snapshot = await transaction.get(recordRef);
      if (!snapshot.exists) return null;
      const record = toRecord(snapshot.data() as DocumentData);
      this.releasePreviousCnpj(transaction, record, null);
      transaction.delete(recordRef);
      return record;
    });
  }

  async deleteByOwner(ownerId: string): Promise<ListingVerificationRecord[]> {
    const [records, entries] = await Promise.all([
      adminDb.collection(VERIFICATIONS).where('ownerId', '==', ownerId).get(),
      adminDb.collection(DOCUMENTS).where('ownerId', '==', ownerId).get(),
    ]);
    const batch = adminDb.batch();
    for (const doc of [...records.docs, ...entries.docs]) batch.delete(doc.ref);
    batch.delete(adminDb.collection(OWNERS).doc(ownerId));
    await batch.commit();
    return records.docs.map((doc) => toRecord(doc.data()));
  }

  /** O CNPJ antigo volta a ficar livre; o CPF fica com a conta, porque outros estabelecimentos podem usá-lo. */
  private releasePreviousCnpj(
    transaction: Transaction,
    previous: ListingVerificationRecord | null,
    nextIndex: string | null
  ): void {
    if (previous?.documentType !== 'cnpj' || !previous.documentIndex) return;
    if (previous.documentIndex === nextIndex) return;
    transaction.delete(adminDb.collection(DOCUMENTS).doc(previous.documentIndex));
  }
}

=== server/domain/partners/errors/listingVerificationError.ts — ARQUIVO NOVO, conteúdo completo ===
export type ListingVerificationErrorCode =
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'DOCUMENT_IN_USE'
  | 'CNPJ_ALREADY_USED'
  | 'ALREADY_VERIFIED'
  | 'NOT_PENDING'
  | 'LISTING_NOT_VERIFIED'
  | 'CPF_CANNOT_SELL'
  | 'SALES_DOCUMENT_MISMATCH';

const STATUS: Record<ListingVerificationErrorCode, number> = {
  VALIDATION_ERROR: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  DOCUMENT_IN_USE: 409,
  CNPJ_ALREADY_USED: 409,
  ALREADY_VERIFIED: 409,
  NOT_PENDING: 409,
  LISTING_NOT_VERIFIED: 422,
  CPF_CANNOT_SELL: 422,
  SALES_DOCUMENT_MISMATCH: 422,
};

export class ListingVerificationError extends Error {
  readonly statusCode: number;

  constructor(
    readonly code: ListingVerificationErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'ListingVerificationError';
    this.statusCode = STATUS[code];
  }
}

=== server/domain/partners/factory.ts — diff ===
@@ -1,6 +1,21 @@
 import { PartnerService } from './services/partnerService';
 import { FirestorePartnerAdapter } from './adapters/firestorePartnerAdapter';
+import { FirestoreListingVerificationAdapter } from './adapters/firestoreListingVerificationAdapter';
+import { ListingVerificationService } from './services/listingVerificationService';
+import { blindIndex, fieldEncryption } from '../../infrastructure/crypto/fieldEncryptionFactory';
 
 const partnerAdapter = new FirestorePartnerAdapter();
 
 export const partnerService = new PartnerService(partnerAdapter);
+
+let listingVerificationService: ListingVerificationService | undefined;
+
+/** Lazy: a criptografia só resolve chave e cliente KMS na primeira chamada (AGENTS.md §2.2 item 4). */
+export function getListingVerificationService(): ListingVerificationService {
+  listingVerificationService ??= new ListingVerificationService(
+    new FirestoreListingVerificationAdapter(),
+    fieldEncryption,
+    blindIndex
+  );
+  return listingVerificationService;
+}

=== server/domain/partners/index.ts — diff ===
@@ -10,6 +10,15 @@ export { linkBusinessUseCase } from './usecases/linkBusinessUseCase';
 export { updateBusinessUseCase } from './usecases/updateBusinessUseCase';
 export { unlinkBusinessUseCase } from './usecases/unlinkBusinessUseCase';
 export { deletePartnerProfileUseCase } from './usecases/deletePartnerProfileUseCase';
+export { submitListingVerificationUseCase } from './usecases/submitListingVerificationUseCase';
+export { reviewListingVerificationUseCase } from './usecases/reviewListingVerificationUseCase';
+export { getListingVerificationUseCase } from './usecases/getListingVerificationUseCase';
+export { listListingVerificationsUseCase } from './usecases/listListingVerificationsUseCase';
+export { getListingVerificationFilePathUseCase } from './usecases/getListingVerificationFilePathUseCase';
+export { getListingVerificationStatusUseCase } from './usecases/getListingVerificationStatusUseCase';
+export { assertListingCanSellUseCase } from './usecases/assertListingCanSellUseCase';
+export { deleteListingVerificationUseCase } from './usecases/deleteListingVerificationUseCase';
+export { deleteOwnerListingVerificationsUseCase } from './usecases/deleteOwnerListingVerificationsUseCase';
 
 export type {
   PartnerStatus,
@@ -25,5 +34,17 @@ export type {
   PublicPartnerProfileDTO,
 } from './types/partnerTypes';
 
+export type {
+  ListingDocumentType,
+  ListingHolderRole,
+  ListingVerificationFiles,
+  ListingVerificationStatus,
+  ListingVerificationView,
+  SubmitListingVerificationInput,
+  VerificationDecision,
+  VerificationListing,
+} from './types/listingVerification';
+
 export { PartnerDomainError } from './errors/partnerDomainError';
+export { ListingVerificationError } from './errors/listingVerificationError';
 export { hasActivePlanVerification, resolveAdminVerification } from './utils/adminVerification';

=== server/domain/partners/ports/listingVerificationRepositoryPort.ts — ARQUIVO NOVO, conteúdo completo ===
import type {
  ListingVerificationRecord,
  ListingVerificationStatus,
  VerificationDocumentEntry,
} from '../types/listingVerification';

export interface ListingVerificationPage {
  data: ListingVerificationRecord[];
  nextCursor: string | null;
}

export interface ListingVerificationRepositoryPort {
  get(itemId: string): Promise<ListingVerificationRecord | null>;
  getDocumentEntry(documentIndex: string): Promise<VerificationDocumentEntry | null>;
  /**
   * Grava o envio e reserva o documento na mesma transação. Recusa documento de outra conta e CNPJ já
   * usado por outro estabelecimento; libera o CNPJ anterior quando o estabelecimento troca de documento.
   */
  saveSubmission(record: ListingVerificationRecord): Promise<void>;
  /** Aprovação marca o documento como conferido e, no primeiro CNPJ aprovado, fixa o documento de vendas da conta. */
  saveReview(record: ListingVerificationRecord): Promise<void>;
  listByStatus(
    status: ListingVerificationStatus,
    limit: number,
    cursor: string | null
  ): Promise<ListingVerificationPage>;
  getSalesDocumentIndex(ownerId: string): Promise<string | null>;
  /** Apaga o registro e libera o CNPJ; devolve o registro apagado (para remover os arquivos). */
  delete(itemId: string): Promise<ListingVerificationRecord | null>;
  deleteByOwner(ownerId: string): Promise<ListingVerificationRecord[]>;
}

=== server/domain/partners/services/listingVerificationService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it } from 'vitest';
import type { BlindIndexPort, FieldEncryptionPort } from '../../../shared/kernel/fieldEncryption';
import type { ListingVerificationRepositoryPort } from '../ports/listingVerificationRepositoryPort';
import type {
  ListingVerificationRecord,
  VerificationDocumentEntry,
  VerificationListing,
} from '../types/listingVerification';
import { ListingVerificationService } from './listingVerificationService';

const CNPJ = '11.222.333/0001-81';
const CNPJ_2 = '11.444.777/0001-61';
const CPF = '529.982.247-25';

class InMemoryRepository implements ListingVerificationRepositoryPort {
  records = new Map<string, ListingVerificationRecord>();
  entries = new Map<string, VerificationDocumentEntry>();
  salesDocuments = new Map<string, string>();

  async get(itemId: string) {
    return this.records.get(itemId) ?? null;
  }
  async getDocumentEntry(index: string) {
    return this.entries.get(index) ?? null;
  }
  async saveSubmission(record: ListingVerificationRecord) {
    const previous = this.records.get(record.itemId);
    if (previous?.documentType === 'cnpj' && previous.documentIndex !== record.documentIndex) {
      this.entries.delete(previous.documentIndex as string);
    }
    this.records.set(record.itemId, record);
    if (record.documentIndex && record.documentType) {
      const entry = this.entries.get(record.documentIndex);
      this.entries.set(record.documentIndex, {
        documentIndex: record.documentIndex,
        ownerId: record.ownerId,
        documentType: record.documentType,
        itemId: record.documentType === 'cnpj' ? record.itemId : null,
        verifiedAt: entry?.verifiedAt ?? null,
      });
    }
  }
  async saveReview(record: ListingVerificationRecord) {
    this.records.set(record.itemId, record);
    if (record.status === 'approved' && record.documentIndex) {
      const entry = this.entries.get(record.documentIndex);
      if (entry) entry.verifiedAt = record.reviewedAt;
      if (record.documentType === 'cnpj' && !this.salesDocuments.has(record.ownerId)) {
        this.salesDocuments.set(record.ownerId, record.documentIndex);
      }
    }
  }
  async listByStatus(status: string) {
    return {
      data: [...this.records.values()].filter((r) => r.status === status),
      nextCursor: null,
    };
  }
  async getSalesDocumentIndex(ownerId: string) {
    return this.salesDocuments.get(ownerId) ?? null;
  }
  async delete(itemId: string) {
    const record = this.records.get(itemId) ?? null;
    this.records.delete(itemId);
    return record;
  }
  async deleteByOwner(ownerId: string) {
    const removed = [...this.records.values()].filter((r) => r.ownerId === ownerId);
    for (const r of removed) this.records.delete(r.itemId);
    return removed;
  }
}

const encryption: FieldEncryptionPort = {
  encrypt: async (plain, ctx) => ({
    v: 1,
    kid: 'test',
    iv: 'iv',
    tag: 'tag',
    ct: Buffer.from(`${ctx.documentId}:${plain}`).toString('base64url'),
  }),
  decrypt: async () => '',
};
const blindIndex: BlindIndexPort = {
  indexFor: (purpose, value) => `idx-${purpose}-${value.slice(-4)}`,
};

const owner = { uid: 'owner-1' };
const admin = { uid: 'admin-1', admin: true };
const pousada: VerificationListing = { id: 'item-1', ownerId: 'owner-1', category: 'hotel' };
const restaurante: VerificationListing = {
  id: 'item-2',
  ownerId: 'owner-1',
  category: 'restaurant',
};
const produtor: VerificationListing = { id: 'item-3', ownerId: 'owner-1', category: 'producer' };
const cnpjFiles = {
  cnpjCard: 'verification/owner-1/c.pdf',
  identity: 'verification/owner-1/i.webp',
};

describe('ListingVerificationService (D12)', () => {
  let repository: InMemoryRepository;
  let service: ListingVerificationService;

  beforeEach(() => {
    repository = new InMemoryRepository();
    service = new ListingVerificationService(
      repository,
      encryption,
      blindIndex,
      () => new Date('2026-10-19T12:00:00Z')
    );
  });

  async function submitCnpj(listing = pousada, document = CNPJ) {
    return service.submit(
      { uid: listing.ownerId },
      listing,
      { mode: 'document', documentType: 'cnpj', document, holderRole: 'owner', files: cnpjFiles },
      null
    );
  }

  it('CNPJ vai para a fila com número cifrado e só a forma mascarada na resposta', async () => {
    const view = await submitCnpj();
    expect(view.status).toBe('pending');
    expect(view.maskedDocument).toBe('**.***.***/0001-81');
    expect(JSON.stringify(view)).not.toContain('11222333000181');
    const stored = repository.records.get('item-1');
    expect(JSON.stringify(stored)).not.toContain('11222333000181');
    expect(stored?.document?.ct).toBeTruthy();
  });

  it('exige Cartão CNPJ, identidade e autorização do representante', async () => {
    await expect(
      service.submit(
        owner,
        pousada,
        {
          mode: 'document',
          documentType: 'cnpj',
          document: CNPJ,
          holderRole: 'owner',
          files: { identity: 'x' },
        },
        null
      )
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.submit(
        owner,
        pousada,
        {
          mode: 'document',
          documentType: 'cnpj',
          document: CNPJ,
          holderRole: 'representative',
          files: cnpjFiles,
        },
        null
      )
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('recusa documento inválido', async () => {
    await expect(submitCnpj(pousada, '11.222.333/0001-00')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('um CNPJ vale para um estabelecimento só', async () => {
    await submitCnpj(pousada);
    await expect(submitCnpj(restaurante)).rejects.toMatchObject({ code: 'CNPJ_ALREADY_USED' });
  });

  it('documento de outra conta é recusado', async () => {
    await submitCnpj(pousada);
    const alheio: VerificationListing = { id: 'item-9', ownerId: 'owner-2', category: 'hotel' };
    await expect(submitCnpj(alheio)).rejects.toMatchObject({ code: 'DOCUMENT_IN_USE' });
  });

  it('só o dono envia a verificação do estabelecimento', async () => {
    await expect(
      service.submit(
        { uid: 'intruso' },
        pousada,
        {
          mode: 'document',
          documentType: 'cnpj',
          document: CNPJ,
          holderRole: 'owner',
          files: cnpjFiles,
        },
        null
      )
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('CPF conferido uma vez vale para os outros estabelecimentos da conta', async () => {
    const cpfInput = {
      mode: 'document' as const,
      documentType: 'cpf' as const,
      document: CPF,
      holderRole: 'owner' as const,
      files: { identity: 'verification/owner-1/i.webp' },
    };
    await service.submit(owner, pousada, cpfInput, null);
    await service.review(admin, 'item-1', 'approve', null);
    const second = await service.submit(
      owner,
      restaurante,
      { mode: 'document', documentType: 'cpf', document: CPF },
      null
    );
    expect(second.status).toBe('approved');
  });

  it('perfil de produtor usa o documento de um estabelecimento e herda o status', async () => {
    await submitCnpj(pousada);
    const linked = await service.submit(
      owner,
      produtor,
      { mode: 'linked', sourceItemId: 'item-1' },
      pousada
    );
    expect(linked.status).toBe('pending');
    await service.review(admin, 'item-1', 'approve', null);
    expect(await service.getStatus('item-3')).toBe('approved');
    await expect(
      service.submit(
        owner,
        produtor,
        { mode: 'linked', sourceItemId: 'item-9' },
        { id: 'item-9', ownerId: 'owner-2', category: 'hotel' }
      )
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('só admin revisa; recusa exige motivo; não revisa duas vezes', async () => {
    await submitCnpj();
    await expect(service.review(owner, 'item-1', 'approve', null)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    await expect(service.review(admin, 'item-1', 'reject', ' ')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    const rejected = await service.review(admin, 'item-1', 'reject', 'Cartão CNPJ ilegível');
    expect(rejected.rejectionReason).toBe('Cartão CNPJ ilegível');
    await expect(service.review(admin, 'item-1', 'approve', null)).rejects.toMatchObject({
      code: 'NOT_PENDING',
    });
  });

  describe('venda (assertCanSell)', () => {
    it('bloqueia sem verificação aprovada', async () => {
      await expect(service.assertCanSell('item-1')).rejects.toMatchObject({
        code: 'LISTING_NOT_VERIFIED',
      });
      await submitCnpj();
      await expect(service.assertCanSell('item-1')).rejects.toMatchObject({
        code: 'LISTING_NOT_VERIFIED',
      });
    });

    it('libera CNPJ aprovado', async () => {
      await submitCnpj();
      await service.review(admin, 'item-1', 'approve', null);
      await expect(service.assertCanSell('item-1')).resolves.toBeUndefined();
    });

    it('CPF não vende', async () => {
      await service.submit(
        owner,
        pousada,
        {
          mode: 'document',
          documentType: 'cpf',
          document: CPF,
          holderRole: 'owner',
          files: { identity: 'x' },
        },
        null
      );
      await service.review(admin, 'item-1', 'approve', null);
      await expect(service.assertCanSell('item-1')).rejects.toMatchObject({
        code: 'CPF_CANNOT_SELL',
      });
    });

    it('até o 18.4, só o primeiro CNPJ aprovado da conta vende', async () => {
      await submitCnpj(pousada, CNPJ);
      await service.review(admin, 'item-1', 'approve', null);
      await submitCnpj(restaurante, CNPJ_2);
      await service.review(admin, 'item-2', 'approve', null);
      await expect(service.assertCanSell('item-2')).rejects.toMatchObject({
        code: 'SALES_DOCUMENT_MISMATCH',
      });
    });
  });

  it('excluir o estabelecimento devolve os arquivos para apagar', async () => {
    await submitCnpj();
    expect(await service.deleteForListing('item-1')).toEqual([
      cnpjFiles.cnpjCard,
      cnpjFiles.identity,
    ]);
  });
});

=== server/domain/partners/services/listingVerificationService.ts — ARQUIVO NOVO, conteúdo completo ===
import type { BlindIndexPort, FieldEncryptionPort } from '../../../shared/kernel/fieldEncryption';
import { ListingVerificationError } from '../errors/listingVerificationError';
import type {
  ListingVerificationPage,
  ListingVerificationRepositoryPort,
} from '../ports/listingVerificationRepositoryPort';
import type {
  ListingDocumentType,
  ListingVerificationFiles,
  ListingVerificationRecord,
  ListingVerificationStatus,
  ListingVerificationView,
  SubmitListingVerificationInput,
  VerificationDecision,
  VerificationListing,
} from '../types/listingVerification';
import { notSubmittedView, toListingVerificationView } from '../utils/listingVerificationView';
import { maskDocument } from '../utils/maskDocument';
import { isValidCNPJ, isValidCPF, normalizeDocument } from './documentIdentity';

const PRODUCER_CATEGORY = 'producer';
const MIN_REJECTION_REASON = 5;
const EMPTY_FILES: ListingVerificationFiles = {
  cnpjCard: null,
  identity: null,
  authorization: null,
};

interface Actor {
  uid: string;
  admin?: boolean;
}

/** Verificação de cada estabelecimento pelo admin (D12): documento, prova do CNPJ e vínculo pessoa-empresa. */
export class ListingVerificationService {
  constructor(
    private readonly repository: ListingVerificationRepositoryPort,
    private readonly encryption: FieldEncryptionPort,
    private readonly blindIndex: BlindIndexPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async submit(
    actor: Actor,
    listing: VerificationListing,
    input: SubmitListingVerificationInput,
    source: VerificationListing | null
  ): Promise<ListingVerificationView> {
    if (listing.ownerId !== actor.uid) {
      throw new ListingVerificationError(
        'FORBIDDEN',
        'Só o dono do estabelecimento envia a verificação.'
      );
    }
    const record =
      listing.category === PRODUCER_CATEGORY
        ? this.linkedRecord(listing, input, source)
        : await this.documentRecord(listing, input);
    await this.repository.saveSubmission(record);
    return toListingVerificationView(await this.resolve(record));
  }

  async review(
    actor: Actor,
    itemId: string,
    decision: VerificationDecision,
    reason: string | null
  ): Promise<ListingVerificationView> {
    if (!actor.admin) {
      throw new ListingVerificationError(
        'FORBIDDEN',
        'Somente administradores revisam verificações.'
      );
    }
    const record = await this.repository.get(itemId);
    if (record?.mode !== 'document') {
      throw new ListingVerificationError('NOT_FOUND', 'Verificação não encontrada.');
    }
    if (record.status !== 'pending') {
      throw new ListingVerificationError('NOT_PENDING', 'Esta verificação já foi revisada.');
    }
    const trimmedReason = reason?.trim() ?? '';
    if (decision === 'reject' && trimmedReason.length < MIN_REJECTION_REASON) {
      throw new ListingVerificationError('VALIDATION_ERROR', 'Informe o motivo da recusa.');
    }
    const reviewed: ListingVerificationRecord = {
      ...record,
      status: decision === 'approve' ? 'approved' : 'rejected',
      rejectionReason: decision === 'reject' ? trimmedReason : null,
      reviewedAt: this.now().toISOString(),
      reviewedBy: actor.uid,
    };
    await this.repository.saveReview(reviewed);
    return toListingVerificationView(reviewed);
  }

  async getView(actor: Actor, listing: VerificationListing): Promise<ListingVerificationView> {
    if (!actor.admin && listing.ownerId !== actor.uid) {
      throw new ListingVerificationError('FORBIDDEN', 'Sem acesso a esta verificação.');
    }
    const record = await this.repository.get(listing.id);
    if (!record) return notSubmittedView(listing);
    return toListingVerificationView(await this.resolve(record));
  }

  async listForReview(
    actor: Actor,
    status: ListingVerificationStatus,
    limit: number,
    cursor: string | null
  ): Promise<{ data: ListingVerificationView[]; nextCursor: string | null }> {
    if (!actor.admin) {
      throw new ListingVerificationError(
        'FORBIDDEN',
        'Somente administradores revisam verificações.'
      );
    }
    const page: ListingVerificationPage = await this.repository.listByStatus(status, limit, cursor);
    return { data: page.data.map(toListingVerificationView), nextCursor: page.nextCursor };
  }

  /** Caminho de um arquivo enviado, para o admin abrir pelo backend. */
  async getFilePath(
    actor: Actor,
    itemId: string,
    kind: keyof ListingVerificationFiles
  ): Promise<string | null> {
    if (!actor.admin) {
      throw new ListingVerificationError('FORBIDDEN', 'Somente administradores abrem documentos.');
    }
    const record = await this.repository.get(itemId);
    return record?.files[kind] ?? null;
  }

  async getStatus(itemId: string): Promise<ListingVerificationStatus | 'not_submitted'> {
    const record = await this.repository.get(itemId);
    if (!record) return 'not_submitted';
    return (await this.resolve(record)).status;
  }

  /**
   * Venda exige estabelecimento verificado com CNPJ (D12). Até o Prompt 18.4 (conta Stripe por documento),
   * só vende o CNPJ fixado como documento de vendas da conta, para o dinheiro não cair em outra empresa.
   */
  async assertCanSell(itemId: string): Promise<void> {
    const stored = await this.repository.get(itemId);
    const record = stored ? await this.resolve(stored) : null;
    if (record?.status !== 'approved') {
      throw new ListingVerificationError(
        'LISTING_NOT_VERIFIED',
        'O estabelecimento precisa ser verificado pelo Use Guide antes de vender.'
      );
    }
    if (record.documentType !== 'cnpj') {
      throw new ListingVerificationError(
        'CPF_CANNOT_SELL',
        'Para vender é preciso cadastrar o estabelecimento com CNPJ (MEI serve).'
      );
    }
    const salesDocument = await this.repository.getSalesDocumentIndex(record.ownerId);
    if (salesDocument && salesDocument !== record.documentIndex) {
      throw new ListingVerificationError(
        'SALES_DOCUMENT_MISMATCH',
        'Por enquanto só um CNPJ por conta pode vender.'
      );
    }
  }

  async deleteForListing(itemId: string): Promise<string[]> {
    const removed = await this.repository.delete(itemId);
    return removed ? filePaths(removed) : [];
  }

  async deleteForOwner(ownerId: string): Promise<string[]> {
    const removed = await this.repository.deleteByOwner(ownerId);
    return removed.flatMap(filePaths);
  }

  private linkedRecord(
    listing: VerificationListing,
    input: SubmitListingVerificationInput,
    source: VerificationListing | null
  ): ListingVerificationRecord {
    if (input.mode !== 'linked' || !input.sourceItemId) {
      throw new ListingVerificationError(
        'VALIDATION_ERROR',
        'O perfil de produtor usa o documento de um estabelecimento da conta.'
      );
    }
    if (!source || source.id !== input.sourceItemId || source.ownerId !== listing.ownerId) {
      throw new ListingVerificationError('FORBIDDEN', 'Escolha um estabelecimento da sua conta.');
    }
    if (source.category === PRODUCER_CATEGORY) {
      throw new ListingVerificationError(
        'VALIDATION_ERROR',
        'Escolha um estabelecimento, não um perfil.'
      );
    }
    return {
      itemId: listing.id,
      ownerId: listing.ownerId,
      mode: 'linked',
      sourceItemId: source.id,
      documentType: null,
      document: null,
      documentIndex: null,
      maskedDocument: null,
      holderRole: null,
      files: { ...EMPTY_FILES },
      cadastur: null,
      status: 'pending',
      rejectionReason: null,
      submittedAt: this.now().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
    };
  }

  private async documentRecord(
    listing: VerificationListing,
    input: SubmitListingVerificationInput
  ): Promise<ListingVerificationRecord> {
    if (input.mode !== 'document' || !input.documentType || !input.document) {
      throw new ListingVerificationError(
        'VALIDATION_ERROR',
        'Informe o CPF ou o CNPJ do estabelecimento.'
      );
    }
    const type = input.documentType;
    const normalized = normalizeDocument(input.document);
    const valid = type === 'cpf' ? isValidCPF(normalized) : isValidCNPJ(normalized);
    if (!valid) {
      throw new ListingVerificationError('VALIDATION_ERROR', `${type.toUpperCase()} inválido.`);
    }
    const documentIndex = this.blindIndex.indexFor(type, normalized);
    const [existing, entry] = await Promise.all([
      this.repository.get(listing.id),
      this.repository.getDocumentEntry(documentIndex),
    ]);
    if (existing?.status === 'approved' && existing.documentIndex === documentIndex) {
      throw new ListingVerificationError(
        'ALREADY_VERIFIED',
        'Este estabelecimento já está verificado.'
      );
    }
    if (entry && entry.ownerId !== listing.ownerId) {
      throw new ListingVerificationError(
        'DOCUMENT_IN_USE',
        'Este documento já está em outra conta.'
      );
    }
    if (type === 'cnpj' && entry?.itemId && entry.itemId !== listing.id) {
      throw new ListingVerificationError(
        'CNPJ_ALREADY_USED',
        'Cada CNPJ vale para um estabelecimento. Filiais usam o CNPJ da filial.'
      );
    }

    // CPF já conferido nesta conta: os outros estabelecimentos com o mesmo CPF nascem conferidos (D12, P4).
    const reusesCheckedCpf = type === 'cpf' && Boolean(entry?.verifiedAt);
    const files = this.requiredFiles(type, input, reusesCheckedCpf);
    const nowIso = this.now().toISOString();
    return {
      itemId: listing.id,
      ownerId: listing.ownerId,
      mode: 'document',
      sourceItemId: null,
      documentType: type,
      document: await this.encryption.encrypt(normalized, {
        documentId: listing.id,
        field: 'document',
      }),
      documentIndex,
      maskedDocument: maskDocument(type, normalized),
      holderRole: reusesCheckedCpf ? 'owner' : (input.holderRole ?? null),
      files,
      cadastur: input.cadastur?.trim() || null,
      status: reusesCheckedCpf ? 'approved' : 'pending',
      rejectionReason: null,
      submittedAt: nowIso,
      reviewedAt: reusesCheckedCpf ? nowIso : null,
      reviewedBy: reusesCheckedCpf ? 'document-reuse' : null,
    };
  }

  private requiredFiles(
    type: ListingDocumentType,
    input: SubmitListingVerificationInput,
    reusesCheckedCpf: boolean
  ): ListingVerificationFiles {
    const files: ListingVerificationFiles = { ...EMPTY_FILES, ...input.files };
    if (reusesCheckedCpf) return files;
    if (!input.holderRole) {
      throw new ListingVerificationError(
        'VALIDATION_ERROR',
        'Informe se você é o titular ou um representante.'
      );
    }
    if (!files.identity) {
      throw new ListingVerificationError(
        'VALIDATION_ERROR',
        'Envie a foto do documento de identidade.'
      );
    }
    if (type === 'cnpj' && !files.cnpjCard) {
      throw new ListingVerificationError(
        'VALIDATION_ERROR',
        'Envie o Cartão CNPJ emitido pela Receita.'
      );
    }
    if (input.holderRole === 'representative' && !files.authorization) {
      throw new ListingVerificationError(
        'VALIDATION_ERROR',
        'Envie a autorização assinada por um sócio.'
      );
    }
    return files;
  }

  /** Perfil de produtor herda status e documento do estabelecimento de origem. */
  private async resolve(record: ListingVerificationRecord): Promise<ListingVerificationRecord> {
    if (record.mode !== 'linked' || !record.sourceItemId) return record;
    const source = await this.repository.get(record.sourceItemId);
    if (source?.mode !== 'document') return { ...record, status: 'pending' };
    return {
      ...record,
      status: source.status,
      documentType: source.documentType,
      documentIndex: source.documentIndex,
      maskedDocument: source.maskedDocument,
      rejectionReason: source.rejectionReason,
      reviewedAt: source.reviewedAt,
    };
  }
}

function filePaths(record: ListingVerificationRecord): string[] {
  return Object.values(record.files).filter((path): path is string => Boolean(path));
}

=== server/domain/partners/types/listingVerification.ts — ARQUIVO NOVO, conteúdo completo ===
import type { EncryptedField } from '../../../shared/kernel/fieldEncryption';

export type ListingDocumentType = 'cpf' | 'cnpj';
export type ListingVerificationStatus = 'pending' | 'approved' | 'rejected';
/** `owner`: sócio, administrador ou titular do MEI; `representative`: gerente com autorização de um sócio. */
export type ListingHolderRole = 'owner' | 'representative';
/** `linked`: perfil de produtor que usa o documento de outro estabelecimento da conta (D12). */
export type ListingVerificationMode = 'document' | 'linked';

export interface ListingVerificationFiles {
  cnpjCard: string | null;
  identity: string | null;
  authorization: string | null;
}

/** `listingVerifications/{itemId}`: só backend. O número do documento fica cifrado (classe Restrita, §7.6). */
export interface ListingVerificationRecord {
  itemId: string;
  ownerId: string;
  mode: ListingVerificationMode;
  sourceItemId: string | null;
  documentType: ListingDocumentType | null;
  document: EncryptedField | null;
  documentIndex: string | null;
  maskedDocument: string | null;
  holderRole: ListingHolderRole | null;
  files: ListingVerificationFiles;
  cadastur: string | null;
  status: ListingVerificationStatus;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

/** `verificationDocuments/{documentIndex}`: um documento pertence a uma conta; CNPJ a um estabelecimento. */
export interface VerificationDocumentEntry {
  documentIndex: string;
  ownerId: string;
  documentType: ListingDocumentType;
  itemId: string | null;
  verifiedAt: string | null;
}

export interface SubmitListingVerificationInput {
  mode: ListingVerificationMode;
  sourceItemId?: string;
  documentType?: ListingDocumentType;
  document?: string;
  holderRole?: ListingHolderRole;
  files?: Partial<ListingVerificationFiles>;
  cadastur?: string | null;
}

export interface VerificationListing {
  id: string;
  ownerId: string;
  category: string;
}

/** O que o dono e o admin enxergam: nunca o número, só a forma mascarada. */
export interface ListingVerificationView {
  itemId: string;
  ownerId: string;
  mode: ListingVerificationMode;
  sourceItemId: string | null;
  status: ListingVerificationStatus | 'not_submitted';
  documentType: ListingDocumentType | null;
  maskedDocument: string | null;
  holderRole: ListingHolderRole | null;
  cadastur: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  filesSent: Array<keyof ListingVerificationFiles>;
}

export type VerificationDecision = 'approve' | 'reject';

=== server/domain/partners/usecases/assertListingCanSellUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getListingVerificationService } from '../factory';

/** Lança `ListingVerificationError` (422) quando o estabelecimento ainda não pode vender (D12). */
export function assertListingCanSellUseCase(itemId: string): Promise<void> {
  return getListingVerificationService().assertCanSell(itemId);
}

=== server/domain/partners/usecases/deleteListingVerificationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getListingVerificationService } from '../factory';

/** Devolve os caminhos dos arquivos enviados, para quem orquestra apagá-los do Storage. */
export function deleteListingVerificationUseCase(itemId: string): Promise<string[]> {
  return getListingVerificationService().deleteForListing(itemId);
}

=== server/domain/partners/usecases/deleteOwnerListingVerificationsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getListingVerificationService } from '../factory';

export function deleteOwnerListingVerificationsUseCase(ownerId: string): Promise<string[]> {
  return getListingVerificationService().deleteForOwner(ownerId);
}

=== server/domain/partners/usecases/getListingVerificationFilePathUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getListingVerificationService } from '../factory';
import type { ListingVerificationFiles } from '../types/listingVerification';

export function getListingVerificationFilePathUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string,
  kind: keyof ListingVerificationFiles
): Promise<string | null> {
  return getListingVerificationService().getFilePath(actor, itemId, kind);
}

=== server/domain/partners/usecases/getListingVerificationStatusUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getListingVerificationService } from '../factory';
import type { ListingVerificationStatus } from '../types/listingVerification';

export function getListingVerificationStatusUseCase(
  itemId: string
): Promise<ListingVerificationStatus | 'not_submitted'> {
  return getListingVerificationService().getStatus(itemId);
}

=== server/domain/partners/usecases/getListingVerificationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getListingVerificationService } from '../factory';
import type { ListingVerificationView, VerificationListing } from '../types/listingVerification';

export function getListingVerificationUseCase(
  actor: { uid: string; admin?: boolean },
  listing: VerificationListing
): Promise<ListingVerificationView> {
  return getListingVerificationService().getView(actor, listing);
}

=== server/domain/partners/usecases/listListingVerificationsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getListingVerificationService } from '../factory';
import type {
  ListingVerificationStatus,
  ListingVerificationView,
} from '../types/listingVerification';

export function listListingVerificationsUseCase(
  actor: { uid: string; admin?: boolean },
  status: ListingVerificationStatus,
  limit: number,
  cursor: string | null
): Promise<{ data: ListingVerificationView[]; nextCursor: string | null }> {
  return getListingVerificationService().listForReview(actor, status, limit, cursor);
}

=== server/domain/partners/usecases/reviewListingVerificationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getListingVerificationService } from '../factory';
import type { ListingVerificationView, VerificationDecision } from '../types/listingVerification';

export function reviewListingVerificationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string,
  decision: VerificationDecision,
  reason: string | null
): Promise<ListingVerificationView> {
  return getListingVerificationService().review(actor, itemId, decision, reason);
}

=== server/domain/partners/usecases/submitListingVerificationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getListingVerificationService } from '../factory';
import type {
  ListingVerificationView,
  SubmitListingVerificationInput,
  VerificationListing,
} from '../types/listingVerification';

export function submitListingVerificationUseCase(
  actor: { uid: string; admin?: boolean },
  listing: VerificationListing,
  input: SubmitListingVerificationInput,
  source: VerificationListing | null
): Promise<ListingVerificationView> {
  return getListingVerificationService().submit(actor, listing, input, source);
}

=== server/domain/partners/utils/listingVerificationView.ts — ARQUIVO NOVO, conteúdo completo ===
import type {
  ListingVerificationFiles,
  ListingVerificationRecord,
  ListingVerificationView,
  VerificationListing,
} from '../types/listingVerification';

const PRODUCER_CATEGORY = 'producer';

/** Visão de quem ainda não enviou: o perfil de produtor já nasce no modo "usar documento de outro". */
export function notSubmittedView(listing: VerificationListing): ListingVerificationView {
  return {
    itemId: listing.id,
    ownerId: listing.ownerId,
    mode: listing.category === PRODUCER_CATEGORY ? 'linked' : 'document',
    sourceItemId: null,
    status: 'not_submitted',
    documentType: null,
    maskedDocument: null,
    holderRole: null,
    cadastur: null,
    rejectionReason: null,
    submittedAt: null,
    reviewedAt: null,
    filesSent: [],
  };
}

/** Allowlist de saída (§7.9 item 4): nunca o documento cifrado nem o índice. */
export function toListingVerificationView(
  record: ListingVerificationRecord
): ListingVerificationView {
  return {
    itemId: record.itemId,
    ownerId: record.ownerId,
    mode: record.mode,
    sourceItemId: record.sourceItemId,
    status: record.status,
    documentType: record.documentType,
    maskedDocument: record.maskedDocument,
    holderRole: record.holderRole,
    cadastur: record.cadastur,
    rejectionReason: record.rejectionReason,
    submittedAt: record.submittedAt,
    reviewedAt: record.reviewedAt,
    filesSent: (Object.keys(record.files) as Array<keyof ListingVerificationFiles>).filter((kind) =>
      Boolean(record.files[kind])
    ),
  };
}

=== server/domain/partners/utils/maskDocument.ts — ARQUIVO NOVO, conteúdo completo ===
import type { ListingDocumentType } from '../types/listingVerification';

/** Exibição mascarada (AGENTS.md §7.6): CPF mostra só o dígito verificador; CNPJ, a ordem e o dígito. */
export function maskDocument(type: ListingDocumentType, normalized: string): string {
  if (type === 'cpf') return `***.***.***-${normalized.slice(-2)}`;
  return `**.***.***/${normalized.slice(8, 12)}-${normalized.slice(-2)}`;
}

=== server/infrastructure/crypto/aesGcm.ts — ARQUIVO NOVO, conteúdo completo ===
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const IV_BYTES = 12;
const TAG_BYTES = 16;

export interface AesGcmPayload {
  iv: string;
  tag: string;
  ct: string;
}

/** AES-256-GCM com IV aleatório de 96 bits por operação e tag de 128 bits (AGENTS.md §7.7). */
export function aesGcmEncrypt(key: Buffer, plain: string, aad: string): AesGcmPayload {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, iv, { authTagLength: TAG_BYTES });
  cipher.setAAD(Buffer.from(aad, 'utf8'));
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return {
    iv: iv.toString('base64url'),
    tag: cipher.getAuthTag().toString('base64url'),
    ct: ct.toString('base64url'),
  };
}

export function aesGcmDecrypt(key: Buffer, payload: AesGcmPayload, aad: string): string {
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64url'), {
    authTagLength: TAG_BYTES,
  });
  decipher.setAAD(Buffer.from(aad, 'utf8'));
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(payload.ct, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

export function encryptionAad(documentId: string, field: string): string {
  return `${documentId}|${field}`;
}

=== server/infrastructure/crypto/fieldEncryption.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { randomBytes } from 'crypto';
import { describe, expect, it, vi } from 'vitest';
import { CryptoUnavailableError } from '../../shared/kernel/fieldEncryption';
import { HmacBlindIndexAdapter } from './hmacBlindIndexAdapter';
import { LocalFieldEncryptionAdapter } from './localFieldEncryptionAdapter';

const kms = vi.hoisted(() => {
  const wrap = (bytes: Uint8Array) => Buffer.from(bytes).reverse();
  return {
    encrypt: vi.fn(
      async (req: { plaintext: Uint8Array; additionalAuthenticatedData?: Uint8Array }) => [
        { name: 'keys/k/cryptoKeyVersions/3', ciphertext: wrap(req.plaintext) },
      ]
    ),
    decrypt: vi.fn(async (req: { ciphertext: Uint8Array }) => [
      { plaintext: Buffer.from(req.ciphertext).reverse() },
    ]),
  };
});
vi.mock('@google-cloud/kms', () => ({
  KeyManagementServiceClient: class {
    encrypt = kms.encrypt;
    decrypt = kms.decrypt;
  },
}));

import { KmsFieldEncryptionAdapter } from './kmsFieldEncryptionAdapter';

const DEV_ENV = {
  NODE_ENV: 'development',
  FIELD_ENCRYPTION_DEV_KEY: randomBytes(32).toString('base64'),
} as NodeJS.ProcessEnv;
const CONTEXT = { documentId: 'item-1', field: 'document' };

describe('criptografia de campo (AGENTS.md §7.7)', () => {
  it('cifra e decifra; o texto cifrado não contém o valor', async () => {
    const adapter = new LocalFieldEncryptionAdapter(DEV_ENV);
    const encrypted = await adapter.encrypt('12345678000195', CONTEXT);
    expect(JSON.stringify(encrypted)).not.toContain('12345678000195');
    expect(encrypted.v).toBe(1);
    expect(await adapter.decrypt(encrypted, CONTEXT)).toBe('12345678000195');
  });

  it('usa IV novo a cada operação', async () => {
    const adapter = new LocalFieldEncryptionAdapter(DEV_ENV);
    const a = await adapter.encrypt('valor', CONTEXT);
    const b = await adapter.encrypt('valor', CONTEXT);
    expect(a.iv).not.toBe(b.iv);
    expect(a.ct).not.toBe(b.ct);
  });

  it('recusa valor copiado para outro documento (associated data)', async () => {
    const adapter = new LocalFieldEncryptionAdapter(DEV_ENV);
    const encrypted = await adapter.encrypt('valor', CONTEXT);
    await expect(
      adapter.decrypt(encrypted, { documentId: 'item-2', field: 'document' })
    ).rejects.toThrow();
  });

  it('a chave de teste se recusa a rodar em produção', async () => {
    const adapter = new LocalFieldEncryptionAdapter({ ...DEV_ENV, NODE_ENV: 'production' });
    await expect(adapter.encrypt('valor', CONTEXT)).rejects.toThrow(/produção/);
  });

  it('sem chave de teste: CryptoUnavailableError', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const adapter = new LocalFieldEncryptionAdapter({
      NODE_ENV: 'development',
    } as NodeJS.ProcessEnv);
    await expect(adapter.encrypt('valor', CONTEXT)).rejects.toBeInstanceOf(CryptoUnavailableError);
  });

  it('KMS: a chave de dados sai cifrada e o kid guarda a versão da chave mestra', async () => {
    const adapter = new KmsFieldEncryptionAdapter('keys/k');
    const encrypted = await adapter.encrypt('12345678000195', CONTEXT);
    expect(encrypted.kid).toBe('keys/k/cryptoKeyVersions/3');
    expect(encrypted.dek).toBeTruthy();
    expect(await adapter.decrypt(encrypted, CONTEXT)).toBe('12345678000195');
    const aad = Buffer.from(kms.encrypt.mock.calls[0]?.[0].additionalAuthenticatedData as Buffer);
    expect(aad.toString()).toBe('item-1|document');
  });
});

describe('índice cego (blind index)', () => {
  const env = { PII_BLIND_INDEX_KEY: 'k'.repeat(32) } as NodeJS.ProcessEnv;

  it('é estável, separa por finalidade e não revela o valor', () => {
    const index = new HmacBlindIndexAdapter(env);
    const a = index.indexFor('cnpj', '12345678000195');
    expect(a).toBe(index.indexFor('cnpj', '12345678000195'));
    expect(a).not.toBe(index.indexFor('cpf', '12345678000195'));
    expect(a).not.toContain('12345678');
  });

  it('sem chave: CryptoUnavailableError', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => new HmacBlindIndexAdapter({} as NodeJS.ProcessEnv).indexFor('cnpj', '1')).toThrow(
      CryptoUnavailableError
    );
  });
});

=== server/infrastructure/crypto/fieldEncryptionFactory.ts — ARQUIVO NOVO, conteúdo completo ===
import type {
  BlindIndexPort,
  EncryptedField,
  FieldEncryptionContext,
  FieldEncryptionPort,
} from '../../shared/kernel/fieldEncryption';
import { CryptoUnavailableError } from '../../shared/kernel/fieldEncryption';
import { HmacBlindIndexAdapter } from './hmacBlindIndexAdapter';
import { KmsFieldEncryptionAdapter } from './kmsFieldEncryptionAdapter';
import { LocalFieldEncryptionAdapter } from './localFieldEncryptionAdapter';

/** Escolhe o adapter na primeira chamada: Cloud KMS quando configurado; chave de teste só fora de produção. */
class LazyFieldEncryption implements FieldEncryptionPort {
  private resolved: FieldEncryptionPort | null = null;

  private target(): FieldEncryptionPort {
    if (this.resolved) return this.resolved;
    const kmsKey = process.env.FIELD_ENCRYPTION_KMS_KEY?.trim();
    if (kmsKey) {
      this.resolved = new KmsFieldEncryptionAdapter(kmsKey);
    } else if (process.env.NODE_ENV !== 'production') {
      this.resolved = new LocalFieldEncryptionAdapter();
    } else {
      console.error('[crypto] FIELD_ENCRYPTION_KMS_KEY ausente em produção.');
      throw new CryptoUnavailableError();
    }
    return this.resolved;
  }

  encrypt(plain: string, context: FieldEncryptionContext): Promise<EncryptedField> {
    return this.target().encrypt(plain, context);
  }

  decrypt(field: EncryptedField, context: FieldEncryptionContext): Promise<string> {
    return this.target().decrypt(field, context);
  }
}

export const fieldEncryption: FieldEncryptionPort = new LazyFieldEncryption();
export const blindIndex: BlindIndexPort = new HmacBlindIndexAdapter();

=== server/infrastructure/crypto/hmacBlindIndexAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { createHmac } from 'crypto';
import type { BlindIndexPort } from '../../shared/kernel/fieldEncryption';
import { CryptoUnavailableError } from '../../shared/kernel/fieldEncryption';

const MIN_KEY_LENGTH = 32;

/** HMAC-SHA-256 com `PII_BLIND_INDEX_KEY` (Secret Manager). Trocar a chave exige recalcular os índices. */
export class HmacBlindIndexAdapter implements BlindIndexPort {
  constructor(private readonly env: NodeJS.ProcessEnv = process.env) {}

  indexFor(purpose: string, normalizedValue: string): string {
    const key = this.env.PII_BLIND_INDEX_KEY?.trim();
    if (!key || key.length < MIN_KEY_LENGTH) {
      console.error('[crypto] PII_BLIND_INDEX_KEY ausente ou com menos de 32 caracteres.');
      throw new CryptoUnavailableError();
    }
    return createHmac('sha256', key).update(`${purpose}:${normalizedValue}`).digest('base64url');
  }
}

=== server/infrastructure/crypto/kmsFieldEncryptionAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { randomBytes } from 'crypto';
import { KeyManagementServiceClient } from '@google-cloud/kms';
import type {
  EncryptedField,
  FieldEncryptionContext,
  FieldEncryptionPort,
} from '../../shared/kernel/fieldEncryption';
import { aesGcmDecrypt, aesGcmEncrypt, encryptionAad } from './aesGcm';

/**
 * Envelope encryption (AGENTS.md §7.7): uma chave de dados (DEK) por valor, cifrada pela chave mestra do
 * Cloud KMS, que nunca sai do KMS. O `kid` guarda a versão da chave mestra usada.
 */
export class KmsFieldEncryptionAdapter implements FieldEncryptionPort {
  private client: KeyManagementServiceClient | null = null;

  constructor(private readonly keyName: string) {}

  private kms(): KeyManagementServiceClient {
    this.client ??= new KeyManagementServiceClient();
    return this.client;
  }

  async encrypt(plain: string, context: FieldEncryptionContext): Promise<EncryptedField> {
    const aad = encryptionAad(context.documentId, context.field);
    const dataKey = randomBytes(32);
    try {
      const [wrapped] = await this.kms().encrypt({
        name: this.keyName,
        plaintext: dataKey,
        additionalAuthenticatedData: Buffer.from(aad, 'utf8'),
      });
      if (!wrapped.ciphertext || !wrapped.name) {
        throw new Error('Cloud KMS não devolveu a chave de dados cifrada.');
      }
      const payload = aesGcmEncrypt(dataKey, plain, aad);
      return {
        v: 1,
        kid: wrapped.name,
        dek: Buffer.from(wrapped.ciphertext as Uint8Array).toString('base64url'),
        ...payload,
      };
    } finally {
      dataKey.fill(0);
    }
  }

  async decrypt(field: EncryptedField, context: FieldEncryptionContext): Promise<string> {
    if (!field.dek) {
      throw new Error('Valor cifrado sem chave de dados.');
    }
    const aad = encryptionAad(context.documentId, context.field);
    const [unwrapped] = await this.kms().decrypt({
      name: this.keyName,
      ciphertext: Buffer.from(field.dek, 'base64url'),
      additionalAuthenticatedData: Buffer.from(aad, 'utf8'),
    });
    if (!unwrapped.plaintext) {
      throw new Error('Cloud KMS não devolveu a chave de dados.');
    }
    const dataKey = Buffer.from(unwrapped.plaintext as Uint8Array);
    try {
      return aesGcmDecrypt(dataKey, field, aad);
    } finally {
      dataKey.fill(0);
    }
  }
}

=== server/infrastructure/crypto/localFieldEncryptionAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import type {
  EncryptedField,
  FieldEncryptionContext,
  FieldEncryptionPort,
} from '../../shared/kernel/fieldEncryption';
import { CryptoUnavailableError } from '../../shared/kernel/fieldEncryption';
import { aesGcmDecrypt, aesGcmEncrypt, encryptionAad } from './aesGcm';

const DEV_KID = 'dev-1';

/** Chave de teste do painel Secrets do AI Studio; recusa produção (AGENTS.md §7.7 item 7). */
export class LocalFieldEncryptionAdapter implements FieldEncryptionPort {
  constructor(private readonly env: NodeJS.ProcessEnv = process.env) {}

  private key(): Buffer {
    if (this.env.NODE_ENV === 'production') {
      throw new Error('LocalFieldEncryptionAdapter não pode ser usado em produção.');
    }
    const raw = this.env.FIELD_ENCRYPTION_DEV_KEY?.trim();
    const key = raw ? Buffer.from(raw, 'base64') : null;
    if (key?.length !== 32) {
      console.error('[crypto] FIELD_ENCRYPTION_DEV_KEY ausente ou sem 32 bytes em base64.');
      throw new CryptoUnavailableError();
    }
    return key;
  }

  async encrypt(plain: string, context: FieldEncryptionContext): Promise<EncryptedField> {
    const payload = aesGcmEncrypt(
      this.key(),
      plain,
      encryptionAad(context.documentId, context.field)
    );
    return { v: 1, kid: DEV_KID, ...payload };
  }

  async decrypt(field: EncryptedField, context: FieldEncryptionContext): Promise<string> {
    return aesGcmDecrypt(this.key(), field, encryptionAad(context.documentId, context.field));
  }
}

=== server/interfaces/http/bookings/bookingHttpErrors.ts — diff ===
@@ -1,5 +1,6 @@
 import type { Response } from 'express';
 import { BookingDomainError } from '../../../domain/bookings';
+import { ListingVerificationError } from '../../../domain/partners';
 import { PaymentDomainError } from '../../../domain/payment';
 
 export function sendError(res: Response, status: number, code: string, message: string): Response {
@@ -8,7 +9,11 @@ export function sendError(res: Response, status: number, code: string, message:
 
 /** Erros tipados mantêm status e código; o resto vira 500 sem detalhe interno (AGENTS.md §10.2). */
 export function handleBookingError(res: Response, operation: string, error: unknown): Response {
-  if (error instanceof BookingDomainError || error instanceof PaymentDomainError) {
+  if (
+    error instanceof BookingDomainError ||
+    error instanceof PaymentDomainError ||
+    error instanceof ListingVerificationError
+  ) {
     return sendError(res, error.statusCode, error.code, error.message);
   }
   console.error(`[bookings.${operation}]`, {

=== server/interfaces/http/listingVerifications/listingVerificationController.test.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { CryptoUnavailableError } from '../../../shared/kernel/fieldEncryption';
import { ListingVerificationController } from './listingVerificationController';

const mocks = vi.hoisted(() => ({
  submit: vi.fn(),
  get: vi.fn(),
  readFile: vi.fn(),
  list: vi.fn(),
  review: vi.fn(),
}));

vi.mock(
  '../../../application/usecases/listingVerification/submitListingVerificationApplicationUseCase',
  () => ({
    submitListingVerificationApplicationUseCase: mocks.submit,
  })
);
vi.mock(
  '../../../application/usecases/listingVerification/getListingVerificationApplicationUseCase',
  () => ({
    getListingVerificationApplicationUseCase: mocks.get,
  })
);
vi.mock(
  '../../../application/usecases/listingVerification/readListingVerificationFileApplicationUseCase',
  () => ({
    readListingVerificationFileApplicationUseCase: mocks.readFile,
  })
);
vi.mock('../../../domain/partners', async () => {
  const { ListingVerificationError } = await import(
    '../../../domain/partners/errors/listingVerificationError'
  );
  return {
    ListingVerificationError,
    listListingVerificationsUseCase: mocks.list,
    reviewListingVerificationUseCase: mocks.review,
  };
});

import { ListingVerificationError } from '../../../domain/partners/errors/listingVerificationError';

function response() {
  const res = { status: vi.fn(), json: vi.fn(), send: vi.fn(), setHeader: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.send.mockReturnValue(res);
  return res;
}

const OWNER = { uid: 'owner-1', admin: false, emailVerified: true, authTime: 1 };
const ADMIN = { ...OWNER, uid: 'admin-1', admin: true };
const VALID_BODY = {
  mode: 'document',
  documentType: 'cnpj',
  document: '11.222.333/0001-81',
  holderRole: 'owner',
  files: { cnpjCard: 'verification/owner-1/c.pdf', identity: 'verification/owner-1/i.webp' },
};

function req(partial: Partial<AuthenticatedRequest>) {
  return partial as AuthenticatedRequest;
}

describe('ListingVerificationController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('envio válido responde 200 com a visão mascarada', async () => {
    mocks.submit.mockResolvedValue({ status: 'pending', maskedDocument: '**.***.***/0001-81' });
    const res = response();
    await ListingVerificationController.submit(
      req({ user: OWNER, params: { itemId: 'item-1' }, body: VALID_BODY }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mocks.submit).toHaveBeenCalledWith(
      { uid: 'owner-1', admin: false },
      'item-1',
      expect.objectContaining({ documentType: 'cnpj' })
    );
  });

  it('campo extra no envio responde 400 VALIDATION_ERROR', async () => {
    const res = response();
    await ListingVerificationController.submit(
      req({
        user: OWNER,
        params: { itemId: 'item-1' },
        body: { ...VALID_BODY, status: 'approved' },
      }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0]?.[0].error.code).toBe('VALIDATION_ERROR');
    expect(mocks.submit).not.toHaveBeenCalled();
  });

  it('sem login responde 401', async () => {
    const res = response();
    await ListingVerificationController.get(
      req({ params: { itemId: 'item-1' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('estabelecimento de outra pessoa responde 403 (IDOR)', async () => {
    mocks.get.mockRejectedValue(
      new ListingVerificationError('FORBIDDEN', 'Sem acesso a esta verificação.')
    );
    const res = response();
    await ListingVerificationController.get(
      req({ user: { ...OWNER, uid: 'intruso' }, params: { itemId: 'item-1' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json.mock.calls[0]?.[0].error.code).toBe('FORBIDDEN');
  });

  it('sem chave de criptografia responde 503 CRYPTO_UNAVAILABLE', async () => {
    mocks.submit.mockRejectedValue(new CryptoUnavailableError());
    const res = response();
    await ListingVerificationController.submit(
      req({ user: OWNER, params: { itemId: 'item-1' }, body: VALID_BODY }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json.mock.calls[0]?.[0].error.code).toBe('CRYPTO_UNAVAILABLE');
  });

  it('revisão do admin e conflito NOT_PENDING (409)', async () => {
    mocks.review.mockRejectedValueOnce(new ListingVerificationError('NOT_PENDING', 'Já revisada.'));
    const res = response();
    await ListingVerificationController.review(
      req({ user: ADMIN, params: { itemId: 'item-1' }, body: { decision: 'approve' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('arquivo sai sem cache e com nosniff', async () => {
    mocks.readFile.mockResolvedValue({
      data: Buffer.from('%PDF-'),
      contentType: 'application/pdf',
    });
    const res = response();
    await ListingVerificationController.readFile(
      req({ user: ADMIN, params: { itemId: 'item-1', kind: 'cnpjCard' } }),
      res as unknown as Response
    );
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'private, no-store');
    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('tipo de arquivo desconhecido responde 400', async () => {
    const res = response();
    await ListingVerificationController.readFile(
      req({ user: ADMIN, params: { itemId: 'item-1', kind: '../../etc' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mocks.readFile).not.toHaveBeenCalled();
  });
});

=== server/interfaces/http/listingVerifications/listingVerificationController.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { getListingVerificationApplicationUseCase } from '../../../application/usecases/listingVerification/getListingVerificationApplicationUseCase';
import { readListingVerificationFileApplicationUseCase } from '../../../application/usecases/listingVerification/readListingVerificationFileApplicationUseCase';
import { submitListingVerificationApplicationUseCase } from '../../../application/usecases/listingVerification/submitListingVerificationApplicationUseCase';
import {
  ListingVerificationError,
  listListingVerificationsUseCase,
  reviewListingVerificationUseCase,
} from '../../../domain/partners';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { CryptoUnavailableError } from '../../../shared/kernel/fieldEncryption';
import {
  ListingVerificationParamsSchema,
  ListListingVerificationsQuerySchema,
  ReviewListingVerificationSchema,
  SubmitListingVerificationSchema,
  VerificationFileParamsSchema,
} from './schemas/listingVerificationSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof ListingVerificationError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  if (error instanceof CryptoUnavailableError) {
    return sendError(res, 503, error.code, error.message);
  }
  console.error(`[ListingVerificationController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível concluir a verificação.');
}

function actorOf(req: AuthenticatedRequest) {
  return req.user ? { uid: req.user.uid, admin: req.user.admin } : null;
}

export class ListingVerificationController {
  static async get(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = ListingVerificationParamsSchema.safeParse(req.params);
    if (!params.success)
      return sendError(res, 400, 'VALIDATION_ERROR', 'Estabelecimento inválido.');
    try {
      const view = await getListingVerificationApplicationUseCase(actor, params.data.itemId);
      return res.status(200).json({ data: view });
    } catch (error) {
      return handleError(res, error, 'get');
    }
  }

  static async submit(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = ListingVerificationParamsSchema.safeParse(req.params);
    const body = SubmitListingVerificationSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados da verificação inválidos.');
    }
    try {
      const view = await submitListingVerificationApplicationUseCase(
        actor,
        params.data.itemId,
        body.data
      );
      return res.status(200).json({ data: view });
    } catch (error) {
      return handleError(res, error, 'submit');
    }
  }

  static async list(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const query = ListListingVerificationsQuerySchema.safeParse(req.query);
    if (!query.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Filtro inválido.');
    try {
      const page = await listListingVerificationsUseCase(
        actor,
        query.data.status,
        query.data.limit,
        query.data.cursor ?? null
      );
      return res.status(200).json(page);
    } catch (error) {
      return handleError(res, error, 'list');
    }
  }

  static async review(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = ListingVerificationParamsSchema.safeParse(req.params);
    const body = ReviewListingVerificationSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Revisão inválida.');
    }
    try {
      const view = await reviewListingVerificationUseCase(
        actor,
        params.data.itemId,
        body.data.decision,
        body.data.reason ?? null
      );
      console.info('[audit] listing_verification_review', {
        adminUid: actor.uid,
        itemId: params.data.itemId,
        decision: body.data.decision,
      });
      return res.status(200).json({ data: view });
    } catch (error) {
      return handleError(res, error, 'review');
    }
  }

  static async readFile(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = VerificationFileParamsSchema.safeParse(req.params);
    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Arquivo inválido.');
    try {
      const file = await readListingVerificationFileApplicationUseCase(
        actor,
        params.data.itemId,
        params.data.kind
      );
      if (!file) return sendError(res, 404, 'NOT_FOUND', 'Arquivo não encontrado.');
      // Documento pessoal: sem cache e sem o navegador adivinhar o tipo do conteúdo.
      res.setHeader('Content-Type', file.contentType);
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Disposition', 'inline');
      return res.status(200).send(file.data);
    } catch (error) {
      return handleError(res, error, 'readFile');
    }
  }
}

=== server/interfaces/http/listingVerifications/listingVerificationRoutes.ts — ARQUIVO NOVO, conteúdo completo ===
import { type NextFunction, type Response, Router } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAdminToken, verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { ListingVerificationController } from './listingVerificationController';

// Envio de documento pessoal: token revogado é recusado (AGENTS.md §7.3 item 3).
function verifyAuthTokenStrict(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return verifyAuthToken(req, res, next, { checkRevoked: true });
}

const router = Router();

router.get('/', verifyAdminToken, ListingVerificationController.list);
router.get('/:itemId', verifyAuthToken, ListingVerificationController.get);
router.put('/:itemId', verifyAuthTokenStrict, ListingVerificationController.submit);
router.post('/:itemId/review', verifyAdminToken, ListingVerificationController.review);
router.get('/:itemId/files/:kind', verifyAdminToken, ListingVerificationController.readFile);

export default router;

=== server/interfaces/http/listingVerifications/schemas/listingVerificationSchemas.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';

const FILE_ID = z.string().min(1).max(200);
const ITEM_ID = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[\w-]+$/);

export const ListingVerificationParamsSchema = z.object({ itemId: ITEM_ID }).strict();

export const VerificationFileParamsSchema = z
  .object({ itemId: ITEM_ID, kind: z.enum(['cnpjCard', 'identity', 'authorization']) })
  .strict();

export const SubmitListingVerificationSchema = z.discriminatedUnion('mode', [
  z
    .object({
      mode: z.literal('document'),
      documentType: z.enum(['cpf', 'cnpj']),
      document: z.string().min(11).max(20),
      holderRole: z.enum(['owner', 'representative']).optional(),
      files: z
        .object({
          cnpjCard: FILE_ID.optional(),
          identity: FILE_ID.optional(),
          authorization: FILE_ID.optional(),
        })
        .strict()
        .optional(),
      cadastur: z.string().trim().max(30).nullable().optional(),
    })
    .strict(),
  z.object({ mode: z.literal('linked'), sourceItemId: ITEM_ID }).strict(),
]);

export const ReviewListingVerificationSchema = z
  .object({
    decision: z.enum(['approve', 'reject']),
    reason: z.string().max(500).optional(),
  })
  .strict();

export const ListListingVerificationsQuerySchema = z
  .object({
    status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    cursor: ITEM_ID.optional(),
  })
  .strict();

=== server/shared/kernel/fieldEncryption.ts — ARQUIVO NOVO, conteúdo completo ===
/** Valor cifrado em nível de campo (AGENTS.md §7.7): `kid` permite rotação; `dek` é a chave de dados cifrada pelo KMS. */
export interface EncryptedField {
  v: 1;
  kid: string;
  iv: string;
  tag: string;
  ct: string;
  dek?: string;
}

/** Entra como associated data: impede copiar o valor cifrado para outro documento ou campo. */
export interface FieldEncryptionContext {
  documentId: string;
  field: string;
}

export interface FieldEncryptionPort {
  encrypt(plain: string, context: FieldEncryptionContext): Promise<EncryptedField>;
  decrypt(field: EncryptedField, context: FieldEncryptionContext): Promise<string>;
}

/** HMAC estável para busca e unicidade sem gravar o valor (blind index). */
export interface BlindIndexPort {
  indexFor(purpose: string, normalizedValue: string): string;
}

/** Chave de criptografia ou de índice ausente: a rota responde 503, o processo continua de pé. */
export class CryptoUnavailableError extends Error {
  readonly code = 'CRYPTO_UNAVAILABLE';

  constructor() {
    super('Proteção de dados indisponível no momento.');
    this.name = 'CryptoUnavailableError';
  }
}

=== storage.rules — diff ===
@@ -9,6 +9,10 @@ service firebase.storage {
       allow read: if true;
       allow write: if false;
     }
+    // Documentos de verificação (D12): privados; só o backend lê, pelo Admin SDK.
+    match /verification/{allPaths=**} {
+      allow read, write: if false;
+    }
     match /{allPaths=**} {
       allow read, write: if false;
     }

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm test` → 160 arquivos, 888 testes, `npm run build`;
- `npm run test:rules` → 4 arquivos, 61 testes.

NO PAINEL SECRETS DO AI STUDIO (não grave em arquivo):
- FIELD_ENCRYPTION_DEV_KEY: 32 bytes aleatórios em base64;
- PII_BLIND_INDEX_KEY: 32 caracteres aleatórios ou mais.

Responda no formato do AGENTS.md §16.3.
~~~~
