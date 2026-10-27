# Prompt 20.4 — Menu lateral como perfil e Minhas avaliações (D19)

> Lote 17, gerado do commit de referência `b15f337` da branch `claude/agents-md-v2`. Aplique depois do 20.3. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 20.4 — Menu lateral como perfil e Minhas avaliações

Telas aprovadas em 2026-10-27 (prints reais). Decisão D19, já registrada em docs/arquitetura/decisoes.md por este prompt.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e os apagados. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova.

O QUE MUDA (D19):
1) Menu lateral com login vira perfil: foto e nome, "No Use Guide desde", o cartão Próximo e os atalhos Ingressos, Reservas, Favoritos e Avaliações com números (src/app/compositions/ProfileHighlightsComposition.tsx, que junta os domínios), Minha conta, Seja parceiro ou Meu painel e Sair da conta. Sem login: entrar por e-mail ou Google e Seja parceiro. MainMenuView dividido em src/domain/user/components/menu/ (avatar, linha e login).
2) Suporte e Sobre o app saem da tela principal e entram em Configurações; as sub-telas support e about voltam para settings.
3) Minhas avaliações (sub-tela `reviews`, privada): um cartão por avaliação com o nome do lugar vindo do guia (MyReviewsComposition), menu "…" com Editar (folha com nota e texto) e Excluir (com confirmação). A consulta por usuário passa a ser paginada (listUserReviews com limit) e ganha índice novo em firestore.indexes.json.
4) O menu lateral usa o fundo do tema (antes era preto fixo também no tema claro).
5) Design system: DropdownMenu com tokens e a camada nova Z_INDEX.popover, acima dos modais; Dialog e ConfirmDialog escurecem o fundo também sobre o menu; a confirmação abre sem anel de foco; StarRating traduzido e na cor do tema; ShortcutTile novo.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/decisoes.md (alterar)
- firestore.indexes.json (alterar)
- src/app/compositions/MyReviewsComposition.tsx (criar)
- src/app/compositions/ProfileHighlightsComposition.tsx (criar)
- src/app/menu/SideMenu.tsx (alterar)
- src/app/menu/menuViews.test.ts (alterar)
- src/app/menu/menuViews.ts (alterar)
- src/domain/bookings/index.ts (alterar)
- src/domain/favorites/index.ts (alterar)
- src/domain/reviews/adapters/firestoreReviewAdapter.ts (alterar)
- src/domain/reviews/application/usecases/deleteReviewUseCase.ts (criar)
- src/domain/reviews/application/usecases/listMyReviewsUseCase.ts (criar)
- src/domain/reviews/components/StarRating.tsx (alterar)
- src/domain/reviews/components/mine/EditReviewSheet.tsx (criar)
- src/domain/reviews/components/mine/MyReviewCard.tsx (criar)
- src/domain/reviews/components/mine/MyReviewsView.test.tsx (criar)
- src/domain/reviews/components/mine/MyReviewsView.tsx (criar)
- src/domain/reviews/hooks/useMyReviews.ts (criar)
- src/domain/reviews/index.ts (alterar)
- src/domain/reviews/ports/reviewPort.ts (alterar)
- src/domain/reviews/schemas/editReviewSchema.ts (criar)
- src/domain/reviews/utils/reviewDateToIso.ts (criar)
- src/domain/user/components/MainMenuView.test.tsx (criar)
- src/domain/user/components/MainMenuView.tsx (alterar)
- src/domain/user/components/SettingsView.tsx (alterar)
- src/domain/user/components/menu/MenuRow.tsx (criar)
- src/domain/user/components/menu/ProfileAvatar.tsx (criar)
- src/domain/user/components/menu/SignInPanel.tsx (criar)
- src/domain/user/hooks/useUserProfile.ts (alterar)
- src/shared/constants/zIndex.ts (alterar)
- src/shared/i18n/profileResources.ts (criar)
- src/shared/i18n/resources.ts (alterar)
- src/ui/components/ConfirmDialog.tsx (alterar)
- src/ui/components/Dialog.tsx (alterar)
- src/ui/components/DropdownMenu.tsx (alterar)
- src/ui/components/ShortcutTile.tsx (criar)
- src/ui/layouts/SidebarLayout.tsx (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/decisoes.md — diff ===
@@ -28,6 +28,7 @@
 | D16 | Dívidas, reclamações, força maior e reagendamento | ✅ Aprovada | 2026-10-25 |
 | D17 | Visual: fundo neutro, superfícies sólidas e menos informação por tela | ✅ Aprovada | 2026-10-27 |
 | D18 | Compras em Configurações; cancelar só com reembolso; valor só na confirmação | ✅ Aprovada | 2026-10-27 |
+| D19 | Menu lateral como perfil; Minhas avaliações; denúncia de resposta e aba Moderação | ✅ Aprovada | 2026-10-27 |
 
 ---
 
@@ -273,3 +274,14 @@ Propostas montadas em preview (Minhas reservas, Pedidos e Financeiro do admin) e
 * **Fora por enquanto:** o meio de pagamento na folha ("Pago no cartão"), que exige o backend guardar esse dado.
 * **Prompt:** 20.3.
 
+## D19 — Menu lateral como perfil, Minhas avaliações e denúncia de resposta (2026-10-27)
+
+* **Perfil (com login):** foto e nome como antes, "No Use Guide desde <mês de ano>", o cartão **Próximo** (evento ou serviço mais próximo, abre ingressos ou reservas), quatro atalhos com números (Ingressos, Reservas, Favoritos, Avaliações), a lista Minha conta e Seja parceiro (Meu painel para parceiro e admin) e Sair da conta em texto.
+* **Configurações:** Compras, Aparência e Idioma num cartão; Suporte e Sobre o app em outro. Compras fica só em Configurações.
+* **Sem login:** entrar por e-mail ou Google e Seja parceiro. Configurações (com Suporte e Sobre) abre sem login.
+* **Menu nos dois temas:** o fundo do menu passa a ser o do tema (antes era preto fixo também no claro).
+* **Estrelas amarelas:** exceção à regra de cor da D17 (amarelo = pendente), por ser o padrão em todo app de avaliação.
+* **Minhas avaliações:** um cartão por avaliação com o nome do lugar, estrelas, "Experiência verificada", o texto e a resposta do estabelecimento; menu "…" com Editar, Denunciar resposta (só quando há resposta) e Excluir (com confirmação). Lista paginada por cursor.
+* **Denúncia de resposta:** motivos fechados (ofensiva ou desrespeitosa, fraude ou golpe, expõe dados pessoais, outro) e texto opcional; o estabelecimento não sabe quem denunciou; prazo de análise exibido: 3 dias. Aceita pelo admin, a resposta é removida e o caso fica registrado; se indicar fraude, serve de base para o admin suspender o estabelecimento. A fila fica numa aba nova **Moderação** no painel do admin.
+* **Prompts:** 20.4 (perfil, Configurações e Minhas avaliações) e 20.5 (denúncia e Moderação).
+

=== firestore.indexes.json — diff ===
@@ -415,6 +415,20 @@
           "order": "DESCENDING"
         }
       ]
+    },
+    {
+      "collectionGroup": "reviews",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "userId",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "createdAt",
+          "order": "DESCENDING"
+        }
+      ]
     }
   ],
   "fieldOverrides": [

=== src/app/compositions/MyReviewsComposition.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useEffect, useState } from 'react';
import { getEventListingByIdUseCase } from '../../domain/events';
import { useGuideCatalog } from '../../domain/guide';
import { type FirestoreReview, MyReviewsView, useMyReviews } from '../../domain/reviews';

/**
 * Minhas avaliações com o nome do lugar vindo do guia: a avaliação guarda só o ID do item. Eventos
 * que já saíram do catálogo (passados) são buscados um a um.
 */
export function MyReviewsComposition({ onBack }: { onBack: () => void }) {
  const { items, events } = useGuideCatalog();
  const source = useMyReviews();
  const { data } = source;
  const [eventTitles, setEventTitles] = useState<Record<string, string>>({});

  const catalogTitle = (review: FirestoreReview) =>
    review.itemCollection === 'events'
      ? events.find((event) => event.id === review.itemId)?.name
      : items.find((item) => item.id === review.itemId)?.name;

  const missingEvents = [
    ...new Set(
      data
        .filter((review) => review.itemCollection === 'events' && !catalogTitle(review))
        .map((review) => review.itemId)
        .filter((id) => !(id in eventTitles))
    ),
  ];
  const missingKey = missingEvents.join(',');

  useEffect(() => {
    if (!missingKey) return;
    let active = true;
    void Promise.all(
      missingKey.split(',').map(async (id) => {
        const event = await getEventListingByIdUseCase(id).catch(() => null);
        return [id, event?.title || event?.name || ''] as const;
      })
    ).then((pairs) => {
      if (active) setEventTitles((current) => ({ ...current, ...Object.fromEntries(pairs) }));
    });
    return () => {
      active = false;
    };
  }, [missingKey]);

  return (
    <MyReviewsView
      source={source}
      onBack={onBack}
      titleOf={(review) => catalogTitle(review) || eventTitles[review.itemId] || undefined}
    />
  );
}

=== src/app/compositions/ProfileHighlightsComposition.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ChevronRight, Compass, Heart, MapPin, Star, Ticket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMyBookings } from '../../domain/bookings';
import { useFavorites } from '../../domain/favorites';
import { useMyReviews } from '../../domain/reviews';
import { useUserTicketsAndOrders } from '../../domain/ticketing';
import { formatBusinessDate } from '../../shared/utils/businessDateTime';
import { ShortcutTile } from '../../ui/components/ShortcutTile';

interface ProfileHighlightsProps {
  onOpenTickets: () => void;
  onOpenBookings: () => void;
  onOpenFavorites: () => void;
  onOpenReviews: () => void;
}

interface NextUp {
  kind: 'ticket' | 'booking';
  title: string;
  startsAt: string;
  place: string | null;
  count: number;
}

/**
 * Perfil (D19): o próximo evento ou serviço e os atalhos com números. Junta ingressos, reservas,
 * favoritos e avaliações, cada um pelo próprio domínio.
 */
export function ProfileHighlightsComposition({
  onOpenTickets,
  onOpenBookings,
  onOpenFavorites,
  onOpenReviews,
}: ProfileHighlightsProps) {
  const { t, i18n } = useTranslation();
  const wallet = useUserTicketsAndOrders(true);
  const bookings = useMyBookings();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const reviews = useMyReviews();
  const now = Date.now();

  const upcomingTickets = wallet.tickets.filter(
    (ticket) =>
      ticket.status === 'issued' &&
      ticket.eventSnapshot &&
      new Date(ticket.eventSnapshot.startsAt).getTime() > now
  );
  const upcomingBookings = bookings.data.filter(
    (booking) => booking.status === 'confirmed' && new Date(booking.offer.startsAt).getTime() > now
  );

  const candidates: NextUp[] = [];
  const byOrder = new Map<string, NextUp>();
  for (const ticket of upcomingTickets) {
    const event = ticket.eventSnapshot;
    if (!event) continue;
    const current = byOrder.get(ticket.orderId);
    if (current) current.count += 1;
    else
      byOrder.set(ticket.orderId, {
        kind: 'ticket',
        title: event.title,
        startsAt: event.startsAt,
        place: event.locationName ?? null,
        count: 1,
      });
  }
  candidates.push(...byOrder.values());
  for (const booking of upcomingBookings) {
    candidates.push({
      kind: 'booking',
      title: booking.offer.title,
      startsAt: booking.offer.startsAt,
      place: booking.offer.meetingPoint,
      count: booking.participantsCount,
    });
  }
  const next = candidates.sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];

  const count = (loading: boolean, value: number, more = false) =>
    loading ? null : `${value}${more ? '+' : ''}`;

  return (
    <div className="space-y-4">
      {next && (
        <section>
          <h3 className="text-[13px] font-semibold text-ink/70 px-1 mb-2">{t('profile.next')}</h3>
          <button
            type="button"
            onClick={next.kind === 'ticket' ? onOpenTickets : onOpenBookings}
            className="press w-full p-4 rounded-[20px] bg-surface border border-line flex gap-3 text-left focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
          >
            <span className="w-12 h-12 shrink-0 rounded-2xl bg-accent-soft text-accent flex items-center justify-center">
              {next.kind === 'ticket' ? (
                <Ticket size={22} aria-hidden="true" />
              ) : (
                <Compass size={22} aria-hidden="true" />
              )}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-semibold text-ink break-words">
                {next.title}
              </span>
              <span className="block text-sm text-ink/70">
                {formatBusinessDate(next.startsAt, i18n.language, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                ·{' '}
                {t(next.kind === 'ticket' ? 'profile.nextTickets' : 'profile.nextParticipants', {
                  count: next.count,
                })}
              </span>
              {next.place && (
                <span className="mt-1 flex items-center gap-1.5 text-[13px] text-ink/70 min-w-0">
                  <MapPin size={14} className="shrink-0" aria-hidden="true" />
                  <span className="truncate">{next.place}</span>
                </span>
              )}
            </span>
            <ChevronRight size={18} className="text-ink/40 mt-1 shrink-0" aria-hidden="true" />
          </button>
        </section>
      )}
      <div className="grid grid-cols-2 gap-3">
        <ShortcutTile
          icon={<Ticket size={18} aria-hidden="true" />}
          label={t('profile.tiles.tickets')}
          value={count(wallet.loading && wallet.tickets.length === 0, upcomingTickets.length)}
          hint={t('profile.ticketsHint', { count: upcomingTickets.length })}
          onClick={onOpenTickets}
        />
        <ShortcutTile
          icon={<Compass size={18} aria-hidden="true" />}
          label={t('profile.tiles.bookings')}
          value={count(bookings.loading && bookings.data.length === 0, upcomingBookings.length)}
          hint={t('profile.bookingsHint', { count: upcomingBookings.length })}
          onClick={onOpenBookings}
        />
        <ShortcutTile
          icon={<Heart size={18} aria-hidden="true" />}
          label={t('profile.tiles.favorites')}
          value={count(favoritesLoading && favorites.length === 0, favorites.length)}
          hint={t('profile.favoritesHint', { count: favorites.length })}
          onClick={onOpenFavorites}
        />
        <ShortcutTile
          icon={<Star size={18} aria-hidden="true" />}
          label={t('profile.tiles.reviews')}
          value={count(
            reviews.loading && reviews.data.length === 0,
            reviews.data.length,
            reviews.hasMore
          )}
          hint={t('profile.reviewsHint', { count: reviews.data.length })}
          onClick={onOpenReviews}
        />
      </div>
    </div>
  );
}

=== src/app/menu/SideMenu.tsx — diff ===
@@ -22,6 +22,8 @@ import { SidebarLayout } from '../../ui/layouts/SidebarLayout';
 import { MyBookingsView } from '../../domain/bookings';
 import { UserTicketsHistoryView } from '../../domain/ticketing';
 import { BuyerPurchasesComposition } from '../compositions/BuyerPurchasesComposition';
+import { MyReviewsComposition } from '../compositions/MyReviewsComposition';
+import { ProfileHighlightsComposition } from '../compositions/ProfileHighlightsComposition';
 import { type MenuView, parentMenuView, visibleMenuView } from './menuViews';
 import { useSideMenu } from './useSideMenu';
 import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
@@ -40,9 +42,16 @@ const FULL_HEIGHT_VIEWS: readonly MenuView[] = [
   'about',
 ];
 
-const SETTINGS_VIEWS: readonly MenuView[] = ['settings', 'purchases', 'language', 'appearance'];
+const SETTINGS_VIEWS: readonly MenuView[] = [
+  'settings',
+  'purchases',
+  'language',
+  'appearance',
+  'support',
+  'about',
+];
 
-/** Compõe as telas de vários domínios (usuário, ingressos, reservas, compras, favoritos, conteúdo) no menu. */
+/** Compõe as telas de vários domínios (perfil, ingressos, reservas, compras, favoritos, avaliações, conteúdo) no menu. */
 export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
   const { user } = useAuthContext();
   const { goTo } = useLocalizedRouting();
@@ -72,6 +81,7 @@ export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
   const {
     userData,
     setUserData,
+    memberSince,
     passwordData,
     setPasswordData,
     showPasswords,
@@ -139,6 +149,8 @@ export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
             onBack={goBack}
             onOpenLanguage={() => showView('language')}
             onOpenAppearance={() => showView('appearance')}
+            onOpenSupport={() => showView('support')}
+            onOpenAbout={() => showView('about')}
             onOpenPurchases={user ? () => showView('purchases') : undefined}
           />
         );
@@ -171,6 +183,8 @@ export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
         return <UserTicketsHistoryView onBack={goBack} />;
       case 'bookings':
         return <MyBookingsView onBack={goBack} />;
+      case 'reviews':
+        return <MyReviewsComposition onBack={goBack} />;
       case 'favorites':
         return <FavoritesList onBack={goBack} onSelectItem={closeMenuAndOpenItem} />;
       case 'account':
@@ -205,21 +219,27 @@ export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
             <MainMenuView
               user={menuUser}
               userData={userData}
+              memberSince={memberSince}
               isAdmin={isAdmin}
               isPartner={isPartner}
               isUploading={isUploading}
+              photoURL={photoURL}
               onClose={closeMenu}
               onAccountOpen={() => showView('account')}
-              onFavoritesOpen={() => showView('favorites')}
-              onTicketsOpen={() => showView('tickets')}
-              onBookingsOpen={() => showView('bookings')}
               onPartnersOpen={onPartnersOpen}
-              onAboutOpen={() => showView('about')}
-              onSupportOpen={() => showView('support')}
               onAdminOpen={onAdminOpen}
               onLogout={handleLogout}
               onPhotoClick={() => fileInputRef.current?.click()}
-              photoURL={photoURL}
+              highlights={
+                menuUser && (
+                  <ProfileHighlightsComposition
+                    onOpenTickets={() => showView('tickets')}
+                    onOpenBookings={() => showView('bookings')}
+                    onOpenFavorites={() => showView('favorites')}
+                    onOpenReviews={() => showView('reviews')}
+                  />
+                )
+              }
             />
             <input
               type="file"

=== src/app/menu/menuViews.test.ts — diff ===
@@ -25,6 +25,9 @@ describe('sub-telas do menu', () => {
     expect(parentMenuView('language')).toBe('settings');
     expect(parentMenuView('appearance')).toBe('settings');
     expect(parentMenuView('purchases')).toBe('settings');
+    expect(parentMenuView('support')).toBe('settings');
+    expect(parentMenuView('about')).toBe('settings');
+    expect(parentMenuView('reviews')).toBe('main');
     expect(parentMenuView('password')).toBe('account');
     expect(parentMenuView('favorites')).toBe('main');
     expect(parentMenuView('bookings')).toBe('main');
@@ -38,6 +41,7 @@ describe('sub-telas do menu', () => {
       'tickets',
       'bookings',
       'favorites',
+      'reviews',
       'purchases',
     ] as const) {
       expect(visibleMenuView(view, false)).toBe('main');

=== src/app/menu/menuViews.ts — diff ===
@@ -9,6 +9,7 @@ export const MENU_VIEWS = [
   'tickets',
   'bookings',
   'favorites',
+  'reviews',
   'settings',
   'purchases',
   'language',
@@ -27,12 +28,13 @@ const PARENT_VIEW: Record<Exclude<MenuView, 'main'>, MenuView> = {
   tickets: 'main',
   bookings: 'main',
   favorites: 'main',
+  reviews: 'main',
   settings: 'main',
   purchases: 'settings',
   language: 'settings',
   appearance: 'settings',
-  support: 'main',
-  about: 'main',
+  support: 'settings',
+  about: 'settings',
 };
 
 /** Sub-telas com dados do próprio usuário: sem login, o menu mostra a tela principal (com o login). */
@@ -42,6 +44,7 @@ const PRIVATE_VIEWS: readonly MenuView[] = [
   'tickets',
   'bookings',
   'favorites',
+  'reviews',
   'purchases',
 ];

=== src/domain/bookings/index.ts — diff ===
@@ -7,6 +7,7 @@ export {
   type BookingClaimSale,
 } from './components/buyer/BookingPurchaseDetails';
 export { useBookingPurchases } from './hooks/useBookingPurchases';
+export { useMyBookings } from './hooks/useMyBookings';
 export type { PaymentElementSlotProps, RenderPaymentElement } from './components/buyer/types';
 export { PartnerOffersManager } from './components/partner/PartnerOffersManager';
 export { isBookableCategory } from './utils/offerKindByCategory';

=== src/domain/favorites/index.ts — diff ===
@@ -1,6 +1,7 @@
 export { addFavoriteUseCase } from './application/usecases/addFavoriteUseCase';
 export { removeFavoriteUseCase } from './application/usecases/removeFavoriteUseCase';
 export { subscribeUserFavoritesUseCase } from './application/usecases/subscribeUserFavoritesUseCase';
+export { useFavorites } from './hooks/useFavorites';
 export type { FavoriteItem, FavoriteItemDetails } from './types/favorite';
 
 // Componente público apenas para src/app/compositions (AGENTS.md §5.2 item 5).

=== src/domain/reviews/adapters/firestoreReviewAdapter.ts — diff ===
@@ -24,7 +24,6 @@ function getOrderClauses(sortBy: ReviewSortOption): DatabaseOrderClause[] {
         { field: 'rating', direction: 'asc' },
         { field: 'createdAt', direction: 'desc' },
       ];
-    case 'recent':
     default:
       return [{ field: 'createdAt', direction: 'desc' }];
   }
@@ -156,37 +155,17 @@ export class FirestoreReviewAdapter implements ReviewPort {
     }
   }
 
-  async getUserAllReviews(userId: string): Promise<FirestoreReview[]> {
-    return queryDocumentsUseCase<FirestoreReview>(
-      'reviews',
-      [
-        {
-          field: 'userId',
-          op: '==',
-          value: userId,
-        },
-      ],
-      [{ field: 'createdAt', direction: 'desc' }]
-    );
-  }
-
-  subscribeToUserReviews(
+  async listUserReviews(
     userId: string,
-    onUpdate: (reviews: FirestoreReview[]) => void,
-    onError?: (error: Error) => void
-  ): () => void {
-    return subscribeToCollectionUseCase<FirestoreReview>(
+    limitCount: number,
+    cursor?: DatabaseCursor | null
+  ): Promise<DatabasePage<FirestoreReview>> {
+    return queryDocumentsPageUseCase<FirestoreReview>(
       'reviews',
-      onUpdate,
-      onError,
-      [
-        {
-          field: 'userId',
-          op: '==',
-          value: userId,
-        },
-      ],
-      [{ field: 'createdAt', direction: 'desc' }]
+      [{ field: 'userId', op: '==', value: userId }],
+      [{ field: 'createdAt', direction: 'desc' }],
+      limitCount,
+      cursor
     );
   }

=== src/domain/reviews/application/usecases/deleteReviewUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';
import { reviewAdapter } from '../../factory';

const schema = z.string().trim().min(1);

/** Exclui a avaliação pelo backend, que confere se ela é da pessoa e recalcula a nota do lugar. */
export function deleteReviewUseCase(reviewId: string): Promise<void> {
  return reviewAdapter.deleteReview(schema.parse(reviewId));
}

=== src/domain/reviews/application/usecases/listMyReviewsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';
import type { DatabaseCursor, DatabasePage } from '../../../database/ports/databasePort';
import { reviewAdapter } from '../../factory';
import type { FirestoreReview } from '../../types/review';

const MAX_PAGE_SIZE = 50;
const schema = z.object({
  userId: z.string().trim().min(1),
  limit: z.number().int().min(1).max(MAX_PAGE_SIZE),
});

/** Avaliações da própria pessoa, mais novas primeiro, paginadas por cursor (AGENTS.md §6.4). */
export function listMyReviewsUseCase(
  userId: string,
  limit: number,
  cursor?: DatabaseCursor | null
): Promise<DatabasePage<FirestoreReview>> {
  const data = schema.parse({ userId, limit });
  return reviewAdapter.listUserReviews(data.userId, data.limit, cursor);
}

=== src/domain/reviews/components/StarRating.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../shared/utils/cn';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  inactiveColorClass?: string;
}

export function StarRating({
  rating,
  size = 14,
  interactive = false,
  onRatingChange,
  inactiveColorClass = 'text-ink/30',
}: StarRatingProps) {
  const { t } = useTranslation();
  if (interactive) {
    return (
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label={t('myReviews.ratingLabel')}
      >
        {[1, 2, 3, 4, 5].map((s) => {
          const isSelected = s <= rating;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onRatingChange?.(s)}
              className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50 transition-all"
              aria-label={t('myReviews.rateWith', { count: s })}
              aria-checked={isSelected}
              role="radio"
            >
              <Star
                size={size}
                fill={isSelected ? 'currentColor' : 'none'}
                className={cn('transition-colors', isSelected ? 'text-warn' : inactiveColorClass)}
              />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-0.5"
      aria-label={t('myReviews.stars', { value: rating })}
      role="img"
    >
      {[1, 2, 3, 4, 5].map((s) => {
        const fillPercent = Math.max(0, Math.min(100, (rating - (s - 1)) * 100));

        if (fillPercent >= 100) {
          return <Star key={s} size={size} fill="currentColor" className="text-warn shrink-0" />;
        }

        if (fillPercent <= 0) {
          return (
            <Star key={s} size={size} fill="none" className={cn('shrink-0', inactiveColorClass)} />
          );
        }

        return (
          <div
            key={s}
            className="relative inline-block shrink-0"
            style={{ width: size, height: size }}
          >
            <Star size={size} fill="none" className={cn('absolute inset-0', inactiveColorClass)} />
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: `${fillPercent}%`, height: size }}
            >
              <Star size={size} fill="currentColor" className="text-warn" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

=== src/domain/reviews/components/mine/EditReviewSheet.tsx — ARQUIVO NOVO, conteúdo completo ===
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { BUTTON_PRIMARY, INPUT } from '../../../../ui/styles/controls';
import { type EditReviewForm, editReviewSchema } from '../../schemas/editReviewSchema';
import type { FirestoreReview } from '../../types/review';
import { StarRating } from '../StarRating';

interface EditReviewSheetProps {
  review: FirestoreReview;
  title: string;
  onClose: () => void;
  onSave: (rating: number, comment: string) => Promise<void>;
}

/** Folha para editar nota e texto; salvar grava por cima da mesma avaliação. */
export function EditReviewSheet({ review, title, onClose, onSave }: EditReviewSheetProps) {
  const { t } = useTranslation();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditReviewForm>({
    resolver: zodResolver(editReviewSchema),
    defaultValues: { rating: review.rating, comment: review.comment },
  });

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t('myReviews.editTitle')}
      description={title}
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit((data) => onSave(data.rating, data.comment))}
      >
        <fieldset>
          <legend className="text-[13px] font-semibold text-ink/70 mb-1">
            {t('myReviews.ratingLabel')}
          </legend>
          <Controller
            control={control}
            name="rating"
            render={({ field }) => (
              <StarRating
                rating={field.value}
                size={26}
                interactive
                onRatingChange={field.onChange}
              />
            )}
          />
          {errors.rating?.message && (
            <p role="alert" className="mt-1 text-xs text-danger">
              {t(errors.rating.message)}
            </p>
          )}
        </fieldset>
        <label className="block">
          <span className="block text-[13px] font-semibold text-ink/70 mb-1">
            {t('myReviews.commentLabel')}
          </span>
          <textarea
            {...register('comment')}
            rows={4}
            maxLength={500}
            className={`${INPUT} min-h-28 py-2.5`}
          />
          {errors.comment?.message && (
            <span role="alert" className="mt-1 block text-xs text-danger">
              {t(errors.comment.message)}
            </span>
          )}
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${BUTTON_PRIMARY} w-full min-h-12`}
        >
          {isSubmitting ? t('myReviews.saving') : t('myReviews.save')}
        </button>
      </form>
    </Dialog>
  );
}

=== src/domain/reviews/components/mine/MyReviewCard.tsx — ARQUIVO NOVO, conteúdo completo ===
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDay } from '../../../../shared/utils/businessDateTime';
import { DropdownMenu, type DropdownMenuItem } from '../../../../ui/components/DropdownMenu';
import type { FirestoreReview } from '../../types/review';
import { reviewDateToIso } from '../../utils/reviewDateToIso';
import { StarRating } from '../StarRating';

interface MyReviewCardProps {
  review: FirestoreReview;
  title: string;
  onEdit: () => void;
  onDelete: () => void;
  /** Opções a mais no menu "…", montadas por quem usa o cartão. */
  extraMenuItems?: DropdownMenuItem[];
  /** Linha de status abaixo da resposta (ex.: denúncia em análise). */
  footer?: ReactNode;
}

/** Uma avaliação da própria pessoa (D19): lugar, nota, texto, resposta e o menu "…". */
export function MyReviewCard({
  review,
  title,
  onEdit,
  onDelete,
  extraMenuItems = [],
  footer,
}: MyReviewCardProps) {
  const { t, i18n } = useTranslation();
  const createdAt = reviewDateToIso(review.createdAt);
  const date = createdAt ? formatBusinessDay(createdAt, i18n.language) : '';
  return (
    <li className="p-4 rounded-[20px] bg-surface border border-line">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-ink leading-snug break-words">{title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <StarRating rating={review.rating} />
            <span className="text-[13px] text-ink/70">
              {review.verifiedAttendance ? t('myReviews.verified', { date }) : date}
            </span>
          </div>
        </div>
        <DropdownMenu
          trigger={
            <button
              type="button"
              aria-label={t('myReviews.moreOptions')}
              className="press w-11 h-11 -mt-2 -mr-2 shrink-0 rounded-full flex items-center justify-center text-ink/70 hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
            >
              <MoreHorizontal size={20} aria-hidden="true" />
            </button>
          }
          items={[
            {
              label: t('myReviews.edit'),
              icon: <Pencil size={16} aria-hidden="true" />,
              onClick: onEdit,
            },
            ...extraMenuItems,
            {
              label: t('myReviews.delete'),
              icon: <Trash2 size={16} aria-hidden="true" />,
              onClick: onDelete,
              destructive: true,
            },
          ]}
        />
      </div>
      <p className="mt-2 text-sm text-ink/80 break-words">{review.comment}</p>
      {review.partnerResponse && (
        <div className="mt-3 p-3 rounded-2xl bg-ink/[0.04]">
          <p className="text-[13px] font-semibold text-ink">{t('myReviews.partnerResponse')}</p>
          <p className="text-[13px] text-ink/70 break-words">{review.partnerResponse}</p>
        </div>
      )}
      {footer && <div className="mt-3">{footer}</div>}
    </li>
  );
}

=== src/domain/reviews/components/mine/MyReviewsView.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { MyReviewsSource } from '../../hooks/useMyReviews';
import type { FirestoreReview } from '../../types/review';
import { MyReviewsView } from './MyReviewsView';

const REVIEW: FirestoreReview = {
  id: 'items_tamarindo_u1',
  itemId: 'tamarindo',
  itemCollection: 'items',
  userId: 'u1',
  userName: 'Ana',
  rating: 5,
  comment: 'Peixe fresco.',
  createdAt: '2026-10-12T15:00:00.000Z',
  verifiedAttendance: true,
  partnerResponse: 'Obrigado, Ana!',
};

function source(data: FirestoreReview[]): MyReviewsSource {
  return {
    data,
    loading: false,
    error: null,
    hasMore: false,
    reload: vi.fn(async () => undefined),
    loadMore: vi.fn(async () => undefined),
    remove: vi.fn(async () => undefined),
    save: vi.fn(async () => undefined),
  };
}

function openMenu() {
  // O Radix abre o menu no pointerdown, não no click.
  const trigger = screen.getByRole('button', { name: 'Mais opções' });
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: 'mouse' });
}

describe('Minhas avaliações', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('cada avaliação em um cartão, com o nome do lugar, o selo e a resposta', () => {
    render(
      <MyReviewsView
        source={source([REVIEW])}
        onBack={vi.fn()}
        titleOf={() => 'Restaurante Tamarindo'}
      />
    );
    expect(screen.getByText('Restaurante Tamarindo')).toBeTruthy();
    expect(screen.getByText(/Experiência verificada/)).toBeTruthy();
    expect(screen.getByText('Resposta do estabelecimento')).toBeTruthy();
    expect(screen.getByRole('img', { name: '5 de 5 estrelas' })).toBeTruthy();
  });

  it('lugar fora do guia mostra o aviso no lugar do nome', () => {
    render(<MyReviewsView source={source([REVIEW])} onBack={vi.fn()} titleOf={() => undefined} />);
    expect(screen.getByText('Lugar fora do guia')).toBeTruthy();
  });

  it('excluir pede confirmação e só então chama o backend', async () => {
    const src = source([REVIEW]);
    render(<MyReviewsView source={src} onBack={vi.fn()} titleOf={() => 'Tamarindo'} />);
    openMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: /Excluir/ }));
    expect(src.remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(src.remove).toHaveBeenCalledWith(REVIEW.id));
    expect(await screen.findByText('Avaliação excluída.')).toBeTruthy();
  });

  it('editar abre a folha com a nota e o texto e salva por cima', async () => {
    const src = source([REVIEW]);
    render(<MyReviewsView source={src} onBack={vi.fn()} titleOf={() => 'Tamarindo'} />);
    openMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: /Editar/ }));
    const comment = screen.getByRole('textbox');
    expect((comment as HTMLTextAreaElement).value).toBe('Peixe fresco.');
    fireEvent.click(screen.getByRole('radio', { name: 'Dar 4 estrelas' }));
    fireEvent.change(comment, { target: { value: 'Bom, mas demorou.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(src.save).toHaveBeenCalledWith(REVIEW, 4, 'Bom, mas demorou.'));
  });

  it('comentário vazio não salva e mostra a mensagem traduzida', async () => {
    const src = source([REVIEW]);
    render(<MyReviewsView source={src} onBack={vi.fn()} titleOf={() => 'Tamarindo'} />);
    openMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: /Editar/ }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Escreva um comentário sobre sua experiência.')).toBeTruthy();
    expect(src.save).not.toHaveBeenCalled();
  });
});

=== src/domain/reviews/components/mine/MyReviewsView.tsx — ARQUIVO NOVO, conteúdo completo ===
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import type { DropdownMenuItem } from '../../../../ui/components/DropdownMenu';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import type { MyReviewsSource } from '../../hooks/useMyReviews';
import type { FirestoreReview } from '../../types/review';
import { EditReviewSheet } from './EditReviewSheet';
import { MyReviewCard } from './MyReviewCard';

interface MyReviewsViewProps {
  source: MyReviewsSource;
  onBack: () => void;
  /** Nome do lugar ou evento, vindo do guia pela composição; `undefined` se não está mais no guia. */
  titleOf: (review: FirestoreReview) => string | undefined;
  /** Slots da composição para ações de outros domínios no menu "…" e no rodapé do cartão. */
  extraMenuItems?: (review: FirestoreReview) => DropdownMenuItem[];
  renderFooter?: (review: FirestoreReview) => ReactNode;
}

/** Minhas avaliações (D19): um cartão por avaliação, com editar e excluir no menu "…". */
export function MyReviewsView({
  source,
  onBack,
  titleOf,
  extraMenuItems,
  renderFooter,
}: MyReviewsViewProps) {
  const { t } = useTranslation();
  const { data, loading, error, hasMore, reload, loadMore, remove, save } = source;
  const [editing, setEditing] = useState<FirestoreReview | null>(null);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const title = (review: FirestoreReview) => titleOf(review) ?? t('myReviews.unknownPlace');

  const askDelete = (review: FirestoreReview) =>
    setConfirm({
      message: t('myReviews.deleteConfirm'),
      confirmLabel: t('myReviews.delete'),
      onCancel: () => setConfirm(null),
      onConfirm: async () => {
        setConfirm(null);
        try {
          await remove(review.id);
          setNotice({ tone: 'ok', text: t('myReviews.deleted') });
        } catch {
          setNotice({ tone: 'error', text: t('myReviews.errors.delete') });
        }
      },
    });

  return (
    <section className="w-full space-y-5">
      <div className="flex items-center gap-2">
        <BackButton label={t('myReviews.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('myReviews.title')}</h2>
      </div>
      {notice && (
        <p
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={notice.tone === 'error' ? 'text-sm text-danger' : 'text-sm text-accent'}
        >
          {notice.text}
        </p>
      )}
      {error && <ListError message={error} onRetry={() => void reload()} />}
      {!error && !loading && data.length === 0 && <ListEmpty message={t('myReviews.empty')} />}
      {data.length > 0 && (
        <ul className="space-y-3">
          {data.map((review) => (
            <MyReviewCard
              key={review.id}
              review={review}
              title={title(review)}
              onEdit={() => {
                setNotice(null);
                setEditing(review);
              }}
              onDelete={() => askDelete(review)}
              extraMenuItems={extraMenuItems?.(review)}
              footer={renderFooter?.(review)}
            />
          ))}
        </ul>
      )}
      {loading && <ListLoading label={t('myReviews.loading')} />}
      {!loading && hasMore && (
        <button type="button" onClick={() => void loadMore()} className={BUTTON_SECONDARY}>
          {t('myReviews.loadMore')}
        </button>
      )}
      {editing && (
        <EditReviewSheet
          review={editing}
          title={title(editing)}
          onClose={() => setEditing(null)}
          onSave={async (rating, comment) => {
            try {
              await save(editing, rating, comment);
              setEditing(null);
              setNotice({ tone: 'ok', text: t('myReviews.saved') });
            } catch {
              setEditing(null);
              setNotice({ tone: 'error', text: t('myReviews.errors.save') });
            }
          }}
        />
      )}
      <ConfirmDialog data={confirm} />
    </section>
  );
}

=== src/domain/reviews/hooks/useMyReviews.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../auth';
import type { DatabaseCursor } from '../../database/ports/databasePort';
import { deleteReviewUseCase } from '../application/usecases/deleteReviewUseCase';
import { listMyReviewsUseCase } from '../application/usecases/listMyReviewsUseCase';
import { submitReviewUseCase } from '../application/usecases/submitReviewUseCase';
import type { FirestoreReview } from '../types/review';

const PAGE_SIZE = 20;

/** Avaliações da pessoa logada, com editar e excluir pelo backend. */
export function useMyReviews() {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const uid = user?.uid ?? null;
  const [data, setData] = useState<FirestoreReview[]>([]);
  const [cursor, setCursor] = useState<DatabaseCursor | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (from: DatabaseCursor | null) => {
      if (!uid) {
        setData([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const page = await listMyReviewsUseCase(uid, PAGE_SIZE, from);
        setData((current) => (from ? [...current, ...page.items] : page.items));
        setCursor(page.cursor);
        setHasMore(page.hasMore);
      } catch (err: unknown) {
        console.error('[useMyReviews]', err instanceof Error ? err.name : 'UnknownError');
        setError(t('myReviews.errors.load'));
      } finally {
        setLoading(false);
      }
    },
    [uid, t]
  );

  useEffect(() => {
    void load(null);
  }, [load]);

  const remove = useCallback(async (reviewId: string) => {
    await deleteReviewUseCase(reviewId);
    setData((current) => current.filter((review) => review.id !== reviewId));
  }, []);

  const save = useCallback(async (review: FirestoreReview, rating: number, comment: string) => {
    await submitReviewUseCase(review.itemId, rating, comment, review.itemCollection, {
      occurrenceId: review.occurrenceId,
      ticketId: review.ticketId,
    });
    setData((current) =>
      current.map((candidate) =>
        candidate.id === review.id ? { ...candidate, rating, comment: comment.trim() } : candidate
      )
    );
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    reload: () => load(null),
    loadMore: () => load(cursor),
    remove,
    save,
  };
}

export type MyReviewsSource = ReturnType<typeof useMyReviews>;

=== src/domain/reviews/index.ts — diff ===
@@ -11,6 +11,11 @@ export { subscribeToReviewsUseCase } from './application/usecases/subscribeToRev
 export { submitReviewUseCase } from './application/usecases/submitReviewUseCase';
 export { respondToReviewUseCase } from './application/usecases/respondToReviewUseCase';
 export { useReviews } from './hooks/useReviews';
+export { useMyReviews } from './hooks/useMyReviews';
+export { listMyReviewsUseCase } from './application/usecases/listMyReviewsUseCase';
+export { deleteReviewUseCase } from './application/usecases/deleteReviewUseCase';
+// Componente público apenas para src/app/compositions (AGENTS.md §5.2 item 5).
+export { MyReviewsView } from './components/mine/MyReviewsView';
 export { ReviewSection } from './components/ReviewSection';
 export { ReviewCard } from './components/ReviewCard';
 export { ReviewForm } from './components/ReviewForm';

=== src/domain/reviews/ports/reviewPort.ts — diff ===
@@ -38,13 +38,11 @@ export interface ReviewPort {
 
   respondToReview(reviewId: string, partnerResponse: string): Promise<void>;
 
-  getUserAllReviews(userId: string): Promise<FirestoreReview[]>;
-
-  subscribeToUserReviews(
+  listUserReviews(
     userId: string,
-    onUpdate: (reviews: FirestoreReview[]) => void,
-    onError?: (error: Error) => void
-  ): () => void;
+    limitCount: number,
+    cursor?: DatabaseCursor | null
+  ): Promise<DatabasePage<FirestoreReview>>;
 
   deleteReview(reviewId: string): Promise<void>;
 }

=== src/domain/reviews/schemas/editReviewSchema.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';

/** Mensagens são chaves de tradução; o formulário mostra `t(error.message)` (AGENTS.md §12.5). */
export const editReviewSchema = z.object({
  rating: z.number().int().min(1, 'myReviews.ratingRequired').max(5, 'myReviews.ratingRequired'),
  comment: z
    .string()
    .trim()
    .min(1, 'myReviews.commentRequired')
    .max(500, 'myReviews.commentTooLong'),
});

export type EditReviewForm = z.infer<typeof editReviewSchema>;

=== src/domain/reviews/utils/reviewDateToIso.ts — ARQUIVO NOVO, conteúdo completo ===
import type { ReviewDateValue } from '../types/review';

type RawDate = ReviewDateValue | { toDate?: () => Date; seconds?: number };

/** Data da avaliação em ISO, qualquer que seja o formato vindo do Firestore; `null` se não der. */
export function reviewDateToIso(value: RawDate): string | null {
  if (!value) return null;
  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'object' && typeof value.toDate === 'function') {
    date = value.toDate();
  } else if (typeof value === 'object' && typeof value.seconds === 'number') {
    date = new Date(value.seconds * 1000);
  } else {
    date = new Date(value as string | number);
  }
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

=== src/domain/user/components/MainMenuView.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { UserRole } from '../../auth/types/auth';
import { MainMenuView } from './MainMenuView';

vi.mock('../../auth', () => ({ useAuth: () => ({ loginWithGoogle: vi.fn() }) }));

const USER = {
  uid: 'u1',
  email: 'ana@example.com',
  displayName: 'Ana Souza',
  photoURL: null,
  emailVerified: true,
  role: UserRole.USER,
  isAnonymous: false,
};

function renderMenu(overrides: Partial<Parameters<typeof MainMenuView>[0]> = {}) {
  const props = {
    user: USER,
    userData: { firstName: 'Ana', lastName: 'Souza' },
    memberSince: '2026-03-10T12:00:00.000Z',
    isAdmin: false,
    isPartner: false,
    isUploading: false,
    photoURL: null,
    onClose: vi.fn(),
    onAccountOpen: vi.fn(),
    onPartnersOpen: vi.fn(),
    onAdminOpen: vi.fn(),
    onLogout: vi.fn(),
    onPhotoClick: vi.fn(),
    highlights: <p>destaques</p>,
    ...overrides,
  };
  render(<MainMenuView {...props} />);
  return props;
}

describe('menu lateral como perfil (D19)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('com login: nome, desde quando, destaques, Minha conta, Seja parceiro e Sair; sem Suporte nem Sobre', () => {
    const props = renderMenu();
    expect(screen.getByRole('heading', { name: 'Ana Souza' })).toBeTruthy();
    expect(screen.getByText('No Use Guide desde março de 2026')).toBeTruthy();
    expect(screen.getByText('destaques')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Minha conta' }));
    expect(props.onAccountOpen).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Seja parceiro' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Sair da conta' }));
    expect(props.onLogout).toHaveBeenCalled();
    expect(screen.queryByText(/Suporte/)).toBeNull();
    expect(screen.queryByText(/Sobre o app/)).toBeNull();
  });

  it('parceiro vê Meu painel no lugar de Seja parceiro', () => {
    const props = renderMenu({ isPartner: true });
    expect(screen.queryByRole('button', { name: 'Seja parceiro' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Meu painel' }));
    expect(props.onAdminOpen).toHaveBeenCalled();
  });

  it('sem login: entrar por e-mail ou Google, sem os destaques', () => {
    renderMenu({ user: null });
    expect(screen.getByRole('heading', { name: 'Entrar ou cadastrar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Continuar com Google/ })).toBeTruthy();
    expect(screen.queryByText('destaques')).toBeNull();
  });
});

=== src/domain/user/components/MainMenuView.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { Handshake, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../shared/utils/businessDateTime';
import { getUserInitials } from '../../../shared/utils/formatters';
import { BackButton } from '../../../ui/components/BackButton';
import { TextButton } from '../../../ui/components/TextButton';
import type { UserSession } from '../../auth/types/auth';
import { MenuRow } from './menu/MenuRow';
import { ProfileAvatar } from './menu/ProfileAvatar';
import { SignInPanel } from './menu/SignInPanel';

interface MainMenuViewProps {
  user: UserSession | null;
  userData: { firstName: string; lastName: string };
  /** Data de criação da conta (ISO), para "No Use Guide desde…". */
  memberSince: string | null;
  isAdmin: boolean;
  isPartner: boolean;
  isUploading: boolean;
  photoURL: string | null;
  onClose: () => void;
  onAccountOpen: () => void;
  onPartnersOpen: () => void;
  onAdminOpen: () => void;
  onLogout: () => void;
  onPhotoClick: () => void;
  /** "Próximo" e os cartões de ingressos, reservas, favoritos e avaliações, da composição. */
  highlights?: ReactNode;
}

/** Tela principal do menu (D19): perfil com login; sem login, entrar ou cadastrar. */
export function MainMenuView({
  user,
  userData,
  memberSince,
  isAdmin,
  isPartner,
  isUploading,
  photoURL,
  onClose,
  onAccountOpen,
  onPartnersOpen,
  onAdminOpen,
  onLogout,
  onPhotoClick,
  highlights,
}: MainMenuViewProps) {
  const { t, i18n } = useTranslation();
  const fullName = userData.firstName ? `${userData.firstName} ${userData.lastName}`.trim() : '';
  const name = fullName || user?.displayName || t('menu.userFallback');

  return (
    <>
      <div className="mb-4 pr-12">
        <BackButton label={t('menu.closeMenu')} onClick={onClose} />
      </div>
      {user ? (
        <div className="space-y-5">
          <div className="flex flex-col items-center text-center">
            <ProfileAvatar
              photoURL={photoURL}
              initials={getUserInitials(user.displayName || fullName, user.email)}
              isUploading={isUploading}
              onPhotoClick={onPhotoClick}
            />
            <h2 className="mt-3 text-2xl font-display font-bold text-ink break-words">{name}</h2>
            {memberSince && (
              <p className="text-[13px] text-ink/70">
                {t('profile.memberSince', {
                  date: formatBusinessDate(memberSince, i18n.language, {
                    month: 'long',
                    year: 'numeric',
                  }),
                })}
              </p>
            )}
          </div>
          {highlights}
          <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
            <MenuRow icon={User} label={t('profile.account')} onClick={onAccountOpen} />
            {isAdmin || isPartner ? (
              <MenuRow
                icon={Handshake}
                label={isAdmin ? t('menu.managementPanel') : t('menu.myPanel')}
                onClick={onAdminOpen}
              />
            ) : (
              <MenuRow
                icon={Handshake}
                label={t('profile.partnerProgram')}
                onClick={onPartnersOpen}
              />
            )}
          </ul>
          <div className="pt-4 flex justify-center">
            <TextButton tone="danger" onClick={onLogout}>
              {t('profile.logout')}
            </TextButton>
          </div>
        </div>
      ) : (
        <SignInPanel onPartnersOpen={onPartnersOpen} />
      )}
    </>
  );
}

=== src/domain/user/components/SettingsView.tsx — diff ===
@@ -1,5 +1,7 @@
 import {
   ChevronRight,
+  HelpCircle,
+  Info,
   Languages,
   Monitor,
   Moon,
@@ -16,6 +18,8 @@ interface SettingsViewProps {
   onBack: () => void;
   onOpenLanguage: () => void;
   onOpenAppearance: () => void;
+  onOpenSupport: () => void;
+  onOpenAbout: () => void;
   /** Só com login: o histórico de compras é da conta. */
   onOpenPurchases?: () => void;
 }
@@ -51,6 +55,8 @@ export function SettingsView({
   onBack,
   onOpenLanguage,
   onOpenAppearance,
+  onOpenSupport,
+  onOpenAbout,
   onOpenPurchases,
 }: SettingsViewProps) {
   const { t } = useTranslation();
@@ -87,6 +93,11 @@ export function SettingsView({
           onClick={onOpenLanguage}
         />
       </ul>
+
+      <ul className="mt-4 rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
+        <SettingsRow icon={HelpCircle} label={t('settings.support')} onClick={onOpenSupport} />
+        <SettingsRow icon={Info} label={t('settings.about')} onClick={onOpenAbout} />
+      </ul>
     </div>
   );
 }

=== src/domain/user/components/menu/MenuRow.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ChevronRight, type LucideIcon } from 'lucide-react';

/** Linha de lista em cartão (D17), a mesma de Configurações. */
export function MenuRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
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
        <ChevronRight size={18} className="text-ink/40 shrink-0" aria-hidden="true" />
      </button>
    </li>
  );
}

=== src/domain/user/components/menu/ProfileAvatar.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Camera, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';

interface ProfileAvatarProps {
  photoURL: string | null;
  initials: string;
  isUploading: boolean;
  onPhotoClick: () => void;
}

/** Foto do perfil com troca ao toque (o mesmo desenho de antes, com as cores do tema). */
export function ProfileAvatar({
  photoURL,
  initials,
  isUploading,
  onPhotoClick,
}: ProfileAvatarProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onPhotoClick}
      disabled={isUploading}
      aria-label={t('menu.changeProfilePhoto')}
      className="group press relative w-28 h-28 p-1.5 rounded-[2.5rem] border-2 border-accent-line bg-surface overflow-hidden focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
    >
      {photoURL ? (
        <img src={photoURL} alt="" className="w-full h-full rounded-[2rem] object-cover" />
      ) : initials ? (
        <span className="w-full h-full flex items-center justify-center rounded-[2rem] bg-accent-soft text-accent font-display font-bold text-3xl uppercase tracking-wider select-none">
          {initials}
        </span>
      ) : (
        <span className="w-full h-full flex items-center justify-center rounded-[2rem] bg-accent-soft text-accent">
          <User size={48} aria-hidden="true" />
        </span>
      )}
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-scrim opacity-0 group-hover:opacity-100 transition-opacity',
          isUploading && 'opacity-100'
        )}
      >
        {isUploading ? (
          <span className="flex gap-1.5 items-center" role="status">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, delay: i * 0.15 }}
                className="w-2 h-2 rounded-full bg-[#fff8f0]"
              />
            ))}
          </span>
        ) : (
          <Camera size={20} className="text-[#fff8f0]" aria-hidden="true" />
        )}
      </span>
    </button>
  );
}

=== src/domain/user/components/menu/SignInPanel.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Handshake, Mail } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { useAuth } from '../../../auth';
import { MenuRow } from './MenuRow';

function authErrorKey(code: unknown): string | null {
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return null;
  if (code === 'auth/popup-blocked') return 'menu.authErrors.popupBlocked';
  if (code === 'auth/unauthorized-domain') return 'menu.authErrors.unauthorizedDomain';
  return 'menu.authErrors.generic';
}

/** Menu sem login: entrar por e-mail ou Google e o convite para parceiros. */
export function SignInPanel({ onPartnersOpen }: { onPartnersOpen: () => void }) {
  const { t } = useTranslation();
  const { openLoginModal } = useUI();
  const { loginWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorKey(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const code = typeof err === 'object' && err !== null && 'code' in err ? err.code : undefined;
      setErrorKey(authErrorKey(code));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-[22px] font-display font-bold text-ink">
          {t('menu.signInOrRegister')}
        </h2>
        <button
          type="button"
          onClick={openLoginModal}
          className={`${BUTTON_SECONDARY} w-full min-h-12 inline-flex items-center justify-center gap-2.5`}
        >
          <Mail size={18} className="text-accent" aria-hidden="true" />
          {t('menu.emailPassword')}
        </button>
        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[13px] text-ink/70">{t('menu.orUse')}</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <button
          type="button"
          onClick={() => void handleGoogleLogin()}
          disabled={googleLoading}
          className={`${BUTTON_SECONDARY} w-full min-h-12 inline-flex items-center justify-center gap-3`}
        >
          {googleLoading ? (
            <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
          ) : (
            <>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                className="w-5 h-5"
                alt=""
                loading="lazy"
              />
              {t('menu.continueGoogle')}
            </>
          )}
        </button>
        {errorKey && (
          <p
            role="alert"
            className="p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger text-center"
          >
            {t(errorKey)}
          </p>
        )}
      </section>
      <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
        <MenuRow icon={Handshake} label={t('profile.partnerProgram')} onClick={onPartnersOpen} />
      </ul>
    </div>
  );
}

=== src/domain/user/hooks/useUserProfile.ts — diff ===
@@ -23,6 +23,7 @@ export function useUserProfile(onAccountDeleted?: () => void) {
     new: false,
     confirm: false,
   });
+  const [memberSince, setMemberSince] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
@@ -41,6 +42,10 @@ export function useUserProfile(onAccountDeleted?: () => void) {
               lastName: userDoc.lastName || '',
               phone: userDoc.phone || '',
             });
+            const created = userDoc.createdAt ? new Date(userDoc.createdAt) : null;
+            setMemberSince(
+              created && !Number.isNaN(created.getTime()) ? created.toISOString() : null
+            );
           }
         } catch (err: unknown) {
           const errMsg = err instanceof Error ? err.message : 'Não foi possível carregar o perfil.';
@@ -85,7 +90,7 @@ export function useUserProfile(onAccountDeleted?: () => void) {
   };
 
   const updatePassword = async (): Promise<boolean> => {
-    if (!user || !user.email) return false;
+    if (!user?.email) return false;
 
     setIsLoading(true);
     setMessage(null);
@@ -115,7 +120,7 @@ export function useUserProfile(onAccountDeleted?: () => void) {
   };
 
   const deleteAccount = async (password?: string) => {
-    if (!user || !user.email) return;
+    if (!user?.email) return;
     setIsLoading(true);
     setMessage(null);
     setError(null);
@@ -152,6 +157,7 @@ export function useUserProfile(onAccountDeleted?: () => void) {
     user,
     userData,
     setUserData,
+    memberSince,
     passwordData,
     setPasswordData,
     showPasswords,

=== src/shared/constants/zIndex.ts — diff ===
@@ -12,6 +12,8 @@ export const Z_INDEX = {
   overlay: 1000,
   modal: 1100,
   modalNested: 1200,
+  /** Menus e popovers abertos de dentro de uma tela cheia ou de um modal ficam por cima deles. */
+  popover: 1300,
   toast: 2000,
   criticalAlert: 9999,
 } as const;

=== src/shared/i18n/profileResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos do perfil (menu lateral com login) e de Minhas avaliações. pt-BR é a fonte. */
export interface ProfileTranslation {
  memberSince: string;
  next: string;
  nextTickets_one: string;
  nextTickets_other: string;
  nextParticipants_one: string;
  nextParticipants_other: string;
  tiles: { tickets: string; bookings: string; favorites: string; reviews: string };
  ticketsHint_one: string;
  ticketsHint_other: string;
  bookingsHint_one: string;
  bookingsHint_other: string;
  favoritesHint_one: string;
  favoritesHint_other: string;
  reviewsHint_one: string;
  reviewsHint_other: string;
  account: string;
  partnerProgram: string;
  logout: string;
}

export interface MyReviewsTranslation {
  title: string;
  back: string;
  loading: string;
  empty: string;
  loadMore: string;
  verified: string;
  stars: string;
  rateWith_one: string;
  rateWith_other: string;
  partnerResponse: string;
  unknownPlace: string;
  moreOptions: string;
  edit: string;
  delete: string;
  deleteConfirm: string;
  deleted: string;
  editTitle: string;
  ratingLabel: string;
  commentLabel: string;
  commentRequired: string;
  commentTooLong: string;
  ratingRequired: string;
  save: string;
  saving: string;
  saved: string;
  errors: { load: string; delete: string; save: string };
}

export const profilePtBR: ProfileTranslation = {
  memberSince: 'No Use Guide desde {{date}}',
  next: 'Próximo',
  nextTickets_one: '{{count}} ingresso',
  nextTickets_other: '{{count}} ingressos',
  nextParticipants_one: '{{count}} participante',
  nextParticipants_other: '{{count}} participantes',
  tiles: {
    tickets: 'Ingressos',
    bookings: 'Reservas',
    favorites: 'Favoritos',
    reviews: 'Avaliações',
  },
  ticketsHint_one: 'próximo',
  ticketsHint_other: 'próximos',
  bookingsHint_one: 'próxima',
  bookingsHint_other: 'próximas',
  favoritesHint_one: 'salvo',
  favoritesHint_other: 'salvos',
  reviewsHint_one: 'feita',
  reviewsHint_other: 'feitas',
  account: 'Minha conta',
  partnerProgram: 'Seja parceiro',
  logout: 'Sair da conta',
};

export const profileEn: ProfileTranslation = {
  memberSince: 'On Use Guide since {{date}}',
  next: 'Up next',
  nextTickets_one: '{{count}} ticket',
  nextTickets_other: '{{count}} tickets',
  nextParticipants_one: '{{count}} participant',
  nextParticipants_other: '{{count}} participants',
  tiles: { tickets: 'Tickets', bookings: 'Bookings', favorites: 'Favorites', reviews: 'Reviews' },
  ticketsHint_one: 'upcoming',
  ticketsHint_other: 'upcoming',
  bookingsHint_one: 'upcoming',
  bookingsHint_other: 'upcoming',
  favoritesHint_one: 'saved',
  favoritesHint_other: 'saved',
  reviewsHint_one: 'written',
  reviewsHint_other: 'written',
  account: 'My account',
  partnerProgram: 'Become a partner',
  logout: 'Sign out',
};

export const profileFr: ProfileTranslation = {
  memberSince: 'Sur Use Guide depuis {{date}}',
  next: 'À venir',
  nextTickets_one: '{{count}} billet',
  nextTickets_other: '{{count}} billets',
  nextParticipants_one: '{{count}} participant',
  nextParticipants_other: '{{count}} participants',
  tiles: { tickets: 'Billets', bookings: 'Réservations', favorites: 'Favoris', reviews: 'Avis' },
  ticketsHint_one: 'à venir',
  ticketsHint_other: 'à venir',
  bookingsHint_one: 'à venir',
  bookingsHint_other: 'à venir',
  favoritesHint_one: 'enregistré',
  favoritesHint_other: 'enregistrés',
  reviewsHint_one: 'publié',
  reviewsHint_other: 'publiés',
  account: 'Mon compte',
  partnerProgram: 'Devenir partenaire',
  logout: 'Se déconnecter',
};

export const myReviewsPtBR: MyReviewsTranslation = {
  title: 'Minhas avaliações',
  back: 'Voltar',
  loading: 'Carregando suas avaliações…',
  empty: 'Você ainda não avaliou nenhum lugar.',
  loadMore: 'Ver mais',
  verified: 'Experiência verificada · {{date}}',
  stars: '{{value}} de 5 estrelas',
  rateWith_one: 'Dar {{count}} estrela',
  rateWith_other: 'Dar {{count}} estrelas',
  partnerResponse: 'Resposta do estabelecimento',
  unknownPlace: 'Lugar fora do guia',
  moreOptions: 'Mais opções',
  edit: 'Editar',
  delete: 'Excluir',
  deleteConfirm: 'Excluir esta avaliação? Ela sai da página do lugar e não pode ser recuperada.',
  deleted: 'Avaliação excluída.',
  editTitle: 'Editar avaliação',
  ratingLabel: 'Sua nota',
  commentLabel: 'Comentário',
  commentRequired: 'Escreva um comentário sobre sua experiência.',
  commentTooLong: 'O comentário pode ter no máximo 500 caracteres.',
  ratingRequired: 'Escolha uma nota.',
  save: 'Salvar',
  saving: 'Salvando…',
  saved: 'Avaliação atualizada.',
  errors: {
    load: 'Não foi possível carregar suas avaliações.',
    delete: 'Não foi possível excluir a avaliação.',
    save: 'Não foi possível salvar a avaliação.',
  },
};

export const myReviewsEn: MyReviewsTranslation = {
  title: 'My reviews',
  back: 'Back',
  loading: 'Loading your reviews…',
  empty: 'You have not reviewed any place yet.',
  loadMore: 'Show more',
  verified: 'Verified experience · {{date}}',
  stars: '{{value}} out of 5 stars',
  rateWith_one: 'Give {{count}} star',
  rateWith_other: 'Give {{count}} stars',
  partnerResponse: 'Response from the business',
  unknownPlace: 'Place no longer in the guide',
  moreOptions: 'More options',
  edit: 'Edit',
  delete: 'Delete',
  deleteConfirm: 'Delete this review? It leaves the place page and cannot be recovered.',
  deleted: 'Review deleted.',
  editTitle: 'Edit review',
  ratingLabel: 'Your rating',
  commentLabel: 'Comment',
  commentRequired: 'Write a comment about your experience.',
  commentTooLong: 'The comment can have at most 500 characters.',
  ratingRequired: 'Choose a rating.',
  save: 'Save',
  saving: 'Saving…',
  saved: 'Review updated.',
  errors: {
    load: 'Could not load your reviews.',
    delete: 'Could not delete the review.',
    save: 'Could not save the review.',
  },
};

export const myReviewsFr: MyReviewsTranslation = {
  title: 'Mes avis',
  back: 'Retour',
  loading: 'Chargement de vos avis…',
  empty: 'Vous n’avez encore évalué aucun lieu.',
  loadMore: 'Voir plus',
  verified: 'Expérience vérifiée · {{date}}',
  stars: '{{value}} sur 5 étoiles',
  rateWith_one: 'Donner {{count}} étoile',
  rateWith_other: 'Donner {{count}} étoiles',
  partnerResponse: 'Réponse de l’établissement',
  unknownPlace: 'Lieu absent du guide',
  moreOptions: 'Plus d’options',
  edit: 'Modifier',
  delete: 'Supprimer',
  deleteConfirm:
    'Supprimer cet avis ? Il disparaît de la page du lieu et ne peut pas être récupéré.',
  deleted: 'Avis supprimé.',
  editTitle: 'Modifier l’avis',
  ratingLabel: 'Votre note',
  commentLabel: 'Commentaire',
  commentRequired: 'Écrivez un commentaire sur votre expérience.',
  commentTooLong: 'Le commentaire peut contenir au maximum 500 caractères.',
  ratingRequired: 'Choisissez une note.',
  save: 'Enregistrer',
  saving: 'Enregistrement…',
  saved: 'Avis mis à jour.',
  errors: {
    load: 'Impossible de charger vos avis.',
    delete: 'Impossible de supprimer l’avis.',
    save: 'Impossible d’enregistrer l’avis.',
  },
};

=== src/shared/i18n/resources.ts — diff ===
@@ -46,6 +46,16 @@ import {
   purchasesFr,
   purchasesPtBR,
 } from './purchasesResources';
+import {
+  type MyReviewsTranslation,
+  myReviewsEn,
+  myReviewsFr,
+  myReviewsPtBR,
+  type ProfileTranslation,
+  profileEn,
+  profileFr,
+  profilePtBR,
+} from './profileResources';
 import {
   type TicketSessionsTranslation,
   ticketSessionsEn,
@@ -93,6 +103,8 @@ export interface TranslationResource {
   receivables: ReceivablesTranslation;
   saleClaims: SaleClaimsTranslation;
   purchases: PurchasesTranslation;
+  profile: ProfileTranslation;
+  myReviews: MyReviewsTranslation;
   adminFinance: AdminFinanceTranslation;
   ticketSessions: TicketSessionsTranslation;
   salesPolicy: SalesPolicyTranslation;
@@ -141,26 +153,16 @@ export interface TranslationResource {
     };
   };
   menu: {
-    mainTitle: string;
-    subtitle: string;
     closeMenu: string;
     changeProfilePhoto: string;
     userFallback: string;
     signInOrRegister: string;
-    yourArea: string;
-    account: string;
-    favorites: string;
-    tickets: string;
     emailPassword: string;
     orUse: string;
     continueGoogle: string;
     managementPanel: string;
     myPanel: string;
-    servicesInfo: string;
-    partnerProgram: string;
-    support: string;
-    aboutApp: string;
-    logout: string;
+    authErrors: { popupBlocked: string; unauthorizedDomain: string; generic: string };
   };
   navigation: {
     explore: string;
@@ -305,6 +307,8 @@ export interface TranslationResource {
     appearanceSubtitle: string;
     language: string;
     languageSubtitle: string;
+    support: string;
+    about: string;
     theme: { light: string; dark: string; system: string };
     themeDescription: { light: string; dark: string; system: string };
   };
@@ -326,6 +330,8 @@ const ptBR: TranslationResource = {
   receivables: receivablesPtBR,
   saleClaims: saleClaimsPtBR,
   purchases: purchasesPtBR,
+  profile: profilePtBR,
+  myReviews: myReviewsPtBR,
   adminFinance: adminFinancePtBR,
   ticketSessions: ticketSessionsPtBR,
   salesPolicy: salesPolicyPtBR,
@@ -373,26 +379,21 @@ const ptBR: TranslationResource = {
     },
   },
   menu: {
-    mainTitle: 'Menu Principal',
-    subtitle: 'Gerencie sua experiência',
     closeMenu: 'Fechar menu',
     changeProfilePhoto: 'Alterar foto de perfil',
     userFallback: 'Usuário',
-    signInOrRegister: 'Entrar ou cadastre-se',
-    yourArea: 'Sua área',
-    account: 'Conta',
-    favorites: 'Meus Favoritos',
-    tickets: 'Meus Ingressos',
-    emailPassword: 'E-mail e Senha',
-    orUse: 'Ou use',
+    signInOrRegister: 'Entrar ou cadastrar',
+    emailPassword: 'E-mail e senha',
+    orUse: 'ou',
     continueGoogle: 'Continuar com Google',
-    managementPanel: 'Painel de Gestão',
-    myPanel: 'Meu Painel',
-    servicesInfo: 'Serviços & Info',
-    partnerProgram: 'Programa de Parceiros',
-    support: 'Suporte / Ajuda',
-    aboutApp: 'Sobre o App',
-    logout: 'Sair',
+    managementPanel: 'Painel de gestão',
+    myPanel: 'Meu painel',
+    authErrors: {
+      popupBlocked: 'O navegador bloqueou a janela de login. Libere pop-ups e tente de novo.',
+      unauthorizedDomain:
+        'Este endereço não está autorizado para login. Recarregue a página e tente de novo.',
+      generic: 'Não foi possível entrar com o Google.',
+    },
   },
   navigation: {
     explore: 'Explorar',
@@ -584,6 +585,8 @@ const ptBR: TranslationResource = {
     appearanceSubtitle: 'Selecione o modo',
     language: 'Idioma do Guide',
     languageSubtitle: 'Selecione o idioma',
+    support: 'Suporte',
+    about: 'Sobre o app',
     theme: { light: 'Claro', dark: 'Escuro', system: 'Sistema' },
     themeDescription: {
       light: 'Tema com tonalidade clara',
@@ -610,6 +613,8 @@ const en: TranslationResource = {
   receivables: receivablesEn,
   saleClaims: saleClaimsEn,
   purchases: purchasesEn,
+  profile: profileEn,
+  myReviews: myReviewsEn,
   adminFinance: adminFinanceEn,
   ticketSessions: ticketSessionsEn,
   salesPolicy: salesPolicyEn,
@@ -656,26 +661,21 @@ const en: TranslationResource = {
     },
   },
   menu: {
-    mainTitle: 'Main Menu',
-    subtitle: 'Manage your experience',
     closeMenu: 'Close menu',
     changeProfilePhoto: 'Change profile photo',
     userFallback: 'User',
-    signInOrRegister: 'Sign in or register',
-    yourArea: 'Your area',
-    account: 'Account',
-    favorites: 'My Favorites',
-    tickets: 'My Tickets',
-    emailPassword: 'Email & Password',
-    orUse: 'Or use',
+    signInOrRegister: 'Sign in or sign up',
+    emailPassword: 'Email and password',
+    orUse: 'or',
     continueGoogle: 'Continue with Google',
-    managementPanel: 'Management Panel',
-    myPanel: 'My Panel',
-    servicesInfo: 'Services & Info',
-    partnerProgram: 'Partner Program',
-    support: 'Support / Help',
-    aboutApp: 'About the App',
-    logout: 'Sign out',
+    managementPanel: 'Management panel',
+    myPanel: 'My panel',
+    authErrors: {
+      popupBlocked: 'The browser blocked the sign-in window. Allow pop-ups and try again.',
+      unauthorizedDomain:
+        'This address is not authorized for sign-in. Reload the page and try again.',
+      generic: 'Could not sign in with Google.',
+    },
   },
   navigation: {
     explore: 'Explore',
@@ -862,6 +862,8 @@ const en: TranslationResource = {
     appearanceSubtitle: 'Choose a mode',
     language: 'Guide language',
     languageSubtitle: 'Choose a language',
+    support: 'Support',
+    about: 'About the app',
     theme: { light: 'Light', dark: 'Dark', system: 'System' },
     themeDescription: {
       light: 'Light-toned theme',
@@ -888,6 +890,8 @@ const fr: TranslationResource = {
   receivables: receivablesFr,
   saleClaims: saleClaimsFr,
   purchases: purchasesFr,
+  profile: profileFr,
+  myReviews: myReviewsFr,
   adminFinance: adminFinanceFr,
   ticketSessions: ticketSessionsFr,
   salesPolicy: salesPolicyFr,
@@ -934,26 +938,22 @@ const fr: TranslationResource = {
     },
   },
   menu: {
-    mainTitle: 'Menu principal',
-    subtitle: 'Gérez votre expérience',
     closeMenu: 'Fermer le menu',
     changeProfilePhoto: 'Changer la photo de profil',
     userFallback: 'Utilisateur',
-    signInOrRegister: 'Connexion ou inscription',
-    yourArea: 'Votre espace',
-    account: 'Compte',
-    favorites: 'Mes favoris',
-    tickets: 'Mes billets',
+    signInOrRegister: 'Se connecter ou s’inscrire',
     emailPassword: 'E-mail et mot de passe',
-    orUse: 'Ou utiliser',
+    orUse: 'ou',
     continueGoogle: 'Continuer avec Google',
     managementPanel: 'Panneau de gestion',
-    myPanel: 'Mon espace',
-    servicesInfo: 'Services et infos',
-    partnerProgram: 'Programme partenaires',
-    support: 'Support / Aide',
-    aboutApp: 'À propos de l’app',
-    logout: 'Se déconnecter',
+    myPanel: 'Mon panneau',
+    authErrors: {
+      popupBlocked:
+        'Le navigateur a bloqué la fenêtre de connexion. Autorisez les pop-ups et réessayez.',
+      unauthorizedDomain:
+        'Cette adresse n’est pas autorisée pour la connexion. Rechargez la page et réessayez.',
+      generic: 'Impossible de se connecter avec Google.',
+    },
   },
   navigation: {
     explore: 'Explorer',
@@ -1148,6 +1148,8 @@ const fr: TranslationResource = {
     appearanceSubtitle: 'Choisissez un mode',
     language: 'Langue du guide',
     languageSubtitle: 'Choisissez une langue',
+    support: 'Assistance',
+    about: 'À propos de l’app',
     theme: { light: 'Clair', dark: 'Sombre', system: 'Système' },
     themeDescription: {
       light: 'Thème aux tons clairs',

=== src/ui/components/ConfirmDialog.tsx — diff ===
@@ -44,13 +44,19 @@ export function ConfirmDialog({ data }: ConfirmDialogProps) {
       <RadixDialog.Portal>
         <RadixDialog.Overlay
           className="fixed inset-0 bg-scrim backdrop-blur-sm animate-fade-in data-[state=closed]:animate-fade-out motion-reduce:animate-none"
-          style={{ zIndex: Z_INDEX.overlay }}
+          // Mesma camada do conteúdo: a confirmação abre por cima de folhas e do menu lateral.
+          style={{ zIndex: Z_INDEX.modalNested }}
         />
         <RadixDialog.Content
           // Sem título a mensagem já é o título; `undefined` diz ao Radix que não há descrição.
           {...(data?.title ? {} : { 'aria-describedby': undefined })}
           className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-xs p-6 rounded-3xl bg-surface-solid border border-line text-ink flex flex-col items-center text-center gap-3 outline-none animate-scale-in data-[state=closed]:animate-scale-out motion-reduce:animate-none"
           style={{ zIndex: Z_INDEX.modalNested }}
+          // Foco na própria caixa, sem anel num botão que a pessoa não tocou (AGENTS.md §11.11).
+          onOpenAutoFocus={(event) => {
+            event.preventDefault();
+            (event.currentTarget as HTMLElement).focus();
+          }}
         >
           <Icon size={28} className={positive ? 'text-success' : 'text-warn'} aria-hidden="true" />
           {data?.title ? (

=== src/ui/components/Dialog.tsx — diff ===
@@ -31,7 +31,8 @@ export function Dialog({
       <RadixDialog.Portal>
         <RadixDialog.Overlay
           className="fixed inset-0 bg-scrim backdrop-blur-md animate-fade-in data-[state=closed]:animate-fade-out motion-reduce:animate-none"
-          style={{ zIndex: nested ? Z_INDEX.modalNested : Z_INDEX.overlay }}
+          // Mesma camada do conteúdo (que vem depois no DOM): o fundo escurece também sobre o menu lateral.
+          style={{ zIndex: nested ? Z_INDEX.modalNested : Z_INDEX.modal }}
         />
         {/* Celular: folha que sobe da borda (como num app nativo). Do sm em diante: cartão central. */}
         <RadixDialog.Content

=== src/ui/components/DropdownMenu.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ReactNode } from 'react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../../shared/utils/cn';
import { Z_INDEX } from '../../shared/constants/zIndex';

export interface DropdownMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: 'start' | 'center' | 'end';
}

export function DropdownMenu({ trigger, items, align = 'end' }: DropdownMenuProps) {
  return (
    <RadixDropdownMenu.Root>
      <RadixDropdownMenu.Trigger asChild>{trigger}</RadixDropdownMenu.Trigger>

      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          align={align}
          sideOffset={8}
          className="min-w-[200px] p-1.5 rounded-2xl bg-surface-solid border border-line shadow-xl animate-scale-in motion-reduce:animate-none outline-none"
          style={{ zIndex: Z_INDEX.popover }}
        >
          {items.map((item, index) => (
            <RadixDropdownMenu.Item
              key={index}
              disabled={item.disabled ?? false}
              onSelect={item.onClick}
              className={cn(
                'flex items-center gap-2.5 min-h-11 px-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50',
                item.destructive
                  ? 'text-danger hover:bg-danger-soft focus:bg-danger-soft'
                  : 'text-ink hover:bg-ink/[0.06] focus:bg-ink/[0.06]',
                item.disabled && 'opacity-40 cursor-not-allowed'
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </RadixDropdownMenu.Item>
          ))}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
}

=== src/ui/components/ShortcutTile.tsx — ARQUIVO NOVO, conteúdo completo ===
import type { ReactNode } from 'react';

interface ShortcutTileProps {
  icon: ReactNode;
  label: string;
  /** Número em destaque; `null` enquanto carrega. */
  value: string | null;
  hint: string;
  onClick: () => void;
}

/** Atalho em cartão com um número (D19): Ingressos, Reservas, Favoritos, Avaliações. */
export function ShortcutTile({ icon, label, value, hint, onClick }: ShortcutTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press p-4 min-h-[116px] rounded-[20px] bg-surface border border-line text-left flex flex-col gap-3 focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
    >
      <span className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
        {icon}
      </span>
      <span>
        <span className="block text-[15px] font-semibold text-ink">{label}</span>
        <span className="block text-[13px] text-ink/70">
          {value === null ? (
            <span
              className="inline-block w-10 h-3 rounded bg-ink/10 align-middle"
              aria-hidden="true"
            />
          ) : (
            <>
              <span className="font-semibold text-ink">{value}</span> {hint}
            </>
          )}
        </span>
      </span>
    </button>
  );
}

=== src/ui/layouts/SidebarLayout.tsx — diff ===
@@ -2,6 +2,7 @@ import React from 'react';
 import { createPortal } from 'react-dom';
 import { motion, AnimatePresence } from 'motion/react';
 import { Settings } from 'lucide-react';
+import { useTranslation } from 'react-i18next';
 import { cn } from '../../shared/utils/cn';
 import { Z_INDEX } from '../../shared/constants/zIndex';
 import { useSwipeToClose } from './useSwipeToClose';
@@ -65,6 +66,7 @@ export function SidebarLayout({
   isCropping = false,
   onSettingsClick,
 }: SidebarLayoutProps) {
+  const { t } = useTranslation();
   const isLoginModalOpen = useUIStore((state) => state.isLoginModalOpen);
   const isLoginClosingBySwipe = useUIStore((state) => state.isLoginClosingBySwipe);
   const { containerRef, x, isSwipeClosingRef } = useSwipeToClose({
@@ -99,7 +101,7 @@ export function SidebarLayout({
           }}
           className={cn(
             'fixed inset-0 w-full h-[100dvh] overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col',
-            isCropping ? 'bg-black' : 'bg-black text-white'
+            isCropping ? 'bg-black' : 'bg-app text-ink'
           )}
         >
           <div
@@ -112,8 +114,8 @@ export function SidebarLayout({
               <button
                 type="button"
                 onClick={onSettingsClick}
-                aria-label="Configurações"
-                className="absolute top-[30px] right-6 sm:top-[38px] sm:right-8 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/70 hover:text-white active:scale-90 transition-all z-20 rounded-xl focus-visible:ring-2 focus-visible:ring-teal-400/50"
+                aria-label={t('settings.title')}
+                className="absolute top-[30px] right-6 sm:top-[38px] sm:right-8 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center press text-ink/80 hover:bg-ink/[0.06] z-20 rounded-full focus-visible:ring-2 focus-visible:ring-teal-400/50"
               >
                 <Settings size={25} />
               </button>

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run src/app/compositions/MyReviewsComposition.tsx src/app/compositions/ProfileHighlightsComposition.tsx src/app/menu/SideMenu.tsx src/app/menu/menuViews.test.ts src/app/menu/menuViews.ts src/domain/bookings/index.ts src/domain/favorites/index.ts src/domain/reviews/adapters/firestoreReviewAdapter.ts src/domain/reviews/application/usecases/deleteReviewUseCase.ts src/domain/reviews/application/usecases/listMyReviewsUseCase.ts src/domain/reviews/components/StarRating.tsx src/domain/reviews/components/mine/EditReviewSheet.tsx src/domain/reviews/components/mine/MyReviewCard.tsx src/domain/reviews/components/mine/MyReviewsView.test.tsx src/domain/reviews/components/mine/MyReviewsView.tsx src/domain/reviews/hooks/useMyReviews.ts src/domain/reviews/index.ts src/domain/reviews/ports/reviewPort.ts src/domain/reviews/schemas/editReviewSchema.ts src/domain/reviews/utils/reviewDateToIso.ts src/domain/user/components/MainMenuView.test.tsx src/domain/user/components/MainMenuView.tsx src/domain/user/components/SettingsView.tsx src/domain/user/components/menu/MenuRow.tsx src/domain/user/components/menu/ProfileAvatar.tsx src/domain/user/components/menu/SignInPanel.tsx src/domain/user/hooks/useUserProfile.ts src/shared/constants/zIndex.ts src/shared/i18n/profileResources.ts src/shared/i18n/resources.ts src/ui/components/ConfirmDialog.tsx src/ui/components/Dialog.tsx src/ui/components/DropdownMenu.tsx src/ui/components/ShortcutTile.tsx src/ui/layouts/SidebarLayout.tsx` (todos verdes). Não precisa rodar a suíte inteira.
- abra o menu com login nos temas claro e escuro: perfil com Próximo e os quatro atalhos; Configurações com Suporte e Sobre o app; Minhas avaliações com o menu "…" (Editar e Excluir). Sem login: entrar por e-mail ou Google.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique os índices do Firestore: `firebase deploy --only firestore:indexes` (índice novo de `reviews`: `userId` + `createdAt` decrescente). Sem ele, Minhas avaliações e o número de Avaliações no perfil não carregam.
