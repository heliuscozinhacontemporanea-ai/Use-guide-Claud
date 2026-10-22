# Prompt 18.3c — Métricas com plano e destaque em rodízio (backend)

> Lote 14, gerado do commit de referência `f5b42a0` da branch `claude/agents-md-v2`. Aplique depois do 18.3b. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.3c — Métricas com plano e destaque em rodízio (D11, backend)

Decisão D11 (2026-10-19), detalhes de 2026-10-21.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint (AGENTS.md §13). Nenhuma dependência nova.

DECISÃO D11 (docs/arquitetura/decisoes.md): as métricas de um estabelecimento exigem o plano dele; 3 vagas "Destaque" por lista, em rodízio diário entre os estabelecimentos com plano ativo.

ATENÇÃO: este prompt é só o BACKEND. As telas passam a mostrar o aviso de plano e o rótulo "Destaque" no 18.3.1. Até lá, a tela de métricas de um estabelecimento sem plano mostra erro; isso é esperado.

O QUE MUDA:
1) Métricas (insights):
   - a rota GET /api/insights/stats/:itemCollection/:itemId sai do domínio insights e vai para server/interfaces/http/insights (a URL não muda);
   - getListingStatsApplicationUseCase checa primeiro a posse (insights) e depois o plano do estabelecimento (partners); o evento usa o plano do estabelecimento dele (establishmentId);
   - sem plano: 403 LISTING_PLAN_REQUIRED. O admin vê sem plano;
   - insights publica getItemStatsUseCase e InsightsAccessError no index.ts.
2) Domínio partners: assertListingPlanActiveUseCase e listActivePlanItemIdsUseCase (planos em vigor, sem contas suspensas); código LISTING_PLAN_REQUIRED no ListingPlanError.
3) Domínio guide: projeção pública featuredListings/{lista} (hotel, restaurant, tour, sight, transfer, rental, events), port + adapter, saveFeaturedListingsUseCase e o sorteio puro com semente do dia (utils/featuredRotation.ts, fuso America/Fortaleza).
4) refreshFeaturedListingsApplicationUseCase monta as listas e roda no job diário de planos (POST interno checkExpiringPlans), depois da manutenção dos selos. Nenhuma Cloud Function nova.
5) Configuração: FEATURED_SLOTS_PER_LIST (padrão 3, de 0 a 12) em server/shared/kernel/featuredSlots.ts e no .env.example.
6) firestore.rules (featuredListings: leitura pública, escrita negada) + teste; firebase-blueprint.json; decisoes.md (como o 18.3c implementa a D11).

ARQUIVOS (crie, altere ou apague exatamente estes):
- .env.example (alterar)
- docs/arquitetura/decisoes.md (alterar)
- firebase-blueprint.json (alterar)
- firestore.rules (alterar)
- firestore.rules.security.test.ts (alterar)
- server.ts (alterar)
- server/application/usecases/featured/refreshFeaturedListingsApplicationUseCase.test.ts (criar)
- server/application/usecases/featured/refreshFeaturedListingsApplicationUseCase.ts (criar)
- server/application/usecases/insights/getListingStatsApplicationUseCase.test.ts (criar)
- server/application/usecases/insights/getListingStatsApplicationUseCase.ts (criar)
- server/domain/guide/adapters/firestoreFeaturedListingsAdapter.ts (criar)
- server/domain/guide/factory.ts (alterar)
- server/domain/guide/index.ts (alterar)
- server/domain/guide/ports/featuredListingsPort.ts (criar)
- server/domain/guide/types/featuredListing.ts (criar)
- server/domain/guide/usecases/saveFeaturedListingsUseCase.ts (criar)
- server/domain/guide/utils/featuredRotation.test.ts (criar)
- server/domain/guide/utils/featuredRotation.ts (criar)
- server/domain/insights/controllers/insightsController.test.ts (alterar)
- server/domain/insights/controllers/insightsController.ts (alterar)
- server/domain/insights/index.ts (alterar)
- server/domain/insights/routes/insightsRoutes.ts (alterar)
- server/domain/insights/schemas/insightsSchemas.ts (alterar)
- server/domain/insights/usecases/getItemStatsUseCase.ts (criar)
- server/domain/partners/adapters/firestoreListingPlanAdapter.ts (alterar)
- server/domain/partners/errors/listingPlanError.ts (alterar)
- server/domain/partners/index.ts (alterar)
- server/domain/partners/ports/listingPlanRepositoryPort.ts (alterar)
- server/domain/partners/services/listingPlanService.test.ts (alterar)
- server/domain/partners/services/listingPlanService.ts (alterar)
- server/domain/partners/usecases/assertListingPlanActiveUseCase.ts (criar)
- server/domain/partners/usecases/listActivePlanItemIdsUseCase.ts (criar)
- server/interfaces/http/insights/listingStatsController.test.ts (criar)
- server/interfaces/http/insights/listingStatsController.ts (criar)
- server/interfaces/http/insights/listingStatsRoutes.ts (criar)
- server/interfaces/http/insights/schemas/listingStatsSchemas.ts (criar)
- server/interfaces/http/partners/internalPartnersController.test.ts (alterar)
- server/interfaces/http/partners/internalPartnersController.ts (alterar)
- server/shared/kernel/featuredSlots.test.ts (criar)
- server/shared/kernel/featuredSlots.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== .env.example — diff ===
@@ -21,6 +21,8 @@ VITE_STRIPE_PUBLISHABLE_KEY=
 VITE_SUPPORT_WHATSAPP=
 STRIPE_WEBHOOK_SECRET=
 USE_GUIDE_PLATFORM_FEE_PERCENT=10
+# Vagas de "Destaque" por lista no rodízio diário (D11); inteiro de 0 a 12, padrão 3.
+FEATURED_SLOTS_PER_LIST=3
 
 # Ticketing & Offline Check-In Cryptographic Keys & Scheduler Config
 TICKET_QR_SECRET=

=== docs/arquitetura/decisoes.md — diff ===
@@ -141,6 +141,11 @@ Detalha o item "Selo e plano por estabelecimento" da D9. Modelo de referência:
   * **Divisão:** 18.3a (plano por estabelecimento, selo, trial, selo do admin, job diário) → 18.3b (cobrança no Stripe por estabelecimento) → 18.3c (métricas exigindo o plano e destaque) → 18.3.1 (telas).
   * **Lista do destaque = categoria** (hospedagens, restaurantes, passeios, atrações, translados, aluguéis e eventos), cada uma com 3 vagas.
   * **Rodízio por job diário no backend:** sorteio com semente fixa do dia, gravado numa projeção pública (`featuredListings/{categoria}`) lida pelos cards; igual para todos os visitantes.
+  * **Como o 18.3c implementa:**
+    * métricas em `GET /api/insights/stats/:colecao/:id` (camada `interfaces/http/insights`): primeiro a posse, depois o plano; sem plano responde `403 LISTING_PLAN_REQUIRED`. O evento usa o plano do estabelecimento dele; evento sem estabelecimento não tem métricas. O admin vê sem plano;
+    * candidatos do destaque: itens públicos com plano em vigor, de contas não suspensas; eventos públicos ativos de estabelecimento com plano. Listas: `hotel`, `restaurant`, `tour`, `sight`, `transfer`, `rental` e `events` (dicas e perfis de produtor ficam fora);
+    * o dia do sorteio é o de `America/Fortaleza` e a semente é `dia:lista`; vagas em `FEATURED_SLOTS_PER_LIST` (padrão 3, de 0 a 12);
+    * roda no job diário de planos (`checkExpiringPlans`), depois da manutenção dos selos; nenhuma Cloud Function nova.
 * **Prompts:** 18.3a, 18.3b, 18.3c (backend) e 18.3.1 (frontend).
 
 ## D12 — Verificação e documento por estabelecimento (2026-10-19)

=== firebase-blueprint.json — diff ===
@@ -222,6 +222,18 @@
       },
       "required": ["businesses", "hasUsedTrial", "status", "createdAt"]
     },
+    "FeaturedListings": {
+      "title": "FeaturedListings",
+      "description": "Public projection of the daily \"Destaque\" rotation of one list (D11), written by the backend job.",
+      "type": "object",
+      "properties": {
+        "list": { "type": "string", "enum": ["hotel", "restaurant", "tour", "sight", "transfer", "rental", "events"] },
+        "listingIds": { "type": "array", "items": { "type": "string" } },
+        "day": { "type": "string", "description": "Rotation day in America/Fortaleza (YYYY-MM-DD)." },
+        "updatedAt": { "type": "string", "format": "date-time" }
+      },
+      "required": ["list", "listingIds", "day", "updatedAt"]
+    },
     "ListingPlan": {
       "title": "ListingPlan",
       "description": "Backend-only plan of one establishment or producer profile (D11). Items and events carry the public seal copy.",
@@ -615,6 +627,10 @@
       "schema": "Partner",
       "description": "Partner profiles linked to their business items."
     },
+    "/featuredListings/{list}": {
+      "schema": "FeaturedListings",
+      "description": "Daily featured listings per list (public read, backend write)."
+    },
     "/listingPlans/{itemId}": {
       "schema": "ListingPlan",
       "description": "Plan and seal of each establishment (backend only)."

=== firestore.rules — diff ===
@@ -160,6 +160,11 @@ service cloud.firestore {
     match /listingPlans/{itemId} {
       allow read, write: if false;
     }
+    // Rodízio diário do "Destaque" (D11): projeção pública gravada só pelo job do backend.
+    match /featuredListings/{list} {
+      allow read: if true;
+      allow write: if false;
+    }
     // Métricas lidas só pela API (dono do item ou admin); as guardas de deduplicação nunca saem do backend.
     match /interactionStats/{statId} {
       allow read, write: if false;

=== firestore.rules.security.test.ts — diff ===
@@ -366,6 +366,23 @@ describe('Firestore Rules — Security Suite', () => {
       }
     });
 
+    it('destaque (D11): featuredListings tem leitura pública e escrita negada até para admin', async () => {
+      await testEnv.withSecurityRulesDisabled(async (context) => {
+        await setDoc(doc(context.firestore(), 'featuredListings/hotel'), {
+          list: 'hotel',
+          listingIds: ['item-1'],
+        });
+      });
+      const anonDb = testEnv.unauthenticatedContext().firestore();
+      await assertSucceeds(getDoc(doc(anonDb, 'featuredListings/hotel')));
+      const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();
+      const ownerDb = testEnv.authenticatedContext('partner-1').firestore();
+      for (const db of [adminDb, ownerDb]) {
+        await assertFails(setDoc(doc(db, 'featuredListings/hotel'), { listingIds: ['item-2'] }));
+        await assertFails(deleteDoc(doc(db, 'featuredListings/hotel')));
+      }
+    });
+
     it('client → interactionStats e interactionGuards write negado', async () => {
       const db = testEnv.authenticatedContext('user-1').firestore();
       const statPath = 'interactionStats/items_item-1_2026-10-19';

=== server.ts — diff ===
@@ -21,6 +21,7 @@ import favoriteRouter from './server/domain/favorites/routes/favoriteRoutes';
 import mediaRouter from './server/domain/media/routes/mediaRoutes';
 import billingRouter from './server/interfaces/http/billing/billingRoutes';
 import listingVerificationRouter from './server/interfaces/http/listingVerifications/listingVerificationRoutes';
+import listingStatsRouter from './server/interfaces/http/insights/listingStatsRoutes';
 import listingPlanRouter from './server/interfaces/http/listingPlans/listingPlanRoutes';
 import {
   bookingsRouter,
@@ -205,6 +206,7 @@ async function startServer() {
   app.use('/api/admin/events', adminTicketingEventsRouter);
   app.use('/api/ticketing', ticketingRouter);
   app.use('/api/reviews', reviewRouter);
+  app.use('/api/insights/stats', listingStatsRouter);
   app.use('/api/insights', insightsRouter);
   app.use('/api/admin', adminRouter);
   app.use('/api/favorites', favoriteRouter);

=== server/application/usecases/featured/refreshFeaturedListingsApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  activePlans: vi.fn(),
  items: vi.fn(),
  events: vi.fn(),
  save: vi.fn(),
}));

vi.mock('../../../domain/partners', () => ({ listActivePlanItemIdsUseCase: m.activePlans }));
vi.mock('../../../domain/events', () => ({ listPublicEventListingsUseCase: m.events }));
vi.mock('../../../domain/guide', async () => {
  const rotation = await import('../../../domain/guide/utils/featuredRotation');
  const types = await import('../../../domain/guide/types/featuredListing');
  return {
    ...rotation,
    FEATURED_LISTS: types.FEATURED_LISTS,
    listPublicGuideItemsUseCase: m.items,
    saveFeaturedListingsUseCase: m.save,
  };
});

import type { FeaturedListingsProjection } from '../../../domain/guide/types/featuredListing';
import { refreshFeaturedListingsApplicationUseCase } from './refreshFeaturedListingsApplicationUseCase';

const NOW = new Date('2026-10-22T12:00:00Z');

function saved(list: string): FeaturedListingsProjection {
  const projections = (m.save.mock.calls.at(-1)?.[0] ?? []) as FeaturedListingsProjection[];
  const projection = projections.find((candidate) => candidate.list === list);
  if (!projection) throw new Error(`lista ${list} não gravada`);
  return projection;
}

describe('refreshFeaturedListingsApplicationUseCase (D11)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    m.activePlans.mockResolvedValue(['h1', 'h2', 'h3', 'h4', 'r1', 'tip1']);
    m.items.mockResolvedValue([
      { id: 'h1', category: 'hotel' },
      { id: 'h2', category: 'hotel' },
      { id: 'h3', category: 'hotel' },
      { id: 'h4', category: 'hotel' },
      { id: 'h5', category: 'hotel' },
      { id: 'r1', category: 'restaurant' },
      { id: 'tip1', category: 'tips' },
    ]);
    m.events.mockResolvedValue([
      { id: 'ev1', isActive: true, establishmentId: 'r1' },
      { id: 'ev2', isActive: true, establishmentId: 'h5' },
      { id: 'ev3', isActive: false, establishmentId: 'h1' },
      { id: 'ev4', isActive: true },
    ]);
  });

  it('3 vagas por lista, só estabelecimentos com plano, no dia do fuso do negócio', async () => {
    await expect(refreshFeaturedListingsApplicationUseCase(NOW)).resolves.toEqual({
      day: '2026-10-22',
      featured: 5,
    });
    const projections = m.save.mock.calls[0]?.[0] as FeaturedListingsProjection[];
    expect(projections.map((projection) => projection.list).sort()).toEqual(
      ['events', 'hotel', 'rental', 'restaurant', 'sight', 'tour', 'transfer'].sort()
    );
    expect(saved('hotel').listingIds).toHaveLength(3);
    expect(saved('hotel').listingIds.every((id) => ['h1', 'h2', 'h3', 'h4'].includes(id))).toBe(
      true
    );
    expect(saved('restaurant').listingIds).toEqual(['r1']);
    expect(saved('events').listingIds).toEqual(['ev1']);
    expect(saved('tour').listingIds).toEqual([]);
    expect(saved('hotel').day).toBe('2026-10-22');
  });

  it('mesmo dia, mesmo sorteio; FEATURED_SLOTS_PER_LIST muda as vagas', async () => {
    await refreshFeaturedListingsApplicationUseCase(NOW);
    const first = saved('hotel').listingIds;
    m.save.mockClear();
    await refreshFeaturedListingsApplicationUseCase(new Date('2026-10-22T20:00:00Z'));
    expect(saved('hotel').listingIds).toEqual(first);

    m.save.mockClear();
    vi.stubEnv('FEATURED_SLOTS_PER_LIST', '1');
    await refreshFeaturedListingsApplicationUseCase(NOW);
    expect(saved('hotel').listingIds).toHaveLength(1);
  });
});

=== server/application/usecases/featured/refreshFeaturedListingsApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listPublicEventListingsUseCase } from '../../../domain/events';
import {
  FEATURED_LISTS,
  type FeaturedList,
  type FeaturedListingsProjection,
  featuredRotationDay,
  listPublicGuideItemsUseCase,
  pickFeaturedListingIds,
  saveFeaturedListingsUseCase,
} from '../../../domain/guide';
import { listActivePlanItemIdsUseCase } from '../../../domain/partners';
import { resolveFeaturedSlotsPerList } from '../../../shared/kernel/featuredSlots';

const ACTIVE_PLANS_LIMIT = 2000;

/**
 * Rodízio diário do "Destaque" (D11): em cada lista, sorteia com semente fixa do dia as vagas
 * entre os estabelecimentos com plano em vigor; o evento concorre pelo plano do estabelecimento.
 */
export async function refreshFeaturedListingsApplicationUseCase(
  now: Date = new Date()
): Promise<{ day: string; featured: number }> {
  const slots = resolveFeaturedSlotsPerList();
  const day = featuredRotationDay(now);
  const withPlan = new Set(await listActivePlanItemIdsUseCase(ACTIVE_PLANS_LIMIT));

  const candidates = new Map<FeaturedList, string[]>(FEATURED_LISTS.map((list) => [list, []]));
  for (const item of await listPublicGuideItemsUseCase()) {
    const list = candidates.get(item.category as FeaturedList);
    if (list && withPlan.has(item.id)) list.push(item.id);
  }
  const events = candidates.get('events') ?? [];
  for (const event of await listPublicEventListingsUseCase()) {
    if (event.isActive && event.establishmentId && withPlan.has(event.establishmentId)) {
      events.push(event.id);
    }
  }

  const updatedAt = now.toISOString();
  const projections: FeaturedListingsProjection[] = FEATURED_LISTS.map((list) => ({
    list,
    listingIds: pickFeaturedListingIds(candidates.get(list) ?? [], `${day}:${list}`, slots),
    day,
    updatedAt,
  }));
  await saveFeaturedListingsUseCase(projections);
  return {
    day,
    featured: projections.reduce((total, projection) => total + projection.listingIds.length, 0),
  };
}

=== server/application/usecases/insights/getListingStatsApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  getStats: vi.fn(),
  getEvent: vi.fn(),
  assertPlan: vi.fn(),
}));

vi.mock('../../../domain/insights', () => ({ getItemStatsUseCase: m.getStats }));
vi.mock('../../../domain/events', () => ({ getEventListingByIdUseCase: m.getEvent }));
vi.mock('../../../domain/partners', async () => {
  const { ListingPlanError } = await import('../../../domain/partners/errors/listingPlanError');
  return { ListingPlanError, assertListingPlanActiveUseCase: m.assertPlan };
});

import { ListingPlanError } from '../../../domain/partners/errors/listingPlanError';
import { getListingStatsApplicationUseCase } from './getListingStatsApplicationUseCase';

const OWNER = { uid: 'p1' };
const STATS = { views: 3 };

describe('getListingStatsApplicationUseCase (D11)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.getStats.mockResolvedValue(STATS);
    m.assertPlan.mockResolvedValue(undefined);
  });

  it('item com plano ativo devolve as métricas', async () => {
    await expect(getListingStatsApplicationUseCase(OWNER, 'item-1', 'items')).resolves.toBe(STATS);
    expect(m.assertPlan).toHaveBeenCalledWith('item-1');
  });

  it('item sem plano ativo é recusado com LISTING_PLAN_REQUIRED', async () => {
    m.assertPlan.mockRejectedValue(new ListingPlanError('LISTING_PLAN_REQUIRED', 'Sem plano.'));
    await expect(getListingStatsApplicationUseCase(OWNER, 'item-1', 'items')).rejects.toMatchObject(
      { code: 'LISTING_PLAN_REQUIRED', statusCode: 403 }
    );
  });

  it('evento usa o plano do estabelecimento a que pertence', async () => {
    m.getEvent.mockResolvedValue({ id: 'ev-1', establishmentId: 'item-9' });
    await getListingStatsApplicationUseCase(OWNER, 'ev-1', 'events');
    expect(m.assertPlan).toHaveBeenCalledWith('item-9');
  });

  it('evento sem estabelecimento não tem métricas', async () => {
    m.getEvent.mockResolvedValue({ id: 'ev-1' });
    await expect(getListingStatsApplicationUseCase(OWNER, 'ev-1', 'events')).rejects.toMatchObject({
      code: 'LISTING_PLAN_REQUIRED',
    });
    expect(m.assertPlan).not.toHaveBeenCalled();
  });

  it('posse é checada antes do plano', async () => {
    m.getStats.mockRejectedValue(new Error('FORBIDDEN'));
    await expect(getListingStatsApplicationUseCase(OWNER, 'item-1', 'items')).rejects.toThrow(
      'FORBIDDEN'
    );
    expect(m.assertPlan).not.toHaveBeenCalled();
  });

  it('admin vê as métricas sem plano', async () => {
    await getListingStatsApplicationUseCase({ uid: 'a1', admin: true }, 'item-1', 'items');
    expect(m.assertPlan).not.toHaveBeenCalled();
  });
});

=== server/application/usecases/insights/getListingStatsApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getEventListingByIdUseCase } from '../../../domain/events';
import { getItemStatsUseCase, type ItemStats } from '../../../domain/insights';
import { assertListingPlanActiveUseCase, ListingPlanError } from '../../../domain/partners';

export interface ListingStatsActor {
  uid: string;
  admin?: boolean;
}

/**
 * Métricas do item ou do evento para o dono, exigindo o plano do estabelecimento em vigor (D11).
 * O evento usa o plano do estabelecimento a que pertence; sem estabelecimento, não há métricas.
 */
export async function getListingStatsApplicationUseCase(
  actor: ListingStatsActor,
  itemId: string,
  itemCollection: 'items' | 'events'
): Promise<ItemStats> {
  // A posse é checada primeiro para não revelar se o item de outra pessoa tem plano.
  const stats = await getItemStatsUseCase(itemId, itemCollection, actor);
  if (actor.admin) return stats;
  const establishmentId =
    itemCollection === 'items'
      ? itemId
      : ((await getEventListingByIdUseCase(itemId))?.establishmentId ?? null);
  if (!establishmentId) {
    throw new ListingPlanError(
      'LISTING_PLAN_REQUIRED',
      'As métricas do evento fazem parte do plano do estabelecimento.'
    );
  }
  await assertListingPlanActiveUseCase(establishmentId);
  return stats;
}

=== server/domain/guide/adapters/firestoreFeaturedListingsAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { FeaturedListingsPort } from '../ports/featuredListingsPort';
import type { FeaturedListingsProjection } from '../types/featuredListing';

export class FirestoreFeaturedListingsAdapter implements FeaturedListingsPort {
  async replaceAll(projections: FeaturedListingsProjection[]): Promise<void> {
    const batch = adminDb.batch();
    for (const projection of projections) {
      batch.set(adminDb.collection('featuredListings').doc(projection.list), projection);
    }
    await batch.commit();
  }
}

=== server/domain/guide/factory.ts — diff ===
@@ -1,5 +1,7 @@
 import { GuideService } from './services/guideService';
+import { FirestoreFeaturedListingsAdapter } from './adapters/firestoreFeaturedListingsAdapter';
 import { FirestoreGuideAdapter } from './adapters/firestoreGuideAdapter';
 
 const guideAdapter = new FirestoreGuideAdapter();
 export const guideService = new GuideService(guideAdapter);
+export const featuredListingsRepository = new FirestoreFeaturedListingsAdapter();

=== server/domain/guide/index.ts — diff ===
@@ -1,4 +1,9 @@
 export type { GuideVerificationUpdate } from './ports/guidePort';
+export {
+  FEATURED_LISTS,
+  type FeaturedList,
+  type FeaturedListingsProjection,
+} from './types/featuredListing';
 export type {
   GuideCatalogFields,
   GuideCreateItemInput,
@@ -20,6 +25,8 @@ export {
 export { getPublicGuideItemUseCase } from './usecases/getPublicGuideItemUseCase';
 export { getResourceOwnerIdUseCase } from './usecases/getResourceOwnerIdUseCase';
 export { listPublicGuideItemsUseCase } from './usecases/listPublicGuideItemsUseCase';
+export { saveFeaturedListingsUseCase } from './usecases/saveFeaturedListingsUseCase';
 export { updateGuideItemUseCase } from './usecases/updateGuideItemUseCase';
 export { updateItemVerificationUseCase } from './usecases/updateItemVerificationUseCase';
 export { updateReviewAggregateUseCase } from './usecases/updateReviewAggregateUseCase';
+export { featuredRotationDay, pickFeaturedListingIds } from './utils/featuredRotation';

=== server/domain/guide/ports/featuredListingsPort.ts — ARQUIVO NOVO, conteúdo completo ===
import type { FeaturedListingsProjection } from '../types/featuredListing';

export interface FeaturedListingsPort {
  /** Substitui as projeções públicas de todas as listas de uma vez. */
  replaceAll(projections: FeaturedListingsProjection[]): Promise<void>;
}

=== server/domain/guide/types/featuredListing.ts — ARQUIVO NOVO, conteúdo completo ===
/** Listas com vagas de "Destaque" (D11): as categorias de estabelecimento do guia e os eventos. */
export const FEATURED_LISTS = [
  'hotel',
  'restaurant',
  'tour',
  'sight',
  'transfer',
  'rental',
  'events',
] as const;

export type FeaturedList = (typeof FEATURED_LISTS)[number];

/** Projeção pública `featuredListings/{list}`, igual para todos os visitantes no dia. */
export interface FeaturedListingsProjection {
  list: FeaturedList;
  listingIds: string[];
  /** Dia do rodízio no fuso do negócio (YYYY-MM-DD). */
  day: string;
  updatedAt: string;
}

=== server/domain/guide/usecases/saveFeaturedListingsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { featuredListingsRepository } from '../factory';
import type { FeaturedListingsProjection } from '../types/featuredListing';

export function saveFeaturedListingsUseCase(
  projections: FeaturedListingsProjection[]
): Promise<void> {
  return featuredListingsRepository.replaceAll(projections);
}

=== server/domain/guide/utils/featuredRotation.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { featuredRotationDay, pickFeaturedListingIds } from './featuredRotation';

const IDS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

describe('featuredRotation (D11)', () => {
  it('dia do rodízio segue o fuso America/Fortaleza', () => {
    expect(featuredRotationDay(new Date('2026-10-22T02:59:00Z'))).toBe('2026-10-21');
    expect(featuredRotationDay(new Date('2026-10-22T03:00:00Z'))).toBe('2026-10-22');
  });

  it('mesma semente dá o mesmo sorteio, qualquer que seja a ordem dos candidatos', () => {
    const first = pickFeaturedListingIds(IDS, '2026-10-22:hotel', 3);
    expect(first).toHaveLength(3);
    expect(pickFeaturedListingIds([...IDS].reverse(), '2026-10-22:hotel', 3)).toEqual(first);
  });

  it('o sorteio muda com o dia e só devolve candidatos sem repetir', () => {
    const days = Array.from({ length: 10 }, (_, day) =>
      pickFeaturedListingIds(IDS, `2026-10-${10 + day}:hotel`, 3).join(',')
    );
    expect(new Set(days).size).toBeGreaterThan(1);
    for (const picked of days.map((day) => day.split(','))) {
      expect(new Set(picked).size).toBe(3);
      expect(picked.every((id) => IDS.includes(id))).toBe(true);
    }
  });

  it('menos candidatos que vagas devolve todos; zero vagas devolve nenhum', () => {
    expect(pickFeaturedListingIds(['x', 'y'], 'k', 3).sort()).toEqual(['x', 'y']);
    expect(pickFeaturedListingIds(IDS, 'k', 0)).toEqual([]);
  });
});

=== server/domain/guide/utils/featuredRotation.ts — ARQUIVO NOVO, conteúdo completo ===
const BUSINESS_TIME_ZONE = 'America/Fortaleza';

/** Dia do rodízio no fuso do negócio, para que a troca aconteça à meia-noite de Jericoacoara. */
export function featuredRotationDay(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

// FNV-1a de 32 bits: só espalha a semente; o sorteio não protege nada e não precisa de criptografia.
function hashSeed(text: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// mulberry32: gerador pequeno e determinístico; a mesma semente gera o mesmo sorteio.
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Sorteio do destaque com semente fixa do dia e da lista (D11): o resultado não depende da ordem
 * de leitura dos candidatos e é o mesmo para qualquer execução do job no mesmo dia.
 */
export function pickFeaturedListingIds(
  candidateIds: readonly string[],
  seedKey: string,
  slots: number
): string[] {
  const ids = [...new Set(candidateIds)].sort();
  const random = seededRandom(hashSeed(seedKey));
  for (let index = ids.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    const current = ids[index];
    const picked = ids[swap];
    if (current === undefined || picked === undefined) continue;
    ids[index] = picked;
    ids[swap] = current;
  }
  return ids.slice(0, Math.max(0, slots));
}

=== server/domain/insights/controllers/insightsController.test.ts — diff ===
@@ -1,16 +1,14 @@
 import { beforeEach, describe, expect, it, vi } from 'vitest';
 import type { Response } from 'express';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
-import { InsightsAccessError, InsightsUnavailableError } from '../errors/insightsErrors';
+import { InsightsUnavailableError } from '../errors/insightsErrors';
 import { insightsService } from '../factory';
 import { InsightsController } from './insightsController';
 
 vi.mock('../factory', () => ({
-  insightsService: { trackInteraction: vi.fn(), getItemStats: vi.fn() },
+  insightsService: { trackInteraction: vi.fn() },
 }));
 
-const USER = { uid: 'partner-1', admin: false, emailVerified: true, authTime: 1 };
-
 function mockResponse() {
   const res = { status: vi.fn(), json: vi.fn() };
   res.status.mockReturnValue(res);
@@ -65,25 +63,4 @@ describe('InsightsController', () => {
     expect(res.status).toHaveBeenCalledWith(503);
     expect(res.json.mock.calls[0]?.[0].error.code).toBe('INSIGHTS_UNAVAILABLE');
   });
-
-  it('stats de item de outro parceiro responde 403 FORBIDDEN', async () => {
-    vi.mocked(insightsService.getItemStats).mockRejectedValue(new InsightsAccessError());
-    const res = mockResponse();
-    await InsightsController.getItemStats(
-      request({ user: USER, params: { itemCollection: 'items', itemId: 'item-b' } }),
-      res as unknown as Response
-    );
-    expect(res.status).toHaveBeenCalledWith(403);
-    expect(res.json.mock.calls[0]?.[0].error.code).toBe('FORBIDDEN');
-  });
-
-  it('stats sem login responde 401', async () => {
-    const res = mockResponse();
-    await InsightsController.getItemStats(
-      request({ params: { itemCollection: 'items', itemId: 'item-1' } }),
-      res as unknown as Response
-    );
-    expect(res.status).toHaveBeenCalledWith(401);
-    expect(insightsService.getItemStats).not.toHaveBeenCalled();
-  });
 });

=== server/domain/insights/controllers/insightsController.ts — diff ===
@@ -1,8 +1,8 @@
 import type { Response } from 'express';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
-import { InsightsAccessError, InsightsUnavailableError } from '../errors/insightsErrors';
+import { InsightsUnavailableError } from '../errors/insightsErrors';
 import { insightsService } from '../factory';
-import { getItemStatsParamsSchema, trackInteractionSchema } from '../schemas/insightsSchemas';
+import { trackInteractionSchema } from '../schemas/insightsSchemas';
 
 function sendError(res: Response, status: number, code: string, message: string): void {
   res.status(status).json({ error: { code, message } });
@@ -34,33 +34,4 @@ export class InsightsController {
       sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível registrar a interação.');
     }
   }
-
-  static async getItemStats(req: AuthenticatedRequest, res: Response): Promise<void> {
-    if (!req.user) {
-      sendError(res, 401, 'UNAUTHENTICATED', 'Faça login para ver as métricas.');
-      return;
-    }
-    const parsed = getItemStatsParamsSchema.safeParse(req.params);
-    if (!parsed.success) {
-      sendError(res, 400, 'VALIDATION_ERROR', 'Item inválido.');
-      return;
-    }
-    try {
-      const stats = await insightsService.getItemStats(
-        parsed.data.itemId,
-        parsed.data.itemCollection,
-        { uid: req.user.uid, admin: req.user.admin }
-      );
-      res.status(200).json({ success: true, data: stats });
-    } catch (error) {
-      if (error instanceof InsightsAccessError) {
-        sendError(res, 403, error.code, error.message);
-        return;
-      }
-      console.error('[InsightsController.getItemStats]', {
-        name: error instanceof Error ? error.name : 'UnknownError',
-      });
-      sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível carregar as métricas.');
-    }
-  }
 }

=== server/domain/insights/index.ts — diff ===
@@ -1,3 +1,5 @@
+export { InsightsAccessError } from './errors/insightsErrors';
+export { getItemStatsUseCase } from './usecases/getItemStatsUseCase';
 export type {
   InteractionHistoryItem,
   InteractionType,

=== server/domain/insights/routes/insightsRoutes.ts — diff ===
@@ -1,14 +1,10 @@
 import { Router } from 'express';
-import {
-  identifyUserIfPresent,
-  verifyAuthToken,
-} from '../../../infrastructure/auth/authMiddleware';
+import { identifyUserIfPresent } from '../../../infrastructure/auth/authMiddleware';
 import { InsightsController } from '../controllers/insightsController';
 
 const router = Router();
 
 // Visitante sem login também é contado (decisão de 2026-10-19); o App Check de /api continua valendo.
 router.post('/track', identifyUserIfPresent, InsightsController.trackInteraction);
-router.get('/stats/:itemCollection/:itemId', verifyAuthToken, InsightsController.getItemStats);
 
 export default router;

=== server/domain/insights/schemas/insightsSchemas.ts — diff ===
@@ -7,10 +7,3 @@ export const trackInteractionSchema = z
     type: z.enum(['view', 'whatsapp_click', 'share', 'favorite']),
   })
   .strict();
-
-export const getItemStatsParamsSchema = z
-  .object({
-    itemId: z.string().trim().min(1, 'ID do item é obrigatório').max(200),
-    itemCollection: z.enum(['items', 'events']).default('items'),
-  })
-  .strict();

=== server/domain/insights/usecases/getItemStatsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { insightsService } from '../factory';
import type { ItemStats } from '../types/interaction';

/** Métricas de um item ou evento; só o dono ou o admin (lança `InsightsAccessError`). */
export function getItemStatsUseCase(
  itemId: string,
  itemCollection: 'items' | 'events',
  userContext: { uid: string; admin?: boolean }
): Promise<ItemStats> {
  return insightsService.getItemStats(itemId, itemCollection, userContext);
}

=== server/domain/partners/adapters/firestoreListingPlanAdapter.ts — diff ===
@@ -62,6 +62,16 @@ export class FirestoreListingPlanAdapter implements ListingPlanRepositoryPort {
     return snapshot.docs.map((doc) => doc.data() as ListingPlanRecord);
   }
 
+  async listActive(nowIso: string, limit: number): Promise<ListingPlanRecord[]> {
+    const snapshot = await adminDb
+      .collection(PLANS)
+      .where('planUntil', '>', nowIso)
+      .orderBy('planUntil', 'asc')
+      .limit(limit)
+      .get();
+    return snapshot.docs.map((doc) => doc.data() as ListingPlanRecord);
+  }
+
   async listExpiringWithSeal(
     fromIso: string,
     toIso: string,

=== server/domain/partners/errors/listingPlanError.ts — diff ===
@@ -5,7 +5,8 @@ export type ListingPlanErrorCode =
   | 'LISTING_PENDING_VERIFICATION'
   | 'TRIAL_ALREADY_USED'
   | 'PLAN_ALREADY_ACTIVE'
-  | 'PARTNER_SUSPENDED';
+  | 'PARTNER_SUSPENDED'
+  | 'LISTING_PLAN_REQUIRED';
 
 const STATUS: Record<ListingPlanErrorCode, number> = {
   VALIDATION_ERROR: 400,
@@ -15,6 +16,7 @@ const STATUS: Record<ListingPlanErrorCode, number> = {
   TRIAL_ALREADY_USED: 409,
   PLAN_ALREADY_ACTIVE: 409,
   PARTNER_SUSPENDED: 403,
+  LISTING_PLAN_REQUIRED: 403,
 };
 
 export class ListingPlanError extends Error {

=== server/domain/partners/index.ts — diff ===
@@ -21,6 +21,8 @@ export { getListingPlanViewUseCase } from './usecases/getListingPlanViewUseCase'
 export { activateListingTrialUseCase } from './usecases/activateListingTrialUseCase';
 export { assertListingPlanPurchasableUseCase } from './usecases/assertListingPlanPurchasableUseCase';
 export { getListingPlanUntilUseCase } from './usecases/getListingPlanUntilUseCase';
+export { assertListingPlanActiveUseCase } from './usecases/assertListingPlanActiveUseCase';
+export { listActivePlanItemIdsUseCase } from './usecases/listActivePlanItemIdsUseCase';
 export { applyListingPaidPlanUseCase } from './usecases/applyListingPaidPlanUseCase';
 export { setListingSealByAdminUseCase } from './usecases/setListingSealByAdminUseCase';
 export { computeListingSealUseCase } from './usecases/computeListingSealUseCase';

=== server/domain/partners/ports/listingPlanRepositoryPort.ts — diff ===
@@ -12,6 +12,8 @@ export interface ListingPlanRepositoryPort {
   listExpiredWithSeal(nowIso: string, limit: number): Promise<ListingPlanRecord[]>;
   /** Planos com selo público ligado que vencem entre as duas datas. */
   listExpiringWithSeal(fromIso: string, toIso: string, limit: number): Promise<ListingPlanRecord[]>;
+  /** Planos em vigor (validade depois de `nowIso`), para o rodízio do destaque. */
+  listActive(nowIso: string, limit: number): Promise<ListingPlanRecord[]>;
   delete(itemId: string): Promise<void>;
   deleteByOwner(ownerId: string): Promise<void>;
 }

=== server/domain/partners/services/listingPlanService.test.ts — diff ===
@@ -41,6 +41,9 @@ class InMemoryPlans implements ListingPlanRepositoryPort {
       (p) => p.sealActive && p.planUntil !== null && p.planUntil > fromIso && p.planUntil <= toIso
     );
   }
+  async listActive(nowIso: string) {
+    return [...this.plans.values()].filter((p) => p.planUntil !== null && p.planUntil > nowIso);
+  }
   async delete(itemId: string) {
     this.plans.delete(itemId);
   }
@@ -113,6 +116,45 @@ describe('ListingPlanService (D11)', () => {
     });
   });
 
+  it('métricas exigem plano em vigor no estabelecimento', async () => {
+    await expect(service.assertPlanActive('item-1')).rejects.toMatchObject({
+      code: 'LISTING_PLAN_REQUIRED',
+      statusCode: 403,
+    });
+    const expired: ListingPlanRecord = {
+      itemId: 'item-1',
+      ownerId: 'owner-1',
+      planType: 'monthly',
+      planUntil: '2026-10-20T12:00:00.000Z',
+      sealSuspended: false,
+      sealActive: false,
+      updatedAt: '',
+    };
+    await repo.save(expired);
+    await expect(service.assertPlanActive('item-1')).rejects.toMatchObject({
+      code: 'LISTING_PLAN_REQUIRED',
+    });
+    await repo.save({ ...expired, planUntil: '2026-11-20T12:00:00.000Z' });
+    await expect(service.assertPlanActive('item-1')).resolves.toBeUndefined();
+  });
+
+  it('destaque: só planos em vigor de contas não suspensas', async () => {
+    const base: ListingPlanRecord = {
+      itemId: 'item-1',
+      ownerId: 'owner-1',
+      planType: 'annual',
+      planUntil: '2027-01-01T00:00:00.000Z',
+      sealSuspended: false,
+      sealActive: true,
+      updatedAt: '',
+    };
+    await repo.save(base);
+    await repo.save({ ...base, itemId: 'item-2', planUntil: '2026-10-01T00:00:00.000Z' });
+    await repo.save({ ...base, itemId: 'item-3', ownerId: 'owner-2' });
+    repo.suspended.add('owner-2');
+    expect(await service.listActivePlanItemIds(50)).toEqual(['item-1']);
+  });
+
   it('lista selos ligados já vencidos e os que vencem em breve', async () => {
     await repo.save({
       itemId: 'item-1',

=== server/domain/partners/services/listingPlanService.ts — diff ===
@@ -104,6 +104,17 @@ export class ListingPlanService {
     }
   }
 
+  /** Métricas do estabelecimento exigem o plano dele em vigor (D11); avaliações seguem livres. */
+  async assertPlanActive(itemId: string): Promise<void> {
+    const record = await this.repository.get(itemId);
+    if (!record || !isPlanActive(record, this.now())) {
+      throw new ListingPlanError(
+        'LISTING_PLAN_REQUIRED',
+        'As métricas deste estabelecimento fazem parte do plano Use Guide Verificado.'
+      );
+    }
+  }
+
   async getPlanUntil(itemId: string): Promise<string | null> {
     const record = await this.repository.get(itemId);
     return record && isPlanActive(record, this.now()) ? record.planUntil : null;
@@ -164,6 +175,19 @@ export class ListingPlanService {
     return this.repository.listExpiringWithSeal(now.toISOString(), until.toISOString(), limit);
   }
 
+  /** Estabelecimentos com plano em vigor e conta ativa: são os que entram no destaque (D11). */
+  async listActivePlanItemIds(limit: number): Promise<string[]> {
+    const records = await this.repository.listActive(this.now().toISOString(), limit);
+    const owners = [...new Set(records.map((record) => record.ownerId))];
+    const suspended = new Set<string>();
+    for (const ownerId of owners) {
+      if (await this.repository.isOwnerSuspended(ownerId)) suspended.add(ownerId);
+    }
+    return records
+      .filter((record) => record.planType !== null && !suspended.has(record.ownerId))
+      .map((record) => record.itemId);
+  }
+
   deleteForListing(itemId: string): Promise<void> {
     return this.repository.delete(itemId);
   }

=== server/domain/partners/usecases/assertListingPlanActiveUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingPlanService } from '../factory';

export function assertListingPlanActiveUseCase(itemId: string): Promise<void> {
  return listingPlanService.assertPlanActive(itemId);
}

=== server/domain/partners/usecases/listActivePlanItemIdsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingPlanService } from '../factory';

export function listActivePlanItemIdsUseCase(limit: number): Promise<string[]> {
  return listingPlanService.listActivePlanItemIds(limit);
}

=== server/interfaces/http/insights/listingStatsController.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';

const m = vi.hoisted(() => ({ getStats: vi.fn() }));

vi.mock('../../../application/usecases/insights/getListingStatsApplicationUseCase', () => ({
  getListingStatsApplicationUseCase: m.getStats,
}));
vi.mock('../../../domain/insights', async () => {
  const { InsightsAccessError } = await import('../../../domain/insights/errors/insightsErrors');
  return { InsightsAccessError };
});
vi.mock('../../../domain/partners', async () => {
  const { ListingPlanError } = await import('../../../domain/partners/errors/listingPlanError');
  return { ListingPlanError };
});

import { InsightsAccessError } from '../../../domain/insights/errors/insightsErrors';
import { ListingPlanError } from '../../../domain/partners/errors/listingPlanError';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { ListingStatsController } from './listingStatsController';

const USER = { uid: 'partner-1', admin: false, emailVerified: true, authTime: 1 };
const PARAMS = { itemCollection: 'items', itemId: 'item-1' };

function mockResponse() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

function request(partial: Partial<AuthenticatedRequest>): AuthenticatedRequest {
  return partial as AuthenticatedRequest;
}

async function call(partial: Partial<AuthenticatedRequest>) {
  const res = mockResponse();
  await ListingStatsController.get(request(partial), res as unknown as Response);
  return res;
}

describe('ListingStatsController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sem login responde 401', async () => {
    const res = await call({ params: PARAMS });
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('coleção inválida responde 400', async () => {
    const res = await call({ user: USER, params: { ...PARAMS, itemCollection: 'users' } });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(m.getStats).not.toHaveBeenCalled();
  });

  it('item de outro parceiro responde 403 FORBIDDEN', async () => {
    m.getStats.mockRejectedValue(new InsightsAccessError());
    const res = await call({ user: USER, params: PARAMS });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json.mock.calls[0]?.[0].error.code).toBe('FORBIDDEN');
  });

  it('estabelecimento sem plano responde 403 LISTING_PLAN_REQUIRED', async () => {
    m.getStats.mockRejectedValue(new ListingPlanError('LISTING_PLAN_REQUIRED', 'Sem plano.'));
    const res = await call({ user: USER, params: PARAMS });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json.mock.calls[0]?.[0].error.code).toBe('LISTING_PLAN_REQUIRED');
  });

  it('com plano responde 200 com as métricas', async () => {
    m.getStats.mockResolvedValue({ views: 2 });
    const res = await call({ user: USER, params: PARAMS });
    expect(m.getStats).toHaveBeenCalledWith({ uid: 'partner-1', admin: false }, 'item-1', 'items');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { views: 2 } });
  });
});

=== server/interfaces/http/insights/listingStatsController.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { getListingStatsApplicationUseCase } from '../../../application/usecases/insights/getListingStatsApplicationUseCase';
import { InsightsAccessError } from '../../../domain/insights';
import { ListingPlanError } from '../../../domain/partners';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { ListingStatsParamsSchema } from './schemas/listingStatsSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

export class ListingStatsController {
  static async get(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user)
      return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login para ver as métricas.');
    const params = ListingStatsParamsSchema.safeParse(req.params);
    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Item inválido.');
    try {
      const data = await getListingStatsApplicationUseCase(
        { uid: req.user.uid, admin: req.user.admin },
        params.data.itemId,
        params.data.itemCollection
      );
      return res.status(200).json({ success: true, data });
    } catch (error) {
      if (error instanceof InsightsAccessError) {
        return sendError(res, 403, error.code, error.message);
      }
      if (error instanceof ListingPlanError) {
        return sendError(res, error.statusCode, error.code, error.message);
      }
      console.error('[ListingStatsController.get]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível carregar as métricas.');
    }
  }
}

=== server/interfaces/http/insights/listingStatsRoutes.ts — ARQUIVO NOVO, conteúdo completo ===
import { Router } from 'express';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { ListingStatsController } from './listingStatsController';

const router = Router();

router.get('/:itemCollection/:itemId', verifyAuthToken, ListingStatsController.get);

export default router;

=== server/interfaces/http/insights/schemas/listingStatsSchemas.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';

export const ListingStatsParamsSchema = z
  .object({
    itemId: z.string().trim().min(1).max(200),
    itemCollection: z.enum(['items', 'events']),
  })
  .strict();

=== server/interfaces/http/partners/internalPartnersController.test.ts — diff ===
@@ -3,6 +3,7 @@ import { beforeEach, describe, expect, it, vi } from 'vitest';
 
 const mocks = vi.hoisted(() => ({
   runListingPlanMaintenanceApplicationUseCase: vi.fn(),
+  refreshFeaturedListingsApplicationUseCase: vi.fn(),
 }));
 
 vi.mock(
@@ -12,6 +13,10 @@ vi.mock(
   })
 );
 
+vi.mock('../../../application/usecases/featured/refreshFeaturedListingsApplicationUseCase', () => ({
+  refreshFeaturedListingsApplicationUseCase: mocks.refreshFeaturedListingsApplicationUseCase,
+}));
+
 import { InternalPartnersController } from './internalPartnersController';
 
 describe('InternalPartnersController.checkExpiringPlans', () => {
@@ -30,16 +35,29 @@ describe('InternalPartnersController.checkExpiringPlans', () => {
     };
   });
 
-  it('retorna 200 com os selos vencidos e os avisos enviados', async () => {
+  it('retorna 200 com os selos vencidos, os avisos e o rodízio do destaque', async () => {
     mocks.runListingPlanMaintenanceApplicationUseCase.mockResolvedValue({
       expired: 1,
       notified: 3,
     });
+    mocks.refreshFeaturedListingsApplicationUseCase.mockResolvedValue({
+      day: '2026-10-22',
+      featured: 9,
+    });
 
     await InternalPartnersController.checkExpiringPlans(req as Request, res as Response);
 
     expect(statusMock).toHaveBeenCalledWith(200);
-    expect(jsonMock).toHaveBeenCalledWith({ expired: 1, notified: 3 });
+    expect(jsonMock).toHaveBeenCalledWith({
+      expired: 1,
+      notified: 3,
+      featured: { day: '2026-10-22', featured: 9 },
+    });
+    expect(
+      mocks.refreshFeaturedListingsApplicationUseCase.mock.invocationCallOrder[0] ?? -1
+    ).toBeGreaterThan(
+      mocks.runListingPlanMaintenanceApplicationUseCase.mock.invocationCallOrder[0] ?? -1
+    );
   });
 
   it('retorna 500 com código de erro interno em caso de falha', async () => {

=== server/interfaces/http/partners/internalPartnersController.ts — diff ===
@@ -1,12 +1,15 @@
 import type { Request, Response } from 'express';
+import { refreshFeaturedListingsApplicationUseCase } from '../../../application/usecases/featured/refreshFeaturedListingsApplicationUseCase';
 import { runListingPlanMaintenanceApplicationUseCase } from '../../../application/usecases/listingPlans/runListingPlanMaintenanceApplicationUseCase';
 
-// Chamado pelo job agendado checkExpiringPlans; a chave já foi conferida por verifyInternalJobKey.
+// Chamado pelo job diário checkExpiringPlans; a chave já foi conferida por verifyInternalJobKey.
+// O rodízio do destaque roda depois da manutenção para já não contar os planos que venceram.
 export class InternalPartnersController {
   static async checkExpiringPlans(_req: Request, res: Response): Promise<Response> {
     try {
-      const result = await runListingPlanMaintenanceApplicationUseCase();
-      return res.status(200).json(result);
+      const maintenance = await runListingPlanMaintenanceApplicationUseCase();
+      const featured = await refreshFeaturedListingsApplicationUseCase();
+      return res.status(200).json({ ...maintenance, featured });
     } catch (error) {
       console.error('[partners.checkExpiringPlansJob]', {
         name: error instanceof Error ? error.name : 'UnknownError',

=== server/shared/kernel/featuredSlots.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { resolveFeaturedSlotsPerList } from './featuredSlots';

describe('resolveFeaturedSlotsPerList', () => {
  it('usa 3 vagas quando a variável não está configurada', () => {
    expect(resolveFeaturedSlotsPerList(undefined)).toBe(3);
    expect(resolveFeaturedSlotsPerList(' ')).toBe(3);
  });

  it('aceita inteiro entre 0 e 12', () => {
    expect(resolveFeaturedSlotsPerList('5')).toBe(5);
    expect(resolveFeaturedSlotsPerList('0')).toBe(0);
  });

  it('falha com valor inválido', () => {
    expect(() => resolveFeaturedSlotsPerList('três')).toThrow('FEATURED_SLOTS_PER_LIST');
    expect(() => resolveFeaturedSlotsPerList('2.5')).toThrow();
    expect(() => resolveFeaturedSlotsPerList('13')).toThrow();
  });
});

=== server/shared/kernel/featuredSlots.ts — ARQUIVO NOVO, conteúdo completo ===
const DEFAULT_FEATURED_SLOTS = 3;
const MAX_FEATURED_SLOTS = 12;

/**
 * Vagas de "Destaque" por lista (D11), lidas de `FEATURED_SLOTS_PER_LIST`. Sem valor vale 3;
 * valor inválido falha na chamada (§2.2.4) em vez de publicar um número de vagas não configurado.
 */
export function resolveFeaturedSlotsPerList(...args: [raw?: string | undefined]): number {
  const raw = args.length > 0 ? args[0] : process.env.FEATURED_SLOTS_PER_LIST;
  const trimmed = (raw ?? '').trim();
  if (trimmed === '') return DEFAULT_FEATURED_SLOTS;
  const slots = Number(trimmed);
  if (!Number.isInteger(slots) || slots < 0 || slots > MAX_FEATURED_SLOTS) {
    throw new Error(`FEATURED_SLOTS_PER_LIST deve ser um inteiro entre 0 e ${MAX_FEATURED_SLOTS}.`);
  }
  return slots;
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm test` → 173 arquivos, 920 testes, `npm run build`;
- `npm run test:rules` → 4 arquivos, 63 testes.

CONFIGURAÇÃO: FEATURED_SLOTS_PER_LIST é opcional (sem ela valem 3 vagas). Em produção, se quiser outro valor, crie a variável no Cloud Run.

FIREBASE: publique as regras (`firebase deploy --only firestore:rules`).

Responda no formato do AGENTS.md §16.3.
~~~~
