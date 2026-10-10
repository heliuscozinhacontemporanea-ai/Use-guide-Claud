# Registro de Débitos Arquiteturais

| ID | Arquivo | Regra violada | Risco | Correção prevista |
|---|---|---|---|---|
| B1 | `partners/schemas/partnerContentSchema.ts` → `events/schemas/eventSchema.ts` | §5.2 (schema interno) | médio — mudança em events quebra partners | events exporta schema/tipo público de entrada, ou mover rotas de evento do parceiro para `interfaces/http` usando o schema de events |
| B2 | controllers de 6 domínios (`partners/controllers/partnerController.ts`, `partners/controllers/partnerContentController.ts`, `events/controllers/eventsController.ts`, `payment/controllers/paymentController.ts`, `ticketing/controllers/ticketingController.ts`, `users/controllers/userController.ts`, `admin/controllers/adminStatsController.ts`, `admin/controllers/adminPartnersController.ts`) → `server/application` | §3.4 | baixo em runtime, alto em manutenção | mover para `server/interfaces/http` |
| B3 | `guide/*` (`guide/ports/userContextResolverPort.ts`, `services/guideService.ts`, `usecases/{create,update,delete}GuideItemUseCase.ts`) → `application/security` (type) | §3.4 | baixo | `server/shared/kernel` |
| B4 | `notifications/services/notificationService.ts` → `partners` | §5.4 (notifications folha) | médio — cria cadeia reviews→notifications→partners→ticketing | receber `recipientPartnerId` já resolvido por parâmetro/Application UseCase |
| B5 | `reviews/adapters/firestoreReviewAdapter.ts` → guide/events/users | §3.1 (adapter de persistência com lógica cross-domain) | médio | separar `ReviewTargetPort` + adapter ACL dedicado |
| B6 | `scripts/backfillPartnerDocumentKeys.ts` → `partners/services/backfillPartnerDocumentKeys.ts` | §5.2 | baixo | expor `backfillPartnerDocumentKeysUseCase` |
| B7 | Factories instanciam adapters na importação; `adminClient.ts` lança erro na importação se `FIRESTORE_DATABASE_ID`/`FIREBASE_STORAGE_BUCKET` faltarem | §2.2.4, §5.7 | **alto** — qualquer import derruba o boot no AI Studio sem env | lazy getters |
| B8 | `payment/controllers/paymentController.ts` + `handleStripeWebhookOrchestrationApplicationUseCase` duplicam a idempotência do webhook | §8.6 | **crítico** — ver auditoria, bug P0-1 | um único handler com idempotência em duas fases |
