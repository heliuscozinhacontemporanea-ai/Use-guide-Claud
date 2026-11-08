# Prompt 18.2.2 — Contato do evento em um só lugar (B19)

> Lote 12, gerado do commit de referência `94a3ad6` da branch `claude/agents-md-v2`. Aplique depois do 18.2.1. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.2.2 — Contato do evento em um só lugar (B19)

Decisão de 2026-10-19: o contato do evento fica só nos campos do topo, como nos itens do guia.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint (AGENTS.md §13).

O QUE MUDA:
1) Domínio events, no servidor e no cliente:
   - phone, websiteLink, instagramLink e bookingLink passam a ser a única fonte do contato do evento;
   - o objeto contact sai dos tipos, dos schemas de entrada e do mapper de persistência;
   - não há leitura do formato antigo; os dados de teste podem ser recriados.
2) server/domain/events/services/eventsService.ts tinha 633 linhas e foi dividido (§13):
   - EventsService, para os anúncios;
   - EventOccurrencesService (novo), para as sessões;
   - eventAccess.ts (novo), com assertCanManageListing, validateOccurrenceTiming e EventActorContext;
   - factory.ts exporta eventOccurrencesService, e os UseCases de sessão passam a usá-lo.
3) Teste novo: server/domain/events/dtos/eventPersistenceMappers.test.ts.
4) docs/arquitetura/debitos.md: B19 resolvido.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- server/domain/events/dtos/eventPersistenceMappers.test.ts (criar)
- server/domain/events/dtos/eventPersistenceMappers.ts (alterar)
- server/domain/events/factory.ts (alterar)
- server/domain/events/schemas/eventSchema.ts (alterar)
- server/domain/events/services/eventAccess.ts (criar)
- server/domain/events/services/eventOccurrencesService.ts (criar)
- server/domain/events/services/eventsService.test.ts (alterar)
- server/domain/events/services/eventsService.ts (alterar)
- server/domain/events/types/eventTypes.ts (alterar)
- server/domain/events/usecases/cancelEventOccurrenceUseCase.ts (alterar)
- server/domain/events/usecases/completeEventOccurrenceUseCase.ts (alterar)
- server/domain/events/usecases/createEventOccurrenceUseCase.ts (alterar)
- server/domain/events/usecases/deleteEventOccurrenceUseCase.ts (alterar)
- server/domain/events/usecases/getEventOccurrenceByIdUseCase.ts (alterar)
- server/domain/events/usecases/listEventOccurrencesUseCase.ts (alterar)
- server/domain/events/usecases/postponeEventOccurrenceUseCase.ts (alterar)
- server/domain/events/usecases/updateEventOccurrenceUseCase.ts (alterar)
- server/domain/ticketing/services/ticketingService.test.ts (alterar)
- src/domain/events/types/event.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -15,13 +15,13 @@
 | B16 | textos fixos em pt-BR ainda em `user/components/AccountView.tsx`, `ticketing/components/UserTicketsHistoryView.tsx` e `CheckoutResultView.tsx`, `partners/components/PartnersModal.tsx`, `insights/components/ReportsView.tsx`, `guide/components/ExploreView.tsx` | §12.3 | médio para en/fr | traduzir tela a tela; o Prompt 16 traduziu menu, configurações, favoritos e portal do parceiro |
 | B17 | Painel do parceiro — itens da auditoria de 2026-10-12 ainda abertos | §11.8, §11.10, §12.4, §11.7, §13 | médio | seção de reservas aparece para hospedagem/restaurante; ingressos ocultos em evento novo sem aviso; relatórios bloqueados só na UI; quem já assina vê a compra de novo; erros de catálogo/notificações aparecem como lista vazia; excluir lote e "não compareceu" sem confirmação; `PartnerItemForms.tsx` sem uso; `Step2ContactInfo.tsx` (516 linhas) e `Step5Media.tsx` (756) acima de 400 linhas |
 | B18 | Painel admin — itens da auditoria de 2026-10-12 ainda abertos | §6.2, §6.4, §8, §11.7, §11.8 | médio | preço de planos em reais (Prompt 17.1); preço de item gravado como texto; catálogo e planos lidos direto do Firestore (deveria ser API, com limite); relatórios em branco antes de carregar e média 0.0 sem avaliações; card de eventos conta rascunhos; duas entradas (`/admin` e `?admin=1`); visitante sem login redirecionado sem aviso; tabs sem `role="tablist"` |
-| B19 | Modelo de eventos guarda contato em dois lugares (`phone` no topo e `contact.phone`) | §13, §6.3 | baixo | unificar em `contact` quando o editor único (Prompt 18.2) tocar no evento |
 | B20 | `operationalInfoSchema` duplicado em `server/domain/guide/schemas/guideSchema.ts` e `server/domain/partners/schemas/partnerContentSchema.ts` | §5.3 | baixo — as duas cópias precisam mudar juntas | rotas de conteúdo do parceiro passarem a validar com o schema publicado pelo `guide` (Published Language) |
 
 ## Resolvidos
 
 | ID | Resolução |
 |---|---|
+| B19 | Prompt 18.2.2 (decisão de 2026-10-19): o contato do evento fica só nos campos do topo (`phone`, `websiteLink`, `instagramLink`, `bookingLink`), como nos itens do guia; o objeto `contact` deixou de ser lido e gravado; `eventsService` dividido em `EventsService` (anúncios) e `EventOccurrencesService` (sessões), com as regras de acesso em `eventAccess.ts` |
 | Sessões do evento no editor — Prompt 18.2.1 | `EventSessionsField` e `saveEventSessionsUseCase` (events) usados pelo parceiro e pelo admin (decisão de 2026-10-19, opção A): o parceiro passa a editar datas, horários e capacidade; a data do evento é derivada das sessões; o editor do admin deixa de importar o gerenciador de ingressos de outro domínio (§5.2); `PartnerEventForm` dividido em seções (634 → 67 linhas) e modal em `PartnerEventEditor` (`PartnerPanel` abaixo de 400 linhas); o editor de evento não fecha ao clicar fora; botões do editor de evento com nome acessível |
 | Editor único de cadastro — Prompt 18.2 | `ListingEditor` (partners) usado pelo painel do parceiro e pelo admin (composição `AdminPanelComposition`); o admin edita hospedagem, restaurante, atração, passeio, translado, aluguel e perfil de produtor com os mesmos campos da inscrição; o editor não fecha ao clicar fora; `PartnerPanel.tsx` abaixo de 400 linhas; datas no fuso de Fortaleza no gerenciador de ingressos (AI Studio, lote 9); três critérios de "pronto para receber" unificados (17.2); preço de plano por `Intl` (17.1) |
 | Categorias passeio, translado e aluguel na inscrição e no editor — Prompt 18.1 | formulário com campos próprios por categoria (`steps/details/`), validação no `step3Schema`, gravação em `operationalInfo`; editor do painel sem CPF/CNPJ e com categoria travada em item existente; campo de arquivo do cardápio removido |

=== server/domain/events/dtos/eventPersistenceMappers.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { EventListingPersistenceMapper } from './eventPersistenceMappers';

const contactFields = {
  phone: '+5588999999999',
  websiteLink: 'https://evento.example',
  instagramLink: 'https://instagram.com/evento',
  bookingLink: 'https://ingressos.example',
};

describe('EventListingPersistenceMapper — contato do evento (B19)', () => {
  it('grava o contato só nos campos do topo, sem o objeto contact', () => {
    const doc = EventListingPersistenceMapper.toPersistenceCreate({
      ownerId: 'owner-1',
      name: 'Luau',
      description: 'Música ao vivo',
      images: [],
      location: 'Jericoacoara',
      ...contactFields,
    });
    expect(doc).toMatchObject(contactFields);
    expect(doc).not.toHaveProperty('contact');
  });

  it('a atualização também não grava contact', () => {
    const patch = EventListingPersistenceMapper.toPersistenceUpdate({ phone: contactFields.phone });
    expect(patch).toMatchObject({ phone: contactFields.phone });
    expect(patch).not.toHaveProperty('contact');
  });

  it('lê o contato dos campos do topo', () => {
    const listing = EventListingPersistenceMapper.toDomain('ev-1', {
      ownerId: 'owner-1',
      title: 'Luau',
      description: '',
      images: [],
      location: 'Jericoacoara',
      status: 'published',
      ...contactFields,
    });
    expect(listing).toMatchObject(contactFields);
  });
});

=== server/domain/events/dtos/eventPersistenceMappers.ts — diff ===
@@ -10,7 +10,12 @@ import type {
 
 function toIsoString(val: unknown, fallback: string): string {
   if (typeof val === 'string' && val.trim().length > 0) return val;
-  if (val && typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
+  if (
+    val &&
+    typeof val === 'object' &&
+    'toDate' in val &&
+    typeof (val as { toDate: () => Date }).toDate === 'function'
+  ) {
     return (val as { toDate: () => Date }).toDate().toISOString();
   }
   return fallback;
@@ -31,7 +36,10 @@ export class EventListingPersistenceMapper {
     const location: EventLocation =
       rawLoc && typeof rawLoc === 'object'
         ? {
-            name: typeof (rawLoc as Record<string, unknown>).name === 'string' ? String((rawLoc as Record<string, unknown>).name) : undefined,
+            name:
+              typeof (rawLoc as Record<string, unknown>).name === 'string'
+                ? String((rawLoc as Record<string, unknown>).name)
+                : undefined,
             address:
               typeof (rawLoc as Record<string, unknown>).address === 'string'
                 ? String((rawLoc as Record<string, unknown>).address)
@@ -44,8 +52,14 @@ export class EventListingPersistenceMapper {
                 : typeof raw.googleMapsLink === 'string'
                   ? raw.googleMapsLink
                   : undefined,
-            latitude: typeof (rawLoc as Record<string, unknown>).latitude === 'number' ? Number((rawLoc as Record<string, unknown>).latitude) : undefined,
-            longitude: typeof (rawLoc as Record<string, unknown>).longitude === 'number' ? Number((rawLoc as Record<string, unknown>).longitude) : undefined,
+            latitude:
+              typeof (rawLoc as Record<string, unknown>).latitude === 'number'
+                ? Number((rawLoc as Record<string, unknown>).latitude)
+                : undefined,
+            longitude:
+              typeof (rawLoc as Record<string, unknown>).longitude === 'number'
+                ? Number((rawLoc as Record<string, unknown>).longitude)
+                : undefined,
           }
         : {
             name: typeof rawLoc === 'string' ? rawLoc : 'Jericoacoara',
@@ -105,20 +119,10 @@ export class EventListingPersistenceMapper {
       isActive: status === 'published',
       organizerId: String(raw.organizerId || ownerId),
       location,
-      contact: {
-        phone:
-          (raw.contact as Record<string, string> | undefined)?.phone ||
-          (typeof raw.phone === 'string' ? raw.phone : undefined),
-        website:
-          (raw.contact as Record<string, string> | undefined)?.website ||
-          (typeof raw.websiteLink === 'string' ? raw.websiteLink : undefined),
-        instagram:
-          (raw.contact as Record<string, string> | undefined)?.instagram ||
-          (typeof raw.instagramLink === 'string' ? raw.instagramLink : undefined),
-        booking:
-          (raw.contact as Record<string, string> | undefined)?.booking ||
-          (typeof raw.bookingLink === 'string' ? raw.bookingLink : undefined),
-      },
+      phone: typeof raw.phone === 'string' ? raw.phone : undefined,
+      websiteLink: typeof raw.websiteLink === 'string' ? raw.websiteLink : undefined,
+      instagramLink: typeof raw.instagramLink === 'string' ? raw.instagramLink : undefined,
+      bookingLink: typeof raw.bookingLink === 'string' ? raw.bookingLink : undefined,
       refundPolicy: {
         enabled:
           typeof (raw.refundPolicy as Record<string, unknown> | undefined)?.enabled === 'boolean'
@@ -230,32 +234,10 @@ export class EventListingPersistenceMapper {
       ...(locationObj.googleMapsLink || input.googleMapsLink
         ? { googleMapsLink: locationObj.googleMapsLink || input.googleMapsLink }
         : {}),
-      ...(input.phone || input.contact?.phone
-        ? { phone: input.phone || input.contact?.phone }
-        : {}),
-      ...(input.websiteLink || input.contact?.website
-        ? { websiteLink: input.websiteLink || input.contact?.website }
-        : {}),
-      ...(input.instagramLink || input.contact?.instagram
-        ? { instagramLink: input.instagramLink || input.contact?.instagram }
-        : {}),
-      ...(input.bookingLink || input.contact?.booking
-        ? { bookingLink: input.bookingLink || input.contact?.booking }
-        : {}),
-      contact: {
-        ...(input.contact?.phone || input.phone
-          ? { phone: input.contact?.phone || input.phone }
-          : {}),
-        ...(input.contact?.website || input.websiteLink
-          ? { website: input.contact?.website || input.websiteLink }
-          : {}),
-        ...(input.contact?.instagram || input.instagramLink
-          ? { instagram: input.contact?.instagram || input.instagramLink }
-          : {}),
-        ...(input.contact?.booking || input.bookingLink
-          ? { booking: input.contact?.booking || input.bookingLink }
-          : {}),
-      },
+      ...(input.phone ? { phone: input.phone } : {}),
+      ...(input.websiteLink ? { websiteLink: input.websiteLink } : {}),
+      ...(input.instagramLink ? { instagramLink: input.instagramLink } : {}),
+      ...(input.bookingLink ? { bookingLink: input.bookingLink } : {}),
       refundPolicy: input.refundPolicy || {
         enabled: true,
         cancellationWindowHours: 24,
@@ -321,7 +303,6 @@ export class EventListingPersistenceMapper {
     if (input.websiteLink !== undefined) patch.websiteLink = input.websiteLink;
     if (input.instagramLink !== undefined) patch.instagramLink = input.instagramLink;
     if (input.bookingLink !== undefined) patch.bookingLink = input.bookingLink;
-    if (input.contact !== undefined) patch.contact = input.contact;
     if (input.refundPolicy !== undefined) patch.refundPolicy = input.refundPolicy;
     if (input.ageRestriction !== undefined) patch.ageRestriction = input.ageRestriction;
     if (input.entryType !== undefined) {
@@ -329,8 +310,7 @@ export class EventListingPersistenceMapper {
       patch.pricingMode = input.entryType === 'pago' ? 'paid' : 'free';
     }
     if (input.pricingMode !== undefined) patch.pricingMode = input.pricingMode;
-    if (input.startingPriceMinor !== undefined)
-      patch.startingPriceMinor = input.startingPriceMinor;
+    if (input.startingPriceMinor !== undefined) patch.startingPriceMinor = input.startingPriceMinor;
     if (input.maxTicketsPerUserPerOccurrence !== undefined)
       patch.maxTicketsPerUserPerOccurrence = input.maxTicketsPerUserPerOccurrence;
     if (input.date !== undefined) patch.date = input.date;

=== server/domain/events/factory.ts — diff ===
@@ -1,5 +1,7 @@
 import { FirestoreEventAdapter } from './adapters/firestoreEventAdapter';
+import { EventOccurrencesService } from './services/eventOccurrencesService';
 import { EventsService } from './services/eventsService';
 
 const firestoreEventAdapter = new FirestoreEventAdapter();
 export const eventsService = new EventsService(firestoreEventAdapter);
+export const eventOccurrencesService = new EventOccurrencesService(firestoreEventAdapter);

=== server/domain/events/schemas/eventSchema.ts — diff ===
@@ -103,15 +103,6 @@ export const createEventListingSchema = z
     websiteLink: optionalUrl,
     instagramLink: optionalUrl,
     bookingLink: optionalUrl,
-    contact: z
-      .object({
-        phone: z.string().trim().regex(E164_PATTERN, E164_MESSAGE).optional(),
-        website: optionalUrl,
-        instagram: optionalUrl,
-        booking: optionalUrl,
-      })
-      .strict()
-      .optional(),
     refundPolicy: eventRefundPolicySchema.optional(),
     ageRestriction: z
       .object({
@@ -158,15 +149,6 @@ export const updateEventListingSchema = z
     websiteLink: optionalUrl,
     instagramLink: optionalUrl,
     bookingLink: optionalUrl,
-    contact: z
-      .object({
-        phone: z.string().trim().regex(E164_PATTERN, E164_MESSAGE).optional(),
-        website: optionalUrl,
-        instagram: optionalUrl,
-        booking: optionalUrl,
-      })
-      .strict()
-      .optional(),
     refundPolicy: eventRefundPolicySchema.optional(),
     ageRestriction: z
       .object({

=== server/domain/events/services/eventAccess.ts — ARQUIVO NOVO, conteúdo completo ===
import { EventDomainError, EventOwnershipError } from '../errors/eventDomainError';
import type { EventListing } from '../types/eventTypes';

export interface EventActorContext {
  uid: string;
  admin?: boolean;
  role?: string;
}

/** Só o dono do evento ou um admin altera o evento e as sessões. */
export function assertCanManageListing(actor: EventActorContext, listing: EventListing): void {
  if (actor.admin === true) {
    return;
  }
  if (!actor.uid || listing.ownerId !== actor.uid) {
    throw new EventOwnershipError();
  }
}

/** Capacidade positiva, término depois do início e vendas encerradas antes da sessão. */
export function validateOccurrenceTiming(input: {
  startsAt: string;
  endsAt: string;
  capacity: number;
  salesStartsAt?: string;
  salesEndsAt?: string;
}): void {
  if (!Number.isInteger(input.capacity) || input.capacity <= 0) {
    throw new EventDomainError(
      'INVALID_ARGUMENT',
      'A capacidade da ocorrência deve ser maior que zero.'
    );
  }
  const startMs = new Date(input.startsAt).getTime();
  const endMs = new Date(input.endsAt).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    throw new EventDomainError(
      'INVALID_ARGUMENT',
      'A data/hora de término deve ser posterior à data/hora de início.'
    );
  }
  if (input.salesStartsAt && input.salesEndsAt) {
    const salesStartMs = new Date(input.salesStartsAt).getTime();
    const salesEndMs = new Date(input.salesEndsAt).getTime();
    if (
      !Number.isFinite(salesStartMs) ||
      !Number.isFinite(salesEndMs) ||
      salesEndMs <= salesStartMs
    ) {
      throw new EventDomainError(
        'INVALID_ARGUMENT',
        'O encerramento das vendas deve ser posterior ao início das vendas.'
      );
    }
  }
  if (input.salesEndsAt) {
    const salesEndMs = new Date(input.salesEndsAt).getTime();
    if (!Number.isFinite(salesEndMs) || salesEndMs > startMs) {
      throw new EventDomainError(
        'INVALID_ARGUMENT',
        'O encerramento das vendas não pode ultrapassar o início da ocorrência.'
      );
    }
  }
}

=== server/domain/events/services/eventOccurrencesService.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  EventDomainError,
  EventNotFoundError,
  OccurrenceNotFoundError,
} from '../errors/eventDomainError';
import type { EventsPort } from '../ports/eventsPort';
import {
  canTransitionOccurrenceStatus,
  type CreateEventOccurrenceInput,
  type EventOccurrence,
  type UpdateEventOccurrenceInput,
} from '../types/eventTypes';
import {
  assertCanManageListing,
  type EventActorContext,
  validateOccurrenceTiming,
} from './eventAccess';

/** Sessões de um evento: criação, alteração, cancelamento, adiamento, conclusão e exclusão. */
export class EventOccurrencesService {
  constructor(private readonly eventsPort: EventsPort) {}

  async createOccurrence(
    actor: EventActorContext,
    input: CreateEventOccurrenceInput
  ): Promise<EventOccurrence> {
    const listing = await this.eventsPort.getListingById(input.eventListingId);
    if (!listing) {
      throw new EventNotFoundError();
    }
    assertCanManageListing(actor, listing);
    validateOccurrenceTiming(input);

    const occurrence = await this.eventsPort.createOccurrence(input);

    if (!listing.date) {
      await this.eventsPort.updateListing(listing.id, {
        date: occurrence.startsAt,
        endDate: occurrence.endsAt,
      });
    }

    await this.eventsPort.createAuditLog({
      actorId: actor.uid,
      actorType: actor.admin ? 'admin' : 'partner',
      resourceType: 'occurrence',
      resourceId: occurrence.id,
      action: 'occurrence.created',
      after: occurrence,
    });

    return occurrence;
  }

  async getOccurrenceById(occurrenceId: string): Promise<EventOccurrence | null> {
    return this.eventsPort.getOccurrenceById(occurrenceId);
  }

  async listOccurrencesByListingId(
    eventListingId: string,
    options?: { publicOnly?: boolean }
  ): Promise<EventOccurrence[]> {
    const listing = await this.eventsPort.getListingById(eventListingId);
    if (!listing) {
      return [];
    }
    if (
      options?.publicOnly &&
      (listing.status !== 'published' || listing.visibility !== 'public')
    ) {
      return [];
    }
    const occurrences = await this.eventsPort.listOccurrencesByListingId(eventListingId);
    if (options?.publicOnly) {
      return occurrences.filter((occ) => occ.status !== 'canceled');
    }
    return occurrences;
  }

  async updateOccurrence(
    actor: EventActorContext,
    occurrenceId: string,
    input: UpdateEventOccurrenceInput,
    committedTicketsCount = 0
  ): Promise<EventOccurrence> {
    const occurrence = await this.eventsPort.getOccurrenceById(occurrenceId);
    if (!occurrence) {
      throw new OccurrenceNotFoundError();
    }
    const listing = await this.eventsPort.getListingById(occurrence.eventListingId);
    if (!listing) {
      throw new EventNotFoundError();
    }
    assertCanManageListing(actor, listing);

    if (input.status && !canTransitionOccurrenceStatus(occurrence.status, input.status)) {
      throw new EventDomainError(
        'UNPROCESSABLE_ENTITY',
        `Transição de status inválida de ${occurrence.status} para ${input.status}.`
      );
    }

    if (input.capacity !== undefined && input.capacity < committedTicketsCount) {
      throw new EventDomainError(
        'UNPROCESSABLE_ENTITY',
        'A capacidade não pode ser reduzida abaixo da quantidade de ingressos vendidos ou reservados.'
      );
    }

    if (
      committedTicketsCount > 0 &&
      ((input.startsAt && input.startsAt !== occurrence.startsAt) ||
        (input.endsAt && input.endsAt !== occurrence.endsAt))
    ) {
      throw new EventDomainError(
        'UNPROCESSABLE_ENTITY',
        'Ocorrência com vendas ativas deve ser adiada/reagendada via operação de adiamento para preservar o histórico.'
      );
    }

    const nextStartsAt = input.startsAt || occurrence.startsAt;
    const nextEndsAt = input.endsAt || occurrence.endsAt;
    const nextCapacity = input.capacity ?? occurrence.capacity;
    const nextSalesStart = input.salesStartsAt ?? occurrence.salesStartsAt;
    const nextSalesEnd = input.salesEndsAt ?? occurrence.salesEndsAt;

    validateOccurrenceTiming({
      startsAt: nextStartsAt,
      endsAt: nextEndsAt,
      capacity: nextCapacity,
      salesStartsAt: nextSalesStart,
      salesEndsAt: nextSalesEnd,
    });

    const updated = await this.eventsPort.updateOccurrence(occurrenceId, input);

    await this.eventsPort.createAuditLog({
      actorId: actor.uid,
      actorType: actor.admin ? 'admin' : 'partner',
      resourceType: 'occurrence',
      resourceId: occurrenceId,
      action: 'occurrence.updated',
      before: occurrence,
      after: updated,
    });

    return updated;
  }

  async cancelOccurrence(
    actor: EventActorContext,
    occurrenceId: string,
    reason?: string
  ): Promise<EventOccurrence> {
    const occurrence = await this.eventsPort.getOccurrenceById(occurrenceId);
    if (!occurrence) {
      throw new OccurrenceNotFoundError();
    }
    const listing = await this.eventsPort.getListingById(occurrence.eventListingId);
    if (!listing) {
      throw new EventNotFoundError();
    }
    assertCanManageListing(actor, listing);

    if (!canTransitionOccurrenceStatus(occurrence.status, 'canceled')) {
      throw new EventDomainError(
        'UNPROCESSABLE_ENTITY',
        `Não é possível cancelar uma ocorrência no status ${occurrence.status}.`
      );
    }

    const updated = await this.eventsPort.updateOccurrence(occurrenceId, {
      status: 'canceled',
      cancellationReason: reason || 'Cancelado pela organização.',
    });

    await this.eventsPort.createAuditLog({
      actorId: actor.uid,
      actorType: actor.admin ? 'admin' : 'partner',
      resourceType: 'occurrence',
      resourceId: occurrenceId,
      action: 'occurrence.canceled',
      reason,
      before: occurrence,
      after: updated,
    });

    return updated;
  }

  async postponeOccurrence(
    actor: EventActorContext,
    occurrenceId: string,
    replacement: {
      startsAt: string;
      endsAt: string;
      salesStartsAt?: string;
      salesEndsAt?: string;
      reason: string;
    }
  ): Promise<{ postponedOccurrence: EventOccurrence; newOccurrence: EventOccurrence }> {
    const occurrence = await this.eventsPort.getOccurrenceById(occurrenceId);
    if (!occurrence) {
      throw new OccurrenceNotFoundError();
    }
    const listing = await this.eventsPort.getListingById(occurrence.eventListingId);
    if (!listing) {
      throw new EventNotFoundError();
    }
    assertCanManageListing(actor, listing);

    if (!canTransitionOccurrenceStatus(occurrence.status, 'postponed')) {
      throw new EventDomainError(
        'UNPROCESSABLE_ENTITY',
        `Não é possível adiar uma ocorrência no status ${occurrence.status}.`
      );
    }

    validateOccurrenceTiming({
      startsAt: replacement.startsAt,
      endsAt: replacement.endsAt,
      capacity: occurrence.capacity,
      salesStartsAt: replacement.salesStartsAt,
      salesEndsAt: replacement.salesEndsAt,
    });

    const newOccurrence = await this.eventsPort.createOccurrence({
      eventListingId: occurrence.eventListingId,
      startsAt: replacement.startsAt,
      endsAt: replacement.endsAt,
      capacity: occurrence.capacity,
      salesStartsAt: replacement.salesStartsAt,
      salesEndsAt: replacement.salesEndsAt,
      locationOverride: occurrence.locationOverride,
      rescheduledFromOccurrenceId: occurrence.id,
    });

    const postponedOccurrence = await this.eventsPort.updateOccurrence(occurrence.id, {
      status: 'postponed',
      postponementReason: replacement.reason,
      rescheduledToOccurrenceId: newOccurrence.id,
    });

    await this.eventsPort.createAuditLog({
      actorId: actor.uid,
      actorType: actor.admin ? 'admin' : 'partner',
      resourceType: 'occurrence',
      resourceId: occurrence.id,
      action: 'occurrence.postponed',
      reason: replacement.reason,
      before: occurrence,
      after: {
        postponedOccurrenceId: postponedOccurrence.id,
        newOccurrenceId: newOccurrence.id,
      },
    });

    return { postponedOccurrence, newOccurrence };
  }

  async completeOccurrence(
    actor: EventActorContext,
    occurrenceId: string
  ): Promise<EventOccurrence> {
    const occurrence = await this.eventsPort.getOccurrenceById(occurrenceId);
    if (!occurrence) {
      throw new OccurrenceNotFoundError();
    }
    const listing = await this.eventsPort.getListingById(occurrence.eventListingId);
    if (!listing) {
      throw new EventNotFoundError();
    }
    assertCanManageListing(actor, listing);

    if (!canTransitionOccurrenceStatus(occurrence.status, 'completed')) {
      throw new EventDomainError(
        'UNPROCESSABLE_ENTITY',
        `Não é possível concluir uma ocorrência no status ${occurrence.status}.`
      );
    }

    return this.eventsPort.updateOccurrence(occurrenceId, {
      status: 'completed',
    });
  }

  async deleteOccurrence(
    actor: EventActorContext,
    occurrenceId: string,
    hasCommercialHistory: boolean
  ): Promise<{ mode: 'deleted' | 'canceled' }> {
    const occurrence = await this.eventsPort.getOccurrenceById(occurrenceId);
    if (!occurrence) {
      throw new OccurrenceNotFoundError();
    }
    const listing = await this.eventsPort.getListingById(occurrence.eventListingId);
    if (!listing) {
      throw new EventNotFoundError();
    }
    assertCanManageListing(actor, listing);

    if (hasCommercialHistory) {
      await this.cancelOccurrence(
        actor,
        occurrenceId,
        'Cancelada por exclusão com histórico comercial.'
      );
      return { mode: 'canceled' };
    }

    await this.eventsPort.deleteOccurrence(occurrenceId);
    await this.eventsPort.createAuditLog({
      actorId: actor.uid,
      actorType: actor.admin ? 'admin' : 'partner',
      resourceType: 'occurrence',
      resourceId: occurrenceId,
      action: 'occurrence.deleted',
    });

    return { mode: 'deleted' };
  }
}

=== server/domain/events/services/eventsService.test.ts — diff ===
@@ -1,4 +1,5 @@
 import { beforeEach, describe, expect, it, vi } from 'vitest';
+import { EventOccurrencesService } from './eventOccurrencesService';
 import { EventsService } from './eventsService';
 import type { EventsPort } from '../ports/eventsPort';
 import type { EventListing, EventOccurrence } from '../types/eventTypes';
@@ -71,10 +72,12 @@ const sampleOccurrence: EventOccurrence = {
 describe('EventsService', () => {
   let port: EventsPort;
   let service: EventsService;
+  let occurrences: EventOccurrencesService;
 
   beforeEach(() => {
     port = createMockPort();
     service = new EventsService(port);
+    occurrences = new EventOccurrencesService(port);
   });
 
   it('creates an EventListing and its initial EventOccurrences with audit log', async () => {
@@ -128,11 +131,9 @@ describe('EventsService', () => {
     vi.mocked(port.getListingById).mockResolvedValue(sampleListing);
 
     await expect(
-      service.updateListing(
-        { uid: 'partner-other', admin: false },
-        'ev-1',
-        { title: 'Tentativa Inválida' }
-      )
+      service.updateListing({ uid: 'partner-other', admin: false }, 'ev-1', {
+        title: 'Tentativa Inválida',
+      })
     ).rejects.toMatchObject({
       code: 'FORBIDDEN',
     });
@@ -165,7 +166,7 @@ describe('EventsService', () => {
     vi.mocked(port.getListingById).mockResolvedValue(sampleListing);
 
     await expect(
-      service.updateOccurrence(
+      occurrences.updateOccurrence(
         { uid: 'partner-1', admin: false },
         'occ-1',
         { capacity: 20 },
@@ -193,7 +194,7 @@ describe('EventsService', () => {
       postponementReason: 'Chuva forte',
     });
 
-    const result = await service.postponeOccurrence(
+    const result = await occurrences.postponeOccurrence(
       { uid: 'partner-1', admin: false },
       'occ-1',
       {

=== server/domain/events/services/eventsService.ts — diff ===
@@ -2,80 +2,28 @@ import {
   EventDomainError,
   EventNotFoundError,
   EventOwnershipError,
-  OccurrenceNotFoundError,
 } from '../errors/eventDomainError';
 import type { EventsPort } from '../ports/eventsPort';
 import {
-  canTransitionOccurrenceStatus,
   type CreateEventListingInput,
   type CreateEventOccurrenceInput,
   type EventListing,
   type EventOccurrence,
   type EventRatingSummary,
   type UpdateEventListingInput,
-  type UpdateEventOccurrenceInput,
 } from '../types/eventTypes';
+import {
+  assertCanManageListing,
+  type EventActorContext,
+  validateOccurrenceTiming,
+} from './eventAccess';
 
-export interface EventActorContext {
-  uid: string;
-  admin?: boolean;
-  role?: string;
-}
+export type { EventActorContext } from './eventAccess';
 
+/** Anúncios de evento: criação, edição, publicação, duplicação e exclusão. */
 export class EventsService {
   constructor(private readonly eventsPort: EventsPort) {}
 
-  private assertCanManageListing(actor: EventActorContext, listing: EventListing): void {
-    if (actor.admin === true) {
-      return;
-    }
-    if (!actor.uid || listing.ownerId !== actor.uid) {
-      throw new EventOwnershipError();
-    }
-  }
-
-  private validateOccurrenceTiming(input: {
-    startsAt: string;
-    endsAt: string;
-    capacity: number;
-    salesStartsAt?: string;
-    salesEndsAt?: string;
-  }): void {
-    if (!Number.isInteger(input.capacity) || input.capacity <= 0) {
-      throw new EventDomainError(
-        'INVALID_ARGUMENT',
-        'A capacidade da ocorrência deve ser maior que zero.'
-      );
-    }
-    const startMs = new Date(input.startsAt).getTime();
-    const endMs = new Date(input.endsAt).getTime();
-    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
-      throw new EventDomainError(
-        'INVALID_ARGUMENT',
-        'A data/hora de término deve ser posterior à data/hora de início.'
-      );
-    }
-    if (input.salesStartsAt && input.salesEndsAt) {
-      const salesStartMs = new Date(input.salesStartsAt).getTime();
-      const salesEndMs = new Date(input.salesEndsAt).getTime();
-      if (!Number.isFinite(salesStartMs) || !Number.isFinite(salesEndMs) || salesEndMs <= salesStartMs) {
-        throw new EventDomainError(
-          'INVALID_ARGUMENT',
-          'O encerramento das vendas deve ser posterior ao início das vendas.'
-        );
-      }
-    }
-    if (input.salesEndsAt) {
-      const salesEndMs = new Date(input.salesEndsAt).getTime();
-      if (!Number.isFinite(salesEndMs) || salesEndMs > startMs) {
-        throw new EventDomainError(
-          'INVALID_ARGUMENT',
-          'O encerramento das vendas não pode ultrapassar o início da ocorrência.'
-        );
-      }
-    }
-  }
-
   async createListing(
     actor: EventActorContext,
     input: Omit<CreateEventListingInput, 'ownerId'> & {
@@ -100,7 +48,7 @@ export class EventsService {
           : [];
 
     for (const occ of initialOccurrences) {
-      this.validateOccurrenceTiming(occ);
+      validateOccurrenceTiming(occ);
     }
 
     const firstOcc = initialOccurrences[0];
@@ -171,7 +119,7 @@ export class EventsService {
     if (!existing) {
       throw new EventNotFoundError();
     }
-    this.assertCanManageListing(actor, existing);
+    assertCanManageListing(actor, existing);
 
     const safeInput: UpdateEventListingInput = { ...input };
     delete (safeInput as Record<string, unknown>).ownerId;
@@ -216,7 +164,7 @@ export class EventsService {
     if (!existing) {
       throw new EventNotFoundError();
     }
-    this.assertCanManageListing(actor, existing);
+    assertCanManageListing(actor, existing);
 
     if (hasCommercialHistory) {
       await this.eventsPort.updateListing(id, { status: 'archived', isActive: false });
@@ -252,7 +200,7 @@ export class EventsService {
     if (!existing) {
       throw new EventNotFoundError();
     }
-    this.assertCanManageListing(actor, existing);
+    assertCanManageListing(actor, existing);
 
     return this.eventsPort.createListing({
       ownerId: actor.admin ? existing.ownerId : actor.uid,
@@ -273,7 +221,10 @@ export class EventsService {
       isActive: false,
       organizerId: existing.organizerId,
       location: existing.location,
-      contact: existing.contact,
+      phone: existing.phone,
+      websiteLink: existing.websiteLink,
+      instagramLink: existing.instagramLink,
+      bookingLink: existing.bookingLink,
       refundPolicy: existing.refundPolicy,
       ageRestriction: existing.ageRestriction,
       entryType: existing.entryType,
@@ -281,303 +232,6 @@ export class EventsService {
     });
   }
 
-  async createOccurrence(
-    actor: EventActorContext,
-    input: CreateEventOccurrenceInput
-  ): Promise<EventOccurrence> {
-    const listing = await this.eventsPort.getListingById(input.eventListingId);
-    if (!listing) {
-      throw new EventNotFoundError();
-    }
-    this.assertCanManageListing(actor, listing);
-    this.validateOccurrenceTiming(input);
-
-    const occurrence = await this.eventsPort.createOccurrence(input);
-
-    if (!listing.date) {
-      await this.eventsPort.updateListing(listing.id, {
-        date: occurrence.startsAt,
-        endDate: occurrence.endsAt,
-      });
-    }
-
-    await this.eventsPort.createAuditLog({
-      actorId: actor.uid,
-      actorType: actor.admin ? 'admin' : 'partner',
-      resourceType: 'occurrence',
-      resourceId: occurrence.id,
-      action: 'occurrence.created',
-      after: occurrence,
-    });
-
-    return occurrence;
-  }
-
-  async getOccurrenceById(occurrenceId: string): Promise<EventOccurrence | null> {
-    return this.eventsPort.getOccurrenceById(occurrenceId);
-  }
-
-  async listOccurrencesByListingId(
-    eventListingId: string,
-    options?: { publicOnly?: boolean }
-  ): Promise<EventOccurrence[]> {
-    const listing = await this.eventsPort.getListingById(eventListingId);
-    if (!listing) {
-      return [];
-    }
-    if (options?.publicOnly && (listing.status !== 'published' || listing.visibility !== 'public')) {
-      return [];
-    }
-    const occurrences = await this.eventsPort.listOccurrencesByListingId(eventListingId);
-    if (options?.publicOnly) {
-      return occurrences.filter((occ) => occ.status !== 'canceled');
-    }
-    return occurrences;
-  }
-
-  async updateOccurrence(
-    actor: EventActorContext,
-    occurrenceId: string,
-    input: UpdateEventOccurrenceInput,
-    committedTicketsCount = 0
-  ): Promise<EventOccurrence> {
-    const occurrence = await this.eventsPort.getOccurrenceById(occurrenceId);
-    if (!occurrence) {
-      throw new OccurrenceNotFoundError();
-    }
-    const listing = await this.eventsPort.getListingById(occurrence.eventListingId);
-    if (!listing) {
-      throw new EventNotFoundError();
-    }
-    this.assertCanManageListing(actor, listing);
-
-    if (input.status && !canTransitionOccurrenceStatus(occurrence.status, input.status)) {
-      throw new EventDomainError(
-        'UNPROCESSABLE_ENTITY',
-        `Transição de status inválida de ${occurrence.status} para ${input.status}.`
-      );
-    }
-
-    if (input.capacity !== undefined && input.capacity < committedTicketsCount) {
-      throw new EventDomainError(
-        'UNPROCESSABLE_ENTITY',
-        'A capacidade não pode ser reduzida abaixo da quantidade de ingressos vendidos ou reservados.'
-      );
-    }
-
-    if (
-      committedTicketsCount > 0 &&
-      ((input.startsAt && input.startsAt !== occurrence.startsAt) ||
-        (input.endsAt && input.endsAt !== occurrence.endsAt))
-    ) {
-      throw new EventDomainError(
-        'UNPROCESSABLE_ENTITY',
-        'Ocorrência com vendas ativas deve ser adiada/reagendada via operação de adiamento para preservar o histórico.'
-      );
-    }
-
-    const nextStartsAt = input.startsAt || occurrence.startsAt;
-    const nextEndsAt = input.endsAt || occurrence.endsAt;
-    const nextCapacity = input.capacity ?? occurrence.capacity;
-    const nextSalesStart = input.salesStartsAt ?? occurrence.salesStartsAt;
-    const nextSalesEnd = input.salesEndsAt ?? occurrence.salesEndsAt;
-
-    this.validateOccurrenceTiming({
-      startsAt: nextStartsAt,
-      endsAt: nextEndsAt,
-      capacity: nextCapacity,
-      salesStartsAt: nextSalesStart,
-      salesEndsAt: nextSalesEnd,
-    });
-
-    const updated = await this.eventsPort.updateOccurrence(occurrenceId, input);
-
-    await this.eventsPort.createAuditLog({
-      actorId: actor.uid,
-      actorType: actor.admin ? 'admin' : 'partner',
-      resourceType: 'occurrence',
-      resourceId: occurrenceId,
-      action: 'occurrence.updated',
-      before: occurrence,
-      after: updated,
-    });
-
-    return updated;
-  }
-
-  async cancelOccurrence(
-    actor: EventActorContext,
-    occurrenceId: string,
-    reason?: string
-  ): Promise<EventOccurrence> {
-    const occurrence = await this.eventsPort.getOccurrenceById(occurrenceId);
-    if (!occurrence) {
-      throw new OccurrenceNotFoundError();
-    }
-    const listing = await this.eventsPort.getListingById(occurrence.eventListingId);
-    if (!listing) {
-      throw new EventNotFoundError();
-    }
-    this.assertCanManageListing(actor, listing);
-
-    if (!canTransitionOccurrenceStatus(occurrence.status, 'canceled')) {
-      throw new EventDomainError(
-        'UNPROCESSABLE_ENTITY',
-        `Não é possível cancelar uma ocorrência no status ${occurrence.status}.`
-      );
-    }
-
-    const updated = await this.eventsPort.updateOccurrence(occurrenceId, {
-      status: 'canceled',
-      cancellationReason: reason || 'Cancelado pela organização.',
-    });
-
-    await this.eventsPort.createAuditLog({
-      actorId: actor.uid,
-      actorType: actor.admin ? 'admin' : 'partner',
-      resourceType: 'occurrence',
-      resourceId: occurrenceId,
-      action: 'occurrence.canceled',
-      reason,
-      before: occurrence,
-      after: updated,
-    });
-
-    return updated;
-  }
-
-  async postponeOccurrence(
-    actor: EventActorContext,
-    occurrenceId: string,
-    replacement: {
-      startsAt: string;
-      endsAt: string;
-      salesStartsAt?: string;
-      salesEndsAt?: string;
-      reason: string;
-    }
-  ): Promise<{ postponedOccurrence: EventOccurrence; newOccurrence: EventOccurrence }> {
-    const occurrence = await this.eventsPort.getOccurrenceById(occurrenceId);
-    if (!occurrence) {
-      throw new OccurrenceNotFoundError();
-    }
-    const listing = await this.eventsPort.getListingById(occurrence.eventListingId);
-    if (!listing) {
-      throw new EventNotFoundError();
-    }
-    this.assertCanManageListing(actor, listing);
-
-    if (!canTransitionOccurrenceStatus(occurrence.status, 'postponed')) {
-      throw new EventDomainError(
-        'UNPROCESSABLE_ENTITY',
-        `Não é possível adiar uma ocorrência no status ${occurrence.status}.`
-      );
-    }
-
-    this.validateOccurrenceTiming({
-      startsAt: replacement.startsAt,
-      endsAt: replacement.endsAt,
-      capacity: occurrence.capacity,
-      salesStartsAt: replacement.salesStartsAt,
-      salesEndsAt: replacement.salesEndsAt,
-    });
-
-    const newOccurrence = await this.eventsPort.createOccurrence({
-      eventListingId: occurrence.eventListingId,
-      startsAt: replacement.startsAt,
-      endsAt: replacement.endsAt,
-      capacity: occurrence.capacity,
-      salesStartsAt: replacement.salesStartsAt,
-      salesEndsAt: replacement.salesEndsAt,
-      locationOverride: occurrence.locationOverride,
-      rescheduledFromOccurrenceId: occurrence.id,
-    });
-
-    const postponedOccurrence = await this.eventsPort.updateOccurrence(occurrence.id, {
-      status: 'postponed',
-      postponementReason: replacement.reason,
-      rescheduledToOccurrenceId: newOccurrence.id,
-    });
-
-    await this.eventsPort.createAuditLog({
-      actorId: actor.uid,
-      actorType: actor.admin ? 'admin' : 'partner',
-      resourceType: 'occurrence',
-      resourceId: occurrence.id,
-      action: 'occurrence.postponed',
-      reason: replacement.reason,
-      before: occurrence,
-      after: {
-        postponedOccurrenceId: postponedOccurrence.id,
-        newOccurrenceId: newOccurrence.id,
-      },
-    });
-
-    return { postponedOccurrence, newOccurrence };
-  }
-
-  async completeOccurrence(
-    actor: EventActorContext,
-    occurrenceId: string
-  ): Promise<EventOccurrence> {
-    const occurrence = await this.eventsPort.getOccurrenceById(occurrenceId);
-    if (!occurrence) {
-      throw new OccurrenceNotFoundError();
-    }
-    const listing = await this.eventsPort.getListingById(occurrence.eventListingId);
-    if (!listing) {
-      throw new EventNotFoundError();
-    }
-    this.assertCanManageListing(actor, listing);
-
-    if (!canTransitionOccurrenceStatus(occurrence.status, 'completed')) {
-      throw new EventDomainError(
-        'UNPROCESSABLE_ENTITY',
-        `Não é possível concluir uma ocorrência no status ${occurrence.status}.`
-      );
-    }
-
-    return this.eventsPort.updateOccurrence(occurrenceId, {
-      status: 'completed',
-    });
-  }
-
-  async deleteOccurrence(
-    actor: EventActorContext,
-    occurrenceId: string,
-    hasCommercialHistory: boolean
-  ): Promise<{ mode: 'deleted' | 'canceled' }> {
-    const occurrence = await this.eventsPort.getOccurrenceById(occurrenceId);
-    if (!occurrence) {
-      throw new OccurrenceNotFoundError();
-    }
-    const listing = await this.eventsPort.getListingById(occurrence.eventListingId);
-    if (!listing) {
-      throw new EventNotFoundError();
-    }
-    this.assertCanManageListing(actor, listing);
-
-    if (hasCommercialHistory) {
-      await this.cancelOccurrence(
-        actor,
-        occurrenceId,
-        'Cancelada por exclusão com histórico comercial.'
-      );
-      return { mode: 'canceled' };
-    }
-
-    await this.eventsPort.deleteOccurrence(occurrenceId);
-    await this.eventsPort.createAuditLog({
-      actorId: actor.uid,
-      actorType: actor.admin ? 'admin' : 'partner',
-      resourceType: 'occurrence',
-      resourceId: occurrenceId,
-      action: 'occurrence.deleted',
-    });
-
-    return { mode: 'deleted' };
-  }
-
   async updateRatingSummary(eventListingId: string, summary: EventRatingSummary): Promise<void> {
     await this.eventsPort.updateRatingSummary(eventListingId, summary);
   }
@@ -591,14 +245,14 @@ export class EventsService {
       isVerificationSuspended: boolean;
     }
   ): Promise<void> {
-    if (!ownerId || !ownerId.trim()) {
+    if (!ownerId?.trim()) {
       throw new EventDomainError('INVALID_ARGUMENT', 'ID do proprietário inválido');
     }
     await this.eventsPort.updateVerificationByOwner(ownerId, verification);
   }
 
   async deleteListingsByOwner(ownerId: string): Promise<void> {
-    if (!ownerId || !ownerId.trim()) {
+    if (!ownerId?.trim()) {
       return;
     }
     await this.eventsPort.deleteListingsByOwner(ownerId);

=== server/domain/events/types/eventTypes.ts — diff ===
@@ -35,12 +35,11 @@ export interface EventListing {
   isActive: boolean;
   organizerId: string;
   location: EventLocation;
-  contact?: {
-    phone?: string;
-    website?: string;
-    instagram?: string;
-    booking?: string;
-  };
+  /** Contato do evento: campos no topo, como nos itens do guia (B19). Telefone em E.164. */
+  phone?: string;
+  websiteLink?: string;
+  instagramLink?: string;
+  bookingLink?: string;
   refundPolicy: {
     enabled: boolean;
     cancellationWindowHours?: number;
@@ -124,12 +123,6 @@ export interface CreateEventListingInput {
   websiteLink?: string;
   instagramLink?: string;
   bookingLink?: string;
-  contact?: {
-    phone?: string;
-    website?: string;
-    instagram?: string;
-    booking?: string;
-  };
   refundPolicy?: {
     enabled: boolean;
     cancellationWindowHours?: number;
@@ -171,12 +164,6 @@ export interface UpdateEventListingInput {
   websiteLink?: string;
   instagramLink?: string;
   bookingLink?: string;
-  contact?: {
-    phone?: string;
-    website?: string;
-    instagram?: string;
-    booking?: string;
-  };
   refundPolicy?: {
     enabled: boolean;
     cancellationWindowHours?: number;

=== server/domain/events/usecases/cancelEventOccurrenceUseCase.ts — diff ===
@@ -1,4 +1,4 @@
-import { eventsService } from '../factory';
+import { eventOccurrencesService } from '../factory';
 import type { EventActorContext } from '../services/eventsService';
 import type { EventOccurrence } from '../types/eventTypes';
 
@@ -7,5 +7,5 @@ export async function cancelEventOccurrenceUseCase(
   occurrenceId: string,
   reason?: string
 ): Promise<EventOccurrence> {
-  return eventsService.cancelOccurrence(actor, occurrenceId, reason);
+  return eventOccurrencesService.cancelOccurrence(actor, occurrenceId, reason);
 }

=== server/domain/events/usecases/completeEventOccurrenceUseCase.ts — diff ===
@@ -1,4 +1,4 @@
-import { eventsService } from '../factory';
+import { eventOccurrencesService } from '../factory';
 import type { EventActorContext } from '../services/eventsService';
 import type { EventOccurrence } from '../types/eventTypes';
 
@@ -6,5 +6,5 @@ export async function completeEventOccurrenceUseCase(
   actor: EventActorContext,
   occurrenceId: string
 ): Promise<EventOccurrence> {
-  return eventsService.completeOccurrence(actor, occurrenceId);
+  return eventOccurrencesService.completeOccurrence(actor, occurrenceId);
 }

=== server/domain/events/usecases/createEventOccurrenceUseCase.ts — diff ===
@@ -1,4 +1,4 @@
-import { eventsService } from '../factory';
+import { eventOccurrencesService } from '../factory';
 import type { EventActorContext } from '../services/eventsService';
 import type { CreateEventOccurrenceInput, EventOccurrence } from '../types/eventTypes';
 
@@ -6,5 +6,5 @@ export async function createEventOccurrenceUseCase(
   actor: EventActorContext,
   input: CreateEventOccurrenceInput
 ): Promise<EventOccurrence> {
-  return eventsService.createOccurrence(actor, input);
+  return eventOccurrencesService.createOccurrence(actor, input);
 }

=== server/domain/events/usecases/deleteEventOccurrenceUseCase.ts — diff ===
@@ -1,4 +1,4 @@
-import { eventsService } from '../factory';
+import { eventOccurrencesService } from '../factory';
 import type { EventActorContext } from '../services/eventsService';
 
 export async function deleteEventOccurrenceUseCase(
@@ -6,5 +6,5 @@ export async function deleteEventOccurrenceUseCase(
   occurrenceId: string,
   hasCommercialHistory = false
 ): Promise<{ mode: 'deleted' | 'canceled' }> {
-  return eventsService.deleteOccurrence(actor, occurrenceId, hasCommercialHistory);
+  return eventOccurrencesService.deleteOccurrence(actor, occurrenceId, hasCommercialHistory);
 }

=== server/domain/events/usecases/getEventOccurrenceByIdUseCase.ts — diff ===
@@ -1,8 +1,8 @@
-import { eventsService } from '../factory';
+import { eventOccurrencesService } from '../factory';
 import type { EventOccurrence } from '../types/eventTypes';
 
 export async function getEventOccurrenceByIdUseCase(
   occurrenceId: string
 ): Promise<EventOccurrence | null> {
-  return eventsService.getOccurrenceById(occurrenceId);
+  return eventOccurrencesService.getOccurrenceById(occurrenceId);
 }

=== server/domain/events/usecases/listEventOccurrencesUseCase.ts — diff ===
@@ -1,9 +1,9 @@
-import { eventsService } from '../factory';
+import { eventOccurrencesService } from '../factory';
 import type { EventOccurrence } from '../types/eventTypes';
 
 export async function listEventOccurrencesUseCase(
   eventListingId: string,
   options?: { publicOnly?: boolean }
 ): Promise<EventOccurrence[]> {
-  return eventsService.listOccurrencesByListingId(eventListingId, options);
+  return eventOccurrencesService.listOccurrencesByListingId(eventListingId, options);
 }

=== server/domain/events/usecases/postponeEventOccurrenceUseCase.ts — diff ===
@@ -1,4 +1,4 @@
-import { eventsService } from '../factory';
+import { eventOccurrencesService } from '../factory';
 import type { EventActorContext } from '../services/eventsService';
 import type { EventOccurrence } from '../types/eventTypes';
 
@@ -13,5 +13,5 @@ export async function postponeEventOccurrenceUseCase(
     reason: string;
   }
 ): Promise<{ postponedOccurrence: EventOccurrence; newOccurrence: EventOccurrence }> {
-  return eventsService.postponeOccurrence(actor, occurrenceId, replacement);
+  return eventOccurrencesService.postponeOccurrence(actor, occurrenceId, replacement);
 }

=== server/domain/events/usecases/updateEventOccurrenceUseCase.ts — diff ===
@@ -1,4 +1,4 @@
-import { eventsService } from '../factory';
+import { eventOccurrencesService } from '../factory';
 import type { EventActorContext } from '../services/eventsService';
 import type { EventOccurrence, UpdateEventOccurrenceInput } from '../types/eventTypes';
 
@@ -8,5 +8,10 @@ export async function updateEventOccurrenceUseCase(
   input: UpdateEventOccurrenceInput,
   committedTicketsCount = 0
 ): Promise<EventOccurrence> {
-  return eventsService.updateOccurrence(actor, occurrenceId, input, committedTicketsCount);
+  return eventOccurrencesService.updateOccurrence(
+    actor,
+    occurrenceId,
+    input,
+    committedTicketsCount
+  );
 }

=== server/domain/ticketing/services/ticketingService.test.ts — diff ===
@@ -17,10 +17,7 @@ vi.mock('../../events', () => ({
   updateEventListingPricingSummaryUseCase: vi.fn().mockResolvedValue(undefined),
 }));
 
-import {
-  getEventListingByIdUseCase,
-  getEventOccurrenceByIdUseCase,
-} from '../../events';
+import { getEventListingByIdUseCase, getEventOccurrenceByIdUseCase } from '../../events';
 
 function createMockTicketType(overrides: Partial<TicketType> = {}): TicketType {
   return {
@@ -84,7 +81,6 @@ describe('TicketingService', () => {
       status: 'published',
       isActive: true,
       location: { name: 'Praia do Preá' },
-      contact: {},
       refundPolicy: { enabled: true, cancellationWindowHours: 48 },
       entryType: 'pago',
       pricingMode: 'paid',
@@ -94,14 +90,14 @@ describe('TicketingService', () => {
     });
 
     mockPort = {
-      createTicketType: vi.fn().mockImplementation(async (input) =>
-        createMockTicketType({ ...input, id: 'tt_created' })
-      ),
+      createTicketType: vi
+        .fn()
+        .mockImplementation(async (input) => createMockTicketType({ ...input, id: 'tt_created' })),
       getTicketTypeById: vi.fn().mockResolvedValue(createMockTicketType()),
       listTicketTypesByOccurrenceId: vi.fn().mockResolvedValue([createMockTicketType()]),
-      updateTicketType: vi.fn().mockImplementation(async (_id, patch) =>
-        createMockTicketType(patch)
-      ),
+      updateTicketType: vi
+        .fn()
+        .mockImplementation(async (_id, patch) => createMockTicketType(patch)),
       deleteTicketType: vi.fn().mockResolvedValue(undefined),
       reserveInventoryAndCreateOrderAtomic: vi.fn().mockImplementation(async (input) => ({
         order: {

=== src/domain/events/types/event.ts — diff ===
@@ -44,12 +44,10 @@ export interface EventListing {
   isActive: boolean;
   organizerId: string;
   location: EventLocation;
-  contact?: {
-    phone?: string;
-    website?: string;
-    instagram?: string;
-    booking?: string;
-  };
+  phone?: string;
+  websiteLink?: string;
+  instagramLink?: string;
+  bookingLink?: string;
   refundPolicy: EventRefundPolicy;
   maxTicketsPerUserPerOccurrence?: number;
   ageRestriction?: {

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm test` → 145 arquivos, 804 testes, `npm run build`.
Responda no formato do AGENTS.md §16.3.
~~~~
