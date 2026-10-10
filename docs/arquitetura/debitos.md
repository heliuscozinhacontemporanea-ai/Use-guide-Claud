# Registro de Débitos Arquiteturais

| ID | Arquivo | Regra violada | Risco | Correção prevista |
|---|---|---|---|---|
| B1 | `partners/schemas/partnerContentSchema.ts` → `events/schemas/eventSchema.ts` | §5.2 (schema interno) | médio — mudança em events quebra partners | events exporta schema/tipo público de entrada, ou mover rotas de evento do parceiro para `interfaces/http` usando o schema de events |
| B2 | controllers de 6 domínios (`partners/controllers/partnerController.ts`, `partners/controllers/partnerContentController.ts`, `events/controllers/eventsController.ts`, `payment/controllers/paymentController.ts`, `ticketing/controllers/ticketingController.ts`, `users/controllers/userController.ts`, `admin/controllers/adminStatsController.ts`, `admin/controllers/adminPartnersController.ts`) → `server/application` | §3.4 | baixo em runtime, alto em manutenção | mover para `server/interfaces/http` |
| B3 | `guide/*` (`guide/ports/userContextResolverPort.ts`, `services/guideService.ts`, `usecases/{create,update,delete}GuideItemUseCase.ts`) → `application/security` (type) | §3.4 | baixo | `server/shared/kernel` |
| B4 | `notifications/services/notificationService.ts` → `partners` | §5.4 (notifications folha) | médio — cria cadeia reviews→notifications→partners→ticketing | receber `recipientPartnerId` já resolvido por parâmetro/Application UseCase |
| B5 | `reviews/adapters/firestoreReviewAdapter.ts` → guide/events/users | §3.1 (adapter de persistência com lógica cross-domain) | médio | separar `ReviewTargetPort` + adapter ACL dedicado |

## Resolvidos

| ID | Resolução |
|---|---|
| B6 | Script `backfillPartnerDocumentKeys` removido (prompt 4.1): migração de transição desnecessária antes do lançamento |
| B7 | Inicialização preguiçosa do Firebase Admin (prompt 4) |
| B8 | Webhook com idempotência em duas fases e remoção do handler duplicado (prompt 2) |
