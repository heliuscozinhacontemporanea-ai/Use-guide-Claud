# Registro de Débitos Arquiteturais

| ID | Arquivo | Regra violada | Risco | Correção prevista |
|---|---|---|---|---|
| B1 | `partners/schemas/partnerContentSchema.ts` → `events/schemas/eventSchema.ts` | §5.2 (schema interno) | médio — mudança em events quebra partners | events exporta schema/tipo público de entrada, ou mover rotas de evento do parceiro para `interfaces/http` usando o schema de events |
| B2 | controllers de 6 domínios (`partners/controllers/partnerController.ts`, `partners/controllers/partnerContentController.ts`, `events/controllers/eventsController.ts`, `payment/controllers/paymentController.ts`, `ticketing/controllers/ticketingController.ts`, `users/controllers/userController.ts`, `admin/controllers/adminStatsController.ts`, `admin/controllers/adminPartnersController.ts`) → `server/application` | §3.4 | baixo em runtime, alto em manutenção | mover para `server/interfaces/http` |
| B3 | `guide/*` (`guide/ports/userContextResolverPort.ts`, `services/guideService.ts`, `usecases/{create,update,delete}GuideItemUseCase.ts`) → `application/security` (type) | §3.4 | baixo | `server/shared/kernel` |
| B4 | `notifications/services/notificationService.ts` → `partners` | §5.4 (notifications folha) | médio — cria cadeia reviews→notifications→partners→ticketing | receber `recipientPartnerId` já resolvido por parâmetro/Application UseCase |
| B5 | `reviews/adapters/firestoreReviewAdapter.ts` → guide/events/users | §3.1 (adapter de persistência com lógica cross-domain) | médio | separar `ReviewTargetPort` + adapter ACL dedicado |
| B10 | `guide/usecases/listPublicGuideItemsUseCase.ts` e `events` `listPublicListings` | §6.4 (leitura da coleção inteira) | baixo enquanto o catálogo for pequeno; o sitemap fica em cache na CDN por 1 h | consulta com `where('isActive', '==', true)` e paginação quando o catálogo passar de alguns milhares de itens |
| B11 | `partners/components/PartnerPanel.tsx` (591 linhas), `guide/components/ExploreView.tsx` (506), `search/components/SearchOverlay.tsx` (455), `app/AppRouter.tsx` (427), `payment/services/stripePaymentService.ts` (≈430) | §13 (acima de 400 linhas, dividir ao tocar) | médio — arquivos difíceis de revisar | prompts 9 e 10 só trocaram trechos pontuais (o AppRouter perdeu as rotas, que foram para `app/routes/AppRoutes.tsx`); dividir cada um num prompt próprio |
| B12 | `application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.ts` (notificação de falha de cobrança) | §12.5 (texto do backend em pt-BR) | baixo | `notifications` passar a aceitar chave de tradução e gerar no idioma do parceiro |
| B13 | `application/usecases/bookings/*` (horário cancelado, reembolso que falhou) | §8.7 (avisar o comprador) e §7.10 A09 (alerta ao admin) | médio — o comprador só descobre o cancelamento em "Minhas reservas" e a falha de reembolso fica só no log | `notifications` aceitar destinatário usuário e admin (hoje só `recipientPartnerId`) |
| B14 | UX — itens da auditoria de 2026-10-12 que pedem decisão de produto | §11 (UX) e §15 item 4 | baixo a médio | (a) preferências de notificação do parceiro estão em "Sobre o app" (`content/components/AboutView.tsx`), deveriam ir para Configurações; (b) "Ver todos" da Explore abre a listagem sem a busca e os filtros aplicados (`GridView` não tem filtros); (c) modais de hospedagem e restaurante não têm botão de mapa (`mapLink`); (d) "Programa de Parceiros" aberto pelo menu não volta ao menu ao fechar |
| B16 | textos fixos em pt-BR ainda em `user/components/AccountView.tsx`, `ticketing/components/UserTicketsHistoryView.tsx` e `CheckoutResultView.tsx`, `partners/components/PartnersModal.tsx`, `insights/components/ReportsView.tsx`, `guide/components/ExploreView.tsx` | §12.3 | médio para en/fr | traduzir tela a tela; o Prompt 16 traduziu menu, configurações, favoritos e portal do parceiro |

## Resolvidos

| ID | Resolução |
|---|---|
| B15 | Removido import de `database/factory` em `FavoritesList` (Prompt 16): o item usa os dados de `FavoriteItem` e navega para o detalhe via `useSideMenu` |
| Menu lateral em `src/ui/layouts` importando domínios (§3.4.3) | Prompt 16: virou composição em `src/app/menu/SideMenu.tsx`; `SidebarLayout` continua em `src/ui` sem conhecer domínios |
| B6 | Script `backfillPartnerDocumentKeys` removido (prompt 4.1): migração de transição desnecessária antes do lançamento |
| B7 | Inicialização preguiçosa do Firebase Admin (prompt 4) |
| B8 | Webhook com idempotência em duas fases e remoção do handler duplicado (prompt 2) |
| — | SEO do servidor não rodava em produção (o Hosting entregava o `index.html` estático) e inseria valores sem escape: resolvido no prompt 8 (D7) |
| — | Planos sem renovação automática (pagamento avulso por PaymentIntent): resolvido no prompt 9 (D2) com Stripe Billing no cartão; o pagamento único continua como alternativa |
| B9 | Metadados das rotas duplicados entre app e servidor: resolvido no prompt 10 (D6) com os textos em `seo.routes` do i18n e teste de paridade com `seo/utils/routeSeo.ts` |
| — | Arquivos agregadores de UseCases (`eventUseCases.ts`, `ticketingUseCases.ts`, `paymentUseCases.ts`, `marketplaceConnectUseCases.ts`, `ticketingPaymentOrchestrationUseCases.ts`, `eventLifecycleOrchestrationUseCases.ts`, no backend e no frontend): resolvido no prompt 15, um UseCase por arquivo (AGENTS.md §13) |
