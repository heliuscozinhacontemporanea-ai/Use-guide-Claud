# Prompt 14 — bookings: compra pelo turista (frontend + SEO)

> Lote 6 — gerado do commit de referência `d70d0d0` da branch `claude/agents-md-v2`. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 14 — bookings: compra pelo turista (frontend + SEO)

O turista reserva pelo detalhe do passeio ou da atração: escolhe o horário, os participantes e paga com cartão ou Pix pelo Payment Element. A política de cancelamento aparece antes da compra. Ganha também "Minhas reservas" (`/reservas`, `/en/bookings`, `/fr/reservations`), com o valor do reembolso mostrado antes de cancelar. O JSON-LD do servidor passa a ter `Offer`.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade, migração ou transição (§2.2 item 8). A decisão D5 (tradução automática) está em aberto: não implemente tradução automática.

O QUE MUDA:
1) Rota nova 'bookings' nos dois mapas de URL (src/shared/i18n e server/shared/kernel), com textos de SEO nos 3 idiomas; PRIVATE_ROUTE_KEYS (favoritos e reservas) ficam fora do sitemap e com noindex.
2) Backend: getPublicOfferSummaryUseCase (menor preço e vaga nos próximos 30 dias); o CatalogSeoContentProvider (camada application, seo continua folha) acrescenta o resumo e o JSON-LD emite Offer (preço em reais com duas casas, BRL, InStock/SoldOut). Índice novo publicBookableOffers (guideItemId, status).
3) Frontend: leitura das ofertas publicadas direto do Firestore (§6.2, com filtro de status exigido pela rule e limit 10); API do comprador; componentes SlotPicker (esgotados desabilitados), QuantitySelector (limite de participantes e da opção; total só para exibição), ParticipantsForm (RHF + Zod), BookingCheckout (contagem regressiva de 15 min; consulta o backend a cada 3 s por até 2 min; aviso do Pix), BookingFlow, BookingOfferPanel, MyBookingsView (prévia do reembolso com a mesma regra pura do servidor e teste de paridade) e BookingResultView.
4) O Payment Element entra por render-prop: bookings não importa componente do payment. src/app/compositions/ItemBookingComposition.tsx liga o painel ao login e ao StripePaymentElement (returnKind 'booking' → /checkout/result?bookingId=). TourDetailModal e AttractionDetailModal só recebem o slot bookingPanel. Atração pública (sem oferta) não mostra nada.
5) Menu: "Minhas reservas" para quem está logado. CheckoutResultComposition trata bookingId.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/02-grafo-dependencias.md (alterar)
- firestore.indexes.json (alterar)
- server/application/seo/catalogSeoContentProvider.test.ts (alterar)
- server/application/seo/catalogSeoContentProvider.ts (alterar)
- server/domain/bookings/index.ts (alterar)
- server/domain/bookings/services/offerService.test.ts (alterar)
- server/domain/bookings/services/offerService.ts (alterar)
- server/domain/bookings/usecases/getPublicOfferSummaryUseCase.ts (criar)
- server/domain/bookings/utils/refundParity.test.ts (criar)
- server/domain/seo/services/seoHtmlService.test.ts (alterar)
- server/domain/seo/services/seoHtmlService.ts (alterar)
- server/domain/seo/types/seoTypes.ts (alterar)
- server/domain/seo/utils/routeSeo.ts (alterar)
- server/domain/seo/utils/structuredData.ts (alterar)
- server/shared/kernel/localizedRoutes.ts (alterar)
- src/app/AppRouter.tsx (alterar)
- src/app/compositions/CheckoutResultComposition.tsx (alterar)
- src/app/compositions/ItemBookingComposition.tsx (criar)
- src/app/compositions/MyBookingsPageComposition.tsx (criar)
- src/app/routes/AppRoutes.tsx (alterar)
- src/domain/bookings/adapters/firestorePublicOffersAdapter.ts (criar)
- src/domain/bookings/adapters/httpBookingsAdapter.ts (alterar)
- src/domain/bookings/application/usecases/cancelBookingUseCase.ts (criar)
- src/domain/bookings/application/usecases/createBookingUseCase.ts (criar)
- src/domain/bookings/application/usecases/getBookingUseCase.ts (criar)
- src/domain/bookings/application/usecases/listAvailableSlotsUseCase.ts (criar)
- src/domain/bookings/application/usecases/listMyBookingsUseCase.ts (criar)
- src/domain/bookings/application/usecases/listPublishedOffersForItemUseCase.ts (criar)
- src/domain/bookings/components/buyer/BookingCheckout.tsx (criar)
- src/domain/bookings/components/buyer/BookingFlow.tsx (criar)
- src/domain/bookings/components/buyer/BookingOfferPanel.tsx (criar)
- src/domain/bookings/components/buyer/BookingResultView.tsx (criar)
- src/domain/bookings/components/buyer/MyBookingsView.tsx (criar)
- src/domain/bookings/components/buyer/OfferPolicySummary.tsx (criar)
- src/domain/bookings/components/buyer/ParticipantsForm.tsx (criar)
- src/domain/bookings/components/buyer/QuantitySelector.tsx (criar)
- src/domain/bookings/components/buyer/SlotPicker.tsx (criar)
- src/domain/bookings/components/buyer/buyerComponents.test.tsx (criar)
- src/domain/bookings/components/buyer/types.ts (criar)
- src/domain/bookings/hooks/useBookingCheckout.ts (criar)
- src/domain/bookings/hooks/useMyBookings.ts (criar)
- src/domain/bookings/hooks/usePublicSlots.ts (criar)
- src/domain/bookings/hooks/usePublishedOffers.ts (criar)
- src/domain/bookings/index.ts (alterar)
- src/domain/bookings/ports/bookingsApiPort.ts (alterar)
- src/domain/bookings/schemas/participantsFormSchema.ts (criar)
- src/domain/bookings/types/bookings.ts (alterar)
- src/domain/bookings/utils/refundPreview.ts (criar)
- src/domain/guide/components/AttractionDetailModal.tsx (alterar)
- src/domain/guide/components/TourDetailModal.tsx (alterar)
- src/domain/payment/adapters/ui/StripePaymentElement.tsx (alterar)
- src/domain/user/components/MainMenuView.tsx (alterar)
- src/shared/i18n/bookingsResources.ts (alterar)
- src/shared/i18n/index.ts (alterar)
- src/shared/i18n/localizedRoutes.test.ts (alterar)
- src/shared/i18n/localizedRoutes.ts (alterar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/utils/seo.ts (alterar)
- src/ui/layouts/SideMenu.tsx (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/02-grafo-dependencias.md — diff ===
@@ -62,6 +62,8 @@
 | `create/update/deletePartnerEventApplicationUseCase` | partners, events, guide |
 | `renderSeoPageApplicationUseCase`, `renderSitemapApplicationUseCase` | seo, guide, events (seo continua folha: recebe o catálogo pelo `SeoContentPort`; prompt 8) |
 | `startPartnerPlanSubscriptionApplicationUseCase`, `reconcilePlanSubscriptionWebhookApplicationUseCase` | admin, partners, payment, notifications (payment continua folha: só recebe IDs e valores; prompt 9) |
+| `bookings/createBooking…`, `cancelBookingByBuyer…`, `cancelSlotByPartner…`, `reconcileBookingWebhook…` | bookings, payment, notifications (bookings não importa payment; payment só vê `referenceType`/`referenceId`; prompts 12 e 14) |
+| `seo/catalogSeoContentProvider` | seo, guide, events, bookings (resumo da oferta no JSON-LD; prompt 14) |
 | `eventLifecycleOrchestrationUseCases` | events, ticketing, notifications |
 | `ticketingPaymentOrchestrationUseCases` | ticketing, payment, partners, events, notifications |
 | `getPlanForPaymentApplicationUseCase` | admin |

=== firestore.indexes.json — diff ===
@@ -271,6 +271,20 @@
           "order": "ASCENDING"
         }
       ]
+    },
+    {
+      "collectionGroup": "publicBookableOffers",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "guideItemId",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "status",
+          "order": "ASCENDING"
+        }
+      ]
     }
   ],
   "fieldOverrides": [

=== server/application/seo/catalogSeoContentProvider.test.ts — diff ===
@@ -1,6 +1,7 @@
 import { beforeEach, describe, expect, it, vi } from 'vitest';
 
 const mocks = vi.hoisted(() => ({
+  getPublicOfferSummaryUseCase: vi.fn(),
   getPublicGuideItemUseCase: vi.fn(),
   listPublicGuideItemsUseCase: vi.fn(),
   getEventListingByIdUseCase: vi.fn(),
@@ -8,6 +9,9 @@ const mocks = vi.hoisted(() => ({
   listPublicEventListingsUseCase: vi.fn(),
 }));
 
+vi.mock('../../domain/bookings', () => ({
+  getPublicOfferSummaryUseCase: mocks.getPublicOfferSummaryUseCase,
+}));
 vi.mock('../../domain/guide', () => ({
   getPublicGuideItemUseCase: mocks.getPublicGuideItemUseCase,
   listPublicGuideItemsUseCase: mocks.listPublicGuideItemsUseCase,
@@ -85,4 +89,22 @@ describe('CatalogSeoContentProvider', () => {
       },
     ]);
   });
+
+  it('passeio inclui o resumo da oferta vendável', async () => {
+    mocks.getPublicGuideItemUseCase.mockResolvedValue({
+      id: 't1',
+      name: 'Buggy',
+      description: '',
+      category: 'tour',
+      rating: 0,
+      reviewCount: 0,
+      isActive: true,
+    });
+    mocks.getPublicOfferSummaryUseCase.mockResolvedValue({
+      lowestUnitAmountMinor: 9000,
+      hasAvailability: true,
+    });
+    const item = await new CatalogSeoContentProvider().getGuideItem('t1');
+    expect(item?.offer).toEqual({ lowestPriceMinor: 9000, inStock: true });
+  });
 });

=== server/application/seo/catalogSeoContentProvider.ts — diff ===
@@ -1,3 +1,4 @@
+import { getPublicOfferSummaryUseCase } from '../../domain/bookings';
 import {
   getEventListingByIdUseCase,
   listEventOccurrencesUseCase,
@@ -14,7 +15,19 @@ export class CatalogSeoContentProvider implements SeoContentPort {
   async getGuideItem(id: string): Promise<SeoGuideItem | null> {
     const item = await getPublicGuideItemUseCase(id);
     if (!item) return null;
+    const offer =
+      item.category === 'tour' || item.category === 'sight'
+        ? await getPublicOfferSummaryUseCase(item.id)
+        : null;
     return {
+      ...(offer
+        ? {
+            offer: {
+              lowestPriceMinor: offer.lowestUnitAmountMinor,
+              inStock: offer.hasAvailability,
+            },
+          }
+        : {}),
       id: item.id,
       name: item.name,
       description: item.description ?? '',

=== server/domain/bookings/index.ts — diff ===
@@ -9,6 +9,7 @@ export { createPendingBookingUseCase } from './usecases/createPendingBookingUseC
 export { expireOverdueBookingsUseCase } from './usecases/expireOverdueBookingsUseCase';
 export { getBookingForActorUseCase } from './usecases/getBookingForActorUseCase';
 export { getBookingUseCase } from './usecases/getBookingUseCase';
+export { getPublicOfferSummaryUseCase } from './usecases/getPublicOfferSummaryUseCase';
 export { listAvailableSlotsUseCase } from './usecases/listAvailableSlotsUseCase';
 export { listMyBookingsUseCase } from './usecases/listMyBookingsUseCase';
 export { listOfferBookingsForPartnerUseCase } from './usecases/listOfferBookingsForPartnerUseCase';

=== server/domain/bookings/services/offerService.test.ts — diff ===
@@ -190,4 +190,28 @@ describe('OfferService', () => {
       },
     ]);
   });
+
+  it('resumo público: menor preço e disponibilidade nos próximos 30 dias', async () => {
+    const { service } = setup();
+    await expect(service.getPublicOfferSummary('item-1')).resolves.toBeNull();
+    const offer = await service.createOffer(OWNER, {
+      ...INPUT,
+      guideItemId: 'item-1',
+      kind: 'tour',
+    });
+    await service.setOfferStatus(OWNER, offer.id, 'published');
+    await expect(service.getPublicOfferSummary('item-1')).resolves.toEqual({
+      lowestUnitAmountMinor: 15000,
+      hasAvailability: false,
+    });
+    await service.createSlots(OWNER, offer.id, {
+      mode: 'list',
+      capacity: 2,
+      slots: [{ startsAt: '2026-11-05T11:00:00.000Z' }],
+    });
+    await expect(service.getPublicOfferSummary('item-1')).resolves.toEqual({
+      lowestUnitAmountMinor: 15000,
+      hasAvailability: true,
+    });
+  });
 });

=== server/domain/bookings/services/offerService.ts — diff ===
@@ -224,6 +224,35 @@ export class OfferService {
       }));
   }
 
+  /** Resumo para o SEO: menor preço publicado e se há vaga nos próximos 30 dias. */
+  async getPublicOfferSummary(
+    guideItemId: string
+  ): Promise<{ lowestUnitAmountMinor: number; hasAvailability: boolean } | null> {
+    const offers = await this.port.listPublishedOffersByGuideItem(guideItemId);
+    if (offers.length === 0) return null;
+    const lowestUnitAmountMinor = Math.min(
+      ...offers.flatMap((offer) =>
+        offer.pricing.priceOptions.map((option) => option.unitAmountMinor)
+      )
+    );
+    const nowDate = this.now();
+    const fromIso = nowDate.toISOString();
+    const toIso = new Date(nowDate.getTime() + 30 * 86_400_000).toISOString();
+    for (const offer of offers) {
+      const slots = await this.port.listSlots(offer.id, fromIso, toIso);
+      if (
+        slots.some(
+          (slot) =>
+            slot.status === 'open' &&
+            slot.capacityTotal - slot.capacityReserved - slot.capacitySold > 0
+        )
+      ) {
+        return { lowestUnitAmountMinor, hasAvailability: true };
+      }
+    }
+    return { lowestUnitAmountMinor, hasAvailability: false };
+  }
+
   /** Fecha o horário e devolve as reservas ativas dele (a camada application reembolsa e notifica). */
   async cancelSlot(actor: BookingActor, offerId: string, slotId: string): Promise<Booking[]> {
     await this.getOwnedOffer(actor, offerId);

=== server/domain/bookings/usecases/getPublicOfferSummaryUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getOfferService } from '../factory';

/** Menor preço publicado do item e se há vaga nos próximos 30 dias; null se o item não vende reservas. */
export async function getPublicOfferSummaryUseCase(
  guideItemId: string
): Promise<{ lowestUnitAmountMinor: number; hasAvailability: boolean } | null> {
  return getOfferService().getPublicOfferSummary(guideItemId);
}

=== server/domain/bookings/utils/refundParity.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { previewRefund } from '../../../../src/domain/bookings/utils/refundPreview';
import { calculateCancellationRefund } from './cancellationRefund';

describe('paridade da regra de reembolso app × servidor', () => {
  it('a prévia mostrada no app é igual ao que o backend devolve', () => {
    const startsAt = '2026-11-10T11:00:00.000Z';
    const policies = [
      { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 50 as const },
      { freeCancellationHoursBefore: 0, refundPercentAfterDeadline: 100 as const },
      { freeCancellationHoursBefore: 48, refundPercentAfterDeadline: 0 as const },
    ];
    const moments = [
      '2026-11-07T00:00:00.000Z',
      '2026-11-09T11:00:00.000Z',
      '2026-11-10T10:59:00.000Z',
      '2026-11-10T11:00:00.000Z',
    ];
    for (const policy of policies) {
      for (const moment of moments) {
        const params = { policy, startsAt, totalMinor: 12345, now: new Date(moment) };
        expect(previewRefund(params)).toEqual(calculateCancellationRefund(params));
      }
    }
  });
});

=== server/domain/seo/services/seoHtmlService.test.ts — diff ===
@@ -172,4 +172,24 @@ describe('SeoHtmlService.buildMetadata', () => {
     const meta = await service.buildMetadata('/fr/favoris', {});
     expect(meta.robots).toBe('noindex, follow');
   });
+
+  it('passeio com oferta publicada emite Offer com preço em reais e disponibilidade', async () => {
+    const { service } = createService({
+      getGuideItem: vi
+        .fn()
+        .mockResolvedValue(
+          buildItem({ category: 'tour', offer: { lowestPriceMinor: 15090, inStock: false } })
+        ),
+    });
+    const meta = await service.buildMetadata('/passeios', { item: 'item-1', type: 'item' });
+    expect(meta.structuredData).toMatchObject({
+      '@type': 'TouristTrip',
+      offers: {
+        '@type': 'Offer',
+        price: '150.90',
+        priceCurrency: 'BRL',
+        availability: 'https://schema.org/SoldOut',
+      },
+    });
+  });
 });

=== server/domain/seo/services/seoHtmlService.ts — diff ===
@@ -1,5 +1,9 @@
 import { DEFAULT_LOCALE, type Locale } from '../../../shared/kernel/locale';
-import { parseLocalizedPath, type RouteKey } from '../../../shared/kernel/localizedRoutes';
+import {
+  PRIVATE_ROUTE_KEYS,
+  parseLocalizedPath,
+  type RouteKey,
+} from '../../../shared/kernel/localizedRoutes';
 import type { HtmlTemplatePort } from '../ports/htmlTemplatePort';
 import type { SeoContentPort } from '../ports/seoContentPort';
 import type { SeoMetadata } from '../types/seoTypes';
@@ -62,7 +66,7 @@ function routeMetadata(routeKey: RouteKey, locale: Locale): SeoMetadata {
     locale,
     canonicalUrl: absoluteUrl(routeKey, locale),
     alternates: buildAlternates(routeKey),
-    ...(routeKey === 'favorites' ? { robots: NOINDEX } : {}),
+    ...(PRIVATE_ROUTE_KEYS.includes(routeKey) ? { robots: NOINDEX } : {}),
   };
 }

=== server/domain/seo/types/seoTypes.ts — diff ===
@@ -37,6 +37,8 @@ export interface SeoGuideItem {
   cuisineType?: string;
   rating: number;
   reviewCount: number;
+  /** Presente quando o item vende reservas (domínio bookings). */
+  offer?: { lowestPriceMinor: number; inStock: boolean };
 }
 
 export interface SeoEventOccurrence {

=== server/domain/seo/utils/routeSeo.ts — diff ===
@@ -159,6 +159,20 @@ export const ROUTE_SEO_TEXTS: Record<RouteKey, Record<Locale, RouteText>> = {
       description: 'Les lieux, excursions et événements que vous avez enregistrés sur Use Guide.',
     },
   },
+  bookings: {
+    'pt-BR': {
+      title: 'Minhas Reservas | Use Guide',
+      description: 'Seus passeios e entradas reservados no Use Guide.',
+    },
+    en: {
+      title: 'My Bookings | Use Guide',
+      description: 'Your tours and entries booked on Use Guide.',
+    },
+    fr: {
+      title: 'Mes Réservations | Use Guide',
+      description: 'Vos excursions et entrées réservées sur Use Guide.',
+    },
+  },
 };
 
 /** Rotas fora do mapa de idiomas: nunca indexadas. */

=== server/domain/seo/utils/structuredData.ts — diff ===
@@ -58,6 +58,18 @@ export function buildGuideItemStructuredData(
   if (type === 'Restaurant' && item.cuisineType) {
     data.servesCuisine = item.cuisineType;
   }
+  if (item.offer) {
+    // schema.org espera o preço em reais com duas casas, como texto.
+    data.offers = {
+      '@type': 'Offer',
+      price: (item.offer.lowestPriceMinor / 100).toFixed(2),
+      priceCurrency: 'BRL',
+      availability: item.offer.inStock
+        ? 'https://schema.org/InStock'
+        : 'https://schema.org/SoldOut',
+      url: page.url,
+    };
+  }
   if (item.reviewCount > 0) {
     data.aggregateRating = {
       '@type': 'AggregateRating',

=== server/shared/kernel/localizedRoutes.ts — diff ===
@@ -9,6 +9,7 @@ export const ROUTE_KEYS = [
   'attractions',
   'guide',
   'favorites',
+  'bookings',
 ] as const;
 export type RouteKey = (typeof ROUTE_KEYS)[number];
 
@@ -25,10 +26,14 @@ export const LOCALIZED_ROUTES: Record<RouteKey, Record<Locale, string>> = {
   attractions: { 'pt-BR': '/pontos', en: '/en/attractions', fr: '/fr/attractions' },
   guide: { 'pt-BR': '/info', en: '/en/travel-guide', fr: '/fr/guide-pratique' },
   favorites: { 'pt-BR': '/favoritos', en: '/en/favorites', fr: '/fr/favoris' },
+  bookings: { 'pt-BR': '/reservas', en: '/en/bookings', fr: '/fr/reservations' },
 };
 
+/** Páginas pessoais (favoritos, reservas) ficam fora do sitemap e com noindex. */
+export const PRIVATE_ROUTE_KEYS: readonly RouteKey[] = ['favorites', 'bookings'];
+
 export const INDEXABLE_ROUTE_KEYS: readonly RouteKey[] = ROUTE_KEYS.filter(
-  (key) => key !== 'favorites'
+  (key) => !PRIVATE_ROUTE_KEYS.includes(key)
 );
 
 function normalizePathname(pathname: string): string {

=== src/app/AppRouter.tsx — diff ===
@@ -27,6 +27,7 @@ import { Header } from '../ui/layouts/Header';
 import { SideMenu } from '../ui/layouts/SideMenu';
 
 import { PartnerPortalComposition } from './compositions/PartnerPortalComposition';
+import { ItemBookingComposition } from './compositions/ItemBookingComposition';
 import { AppRoutes } from './routes/AppRoutes';
 
 export function AppRouter() {
@@ -383,7 +384,11 @@ export function AppRouter() {
           <EventDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
         )}
         {selectedItem?.category === 'tour' && (
-          <TourDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
+          <TourDetailModal
+            item={selectedItem}
+            onClose={() => setSelectedItem(null)}
+            bookingPanel={<ItemBookingComposition guideItemId={selectedItem.id} />}
+          />
         )}
         {selectedItem?.category === 'hotel' && (
           <StayDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
@@ -392,7 +397,11 @@ export function AppRouter() {
           <RestaurantDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
         )}
         {selectedItem?.category === 'sight' && (
-          <AttractionDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
+          <AttractionDetailModal
+            item={selectedItem}
+            onClose={() => setSelectedItem(null)}
+            bookingPanel={<ItemBookingComposition guideItemId={selectedItem.id} />}
+          />
         )}
         {selectedItem?.category === 'tips' && (
           <TipDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />

=== src/app/compositions/CheckoutResultComposition.tsx — diff ===
@@ -1,6 +1,7 @@
 import { Clock, SearchX } from 'lucide-react';
 import { useTranslation } from 'react-i18next';
 import { useNavigate, useSearchParams } from 'react-router-dom';
+import { BookingResultView } from '../../domain/bookings';
 import { CheckoutResultView } from '../../domain/ticketing';
 import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
 import { MessagePage } from '../../ui/components/MessagePage';
@@ -13,6 +14,7 @@ export function CheckoutResultComposition() {
   const [searchParams] = useSearchParams();
   const kind = searchParams.get('kind');
   const orderId = searchParams.get('orderId');
+  const bookingId = searchParams.get('bookingId');
   const paymentIntentId = searchParams.get('payment_intent') ?? undefined;
 
   if (kind === 'plan') {
@@ -28,6 +30,10 @@ export function CheckoutResultComposition() {
     );
   }
 
+  if (bookingId) {
+    return <BookingResultView bookingId={bookingId} onViewMyBookings={() => goTo('bookings')} />;
+  }
+
   if (!orderId) {
     return (
       <MessagePage

=== src/app/compositions/ItemBookingComposition.tsx — ARQUIVO NOVO, conteúdo completo ===
import { BookingOfferPanel } from '../../domain/bookings';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import { StripePaymentElement } from '../../domain/payment';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import { useUI } from '../../shared/stores/useUIStore';

/** Liga o painel de reserva (bookings) ao login (auth) e ao Payment Element (payment). */
export function ItemBookingComposition({ guideItemId }: { guideItemId: string }) {
  const { user } = useAuthContext();
  const { openLoginModal } = useUI();
  const { goTo } = useLocalizedRouting();

  return (
    <BookingOfferPanel
      guideItemId={guideItemId}
      isAuthenticated={Boolean(user)}
      onRequireLogin={openLoginModal}
      onViewMyBookings={() => goTo('bookings')}
      renderPaymentElement={({ clientSecret, bookingId, submitLabel, onSucceeded, onFailed }) => (
        <StripePaymentElement
          clientSecret={clientSecret}
          orderId={bookingId}
          returnKind="booking"
          submitLabel={submitLabel}
          onSuccess={onSucceeded}
          onError={onFailed}
        />
      )}
    />
  );
}

=== src/app/compositions/MyBookingsPageComposition.tsx — ARQUIVO NOVO, conteúdo completo ===
import { LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import { MyBookingsView } from '../../domain/bookings';
import { useUI } from '../../shared/stores/useUIStore';
import { MessagePage } from '../../ui/components/MessagePage';

export function MyBookingsPageComposition() {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const { openLoginModal } = useUI();

  if (!user) {
    return (
      <MessagePage
        icon={LogIn}
        title={t('bookings.buyer.myBookingsTitle')}
        description={t('bookings.buyer.loginRequired')}
        actionLabel={t('bookings.buyer.login')}
        onAction={openLoginModal}
      />
    );
  }
  return <MyBookingsView />;
}

=== src/app/routes/AppRoutes.tsx — diff ===
@@ -10,10 +10,14 @@ import { NotFoundView } from '../../ui/components/NotFoundView';
 import { PageLayout } from '../../ui/layouts/PageLayout';
 import { CheckoutResultComposition } from '../compositions/CheckoutResultComposition';
 import { FavoritesPageComposition } from '../compositions/FavoritesPageComposition';
+import { MyBookingsPageComposition } from '../compositions/MyBookingsPageComposition';
 
 type GridCategory = 'event' | 'tour' | 'hotel' | 'restaurant' | 'sight' | 'tips';
 
-const GRID_CATEGORY: Record<Exclude<RouteKey, 'explore' | 'favorites'>, GridCategory> = {
+const GRID_CATEGORY: Record<
+  Exclude<RouteKey, 'explore' | 'favorites' | 'bookings'>,
+  GridCategory
+> = {
   events: 'event',
   tours: 'tour',
   stays: 'hotel',
@@ -38,6 +42,9 @@ export function AppRoutes({ location, onSelectItem, onStickyChange }: AppRoutesP
         </PageLayout>
       );
     }
+    if (routeKey === 'bookings') {
+      return <MyBookingsPageComposition />;
+    }
     if (routeKey === 'favorites') {
       return <FavoritesPageComposition onSelectItem={onSelectItem} />;
     }

=== src/domain/bookings/adapters/firestorePublicOffersAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { queryDocumentsUseCase } from '../../database';
import type { PublicOffer } from '../types/bookings';

/**
 * Leitura direta da projeção pública (AGENTS.md §6.2): só ofertas publicadas, com limite.
 * O filtro por status é obrigatório: a rule só libera documentos com status 'published'.
 */
export async function fetchPublishedOffersForItem(guideItemId: string): Promise<PublicOffer[]> {
  const docs = await queryDocumentsUseCase<Omit<PublicOffer, 'id'> & { id?: string }>(
    'publicBookableOffers',
    [
      { field: 'guideItemId', op: '==', value: guideItemId },
      { field: 'status', op: '==', value: 'published' },
    ],
    undefined,
    10
  );
  return docs.map((doc) => doc as PublicOffer);
}

=== src/domain/bookings/adapters/httpBookingsAdapter.ts — diff ===
@@ -1,7 +1,11 @@
 import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
 import type { BookingsApiPort } from '../ports/bookingsApiPort';
 import type {
+  BookingDetails,
   BookingSummary,
+  CancelBookingResponse,
+  CreateBookingPayload,
+  CreateBookingResponse,
   CreateOfferPayload,
   CreateSlotsPayload,
   OfferFields,
@@ -9,13 +13,18 @@ import type {
   Page,
   PartnerOffer,
   PartnerSlot,
+  PublicSlot,
 } from '../types/bookings';
 
 const OPTIONS = { requireAuth: true, requireAppCheck: true } as const;
 
 /** Lança Error com o `code` estável do backend (AGENTS.md §10.2); a UI traduz pelo código. */
-async function call<T>(path: string, init: RequestInit = { method: 'GET' }): Promise<T> {
-  const response = await firebaseApiFetch(path, init, OPTIONS);
+async function call<T>(
+  path: string,
+  init: RequestInit = { method: 'GET' },
+  options: { requireAuth: boolean; requireAppCheck: boolean } = OPTIONS
+): Promise<T> {
+  const response = await firebaseApiFetch(path, init, options);
   const data = await response.json().catch(() => ({}));
   if (!response.ok) {
     throw new Error(typeof data?.error?.code === 'string' ? data.error.code : 'INTERNAL_ERROR');
@@ -75,4 +84,34 @@ export class HttpBookingsAdapter implements BookingsApiPort {
   async markNoShow(bookingId: string): Promise<BookingSummary> {
     return call(`/api/bookings/${encodeURIComponent(bookingId)}/no-show`, json('POST', {}));
   }
+
+  async listAvailableSlots(offerId: string, fromIso: string, toIso: string): Promise<PublicSlot[]> {
+    const query = new URLSearchParams({ from: fromIso, to: toIso });
+    const path = `/api/bookings/offers/${encodeURIComponent(offerId)}/slots?${query}`;
+    // Rota pública: vagas livres podem ser vistas sem login.
+    return (
+      await call<{ data: PublicSlot[] }>(
+        path,
+        { method: 'GET' },
+        { requireAuth: false, requireAppCheck: true }
+      )
+    ).data;
+  }
+
+  async createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
+    return call('/api/bookings', json('POST', payload));
+  }
+
+  async getBooking(bookingId: string): Promise<BookingDetails> {
+    return call(`/api/bookings/${encodeURIComponent(bookingId)}`);
+  }
+
+  async listMyBookings(cursor?: string | null): Promise<Page<BookingSummary>> {
+    const query = new URLSearchParams({ limit: '20', ...(cursor ? { cursor } : {}) });
+    return call(`/api/bookings/me?${query}`);
+  }
+
+  async cancelBooking(bookingId: string): Promise<CancelBookingResponse> {
+    return call(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, json('POST', {}));
+  }
 }

=== src/domain/bookings/application/usecases/cancelBookingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { CancelBookingResponse } from '../../types/bookings';

export async function cancelBookingUseCase(bookingId: string): Promise<CancelBookingResponse> {
  return bookingsApi.cancelBooking(bookingId);
}

=== src/domain/bookings/application/usecases/createBookingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { CreateBookingPayload, CreateBookingResponse } from '../../types/bookings';

/** Reserva as vagas por 15 min e devolve o segredo do Payment Element; o preço é do backend. */
export async function createBookingUseCase(
  payload: CreateBookingPayload
): Promise<CreateBookingResponse> {
  return bookingsApi.createBooking(payload);
}

=== src/domain/bookings/application/usecases/getBookingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { BookingDetails } from '../../types/bookings';

export async function getBookingUseCase(bookingId: string): Promise<BookingDetails> {
  return bookingsApi.getBooking(bookingId);
}

=== src/domain/bookings/application/usecases/listAvailableSlotsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { PublicSlot } from '../../types/bookings';

export async function listAvailableSlotsUseCase(
  offerId: string,
  fromIso: string,
  toIso: string
): Promise<PublicSlot[]> {
  return bookingsApi.listAvailableSlots(offerId, fromIso, toIso);
}

=== src/domain/bookings/application/usecases/listMyBookingsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { BookingSummary, Page } from '../../types/bookings';

export async function listMyBookingsUseCase(cursor?: string | null): Promise<Page<BookingSummary>> {
  return bookingsApi.listMyBookings(cursor);
}

=== src/domain/bookings/application/usecases/listPublishedOffersForItemUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { fetchPublishedOffersForItem } from '../../adapters/firestorePublicOffersAdapter';
import type { PublicOffer } from '../../types/bookings';

export async function listPublishedOffersForItemUseCase(
  guideItemId: string
): Promise<PublicOffer[]> {
  return fetchPublishedOffersForItem(guideItemId);
}

=== src/domain/bookings/components/buyer/BookingCheckout.tsx — ARQUIVO NOVO, conteúdo completo ===
import { CheckCircle2, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBookingCheckout } from '../../hooks/useBookingCheckout';
import type { CreateBookingPayload } from '../../types/bookings';
import { formatMinor } from '../../utils/money';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, ListError, ListLoading } from '../shared/ListState';
import type { RenderPaymentElement } from './types';

interface BookingCheckoutProps {
  request: Omit<CreateBookingPayload, 'idempotencyKey' | 'locale'>;
  renderPaymentElement: RenderPaymentElement;
  onViewMyBookings: () => void;
  onRestart: () => void;
}

function useCountdown(expiresAt: string | null): number | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, [expiresAt]);
  return expiresAt ? Math.max(0, new Date(expiresAt).getTime() - now) : null;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

export function BookingCheckout({
  request,
  renderPaymentElement,
  onViewMyBookings,
  onRestart,
}: BookingCheckoutProps) {
  const { t, i18n } = useTranslation();
  const { status, error, checkout, start, waitForConfirmation, fail, reset } = useBookingCheckout();
  const remaining = useCountdown(status === 'ready' ? (checkout?.expiresAt ?? null) : null);

  useEffect(() => {
    if (status === 'idle') void start(request);
  }, [status, start, request]);

  if (status === 'confirmed') {
    return (
      <div role="status" className="py-4 flex flex-col items-center text-center gap-2">
        <CheckCircle2 size={36} className="text-emerald-400" aria-hidden="true" />
        <p className="text-base font-bold text-white">{t('bookings.buyer.confirmedTitle')}</p>
        <p className="text-xs text-white/70">{t('bookings.buyer.confirmedDescription')}</p>
        <button type="button" onClick={onViewMyBookings} className={BUTTON_PRIMARY}>
          {t('bookings.buyer.viewMyBookings')}
        </button>
      </div>
    );
  }

  if (remaining === 0) {
    return (
      <div className="space-y-3">
        <ListError message={t('bookings.buyer.expired')} onRetry={onRestart} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {status === 'starting' && <ListLoading label={t('bookings.buyer.loading')} />}
      {error && (
        <ListError
          message={error}
          onRetry={() => {
            // Nova tentativa = nova chave de idempotência (outra reserva).
            reset();
          }}
        />
      )}
      {(status === 'confirming' || status === 'delayed') && (
        <div
          role="status"
          className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2"
        >
          <Clock
            size={16}
            className="text-amber-300 shrink-0 mt-0.5 animate-pulse"
            aria-hidden="true"
          />
          <div className="text-xs text-amber-100 space-y-1">
            <p className="font-bold">{t('bookings.buyer.pendingTitle')}</p>
            <p>
              {status === 'delayed'
                ? t('bookings.buyer.delayed')
                : t('bookings.buyer.pendingDescription')}
            </p>
          </div>
        </div>
      )}
      {status === 'delayed' && (
        <button type="button" onClick={onViewMyBookings} className={BUTTON_SECONDARY}>
          {t('bookings.buyer.viewMyBookings')}
        </button>
      )}
      {status === 'ready' && checkout && (
        <>
          {remaining !== null && (
            <p className="text-xs text-white/70" aria-live="polite">
              {t('bookings.buyer.expiresIn', { time: formatRemaining(remaining) })}
            </p>
          )}
          {renderPaymentElement({
            clientSecret: checkout.clientSecret,
            bookingId: checkout.bookingId,
            submitLabel: t('bookings.buyer.payButton', {
              amount: formatMinor(checkout.totalMinor, i18n.language),
            }),
            onSucceeded: waitForConfirmation,
            onFailed: fail,
          })}
        </>
      )}
    </div>
  );
}

=== src/domain/bookings/components/buyer/BookingFlow.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PublicOffer, PublicSlot } from '../../types/bookings';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../shared/ListState';
import { BookingCheckout } from './BookingCheckout';
import { ParticipantsForm } from './ParticipantsForm';
import { QuantitySelector } from './QuantitySelector';
import { SlotPicker } from './SlotPicker';
import type { RenderPaymentElement } from './types';

export interface BookingFlowProps {
  offer: PublicOffer;
  isAuthenticated: boolean;
  onRequireLogin: () => void;
  onViewMyBookings: () => void;
  renderPaymentElement: RenderPaymentElement;
}

type Step = 'select' | 'participants' | 'checkout';

export function BookingFlow({
  offer,
  isAuthenticated,
  onRequireLogin,
  onViewMyBookings,
  renderPaymentElement,
}: BookingFlowProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('select');
  const [slot, setSlot] = useState<PublicSlot | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [names, setNames] = useState<string[]>([]);
  const participants = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
  const maxParticipants = Math.min(offer.maxParticipantsPerBooking, slot?.available ?? 0);

  const request = useMemo(
    () => ({
      offerId: offer.id,
      slotId: slot?.id ?? '',
      lines: Object.entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([priceOptionId, quantity]) => ({ priceOptionId, quantity })),
      participants: names.map((name) => ({ name })),
    }),
    [offer.id, slot?.id, quantities, names]
  );

  const proceed = () => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    setStep(offer.requiresParticipantNames ? 'participants' : 'checkout');
  };

  const restart = () => {
    setStep('select');
    setSlot(null);
    setQuantities({});
    setNames([]);
  };

  if (step === 'checkout') {
    return (
      <BookingCheckout
        request={request}
        renderPaymentElement={renderPaymentElement}
        onViewMyBookings={onViewMyBookings}
        onRestart={restart}
      />
    );
  }

  if (step === 'participants') {
    return (
      <div className="space-y-3">
        <button type="button" onClick={() => setStep('select')} className={BUTTON_SECONDARY}>
          <ArrowLeft size={13} className="inline mr-1" aria-hidden="true" />
          {t('bookings.buyer.back')}
        </button>
        <ParticipantsForm
          count={participants}
          onSubmit={(submitted) => {
            setNames(submitted);
            setStep('checkout');
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SlotPicker
        offerId={offer.id}
        selectedId={slot?.id ?? null}
        onSelect={(selected) => {
          setSlot(selected);
          setQuantities({});
        }}
      />
      {slot && (
        <QuantitySelector
          options={offer.pricing.priceOptions}
          maxParticipants={maxParticipants}
          value={quantities}
          onChange={setQuantities}
        />
      )}
      {slot && participants > 0 && !isAuthenticated && (
        <p className="text-xs text-white/70">{t('bookings.buyer.loginRequired')}</p>
      )}
      {slot && (
        <button
          type="button"
          disabled={participants === 0}
          onClick={proceed}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {isAuthenticated ? t('bookings.buyer.continue') : t('bookings.buyer.login')}
        </button>
      )}
    </div>
  );
}

=== src/domain/bookings/components/buyer/BookingOfferPanel.tsx — ARQUIVO NOVO, conteúdo completo ===
import { CalendarCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../../ui/components/GlassCard';
import { usePublishedOffers } from '../../hooks/usePublishedOffers';
import type { LocalizedText } from '../../types/bookings';
import { formatMinor } from '../../utils/money';
import { BookingFlow, type BookingFlowProps } from './BookingFlow';
import { OfferPolicySummary } from './OfferPolicySummary';

function textFor(text: LocalizedText | undefined, language: string): string {
  if (!text) return '';
  const key = language === 'en' || language === 'fr' ? language : 'pt-BR';
  return text[key] || text['pt-BR'];
}

interface BookingOfferPanelProps extends Omit<BookingFlowProps, 'offer'> {
  guideItemId: string;
}

/** Painel de reserva dentro do detalhe do item; sem oferta publicada não renderiza nada. */
export function BookingOfferPanel({ guideItemId, ...flowProps }: BookingOfferPanelProps) {
  const { t, i18n } = useTranslation();
  const { data, loading } = usePublishedOffers(guideItemId);
  if (loading || data.length === 0) return null;

  return (
    <div className="space-y-3">
      {data.map((offer) => {
        const fromMinor = Math.min(
          ...offer.pricing.priceOptions.map((option) => option.unitAmountMinor)
        );
        return (
          <GlassCard key={offer.id} className="p-5 space-y-4 border border-white/10">
            <div className="flex items-start gap-3">
              <CalendarCheck size={20} className="text-teal-300 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white break-words">
                  {textFor(offer.title, i18n.language)}
                </h3>
                <p className="text-xs text-white/70">
                  {t('bookings.partner.fromPrice', {
                    amount: formatMinor(fromMinor, i18n.language),
                  })}
                </p>
              </div>
            </div>
            {offer.description && (
              <p className="text-sm text-white/80 whitespace-pre-line">
                {textFor(offer.description, i18n.language)}
              </p>
            )}
            <OfferPolicySummary offer={offer} />
            <BookingFlow offer={offer} {...flowProps} />
          </GlassCard>
        );
      })}
    </div>
  );
}

=== src/domain/bookings/components/buyer/BookingResultView.tsx — ARQUIVO NOVO, conteúdo completo ===
import { CheckCircle2, Clock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../../ui/components/GlassCard';
import { getBookingUseCase } from '../../application/usecases/getBookingUseCase';
import type { BookingStatus } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { BUTTON_PRIMARY, ListError, ListLoading } from '../shared/ListState';

/** Retorno do Stripe para reservas: só mostra o status; quem confirma é o webhook. */
export function BookingResultView({
  bookingId,
  onViewMyBookings,
}: {
  bookingId: string;
  onViewMyBookings: () => void;
}) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<BookingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    getBookingUseCase(bookingId)
      .then((booking) => setStatus(booking.status))
      .catch((err: unknown) => setError(getBookingErrorMessage(err)));
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <GlassCard className="p-8 flex flex-col items-center text-center gap-4">
        <h1 className="text-xl font-display font-black text-white">
          {t('bookings.buyer.resultTitle')}
        </h1>
        {!status && !error && <ListLoading label={t('bookings.buyer.resultLoading')} />}
        {error && <ListError message={error} onRetry={load} />}
        {status === 'confirmed' && (
          <>
            <CheckCircle2 size={36} className="text-emerald-400" aria-hidden="true" />
            <p className="text-sm text-white/80">{t('bookings.buyer.confirmedDescription')}</p>
          </>
        )}
        {status && status !== 'confirmed' && (
          <>
            <Clock size={36} className="text-amber-300" aria-hidden="true" />
            <p className="text-sm text-white/80">{t(`bookings.bookingStatus.${status}`)}</p>
          </>
        )}
        <button type="button" onClick={onViewMyBookings} className={BUTTON_PRIMARY}>
          {t('bookings.buyer.viewMyBookings')}
        </button>
      </GlassCard>
    </div>
  );
}

=== src/domain/bookings/components/buyer/MyBookingsView.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { useMyBookings } from '../../hooks/useMyBookings';
import type { BookingSummary } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { formatSlotDateTime } from '../../utils/dates';
import { formatMinor } from '../../utils/money';
import { previewRefund } from '../../utils/refundPreview';
import { BUTTON_SECONDARY, ListEmpty, ListError, ListLoading } from '../shared/ListState';

function BookingCard({ booking, onCancel }: { booking: BookingSummary; onCancel?: () => void }) {
  const { t, i18n } = useTranslation();
  return (
    <li className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white break-words">{booking.offer.title}</p>
          <p className="text-xs text-white/70">
            {formatSlotDateTime(booking.offer.startsAt, i18n.language)}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 text-white/80">
          {t(`bookings.bookingStatus.${booking.status}`)}
        </span>
      </div>
      <p className="text-xs text-white/70">
        {t('bookings.bookingsList.participants', { count: booking.participantsCount })} ·{' '}
        {formatMinor(booking.totalMinor, i18n.language)}
      </p>
      {booking.offer.meetingPoint && (
        <p className="text-xs text-white/70">
          {t('bookings.buyer.meetingPoint', { address: booking.offer.meetingPoint })}
        </p>
      )}
      {onCancel && (
        <button type="button" onClick={onCancel} className={BUTTON_SECONDARY}>
          {t('bookings.buyer.cancelBooking')}
        </button>
      )}
    </li>
  );
}

export function MyBookingsView() {
  const { t, i18n } = useTranslation();
  const { data, loading, error, hasMore, reload, loadMore, cancel } = useMyBookings();
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const now = new Date();
  const upcoming = data.filter((booking) => new Date(booking.offer.startsAt) > now);
  const past = data.filter((booking) => new Date(booking.offer.startsAt) <= now);

  const requestCancel = (booking: BookingSummary) => {
    // Só para mostrar antes de confirmar; o valor devolvido é decidido pelo backend.
    const preview = previewRefund({
      policy: booking.offer.cancellationPolicy,
      startsAt: booking.offer.startsAt,
      totalMinor: booking.totalMinor,
      now: new Date(),
    });
    const amount = formatMinor(preview.refundAmountMinor, i18n.language);
    setConfirm({
      message:
        preview.refundAmountMinor > 0
          ? t('bookings.buyer.confirmCancelRefund', { amount })
          : t('bookings.buyer.confirmCancelNoRefund'),
      onCancel: () => setConfirm(null),
      onConfirm: async () => {
        setConfirm(null);
        try {
          const result = await cancel(booking.id);
          setNotice(
            result.refundAmountMinor > 0
              ? t('bookings.buyer.canceledWithRefund', {
                  amount: formatMinor(result.refundAmountMinor, i18n.language),
                })
              : t('bookings.buyer.canceledNoRefund')
          );
        } catch (err: unknown) {
          setNotice(getBookingErrorMessage(err));
        }
      },
    });
  };

  return (
    <section className="max-w-2xl mx-auto px-4 pb-32 space-y-5">
      <h1 className="text-2xl font-display font-black text-white">
        {t('bookings.buyer.myBookingsTitle')}
      </h1>
      {notice && (
        <p role="status" className="text-sm text-teal-200">
          {notice}
        </p>
      )}
      {error && <ListError message={error} onRetry={() => void reload()} />}
      {!error && !loading && data.length === 0 && (
        <ListEmpty message={t('bookings.buyer.emptyBookings')} />
      )}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-white/80">{t('bookings.buyer.upcoming')}</h2>
          <ul className="space-y-2">
            {upcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={booking.status === 'confirmed' ? () => requestCancel(booking) : undefined}
              />
            ))}
          </ul>
        </div>
      )}
      {past.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-white/80">{t('bookings.buyer.past')}</h2>
          <ul className="space-y-2">
            {past.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </ul>
        </div>
      )}
      {loading && <ListLoading label={t('bookings.buyer.loading')} />}
      {!loading && hasMore && (
        <button type="button" onClick={() => void loadMore()} className={BUTTON_SECONDARY}>
          {t('bookings.buyer.loadMore')}
        </button>
      )}
      <ConfirmDialog data={confirm} />
    </section>
  );
}

=== src/domain/bookings/components/buyer/OfferPolicySummary.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Clock, MapPin, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PublicOffer } from '../../types/bookings';

/** Política de cancelamento exibida ANTES da compra (AGENTS.md §8.7). */
export function OfferPolicySummary({ offer }: { offer: PublicOffer }) {
  const { t } = useTranslation();
  const policy = offer.cancellationPolicy;
  return (
    <ul className="space-y-1.5 text-xs text-white/70">
      {offer.durationMinutes ? (
        <li className="flex items-center gap-2">
          <Clock size={14} className="text-teal-300 shrink-0" aria-hidden="true" />
          {t('bookings.buyer.duration', { minutes: offer.durationMinutes })}
        </li>
      ) : null}
      {offer.meetingPoint ? (
        <li className="flex items-center gap-2">
          <MapPin size={14} className="text-teal-300 shrink-0" aria-hidden="true" />
          {t('bookings.buyer.meetingPoint', { address: offer.meetingPoint.address })}
        </li>
      ) : null}
      <li className="flex items-start gap-2">
        <ShieldCheck size={14} className="text-teal-300 shrink-0 mt-0.5" aria-hidden="true" />
        {policy.freeCancellationHoursBefore > 0
          ? t('bookings.buyer.policyFree', {
              hours: policy.freeCancellationHoursBefore,
              percent: policy.refundPercentAfterDeadline,
            })
          : t('bookings.buyer.policyNoFree', { percent: policy.refundPercentAfterDeadline })}
      </li>
    </ul>
  );
}

=== src/domain/bookings/components/buyer/ParticipantsForm.tsx — ARQUIVO NOVO, conteúdo completo ===
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { participantsFormSchema } from '../../schemas/participantsFormSchema';
import { BUTTON_PRIMARY, INPUT } from '../shared/ListState';

interface ParticipantsFormProps {
  count: number;
  onSubmit: (names: string[]) => void;
}

export function ParticipantsForm({ count, onSubmit }: ParticipantsFormProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => participantsFormSchema(count), [count]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ names: string[] }>({
    resolver: zodResolver(schema),
    defaultValues: { names: Array.from({ length: count }, () => '') },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values.names.map((name) => name.trim())))}
      className="space-y-2"
      noValidate
    >
      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold text-white/70">
          {t('bookings.buyer.participantsLegend')}
        </legend>
        {Array.from({ length: count }, (_, index) => (
          <label key={index} className="block space-y-1">
            <span className="text-xs text-white/70">
              {t('bookings.buyer.participantName', { index: index + 1 })}
            </span>
            <input {...register(`names.${index}`)} autoComplete="name" className={INPUT} />
            {errors.names?.[index]?.message && (
              <span role="alert" className="text-xs text-red-300">
                {t(errors.names[index]?.message ?? '')}
              </span>
            )}
          </label>
        ))}
      </fieldset>
      <button type="submit" className={BUTTON_PRIMARY}>
        {t('bookings.buyer.continue')}
      </button>
    </form>
  );
}

=== src/domain/bookings/components/buyer/QuantitySelector.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PriceOption } from '../../types/bookings';
import { formatMinor } from '../../utils/money';

interface QuantitySelectorProps {
  options: PriceOption[];
  /** Limite da reserva, já limitado às vagas livres do horário. */
  maxParticipants: number;
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
}

function labelOf(option: PriceOption, language: string): string {
  const key = language === 'en' || language === 'fr' ? language : 'pt-BR';
  return option.label[key] || option.label['pt-BR'];
}

export function QuantitySelector({
  options,
  maxParticipants,
  value,
  onChange,
}: QuantitySelectorProps) {
  const { t, i18n } = useTranslation();
  const total = Object.values(value).reduce((sum, quantity) => sum + quantity, 0);
  // Só para exibição: o backend recalcula o preço a partir da oferta (AGENTS.md §8.5).
  const totalMinor = options.reduce(
    (sum, option) => sum + (value[option.id] ?? 0) * option.unitAmountMinor,
    0
  );

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold text-white/70">
        {t('bookings.buyer.quantityLegend')}
      </legend>
      {options.map((option) => {
        const quantity = value[option.id] ?? 0;
        const label = labelOf(option, i18n.language);
        const canIncrease =
          total < maxParticipants &&
          (option.maxQuantity === undefined || quantity < option.maxQuantity);
        return (
          <div
            key={option.id}
            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <div>
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-xs text-white/60">
                {formatMinor(option.unitAmountMinor, i18n.language)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={t('bookings.buyer.decrease', { label })}
                disabled={quantity === 0}
                onClick={() => onChange({ ...value, [option.id]: quantity - 1 })}
                className="w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center disabled:opacity-40 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <Minus size={16} aria-hidden="true" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-white" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                aria-label={t('bookings.buyer.increase', { label })}
                disabled={!canIncrease}
                onClick={() => onChange({ ...value, [option.id]: quantity + 1 })}
                className="w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center disabled:opacity-40 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        );
      })}
      <p className="text-xs text-white/60">
        {t('bookings.buyer.maxParticipants', { count: maxParticipants })}
      </p>
      <p className="flex justify-between text-sm font-bold text-white">
        <span>{t('bookings.buyer.totalLabel')}</span>
        <span>{formatMinor(totalMinor, i18n.language)}</span>
      </p>
    </fieldset>
  );
}

=== src/domain/bookings/components/buyer/SlotPicker.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import { usePublicSlots } from '../../hooks/usePublicSlots';
import type { PublicSlot } from '../../types/bookings';
import { formatDayLabel, formatSlotTime, fortalezaDateKey } from '../../utils/dates';
import { ListEmpty, ListError, ListLoading } from '../shared/ListState';

interface SlotPickerProps {
  offerId: string;
  selectedId: string | null;
  onSelect: (slot: PublicSlot) => void;
}

export function SlotPicker({ offerId, selectedId, onSelect }: SlotPickerProps) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, reload } = usePublicSlots(offerId);

  if (loading) return <ListLoading label={t('bookings.buyer.loading')} />;
  if (error) return <ListError message={error} onRetry={() => void reload()} />;
  if (data.length === 0) return <ListEmpty message={t('bookings.buyer.noSlots')} />;

  const days = new Map<string, PublicSlot[]>();
  for (const slot of data) {
    const key = fortalezaDateKey(slot.startsAt);
    days.set(key, [...(days.get(key) ?? []), slot]);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-semibold text-white/70">
        {t('bookings.buyer.chooseSlot')}
      </legend>
      {[...days.entries()].map(([day, slots]) => (
        <div key={day} className="space-y-1.5">
          <p className="text-xs font-bold text-white/80">
            {formatDayLabel(slots[0]!.startsAt, i18n.language)}
          </p>
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => {
              const soldOut = slot.available <= 0;
              const selected = slot.id === selectedId;
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={soldOut}
                  aria-pressed={selected}
                  onClick={() => onSelect(slot)}
                  className={`min-h-11 px-3 rounded-xl text-left text-xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50 ${
                    selected
                      ? 'bg-teal-500/25 text-teal-100 ring-2 ring-teal-400/60'
                      : 'bg-white/5 text-white/80'
                  }`}
                >
                  <span className="block font-bold">
                    {formatSlotTime(slot.startsAt, i18n.language)}
                  </span>
                  <span className="block">
                    {soldOut
                      ? t('bookings.buyer.soldOut')
                      : t('bookings.buyer.spotsLeft', { count: slot.available })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </fieldset>
  );
}

=== src/domain/bookings/components/buyer/buyerComponents.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import { useBookingCheckout } from '../../hooks/useBookingCheckout';
import type { PublicOffer } from '../../types/bookings';
import { previewRefund } from '../../utils/refundPreview';
import { BookingOfferPanel } from './BookingOfferPanel';
import { QuantitySelector } from './QuantitySelector';
import { SlotPicker } from './SlotPicker';

vi.mock('../../application/usecases/listAvailableSlotsUseCase', () => ({
  listAvailableSlotsUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/createBookingUseCase', () => ({
  createBookingUseCase: vi.fn(),
}));
vi.mock('../../application/usecases/getBookingUseCase', () => ({ getBookingUseCase: vi.fn() }));
vi.mock('../../application/usecases/listPublishedOffersForItemUseCase', () => ({
  listPublishedOffersForItemUseCase: vi.fn(),
}));

import { createBookingUseCase } from '../../application/usecases/createBookingUseCase';
import { listAvailableSlotsUseCase } from '../../application/usecases/listAvailableSlotsUseCase';
import { listPublishedOffersForItemUseCase } from '../../application/usecases/listPublishedOffersForItemUseCase';

const OPTIONS = [
  { id: 'adult', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 10000 },
  { id: 'child', label: { 'pt-BR': 'Criança' }, unitAmountMinor: 5000, maxQuantity: 1 },
];

describe('componentes de compra', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('SlotPicker desabilita horários esgotados', async () => {
    vi.mocked(listAvailableSlotsUseCase).mockResolvedValue([
      { id: 's1', startsAt: '2026-11-10T11:00:00.000Z', available: 0 },
      { id: 's2', startsAt: '2026-11-10T17:00:00.000Z', available: 3 },
    ]);
    render(<SlotPicker offerId="offer-1" selectedId={null} onSelect={vi.fn()} />);
    const soldOut = await screen.findByRole('button', { name: /Esgotado/ });
    expect((soldOut as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: /3 vagas/ }) as HTMLButtonElement).disabled).toBe(
      false
    );
  });

  it('QuantitySelector respeita o limite total e o máximo da opção', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <QuantitySelector
        options={OPTIONS}
        maxParticipants={2}
        value={{ adult: 2 }}
        onChange={onChange}
      />
    );
    expect(
      (screen.getByRole('button', { name: 'Adicionar Adulto' }) as HTMLButtonElement).disabled
    ).toBe(true);
    expect(
      (screen.getByRole('button', { name: 'Adicionar Criança' }) as HTMLButtonElement).disabled
    ).toBe(true);
    rerender(
      <QuantitySelector
        options={OPTIONS}
        maxParticipants={4}
        value={{ child: 1 }}
        onChange={onChange}
      />
    );
    expect(
      (screen.getByRole('button', { name: 'Adicionar Criança' }) as HTMLButtonElement).disabled
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Adulto' }));
    expect(onChange).toHaveBeenCalledWith({ child: 1, adult: 1 });
  });

  it('atração sem oferta publicada não mostra painel de reserva', async () => {
    vi.mocked(listPublishedOffersForItemUseCase).mockResolvedValue([]);
    const { container } = render(
      <BookingOfferPanel
        guideItemId="sight-public"
        isAuthenticated
        onRequireLogin={vi.fn()}
        onViewMyBookings={vi.fn()}
        renderPaymentElement={() => null}
      />
    );
    await waitFor(() =>
      expect(listPublishedOffersForItemUseCase).toHaveBeenCalledWith('sight-public')
    );
    expect(container.innerHTML).toBe('');
  });

  it('oferta publicada mostra a política de cancelamento antes da compra', async () => {
    const offer: PublicOffer = {
      id: 'offer-1',
      guideItemId: 'tour-1',
      kind: 'tour',
      status: 'published',
      title: { 'pt-BR': 'Passeio de buggy', en: 'Buggy tour' },
      pricing: { currency: 'BRL', priceOptions: OPTIONS },
      cancellationPolicy: { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 50 },
      maxParticipantsPerBooking: 6,
      requiresParticipantNames: false,
      updatedAt: '',
    };
    vi.mocked(listPublishedOffersForItemUseCase).mockResolvedValue([offer]);
    vi.mocked(listAvailableSlotsUseCase).mockResolvedValue([]);
    await i18n.changeLanguage('en');
    render(
      <BookingOfferPanel
        guideItemId="tour-1"
        isAuthenticated
        onRequireLogin={vi.fn()}
        onViewMyBookings={vi.fn()}
        renderPaymentElement={() => null}
      />
    );
    expect(await screen.findByText('Buggy tour')).toBeTruthy();
    expect(screen.getByText(/Free cancellation up to 24 h before/)).toBeTruthy();
    await i18n.changeLanguage('pt-BR');
  });
});

describe('useBookingCheckout', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reenviar usa a mesma chave; "tentar novamente" gera outra', async () => {
    vi.mocked(createBookingUseCase).mockRejectedValue(new Error('INSUFFICIENT_CAPACITY'));
    const { result } = renderHook(() => useBookingCheckout());
    const request = {
      offerId: 'o',
      slotId: 's',
      lines: [{ priceOptionId: 'adult', quantity: 1 }],
      participants: [],
    };
    await act(async () => {
      await result.current.start(request);
    });
    await act(async () => {
      await result.current.start(request);
    });
    const [first, second] = vi
      .mocked(createBookingUseCase)
      .mock.calls.map((call) => call[0].idempotencyKey);
    expect(first).toBe(second);
    act(() => result.current.reset());
    await act(async () => {
      await result.current.start(request);
    });
    expect(vi.mocked(createBookingUseCase).mock.calls[2]![0].idempotencyKey).not.toBe(first);
    expect(result.current.error).toBe('Não há vagas suficientes neste horário.');
  });
});

describe('previewRefund', () => {
  const policy = { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 50 as const };
  const startsAt = '2026-11-10T11:00:00.000Z';
  it('mostra 100%, 50% e 0% conforme o momento', () => {
    expect(
      previewRefund({
        policy,
        startsAt,
        totalMinor: 20000,
        now: new Date('2026-11-08T11:00:00.000Z'),
      })
    ).toEqual({ refundPercent: 100, refundAmountMinor: 20000 });
    expect(
      previewRefund({
        policy,
        startsAt,
        totalMinor: 20000,
        now: new Date('2026-11-10T00:00:00.000Z'),
      })
    ).toEqual({ refundPercent: 50, refundAmountMinor: 10000 });
    expect(
      previewRefund({
        policy,
        startsAt,
        totalMinor: 20000,
        now: new Date('2026-11-10T12:00:00.000Z'),
      })
    ).toEqual({ refundPercent: 0, refundAmountMinor: 0 });
  });
});

=== src/domain/bookings/components/buyer/types.ts — ARQUIVO NOVO, conteúdo completo ===
import type { ReactNode } from 'react';

/** Props neutras do Payment Element, montado pela composição (o domínio não importa o payment). */
export interface PaymentElementSlotProps {
  clientSecret: string;
  bookingId: string;
  submitLabel: string;
  onSucceeded: () => void;
  onFailed: (message: string) => void;
}

export type RenderPaymentElement = (props: PaymentElementSlotProps) => ReactNode;

=== src/domain/bookings/hooks/useBookingCheckout.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LOCALE, normalizeLocale } from '../../../shared/i18n';
import { createBookingUseCase } from '../application/usecases/createBookingUseCase';
import { getBookingUseCase } from '../application/usecases/getBookingUseCase';
import type { CreateBookingPayload, CreateBookingResponse } from '../types/bookings';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

// Pix pode levar alguns minutos para confirmar; o webhook é a fonte da verdade (AGENTS.md §8.4).
const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 2 * 60_000;

export type BookingCheckoutStatus =
  | 'idle'
  | 'starting'
  | 'ready'
  | 'confirming'
  | 'confirmed'
  | 'delayed'
  | 'failed';

export function useBookingCheckout() {
  const { i18n } = useTranslation();
  const [status, setStatus] = useState<BookingCheckoutStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<CreateBookingResponse | null>(null);
  // Uma chave por tentativa: reenviar o mesmo pedido não cria outra reserva.
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);
  useEffect(() => stop, [stop]);

  const start = useCallback(
    async (payload: Omit<CreateBookingPayload, 'idempotencyKey' | 'locale'>) => {
      setStatus('starting');
      setError(null);
      try {
        const response = await createBookingUseCase({
          ...payload,
          idempotencyKey: idempotencyKeyRef.current,
          locale: normalizeLocale(i18n.language) ?? DEFAULT_LOCALE,
        });
        setCheckout(response);
        setStatus(response.status === 'confirmed' ? 'confirmed' : 'ready');
      } catch (err: unknown) {
        setError(getBookingErrorMessage(err));
        setStatus('failed');
      }
    },
    [i18n.language]
  );

  const waitForConfirmation = useCallback(() => {
    if (!checkout) return;
    stop();
    setStatus('confirming');
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    const poll = async () => {
      try {
        const booking = await getBookingUseCase(checkout.bookingId);
        if (booking.status === 'confirmed') {
          setStatus('confirmed');
          return;
        }
      } catch {
        // Falha pontual: tenta de novo até o prazo.
      }
      if (Date.now() >= deadline) {
        setStatus('delayed');
        return;
      }
      timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    };
    void poll();
  }, [checkout, stop]);

  const reset = useCallback(() => {
    stop();
    idempotencyKeyRef.current = crypto.randomUUID();
    setCheckout(null);
    setError(null);
    setStatus('idle');
  }, [stop]);

  return { status, error, checkout, start, waitForConfirmation, fail: setError, reset };
}

=== src/domain/bookings/hooks/useMyBookings.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { cancelBookingUseCase } from '../application/usecases/cancelBookingUseCase';
import { listMyBookingsUseCase } from '../application/usecases/listMyBookingsUseCase';
import type { BookingSummary, CancelBookingResponse } from '../types/bookings';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

export function useMyBookings() {
  const [data, setData] = useState<BookingSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (cursor: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const page = await listMyBookingsUseCase(cursor);
      setData((current) => (cursor ? [...current, ...page.data] : page.data));
      setNextCursor(page.nextCursor);
    } catch (err: unknown) {
      setError(getBookingErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(null);
  }, [load]);

  const cancel = useCallback(async (bookingId: string): Promise<CancelBookingResponse> => {
    const result = await cancelBookingUseCase(bookingId);
    setData((current) =>
      current.map((booking) =>
        booking.id === bookingId ? { ...booking, status: result.status } : booking
      )
    );
    return result;
  }, []);

  return {
    data,
    loading,
    error,
    hasMore: nextCursor !== null,
    reload: () => load(null),
    loadMore: () => load(nextCursor),
    cancel,
  };
}

=== src/domain/bookings/hooks/usePublicSlots.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { listAvailableSlotsUseCase } from '../application/usecases/listAvailableSlotsUseCase';
import type { PublicSlot } from '../types/bookings';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

const WINDOW_DAYS = 30;

export function usePublicSlots(offerId: string) {
  const [data, setData] = useState<PublicSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const from = new Date();
    const to = new Date(from.getTime() + WINDOW_DAYS * 86_400_000);
    try {
      setData(await listAvailableSlotsUseCase(offerId, from.toISOString(), to.toISOString()));
    } catch (err: unknown) {
      setError(getBookingErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [offerId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}

=== src/domain/bookings/hooks/usePublishedOffers.ts — ARQUIVO NOVO, conteúdo completo ===
import { useEffect, useState } from 'react';
import { listPublishedOffersForItemUseCase } from '../application/usecases/listPublishedOffersForItemUseCase';
import type { PublicOffer } from '../types/bookings';

export function usePublishedOffers(guideItemId: string) {
  const [data, setData] = useState<PublicOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listPublishedOffersForItemUseCase(guideItemId)
      .then((offers) => {
        if (active) setData(offers);
      })
      .catch(() => {
        // Sem oferta legível (ou erro de rede) o painel simplesmente não aparece.
        if (active) setData([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [guideItemId]);

  return { data, loading };
}

=== src/domain/bookings/index.ts — diff ===
@@ -1,3 +1,7 @@
-// Componente público apenas para src/app/compositions (AGENTS.md §5.2 item 5).
+// Componentes públicos apenas para src/app/compositions (AGENTS.md §5.2 item 5).
+export { BookingOfferPanel } from './components/buyer/BookingOfferPanel';
+export { BookingResultView } from './components/buyer/BookingResultView';
+export { MyBookingsView } from './components/buyer/MyBookingsView';
+export type { PaymentElementSlotProps, RenderPaymentElement } from './components/buyer/types';
 export { PartnerOffersManager } from './components/partner/PartnerOffersManager';
 export type { BookableGuideItem } from './types/bookings';

=== src/domain/bookings/ports/bookingsApiPort.ts — diff ===
@@ -1,5 +1,9 @@
 import type {
+  BookingDetails,
   BookingSummary,
+  CancelBookingResponse,
+  CreateBookingPayload,
+  CreateBookingResponse,
   CreateOfferPayload,
   CreateSlotsPayload,
   OfferFields,
@@ -7,6 +11,7 @@ import type {
   Page,
   PartnerOffer,
   PartnerSlot,
+  PublicSlot,
 } from '../types/bookings';
 
 export interface BookingsApiPort {
@@ -19,4 +24,10 @@ export interface BookingsApiPort {
   cancelSlot(offerId: string, slotId: string): Promise<{ canceledBookings: number }>;
   listOfferBookings(offerId: string, cursor?: string | null): Promise<Page<BookingSummary>>;
   markNoShow(bookingId: string): Promise<BookingSummary>;
+
+  listAvailableSlots(offerId: string, fromIso: string, toIso: string): Promise<PublicSlot[]>;
+  createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse>;
+  getBooking(bookingId: string): Promise<BookingDetails>;
+  listMyBookings(cursor?: string | null): Promise<Page<BookingSummary>>;
+  cancelBooking(bookingId: string): Promise<CancelBookingResponse>;
 }

=== src/domain/bookings/schemas/participantsFormSchema.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';

/** Um nome (2–80 caracteres) por participante; mensagens são chaves de tradução. */
export function participantsFormSchema(count: number) {
  return z.object({
    names: z
      .array(
        z
          .string()
          .trim()
          .min(2, 'bookings.validation.required')
          .max(80, 'bookings.validation.tooLong')
      )
      .length(count),
  });
}

=== src/domain/bookings/types/bookings.ts — diff ===
@@ -124,3 +124,39 @@ export interface BookableGuideItem {
   name: string;
   category: string;
 }
+
+/** Oferta publicada lida da projeção pública `publicBookableOffers` (sem dono nem parceiro). */
+export interface PublicOffer extends OfferFields {
+  id: string;
+  guideItemId: string;
+  kind: OfferKind;
+  status: 'published';
+  updatedAt: string;
+}
+
+export interface CreateBookingPayload {
+  offerId: string;
+  slotId: string;
+  lines: Array<{ priceOptionId: string; quantity: number }>;
+  participants: Array<{ name: string }>;
+  idempotencyKey: string;
+  locale: 'pt-BR' | 'en' | 'fr';
+}
+
+export interface CreateBookingResponse {
+  bookingId: string;
+  status: BookingStatus;
+  clientSecret: string;
+  totalMinor: number;
+  expiresAt: string | null;
+}
+
+export interface BookingDetails extends BookingSummary {
+  participants: Array<{ name: string; isLeadContact: boolean }>;
+}
+
+export interface CancelBookingResponse {
+  status: BookingStatus;
+  refundPercent: RefundPercent;
+  refundAmountMinor: number;
+}

=== src/domain/bookings/utils/refundPreview.ts — ARQUIVO NOVO, conteúdo completo ===
import type { CancellationPolicy, RefundPercent } from '../types/bookings';

const HOUR_MS = 60 * 60 * 1000;

/**
 * Mesma regra de server/domain/bookings/utils/cancellationRefund.ts, só para mostrar o valor antes de
 * cancelar. Quem decide o reembolso é o backend.
 */
export function previewRefund(params: {
  policy: CancellationPolicy;
  startsAt: string;
  totalMinor: number;
  now: Date;
}): { refundPercent: RefundPercent; refundAmountMinor: number } {
  const startsAtMs = new Date(params.startsAt).getTime();
  const nowMs = params.now.getTime();
  let refundPercent: RefundPercent;
  if (nowMs >= startsAtMs) refundPercent = 0;
  else if (nowMs <= startsAtMs - params.policy.freeCancellationHoursBefore * HOUR_MS)
    refundPercent = 100;
  else refundPercent = params.policy.refundPercentAfterDeadline;
  return {
    refundPercent,
    refundAmountMinor: Math.floor((params.totalMinor * refundPercent) / 100),
  };
}

=== src/domain/guide/components/AttractionDetailModal.tsx — diff ===
@@ -18,9 +18,11 @@ import { useScrollBorderRadius } from '../../../ui/hooks/useScrollBorderRadius';
 interface AttractionDetailModalProps {
   item: GuideItem | null;
   onClose: () => void;
+  /** Painel de reserva montado em src/app/compositions (o guia não conhece bookings). */
+  bookingPanel?: React.ReactNode;
 }
 
-export function AttractionDetailModal({ item, onClose }: AttractionDetailModalProps) {
+export function AttractionDetailModal({ item, onClose, bookingPanel }: AttractionDetailModalProps) {
   const [activeImage, setActiveImage] = useState(0);
   const { containerRef, borderRadius, scrollY } = useScrollBorderRadius();
 
@@ -187,6 +189,8 @@ export function AttractionDetailModal({ item, onClose }: AttractionDetailModalPr
           )}
         </div>
 
+        {bookingPanel}
+
         <ReviewSection
           itemId={item.id}
           itemRating={item.rating}

=== src/domain/guide/components/TourDetailModal.tsx — diff ===
@@ -18,9 +18,11 @@ import { useScrollBorderRadius } from '../../../ui/hooks/useScrollBorderRadius';
 interface TourDetailModalProps {
   item: GuideItem | null;
   onClose: () => void;
+  /** Painel de reserva montado em src/app/compositions (o guia não conhece bookings). */
+  bookingPanel?: React.ReactNode;
 }
 
-export function TourDetailModal({ item, onClose }: TourDetailModalProps) {
+export function TourDetailModal({ item, onClose, bookingPanel }: TourDetailModalProps) {
   const [activeImage, setActiveImage] = useState(0);
   const { containerRef, borderRadius, scrollY } = useScrollBorderRadius();
 
@@ -189,6 +191,8 @@ export function TourDetailModal({ item, onClose }: TourDetailModalProps) {
           )}
         </div>
 
+        {bookingPanel}
+
         <ReviewSection
           itemId={item.id}
           itemRating={item.rating}

=== src/domain/payment/adapters/ui/StripePaymentElement.tsx — diff ===
@@ -11,8 +11,8 @@ interface StripePaymentElementProps {
   orderId: string;
   /** `setup` salva o cartão sem cobrar agora (assinatura em período já pago). */
   intentType?: 'payment' | 'setup';
-  /** Define a página de retorno do Stripe: pedido de ingresso (padrão) ou plano do parceiro. */
-  returnKind?: 'ticket_order' | 'plan';
+  /** Página de retorno do Stripe: pedido de ingresso (padrão), plano do parceiro ou reserva (`orderId` = ID da reserva). */
+  returnKind?: 'ticket_order' | 'plan' | 'booking';
   submitLabel?: string;
   disabled?: boolean;
   onPending?: () => void;
@@ -42,7 +42,11 @@ function PaymentForm({
     }
     setSubmitting(true);
     const returnQuery =
-      returnKind === 'plan' ? 'kind=plan' : `orderId=${encodeURIComponent(orderId)}`;
+      returnKind === 'plan'
+        ? 'kind=plan'
+        : returnKind === 'booking'
+          ? `bookingId=${encodeURIComponent(orderId)}`
+          : `orderId=${encodeURIComponent(orderId)}`;
     const confirmParams = {
       return_url: `${window.location.origin}/checkout/result?${returnQuery}`,
     };

=== src/domain/user/components/MainMenuView.tsx — diff ===
@@ -2,6 +2,7 @@ import React from 'react';
 import { motion } from 'motion/react';
 import { useTranslation } from 'react-i18next';
 import {
+  CalendarCheck,
   User,
   ChevronRight,
   Handshake,
@@ -30,6 +31,7 @@ interface MainMenuViewProps {
   onAccountOpen: () => void;
   onFavoritesOpen: () => void;
   onTicketsOpen?: () => void;
+  onBookingsOpen?: () => void;
   onPartnersOpen: () => void;
   onAboutOpen: () => void;
   onSupportOpen: () => void;
@@ -49,6 +51,7 @@ export function MainMenuView({
   onAccountOpen,
   onFavoritesOpen,
   onTicketsOpen,
+  onBookingsOpen,
   onPartnersOpen,
   onAboutOpen,
   onSupportOpen,
@@ -240,6 +243,25 @@ export function MainMenuView({
                   />
                 </button>
               )}
+
+              {onBookingsOpen && (
+                <button
+                  type="button"
+                  onClick={onBookingsOpen}
+                  className="w-full flex items-center justify-between gap-3 p-4 rounded-[1.5rem] glassmorphism text-white active:scale-95 transition-all text-[10px] font-black uppercase tracking-[0.1em] border border-white/10 group focus-visible:ring-2 focus-visible:ring-teal-400/50"
+                >
+                  <div className="flex items-center gap-3">
+                    <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 group-hover:scale-110 transition-all shadow-lg shadow-teal-500/5">
+                      <CalendarCheck size={16} aria-hidden="true" />
+                    </div>
+                    <span className="text-white/80">{t('bookings.buyer.menuItem')}</span>
+                  </div>
+                  <ChevronRight
+                    size={14}
+                    className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
+                  />
+                </button>
+              )}
             </div>
           ) : (
             <div className="space-y-3">

=== src/shared/i18n/bookingsResources.ts — diff ===
@@ -1,5 +1,53 @@
 /** Textos do domínio bookings (pt-BR é a fonte; en e fr têm as mesmas chaves, garantidas pelo tipo). */
 export interface BookingsTranslation {
+  buyer: {
+    panelTitle: string;
+    loading: string;
+    loadError: string;
+    retry: string;
+    duration: string;
+    meetingPoint: string;
+    policyFree: string;
+    policyNoFree: string;
+    chooseSlot: string;
+    noSlots: string;
+    spotsLeft_one: string;
+    spotsLeft_other: string;
+    soldOut: string;
+    quantityLegend: string;
+    increase: string;
+    decrease: string;
+    maxParticipants: string;
+    totalLabel: string;
+    participantsLegend: string;
+    participantName: string;
+    continue: string;
+    back: string;
+    loginRequired: string;
+    login: string;
+    payButton: string;
+    expiresIn: string;
+    expired: string;
+    pendingTitle: string;
+    pendingDescription: string;
+    confirmedTitle: string;
+    confirmedDescription: string;
+    delayed: string;
+    viewMyBookings: string;
+    menuItem: string;
+    myBookingsTitle: string;
+    upcoming: string;
+    past: string;
+    emptyBookings: string;
+    cancelBooking: string;
+    confirmCancelRefund: string;
+    confirmCancelNoRefund: string;
+    canceledWithRefund: string;
+    canceledNoRefund: string;
+    loadMore: string;
+    resultTitle: string;
+    resultLoading: string;
+  };
   partner: {
     sectionTitle: string;
     sectionDescription: string;
@@ -135,6 +183,59 @@ export interface BookingsTranslation {
 }
 
 export const bookingsPtBR: BookingsTranslation = {
+  buyer: {
+    panelTitle: 'Reservar',
+    loading: 'Carregando disponibilidade…',
+    loadError: 'Não foi possível carregar a disponibilidade.',
+    retry: 'Tentar novamente',
+    duration: 'Duração: {{minutes}} min',
+    meetingPoint: 'Ponto de encontro: {{address}}',
+    policyFree:
+      'Cancelamento grátis até {{hours}} h antes. Depois, reembolso de {{percent}}%. Após o início, sem reembolso.',
+    policyNoFree:
+      'Reembolso de {{percent}}% se cancelar antes do início. Após o início, sem reembolso.',
+    chooseSlot: 'Escolha o horário',
+    noSlots: 'Nenhum horário disponível nos próximos 30 dias.',
+    spotsLeft_one: '{{count}} vaga',
+    spotsLeft_other: '{{count}} vagas',
+    soldOut: 'Esgotado',
+    quantityLegend: 'Participantes',
+    increase: 'Adicionar {{label}}',
+    decrease: 'Remover {{label}}',
+    maxParticipants: 'Máximo de {{count}} participantes por reserva.',
+    totalLabel: 'Total',
+    participantsLegend: 'Nome dos participantes',
+    participantName: 'Participante {{index}}',
+    continue: 'Continuar',
+    back: 'Voltar',
+    loginRequired: 'Entre na sua conta para reservar.',
+    login: 'Entrar',
+    payButton: 'Pagar {{amount}}',
+    expiresIn: 'Vagas reservadas por {{time}}.',
+    expired: 'O tempo para pagar acabou. Escolha o horário de novo.',
+    pendingTitle: 'Aguardando confirmação do pagamento',
+    pendingDescription:
+      'No Pix, a confirmação pode levar alguns minutos depois que você pagar o QR Code.',
+    confirmedTitle: 'Reserva confirmada',
+    confirmedDescription: 'Você encontra os detalhes em Minhas reservas.',
+    delayed:
+      'A confirmação está demorando. Você pode fechar esta janela; a reserva aparece em Minhas reservas assim que o pagamento for confirmado.',
+    viewMyBookings: 'Ver minhas reservas',
+    menuItem: 'Minhas reservas',
+    myBookingsTitle: 'Minhas reservas',
+    upcoming: 'Próximas',
+    past: 'Anteriores',
+    emptyBookings: 'Você ainda não tem reservas.',
+    cancelBooking: 'Cancelar reserva',
+    confirmCancelRefund: 'Cancelar esta reserva? Você receberá {{amount}} de volta.',
+    confirmCancelNoRefund:
+      'Cancelar esta reserva? Pela política de cancelamento, não há reembolso.',
+    canceledWithRefund: 'Reserva cancelada. O reembolso de {{amount}} foi solicitado.',
+    canceledNoRefund: 'Reserva cancelada.',
+    loadMore: 'Carregar mais',
+    resultTitle: 'Pagamento da reserva',
+    resultLoading: 'Verificando o pagamento…',
+  },
   partner: {
     sectionTitle: 'Reservas e horários',
     sectionDescription: 'Venda horários dos seus passeios e entradas das suas atrações.',
@@ -271,6 +372,56 @@ export const bookingsPtBR: BookingsTranslation = {
 };
 
 export const bookingsEn: BookingsTranslation = {
+  buyer: {
+    panelTitle: 'Book',
+    loading: 'Loading availability…',
+    loadError: 'Availability could not be loaded.',
+    retry: 'Try again',
+    duration: 'Duration: {{minutes}} min',
+    meetingPoint: 'Meeting point: {{address}}',
+    policyFree:
+      'Free cancellation up to {{hours}} h before. After that, {{percent}}% refund. No refund after the start.',
+    policyNoFree: '{{percent}}% refund if you cancel before the start. No refund after the start.',
+    chooseSlot: 'Choose a time',
+    noSlots: 'No time slots available in the next 30 days.',
+    spotsLeft_one: '{{count}} spot',
+    spotsLeft_other: '{{count}} spots',
+    soldOut: 'Sold out',
+    quantityLegend: 'Participants',
+    increase: 'Add {{label}}',
+    decrease: 'Remove {{label}}',
+    maxParticipants: 'Up to {{count}} participants per booking.',
+    totalLabel: 'Total',
+    participantsLegend: 'Participant names',
+    participantName: 'Participant {{index}}',
+    continue: 'Continue',
+    back: 'Back',
+    loginRequired: 'Sign in to book.',
+    login: 'Sign in',
+    payButton: 'Pay {{amount}}',
+    expiresIn: 'Spots held for {{time}}.',
+    expired: 'The payment time ran out. Choose the time slot again.',
+    pendingTitle: 'Waiting for payment confirmation',
+    pendingDescription: 'With Pix, confirmation can take a few minutes after you pay the QR code.',
+    confirmedTitle: 'Booking confirmed',
+    confirmedDescription: 'You can find the details in My bookings.',
+    delayed:
+      'Confirmation is taking a while. You can close this window; the booking shows up in My bookings as soon as the payment is confirmed.',
+    viewMyBookings: 'View my bookings',
+    menuItem: 'My bookings',
+    myBookingsTitle: 'My bookings',
+    upcoming: 'Upcoming',
+    past: 'Past',
+    emptyBookings: 'You have no bookings yet.',
+    cancelBooking: 'Cancel booking',
+    confirmCancelRefund: 'Cancel this booking? You will get {{amount}} back.',
+    confirmCancelNoRefund: 'Cancel this booking? Under the cancellation policy there is no refund.',
+    canceledWithRefund: 'Booking canceled. A refund of {{amount}} was requested.',
+    canceledNoRefund: 'Booking canceled.',
+    loadMore: 'Load more',
+    resultTitle: 'Booking payment',
+    resultLoading: 'Checking the payment…',
+  },
   partner: {
     sectionTitle: 'Bookings and time slots',
     sectionDescription: 'Sell time slots for your tours and entries to your attractions.',
@@ -406,6 +557,59 @@ export const bookingsEn: BookingsTranslation = {
 };
 
 export const bookingsFr: BookingsTranslation = {
+  buyer: {
+    panelTitle: 'Réserver',
+    loading: 'Chargement des disponibilités…',
+    loadError: 'Impossible de charger les disponibilités.',
+    retry: 'Réessayer',
+    duration: 'Durée : {{minutes}} min',
+    meetingPoint: 'Point de rendez-vous : {{address}}',
+    policyFree:
+      'Annulation gratuite jusqu’à {{hours}} h avant. Ensuite, remboursement de {{percent}} %. Aucun remboursement après le début.',
+    policyNoFree:
+      'Remboursement de {{percent}} % en cas d’annulation avant le début. Aucun remboursement après le début.',
+    chooseSlot: 'Choisissez un créneau',
+    noSlots: 'Aucun créneau disponible dans les 30 prochains jours.',
+    spotsLeft_one: '{{count}} place',
+    spotsLeft_other: '{{count}} places',
+    soldOut: 'Complet',
+    quantityLegend: 'Participants',
+    increase: 'Ajouter {{label}}',
+    decrease: 'Retirer {{label}}',
+    maxParticipants: 'Jusqu’à {{count}} participants par réservation.',
+    totalLabel: 'Total',
+    participantsLegend: 'Nom des participants',
+    participantName: 'Participant {{index}}',
+    continue: 'Continuer',
+    back: 'Retour',
+    loginRequired: 'Connectez-vous pour réserver.',
+    login: 'Se connecter',
+    payButton: 'Payer {{amount}}',
+    expiresIn: 'Places bloquées pendant {{time}}.',
+    expired: 'Le délai de paiement est écoulé. Choisissez à nouveau le créneau.',
+    pendingTitle: 'En attente de la confirmation du paiement',
+    pendingDescription:
+      'Avec Pix, la confirmation peut prendre quelques minutes après le paiement du QR code.',
+    confirmedTitle: 'Réservation confirmée',
+    confirmedDescription: 'Retrouvez les détails dans Mes réservations.',
+    delayed:
+      'La confirmation prend du temps. Vous pouvez fermer cette fenêtre ; la réservation apparaîtra dans Mes réservations dès que le paiement sera confirmé.',
+    viewMyBookings: 'Voir mes réservations',
+    menuItem: 'Mes réservations',
+    myBookingsTitle: 'Mes réservations',
+    upcoming: 'À venir',
+    past: 'Passées',
+    emptyBookings: 'Vous n’avez pas encore de réservation.',
+    cancelBooking: 'Annuler la réservation',
+    confirmCancelRefund: 'Annuler cette réservation ? Vous serez remboursé de {{amount}}.',
+    confirmCancelNoRefund:
+      'Annuler cette réservation ? Selon la politique d’annulation, aucun remboursement n’est prévu.',
+    canceledWithRefund: 'Réservation annulée. Le remboursement de {{amount}} a été demandé.',
+    canceledNoRefund: 'Réservation annulée.',
+    loadMore: 'Charger plus',
+    resultTitle: 'Paiement de la réservation',
+    resultLoading: 'Vérification du paiement…',
+  },
   partner: {
     sectionTitle: 'Réservations et créneaux',
     sectionDescription:

=== src/shared/i18n/index.ts — diff ===
@@ -12,6 +12,7 @@ export { i18n } from './config';
 export {
   INDEXABLE_ROUTE_KEYS,
   LOCALIZED_ROUTES,
+  PRIVATE_ROUTE_KEYS,
   localizedPath,
   parseLocalizedPath,
   ROUTE_KEYS,

=== src/shared/i18n/localizedRoutes.test.ts — diff ===
@@ -41,6 +41,7 @@ describe('localizedRoutes', () => {
 
   it('favoritos não é indexável', () => {
     expect(INDEXABLE_ROUTE_KEYS).not.toContain('favorites');
+    expect(INDEXABLE_ROUTE_KEYS).not.toContain('bookings');
     expect(INDEXABLE_ROUTE_KEYS).toHaveLength(7);
   });
 });

=== src/shared/i18n/localizedRoutes.ts — diff ===
@@ -9,6 +9,7 @@ export const ROUTE_KEYS = [
   'attractions',
   'guide',
   'favorites',
+  'bookings',
 ] as const;
 export type RouteKey = (typeof ROUTE_KEYS)[number];
 
@@ -25,10 +26,14 @@ export const LOCALIZED_ROUTES: Record<RouteKey, Record<Locale, string>> = {
   attractions: { 'pt-BR': '/pontos', en: '/en/attractions', fr: '/fr/attractions' },
   guide: { 'pt-BR': '/info', en: '/en/travel-guide', fr: '/fr/guide-pratique' },
   favorites: { 'pt-BR': '/favoritos', en: '/en/favorites', fr: '/fr/favoris' },
+  bookings: { 'pt-BR': '/reservas', en: '/en/bookings', fr: '/fr/reservations' },
 };
 
+/** Páginas pessoais (favoritos, reservas) ficam fora do sitemap e com noindex. */
+export const PRIVATE_ROUTE_KEYS: readonly RouteKey[] = ['favorites', 'bookings'];
+
 export const INDEXABLE_ROUTE_KEYS: readonly RouteKey[] = ROUTE_KEYS.filter(
-  (key) => key !== 'favorites'
+  (key) => !PRIVATE_ROUTE_KEYS.includes(key)
 );
 
 function normalizePathname(pathname: string): string {

=== src/shared/i18n/resources.ts — diff ===
@@ -141,6 +141,7 @@ export interface TranslationResource {
       attractions: { title: string; description: string };
       guide: { title: string; description: string };
       favorites: { title: string; description: string };
+      bookings: { title: string; description: string };
     };
   };
   pages: {
@@ -323,6 +324,10 @@ const ptBR: TranslationResource = {
         title: 'Meus Favoritos | Use Guide',
         description: 'Os lugares, passeios e eventos que você salvou no Use Guide.',
       },
+      bookings: {
+        title: 'Minhas Reservas | Use Guide',
+        description: 'Seus passeios e entradas reservados no Use Guide.',
+      },
     },
   },
   pages: {
@@ -503,6 +508,10 @@ const en: TranslationResource = {
         title: 'My Favorites | Use Guide',
         description: 'The places, tours and events you saved on Use Guide.',
       },
+      bookings: {
+        title: 'My Bookings | Use Guide',
+        description: 'Your tours and entries booked on Use Guide.',
+      },
     },
   },
   pages: {
@@ -688,6 +697,10 @@ const fr: TranslationResource = {
         title: 'Mes Favoris | Use Guide',
         description: 'Les lieux, excursions et événements que vous avez enregistrés sur Use Guide.',
       },
+      bookings: {
+        title: 'Mes Réservations | Use Guide',
+        description: 'Vos excursions et entrées réservées sur Use Guide.',
+      },
     },
   },
   pages: {

=== src/shared/utils/seo.ts — diff ===
@@ -1,4 +1,11 @@
-import { DEFAULT_LOCALE, i18n, type Locale, localizedPath, parseLocalizedPath } from '../i18n';
+import {
+  DEFAULT_LOCALE,
+  i18n,
+  type Locale,
+  localizedPath,
+  PRIVATE_ROUTE_KEYS,
+  parseLocalizedPath,
+} from '../i18n';
 
 export interface SEOMetadata {
   title?: string | undefined;
@@ -84,7 +91,7 @@ export function getRouteSeoMetadata(pathname: string): SEOMetadata {
     description: i18n.t(`seo.routes.${routeKey}.description`, { lng: locale }),
     canonicalUrl: `${BASE_URL}${localizedPath(routeKey, locale)}`,
     locale,
-    ...(routeKey === 'favorites' ? { robots: 'noindex, follow' } : {}),
+    ...(PRIVATE_ROUTE_KEYS.includes(routeKey) ? { robots: 'noindex, follow' } : {}),
   };
 }

=== src/ui/layouts/SideMenu.tsx — diff ===
@@ -351,6 +351,10 @@ export function SideMenu({ isOpen, onClose, onPartnersOpen, onAdminOpen }: SideM
                 goTo('favorites');
               }}
               onTicketsOpen={() => setIsTicketsViewOpen(true)}
+              onBookingsOpen={() => {
+                onClose();
+                goTo('bookings');
+              }}
               onPartnersOpen={onPartnersOpen}
               onAboutOpen={() => setIsAboutViewOpen(true)}
               onSupportOpen={() => setIsSupportViewOpen(true)}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck` sem erros; `npx biome lint .` com 0 erros.
- `npm test` → 119 arquivos, 727 testes.
- `npm run build` sem erros.

No resumo, liste o que testar manualmente no AI Studio com chaves de TESTE do Stripe:
1. Compra com cartão 4242 4242 4242 4242.
2. Compra com Pix de teste.
3. Cancelamento dentro do prazo (100%) e fora do prazo (percentual da política).
4. Cancelamento de horário pelo parceiro (todas as reservas reembolsadas).
5. Reserva não paga expirando após 15 minutos (vaga volta).
E lembre-me de publicar os índices: `npm run deploy:indexes`.
Responda no formato do AGENTS.md §16.3.
~~~~
