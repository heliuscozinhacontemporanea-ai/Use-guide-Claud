# Prompt 16 — UX do menu e dos fluxos do usuário

> Lote 8, gerado do commit de referência `2ab647c` da branch `claude/agents-md-v2`. Aplique **depois** do lote 7 (14.1 e 15). Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 16 — UX do menu e dos fluxos do usuário

Pedido do responsável do produto: a interface deve refletir corretamente as funções de cada usuário e seguir uma lógica coerente. Exemplo dado: o botão de favoritos do menu abria uma página solta em vez de abrir dentro do menu. A auditoria encontrou outros pontos do mesmo tipo (botões sem ação, botão que levava o parceiro para a tela de admin, portal do parceiro sem saída, voltar que trocava o idioma, exclusão de conta impossível para quem entra com Google).

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). Este prompt vem depois dos prompts 14.1 e 15.

O QUE MUDA:
1) Menu lateral: favoritos e "Minhas reservas" abrem DENTRO do menu, como ingressos, conta e configurações. A sub-tela aberta fica na URL (`?menu=1` = principal, `?menu=favorites`, `?menu=bookings`, `?menu=tickets`…). Avançar empilha o histórico; o voltar do menu e o do navegador levam à tela anterior. Sem login, telas pessoais mostram a tela principal.
2) O SideMenu sai de src/ui/layouts (importava domínios, AGENTS.md §3.4.3) e vira composição em src/app/menu/ (SideMenu.tsx, menuViews.ts, useSideMenu.ts). SidebarLayout continua em src/ui.
3) As rotas /favoritos e /reservas (e en/fr) deixam de existir, com seus textos de SEO; FavoritesPageComposition e MyBookingsPageComposition são apagados. PRIVATE_ROUTE_KEYS e INDEXABLE_ROUTE_KEYS saem (todas as rotas restantes são indexáveis). decisoes.md D6 registra a mudança.
4) "Ver minhas reservas" (após reservar e no retorno do Stripe) e "Ver meus ingressos" (retorno do Stripe) abrem o menu na sub-tela certa.
5) O botão do menu aparece em todas as páginas (antes só na Explore). O papel de parceiro/admin no menu vem da sessão (useAuthContext), a mesma fonte do AppRouter; useUserProfile deixa de expor isPartner/isAdmin. "Programa de Parceiros" não aparece para admin. "Entrar ou cadastre-se" não aparece para quem já entrou ("Sua área").
6) Cadastro de parceiro concluído: "Acessar painel" recarrega o perfil e abre o portal do parceiro (`?partner=1`); antes ia para /admin, que é só de administradores.
7) Portal do parceiro: sem login pede para entrar (antes ficava carregando para sempre); quem não é parceiro vê o aviso com botão de voltar ao guia.
8) Botões de voltar ao início usam goTo('explore') do useLocalizedRouting em vez de navigate('/'), que trocava o idioma para pt-BR. goTo ganha o parâmetro opcional de NavigateOptions.
9) Conta só com Google: AuthPort ganha reauthenticateWithGoogle() e hasPasswordSignIn(); a exclusão confirma pelo popup do Google, sem pedir senha, e "Alterar senha" só aparece para quem tem senha (LGPD, AGENTS.md §7.5).
10) "Solicitar novo link" (link de redefinição expirado) abre o modal direto em "esqueci minha senha" (useUIStore.openPasswordRecovery).
11) Botões sem ação: "Central de emergência" sai do menu (não há conteúdo para ela); "Ver histórico" do fluxo de visitas sai; o de avaliações pendentes vira "Ver todas / Mostrar menos".
12) Textos traduzidos (pt-BR, en, fr): menu (ingressos, "Sua área"), configurações, aparência, idioma, favoritos e portal do parceiro. Botões de voltar das configurações deixam de ser anunciados como "fechar menu".
13) Testes novos: menuViews, useSideMenu, PartnerPortalComposition, useUIStore; ajustados: deleteCurrentUserUseCase, rotas e SEO.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- docs/arquitetura/decisoes.md (alterar)
- server/domain/seo/services/seoHtmlService.test.ts (alterar)
- server/domain/seo/services/seoHtmlService.ts (alterar)
- server/domain/seo/services/sitemapService.ts (alterar)
- server/domain/seo/utils/routeSeo.ts (alterar)
- server/shared/kernel/localizedRoutes.test.ts (alterar)
- server/shared/kernel/localizedRoutes.ts (alterar)
- src/app/AppRouter.tsx (alterar)
- src/app/compositions/CheckoutResultComposition.tsx (alterar)
- src/app/compositions/FavoritesPageComposition.tsx (apagar)
- src/app/compositions/ItemBookingComposition.tsx (alterar)
- src/app/compositions/MyBookingsPageComposition.tsx (apagar)
- src/app/compositions/PartnerPortalComposition.test.tsx (criar)
- src/app/compositions/PartnerPortalComposition.tsx (alterar)
- src/app/menu/SideMenu.tsx (criar)
- src/app/menu/menuViews.test.ts (criar)
- src/app/menu/menuViews.ts (criar)
- src/app/menu/useSideMenu.test.tsx (criar)
- src/app/menu/useSideMenu.ts (criar)
- src/app/routes/AppRoutes.test.tsx (alterar)
- src/app/routes/AppRoutes.tsx (alterar)
- src/domain/admin/components/AdminDispatcher.tsx (alterar)
- src/domain/admin/components/AdminPanel.tsx (alterar)
- src/domain/auth/adapters/firebaseAuthAdapter.ts (alterar)
- src/domain/auth/application/usecases/authUseCases.test.ts (alterar)
- src/domain/auth/application/usecases/hasPasswordSignInUseCase.ts (criar)
- src/domain/auth/application/usecases/index.ts (alterar)
- src/domain/auth/application/usecases/reauthenticateWithGoogleUseCase.ts (criar)
- src/domain/auth/components/LoginModal.tsx (alterar)
- src/domain/auth/components/ResetPassword.tsx (alterar)
- src/domain/auth/factory.ts (alterar)
- src/domain/auth/types/authPort.ts (alterar)
- src/domain/bookings/components/buyer/MyBookingsView.tsx (alterar)
- src/domain/content/index.ts (alterar)
- src/domain/favorites/components/FavoritesList.tsx (alterar)
- src/domain/insights/components/ReportsView.tsx (alterar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/domain/partners/components/PartnersModal.tsx (alterar)
- src/domain/user/application/usecases/deleteCurrentUserUseCase.test.ts (alterar)
- src/domain/user/application/usecases/deleteCurrentUserUseCase.ts (alterar)
- src/domain/user/components/AccountView.tsx (alterar)
- src/domain/user/components/AppearanceSettingsView.tsx (alterar)
- src/domain/user/components/LanguageSettingsView.tsx (alterar)
- src/domain/user/components/MainMenuView.tsx (alterar)
- src/domain/user/components/SettingsView.tsx (alterar)
- src/domain/user/hooks/useUserProfile.ts (alterar)
- src/shared/hooks/useLocalizedRouting.ts (alterar)
- src/shared/i18n/index.ts (alterar)
- src/shared/i18n/localizedRoutes.test.ts (alterar)
- src/shared/i18n/localizedRoutes.ts (alterar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/stores/useUIStore.test.ts (criar)
- src/shared/stores/useUIStore.ts (alterar)
- src/shared/utils/seo.test.ts (alterar)
- src/shared/utils/seo.ts (alterar)
- src/ui/layouts/Header.tsx (alterar)
- src/ui/layouts/SideMenu.tsx (apagar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -8,14 +8,18 @@
 | B4 | `notifications/services/notificationService.ts` → `partners` | §5.4 (notifications folha) | médio — cria cadeia reviews→notifications→partners→ticketing | receber `recipientPartnerId` já resolvido por parâmetro/Application UseCase |
 | B5 | `reviews/adapters/firestoreReviewAdapter.ts` → guide/events/users | §3.1 (adapter de persistência com lógica cross-domain) | médio | separar `ReviewTargetPort` + adapter ACL dedicado |
 | B10 | `guide/usecases/listPublicGuideItemsUseCase.ts` e `events` `listPublicListings` | §6.4 (leitura da coleção inteira) | baixo enquanto o catálogo for pequeno; o sitemap fica em cache na CDN por 1 h | consulta com `where('isActive', '==', true)` e paginação quando o catálogo passar de alguns milhares de itens |
-| B11 | `partners/components/PartnerPanel.tsx` (591 linhas), `guide/components/ExploreView.tsx` (506), `search/components/SearchOverlay.tsx` (455), `app/AppRouter.tsx` (410), `payment/services/stripePaymentService.ts` (≈430) | §13 (acima de 400 linhas, dividir ao tocar) | médio — arquivos difíceis de revisar | prompts 9 e 10 só trocaram trechos pontuais (o AppRouter perdeu as rotas, que foram para `app/routes/AppRoutes.tsx`); dividir cada um num prompt próprio |
+| B11 | `partners/components/PartnerPanel.tsx` (591 linhas), `guide/components/ExploreView.tsx` (506), `search/components/SearchOverlay.tsx` (455), `app/AppRouter.tsx` (427), `payment/services/stripePaymentService.ts` (≈430) | §13 (acima de 400 linhas, dividir ao tocar) | médio — arquivos difíceis de revisar | prompts 9 e 10 só trocaram trechos pontuais (o AppRouter perdeu as rotas, que foram para `app/routes/AppRoutes.tsx`); dividir cada um num prompt próprio |
 | B12 | `application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.ts` (notificação de falha de cobrança) | §12.5 (texto do backend em pt-BR) | baixo | `notifications` passar a aceitar chave de tradução e gerar no idioma do parceiro |
 | B13 | `application/usecases/bookings/*` (horário cancelado, reembolso que falhou) | §8.7 (avisar o comprador) e §7.10 A09 (alerta ao admin) | médio — o comprador só descobre o cancelamento em "Minhas reservas" e a falha de reembolso fica só no log | `notifications` aceitar destinatário usuário e admin (hoje só `recipientPartnerId`) |
+| B14 | UX — itens da auditoria de 2026-10-12 que pedem decisão de produto | §11 (UX) e §15 item 4 | baixo a médio | (a) preferências de notificação do parceiro estão em "Sobre o app" (`content/components/AboutView.tsx`), deveriam ir para Configurações; (b) "Ver todos" da Explore abre a listagem sem a busca e os filtros aplicados (`GridView` não tem filtros); (c) modais de hospedagem e restaurante não têm botão de mapa (`mapLink`); (d) "Programa de Parceiros" aberto pelo menu não volta ao menu ao fechar |
+| B15 | `favorites/components/FavoritesList.tsx` importa `database/factory` por caminho interno | §5.2 (só pela fachada) | baixo | buscar o item por um UseCase público de `guide` recebido por prop da composição do menu |
+| B16 | textos fixos em pt-BR ainda em `user/components/AccountView.tsx`, `ticketing/components/UserTicketsHistoryView.tsx` e `CheckoutResultView.tsx`, `partners/components/PartnersModal.tsx`, `insights/components/ReportsView.tsx`, `guide/components/ExploreView.tsx` | §12.3 | médio para en/fr | traduzir tela a tela; o Prompt 16 traduziu menu, configurações, favoritos e portal do parceiro |
 
 ## Resolvidos
 
 | ID | Resolução |
 |---|---|
+| Menu lateral em `src/ui/layouts` importando domínios (§3.4.3) | Prompt 16: virou composição em `src/app/menu/SideMenu.tsx`; `SidebarLayout` continua em `src/ui` sem conhecer domínios |
 | B6 | Script `backfillPartnerDocumentKeys` removido (prompt 4.1): migração de transição desnecessária antes do lançamento |
 | B7 | Inicialização preguiçosa do Firebase Admin (prompt 4) |
 | B8 | Webhook com idempotência em duas fases e remoção do handler duplicado (prompt 2) |

=== docs/arquitetura/decisoes.md — diff ===
@@ -65,9 +65,9 @@
 | `restaurants` | `/restaurantes` | `/en/restaurants` | `/fr/restaurants` |
 | `attractions` | `/pontos` | `/en/attractions` | `/fr/attractions` |
 | `guide` | `/info` | `/en/travel-guide` | `/fr/guide-pratique` |
-| `favorites` | `/favoritos` | `/en/favorites` | `/fr/favoris` |
 
 * Rotas não indexáveis (`/admin`, `/reset-password`, `/checkout/result`) não ganham versão por idioma.
+* Favoritos, "Minhas reservas", ingressos, conta e configurações **não são páginas**: abrem dentro do menu lateral, com a sub-tela na URL (`?menu=favorites`, `?menu=bookings`, `?menu=tickets`…). Ajuste pedido pelo responsável do produto em 2026-10-12 (Prompt 16); as rotas `/favoritos` e `/reservas` foram removidas.
 * O idioma da URL tem prioridade sobre o salvo no navegador.
 * **Prompt:** 10.

=== server/domain/seo/services/seoHtmlService.test.ts — diff ===
@@ -167,7 +167,7 @@ describe('SeoHtmlService.buildMetadata', () => {
     expect(meta.canonicalUrl).toBe('https://useguide.com.br/en/stays?item=item-1&type=item');
   });
 
-  it('favoritos não é indexado', async () => {
+  it('caminho fora do mapa de rotas não é indexado', async () => {
     const { service } = createService();
     const meta = await service.buildMetadata('/fr/favoris', {});
     expect(meta.robots).toBe('noindex, follow');

=== server/domain/seo/services/seoHtmlService.ts — diff ===
@@ -1,9 +1,5 @@
 import { DEFAULT_LOCALE, type Locale } from '../../../shared/kernel/locale';
-import {
-  PRIVATE_ROUTE_KEYS,
-  parseLocalizedPath,
-  type RouteKey,
-} from '../../../shared/kernel/localizedRoutes';
+import { parseLocalizedPath, type RouteKey } from '../../../shared/kernel/localizedRoutes';
 import type { HtmlTemplatePort } from '../ports/htmlTemplatePort';
 import type { SeoContentPort } from '../ports/seoContentPort';
 import type { SeoMetadata } from '../types/seoTypes';
@@ -66,7 +62,6 @@ function routeMetadata(routeKey: RouteKey, locale: Locale): SeoMetadata {
     locale,
     canonicalUrl: absoluteUrl(routeKey, locale),
     alternates: buildAlternates(routeKey),
-    ...(PRIVATE_ROUTE_KEYS.includes(routeKey) ? { robots: NOINDEX } : {}),
   };
 }

=== server/domain/seo/services/sitemapService.ts — diff ===
@@ -1,5 +1,5 @@
 import { SUPPORTED_LOCALES } from '../../../shared/kernel/locale';
-import { INDEXABLE_ROUTE_KEYS, type RouteKey } from '../../../shared/kernel/localizedRoutes';
+import { ROUTE_KEYS, type RouteKey } from '../../../shared/kernel/localizedRoutes';
 import type { SeoContentPort } from '../ports/seoContentPort';
 import { absoluteUrl, buildAlternates, itemSearch } from '../utils/localizedUrls';
 import { CATEGORY_ROUTE_KEY } from '../utils/routeSeo';
@@ -36,7 +36,7 @@ export class SitemapService {
   async renderXml(): Promise<string> {
     const entries = await this.content.listIndexableEntries();
     const urls = [
-      ...INDEXABLE_ROUTE_KEYS.flatMap((routeKey) => renderPageUrls(routeKey, '')),
+      ...ROUTE_KEYS.flatMap((routeKey) => renderPageUrls(routeKey, '')),
       ...entries.flatMap((entry) =>
         renderPageUrls(
           CATEGORY_ROUTE_KEY[entry.category],

=== server/domain/seo/utils/routeSeo.ts — diff ===
@@ -145,34 +145,6 @@ export const ROUTE_SEO_TEXTS: Record<RouteKey, Record<Locale, RouteText>> = {
         "Tout ce qu'il faut savoir : taxe touristique, comment venir, meilleure saison, transferts et conseils essentiels.",
     },
   },
-  favorites: {
-    'pt-BR': {
-      title: 'Meus Favoritos | Use Guide',
-      description: 'Os lugares, passeios e eventos que você salvou no Use Guide.',
-    },
-    en: {
-      title: 'My Favorites | Use Guide',
-      description: 'The places, tours and events you saved on Use Guide.',
-    },
-    fr: {
-      title: 'Mes Favoris | Use Guide',
-      description: 'Les lieux, excursions et événements que vous avez enregistrés sur Use Guide.',
-    },
-  },
-  bookings: {
-    'pt-BR': {
-      title: 'Minhas Reservas | Use Guide',
-      description: 'Seus passeios e entradas reservados no Use Guide.',
-    },
-    en: {
-      title: 'My Bookings | Use Guide',
-      description: 'Your tours and entries booked on Use Guide.',
-    },
-    fr: {
-      title: 'Mes Réservations | Use Guide',
-      description: 'Vos excursions et entrées réservées sur Use Guide.',
-    },
-  },
 };
 
 /** Rotas fora do mapa de idiomas: nunca indexadas. */

=== server/shared/kernel/localizedRoutes.test.ts — diff ===
@@ -13,8 +13,5 @@ describe('paridade frontend × backend', () => {
   it('mapa de rotas por idioma é igual', () => {
     expect(backendRoutes.LOCALIZED_ROUTES).toEqual(frontendRoutes.LOCALIZED_ROUTES);
     expect([...backendRoutes.ROUTE_KEYS]).toEqual([...frontendRoutes.ROUTE_KEYS]);
-    expect([...backendRoutes.INDEXABLE_ROUTE_KEYS]).toEqual([
-      ...frontendRoutes.INDEXABLE_ROUTE_KEYS,
-    ]);
   });
 });

=== server/shared/kernel/localizedRoutes.ts — diff ===
@@ -8,8 +8,6 @@ export const ROUTE_KEYS = [
   'restaurants',
   'attractions',
   'guide',
-  'favorites',
-  'bookings',
 ] as const;
 export type RouteKey = (typeof ROUTE_KEYS)[number];
 
@@ -25,17 +23,8 @@ export const LOCALIZED_ROUTES: Record<RouteKey, Record<Locale, string>> = {
   restaurants: { 'pt-BR': '/restaurantes', en: '/en/restaurants', fr: '/fr/restaurants' },
   attractions: { 'pt-BR': '/pontos', en: '/en/attractions', fr: '/fr/attractions' },
   guide: { 'pt-BR': '/info', en: '/en/travel-guide', fr: '/fr/guide-pratique' },
-  favorites: { 'pt-BR': '/favoritos', en: '/en/favorites', fr: '/fr/favoris' },
-  bookings: { 'pt-BR': '/reservas', en: '/en/bookings', fr: '/fr/reservations' },
 };
 
-/** Páginas pessoais (favoritos, reservas) ficam fora do sitemap e com noindex. */
-export const PRIVATE_ROUTE_KEYS: readonly RouteKey[] = ['favorites', 'bookings'];
-
-export const INDEXABLE_ROUTE_KEYS: readonly RouteKey[] = ROUTE_KEYS.filter(
-  (key) => !PRIVATE_ROUTE_KEYS.includes(key)
-);
-
 function normalizePathname(pathname: string): string {
   return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
 }

=== src/app/AppRouter.tsx — diff ===
@@ -19,19 +19,20 @@ import { useConnection } from '../shared/hooks/useConnection';
 import { useScrollLock } from '../shared/hooks/useScrollLock';
 import { useLocalizedRouting, useSyncLocaleWithUrl } from '../shared/hooks/useLocalizedRouting';
 import { useSEO } from '../shared/hooks/useSEO';
-import { useUI } from '../shared/stores/useUIStore';
+import { useUI, useUIStore } from '../shared/stores/useUIStore';
 import { cn } from '../shared/utils/cn';
 import { BackgroundBlobs } from '../ui/components/BackgroundBlobs';
 import { BottomNav } from '../ui/components/BottomNav';
 import { Header } from '../ui/layouts/Header';
-import { SideMenu } from '../ui/layouts/SideMenu';
 
 import { PartnerPortalComposition } from './compositions/PartnerPortalComposition';
 import { ItemBookingComposition } from './compositions/ItemBookingComposition';
+import { SideMenu } from './menu/SideMenu';
+import { useSideMenu } from './menu/useSideMenu';
 import { AppRoutes } from './routes/AppRoutes';
 
 export function AppRouter() {
-  const { user } = useAuthContext();
+  const { user, refreshProfile } = useAuthContext();
   const isPartner = user?.role === UserRole.PARTNER;
   const isAdmin = user?.role === UserRole.ADMIN;
 
@@ -42,6 +43,7 @@ export function AppRouter() {
   const connection = useConnection();
   const [searchParams, setSearchParams] = useSearchParams();
   const { isLoginModalOpen, isLoginClosingBySwipe, closeLoginModal, openLoginModal } = useUI();
+  const loginModalTab = useUIStore((state) => state.loginModalTab);
 
   useEffect(() => {
     if (searchParams.get('login') === '1') {
@@ -89,10 +91,25 @@ export function AppRouter() {
     }, 850);
   };
 
+  // O papel de parceiro vem do perfil no Firestore: recarrega antes de abrir o portal recém-liberado.
+  const openPartnerPortalAfterSignup = async () => {
+    await refreshProfile();
+    setSearchParams(
+      (prev) => {
+        const next = new URLSearchParams(prev);
+        next.delete('partners');
+        next.delete('menu');
+        next.set('partner', '1');
+        return next;
+      },
+      { replace: true }
+    );
+  };
+
   const { items, events } = useGuideCatalog();
 
   const isSearchOpen = searchParams.get('search') === '1';
-  const isMenuOpen = searchParams.get('menu') === '1';
+  const { isOpen: isMenuOpen, openMenu, closeMenu } = useSideMenu();
   const isPartnersOpen = searchParams.get('partners') === '1';
 
   const itemIdParam = searchParams.get('item');
@@ -165,20 +182,6 @@ export function AppRouter() {
     });
   };
 
-  const setIsMenuOpen = (open: boolean | ((prev: boolean) => boolean)) => {
-    setSearchParams((prev) => {
-      const nextParams = new URLSearchParams(prev);
-      const currentMenuOpen = prev.get('menu') === '1';
-      const resolvedOpen = typeof open === 'function' ? open(currentMenuOpen) : open;
-      if (resolvedOpen) {
-        nextParams.set('menu', '1');
-      } else {
-        nextParams.delete('menu');
-      }
-      return nextParams;
-    });
-  };
-
   const setIsPartnersOpen = (open: boolean) => {
     setSearchParams((prev) => {
       const nextParams = new URLSearchParams(prev);
@@ -306,7 +309,7 @@ export function AppRouter() {
           <Header
             onSearchClick={() => setIsSearchOpen(true)}
             isMenuOpen={isMenuOpen}
-            onMenuToggle={() => setIsMenuOpen((prev) => !prev)}
+            onMenuToggle={() => (isMenuOpen ? closeMenu() : openMenu())}
             isScrolled={isScrolled}
             isSearchSticky={isExplorePage ? isSearchSticky : false}
             onAdminOpen={handleAdminOpen}
@@ -341,8 +344,6 @@ export function AppRouter() {
         {!isHideGlobalUI && <BottomNav />}
 
         <SideMenu
-          isOpen={isMenuOpen}
-          onClose={() => setIsMenuOpen(false)}
           onPartnersOpen={() => {
             setSearchParams(
               (prev) => {
@@ -368,7 +369,11 @@ export function AppRouter() {
           onAdminOpen={handleAdminOpen}
         />
 
-        <PartnersModal isOpen={isPartnersOpen} onClose={() => setIsPartnersOpen(false)} />
+        <PartnersModal
+          isOpen={isPartnersOpen}
+          onClose={() => setIsPartnersOpen(false)}
+          onOpenPartnerPanel={() => void openPartnerPortalAfterSignup()}
+        />
 
         <AnimatePresence>
           {isSearchOpen && (
@@ -411,7 +416,11 @@ export function AppRouter() {
             selectedItem.category
           ) && <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
 
-        <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
+        <LoginModal
+          isOpen={isLoginModalOpen}
+          onClose={closeLoginModal}
+          initialTab={loginModalTab}
+        />
       </motion.div>
     </div>
   );

=== src/app/compositions/CheckoutResultComposition.tsx — diff ===
@@ -1,15 +1,15 @@
 import { Clock, SearchX } from 'lucide-react';
 import { useTranslation } from 'react-i18next';
-import { useNavigate, useSearchParams } from 'react-router-dom';
+import { useSearchParams } from 'react-router-dom';
 import { BookingResultView } from '../../domain/bookings';
 import { CheckoutResultView } from '../../domain/ticketing';
 import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
 import { MessagePage } from '../../ui/components/MessagePage';
+import { menuParamFor } from '../menu/menuViews';
 
 /** Retorno do Stripe (`return_url`) quando o método de pagamento exige redirecionamento. */
 export function CheckoutResultComposition() {
   const { t } = useTranslation();
-  const navigate = useNavigate();
   const { goTo } = useLocalizedRouting();
   const [searchParams] = useSearchParams();
   const kind = searchParams.get('kind');
@@ -25,13 +25,18 @@ export function CheckoutResultComposition() {
         title={t('pages.planPaymentTitle')}
         description={t('pages.planPaymentDescription')}
         actionLabel={t('pages.openPartnerArea')}
-        onAction={() => navigate('/?partner=1')}
+        onAction={() => goTo('explore', '?partner=1')}
       />
     );
   }
 
   if (bookingId) {
-    return <BookingResultView bookingId={bookingId} onViewMyBookings={() => goTo('bookings')} />;
+    return (
+      <BookingResultView
+        bookingId={bookingId}
+        onViewMyBookings={() => goTo('explore', `?menu=${menuParamFor('bookings')}`)}
+      />
+    );
   }
 
   if (!orderId) {
@@ -52,6 +57,7 @@ export function CheckoutResultComposition() {
         orderId={orderId}
         paymentIntentId={paymentIntentId}
         onBackHome={() => goTo('explore')}
+        onNavigateToWallet={() => goTo('explore', `?menu=${menuParamFor('tickets')}`)}
       />
     </div>
   );

=== src/app/compositions/FavoritesPageComposition.tsx — APAGUE este arquivo ===

=== src/app/compositions/ItemBookingComposition.tsx — diff ===
@@ -1,21 +1,21 @@
 import { BookingOfferPanel } from '../../domain/bookings';
 import { useAuthContext } from '../../domain/auth/context/AuthContext';
 import { StripePaymentElement } from '../../domain/payment';
-import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
 import { useUI } from '../../shared/stores/useUIStore';
+import { useSideMenu } from '../menu/useSideMenu';
 
 /** Liga o painel de reserva (bookings) ao login (auth) e ao Payment Element (payment). */
 export function ItemBookingComposition({ guideItemId }: { guideItemId: string }) {
   const { user } = useAuthContext();
   const { openLoginModal } = useUI();
-  const { goTo } = useLocalizedRouting();
+  const { openMenu } = useSideMenu();
 
   return (
     <BookingOfferPanel
       guideItemId={guideItemId}
       isAuthenticated={Boolean(user)}
       onRequireLogin={openLoginModal}
-      onViewMyBookings={() => goTo('bookings')}
+      onViewMyBookings={() => openMenu('bookings', { closeItem: true })}
       renderPaymentElement={({ clientSecret, bookingId, submitLabel, onSucceeded, onFailed }) => (
         <StripePaymentElement
           clientSecret={clientSecret}

=== src/app/compositions/MyBookingsPageComposition.tsx — APAGUE este arquivo ===

=== src/app/compositions/PartnerPortalComposition.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../domain/auth/types/auth';
import { i18n } from '../../shared/i18n';
import { useUIStore } from '../../shared/stores/useUIStore';
import { PartnerPortalComposition } from './PartnerPortalComposition';

const authState = vi.hoisted(() => ({
  value: { user: null as null | { uid: string; role: string }, loading: false },
}));

vi.mock('../../domain/auth/context/AuthContext', () => ({
  useAuthContext: () => authState.value,
}));
vi.mock('../../domain/partners', () => ({
  PartnerPanel: () => <div>partner-panel</div>,
  getPartnerProfileUseCase: vi.fn(),
}));
vi.mock('../../domain/admin', () => ({
  getActiveSubscriptionPlansUseCase: vi.fn().mockResolvedValue([]),
}));
vi.mock('../../domain/insights', () => ({ ReportsView: () => null }));
vi.mock('../../domain/payment', () => ({
  CheckoutModal: () => null,
  isPaidPlanId: () => false,
  PlanSubscriptionCard: () => null,
}));
vi.mock('../../domain/notifications', () => ({ NotificationBell: () => null }));
vi.mock('../../domain/ticketing', () => ({ PartnerEventTicketingManager: () => null }));
vi.mock('./PartnerBookingsComposition', () => ({ PartnerBookingsComposition: () => null }));

function renderPortal() {
  return render(
    <MemoryRouter initialEntries={['/?partner=1']}>
      <PartnerPortalComposition />
    </MemoryRouter>
  );
}

describe('PartnerPortalComposition', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    useUIStore.getState().closeLoginModal();
  });

  it('sem login: pede para entrar em vez de carregar para sempre', () => {
    authState.value = { user: null, loading: false };
    renderPortal();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(useUIStore.getState().isLoginModalOpen).toBe(true);
  });

  it('quem não é parceiro vê o aviso com caminho de volta ao guia', () => {
    authState.value = { user: { uid: 'u1', role: UserRole.USER }, loading: false };
    renderPortal();
    expect(screen.getByText('Este painel é exclusivo para parceiros cadastrados.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Voltar ao início' })).toBeTruthy();
  });
});

=== src/app/compositions/PartnerPortalComposition.tsx — diff ===
@@ -1,5 +1,6 @@
 import React, { useEffect, useState } from 'react';
-import { RefreshCw } from 'lucide-react';
+import { LogIn, RefreshCw, ShieldAlert } from 'lucide-react';
+import { useTranslation } from 'react-i18next';
 import { PartnerPanel, getPartnerProfileUseCase } from '../../domain/partners';
 import type { PartnerProfile, SubscriptionPlan } from '../../domain/partners';
 import { getActiveSubscriptionPlansUseCase } from '../../domain/admin';
@@ -10,10 +11,15 @@ import { CheckoutModal, isPaidPlanId, PlanSubscriptionCard } from '../../domain/
 import { PartnerBookingsComposition } from './PartnerBookingsComposition';
 import { NotificationBell } from '../../domain/notifications';
 import { PartnerEventTicketingManager } from '../../domain/ticketing';
-import { ErrorState } from '../../ui/components/ErrorState';
+import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
+import { useUI } from '../../shared/stores/useUIStore';
+import { MessagePage } from '../../ui/components/MessagePage';
 
 export function PartnerPortalComposition() {
+  const { t } = useTranslation();
   const { user, loading } = useAuthContext();
+  const { openLoginModal } = useUI();
+  const { goTo } = useLocalizedRouting();
 
   const [profile, setProfile] = useState<PartnerProfile | null>(null);
   const [profileLoading, setProfileLoading] = useState(true);
@@ -37,12 +43,16 @@ export function PartnerPortalComposition() {
   }, []);
 
   useEffect(() => {
-    if (loading || !user) {
+    if (loading) {
+      return;
+    }
+    if (!user) {
+      setProfileLoading(false);
       return;
     }
 
     if (user.role !== UserRole.PARTNER) {
-      setProfileError('Acesso permitido somente para parceiros.');
+      setProfileError('pages.partnerOnly');
       setProfileLoading(false);
       return;
     }
@@ -57,7 +67,7 @@ export function PartnerPortalComposition() {
           return;
         }
         if (!result) {
-          setProfileError('Perfil de parceiro não encontrado.');
+          setProfileError('pages.partnerProfileNotFound');
           setProfile(null);
           return;
         }
@@ -68,7 +78,7 @@ export function PartnerPortalComposition() {
           return;
         }
         console.error('[PartnerPortalComposition]', error);
-        setProfileError('Não foi possível carregar o perfil do parceiro.');
+        setProfileError('pages.partnerProfileLoadError');
         setProfile(null);
       })
       .finally(() => {
@@ -90,16 +100,29 @@ export function PartnerPortalComposition() {
     );
   }
 
-  if (profileError) {
+  if (!user) {
     return (
-      <div className="min-h-screen flex items-center justify-center bg-[#020508] p-6">
-        <ErrorState message={profileError} onRetry={() => window.location.reload()} />
-      </div>
+      <MessagePage
+        icon={LogIn}
+        title={t('pages.partnerAreaTitle')}
+        description={t('pages.partnerLoginRequired')}
+        actionLabel={t('pages.signIn')}
+        onAction={openLoginModal}
+      />
     );
   }
 
-  if (!user || !profile) {
-    return null;
+  // O portal esconde o cabeçalho e a navegação; a ação leva de volta ao guia.
+  if (profileError || !profile) {
+    return (
+      <MessagePage
+        icon={ShieldAlert}
+        title={t('pages.partnerAreaTitle')}
+        description={t(profileError ?? 'pages.partnerProfileNotFound')}
+        actionLabel={t('pages.backHome')}
+        onAction={() => goTo('explore')}
+      />
+    );
   }
 
   return (

=== src/app/menu/SideMenu.tsx — ARQUIVO NOVO, conteúdo completo ===
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { hasPasswordSignInUseCase, logoutUseCase } from '../../domain/auth';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import { UserRole } from '../../domain/auth/types/auth';
import { MyBookingsView } from '../../domain/bookings';
import { AboutView, SupportView } from '../../domain/content';
import { FavoritesList } from '../../domain/favorites';
import { UserTicketsHistoryView } from '../../domain/ticketing';
import {
  useUserProfile,
  useUserPhoto,
  ChangePasswordView,
  ImageCropperView,
  MainMenuView,
  AccountView,
  SettingsView,
  LanguageSettingsView,
  AppearanceSettingsView,
} from '../../domain/user';
import { Z_INDEX } from '../../shared/constants/zIndex';
import { cn } from '../../shared/utils/cn';
import { SidebarLayout } from '../../ui/layouts/SidebarLayout';
import { type MenuView, parentMenuView, visibleMenuView } from './menuViews';
import { useSideMenu } from './useSideMenu';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';

interface SideMenuProps {
  onPartnersOpen: () => void;
  onAdminOpen: () => void;
}

/** Telas que ocupam a altura toda do menu e rolam por dentro. */
const FULL_HEIGHT_VIEWS: readonly MenuView[] = [
  'settings',
  'language',
  'appearance',
  'support',
  'about',
];

const SETTINGS_VIEWS: readonly MenuView[] = ['settings', 'language', 'appearance'];

/** Compõe as telas de vários domínios (usuário, ingressos, reservas, favoritos, conteúdo) no menu. */
export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
  const { user } = useAuthContext();
  const { goTo } = useLocalizedRouting();
  const {
    view: requestedView,
    isOpen,
    openMenu,
    backTo,
    closeMenu,
    closeMenuAndOpenItem,
  } = useSideMenu();
  // Papel vem da sessão (claims + perfil), a mesma fonte que o AppRouter usa para abrir os painéis.
  const isPartner = user?.role === UserRole.PARTNER;
  const isAdmin = user?.role === UserRole.ADMIN;
  const view = visibleMenuView(requestedView ?? 'main', Boolean(user));
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const showView = (target: MenuView) => openMenu(target);
  const goBack = () => backTo(parentMenuView(view));

  React.useEffect(() => {
    if (view !== 'account') {
      setShowDeleteConfirm(false);
    }
  }, [view]);

  const {
    userData,
    setUserData,
    passwordData,
    setPasswordData,
    showPasswords,
    setShowPasswords,
    isLoading,
    message,
    setMessage,
    updateProfile,
    updatePassword,
    deleteAccount,
  } = useUserProfile(() => {
    goTo('explore');
  });

  const {
    photoURL,
    isUploading,
    imageToCrop,
    isCropping,
    crop,
    zoom,
    setZoom,
    fileInputRef,
    onCropChange,
    onZoomChange,
    onCropComplete,
    handlePhotoSelect,
    handleConfirmCrop,
    cancelCropping,
  } = useUserPhoto((msg) => setMessage(msg));

  const menuUser = user
    ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        role: user.role,
        isAnonymous: user.isAnonymous,
      }
    : null;

  const handleUpdatePassword = async () => {
    const success = await updatePassword();
    if (success) {
      setTimeout(goBack, 2000);
    }
  };

  const handleLogout = async () => {
    await logoutUseCase();
    closeMenu();
  };

  const renderView = (): React.ReactNode => {
    switch (view) {
      case 'appearance':
        return <AppearanceSettingsView onBack={goBack} />;
      case 'language':
        return <LanguageSettingsView onBack={goBack} />;
      case 'settings':
        return (
          <SettingsView
            onBack={goBack}
            onOpenLanguage={() => showView('language')}
            onOpenAppearance={() => showView('appearance')}
          />
        );
      case 'password':
        return (
          <ChangePasswordView
            passwordData={passwordData}
            setPasswordData={setPasswordData}
            showPasswords={showPasswords}
            setShowPasswords={setShowPasswords}
            isLoading={isLoading}
            message={message}
            onUpdatePassword={handleUpdatePassword}
            onBack={goBack}
          />
        );
      case 'about':
        return <AboutView onBack={goBack} />;
      case 'support':
        return <SupportView onBack={goBack} userEmail={user?.email} />;
      case 'tickets':
        return <UserTicketsHistoryView onBack={goBack} />;
      case 'bookings':
        return <MyBookingsView onBack={goBack} />;
      case 'favorites':
        return <FavoritesList onBack={goBack} onSelectItem={closeMenuAndOpenItem} />;
      case 'account':
        return (
          <AccountView
            user={menuUser}
            userData={{
              firstName: userData.firstName,
              lastName: userData.lastName,
              phone: userData.phone || '',
            }}
            setUserData={setUserData}
            isLoading={isLoading}
            isPartner={isPartner}
            message={message}
            showDeleteConfirm={showDeleteConfirm}
            setShowDeleteConfirm={setShowDeleteConfirm}
            onUpdateProfile={updateProfile}
            onChangePassword={() => {
              setMessage(null);
              setPasswordData({ current: '', new: '', confirm: '' });
              showView('password');
            }}
            onDeleteAccount={deleteAccount}
            hasPassword={hasPasswordSignInUseCase()}
            onBack={goBack}
          />
        );
      case 'main':
        return (
          <>
            <MainMenuView
              user={menuUser}
              userData={userData}
              isAdmin={isAdmin}
              isPartner={isPartner}
              isUploading={isUploading}
              onClose={closeMenu}
              onAccountOpen={() => showView('account')}
              onFavoritesOpen={() => showView('favorites')}
              onTicketsOpen={() => showView('tickets')}
              onBookingsOpen={() => showView('bookings')}
              onPartnersOpen={onPartnersOpen}
              onAboutOpen={() => showView('about')}
              onSupportOpen={() => showView('support')}
              onAdminOpen={onAdminOpen}
              onLogout={handleLogout}
              onPhotoClick={() => fileInputRef.current?.click()}
              photoURL={photoURL}
            />
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoSelect}
            />
          </>
        );
    }
  };

  return (
    <SidebarLayout
      isOpen={isOpen}
      onClose={closeMenu}
      isCropping={isCropping}
      onSettingsClick={
        isCropping || SETTINGS_VIEWS.includes(view) ? undefined : () => showView('settings')
      }
    >
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{ zIndex: Z_INDEX.toast }}
            className={cn(
              'absolute top-4 left-4 right-4 p-4 rounded-3xl border text-[10px] font-black uppercase tracking-widest text-center shadow-2xl cursor-pointer text-white',
              message.type === 'success'
                ? 'bg-teal-500/80 border-teal-500/40 shadow-teal-500/20 backdrop-blur-md'
                : 'bg-rose-500/80 border-rose-500/40 shadow-rose-500/20 backdrop-blur-md'
            )}
            onClick={() => setMessage(null)}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {isCropping ? (
          <motion.div
            key="crop-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex flex-col"
          >
            <ImageCropperView
              imageToCrop={imageToCrop}
              crop={crop}
              zoom={zoom}
              onCropChange={onCropChange}
              onCropComplete={onCropComplete}
              onZoomChange={onZoomChange}
              setZoom={setZoom}
              onCancel={cancelCropping}
              onConfirm={handleConfirmCrop}
            />
          </motion.div>
        ) : (
          <motion.div
            key={`menu-${view}`}
            initial={{ opacity: 0, x: view === 'main' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: view === 'main' ? 10 : -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'w-full',
              FULL_HEIGHT_VIEWS.includes(view) && 'h-full flex flex-col overflow-hidden'
            )}
          >
            {renderView()}
          </motion.div>
        )}
      </AnimatePresence>
    </SidebarLayout>
  );
}

=== src/app/menu/menuViews.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import {
  MENU_VIEWS,
  menuParamFor,
  parentMenuView,
  parseMenuParam,
  visibleMenuView,
} from './menuViews';

describe('sub-telas do menu', () => {
  it('lê o parâmetro da URL: ausente fecha, "1" e desconhecido abrem a tela principal', () => {
    expect(parseMenuParam(null)).toBeNull();
    expect(parseMenuParam('1')).toBe('main');
    expect(parseMenuParam('favorites')).toBe('favorites');
    expect(parseMenuParam('qualquer-coisa')).toBe('main');
  });

  it('ida e volta do parâmetro preserva a sub-tela', () => {
    for (const view of MENU_VIEWS) {
      expect(parseMenuParam(menuParamFor(view))).toBe(view);
    }
  });

  it('voltar leva à tela-mãe: idioma e aparência voltam para configurações, senha para a conta', () => {
    expect(parentMenuView('language')).toBe('settings');
    expect(parentMenuView('appearance')).toBe('settings');
    expect(parentMenuView('password')).toBe('account');
    expect(parentMenuView('favorites')).toBe('main');
    expect(parentMenuView('bookings')).toBe('main');
    expect(parentMenuView('main')).toBe('main');
  });

  it('sem login, telas com dados do usuário mostram a tela principal (com o login)', () => {
    for (const view of ['account', 'password', 'tickets', 'bookings', 'favorites'] as const) {
      expect(visibleMenuView(view, false)).toBe('main');
      expect(visibleMenuView(view, true)).toBe(view);
    }
    expect(visibleMenuView('settings', false)).toBe('settings');
    expect(visibleMenuView('support', false)).toBe('support');
  });
});

=== src/app/menu/menuViews.ts — ARQUIVO NOVO, conteúdo completo ===
/**
 * Sub-telas do menu lateral. A tela aberta fica na URL (`?menu=<view>`), então o menu pode ser
 * aberto direto numa sub-tela (ex: "Ver minhas reservas" depois do pagamento) e sobrevive ao recarregar.
 */
export const MENU_VIEWS = [
  'main',
  'account',
  'password',
  'tickets',
  'bookings',
  'favorites',
  'settings',
  'language',
  'appearance',
  'support',
  'about',
] as const;
export type MenuView = (typeof MENU_VIEWS)[number];

const MAIN_MENU_PARAM = '1';

/** Para onde o botão "voltar" de cada sub-tela leva. */
const PARENT_VIEW: Record<Exclude<MenuView, 'main'>, MenuView> = {
  account: 'main',
  password: 'account',
  tickets: 'main',
  bookings: 'main',
  favorites: 'main',
  settings: 'main',
  language: 'settings',
  appearance: 'settings',
  support: 'main',
  about: 'main',
};

/** Sub-telas com dados do próprio usuário: sem login, o menu mostra a tela principal (com o login). */
const PRIVATE_VIEWS: readonly MenuView[] = [
  'account',
  'password',
  'tickets',
  'bookings',
  'favorites',
];

function isMenuView(value: string): value is MenuView {
  return (MENU_VIEWS as readonly string[]).includes(value);
}

/** `null` = menu fechado. Valor desconhecido abre a tela principal. */
export function parseMenuParam(value: string | null): MenuView | null {
  if (value === null) return null;
  return isMenuView(value) ? value : 'main';
}

export function menuParamFor(view: MenuView): string {
  return view === 'main' ? MAIN_MENU_PARAM : view;
}

export function parentMenuView(view: MenuView): MenuView {
  return view === 'main' ? 'main' : PARENT_VIEW[view];
}

export function visibleMenuView(view: MenuView, isAuthenticated: boolean): MenuView {
  return !isAuthenticated && PRIVATE_VIEWS.includes(view) ? 'main' : view;
}

=== src/app/menu/useSideMenu.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useSideMenu } from './useSideMenu';

function setup(initialEntry = '/') {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  );
  return renderHook(
    () => {
      const menu = useSideMenu();
      const location = useLocation();
      return { menu, search: location.search };
    },
    { wrapper }
  );
}

describe('useSideMenu', () => {
  it('abre na tela principal e avança para favoritos dentro do menu', () => {
    const { result } = setup();
    act(() => result.current.menu.openMenu());
    expect(result.current.search).toBe('?menu=1');
    act(() => result.current.menu.openMenu('favorites'));
    expect(result.current.menu.view).toBe('favorites');
    expect(result.current.search).toBe('?menu=favorites');
  });

  it('voltar depois de avançar desempilha o histórico até a tela anterior', () => {
    const { result } = setup();
    act(() => result.current.menu.openMenu());
    act(() => result.current.menu.openMenu('settings'));
    act(() => result.current.menu.openMenu('language'));
    act(() => result.current.menu.backTo('settings'));
    expect(result.current.menu.view).toBe('settings');
    act(() => result.current.menu.backTo('main'));
    expect(result.current.menu.view).toBe('main');
    expect(result.current.menu.isOpen).toBe(true);
  });

  it('link direto para uma sub-tela: voltar troca para a tela-mãe sem sair do menu', () => {
    const { result } = setup('/?menu=bookings');
    expect(result.current.menu.view).toBe('bookings');
    act(() => result.current.menu.backTo('main'));
    expect(result.current.menu.view).toBe('main');
  });

  it('abrir reservas a partir do detalhe do item fecha o item na mesma navegação', () => {
    const { result } = setup('/passeios?item=i1&type=item');
    act(() => result.current.menu.openMenu('bookings', { closeItem: true }));
    expect(result.current.search).toBe('?menu=bookings');
  });

  it('escolher um favorito fecha o menu e abre o item numa única troca de URL', () => {
    const { result } = setup('/?menu=favorites');
    act(() => result.current.menu.closeMenuAndOpenItem({ id: 'ev1', category: 'event' }));
    expect(result.current.menu.isOpen).toBe(false);
    expect(result.current.search).toBe('?item=ev1&type=event');
  });
});

=== src/app/menu/useSideMenu.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { type MenuView, menuParamFor, parseMenuParam } from './menuViews';

type ParamsUpdate = (params: URLSearchParams) => void;

/** Marca as entradas do histórico criadas ao avançar dentro do menu, para o "voltar" desempilhar. */
interface MenuHistoryState {
  menuStep?: boolean;
}

/**
 * Estado do menu lateral na URL. Cada ação faz uma única troca de parâmetros: o `setSearchParams`
 * do React Router parte da URL do último render, então duas chamadas seguidas perdem a primeira.
 */
export function useSideMenu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const view = parseMenuParam(searchParams.get('menu'));
  const isMenuStep = (location.state as MenuHistoryState | null)?.menuStep === true;

  const update = useCallback(
    (change: ParamsUpdate, options: { replace: boolean; state?: MenuHistoryState }) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        change(next);
        return next;
      }, options);
    },
    [setSearchParams]
  );

  /** Abre o menu (ou avança para uma sub-tela) e, opcionalmente, fecha o detalhe de item aberto. */
  const openMenu = useCallback(
    (target: MenuView = 'main', options: { closeItem?: boolean } = {}) => {
      update(
        (params) => {
          params.set('menu', menuParamFor(target));
          if (options.closeItem) {
            params.delete('item');
            params.delete('type');
          }
        },
        { replace: false, state: view !== null ? { menuStep: true } : undefined }
      );
    },
    [update, view]
  );

  /**
   * Volta para a tela-mãe. Se chegamos aqui avançando no menu, desempilha o histórico (o botão
   * voltar do navegador e o do menu fazem a mesma coisa); se veio de um link direto, troca no lugar.
   */
  const backTo = useCallback(
    (parent: MenuView) => {
      if (isMenuStep) {
        navigate(-1);
        return;
      }
      update((params) => params.set('menu', menuParamFor(parent)), { replace: true });
    },
    [isMenuStep, navigate, update]
  );

  const closeMenu = useCallback(() => {
    update((params) => params.delete('menu'), { replace: false });
  }, [update]);

  /** Fecha o menu e abre o detalhe do item na mesma navegação. */
  const closeMenuAndOpenItem = useCallback(
    (item: { id: string; category: string }) => {
      update(
        (params) => {
          params.delete('menu');
          params.set('item', item.id);
          params.set('type', item.category === 'event' ? 'event' : 'item');
        },
        { replace: false }
      );
    },
    [update]
  );

  return { view, isOpen: view !== null, openMenu, backTo, closeMenu, closeMenuAndOpenItem };
}

=== src/app/routes/AppRoutes.test.tsx — diff ===
@@ -11,9 +11,6 @@ vi.mock('../../domain/guide/components/ExploreView', () => ({
 vi.mock('../../domain/guide/components/GridView', () => ({
   GridView: ({ category }: { category: string }) => <div>grid-{category}</div>,
 }));
-vi.mock('../../domain/favorites', () => ({
-  FavoritesList: () => <div>favorites-list</div>,
-}));
 vi.mock('../../domain/ticketing', () => ({
   CheckoutResultView: ({ orderId }: { orderId: string }) => <div>checkout-{orderId}</div>,
 }));
@@ -54,9 +51,10 @@ describe('AppRoutes', () => {
     expect(screen.getByText('grid-hotel')).toBeTruthy();
   });
 
-  it('/favoritos renderiza a lista de favoritos', () => {
+  it('/favoritos não é página: favoritos ficam no menu lateral', () => {
     renderAt('/favoritos');
-    expect(screen.getByText('favorites-list')).toBeTruthy();
+    expect(screen.queryByText(/grid-|explore-view/)).toBeNull();
+    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
   });
 
   it('/checkout/result com orderId mostra o resultado do pedido', () => {

=== src/app/routes/AppRoutes.tsx — diff ===
@@ -9,15 +9,10 @@ import { LOCALIZED_ROUTES, type RouteKey, SUPPORTED_LOCALES } from '../../shared
 import { NotFoundView } from '../../ui/components/NotFoundView';
 import { PageLayout } from '../../ui/layouts/PageLayout';
 import { CheckoutResultComposition } from '../compositions/CheckoutResultComposition';
-import { FavoritesPageComposition } from '../compositions/FavoritesPageComposition';
-import { MyBookingsPageComposition } from '../compositions/MyBookingsPageComposition';
 
 type GridCategory = 'event' | 'tour' | 'hotel' | 'restaurant' | 'sight' | 'tips';
 
-const GRID_CATEGORY: Record<
-  Exclude<RouteKey, 'explore' | 'favorites' | 'bookings'>,
-  GridCategory
-> = {
+const GRID_CATEGORY: Record<Exclude<RouteKey, 'explore'>, GridCategory> = {
   events: 'event',
   tours: 'tour',
   stays: 'hotel',
@@ -42,12 +37,6 @@ export function AppRoutes({ location, onSelectItem, onStickyChange }: AppRoutesP
         </PageLayout>
       );
     }
-    if (routeKey === 'bookings') {
-      return <MyBookingsPageComposition />;
-    }
-    if (routeKey === 'favorites') {
-      return <FavoritesPageComposition onSelectItem={onSelectItem} />;
-    }
     return (
       <PageLayout>
         <GridView category={GRID_CATEGORY[routeKey]} onSelectItem={onSelectItem} />

=== src/domain/admin/components/AdminDispatcher.tsx — diff ===
@@ -1,12 +1,12 @@
 import { ChevronLeft, RefreshCw, ShieldAlert } from 'lucide-react';
 import { useEffect } from 'react';
-import { useNavigate } from 'react-router-dom';
 import { useAuthContext } from '../../auth/context/AuthContext';
 import { UserRole } from '../../auth/types/auth';
 import { AdminPanel } from './AdminPanel';
+import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
 
 function RestrictedAdminAccess() {
-  const navigate = useNavigate();
+  const { goTo } = useLocalizedRouting();
   return (
     <div className="min-h-screen flex flex-col items-center justify-center bg-[#020508] p-6 text-center">
       <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
@@ -20,7 +20,7 @@ function RestrictedAdminAccess() {
       </p>
       <button
         type="button"
-        onClick={() => navigate('/')}
+        onClick={() => goTo('explore')}
         className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all cursor-pointer"
       >
         <div className="flex items-center gap-2">
@@ -33,14 +33,14 @@ function RestrictedAdminAccess() {
 }
 
 export function AdminDispatcher() {
-  const navigate = useNavigate();
+  const { goTo } = useLocalizedRouting();
   const { user, loading } = useAuthContext();
 
   useEffect(() => {
     if (!loading && !user) {
-      navigate('/');
+      goTo('explore');
     }
-  }, [user, loading, navigate]);
+  }, [user, loading, goTo]);
 
   if (loading) {
     return (

=== src/domain/admin/components/AdminPanel.tsx — diff ===
@@ -1,5 +1,4 @@
 import { useMemo, useState } from 'react';
-import { useNavigate } from 'react-router-dom';
 import { UserRole } from '../../auth/types/auth';
 import { motion, AnimatePresence } from 'motion/react';
 import { useAuthContext } from '../../auth/context/AuthContext';
@@ -48,11 +47,12 @@ import {
 } from './subcomponents/AdminEditorModal';
 import { AdminPlansView } from './subcomponents/AdminPlansView';
 import { AdminNotificationsView } from './subcomponents/AdminNotificationsView';
+import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
 
 export { ADMIN_CREATABLE_ITEM_CATEGORIES };
 
 export function AdminPanel() {
-  const navigate = useNavigate();
+  const { goTo } = useLocalizedRouting();
   const { user, loading: userLoading } = useAuthContext();
   const { showToast, confirmAction } = useUI();
   const [activeTab, setActiveTab] = useState<AdminTabId>('reports');
@@ -244,7 +244,7 @@ export function AdminPanel() {
         </p>
         <button
           type="button"
-          onClick={() => navigate('/')}
+          onClick={() => goTo('explore')}
           className="min-h-[44px] px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
         >
           Voltar para o Início
@@ -269,7 +269,7 @@ export function AdminPanel() {
           <button
             type="button"
             aria-label="Voltar para Home"
-            onClick={() => navigate('/')}
+            onClick={() => goTo('explore')}
             className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-teal-400/50"
           >
             <ChevronLeft size={22} />

=== src/domain/auth/adapters/firebaseAuthAdapter.ts — diff ===
@@ -8,6 +8,7 @@ import {
   confirmPasswordReset,
   onAuthStateChanged,
   reauthenticateWithCredential,
+  reauthenticateWithPopup,
   EmailAuthProvider,
   updatePassword,
 } from 'firebase/auth';
@@ -191,6 +192,19 @@ export class FirebaseAuthAdapter implements AuthPort {
     await reauthenticateWithCredential(auth.currentUser, credential);
   }
 
+  async reauthenticateWithGoogle(): Promise<void> {
+    if (!auth.currentUser) throw new Error('Nenhum usuário autenticado.');
+    await reauthenticateWithPopup(auth.currentUser, googleProvider);
+  }
+
+  hasPasswordSignIn(): boolean {
+    return (
+      auth.currentUser?.providerData.some(
+        (provider) => provider.providerId === EmailAuthProvider.PROVIDER_ID
+      ) ?? false
+    );
+  }
+
   async changePassword(newPassword: string): Promise<void> {
     if (!auth.currentUser) throw new Error('Nenhum usuário autenticado.');
     await updatePassword(auth.currentUser, newPassword);

=== src/domain/auth/application/usecases/authUseCases.test.ts — diff ===
@@ -31,6 +31,8 @@ describe('Auth Use Cases (DIP & Injected AuthPort)', () => {
       verifyResetCode: vi.fn(),
       confirmReset: vi.fn(),
       reauthenticate: vi.fn(),
+      reauthenticateWithGoogle: vi.fn(),
+      hasPasswordSignIn: vi.fn(),
       changePassword: vi.fn(),
     };
   });

=== src/domain/auth/application/usecases/hasPasswordSignInUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import type { AuthPort } from '../../types/authPort';

export function createHasPasswordSignInUseCase(authPort: AuthPort) {
  return (): boolean => authPort.hasPasswordSignIn();
}

=== src/domain/auth/application/usecases/index.ts — diff ===
@@ -9,4 +9,6 @@ export * from './resetPasswordUseCase';
 export * from './verifyPasswordResetCodeUseCase';
 export * from './confirmPasswordResetUseCase';
 export * from './reauthenticateUseCase';
+export * from './reauthenticateWithGoogleUseCase';
+export * from './hasPasswordSignInUseCase';
 export * from './changePasswordUseCase';

=== src/domain/auth/application/usecases/reauthenticateWithGoogleUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import type { AuthPort } from '../../types/authPort';

export function createReauthenticateWithGoogleUseCase(authPort: AuthPort) {
  return async (): Promise<void> => {
    return authPort.reauthenticateWithGoogle();
  };
}

=== src/domain/auth/components/LoginModal.tsx — diff ===
@@ -11,9 +11,10 @@ import { cn } from '../../../shared/utils/cn';
 interface LoginModalProps {
   isOpen: boolean;
   onClose: () => void;
+  initialTab?: 'login' | 'forgot';
 }
 
-export function LoginModal({ isOpen, onClose }: LoginModalProps) {
+export function LoginModal({ isOpen, onClose, initialTab = 'login' }: LoginModalProps) {
   const { login, signUp, loginWithGoogle, forgotPassword } = useAuth();
   const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
   const [direction, setDirection] = useState<number>(0);
@@ -25,14 +26,16 @@ export function LoginModal({ isOpen, onClose }: LoginModalProps) {
   const touchStartY = useRef<number | null>(null);
 
   useEffect(() => {
-    if (!isOpen) {
+    if (isOpen) {
+      setActiveTab(initialTab);
+    } else {
       setActiveTab('login');
       setDirection(0);
       setPassedEmail('');
       setApiError(null);
       setIsLoading(false);
     }
-  }, [isOpen]);
+  }, [isOpen, initialTab]);
 
   const handleBack = () => {
     onClose();

=== src/domain/auth/components/ResetPassword.tsx — diff ===
@@ -1,5 +1,5 @@
 import React, { useState, useEffect } from 'react';
-import { useSearchParams, useNavigate } from 'react-router-dom';
+import { useSearchParams } from 'react-router-dom';
 import { motion } from 'motion/react';
 import {
   Lock,
@@ -17,10 +17,11 @@ import { resetPasswordSchema, ResetPasswordFormData } from '../schemas/authSchem
 import { checkPasswordRequirements } from '../utils/passwordRequirements';
 import { cn } from '../../../shared/utils/cn';
 import { useUIStore } from '../../../shared/stores/useUIStore';
+import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
 
 export function ResetPassword() {
   const [searchParams] = useSearchParams();
-  const navigate = useNavigate();
+  const { goTo } = useLocalizedRouting();
   const oobCode = searchParams.get('oobCode');
 
   const [email, setEmail] = useState<string | null>(null);
@@ -116,7 +117,7 @@ export function ResetPassword() {
 
   const handleGoToLogin = () => {
     useUIStore.getState().openLoginModal();
-    navigate('/', { replace: true });
+    goTo('explore', '', { replace: true });
   };
 
   if (isLoading) {
@@ -146,8 +147,8 @@ export function ResetPassword() {
             <button
               type="button"
               onClick={() => {
-                useUIStore.getState().openLoginModal();
-                navigate('/');
+                useUIStore.getState().openPasswordRecovery();
+                goTo('explore');
               }}
               className="w-full h-12 min-h-[44px] bg-teal-500 text-black font-black uppercase text-xs rounded-2xl shadow-lg shadow-teal-500/20 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50 flex items-center justify-center tracking-widest"
             >
@@ -155,7 +156,7 @@ export function ResetPassword() {
             </button>
             <button
               type="button"
-              onClick={() => navigate('/')}
+              onClick={() => goTo('explore')}
               className="w-full h-12 min-h-[44px] glassmorphism rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white/70 hover:text-white focus-visible:ring-2 focus-visible:ring-teal-400/50"
             >
               Voltar ao Início

=== src/domain/auth/factory.ts — diff ===
@@ -12,6 +12,8 @@ import {
   createVerifyPasswordResetCodeUseCase,
   createConfirmPasswordResetUseCase,
   createReauthenticateUseCase,
+  createReauthenticateWithGoogleUseCase,
+  createHasPasswordSignInUseCase,
   createChangePasswordUseCase,
 } from './application/usecases';
 
@@ -28,4 +30,6 @@ export const resetPasswordUseCase = createResetPasswordUseCase(authPort);
 export const verifyPasswordResetCodeUseCase = createVerifyPasswordResetCodeUseCase(authPort);
 export const confirmPasswordResetUseCase = createConfirmPasswordResetUseCase(authPort);
 export const reauthenticateUseCase = createReauthenticateUseCase(authPort);
+export const reauthenticateWithGoogleUseCase = createReauthenticateWithGoogleUseCase(authPort);
+export const hasPasswordSignInUseCase = createHasPasswordSignInUseCase(authPort);
 export const changePasswordUseCase = createChangePasswordUseCase(authPort);

=== src/domain/auth/types/authPort.ts — diff ===
@@ -19,6 +19,12 @@ export interface AuthPort {
 
   reauthenticate(email: string, currentPassword: string): Promise<void>;
 
+  /** Confirma a identidade de quem entrou com Google (não tem senha no Firebase Auth). */
+  reauthenticateWithGoogle(): Promise<void>;
+
+  /** Se a conta atual tem login por e-mail e senha. */
+  hasPasswordSignIn(): boolean;
+
   changePassword(newPassword: string): Promise<void>;
 
   getCurrentUser(): AuthIdentity | null;

=== src/domain/bookings/components/buyer/MyBookingsView.tsx — diff ===
@@ -1,3 +1,4 @@
+import { ArrowLeft } from 'lucide-react';
 import { useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
@@ -42,7 +43,8 @@ function BookingCard({ booking, onCancel }: { booking: BookingSummary; onCancel?
   );
 }
 
-export function MyBookingsView() {
+/** Lista de reservas do comprador, aberta como sub-tela do menu lateral. */
+export function MyBookingsView({ onBack }: { onBack: () => void }) {
   const { t, i18n } = useTranslation();
   const { data, loading, error, hasMore, reload, loadMore, cancel } = useMyBookings();
   const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
@@ -85,10 +87,20 @@ export function MyBookingsView() {
   };
 
   return (
-    <section className="max-w-2xl mx-auto px-4 pb-32 space-y-5">
-      <h1 className="text-2xl font-display font-black text-white">
-        {t('bookings.buyer.myBookingsTitle')}
-      </h1>
+    <section className="w-full space-y-5">
+      <div className="flex items-center gap-3">
+        <button
+          type="button"
+          onClick={onBack}
+          aria-label={t('bookings.buyer.back')}
+          className="w-11 h-11 shrink-0 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 focus-visible:ring-2 focus-visible:ring-teal-400/50"
+        >
+          <ArrowLeft size={16} aria-hidden="true" />
+        </button>
+        <h2 className="text-xl font-display font-black text-white">
+          {t('bookings.buyer.myBookingsTitle')}
+        </h2>
+      </div>
       {notice && (
         <p role="status" className="text-sm text-teal-200">
           {notice}

=== src/domain/content/index.ts — diff ===
@@ -1,2 +1,4 @@
 export { useAppVersion } from './hooks/useAppVersion';
 export * from './ports/contentPort';
+export { AboutView } from './components/AboutView';
+export { SupportView } from './components/SupportView';

=== src/domain/favorites/components/FavoritesList.tsx — diff ===
@@ -1,5 +1,6 @@
 import React from 'react';
 import { motion, AnimatePresence } from 'motion/react';
+import { useTranslation } from 'react-i18next';
 import { Heart, ChevronLeft, MapPin, Star, Trash2 } from 'lucide-react';
 import { useFavorites } from '../hooks/useFavorites';
 import { FavoriteItem } from '../types/favorite';
@@ -10,10 +11,10 @@ import { Skeleton } from '../../../ui/components/Skeleton';
 interface FavoritesListProps {
   onBack: () => void;
   onSelectItem?: ((item: GuideItem) => void) | undefined;
-  onCloseMenu?: (() => void) | undefined;
 }
 
-export function FavoritesList({ onBack, onSelectItem, onCloseMenu }: FavoritesListProps) {
+export function FavoritesList({ onBack, onSelectItem }: FavoritesListProps) {
+  const { t } = useTranslation();
   const { favorites, loading, removeFavoriteItem } = useFavorites();
   const [openingId, setOpeningId] = React.useState<string | null>(null);
 
@@ -25,7 +26,6 @@ export function FavoritesList({ onBack, onSelectItem, onCloseMenu }: FavoritesLi
       const doc = await databaseAdapter.getDocument<GuideItem>(colName, fav.itemId);
       if (doc) {
         onSelectItem(doc);
-        onCloseMenu?.();
       } else if (fav.itemDetails) {
         const fallbackItem: GuideItem = {
           id: fav.itemId,
@@ -39,7 +39,6 @@ export function FavoritesList({ onBack, onSelectItem, onCloseMenu }: FavoritesLi
           rating: fav.itemDetails.rating,
         };
         onSelectItem(fallbackItem);
-        onCloseMenu?.();
       }
     } catch (error) {
       console.error('[FavoritesList.handleCardClick Error]:', error);
@@ -53,20 +52,20 @@ export function FavoritesList({ onBack, onSelectItem, onCloseMenu }: FavoritesLi
       <div className="flex items-center justify-between relative mb-2 pt-2">
         <button
           onClick={onBack}
-          aria-label="Voltar para o menu principal"
-          className="p-2 text-white/70 hover:text-white active:scale-90 transition-all rounded-full bg-white/5 border border-white/10"
+          aria-label={t('favorites.back')}
+          className="w-11 h-11 shrink-0 flex items-center justify-center text-white/70 hover:text-white active:scale-90 transition-all rounded-full bg-white/5 border border-white/10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
         >
           <ChevronLeft size={22} />
         </button>
         <div className="text-center flex-1 mx-2">
           <h2 className="text-xl font-display font-black text-white leading-tight">
-            Meus Favoritos
+            {t('favorites.title')}
           </h2>
           <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
-            Seus itens salvos
+            {t('favorites.subtitle')}
           </p>
         </div>
-        <div className="w-9" />
+        <div className="w-11" />
       </div>
 
       {loading ? (
@@ -95,11 +94,10 @@ export function FavoritesList({ onBack, onSelectItem, onCloseMenu }: FavoritesLi
           </div>
           <div>
             <h3 className="text-base font-display font-bold text-white mb-1">
-              Nenhum favorito salvo
+              {t('favorites.emptyTitle')}
             </h3>
             <p className="text-xs text-white/60 leading-relaxed max-w-xs mx-auto">
-              Você ainda não favoritou nenhum item. Explore o guia e toque no ícone de coração para
-              guardar suas preferências!
+              {t('favorites.emptyDescription')}
             </p>
           </div>
         </motion.div>
@@ -166,7 +164,7 @@ export function FavoritesList({ onBack, onSelectItem, onCloseMenu }: FavoritesLi
                       e.stopPropagation();
                       removeFavoriteItem(fav.itemId);
                     }}
-                    aria-label={`Remover ${name} dos favoritos`}
+                    aria-label={t('favorites.removeItem', { name })}
                     className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:border-rose-500/30 text-white/50 hover:text-rose-400 flex items-center justify-center transition-all shrink-0 active:scale-95"
                   >
                     <Trash2 size={16} />

=== src/domain/insights/components/ReportsView.tsx — diff ===
@@ -60,6 +60,8 @@ interface ReportsViewProps {
   events: GuideItem[];
 }
 
+const PENDING_PREVIEW_COUNT = 3;
+
 export function ReportsView({ items, events }: ReportsViewProps) {
   const { showToast } = useUI();
   const [selectedEntity, setSelectedEntity] = useState<{
@@ -77,6 +79,7 @@ export function ReportsView({ items, events }: ReportsViewProps) {
   const [reviews, setReviews] = useState<PartnerReview[]>([]);
   const [replyText, setReplyText] = useState('');
   const [replyingTo, setReplyingTo] = useState<string | null>(null);
+  const [showAllPending, setShowAllPending] = useState(false);
 
   useEffect(() => {
     if (selectedEntity) {
@@ -298,9 +301,6 @@ export function ReportsView({ items, events }: ReportsViewProps) {
                   Últimos 7 dias
                 </p>
               </div>
-              <button className="px-4 py-2 min-h-[44px] rounded-xl bg-white/5 border border-white/10 text-[9px] font-semibold tracking-wide text-white/50 hover:text-white hover:bg-white/10 transition-all">
-                Ver Histórico
-              </button>
             </div>
 
             <div className="h-64 w-full">
@@ -355,14 +355,24 @@ export function ReportsView({ items, events }: ReportsViewProps) {
                   {unansweredReviews.length} aguardando resposta
                 </p>
               </div>
-              <button className="px-4 py-2 min-h-[44px] rounded-xl bg-white/5 border border-white/10 text-[9px] font-semibold tracking-wide text-white/50 hover:text-white hover:bg-white/10 transition-all">
-                Ver Histórico
-              </button>
+              {unansweredReviews.length > PENDING_PREVIEW_COUNT && (
+                <button
+                  type="button"
+                  onClick={() => setShowAllPending((prev) => !prev)}
+                  aria-expanded={showAllPending}
+                  className="px-4 py-2 min-h-[44px] rounded-xl bg-white/5 border border-white/10 text-[9px] font-semibold tracking-wide text-white/50 hover:text-white hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
+                >
+                  {showAllPending ? 'Mostrar menos' : 'Ver todas'}
+                </button>
+              )}
             </div>
 
             <div className="space-y-4">
               {unansweredReviews.length > 0 ? (
-                unansweredReviews.slice(0, 3).map((review) => (
+                (showAllPending
+                  ? unansweredReviews
+                  : unansweredReviews.slice(0, PENDING_PREVIEW_COUNT)
+                ).map((review) => (
                   <div
                     key={review.id}
                     className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4"

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -12,7 +12,6 @@ import { zodResolver } from '@hookform/resolvers/zod';
 import { AnimatePresence, motion } from 'motion/react';
 import React, { useEffect, useRef } from 'react';
 import { FormProvider, useForm, type Resolver } from 'react-hook-form';
-import { useNavigate } from 'react-router-dom';
 import { Z_INDEX } from '../../../shared/constants/zIndex';
 
 // Componentes estruturais e utilitários da UI
@@ -35,6 +34,7 @@ import { PartnerHeader } from './subcomponents/PartnerHeader';
 import { PartnerItemsTable } from './subcomponents/PartnerItemsTable';
 import { PartnerTabsNavigation } from './subcomponents/PartnerTabsNavigation';
 import { PlansModal } from './subcomponents/PlansModal';
+import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
 
 export interface PartnerPanelProps {
   profile?: PartnerProfile;
@@ -70,7 +70,7 @@ export function PartnerPanel({
   planSubscriptionSlot,
   renderBookableOffersManager,
 }: PartnerPanelProps) {
-  const navigate = useNavigate();
+  const { goTo } = useLocalizedRouting();
 
   const {
     user,
@@ -194,7 +194,7 @@ export function PartnerPanel({
           Este é o portal exclusivo para parceiros cadastrados.
         </p>
         <button
-          onClick={() => navigate('/')}
+          onClick={() => goTo('explore')}
           className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-semibold tracking-wide text-white"
         >
           Voltar
@@ -212,7 +212,7 @@ export function PartnerPanel({
       >
         <PartnerHeader
           partnerProfile={partnerProfile}
-          onNavigateBack={() => navigate('/')}
+          onNavigateBack={() => goTo('explore')}
           isVerified={isVerified}
           onVerifyClick={() => setShowPlansModal(true)}
           notificationBell={renderNotificationBell?.(partnerProfile?.id || '')}

=== src/domain/partners/components/PartnersModal.tsx — diff ===
@@ -1,6 +1,5 @@
 import React, { useState, useRef, useEffect } from 'react';
 import { motion, AnimatePresence } from 'motion/react';
-import { useNavigate } from 'react-router-dom';
 import { FormProvider } from 'react-hook-form';
 import {
   X,
@@ -34,6 +33,7 @@ import { Z_INDEX } from '../../../shared/constants/zIndex';
 interface PartnersModalProps {
   isOpen: boolean;
   onClose: () => void;
+  onOpenPartnerPanel: () => void;
 }
 
 const CATEGORIES = [
@@ -45,8 +45,7 @@ const CATEGORIES = [
 
 const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
 
-export function PartnersModal({ isOpen, onClose }: PartnersModalProps) {
-  const navigate = useNavigate();
+export function PartnersModal({ isOpen, onClose, onOpenPartnerPanel }: PartnersModalProps) {
   const [showForm, setShowForm] = useState(false);
   const [currentStep, setCurrentStep] = useState(1);
   const scrollContainerRef = useRef<HTMLDivElement>(null);
@@ -523,8 +522,8 @@ export function PartnersModal({ isOpen, onClose }: PartnersModalProps) {
                         businessName={formData.businessName}
                         onClose={() => handleClose()}
                         onAccessPanel={() => {
-                          onClose();
-                          navigate('/admin');
+                          handleClose();
+                          onOpenPartnerPanel();
                         }}
                       />
                     )}

=== src/domain/user/application/usecases/deleteCurrentUserUseCase.test.ts — diff ===
@@ -1,7 +1,13 @@
-import { describe, it, expect, vi, beforeEach } from 'vitest';
-import { deleteCurrentUserUseCase } from './deleteCurrentUserUseCase';
+import { beforeEach, describe, expect, it, vi } from 'vitest';
+import {
+  getIdTokenUseCase,
+  hasPasswordSignInUseCase,
+  logoutUseCase,
+  reauthenticateUseCase,
+  reauthenticateWithGoogleUseCase,
+} from '../../../auth';
 import { userAdapter } from '../../factory';
-import { reauthenticateUseCase, getIdTokenUseCase, logoutUseCase } from '../../../auth';
+import { deleteCurrentUserUseCase } from './deleteCurrentUserUseCase';
 
 vi.mock('../../factory', () => ({
   userAdapter: {
@@ -11,6 +17,8 @@ vi.mock('../../factory', () => ({
 
 vi.mock('../../../auth', () => ({
   reauthenticateUseCase: vi.fn(),
+  reauthenticateWithGoogleUseCase: vi.fn(),
+  hasPasswordSignInUseCase: vi.fn(),
   getIdTokenUseCase: vi.fn(),
   logoutUseCase: vi.fn(),
 }));
@@ -18,57 +26,48 @@ vi.mock('../../../auth', () => ({
 describe('deleteCurrentUserUseCase', () => {
   beforeEach(() => {
     vi.clearAllMocks();
+    vi.mocked(logoutUseCase).mockResolvedValue(undefined);
+    vi.mocked(getIdTokenUseCase).mockResolvedValue('fresh-token');
   });
 
-  it('deve reautenticar, renovar token, excluir conta e deslogar quando email e senha forem fornecidos', async () => {
-    vi.mocked(reauthenticateUseCase).mockResolvedValueOnce(undefined as any);
-    vi.mocked(getIdTokenUseCase).mockResolvedValueOnce('fresh-token');
-    vi.mocked(userAdapter.deleteCurrentUser).mockResolvedValueOnce(undefined);
-    vi.mocked(logoutUseCase).mockResolvedValueOnce(undefined);
+  it('conta com senha: reautentica com a senha, renova o token, exclui e desloga', async () => {
+    vi.mocked(hasPasswordSignInUseCase).mockReturnValue(true);
 
     await deleteCurrentUserUseCase('test@example.com', 'ValidPass123!');
 
     expect(reauthenticateUseCase).toHaveBeenCalledWith('test@example.com', 'ValidPass123!');
+    expect(reauthenticateWithGoogleUseCase).not.toHaveBeenCalled();
     expect(getIdTokenUseCase).toHaveBeenCalledWith(true);
     expect(userAdapter.deleteCurrentUser).toHaveBeenCalledTimes(1);
     expect(logoutUseCase).toHaveBeenCalledTimes(1);
   });
 
-  it('deve permitir exclusão direta sem credenciais (ex: provedor Google autenticado recentemente)', async () => {
-    vi.mocked(userAdapter.deleteCurrentUser).mockResolvedValueOnce(undefined);
-    vi.mocked(logoutUseCase).mockResolvedValueOnce(undefined);
+  it('conta só com Google: confirma pelo popup do Google, sem pedir senha', async () => {
+    vi.mocked(hasPasswordSignInUseCase).mockReturnValue(false);
 
-    await deleteCurrentUserUseCase();
+    await deleteCurrentUserUseCase('google@example.com');
 
+    expect(reauthenticateWithGoogleUseCase).toHaveBeenCalledTimes(1);
     expect(reauthenticateUseCase).not.toHaveBeenCalled();
     expect(userAdapter.deleteCurrentUser).toHaveBeenCalledTimes(1);
-    expect(logoutUseCase).toHaveBeenCalledTimes(1);
   });
 
-  it('deve lidar com REAUTHENTICATION_REQUIRED e tentar reautenticar se credenciais estiverem disponíveis', async () => {
-    const reauthErr = new Error('REAUTHENTICATION_REQUIRED');
-    (reauthErr as any).code = 'REAUTHENTICATION_REQUIRED';
-
-    vi.mocked(reauthenticateUseCase).mockResolvedValue(undefined as any);
-    vi.mocked(getIdTokenUseCase).mockResolvedValue('new-token');
-    // First call throws REAUTHENTICATION_REQUIRED, retry succeeds
-    vi.mocked(userAdapter.deleteCurrentUser)
-      .mockRejectedValueOnce(reauthErr)
-      .mockResolvedValueOnce(undefined);
-    vi.mocked(logoutUseCase).mockResolvedValueOnce(undefined);
+  it('conta com senha sem a senha informada: não exclui', async () => {
+    vi.mocked(hasPasswordSignInUseCase).mockReturnValue(true);
 
-    await deleteCurrentUserUseCase('user@example.com', 'MyPassword123');
-
-    expect(userAdapter.deleteCurrentUser).toHaveBeenCalledTimes(2);
-    expect(logoutUseCase).toHaveBeenCalledTimes(1);
+    await expect(deleteCurrentUserUseCase('test@example.com')).rejects.toThrow(
+      'REAUTHENTICATION_REQUIRED'
+    );
+    expect(userAdapter.deleteCurrentUser).not.toHaveBeenCalled();
   });
 
-  it('deve propagar erro de REAUTHENTICATION_REQUIRED se não houver credenciais para reautenticar', async () => {
-    const reauthErr = new Error('REAUTHENTICATION_REQUIRED');
-    (reauthErr as any).code = 'REAUTHENTICATION_REQUIRED';
-
-    vi.mocked(userAdapter.deleteCurrentUser).mockRejectedValueOnce(reauthErr);
+  it('popup do Google cancelado: não exclui', async () => {
+    vi.mocked(hasPasswordSignInUseCase).mockReturnValue(false);
+    vi.mocked(reauthenticateWithGoogleUseCase).mockRejectedValueOnce(
+      Object.assign(new Error('closed'), { code: 'auth/popup-closed-by-user' })
+    );
 
-    await expect(deleteCurrentUserUseCase()).rejects.toThrow('REAUTHENTICATION_REQUIRED');
+    await expect(deleteCurrentUserUseCase('google@example.com')).rejects.toThrow('closed');
+    expect(userAdapter.deleteCurrentUser).not.toHaveBeenCalled();
   });
 });

=== src/domain/user/application/usecases/deleteCurrentUserUseCase.ts — diff ===
@@ -1,30 +1,27 @@
 import { userAdapter } from '../../factory';
-import { reauthenticateUseCase, getIdTokenUseCase, logoutUseCase } from '../../../auth';
+import {
+  getIdTokenUseCase,
+  hasPasswordSignInUseCase,
+  logoutUseCase,
+  reauthenticateUseCase,
+  reauthenticateWithGoogleUseCase,
+} from '../../../auth';
 
-export async function deleteCurrentUserUseCase(email?: string, password?: string): Promise<void> {
-  if (email && password) {
-    await reauthenticateUseCase(email, password);
-    await getIdTokenUseCase(true);
-  }
-
-  try {
-    await userAdapter.deleteCurrentUser();
-  } catch (error: any) {
-    if (
-      error?.message === 'REAUTHENTICATION_REQUIRED' ||
-      error?.code === 'REAUTHENTICATION_REQUIRED'
-    ) {
-      if (email && password) {
-        await reauthenticateUseCase(email, password);
-        await getIdTokenUseCase(true);
-        await userAdapter.deleteCurrentUser();
-      } else {
-        throw error;
-      }
-    } else {
-      throw error;
+/** Excluir a conta exige login recente: senha para conta de e-mail, popup do Google para as demais. */
+async function confirmIdentity(email: string | undefined, password: string | undefined) {
+  if (hasPasswordSignInUseCase()) {
+    if (!email || !password) {
+      throw new Error('REAUTHENTICATION_REQUIRED');
     }
+    await reauthenticateUseCase(email, password);
+  } else {
+    await reauthenticateWithGoogleUseCase();
   }
+  await getIdTokenUseCase(true);
+}
 
+export async function deleteCurrentUserUseCase(email?: string, password?: string): Promise<void> {
+  await confirmIdentity(email, password);
+  await userAdapter.deleteCurrentUser();
   await logoutUseCase().catch(() => {});
 }

=== src/domain/user/components/AccountView.tsx — diff ===
@@ -20,7 +20,9 @@ interface AccountViewProps {
   setShowDeleteConfirm: (show: boolean) => void;
   onUpdateProfile: () => void;
   onChangePassword: () => void;
-  onDeleteAccount: (password: string) => void;
+  onDeleteAccount: (password?: string) => void;
+  /** Conta com login por senha; quem entra só com Google confirma pelo popup do Google. */
+  hasPassword: boolean;
   onBack: () => void;
 }
 
@@ -35,6 +37,7 @@ export function AccountView({
   onUpdateProfile,
   onChangePassword,
   onDeleteAccount,
+  hasPassword,
   onBack,
 }: AccountViewProps) {
   const [deletePassword, setDeletePassword] = React.useState('');
@@ -104,6 +107,10 @@ export function AccountView({
   };
 
   const handleDelete = () => {
+    if (!hasPassword) {
+      onDeleteAccount();
+      return;
+    }
     if (!deletePassword) return;
     onDeleteAccount(deletePassword);
   };
@@ -216,14 +223,16 @@ export function AccountView({
             </div>
           </div>
 
-          <button
-            onClick={onChangePassword}
-            disabled={isLoading}
-            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-white/80 text-[9px] font-black uppercase tracking-widest border border-white/10 active:scale-95 transition-all"
-          >
-            <Lock size={12} />
-            Alterar Senha
-          </button>
+          {hasPassword && (
+            <button
+              onClick={onChangePassword}
+              disabled={isLoading}
+              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-white/80 text-[9px] font-black uppercase tracking-widest border border-white/10 active:scale-95 transition-all"
+            >
+              <Lock size={12} />
+              Alterar Senha
+            </button>
+          )}
         </div>
 
         <div className="pt-2 flex justify-center">
@@ -252,38 +261,40 @@ export function AccountView({
                   ' Suas empresas e eventos cadastrados em sua conta também serão excluídos.'}
               </p>
 
-              <div className="space-y-1.5 pt-1">
-                <label className="text-[9px] font-black uppercase tracking-widest text-white/50 ml-1">
-                  Para confirmar, digite sua senha
-                </label>
-                <div className="relative">
-                  <input
-                    type={showPassword ? 'text' : 'password'}
-                    value={deletePassword}
-                    onChange={(e) => setDeletePassword(e.target.value)}
-                    placeholder="Sua senha atual"
-                    maxLength={20}
-                    className="w-full h-11 bg-black/20 border border-white/5 rounded-xl px-4 pr-10 text-xs text-white focus:outline-none focus:border-rose-500/30 transition-colors"
-                  />
-                  <button
-                    type="button"
-                    onClick={() => setShowPassword(!showPassword)}
-                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
-                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/50 transition-colors"
-                  >
-                    {showPassword ? (
-                      <Lock size={14} className="text-rose-500/50" />
-                    ) : (
-                      <Lock size={14} />
-                    )}
-                  </button>
+              {hasPassword && (
+                <div className="space-y-1.5 pt-1">
+                  <label className="text-[9px] font-black uppercase tracking-widest text-white/50 ml-1">
+                    Para confirmar, digite sua senha
+                  </label>
+                  <div className="relative">
+                    <input
+                      type={showPassword ? 'text' : 'password'}
+                      value={deletePassword}
+                      onChange={(e) => setDeletePassword(e.target.value)}
+                      placeholder="Sua senha atual"
+                      maxLength={20}
+                      className="w-full h-11 bg-black/20 border border-white/5 rounded-xl px-4 pr-10 text-xs text-white focus:outline-none focus:border-rose-500/30 transition-colors"
+                    />
+                    <button
+                      type="button"
+                      onClick={() => setShowPassword(!showPassword)}
+                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
+                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/50 transition-colors"
+                    >
+                      {showPassword ? (
+                        <Lock size={14} className="text-rose-500/50" />
+                      ) : (
+                        <Lock size={14} />
+                      )}
+                    </button>
+                  </div>
                 </div>
-              </div>
+              )}
 
               <div className="flex gap-2 pt-1">
                 <button
                   onClick={handleDelete}
-                  disabled={isLoading || !deletePassword}
+                  disabled={isLoading || (hasPassword && !deletePassword)}
                   className="flex-1 py-3 bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-rose-500/10"
                 >
                   {isLoading ? 'Excluindo...' : 'Confirmar Exclusão'}

=== src/domain/user/components/AppearanceSettingsView.tsx — diff ===
@@ -8,30 +8,10 @@ interface AppearanceSettingsViewProps {
   onBack: () => void;
 }
 
-const THEME_OPTIONS: Array<{
-  id: Theme;
-  label: string;
-  subtitle: string;
-  icon: typeof Sun;
-}> = [
-  {
-    id: 'light',
-    label: 'Claro',
-    subtitle: 'Tema com tonalidade clara',
-    icon: Sun,
-  },
-  {
-    id: 'dark',
-    label: 'Escuro',
-    subtitle: 'Tema escuro padrão com efeito glassmorphism',
-    icon: Moon,
-  },
-  {
-    id: 'system',
-    label: 'Sistema',
-    subtitle: 'Acompanha a preferência do dispositivo',
-    icon: Monitor,
-  },
+const THEME_OPTIONS: Array<{ id: Theme; icon: typeof Sun }> = [
+  { id: 'light', icon: Sun },
+  { id: 'dark', icon: Moon },
+  { id: 'system', icon: Monitor },
 ];
 
 export function AppearanceSettingsView({ onBack }: AppearanceSettingsViewProps) {
@@ -43,17 +23,17 @@ export function AppearanceSettingsView({ onBack }: AppearanceSettingsViewProps)
       <div className="flex items-center justify-center relative mb-8 pt-2 pr-2">
         <button
           onClick={onBack}
-          aria-label={t('header.closeMenu', 'Voltar')}
+          aria-label={t('settings.back')}
           className="absolute left-0 p-2 text-white/70 hover:text-white active:scale-90 transition-all z-10 focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded-xl"
         >
           <ChevronLeft size={28} />
         </button>
         <div className="text-center">
           <h2 className="text-2xl font-display font-black mb-1 text-white leading-tight">
-            Aparência
+            {t('settings.appearance')}
           </h2>
           <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
-            Selecione o modo
+            {t('settings.appearanceSubtitle')}
           </p>
         </div>
       </div>
@@ -77,8 +57,10 @@ export function AppearanceSettingsView({ onBack }: AppearanceSettingsViewProps)
               <div className="flex items-center gap-3.5">
                 <Icon size={18} className="text-white shrink-0" />
                 <div>
-                  <p className="text-sm font-bold leading-tight">{opt.label}</p>
-                  <p className="text-[11px] text-white/50 font-medium mt-0.5">{opt.subtitle}</p>
+                  <p className="text-sm font-bold leading-tight">{t(`settings.theme.${opt.id}`)}</p>
+                  <p className="text-[11px] text-white/50 font-medium mt-0.5">
+                    {t(`settings.themeDescription.${opt.id}`)}
+                  </p>
                 </div>
               </div>

=== src/domain/user/components/LanguageSettingsView.tsx — diff ===
@@ -31,17 +31,17 @@ export function LanguageSettingsView({ onBack }: LanguageSettingsViewProps) {
       <div className="flex items-center justify-center relative mb-8 pt-2 pr-2">
         <button
           onClick={onBack}
-          aria-label={t('header.closeMenu', 'Voltar')}
+          aria-label={t('settings.back')}
           className="absolute left-0 p-2 text-white/70 hover:text-white active:scale-90 transition-all z-10 focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded-xl"
         >
           <ChevronLeft size={28} />
         </button>
         <div className="text-center">
           <h2 className="text-2xl font-display font-black mb-1 text-white leading-tight">
-            Idioma do Guide
+            {t('settings.language')}
           </h2>
           <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
-            Selecione o idioma
+            {t('settings.languageSubtitle')}
           </p>
         </div>
       </div>

=== src/domain/user/components/MainMenuView.tsx — diff ===
@@ -11,7 +11,6 @@ import {
   ChevronLeft,
   Camera,
   Heart,
-  LifeBuoy,
   Mail,
   Ticket,
 } from 'lucide-react';
@@ -186,7 +185,7 @@ export function MainMenuView({
 
         <div className="mt-2">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3 ml-1">
-            {t('menu.signInOrRegister')}
+            {user ? t('menu.yourArea') : t('menu.signInOrRegister')}
           </p>
 
           {user ? (
@@ -235,7 +234,7 @@ export function MainMenuView({
                     <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 group-hover:scale-110 transition-all shadow-lg shadow-teal-500/5">
                       <Ticket size={16} />
                     </div>
-                    <span className="text-white/80">Meus Ingressos</span>
+                    <span className="text-white/80">{t('menu.tickets')}</span>
                   </div>
                   <ChevronRight
                     size={14}
@@ -344,7 +343,7 @@ export function MainMenuView({
               {t('menu.servicesInfo')}
             </p>
 
-            {!isPartner && (
+            {!isPartner && !isAdmin && (
               <button
                 type="button"
                 onClick={onPartnersOpen}
@@ -363,21 +362,6 @@ export function MainMenuView({
               </button>
             )}
 
-            <button
-              type="button"
-              className="w-full flex items-center justify-between gap-3 p-4 rounded-[1.5rem] glassmorphism text-white active:scale-95 transition-all text-[10px] font-black uppercase tracking-[0.1em] border border-white/10 group focus-visible:ring-2 focus-visible:ring-teal-400/50"
-            >
-              <div className="flex items-center gap-3">
-                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500/20 group-hover:scale-110 transition-all shadow-lg shadow-red-500/5">
-                  <LifeBuoy size={16} />
-                </div>
-                <span className="text-white/80">{t('menu.emergencyCenter')}</span>
-              </div>
-              <ChevronRight
-                size={14}
-                className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
-              />
-            </button>
 
             <button
               type="button"

=== src/domain/user/components/SettingsView.tsx — diff ===
@@ -2,7 +2,7 @@ import React from 'react';
 import { ChevronLeft, ChevronRight, Languages, Sun, Moon, Monitor } from 'lucide-react';
 import { useTranslation } from 'react-i18next';
 import { DEFAULT_LOCALE, getLocaleDisplayLabel, i18n, normalizeLocale } from '../../../shared/i18n';
-import { useTheme, type Theme } from '../../../shared/context/ThemeContext';
+import { useTheme } from '../../../shared/context/ThemeContext';
 
 interface SettingsViewProps {
   onBack: () => void;
@@ -10,12 +10,6 @@ interface SettingsViewProps {
   onOpenAppearance: () => void;
 }
 
-const THEME_LABELS: Record<Theme, string> = {
-  light: 'Claro',
-  dark: 'Escuro',
-  system: 'Sistema',
-};
-
 export function SettingsView({ onBack, onOpenLanguage, onOpenAppearance }: SettingsViewProps) {
   const { t } = useTranslation();
   const { theme } = useTheme();
@@ -29,17 +23,17 @@ export function SettingsView({ onBack, onOpenLanguage, onOpenAppearance }: Setti
       <div className="flex items-center justify-center relative mb-8 pt-2 pr-2">
         <button
           onClick={onBack}
-          aria-label={t('header.closeMenu', 'Voltar')}
+          aria-label={t('settings.back')}
           className="absolute left-0 p-2 text-white/70 hover:text-white active:scale-90 transition-all z-10 focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded-xl"
         >
           <ChevronLeft size={28} />
         </button>
         <div className="text-center">
           <h2 className="text-2xl font-display font-black mb-1 text-white leading-tight">
-            Configurações
+            {t('settings.title')}
           </h2>
           <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
-            Preferências do app
+            {t('settings.subtitle')}
           </p>
         </div>
       </div>
@@ -53,12 +47,12 @@ export function SettingsView({ onBack, onOpenLanguage, onOpenAppearance }: Setti
           <div className="flex items-center gap-3">
             <ThemeIcon size={18} className="text-white shrink-0" />
             <span className="text-sm font-semibold tracking-wide text-white/90 group-hover:text-white transition-colors">
-              Aparência
+              {t('settings.appearance')}
             </span>
           </div>
           <div className="flex items-center gap-2">
             <span className="text-xs text-white/50 font-medium">
-              {THEME_LABELS[theme]}
+              {t(`settings.theme.${theme}`)}
             </span>
             <ChevronRight size={16} className="text-white/40 group-hover:text-white/80 transition-colors" />
           </div>
@@ -72,7 +66,7 @@ export function SettingsView({ onBack, onOpenLanguage, onOpenAppearance }: Setti
           <div className="flex items-center gap-3">
             <Languages size={18} className="text-white shrink-0" />
             <span className="text-sm font-semibold tracking-wide text-white/90 group-hover:text-white transition-colors">
-              Idioma do Guide
+              {t('settings.language')}
             </span>
           </div>
           <div className="flex items-center gap-2">

=== src/domain/user/hooks/useUserProfile.ts — diff ===
@@ -1,6 +1,5 @@
 import { useEffect, useState } from 'react';
 import { useAuthContext } from '../../auth/context/AuthContext';
-import { UserRole } from '../../auth/types/auth';
 import { deleteCurrentUserUseCase } from '../application/usecases/deleteCurrentUserUseCase';
 import { getCurrentUserUseCase } from '../application/usecases/getCurrentUserUseCase';
 import { updateCurrentUserUseCase } from '../application/usecases/updateCurrentUserUseCase';
@@ -9,7 +8,6 @@ import { PasswordData, ShowPasswordsData, UserData } from '../types/user';
 
 export function useUserProfile(onAccountDeleted?: () => void) {
   const { user } = useAuthContext();
-  const [isPartner, setIsPartner] = useState(false);
   const [userData, setUserData] = useState<UserData>({
     firstName: '',
     lastName: '',
@@ -30,8 +28,6 @@ export function useUserProfile(onAccountDeleted?: () => void) {
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
 
-  const isAdmin = user?.role === UserRole.ADMIN;
-
   useEffect(() => {
     if (user) {
       const fetchData = async () => {
@@ -45,7 +41,6 @@ export function useUserProfile(onAccountDeleted?: () => void) {
               lastName: userDoc.lastName || '',
               phone: userDoc.phone || '',
             });
-            setIsPartner(userDoc.role === UserRole.PARTNER);
           }
         } catch (err: unknown) {
           const errMsg = err instanceof Error ? err.message : 'Não foi possível carregar o perfil.';
@@ -56,10 +51,8 @@ export function useUserProfile(onAccountDeleted?: () => void) {
         }
       };
       fetchData();
-    } else {
-      setIsPartner(false);
     }
-  }, [user, isAdmin]);
+  }, [user]);
 
   useEffect(() => {
     if (message) {
@@ -105,7 +98,12 @@ export function useUserProfile(onAccountDeleted?: () => void) {
       const err = error as { message?: string; code?: string };
       console.error('[useUserProfile] Error updating password:', error);
       let text = err?.message || 'Erro ao atualizar senha. Siga os requisitos mínimos.';
-      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
+      if (
+        err?.code === 'auth/popup-closed-by-user' ||
+        err?.code === 'auth/cancelled-popup-request'
+      ) {
+        text = 'Exclusão cancelada: confirme com sua conta Google para continuar.';
+      } else if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
         text = 'Senha atual incorreta.';
       }
       setError(text);
@@ -116,7 +114,7 @@ export function useUserProfile(onAccountDeleted?: () => void) {
     }
   };
 
-  const deleteAccount = async (password: string) => {
+  const deleteAccount = async (password?: string) => {
     if (!user || !user.email) return;
     setIsLoading(true);
     setMessage(null);
@@ -160,8 +158,6 @@ export function useUserProfile(onAccountDeleted?: () => void) {
     setShowPasswords,
     isLoading,
     error,
-    isPartner,
-    isAdmin,
     showDeleteConfirm,
     setShowDeleteConfirm,
     message,

=== src/shared/hooks/useLocalizedRouting.ts — diff ===
@@ -1,6 +1,6 @@
 import { useCallback, useEffect } from 'react';
 import { useTranslation } from 'react-i18next';
-import { useLocation, useNavigate } from 'react-router-dom';
+import { type NavigateOptions, useLocation, useNavigate } from 'react-router-dom';
 import {
   DEFAULT_LOCALE,
   type Locale,
@@ -23,7 +23,8 @@ export function useLocalizedRouting() {
   const pathFor = useCallback((routeKey: RouteKey) => localizedPath(routeKey, locale), [locale]);
 
   const goTo = useCallback(
-    (routeKey: RouteKey, search = '') => navigate(`${localizedPath(routeKey, locale)}${search}`),
+    (routeKey: RouteKey, search = '', options?: NavigateOptions) =>
+      navigate(`${localizedPath(routeKey, locale)}${search}`, options),
     [navigate, locale]
   );

=== src/shared/i18n/index.ts — diff ===
@@ -10,9 +10,7 @@ export {
 } from './locale';
 export { i18n } from './config';
 export {
-  INDEXABLE_ROUTE_KEYS,
   LOCALIZED_ROUTES,
-  PRIVATE_ROUTE_KEYS,
   localizedPath,
   parseLocalizedPath,
   ROUTE_KEYS,

=== src/shared/i18n/localizedRoutes.test.ts — diff ===
@@ -1,7 +1,6 @@
 import { describe, expect, it } from 'vitest';
 import { SUPPORTED_LOCALES } from './locale';
 import {
-  INDEXABLE_ROUTE_KEYS,
   LOCALIZED_ROUTES,
   localizedPath,
   parseLocalizedPath,
@@ -39,9 +38,9 @@ describe('localizedRoutes', () => {
     expect(switchLocalePath('/admin', '', 'en')).toBe('/en');
   });
 
-  it('favoritos não é indexável', () => {
-    expect(INDEXABLE_ROUTE_KEYS).not.toContain('favorites');
-    expect(INDEXABLE_ROUTE_KEYS).not.toContain('bookings');
-    expect(INDEXABLE_ROUTE_KEYS).toHaveLength(7);
+  it('favoritos e reservas não são páginas: abrem no menu lateral', () => {
+    expect(parseLocalizedPath('/favoritos')).toBeNull();
+    expect(parseLocalizedPath('/en/bookings')).toBeNull();
+    expect(ROUTE_KEYS).toHaveLength(7);
   });
 });

=== src/shared/i18n/localizedRoutes.ts — diff ===
@@ -8,8 +8,6 @@ export const ROUTE_KEYS = [
   'restaurants',
   'attractions',
   'guide',
-  'favorites',
-  'bookings',
 ] as const;
 export type RouteKey = (typeof ROUTE_KEYS)[number];
 
@@ -25,17 +23,8 @@ export const LOCALIZED_ROUTES: Record<RouteKey, Record<Locale, string>> = {
   restaurants: { 'pt-BR': '/restaurantes', en: '/en/restaurants', fr: '/fr/restaurants' },
   attractions: { 'pt-BR': '/pontos', en: '/en/attractions', fr: '/fr/attractions' },
   guide: { 'pt-BR': '/info', en: '/en/travel-guide', fr: '/fr/guide-pratique' },
-  favorites: { 'pt-BR': '/favoritos', en: '/en/favorites', fr: '/fr/favoris' },
-  bookings: { 'pt-BR': '/reservas', en: '/en/bookings', fr: '/fr/reservations' },
 };
 
-/** Páginas pessoais (favoritos, reservas) ficam fora do sitemap e com noindex. */
-export const PRIVATE_ROUTE_KEYS: readonly RouteKey[] = ['favorites', 'bookings'];
-
-export const INDEXABLE_ROUTE_KEYS: readonly RouteKey[] = ROUTE_KEYS.filter(
-  (key) => !PRIVATE_ROUTE_KEYS.includes(key)
-);
-
 function normalizePathname(pathname: string): string {
   return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
 }

=== src/shared/i18n/resources.ts — diff ===
@@ -35,8 +35,10 @@ export interface TranslationResource {
     changeProfilePhoto: string;
     userFallback: string;
     signInOrRegister: string;
+    yourArea: string;
     account: string;
     favorites: string;
+    tickets: string;
     emailPassword: string;
     orUse: string;
     continueGoogle: string;
@@ -44,7 +46,6 @@ export interface TranslationResource {
     myPanel: string;
     servicesInfo: string;
     partnerProgram: string;
-    emergencyCenter: string;
     support: string;
     aboutApp: string;
     logout: string;
@@ -140,8 +141,6 @@ export interface TranslationResource {
       restaurants: { title: string; description: string };
       attractions: { title: string; description: string };
       guide: { title: string; description: string };
-      favorites: { title: string; description: string };
-      bookings: { title: string; description: string };
     };
   };
   pages: {
@@ -152,6 +151,31 @@ export interface TranslationResource {
     planPaymentTitle: string;
     planPaymentDescription: string;
     openPartnerArea: string;
+    partnerAreaTitle: string;
+    partnerLoginRequired: string;
+    signIn: string;
+    partnerOnly: string;
+    partnerProfileNotFound: string;
+    partnerProfileLoadError: string;
+  };
+  settings: {
+    title: string;
+    subtitle: string;
+    back: string;
+    appearance: string;
+    appearanceSubtitle: string;
+    language: string;
+    languageSubtitle: string;
+    theme: { light: string; dark: string; system: string };
+    themeDescription: { light: string; dark: string; system: string };
+  };
+  favorites: {
+    title: string;
+    subtitle: string;
+    back: string;
+    emptyTitle: string;
+    emptyDescription: string;
+    removeItem: string;
   };
 }
 const ptBR: TranslationResource = {
@@ -189,8 +213,10 @@ const ptBR: TranslationResource = {
     changeProfilePhoto: 'Alterar foto de perfil',
     userFallback: 'Usuário',
     signInOrRegister: 'Entrar ou cadastre-se',
+    yourArea: 'Sua área',
     account: 'Conta',
     favorites: 'Meus Favoritos',
+    tickets: 'Meus Ingressos',
     emailPassword: 'E-mail e Senha',
     orUse: 'Ou use',
     continueGoogle: 'Continuar com Google',
@@ -198,7 +224,6 @@ const ptBR: TranslationResource = {
     myPanel: 'Meu Painel',
     servicesInfo: 'Serviços & Info',
     partnerProgram: 'Programa de Parceiros',
-    emergencyCenter: 'Central de Emergência',
     support: 'Suporte / Ajuda',
     aboutApp: 'Sobre o App',
     logout: 'Sair',
@@ -320,14 +345,6 @@ const ptBR: TranslationResource = {
         title: 'Guia Prático & Dicas Úteis | Use Guide',
         description: 'Tudo o que você precisa saber: taxa de turismo, como chegar, melhor época, traslados e dicas essenciais.',
       },
-      favorites: {
-        title: 'Meus Favoritos | Use Guide',
-        description: 'Os lugares, passeios e eventos que você salvou no Use Guide.',
-      },
-      bookings: {
-        title: 'Minhas Reservas | Use Guide',
-        description: 'Seus passeios e entradas reservados no Use Guide.',
-      },
     },
   },
   pages: {
@@ -338,6 +355,36 @@ const ptBR: TranslationResource = {
     planPaymentTitle: 'Pagamento do plano em processamento',
     planPaymentDescription: 'Assim que o Stripe confirmar, o selo aparece na sua área de parceiro.',
     openPartnerArea: 'Abrir área do parceiro',
+    partnerAreaTitle: 'Área do parceiro',
+    partnerLoginRequired: 'Entre na sua conta de parceiro para abrir o painel.',
+    signIn: 'Entrar',
+    partnerOnly: 'Este painel é exclusivo para parceiros cadastrados.',
+    partnerProfileNotFound: 'Não encontramos o seu cadastro de parceiro.',
+    partnerProfileLoadError: 'Não foi possível carregar o seu cadastro de parceiro.',
+  },
+  settings: {
+    title: 'Configurações',
+    subtitle: 'Preferências do app',
+    back: 'Voltar',
+    appearance: 'Aparência',
+    appearanceSubtitle: 'Selecione o modo',
+    language: 'Idioma do Guide',
+    languageSubtitle: 'Selecione o idioma',
+    theme: { light: 'Claro', dark: 'Escuro', system: 'Sistema' },
+    themeDescription: {
+      light: 'Tema com tonalidade clara',
+      dark: 'Tema escuro padrão com efeito glassmorphism',
+      system: 'Acompanha a preferência do dispositivo',
+    },
+  },
+  favorites: {
+    title: 'Meus Favoritos',
+    subtitle: 'Seus itens salvos',
+    back: 'Voltar para o menu principal',
+    emptyTitle: 'Nenhum favorito salvo',
+    emptyDescription:
+      'Você ainda não favoritou nenhum item. Explore o guia e toque no coração para guardar o que gostou.',
+    removeItem: 'Remover {{name}} dos favoritos',
   },
 };
 const en: TranslationResource = {
@@ -375,8 +422,10 @@ const en: TranslationResource = {
     changeProfilePhoto: 'Change profile photo',
     userFallback: 'User',
     signInOrRegister: 'Sign in or register',
+    yourArea: 'Your area',
     account: 'Account',
     favorites: 'My Favorites',
+    tickets: 'My Tickets',
     emailPassword: 'Email & Password',
     orUse: 'Or use',
     continueGoogle: 'Continue with Google',
@@ -384,7 +433,6 @@ const en: TranslationResource = {
     myPanel: 'My Panel',
     servicesInfo: 'Services & Info',
     partnerProgram: 'Partner Program',
-    emergencyCenter: 'Emergency Center',
     support: 'Support / Help',
     aboutApp: 'About the App',
     logout: 'Sign out',
@@ -504,14 +552,6 @@ const en: TranslationResource = {
         title: 'Practical Guide & Tips | Use Guide',
         description: 'Everything you need to know: tourism fee, how to get there, best season, transfers and essential tips.',
       },
-      favorites: {
-        title: 'My Favorites | Use Guide',
-        description: 'The places, tours and events you saved on Use Guide.',
-      },
-      bookings: {
-        title: 'My Bookings | Use Guide',
-        description: 'Your tours and entries booked on Use Guide.',
-      },
     },
   },
   pages: {
@@ -522,6 +562,36 @@ const en: TranslationResource = {
     planPaymentTitle: 'Plan payment processing',
     planPaymentDescription: 'As soon as Stripe confirms, the badge appears in your partner area.',
     openPartnerArea: 'Open partner area',
+    partnerAreaTitle: 'Partner area',
+    partnerLoginRequired: 'Sign in to your partner account to open the dashboard.',
+    signIn: 'Sign in',
+    partnerOnly: 'This dashboard is only for registered partners.',
+    partnerProfileNotFound: 'We couldn’t find your partner registration.',
+    partnerProfileLoadError: 'We couldn’t load your partner registration.',
+  },
+  settings: {
+    title: 'Settings',
+    subtitle: 'App preferences',
+    back: 'Back',
+    appearance: 'Appearance',
+    appearanceSubtitle: 'Choose a mode',
+    language: 'Guide language',
+    languageSubtitle: 'Choose a language',
+    theme: { light: 'Light', dark: 'Dark', system: 'System' },
+    themeDescription: {
+      light: 'Light-toned theme',
+      dark: 'Default dark theme with glass effect',
+      system: 'Follows your device setting',
+    },
+  },
+  favorites: {
+    title: 'My Favorites',
+    subtitle: 'Your saved items',
+    back: 'Back to the main menu',
+    emptyTitle: 'No saved favorites',
+    emptyDescription:
+      "You haven't saved anything yet. Explore the guide and tap the heart to keep what you like.",
+    removeItem: 'Remove {{name}} from favorites',
   },
 };
 const fr: TranslationResource = {
@@ -559,8 +629,10 @@ const fr: TranslationResource = {
     changeProfilePhoto: 'Changer la photo de profil',
     userFallback: 'Utilisateur',
     signInOrRegister: 'Connexion ou inscription',
+    yourArea: 'Votre espace',
     account: 'Compte',
     favorites: 'Mes favoris',
+    tickets: 'Mes billets',
     emailPassword: 'E-mail et mot de passe',
     orUse: 'Ou utiliser',
     continueGoogle: 'Continuer avec Google',
@@ -568,7 +640,6 @@ const fr: TranslationResource = {
     myPanel: 'Mon espace',
     servicesInfo: 'Services et infos',
     partnerProgram: 'Programme partenaires',
-    emergencyCenter: 'Centre d’urgence',
     support: 'Support / Aide',
     aboutApp: 'À propos de l’app',
     logout: 'Se déconnecter',
@@ -693,14 +764,6 @@ const fr: TranslationResource = {
         title: 'Guide Pratique & Conseils | Use Guide',
         description: 'Tout ce qu\'il faut savoir : taxe touristique, comment venir, meilleure saison, transferts et conseils essentiels.',
       },
-      favorites: {
-        title: 'Mes Favoris | Use Guide',
-        description: 'Les lieux, excursions et événements que vous avez enregistrés sur Use Guide.',
-      },
-      bookings: {
-        title: 'Mes Réservations | Use Guide',
-        description: 'Vos excursions et entrées réservées sur Use Guide.',
-      },
     },
   },
   pages: {
@@ -711,6 +774,36 @@ const fr: TranslationResource = {
     planPaymentTitle: 'Paiement du forfait en cours',
     planPaymentDescription: 'Dès que Stripe confirme, le badge apparaît dans votre espace partenaire.',
     openPartnerArea: 'Ouvrir l’espace partenaire',
+    partnerAreaTitle: 'Espace partenaire',
+    partnerLoginRequired: 'Connectez-vous à votre compte partenaire pour ouvrir le tableau de bord.',
+    signIn: 'Se connecter',
+    partnerOnly: 'Ce tableau de bord est réservé aux partenaires inscrits.',
+    partnerProfileNotFound: 'Nous n’avons pas trouvé votre inscription de partenaire.',
+    partnerProfileLoadError: 'Impossible de charger votre inscription de partenaire.',
+  },
+  settings: {
+    title: 'Paramètres',
+    subtitle: 'Préférences de l’app',
+    back: 'Retour',
+    appearance: 'Apparence',
+    appearanceSubtitle: 'Choisissez un mode',
+    language: 'Langue du guide',
+    languageSubtitle: 'Choisissez une langue',
+    theme: { light: 'Clair', dark: 'Sombre', system: 'Système' },
+    themeDescription: {
+      light: 'Thème aux tons clairs',
+      dark: 'Thème sombre par défaut avec effet verre',
+      system: 'Suit le réglage de votre appareil',
+    },
+  },
+  favorites: {
+    title: 'Mes favoris',
+    subtitle: 'Vos éléments enregistrés',
+    back: 'Retour au menu principal',
+    emptyTitle: 'Aucun favori enregistré',
+    emptyDescription:
+      'Vous n’avez encore rien enregistré. Explorez le guide et touchez le cœur pour garder ce qui vous plaît.',
+    removeItem: 'Retirer {{name}} des favoris',
   },
 };
 export const resources = {

=== src/shared/stores/useUIStore.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it } from 'vitest';
import { useUIStore } from './useUIStore';

describe('modal de login', () => {
  beforeEach(() => {
    useUIStore.getState().closeLoginModal();
  });

  it('abre na aba de login por padrão', () => {
    useUIStore.getState().openLoginModal();
    expect(useUIStore.getState()).toMatchObject({ isLoginModalOpen: true, loginModalTab: 'login' });
  });

  it('"solicitar novo link" abre direto em recuperação de senha', () => {
    useUIStore.getState().openPasswordRecovery();
    expect(useUIStore.getState()).toMatchObject({
      isLoginModalOpen: true,
      loginModalTab: 'forgot',
    });
    useUIStore.getState().openLoginModal();
    expect(useUIStore.getState().loginModalTab).toBe('login');
  });
});

=== src/shared/stores/useUIStore.ts — diff ===
@@ -3,12 +3,16 @@ import { toast } from 'sonner';
 import { ConfirmDialogData } from '../../ui/components/ConfirmDialog';
 
 export type ToastType = 'success' | 'error' | 'info';
+export type LoginModalTab = 'login' | 'forgot';
 
 export interface UIState {
   isLoginModalOpen: boolean;
+  loginModalTab: LoginModalTab;
   isLoginClosingBySwipe: boolean;
   confirmDialog: ConfirmDialogData | null;
   openLoginModal: () => void;
+  /** Abre o modal direto em "esqueci minha senha". */
+  openPasswordRecovery: () => void;
   closeLoginModal: () => void;
   setLoginClosingBySwipe: (val: boolean) => void;
   showToast: (message: string, type?: ToastType) => void;
@@ -18,10 +22,14 @@ export interface UIState {
 
 export const useUIStore = create<UIState>((set) => ({
   isLoginModalOpen: false,
+  loginModalTab: 'login',
   isLoginClosingBySwipe: false,
   confirmDialog: null,
 
-  openLoginModal: () => set({ isLoginModalOpen: true, isLoginClosingBySwipe: false }),
+  openLoginModal: () =>
+    set({ isLoginModalOpen: true, loginModalTab: 'login', isLoginClosingBySwipe: false }),
+  openPasswordRecovery: () =>
+    set({ isLoginModalOpen: true, loginModalTab: 'forgot', isLoginClosingBySwipe: false }),
   closeLoginModal: () => set({ isLoginModalOpen: false, isLoginClosingBySwipe: false }),
   setLoginClosingBySwipe: (val: boolean) => set({ isLoginClosingBySwipe: val }),

=== src/shared/utils/seo.test.ts — diff ===
@@ -102,7 +102,6 @@ describe('updateDocumentSEO utility', () => {
       canonicalUrl: 'https://useguide.com.br/fr/evenements',
       locale: 'fr',
     });
-    expect(getRouteSeoMetadata('/en/favorites').robots).toBe('noindex, follow');
   });
 
   it('rotas fora do mapa: admin noindex, desconhecida noindex', () => {

=== src/shared/utils/seo.ts — diff ===
@@ -1,11 +1,4 @@
-import {
-  DEFAULT_LOCALE,
-  i18n,
-  type Locale,
-  localizedPath,
-  PRIVATE_ROUTE_KEYS,
-  parseLocalizedPath,
-} from '../i18n';
+import { DEFAULT_LOCALE, i18n, type Locale, localizedPath, parseLocalizedPath } from '../i18n';
 
 export interface SEOMetadata {
   title?: string | undefined;
@@ -91,7 +84,6 @@ export function getRouteSeoMetadata(pathname: string): SEOMetadata {
     description: i18n.t(`seo.routes.${routeKey}.description`, { lng: locale }),
     canonicalUrl: `${BASE_URL}${localizedPath(routeKey, locale)}`,
     locale,
-    ...(PRIVATE_ROUTE_KEYS.includes(routeKey) ? { robots: 'noindex, follow' } : {}),
   };
 }

=== src/ui/layouts/Header.tsx — diff ===
@@ -79,30 +79,28 @@ export function Header({
       />
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
-          {isMainPage && (
-            <button
-              onClick={onMenuToggle}
-              aria-label={isMenuOpen ? t('header.closeMenu') : t('header.openMenu')}
-              aria-expanded={isMenuOpen}
-              className="relative w-[34px] h-[34px] rounded-xl bg-white/10 border border-white/20 backdrop-blur-2xl p-0.5 flex items-center justify-center active:scale-90 transition-all hover:bg-white/20 text-white/80 shadow-md overflow-hidden group before:absolute before:inset-[-5px] before:content-[''] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
-            >
-              {user && photoURL ? (
-                <img
-                  src={photoURL}
-                  alt={t('header.profileAlt')}
-                  className="w-full h-full rounded-[10px] object-cover"
-                />
-              ) : user && userInitials ? (
-                <div className="w-full h-full rounded-[10px] bg-teal-500/15 border border-teal-400/20 flex items-center justify-center font-display font-black text-[10px] text-teal-300 tracking-wider select-none uppercase">
-                  {userInitials}
-                </div>
-              ) : (
-                <div className="w-full h-full flex items-center justify-center text-teal-400/70 group-hover:text-teal-400 transition-colors">
-                  <UserIcon size={16} />
-                </div>
-              )}
-            </button>
-          )}
+          <button
+            onClick={onMenuToggle}
+            aria-label={isMenuOpen ? t('header.closeMenu') : t('header.openMenu')}
+            aria-expanded={isMenuOpen}
+            className="relative w-[34px] h-[34px] rounded-xl bg-white/10 border border-white/20 backdrop-blur-2xl p-0.5 flex items-center justify-center active:scale-90 transition-all hover:bg-white/20 text-white/80 shadow-md overflow-hidden group before:absolute before:inset-[-5px] before:content-[''] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
+          >
+            {user && photoURL ? (
+              <img
+                src={photoURL}
+                alt={t('header.profileAlt')}
+                className="w-full h-full rounded-[10px] object-cover"
+              />
+            ) : user && userInitials ? (
+              <div className="w-full h-full rounded-[10px] bg-teal-500/15 border border-teal-400/20 flex items-center justify-center font-display font-black text-[10px] text-teal-300 tracking-wider select-none uppercase">
+                {userInitials}
+              </div>
+            ) : (
+              <div className="w-full h-full flex items-center justify-center text-teal-400/70 group-hover:text-teal-400 transition-colors">
+                <UserIcon size={16} />
+              </div>
+            )}
+          </button>
           {isMainPage && user && (isAdmin || isPartner) && (
             <button
               onClick={onAdminOpen}

=== src/ui/layouts/SideMenu.tsx — APAGUE este arquivo ===

VERIFICAÇÃO (obrigatória):
- `npm run typecheck` sem erros; `npx biome lint .` com 0 erros.
- `npm test` → 124 arquivos, 743 testes.
- `npm run build` sem erros.
- Confira à mão no preview: menu → Meus Favoritos abre dentro do menu e o voltar retorna ao menu; tocar num favorito fecha o menu e abre o item; Minhas reservas idem; em /en/events o botão do menu aparece e o voltar ao início mantém o inglês.

Nada de configuração manual neste prompt (sem variáveis, índices ou regras novas).
Responda no formato do AGENTS.md §16.3.
~~~~
