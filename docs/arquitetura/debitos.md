# Registro de Débitos Arquiteturais

| ID | Arquivo | Regra violada | Risco | Correção prevista |
|---|---|---|---|---|
| B1 | `partners/schemas/partnerContentSchema.ts` → `events/schemas/eventSchema.ts` | §5.2 (schema interno) | médio — mudança em events quebra partners | events exporta schema/tipo público de entrada, ou mover rotas de evento do parceiro para `interfaces/http` usando o schema de events |
| B2 | controllers de 6 domínios (`partners/controllers/partnerController.ts`, `partners/controllers/partnerContentController.ts`, `events/controllers/eventsController.ts`, `payment/controllers/paymentController.ts`, `ticketing/controllers/ticketingController.ts`, `users/controllers/userController.ts`, `admin/controllers/adminStatsController.ts`, `admin/controllers/adminPartnersController.ts`) → `server/application` | §3.4 | baixo em runtime, alto em manutenção | mover para `server/interfaces/http` |
| B3 | `guide/*` (`guide/ports/userContextResolverPort.ts`, `services/guideService.ts`, `usecases/{create,update,delete}GuideItemUseCase.ts`) → `application/security` (type) | §3.4 | baixo | `server/shared/kernel` |
| B4 | `notifications/services/notificationService.ts` → `partners` | §5.4 (notifications folha) | médio — cria cadeia reviews→notifications→partners→ticketing | receber `recipientPartnerId` já resolvido por parâmetro/Application UseCase |
| B5 | `reviews/adapters/firestoreReviewAdapter.ts` → guide/events/users | §3.1 (adapter de persistência com lógica cross-domain) | médio | separar `ReviewTargetPort` + adapter ACL dedicado |
| B10 | `guide/usecases/listPublicGuideItemsUseCase.ts` e `events` `listPublicListings` | §6.4 (leitura da coleção inteira) | baixo enquanto o catálogo for pequeno; o sitemap fica em cache na CDN por 1 h | consulta com `where('isActive', '==', true)` e paginação quando o catálogo passar de alguns milhares de itens |
| B11 | `partners/components/PartnerPanel.tsx` (591 linhas), `guide/components/ExploreView.tsx` (506), `search/components/SearchOverlay.tsx` (455), `app/AppRouter.tsx` (410) | §13 (acima de 400 linhas, dividir ao tocar) | médio — arquivos difíceis de revisar | prompts 9 e 10 só trocaram trechos pontuais (o AppRouter perdeu as rotas, que foram para `app/routes/AppRoutes.tsx`); dividir cada um num prompt próprio |
| B12 | `application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.ts` (notificação de falha de cobrança) | §12.5 (texto do backend em pt-BR) | baixo | `notifications` passar a aceitar chave de tradução e gerar no idioma do parceiro |

## Resolvidos

| ID | Resolução |
|---|---|
| B6 | Script `backfillPartnerDocumentKeys` removido (prompt 4.1): migração de transição desnecessária antes do lançamento |
| B7 | Inicialização preguiçosa do Firebase Admin (prompt 4) |
| B8 | Webhook com idempotência em duas fases e remoção do handler duplicado (prompt 2) |
| — | SEO do servidor não rodava em produção (o Hosting entregava o `index.html` estático) e inseria valores sem escape: resolvido no prompt 8 (D7) |
| — | Planos sem renovação automática (pagamento avulso por PaymentIntent): resolvido no prompt 9 (D2) com Stripe Billing no cartão; o pagamento único continua como alternativa |
| B9 | Metadados das rotas duplicados entre app e servidor: resolvido no prompt 10 (D6) com os textos em `seo.routes` do i18n e teste de paridade com `seo/utils/routeSeo.ts` |
