# Desenho do domínio `bookings` (D3)

> Aprovado em 2026-10-09 (decisões D3, D1, D2). Implementação em fases; este documento detalha a **fase 1** (`tour` e `private_entry`) e já reserva espaço no modelo para as fases 2 (`rental`) e 3 (`transfer`).

---

## 1. Responsabilidade e fronteiras

| Domínio | Responsabilidade |
|---|---|
| `guide` | o item do catálogo (passeio, atração privada): nome, fotos, localização, dono |
| **`bookings`** | o que é vendável do item (oferta), disponibilidade (horários e capacidade), reservas, participantes, cancelamento |
| `payment` | PaymentIntent, refund, conta conectada; não conhece "reserva" |
| `server/application` | orquestra bookings ↔ payment ↔ guide ↔ partners ↔ notifications |

Grafo resultante (sem ciclos): `bookings → guide` (ler item e dono); `application → bookings, payment, partners, notifications`. `bookings` NÃO importa `payment`, `ticketing` nem `partners`.

## 2. Modelo de dados (Firestore)

Todas as coleções são escritas só pelo backend. Leitura pública só da projeção `publicBookableOffers`.

### `bookableOffers/{offerId}` (Interna)
```ts
interface BookableOffer {
  id: string;
  guideItemId: string;              // item do catálogo (tour ou sight privado)
  ownerId: string;                  // = guide item ownerId (validado no backend)
  partnerId: string;
  kind: 'tour' | 'private_entry' | 'rental' | 'transfer'; // fase 1: tour, private_entry
  title: LocalizedText;             // { 'pt-BR': string; en?: string; fr?: string }
  description?: LocalizedText;
  status: 'draft' | 'published' | 'paused' | 'archived';
  pricing: {
    currency: 'BRL';
    priceOptions: Array<{
      id: string;                   // ex: 'adult', 'child', 'private_group'
      label: LocalizedText;
      unitAmountMinor: number;      // inteiro, centavos
      minQuantity?: number;
      maxQuantity?: number;
    }>;
  };
  durationMinutes?: number;         // tour
  meetingPoint?: { address: string; lat?: number; lng?: number; instructions?: LocalizedText };
  cancellationPolicy: {
    freeCancellationHoursBefore: number;   // ex: 24
    refundPercentAfterDeadline: 0 | 50 | 100;
  };
  maxParticipantsPerBooking: number;
  requiresParticipantNames: boolean;
  createdAt: string; updatedAt: string;
  // Fase 2 (rental): rentalUnit, depositAmountMinor, termsVersion
  // Fase 3 (transfer): routes, luggagePolicy
}
```

### `publicBookableOffers/{offerId}` (Pública — projeção)
Mesmos campos públicos (`guideItemId`, `kind`, `title`, `description`, `pricing`, `durationMinutes`, `meetingPoint`, `cancellationPolicy`, `status`), sem `ownerId`/`partnerId` internos além do necessário para exibição. Mantida pelo backend a cada escrita da oferta.

### `availabilitySlots/{slotId}` (Pública para leitura via API)
```ts
interface AvailabilitySlot {
  id: string;
  offerId: string;
  startsAt: string;                 // ISO UTC; exibido em America/Fortaleza
  endsAt?: string;
  capacityTotal: number;
  capacityReserved: number;         // reservas pendentes não expiradas
  capacitySold: number;             // reservas confirmadas
  status: 'open' | 'closed' | 'canceled';
}
```
Disponível = `capacityTotal − capacityReserved − capacitySold`. Alterado só dentro de transação.

### `bookings/{bookingId}` (Confidencial)
```ts
interface Booking {
  id: string;
  offerId: string;
  slotId: string;
  guideItemId: string;
  buyerId: string;
  sellerPartnerId: string;
  kind: BookableOffer['kind'];
  status: 'pending_payment' | 'confirmed' | 'completed' | 'canceled'
        | 'refunded' | 'expired' | 'no_show' | 'disputed';
  lines: Array<{ priceOptionId: string; quantity: number; unitAmountMinor: number }>;
  participantsCount: number;
  subtotalMinor: number;
  platformFeeMinor: number;
  totalMinor: number;
  expiresAt: string | null;         // pending_payment: agora + 15 min
  paymentIntentId?: string;
  offerSnapshot: { title: string; startsAt: string; meetingPoint?: string; cancellationPolicy: BookableOffer['cancellationPolicy'] };
  locale: 'pt-BR' | 'en' | 'fr';    // idioma de e-mails/notificações
  idempotencyKey: string;
  createdAt: string; updatedAt: string;
}
```

### `bookingParticipants/{bookingId}_{n}` (Confidencial)
`{ bookingId, name, isLeadContact }` — só quando `requiresParticipantNames`. Telefone do contato principal vem do perfil do usuário (não duplicar PII).

### `bookingAuditLogs/{logId}` (Interna)
Toda mudança de status: `{ bookingId, from, to, actorUid, reason, at }`.

### Rules
```
match /bookableOffers/{id} { allow read, write: if false; }
match /publicBookableOffers/{id} { allow read: if resource.data.status == 'published'; allow write: if false; }
match /availabilitySlots/{id} { allow read, write: if false; }
match /bookings/{id} { allow read, write: if false; }
match /bookingParticipants/{id} { allow read, write: if false; }
match /bookingAuditLogs/{id} { allow read: if isAdmin(); allow write: if false; }
```

## 3. Máquina de estados

```
pending_payment ──(webhook payment_intent.succeeded)──► confirmed ──(job pós-horário)──► completed
       │                                                    │
       ├──(expira 15 min / job)──► expired                  ├──(cliente cancela)──► canceled ──► refunded
       └──(payment_failed)──► pending_payment (pode tentar) ├──(parceiro cancela horário)──► canceled ──► refunded (100%)
                                                            ├──(parceiro marca)──► no_show
                                                            └──(charge.dispute.created)──► disputed
```

Regras:
* `pending_payment → confirmed` só pelo webhook (fonte da verdade), com transação que move `capacityReserved → capacitySold`.
* Expiração devolve `capacityReserved` (job a cada 5 min, igual a `expireTicketingOrders`).
* Cancelamento pelo cliente: reembolso conforme `cancellationPolicy` calculado no backend; dentro do prazo gratuito = 100%.
* Cancelamento de horário pelo parceiro: todas as reservas confirmadas → reembolso 100% com `refund_application_fee: true` e `reverse_transfer: true`.

## 4. API

| Método | Rota | Quem | UseCase |
|---|---|---|---|
| GET | `/api/bookings/offers/:offerId/slots?from=&to=` | público | `listAvailableSlotsUseCase` |
| POST | `/api/bookings` | autenticado (e-mail verificado) | `createBookingApplicationUseCase` (cria reserva + PaymentIntent) |
| GET | `/api/bookings/me` | autenticado | `listMyBookingsUseCase` |
| GET | `/api/bookings/:id` | dono da reserva, parceiro vendedor ou admin | `getBookingUseCase` |
| POST | `/api/bookings/:id/cancel` | dono da reserva | `cancelBookingByBuyerApplicationUseCase` |
| POST | `/api/partners/offers` | parceiro dono do item | `createBookableOfferUseCase` |
| PATCH | `/api/partners/offers/:id` | parceiro dono | `updateBookableOfferUseCase` |
| POST | `/api/partners/offers/:id/slots` | parceiro dono | `createAvailabilitySlotsUseCase` (lote/recorrência) |
| POST | `/api/partners/offers/:id/slots/:slotId/cancel` | parceiro dono | `cancelSlotApplicationUseCase` |
| GET | `/api/partners/offers/:id/bookings` | parceiro dono | `listOfferBookingsForPartnerUseCase` |
| POST | `/internal/bookings/expire` | job (OIDC / chave legada) | `expireOverdueBookingsUseCase` |

Corpo de `POST /api/bookings`:
```json
{ "offerId": "…", "slotId": "…", "lines": [{ "priceOptionId": "adult", "quantity": 2 }], "participants": [{ "name": "…" }], "idempotencyKey": "uuid" }
```
O backend ignora qualquer preço vindo do cliente; recalcula com `pricing` da oferta.

## 5. Pagamento

* Novo UseCase genérico em `payment`: `createMarketplacePaymentIntentUseCase({ referenceType: 'booking', referenceId, buyerId, sellerPartnerId, description, totalMinor, platformFeeMinor, idempotencyKey })` — destination charge (D1), `metadata: { referenceType: 'booking', referenceId, partnerId }`.
* Taxa: `bookingPlatformFeeMinor` de `server/shared/kernel/platformFees.ts` (`BOOKINGS_PLATFORM_FEE_BPS`, arredondamento para baixo; D14).
* Antes de criar: `assertPartnerReadyForPaidEventUseCase(sellerPartnerId)` (conta conectada habilitada).
* Webhook: novo ramo em `reconcileStripeWebhookEventApplicationUseCase` para `metadata.referenceType === 'booking'` (`succeeded` → `confirmBookingPaymentUseCase`; `payment_failed` → `markBookingPaymentFailedUseCase`; disputa → `markBookingDisputedUseCase`; refund com `metadata.bookingId`).

## 6. Frontend

* `src/domain/bookings/` (adapters HTTP, application/usecases, hooks, components, schemas, types).
* Leitura de ofertas publicadas: `publicBookableOffers` via Client SDK (rule pública). Horários e reservas: via API.
* Componentes fase 1: `BookingOfferPanel` (dentro do `TourDetailModal`/`AttractionDetailModal` por composição em `src/app/compositions`), `SlotPicker`, `QuantitySelector`, `BookingCheckout` (reusa o UI adapter do Payment Element), `MyBookingsView`, `PartnerOfferEditor`, `PartnerSlotsManager`, `PartnerBookingsList`.
* Todo texto em `src/shared/i18n/locales/*/bookings.json`.

## 7. Fases seguintes (fora do escopo dos prompts atuais)

* **Fase 2 — rental:** `AvailabilitySlot` vira período (`startsAt`/`endsAt` por unidade), termo de responsabilidade versionado e aceito no checkout, caução por pré-autorização de cartão criada **no dia da retirada** (autorizações de cartão costumam expirar em cerca de 7 dias).
* **Fase 3 — transfer:** rota (origem/destino), passageiros, bagagem, horário de voo opcional.
