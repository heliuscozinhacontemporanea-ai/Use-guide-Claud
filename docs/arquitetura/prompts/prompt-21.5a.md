# Prompt 21.5a — Telas do check-in de reservas (comprador, prestador e admin)

> Lote 18, gerado dos commits de referência `ef9f5a8..540bdb0` da branch `claude/agents-md-v2`. Aplique na ordem do lote (A7, 21.1 a 21.7d), um por vez. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 21.5a — Telas do check-in de reservas (comprador, prestador e admin)

Telas aprovadas em 2026-10-30.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras de negócio estão nas decisões D20 e D21 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A7).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) Comprador: código de check-in e entrada com QR na reserva, "O prestador não veio" e "O serviço aconteceu?" em Compras, endereço de busca no checkout.
2) Prestador: check-in por horário com caixas do código, portaria com leitura de QR, fila no aparelho sem internet, Cheguei, ausência e "Cliente sem código" na lista de reservas, opção de buscar o comprador no editor da oferta.
3) Admin: provas do serviço na reclamação.
4) Textos em pt-BR, en e fr.

ARQUIVOS (crie, altere ou apague exatamente estes):
- src/app/compositions/AdminPanelComposition.tsx (alterar)
- src/domain/bookings/adapters/httpBookingsAdapter.ts (alterar)
- src/domain/bookings/adapters/localPendingCheckInsAdapter.ts (criar)
- src/domain/bookings/adapters/webCryptoEntryPassVerifier.ts (criar)
- src/domain/bookings/application/usecases/answerProviderAbsenceUseCase.ts (criar)
- src/domain/bookings/application/usecases/answerServiceConfirmationUseCase.ts (criar)
- src/domain/bookings/application/usecases/checkInByCodeUseCase.ts (criar)
- src/domain/bookings/application/usecases/checkInEntryUseCase.ts (criar)
- src/domain/bookings/application/usecases/checkInWithoutCodeUseCase.ts (criar)
- src/domain/bookings/application/usecases/getCheckInCodeUseCase.ts (criar)
- src/domain/bookings/application/usecases/getEntryPassUseCase.ts (criar)
- src/domain/bookings/application/usecases/getEntryVerificationKeysUseCase.ts (criar)
- src/domain/bookings/application/usecases/recordArrivalUseCase.ts (criar)
- src/domain/bookings/application/usecases/reportProviderAbsentUseCase.ts (criar)
- src/domain/bookings/components/admin/ServiceEvidenceList.tsx (criar)
- src/domain/bookings/components/buyer/BookingCheckInPass.tsx (criar)
- src/domain/bookings/components/buyer/BookingFlow.tsx (alterar)
- src/domain/bookings/components/buyer/BookingPurchaseDetails.test.tsx (alterar)
- src/domain/bookings/components/buyer/BookingPurchaseDetails.tsx (alterar)
- src/domain/bookings/components/buyer/BookingServiceActions.tsx (criar)
- src/domain/bookings/components/buyer/BuyerBookingCard.tsx (alterar)
- src/domain/bookings/components/buyer/EntryQrImage.tsx (criar)
- src/domain/bookings/components/partner/BookingServiceControls.tsx (criar)
- src/domain/bookings/components/partner/NoCodeCheckInDialog.tsx (criar)
- src/domain/bookings/components/partner/PartnerBookingsList.tsx (alterar)
- src/domain/bookings/components/partner/PartnerOfferEditor.tsx (alterar)
- src/domain/bookings/components/partner/PartnerOffersManager.tsx (alterar)
- src/domain/bookings/components/partner/PartnerSlotsManager.tsx (alterar)
- src/domain/bookings/components/partner/SlotCheckInSheet.tsx (criar)
- src/domain/bookings/hooks/useBookingCheckInPass.ts (criar)
- src/domain/bookings/hooks/useOfferBookings.ts (alterar)
- src/domain/bookings/hooks/useSlotCheckIn.ts (criar)
- src/domain/bookings/index.ts (alterar)
- src/domain/bookings/ports/bookingsApiPort.ts (alterar)
- src/domain/bookings/schemas/offerFormSchema.ts (alterar)
- src/domain/bookings/types/bookings.ts (alterar)
- src/domain/bookings/utils/bookingErrorMessage.ts (alterar)
- src/domain/bookings/utils/checkInPrefix.ts (criar)
- src/domain/bookings/utils/offerFormMapping.ts (alterar)
- src/domain/bookings/utils/serviceProofTiming.ts (criar)
- src/domain/payment/components/admin/AdminFinanceQueues.tsx (alterar)
- src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx (alterar)
- src/domain/payment/components/admin/SaleClaimQueue.tsx (alterar)
- src/domain/payment/components/receivables/payoutStatus.ts (alterar)
- src/domain/payment/types/adminFinance.ts (alterar)
- src/domain/payment/types/receivables.ts (alterar)
- src/shared/i18n/bookingsResources.ts (alterar)
- src/shared/i18n/receivablesResources.ts (alterar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/i18n/serviceProofResources.ts (criar)
- src/ui/components/CodeBoxesInput.tsx (criar)
- src/ui/hooks/useQrScanner.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== src/app/compositions/AdminPanelComposition.tsx — diff ===
@@ -1,5 +1,6 @@
 import { AdminDispatcher, type AdminListingEditorProps } from '../../domain/admin';
 import { useAuthContext } from '../../domain/auth/context/AuthContext';
+import { isBookingServiceEvidence, ServiceEvidenceList } from '../../domain/bookings';
 import { EventSessionsField } from '../../domain/events';
 import {
   createGuideItemUseCase,
@@ -94,7 +95,15 @@ export function AdminPanelComposition() {
       renderListingEditor={(props) => <AdminListingEditor {...props} />}
       renderVerificationQueue={() => <ListingVerificationQueue />}
       renderListingSeal={(item) => <AdminListingSealControl itemId={item.id} name={item.name} />}
-      renderFinanceQueues={() => <AdminFinanceQueues />}
+      renderFinanceQueues={() => (
+        <AdminFinanceQueues
+          renderClaimEvidence={(claim) =>
+            isBookingServiceEvidence(claim.serviceEvidence) ? (
+              <ServiceEvidenceList evidence={claim.serviceEvidence} />
+            ) : null
+          }
+        />
+      )}
       renderModerationQueue={() => <ReviewModerationQueue />}
       renderSessionsField={(props) => <EventSessionsField {...props} />}
       renderTicketingManager={(eventListingId) => (

=== src/domain/bookings/adapters/httpBookingsAdapter.ts — diff ===
@@ -4,6 +4,12 @@ import type {
   BookingDetails,
   BookingSummary,
   CancelBookingResponse,
+  ArrivalLocation,
+  CheckInCodeView,
+  CodeCheckInPayload,
+  EntryCheckInPayload,
+  EntryPassView,
+  NoCodeReason,
   CreateBookingPayload,
   CreateBookingResponse,
   CreateOfferPayload,
@@ -37,6 +43,11 @@ function json(method: 'POST' | 'PATCH', body: unknown): RequestInit {
 }
 
 const offerPath = (offerId: string) => `/api/partners/offers/${encodeURIComponent(offerId)}`;
+const slotPath = (offerId: string, slotId: string) =>
+  `${offerPath(offerId)}/slots/${encodeURIComponent(slotId)}`;
+const offerBookingPath = (offerId: string, bookingId: string) =>
+  `${offerPath(offerId)}/bookings/${encodeURIComponent(bookingId)}`;
+const bookingPath = (bookingId: string) => `/api/bookings/${encodeURIComponent(bookingId)}`;
 
 export class HttpBookingsAdapter implements BookingsApiPort {
   async listPartnerOffers(): Promise<PartnerOffer[]> {
@@ -125,4 +136,82 @@ export class HttpBookingsAdapter implements BookingsApiPort {
   async cancelBooking(bookingId: string): Promise<CancelBookingResponse> {
     return call(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, json('POST', {}));
   }
+
+  async getCheckInCode(bookingId: string): Promise<CheckInCodeView> {
+    return call(`${bookingPath(bookingId)}/check-in-code`);
+  }
+
+  async getEntryPass(bookingId: string): Promise<EntryPassView> {
+    return call(`${bookingPath(bookingId)}/entry-pass`);
+  }
+
+  async reportProviderAbsent(bookingId: string): Promise<BookingSummary> {
+    return call(`${bookingPath(bookingId)}/provider-absent`, json('POST', {}));
+  }
+
+  async answerServiceConfirmation(
+    bookingId: string,
+    answer: 'yes' | 'no'
+  ): Promise<BookingSummary> {
+    return call(`${bookingPath(bookingId)}/service-confirmation`, json('POST', { answer }));
+  }
+
+  async checkInByCode(
+    offerId: string,
+    slotId: string,
+    payload: CodeCheckInPayload
+  ): Promise<BookingSummary> {
+    return call(`${slotPath(offerId, slotId)}/check-ins`, json('POST', payload));
+  }
+
+  async checkInEntry(
+    offerId: string,
+    slotId: string,
+    payload: EntryCheckInPayload
+  ): Promise<BookingSummary> {
+    return call(`${slotPath(offerId, slotId)}/entry-check-ins`, json('POST', payload));
+  }
+
+  async getEntryVerificationKeys(
+    offerId: string
+  ): Promise<Array<{ kid: string; publicKeyJwk: JsonWebKey }>> {
+    return (
+      await call<{ data: Array<{ kid: string; publicKeyJwk: JsonWebKey }> }>(
+        `${offerPath(offerId)}/entry-verification-keys`
+      )
+    ).data;
+  }
+
+  async recordArrival(
+    offerId: string,
+    bookingId: string,
+    location?: ArrivalLocation
+  ): Promise<BookingSummary> {
+    return call(
+      `${offerBookingPath(offerId, bookingId)}/arrival`,
+      json('POST', location ? { location } : {})
+    );
+  }
+
+  async checkInWithoutCode(
+    offerId: string,
+    bookingId: string,
+    payload: { participantsPresent: number; reason: NoCodeReason }
+  ): Promise<BookingSummary> {
+    return call(
+      `${offerBookingPath(offerId, bookingId)}/check-in-without-code`,
+      json('POST', payload)
+    );
+  }
+
+  async answerProviderAbsence(
+    offerId: string,
+    bookingId: string,
+    answer: 'was_there' | 'admitted'
+  ): Promise<BookingSummary> {
+    return call(
+      `${offerBookingPath(offerId, bookingId)}/absence-response`,
+      json('POST', { answer })
+    );
+  }
 }

=== src/domain/bookings/adapters/localPendingCheckInsAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
/** Check-in feito sem internet, guardado no aparelho até a conexão voltar (D20). */
export interface PendingCheckIn {
  id: string;
  offerId: string;
  slotId: string;
  kind: 'code' | 'entry';
  /** O QR lido ou o código digitado, com a hora do aparelho. */
  payload: { code?: string; qrToken?: string; participantsPresent: number; capturedAt: string };
}

const KEY = 'useguide.pendingCheckIns';

// Armazenamento pode faltar (modo privado, bloqueio): sem ele, a fila fica vazia e nada quebra.
function read(): PendingCheckIn[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as PendingCheckIn[]) : [];
  } catch {
    return [];
  }
}

function write(items: PendingCheckIn[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Sem armazenamento o check-in não fica guardado; a tela já avisou que está sem internet.
  }
}

export const pendingCheckIns = {
  list(offerId: string): PendingCheckIn[] {
    return read().filter((item) => item.offerId === offerId);
  },
  add(item: Omit<PendingCheckIn, 'id'>): PendingCheckIn {
    const saved = { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
    write([...read(), saved]);
    return saved;
  },
  remove(id: string): void {
    write(read().filter((item) => item.id !== id));
  },
};

=== src/domain/bookings/adapters/webCryptoEntryPassVerifier.ts — ARQUIVO NOVO, conteúdo completo ===
/** Chaves públicas do QR da entrada guardadas no aparelho para conferir sem internet (D20). */
const KEY_PREFIX = 'useguide.entryKeys.';

interface EntryPassContent {
  kid: string;
  bid: string;
  sid: string;
  oid: string;
  n: number;
  exp: number;
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function saveEntryKeys(
  offerId: string,
  keys: Array<{ kid: string; publicKeyJwk: JsonWebKey }>
) {
  try {
    localStorage.setItem(`${KEY_PREFIX}${offerId}`, JSON.stringify(keys));
  } catch {
    // Sem armazenamento, a conferência sem internet não fica disponível; online continua valendo.
  }
}

function loadEntryKeys(offerId: string): Array<{ kid: string; publicKeyJwk: JsonWebKey }> {
  try {
    const raw = localStorage.getItem(`${KEY_PREFIX}${offerId}`);
    return raw ? (JSON.parse(raw) as Array<{ kid: string; publicKeyJwk: JsonWebKey }>) : [];
  } catch {
    return [];
  }
}

/**
 * Confere a assinatura Ed25519 do QR no próprio aparelho, para a portaria sem sinal. Navegador sem
 * Ed25519 no WebCrypto devolve `unsupported`, e a entrada fica para o servidor conferir depois.
 * Referência: https://developer.mozilla.org/docs/Web/API/SubtleCrypto/verify#ed25519
 */
export async function verifyEntryPassOffline(
  offerId: string,
  slotId: string,
  token: string
): Promise<'valid' | 'invalid' | 'unsupported'> {
  const [prefix, body, signature, extra] = token.trim().split('.');
  if (prefix !== 'UGE1' || !body || !signature || extra !== undefined) return 'invalid';
  let content: EntryPassContent;
  try {
    content = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body))) as EntryPassContent;
  } catch {
    return 'invalid';
  }
  if (content.sid !== slotId || content.oid !== offerId) return 'invalid';
  if (content.exp * 1000 < Date.now()) return 'invalid';
  const key = loadEntryKeys(offerId).find((candidate) => candidate.kid === content.kid);
  if (!key || !globalThis.crypto?.subtle) return 'unsupported';
  try {
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      key.publicKeyJwk,
      { name: 'Ed25519' },
      false,
      ['verify']
    );
    const valid = await crypto.subtle.verify(
      { name: 'Ed25519' },
      publicKey,
      base64UrlToBytes(signature),
      new TextEncoder().encode(body)
    );
    return valid ? 'valid' : 'invalid';
  } catch {
    return 'unsupported';
  }
}

=== src/domain/bookings/application/usecases/answerProviderAbsenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { BookingSummary } from '../../types/bookings';

export async function answerProviderAbsenceUseCase(
  offerId: string,
  bookingId: string,
  answer: 'was_there' | 'admitted'
): Promise<BookingSummary> {
  return bookingsApi.answerProviderAbsence(offerId, bookingId, answer);
}

=== src/domain/bookings/application/usecases/answerServiceConfirmationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { BookingSummary } from '../../types/bookings';

export async function answerServiceConfirmationUseCase(
  bookingId: string,
  answer: 'yes' | 'no'
): Promise<BookingSummary> {
  return bookingsApi.answerServiceConfirmation(bookingId, answer);
}

=== src/domain/bookings/application/usecases/checkInByCodeUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { BookingSummary, CodeCheckInPayload } from '../../types/bookings';

export async function checkInByCodeUseCase(
  offerId: string,
  slotId: string,
  payload: CodeCheckInPayload
): Promise<BookingSummary> {
  return bookingsApi.checkInByCode(offerId, slotId, payload);
}

=== src/domain/bookings/application/usecases/checkInEntryUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { BookingSummary, EntryCheckInPayload } from '../../types/bookings';

export async function checkInEntryUseCase(
  offerId: string,
  slotId: string,
  payload: EntryCheckInPayload
): Promise<BookingSummary> {
  return bookingsApi.checkInEntry(offerId, slotId, payload);
}

=== src/domain/bookings/application/usecases/checkInWithoutCodeUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { BookingSummary, NoCodeReason } from '../../types/bookings';

export async function checkInWithoutCodeUseCase(
  offerId: string,
  bookingId: string,
  payload: { participantsPresent: number; reason: NoCodeReason }
): Promise<BookingSummary> {
  return bookingsApi.checkInWithoutCode(offerId, bookingId, payload);
}

=== src/domain/bookings/application/usecases/getCheckInCodeUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { CheckInCodeView } from '../../types/bookings';

export async function getCheckInCodeUseCase(bookingId: string): Promise<CheckInCodeView> {
  return bookingsApi.getCheckInCode(bookingId);
}

=== src/domain/bookings/application/usecases/getEntryPassUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { EntryPassView } from '../../types/bookings';

export async function getEntryPassUseCase(bookingId: string): Promise<EntryPassView> {
  return bookingsApi.getEntryPass(bookingId);
}

=== src/domain/bookings/application/usecases/getEntryVerificationKeysUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';

export async function getEntryVerificationKeysUseCase(
  offerId: string
): Promise<Array<{ kid: string; publicKeyJwk: JsonWebKey }>> {
  return bookingsApi.getEntryVerificationKeys(offerId);
}

=== src/domain/bookings/application/usecases/recordArrivalUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { ArrivalLocation, BookingSummary } from '../../types/bookings';

export async function recordArrivalUseCase(
  offerId: string,
  bookingId: string,
  location?: ArrivalLocation
): Promise<BookingSummary> {
  return bookingsApi.recordArrival(offerId, bookingId, location);
}

=== src/domain/bookings/application/usecases/reportProviderAbsentUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';
import type { BookingSummary } from '../../types/bookings';

export async function reportProviderAbsentUseCase(bookingId: string): Promise<BookingSummary> {
  return bookingsApi.reportProviderAbsent(bookingId);
}

=== src/domain/bookings/components/admin/ServiceEvidenceList.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';

/** O que a fila de reclamações recebe nas reservas (D20); vem pronto do backend, por allowlist. */
export interface BookingServiceEvidence {
  startsAt: string;
  pickupAddress: string | null;
  checkIn: {
    at: string;
    method: 'code' | 'qr' | 'no_code';
    participantsPresent: number;
    participantsCount: number;
    noCodeReason: 'no_phone' | 'refused' | 'other' | null;
  } | null;
  arrival: { at: string; location: { lat: number; lng: number; accuracyM?: number } | null } | null;
  providerAbsence: {
    reportedAt: string;
    answer: 'was_there' | 'admitted' | null;
    answeredAt: string | null;
  } | null;
  serviceConfirmation: { reason: string; answer: 'yes' | 'no' | null } | null;
  noShow: boolean;
}

export function isBookingServiceEvidence(value: unknown): value is BookingServiceEvidence {
  const candidate = value as Partial<BookingServiceEvidence> | null;
  return (
    !!candidate && typeof candidate.startsAt === 'string' && typeof candidate.noShow === 'boolean'
  );
}

/** Provas do serviço para o admin decidir a reclamação: check-in, "Cheguei", relato e resposta. */
export function ServiceEvidenceList({ evidence }: { evidence: BookingServiceEvidence }) {
  const { t, i18n } = useTranslation();
  const date = (iso: string) => formatBusinessDateTime(iso, i18n.language);
  const lines: string[] = [];
  const { checkIn, arrival, providerAbsence, serviceConfirmation } = evidence;

  lines.push(
    checkIn
      ? t('serviceProof.evidence.checkIn', {
          date: date(checkIn.at),
          method: t(`serviceProof.evidence.methods.${checkIn.method}`),
          present: checkIn.participantsPresent,
          total: checkIn.participantsCount,
        })
      : t('serviceProof.evidence.noCheckIn')
  );
  if (checkIn?.noCodeReason) {
    lines.push(
      t('serviceProof.evidence.noCodeReason', {
        reason: t(`serviceProof.partner.reasons.${checkIn.noCodeReason}`),
      })
    );
  }
  lines.push(
    arrival
      ? t('serviceProof.evidence.arrival', { date: date(arrival.at) })
      : t('serviceProof.evidence.noArrival')
  );
  if (providerAbsence) {
    lines.push(
      t('serviceProof.evidence.absence', {
        date: date(providerAbsence.reportedAt),
        answer: t(`serviceProof.evidence.answers.${providerAbsence.answer ?? 'none'}`),
      })
    );
  }
  if (serviceConfirmation) {
    lines.push(
      t('serviceProof.evidence.confirmation', {
        answer: t(
          `serviceProof.evidence.confirmationAnswers.${serviceConfirmation.answer ?? 'none'}`
        ),
      })
    );
  }
  if (evidence.noShow) lines.push(t('serviceProof.evidence.noShow'));
  if (evidence.pickupAddress) {
    lines.push(t('serviceProof.evidence.pickup', { address: evidence.pickupAddress }));
  }

  const location = arrival?.location;
  return (
    <div className="p-4 rounded-2xl bg-ink/[0.04] space-y-1.5">
      <p className="text-[13px] font-semibold text-ink">{t('serviceProof.evidence.title')}</p>
      <ul className="space-y-1">
        {lines.map((line) => (
          <li key={line} className="text-[13px] text-ink/80 break-words">
            {line}
          </li>
        ))}
      </ul>
      {location && (
        <a
          href={`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=17/${location.lat}/${location.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center text-[13px] font-semibold text-accent focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded-xl"
        >
          {t('serviceProof.evidence.map')}
        </a>
      )}
    </div>
  );
}

=== src/domain/bookings/components/buyer/BookingCheckInPass.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { TextButton } from '../../../../ui/components/TextButton';
import { useBookingCheckInPass } from '../../hooks/useBookingCheckInPass';
import type { BookingSummary } from '../../types/bookings';
import { checkInPrefix } from '../../utils/checkInPrefix';
import { EntryQrImage } from './EntryQrImage';

/**
 * Código de check-in ou entrada da reserva (D20). O código só existe no dia do serviço e é dito
 * pessoalmente; o aviso contra golpe fica sempre junto.
 */
export function BookingCheckInPass({ booking }: { booking: BookingSummary }) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, reload } = useBookingCheckInPass(booking, true);
  const entry = booking.kind === 'private_entry';
  const prefix = checkInPrefix(booking.kind);

  if (loading && !data) {
    return (
      <div className="h-16 rounded-2xl bg-ink/[0.04] animate-pulse motion-reduce:animate-none" />
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-between gap-2 text-[13px] text-ink/70">
        <span>{t('serviceProof.pass.loadError')}</span>
        <TextButton tone="accent" onClick={() => void reload()}>
          {t('serviceProof.pass.retry')}
        </TextButton>
      </div>
    );
  }
  if (!data) return null;
  if (data.checkedInAt) {
    return (
      <p className="text-[13px] text-success">
        {t('serviceProof.pass.checkedIn', {
          date: formatBusinessDateTime(data.checkedInAt, i18n.language),
        })}
      </p>
    );
  }
  if (!data.code) {
    return (
      <p className="text-[13px] text-ink/70">
        {t('serviceProof.pass.notYet', {
          date: formatBusinessDateTime(data.visibleFrom, i18n.language),
        })}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-semibold text-ink/80">
        {t(entry ? 'serviceProof.pass.entryTitle' : 'serviceProof.pass.codeTitle')}
      </p>
      {entry && data.qrToken && (
        <EntryQrImage value={data.qrToken} alt={t('serviceProof.pass.qrAlt')} />
      )}
      <p
        className="text-center font-display text-[28px] font-bold tracking-[0.14em] tabular-nums text-ink select-all break-all"
        aria-label={t('serviceProof.pass.copyLabel', { code: data.code.split('').join(' ') })}
      >
        {prefix}:{data.code}
      </p>
      <p className="text-[13px] text-ink/70 text-center">
        {t(entry ? 'serviceProof.pass.entryHint' : 'serviceProof.pass.codeHint')}
      </p>
      <p className="flex items-start gap-2 text-[13px] text-warn">
        <ShieldAlert size={16} className="shrink-0 mt-px" aria-hidden="true" />
        {t('serviceProof.pass.warning')}
      </p>
    </div>
  );
}

=== src/domain/bookings/components/buyer/BookingFlow.tsx — diff ===
@@ -1,10 +1,10 @@
 import { ChevronLeft } from 'lucide-react';
-import { useMemo, useState } from 'react';
+import { useId, useMemo, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { BUYER_TERMS_VERSION } from '../../../../shared/constants/legalTerms';
 import { TermsAcceptanceField } from '../../../../ui/legal/TermsAcceptanceField';
 import type { PublicOffer, PublicSlot } from '../../types/bookings';
-import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
+import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT } from '../../../../ui/styles/controls';
 import { BookingCheckout } from './BookingCheckout';
 import { ParticipantsForm } from './ParticipantsForm';
 import { QuantitySelector } from './QuantitySelector';
@@ -29,11 +29,15 @@ export function BookingFlow({
   renderPaymentElement,
 }: BookingFlowProps) {
   const { t } = useTranslation();
+  const pickupId = useId();
   const [step, setStep] = useState<Step>('select');
   const [slot, setSlot] = useState<PublicSlot | null>(null);
   const [quantities, setQuantities] = useState<Record<string, number>>({});
   const [names, setNames] = useState<string[]>([]);
   const [termsAccepted, setTermsAccepted] = useState(false);
+  const [pickupAddress, setPickupAddress] = useState('');
+  const needsPickup = offer.pickupMode === 'buyer_address';
+  const pickupReady = !needsPickup || pickupAddress.trim().length >= 3;
   const participants = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
   const maxParticipants = Math.min(offer.maxParticipantsPerBooking, slot?.available ?? 0);
 
@@ -45,9 +49,10 @@ export function BookingFlow({
         .filter(([, quantity]) => quantity > 0)
         .map(([priceOptionId, quantity]) => ({ priceOptionId, quantity })),
       participants: names.map((name) => ({ name })),
+      ...(needsPickup ? { pickupAddress: pickupAddress.trim() } : {}),
       acceptedTermsVersion: BUYER_TERMS_VERSION,
     }),
-    [offer.id, slot?.id, quantities, names]
+    [offer.id, slot?.id, quantities, names, needsPickup, pickupAddress]
   );
 
   const proceed = () => {
@@ -112,6 +117,26 @@ export function BookingFlow({
           onChange={setQuantities}
         />
       )}
+      {slot && participants > 0 && needsPickup && (
+        <div className="space-y-1.5">
+          <label htmlFor={pickupId} className="text-[13px] font-semibold text-ink/80">
+            {t('serviceProof.checkout.pickupLabel')}
+          </label>
+          <input
+            id={pickupId}
+            value={pickupAddress}
+            onChange={(event) => setPickupAddress(event.target.value)}
+            maxLength={300}
+            autoComplete="street-address"
+            placeholder={t('serviceProof.checkout.pickupPlaceholder')}
+            aria-describedby={`${pickupId}-hint`}
+            className={INPUT}
+          />
+          <p id={`${pickupId}-hint`} className="text-[12px] text-ink/60">
+            {t('serviceProof.checkout.pickupHint')}
+          </p>
+        </div>
+      )}
       {slot && participants > 0 && !isAuthenticated && (
         <p className="text-xs text-white/70">{t('bookings.buyer.loginRequired')}</p>
       )}
@@ -125,7 +150,7 @@ export function BookingFlow({
       {slot && (
         <button
           type="button"
-          disabled={participants === 0 || !termsAccepted}
+          disabled={participants === 0 || !termsAccepted || !pickupReady}
           onClick={proceed}
           className={`${BUTTON_PRIMARY} w-full`}
         >

=== src/domain/bookings/components/buyer/BookingPurchaseDetails.test.tsx — diff ===
@@ -29,6 +29,11 @@ function booking(overrides: Partial<BookingSummary> = {}): BookingSummary {
     },
     cancellation: null,
     rescheduledAt: null,
+    pickupAddress: null,
+    checkIn: null,
+    arrivedAt: null,
+    providerAbsence: null,
+    serviceConfirmation: null,
     createdAt: '2026-10-01T12:00:00.000Z',
     ...overrides,
   };

=== src/domain/bookings/components/buyer/BookingPurchaseDetails.tsx — diff ===
@@ -13,6 +13,7 @@ import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
 import { formatSlotDateTime } from '../../utils/dates';
 import { formatMinor } from '../../utils/money';
 import { previewRefund } from '../../utils/refundPreview';
+import { BookingServiceActions, hasServiceActions } from './BookingServiceActions';
 
 /** Venda que o comprador pode reclamar; o formato é o de `ClaimableSale` do payment. */
 export interface BookingClaimSale {
@@ -147,6 +148,11 @@ export function BookingPurchaseDetails({
             {t('purchases.receipt.cancelEndedBooking')}
           </p>
         );
+    } else if (!upcoming && hasServiceActions(booking, now)) {
+      // O relato de ausência e a pergunta já abrem a reclamação: não oferecer as duas coisas (D20).
+      footer = (
+        <BookingServiceActions booking={booking} onNotice={onNotice} onChanged={source.reload} />
+      );
     } else if (!upcoming) {
       const sale = renderClaimAction ? claimSaleOf(booking) : null;
       footer = sale ? renderClaimAction?.(sale) : null;

=== src/domain/bookings/components/buyer/BookingServiceActions.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { answerServiceConfirmationUseCase } from '../../application/usecases/answerServiceConfirmationUseCase';
import { reportProviderAbsentUseCase } from '../../application/usecases/reportProviderAbsentUseCase';
import type { BookingSummary } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { canReportProviderAbsent, isConfirmationPending } from '../../utils/serviceProofTiming';

/** Verdadeiro quando a folha da compra mostra uma ação ou um status da prova do serviço (D20). */
export function hasServiceActions(booking: BookingSummary, now: Date): boolean {
  return (
    canReportProviderAbsent(booking, now) ||
    isConfirmationPending(booking, now) ||
    !!booking.providerAbsence
  );
}

/** "O prestador não veio" e "O serviço aconteceu?" na folha da compra (D20). */
export function BookingServiceActions({
  booking,
  onNotice,
  onChanged,
}: {
  booking: BookingSummary;
  onNotice: (message: string) => void;
  onChanged: () => Promise<void> | void;
}) {
  const { t, i18n } = useTranslation();
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [sending, setSending] = useState(false);
  const now = new Date();
  const date = (iso: string) => formatBusinessDateTime(iso, i18n.language);

  const run = async (action: () => Promise<unknown>, success: string) => {
    setSending(true);
    try {
      await action();
      onNotice(success);
      await onChanged();
    } catch (err: unknown) {
      onNotice(getBookingErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const askAbsent = () =>
    setConfirm({
      title: t('serviceProof.buyer.providerAbsentTitle'),
      message: t('serviceProof.buyer.providerAbsentMessage'),
      confirmLabel: t('serviceProof.buyer.providerAbsentConfirm'),
      cancelLabel: t('serviceProof.buyer.keep'),
      tone: 'danger',
      onCancel: () => setConfirm(null),
      onConfirm: () => {
        setConfirm(null);
        void run(
          () => reportProviderAbsentUseCase(booking.id),
          t('serviceProof.buyer.absenceSent', {
            date: date(new Date(Date.now() + 2 * 3_600_000).toISOString()),
          })
        );
      },
    });

  const askNo = () => {
    // Sem registro do serviço o reembolso é na hora; depois do "Cliente sem código", vai ao admin.
    const refundNow = !booking.checkIn;
    setConfirm({
      title: t('serviceProof.buyer.noTitle'),
      message: t(
        refundNow ? 'serviceProof.buyer.noMessageRefund' : 'serviceProof.buyer.noMessageReview'
      ),
      confirmLabel: t('serviceProof.buyer.noConfirm'),
      cancelLabel: t('serviceProof.buyer.keep'),
      tone: 'danger',
      onCancel: () => setConfirm(null),
      onConfirm: () => {
        setConfirm(null);
        void run(
          () => answerServiceConfirmationUseCase(booking.id, 'no'),
          t(refundNow ? 'serviceProof.buyer.refunded' : 'serviceProof.buyer.denied')
        );
      },
    });
  };

  let content = null;
  const absence = booking.providerAbsence;
  if (isConfirmationPending(booking, now) && booking.serviceConfirmation) {
    content = (
      <div className="p-4 rounded-2xl bg-ink/[0.04] space-y-3">
        <div className="space-y-1">
          <p className="text-[15px] font-semibold text-ink">
            {t('serviceProof.buyer.questionTitle')}
          </p>
          <p className="text-[13px] text-ink/70">
            {t('serviceProof.buyer.questionMessage', {
              date: date(booking.serviceConfirmation.answerBy),
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            disabled={sending}
            onClick={() =>
              void run(
                () => answerServiceConfirmationUseCase(booking.id, 'yes'),
                t('serviceProof.buyer.confirmed')
              )
            }
            className={BUTTON_SECONDARY}
          >
            {t('serviceProof.buyer.yes')}
          </button>
          <TextButton tone="danger" disabled={sending} onClick={askNo}>
            {t('serviceProof.buyer.no')}
          </TextButton>
        </div>
      </div>
    );
  } else if (absence) {
    const key =
      absence.resolution === 'refunded'
        ? 'absenceRefunded'
        : absence.resolution === 'withdrawn'
          ? 'absenceWithdrawn'
          : absence.resolution === 'admin'
            ? 'absenceAdmin'
            : 'absenceSent';
    content = (
      <StatusText tone={absence.resolution === 'refunded' ? 'success' : 'warn'}>
        {t(`serviceProof.buyer.${key}`, { date: date(absence.respondBy) })}
      </StatusText>
    );
  } else if (canReportProviderAbsent(booking, now)) {
    content = (
      <div className="flex justify-center">
        <TextButton tone="danger" disabled={sending} onClick={askAbsent}>
          {t('serviceProof.buyer.providerAbsent')}
        </TextButton>
      </div>
    );
  }

  return (
    <>
      {content}
      <ConfirmDialog data={confirm} />
    </>
  );
}

=== src/domain/bookings/components/buyer/BuyerBookingCard.tsx — diff ===
@@ -4,7 +4,8 @@ import { useTranslation } from 'react-i18next';
 import { rescheduleRefundDeadline } from '../../../../shared/utils/rescheduleRefundDeadline';
 import { StatusText, type StatusTone } from '../../../../ui/components/StatusText';
 import type { BookingStatus, BookingSummary } from '../../types/bookings';
-import { formatSlotDateTime } from '../../utils/dates';
+import { BookingCheckInPass } from './BookingCheckInPass';
+import { formatSlotDateTime, fortalezaDateKey } from '../../utils/dates';
 import { formatMinor } from '../../utils/money';
 import { formatBusinessWeekday } from '../../../../shared/utils/businessDateTime';
 
@@ -83,6 +84,16 @@ export function BuyerBookingCard({
           })}
         </p>
       )}
+      {/* Código ou entrada da reserva paga, até o check-in, também durante o serviço (D20). */}
+      {booking.status === 'confirmed' &&
+        !booking.checkIn &&
+        (upcoming ||
+          fortalezaDateKey(booking.offer.startsAt) ===
+            fortalezaDateKey(new Date().toISOString())) && (
+          <div className="mt-3 pt-3 border-t border-line">
+            <BookingCheckInPass booking={booking} />
+          </div>
+        )}
       {footer && <div className="mt-3 pt-3 border-t border-line">{footer}</div>}
     </li>
   );

=== src/domain/bookings/components/buyer/EntryQrImage.tsx — ARQUIVO NOVO, conteúdo completo ===
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

/** Único lugar do domínio que usa a biblioteca `qrcode` (AGENTS.md §3.2). */
export function EntryQrImage({ value, alt }: { value: string; alt: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    // Correção média (M): o QR assinado é longo e precisa continuar legível com o brilho baixo.
    void QRCode.toDataURL(value, { errorCorrectionLevel: 'M', margin: 1, width: 480 })
      .then((url) => active && setSrc(url))
      .catch(() => active && setSrc(null));
    return () => {
      active = false;
    };
  }, [value]);

  return (
    <div className="mx-auto w-full max-w-[240px] aspect-square rounded-2xl bg-white p-3">
      {src && <img src={src} alt={alt} width={240} height={240} className="w-full h-full" />}
    </div>
  );
}

=== src/domain/bookings/components/partner/BookingServiceControls.tsx — ARQUIVO NOVO, conteúdo completo ===
import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import type { BookingSummary, NoCodeReason } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { usesCheckInCode } from '../../utils/checkInPrefix';
import { formatSlotTime } from '../../utils/dates';
import { noShowAvailableAt } from '../../utils/serviceProofTiming';
import { NoCodeCheckInDialog } from './NoCodeCheckInDialog';

export interface ServiceControlActions {
  recordArrival: (bookingId: string) => Promise<boolean>;
  markNoShow: (bookingId: string) => Promise<void>;
  checkInWithoutCode: (bookingId: string, present: number, reason: NoCodeReason) => Promise<void>;
  answerAbsence: (bookingId: string, answer: 'was_there' | 'admitted') => Promise<void>;
}

/** O que o prestador faz numa reserva no dia do serviço (D20): Cheguei, ausência, sem código. */
export function BookingServiceControls({
  booking,
  actions,
  onNotice,
}: {
  booking: BookingSummary;
  actions: ServiceControlActions;
  onNotice: (message: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [noCode, setNoCode] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const time = (iso: string) => formatSlotTime(iso, i18n.language);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
    } catch (err: unknown) {
      onNotice(getBookingErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (booking.checkIn) {
    return (
      <StatusText tone={booking.checkIn.method === 'no_code' ? 'warn' : 'success'}>
        {booking.checkIn.method === 'no_code'
          ? t('serviceProof.partner.checkedInNoCode', { time: time(booking.checkIn.at) })
          : t('serviceProof.partner.checkedIn', {
              time: time(booking.checkIn.at),
              count: booking.checkIn.participantsPresent,
            })}
      </StatusText>
    );
  }
  if (booking.status !== 'confirmed' || !usesCheckInCode(booking.kind)) return null;

  const absence = booking.providerAbsence;
  if (absence && !absence.resolution) {
    return (
      <div className="space-y-3 p-3 rounded-2xl bg-warn-soft">
        <p className="text-sm font-semibold text-warn">{t('serviceProof.partner.absenceTitle')}</p>
        <p className="text-[13px] text-ink/80">
          {t('serviceProof.partner.absenceMessage', {
            date: formatBusinessDateTime(absence.respondBy, i18n.language),
          })}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => actions.answerAbsence(booking.id, 'was_there'))}
            className={BUTTON_SECONDARY}
          >
            {t('serviceProof.partner.wasThere')}
          </button>
          <TextButton
            tone="danger"
            disabled={busy}
            onClick={() =>
              setConfirm({
                title: t('serviceProof.partner.admittedTitle'),
                message: t('serviceProof.partner.admittedMessage'),
                confirmLabel: t('serviceProof.partner.admittedConfirm'),
                tone: 'danger',
                onCancel: () => setConfirm(null),
                onConfirm: () => {
                  setConfirm(null);
                  void run(() => actions.answerAbsence(booking.id, 'admitted'));
                },
              })
            }
          >
            {t('serviceProof.partner.admitted')}
          </TextButton>
        </div>
        <ConfirmDialog data={confirm} />
      </div>
    );
  }

  const noShowAt = noShowAvailableAt(booking);
  const canNoShow = noShowAt !== null && noShowAt.getTime() <= Date.now();
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {booking.arrivedAt ? (
          <StatusText tone="info">
            {t('serviceProof.partner.arrivedAt', { time: time(booking.arrivedAt) })}
          </StatusText>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void run(async () => {
                const withLocation = await actions.recordArrival(booking.id);
                if (!withLocation) onNotice(t('serviceProof.partner.locationDenied'));
              })
            }
            className={`${BUTTON_SECONDARY} inline-flex items-center gap-1.5`}
          >
            <MapPin size={16} aria-hidden="true" />
            {t('serviceProof.partner.arrived')}
          </button>
        )}
        {canNoShow ? (
          <TextButton
            tone="danger"
            disabled={busy}
            onClick={() => void run(() => actions.markNoShow(booking.id))}
          >
            {t('serviceProof.partner.noShow')}
          </TextButton>
        ) : (
          noShowAt && (
            <span className="text-[13px] text-ink/60">
              {t('serviceProof.partner.noShowAt', { time: time(noShowAt.toISOString()) })}
            </span>
          )
        )}
        <TextButton tone="ink" disabled={busy} onClick={() => setNoCode(true)}>
          {t('serviceProof.partner.noCode')}
        </TextButton>
      </div>
      {noCode && (
        <NoCodeCheckInDialog
          booking={booking}
          onClose={() => setNoCode(false)}
          onConfirm={async (present, reason) => {
            await run(() => actions.checkInWithoutCode(booking.id, present, reason));
            setNoCode(false);
          }}
        />
      )}
    </div>
  );
}

=== src/domain/bookings/components/partner/NoCodeCheckInDialog.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { RadioCardGroup } from '../../../../ui/components/RadioCardGroup';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import type { BookingSummary, NoCodeReason } from '../../types/bookings';

const REASONS: NoCodeReason[] = ['no_phone', 'refused', 'other'];

/** "Cliente sem código": por conta e risco do prestador, até o comprador confirmar (D20). */
export function NoCodeCheckInDialog({
  booking,
  onClose,
  onConfirm,
}: {
  booking: BookingSummary;
  onClose: () => void;
  onConfirm: (participantsPresent: number, reason: NoCodeReason) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<NoCodeReason>('no_phone');
  const [sending, setSending] = useState(false);

  const confirm = async () => {
    setSending(true);
    try {
      await onConfirm(booking.participantsCount, reason);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t('serviceProof.partner.noCode')}
      description={t('serviceProof.partner.noCodeMessage')}
    >
      <div className="space-y-5">
        <RadioCardGroup
          name="no-code-reason"
          legend={t('serviceProof.partner.noCodeReason')}
          options={REASONS.map((value) => ({
            value,
            title: t(`serviceProof.partner.reasons.${value}`),
          }))}
          value={reason}
          onChange={setReason}
        />
        <button
          type="button"
          onClick={() => void confirm()}
          disabled={sending}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {t('serviceProof.partner.noCodeConfirm')}
        </button>
      </div>
    </Dialog>
  );
}

=== src/domain/bookings/components/partner/PartnerBookingsList.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { useOfferBookings } from '../../hooks/useOfferBookings';
import { formatSlotDateTime, fortalezaDateKey } from '../../utils/dates';
import { formatMinor } from '../../utils/money';
import { BookingServiceControls } from './BookingServiceControls';

/** Reservas da oferta; no dia do serviço, cada uma mostra as ações do prestador (D20). */
export function PartnerBookingsList({ offerId }: { offerId: string }) {
  const { t, i18n } = useTranslation();
  const bookings = useOfferBookings(offerId);
  const { data, loading, error, hasMore, reload, loadMore } = bookings;
  const [notice, setNotice] = useState<string | null>(null);
  const today = fortalezaDateKey(new Date().toISOString());

  return (
    <section className="space-y-3" aria-label={t('bookings.bookingsList.title')}>
      {notice && (
        <p role="status" className="text-[13px] text-accent">
          {notice}
        </p>
      )}
      {error && <ListError message={error} onRetry={() => void reload()} />}
      {!error && !loading && data.length === 0 && (
        <ListEmpty message={t('bookings.bookingsList.empty')} />
      )}
      <ul className="space-y-2">
        {data.map((booking) => {
          const serviceDay = fortalezaDateKey(booking.offer.startsAt) === today;
          return (
            <li
              key={booking.id}
              className="p-4 rounded-[20px] bg-surface border border-line space-y-3"
            >
              <div>
                <p className="text-[15px] font-semibold text-ink">
                  {formatSlotDateTime(booking.offer.startsAt, i18n.language)}
                </p>
                <p className="text-[13px] text-ink/70">
                  {t('bookings.bookingsList.participants', { count: booking.participantsCount })} ·{' '}
                  {formatMinor(booking.totalMinor, i18n.language)} ·{' '}
                  {t(`bookings.bookingStatus.${booking.status}`)}
                </p>
              </div>
              {booking.pickupAddress && (
                <p className="flex items-start gap-1.5 text-[13px] text-ink/80">
                  <MapPin size={15} className="shrink-0 mt-px" aria-hidden="true" />
                  {t('serviceProof.partner.pickupAt', { address: booking.pickupAddress })}
                </p>
              )}
              {(serviceDay || booking.checkIn) && (
                <BookingServiceControls booking={booking} actions={bookings} onNotice={setNotice} />
              )}
            </li>
          );
        })}
      </ul>
      {loading && <ListLoading label={t('bookings.partner.loading')} />}
      {!loading && hasMore && (
        <button type="button" onClick={() => void loadMore()} className={BUTTON_SECONDARY}>
          {t('bookings.bookingsList.loadMore')}
        </button>
      )}
    </section>
  );
}

=== src/domain/bookings/components/partner/PartnerOfferEditor.tsx — diff ===
@@ -82,6 +82,24 @@ export function PartnerOfferEditor({
         <span className="text-xs text-white/70">{t('bookings.editor.meetingPointLabel')}</span>
         <input {...register('meetingPoint')} className={INPUT} />
       </label>
+      {defaultValues.kind === 'tour' && (
+        <Controller
+          control={control}
+          name="pickupMode"
+          render={({ field }) => (
+            <RadioCardGroup
+              name={field.name}
+              legend={t('serviceProof.offerEditor.pickupLegend')}
+              options={[
+                { value: 'meeting_point', title: t('serviceProof.offerEditor.meetingPoint') },
+                { value: 'buyer_address', title: t('serviceProof.offerEditor.buyerAddress') },
+              ]}
+              value={field.value}
+              onChange={field.onChange}
+            />
+          )}
+        />
+      )}
       <Controller
         control={control}
         name="cancellationPolicy"

=== src/domain/bookings/components/partner/PartnerOffersManager.tsx — diff ===
@@ -119,7 +119,7 @@ export function PartnerOffersManager({
             <p className="text-sm font-bold text-white">{view.offer.title['pt-BR']}</p>
           </div>
           {view.type === 'slots' ? (
-            <PartnerSlotsManager offerId={view.offer.id} />
+            <PartnerSlotsManager offerId={view.offer.id} kind={view.offer.kind} />
           ) : (
             <PartnerBookingsList offerId={view.offer.id} />
           )}

=== src/domain/bookings/components/partner/PartnerSlotsManager.tsx — diff ===
@@ -2,7 +2,7 @@ import { ChevronLeft, ChevronRight } from 'lucide-react';
 import { useMemo, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { usePartnerSlots } from '../../hooks/usePartnerSlots';
-import type { CreateSlotsPayload, PartnerSlot } from '../../types/bookings';
+import type { CreateSlotsPayload, OfferKind, PartnerSlot } from '../../types/bookings';
 import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
 import {
   addDays,
@@ -14,6 +14,7 @@ import {
 import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
 import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
 import { SlotCancelDialog } from './SlotCancelDialog';
+import { SlotCheckInSheet } from './SlotCheckInSheet';
 import { SlotCreationForm } from './SlotCreationForm';
 import { SlotRescheduleDialog } from './SlotRescheduleDialog';
 
@@ -26,7 +27,13 @@ function groupByDay(slots: PartnerSlot[]): Array<[string, PartnerSlot[]]> {
   return [...groups.entries()];
 }
 
-export function PartnerSlotsManager({ offerId }: { offerId: string }) {
+export function PartnerSlotsManager({
+  offerId,
+  kind = 'tour',
+}: {
+  offerId: string;
+  kind?: OfferKind;
+}) {
   const { t, i18n } = useTranslation();
   const [weekStart, setWeekStart] = useState(() => startOfFortalezaWeek(new Date()));
   const { data, loading, error, reload, create, cancel, reschedule } = usePartnerSlots(
@@ -35,6 +42,8 @@ export function PartnerSlotsManager({ offerId }: { offerId: string }) {
   );
   const [canceling, setCanceling] = useState<PartnerSlot | null>(null);
   const [rescheduling, setRescheduling] = useState<PartnerSlot | null>(null);
+  const [checkingIn, setCheckingIn] = useState<PartnerSlot | null>(null);
+  const today = fortalezaDateKey(new Date().toISOString());
   const [notice, setNotice] = useState<string | null>(null);
   const days = useMemo(() => groupByDay(data), [data]);
 
@@ -138,6 +147,20 @@ export function PartnerSlotsManager({ offerId }: { offerId: string }) {
                     </div>
                     {slot.status === 'open' && (
                       <div className="flex flex-wrap gap-2">
+                        {/* Check-in só no dia do horário (D20). */}
+                        {fortalezaDateKey(slot.startsAt) === today && slot.capacitySold > 0 && (
+                          <button
+                            type="button"
+                            onClick={() => setCheckingIn(slot)}
+                            className={BUTTON_SECONDARY}
+                          >
+                            {t(
+                              kind === 'private_entry'
+                                ? 'serviceProof.partner.entry'
+                                : 'serviceProof.partner.checkIn'
+                            )}
+                          </button>
+                        )}
                         <button
                           type="button"
                           onClick={() => setRescheduling(slot)}
@@ -160,6 +183,14 @@ export function PartnerSlotsManager({ offerId }: { offerId: string }) {
             </ul>
           </div>
         ))}
+      {checkingIn && (
+        <SlotCheckInSheet
+          offerId={offerId}
+          kind={kind}
+          slot={checkingIn}
+          onClose={() => setCheckingIn(null)}
+        />
+      )}
       <SlotCreationForm onCreate={handleCreate} />
       <SlotCancelDialog
         slot={canceling}

=== src/domain/bookings/components/partner/SlotCheckInSheet.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Camera, Minus, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CodeBoxesInput } from '../../../../ui/components/CodeBoxesInput';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { useQrScanner } from '../../../../ui/hooks/useQrScanner';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { useSlotCheckIn } from '../../hooks/useSlotCheckIn';
import type { BookingSummary, OfferKind, PartnerSlot } from '../../types/bookings';
import { CHECK_IN_ALPHABET, checkInPrefix, codeLengthFor } from '../../utils/checkInPrefix';
import { formatSlotTime } from '../../utils/dates';

const STEP =
  'press w-11 h-11 rounded-xl bg-surface border border-line flex items-center justify-center text-ink disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-teal-400/50';

/** Check-in do horário pelo código do comprador, ou portaria da entrada pelo QR e código (D20). */
export function SlotCheckInSheet({
  offerId,
  kind,
  slot,
  onClose,
  onCheckedIn,
}: {
  offerId: string;
  kind: OfferKind;
  slot: PartnerSlot;
  onClose: () => void;
  onCheckedIn?: (booking: BookingSummary) => void;
}) {
  const { t, i18n } = useTranslation();
  const entry = kind === 'private_entry';
  const length = codeLengthFor(kind);
  const prefix = checkInPrefix(kind);
  const [code, setCode] = useState('');
  const [present, setPresent] = useState(1);
  const { submit, sending, result, pending } = useSlotCheckIn(offerId, slot.id, kind, onCheckedIn);

  const onQr = useCallback(
    (qrToken: string) => {
      void submit({ qrToken, participantsPresent: present });
    },
    [present, submit]
  );
  const scanner = useQrScanner(onQr);

  const confirm = async () => {
    if (await submit({ code, participantsPresent: present })) setCode('');
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`${t(entry ? 'serviceProof.partner.entrySheetTitle' : 'serviceProof.partner.sheetTitle')} · ${formatSlotTime(slot.startsAt, i18n.language)}`}
    >
      <div className="space-y-5">
        {entry && (
          <div className="space-y-2">
            {scanner.state === 'scanning' ? (
              <>
                <video
                  ref={scanner.videoRef}
                  muted
                  playsInline
                  className="w-full aspect-square rounded-2xl bg-ink/10 object-cover"
                />
                <p className="text-[13px] text-ink/70 text-center">
                  {t('serviceProof.partner.scanning')}
                </p>
                <button
                  type="button"
                  onClick={scanner.stop}
                  className={`${BUTTON_SECONDARY} w-full`}
                >
                  {t('serviceProof.partner.stopScan')}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void scanner.start()}
                disabled={sending}
                className={`${BUTTON_SECONDARY} w-full inline-flex items-center justify-center gap-2`}
              >
                <Camera size={16} aria-hidden="true" />
                {t('serviceProof.partner.scan')}
              </button>
            )}
            {(scanner.state === 'unsupported' || scanner.state === 'denied') && (
              <p className="text-[13px] text-warn">
                {t(
                  scanner.state === 'denied'
                    ? 'serviceProof.partner.cameraDenied'
                    : 'serviceProof.partner.scanUnsupported'
                )}
              </p>
            )}
          </div>
        )}

        <CodeBoxesInput
          prefix={prefix}
          length={length}
          alphabet={CHECK_IN_ALPHABET}
          value={code}
          onChange={setCode}
          label={t(
            entry ? 'serviceProof.partner.entryCodeLabel' : 'serviceProof.partner.codeLabel'
          )}
          boxLabel={(index) => t('serviceProof.partner.character', { n: index + 1, total: length })}
          disabled={sending}
        />

        <div className="space-y-2">
          <p className="text-[13px] font-semibold text-ink/80">
            {t('serviceProof.partner.participantsLabel')}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={STEP}
              onClick={() => setPresent((value) => Math.max(1, value - 1))}
              disabled={present <= 1}
              aria-label={t('bookings.buyer.decrease')}
            >
              <Minus size={16} aria-hidden="true" />
            </button>
            <span className="min-w-8 text-center text-lg font-bold text-ink" aria-live="polite">
              {present}
            </span>
            <button
              type="button"
              className={STEP}
              onClick={() => setPresent((value) => Math.min(50, value + 1))}
              aria-label={t('bookings.buyer.increase')}
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {result && (
          <p role="status">
            <StatusText tone={result.tone}>{result.message}</StatusText>
          </p>
        )}
        {pending > 0 && (
          <p className="text-[13px] text-warn">
            {t('serviceProof.partner.pending', { count: pending })}
          </p>
        )}

        <button
          type="button"
          onClick={() => void confirm()}
          disabled={sending || code.length !== length}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {t('serviceProof.partner.submit')}
        </button>
      </div>
    </Dialog>
  );
}

=== src/domain/bookings/hooks/useBookingCheckInPass.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { getCheckInCodeUseCase } from '../application/usecases/getCheckInCodeUseCase';
import { getEntryPassUseCase } from '../application/usecases/getEntryPassUseCase';
import type { BookingSummary, EntryPassView } from '../types/bookings';

/** Código de check-in (6) ou QR e código da entrada (8) da reserva confirmada (D20). */
export function useBookingCheckInPass(booking: BookingSummary, enabled: boolean) {
  const [data, setData] = useState<EntryPassView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setData(
        booking.kind === 'private_entry'
          ? await getEntryPassUseCase(booking.id)
          : { ...(await getCheckInCodeUseCase(booking.id)), qrToken: null }
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [booking.id, booking.kind]);

  useEffect(() => {
    if (enabled) void load();
  }, [enabled, load]);

  return { data, loading, error, reload: load };
}

=== src/domain/bookings/hooks/useOfferBookings.ts — diff ===
@@ -1,9 +1,29 @@
 import { useCallback, useEffect, useState } from 'react';
+import { answerProviderAbsenceUseCase } from '../application/usecases/answerProviderAbsenceUseCase';
+import { checkInWithoutCodeUseCase } from '../application/usecases/checkInWithoutCodeUseCase';
 import { listOfferBookingsUseCase } from '../application/usecases/listOfferBookingsUseCase';
 import { markNoShowUseCase } from '../application/usecases/markNoShowUseCase';
-import type { BookingSummary } from '../types/bookings';
+import { recordArrivalUseCase } from '../application/usecases/recordArrivalUseCase';
+import type { ArrivalLocation, BookingSummary, NoCodeReason } from '../types/bookings';
 import { getBookingErrorMessage } from '../utils/bookingErrorMessage';
 
+/** Localização só no toque do "Cheguei" (D20); recusada ou sem resposta em 8 s, segue sem ela. */
+function currentLocation(): Promise<ArrivalLocation | null> {
+  return new Promise((resolve) => {
+    if (!navigator.geolocation) return resolve(null);
+    navigator.geolocation.getCurrentPosition(
+      (position) =>
+        resolve({
+          lat: position.coords.latitude,
+          lng: position.coords.longitude,
+          accuracyM: Math.round(position.coords.accuracy),
+        }),
+      () => resolve(null),
+      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
+    );
+  });
+}
+
 export function useOfferBookings(offerId: string) {
   const [data, setData] = useState<BookingSummary[]>([]);
   const [nextCursor, setNextCursor] = useState<string | null>(null);
@@ -31,13 +51,39 @@ export function useOfferBookings(offerId: string) {
     void load(null);
   }, [load]);
 
-  const markNoShow = useCallback(async (bookingId: string) => {
-    const updated = await markNoShowUseCase(bookingId);
+  const replace = useCallback((updated: BookingSummary) => {
     setData((current) =>
-      current.map((item) => (item.id === bookingId ? { ...item, ...updated } : item))
+      current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
     );
   }, []);
 
+  const markNoShow = useCallback(
+    async (bookingId: string) => replace(await markNoShowUseCase(bookingId)),
+    [replace]
+  );
+
+  /** Devolve se a localização foi registrada, para avisar quando não foi. */
+  const recordArrival = useCallback(
+    async (bookingId: string): Promise<boolean> => {
+      const location = await currentLocation();
+      replace(await recordArrivalUseCase(offerId, bookingId, location ?? undefined));
+      return location !== null;
+    },
+    [offerId, replace]
+  );
+
+  const checkInWithoutCode = useCallback(
+    async (bookingId: string, participantsPresent: number, reason: NoCodeReason) =>
+      replace(await checkInWithoutCodeUseCase(offerId, bookingId, { participantsPresent, reason })),
+    [offerId, replace]
+  );
+
+  const answerAbsence = useCallback(
+    async (bookingId: string, answer: 'was_there' | 'admitted') =>
+      replace(await answerProviderAbsenceUseCase(offerId, bookingId, answer)),
+    [offerId, replace]
+  );
+
   return {
     data,
     loading,
@@ -45,6 +91,10 @@ export function useOfferBookings(offerId: string) {
     hasMore: nextCursor !== null,
     reload: () => load(null),
     loadMore: () => load(nextCursor),
+    replace,
     markNoShow,
+    recordArrival,
+    checkInWithoutCode,
+    answerAbsence,
   };
 }

=== src/domain/bookings/hooks/useSlotCheckIn.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { pendingCheckIns } from '../adapters/localPendingCheckInsAdapter';
import { saveEntryKeys, verifyEntryPassOffline } from '../adapters/webCryptoEntryPassVerifier';
import { checkInByCodeUseCase } from '../application/usecases/checkInByCodeUseCase';
import { checkInEntryUseCase } from '../application/usecases/checkInEntryUseCase';
import { getEntryVerificationKeysUseCase } from '../application/usecases/getEntryVerificationKeysUseCase';
import type { BookingSummary, OfferKind } from '../types/bookings';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

export interface CheckInResult {
  tone: 'success' | 'warn' | 'danger';
  message: string;
}

// `fetch` sem rede rejeita com TypeError; erro do servidor chega como Error com o código.
function isNetworkFailure(error: unknown): boolean {
  return !navigator.onLine || error instanceof TypeError;
}

/** Check-in de um horário pelo código ou pelo QR, com fila no aparelho quando falta sinal (D20). */
export function useSlotCheckIn(
  offerId: string,
  slotId: string,
  kind: OfferKind,
  onCheckedIn?: (booking: BookingSummary) => void
) {
  const { t } = useTranslation();
  const entry = kind === 'private_entry';
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [pending, setPending] = useState(() => pendingCheckIns.list(offerId).length);

  const send = useCallback(
    (payload: {
      code?: string;
      qrToken?: string;
      participantsPresent: number;
      capturedAt?: string;
    }) =>
      entry
        ? checkInEntryUseCase(offerId, slotId, payload)
        : checkInByCodeUseCase(offerId, slotId, {
            code: payload.code ?? '',
            participantsPresent: payload.participantsPresent,
            ...(payload.capturedAt ? { capturedAt: payload.capturedAt } : {}),
          }),
    [entry, offerId, slotId]
  );

  const sync = useCallback(async () => {
    for (const item of pendingCheckIns.list(offerId)) {
      try {
        const booking = await (item.kind === 'entry'
          ? checkInEntryUseCase(item.offerId, item.slotId, item.payload)
          : checkInByCodeUseCase(item.offerId, item.slotId, {
              ...item.payload,
              code: item.payload.code ?? '',
            }));
        pendingCheckIns.remove(item.id);
        onCheckedIn?.(booking);
      } catch (error: unknown) {
        if (isNetworkFailure(error)) break;
        // Recusado pelo servidor (código errado, fora do prazo): sai da fila e o prestador vê o motivo.
        pendingCheckIns.remove(item.id);
        setResult({ tone: 'danger', message: getBookingErrorMessage(error) });
      }
    }
    setPending(pendingCheckIns.list(offerId).length);
  }, [offerId, onCheckedIn]);

  useEffect(() => {
    if (entry && navigator.onLine) {
      void getEntryVerificationKeysUseCase(offerId)
        .then((keys) => saveEntryKeys(offerId, keys))
        .catch(() => undefined);
    }
    const onOnline = () => void sync();
    window.addEventListener('online', onOnline);
    if (navigator.onLine) void sync();
    return () => window.removeEventListener('online', onOnline);
  }, [entry, offerId, sync]);

  const submit = useCallback(
    async (input: { code?: string; qrToken?: string; participantsPresent: number }) => {
      setSending(true);
      setResult(null);
      try {
        const booking = await send(input);
        const count = booking.checkIn?.participantsPresent ?? input.participantsPresent;
        setResult({ tone: 'success', message: t('serviceProof.partner.success', { count }) });
        onCheckedIn?.(booking);
        return true;
      } catch (error: unknown) {
        if (!isNetworkFailure(error)) {
          setResult({ tone: 'danger', message: getBookingErrorMessage(error) });
          return false;
        }
        const offline = input.qrToken
          ? await verifyEntryPassOffline(offerId, slotId, input.qrToken)
          : 'unsupported';
        if (offline === 'invalid') {
          setResult({ tone: 'danger', message: t('serviceProof.partner.offlineInvalid') });
          return false;
        }
        pendingCheckIns.add({
          offerId,
          slotId,
          kind: entry ? 'entry' : 'code',
          payload: { ...input, capturedAt: new Date().toISOString() },
        });
        setPending(pendingCheckIns.list(offerId).length);
        setResult({
          tone: offline === 'valid' ? 'success' : 'warn',
          message: t(
            offline === 'valid'
              ? 'serviceProof.partner.offlineValid'
              : 'serviceProof.partner.savedOffline'
          ),
        });
        return true;
      } finally {
        setSending(false);
      }
    },
    [entry, offerId, onCheckedIn, send, slotId, t]
  );

  return { submit, sending, result, pending, clearResult: () => setResult(null) };
}

=== src/domain/bookings/index.ts — diff ===
@@ -10,5 +10,9 @@ export { useBookingPurchases } from './hooks/useBookingPurchases';
 export { useMyBookings } from './hooks/useMyBookings';
 export type { PaymentElementSlotProps, RenderPaymentElement } from './components/buyer/types';
 export { PartnerOffersManager } from './components/partner/PartnerOffersManager';
+export {
+  isBookingServiceEvidence,
+  ServiceEvidenceList,
+} from './components/admin/ServiceEvidenceList';
 export { isBookableCategory } from './utils/offerKindByCategory';
 export type { BookableGuideItem } from './types/bookings';

=== src/domain/bookings/ports/bookingsApiPort.ts — diff ===
@@ -2,6 +2,12 @@ import type {
   BookingDetails,
   BookingSummary,
   CancelBookingResponse,
+  ArrivalLocation,
+  CheckInCodeView,
+  CodeCheckInPayload,
+  EntryCheckInPayload,
+  EntryPassView,
+  NoCodeReason,
   CreateBookingPayload,
   CreateBookingResponse,
   CreateOfferPayload,
@@ -35,4 +41,38 @@ export interface BookingsApiPort {
   getBooking(bookingId: string): Promise<BookingDetails>;
   listMyBookings(cursor?: string | null): Promise<Page<BookingSummary>>;
   cancelBooking(bookingId: string): Promise<CancelBookingResponse>;
+
+  // Prova do serviço (D20).
+  getCheckInCode(bookingId: string): Promise<CheckInCodeView>;
+  getEntryPass(bookingId: string): Promise<EntryPassView>;
+  reportProviderAbsent(bookingId: string): Promise<BookingSummary>;
+  answerServiceConfirmation(bookingId: string, answer: 'yes' | 'no'): Promise<BookingSummary>;
+  checkInByCode(
+    offerId: string,
+    slotId: string,
+    payload: CodeCheckInPayload
+  ): Promise<BookingSummary>;
+  checkInEntry(
+    offerId: string,
+    slotId: string,
+    payload: EntryCheckInPayload
+  ): Promise<BookingSummary>;
+  getEntryVerificationKeys(
+    offerId: string
+  ): Promise<Array<{ kid: string; publicKeyJwk: JsonWebKey }>>;
+  recordArrival(
+    offerId: string,
+    bookingId: string,
+    location?: ArrivalLocation
+  ): Promise<BookingSummary>;
+  checkInWithoutCode(
+    offerId: string,
+    bookingId: string,
+    payload: { participantsPresent: number; reason: NoCodeReason }
+  ): Promise<BookingSummary>;
+  answerProviderAbsence(
+    offerId: string,
+    bookingId: string,
+    answer: 'was_there' | 'admitted'
+  ): Promise<BookingSummary>;
 }

=== src/domain/bookings/schemas/offerFormSchema.ts — diff ===
@@ -41,6 +41,7 @@ export const offerFormSchema = z.object({
     .max(10),
   durationMinutes: z.coerce.number().int(integer).min(15, integer).max(1440, integer),
   meetingPoint: optionalText(300),
+  pickupMode: z.enum(['meeting_point', 'buyer_address']),
   cancellationPolicy: z.enum([...BOOKING_CANCELLATION_POLICIES, ...TRANSFER_CANCELLATION_POLICIES]),
   maxParticipantsPerBooking: z.coerce.number().int(integer).min(1, integer).max(50, integer),
   requiresParticipantNames: z.boolean(),

=== src/domain/bookings/types/bookings.ts — diff ===
@@ -20,6 +20,8 @@ export interface OfferFields {
   pricing: { currency: 'BRL'; priceOptions: PriceOption[] };
   durationMinutes?: number;
   meetingPoint?: { address: string; instructions?: LocalizedText };
+  /** Onde o serviço começa: no ponto de encontro ou onde o comprador está (D20). */
+  pickupMode?: 'meeting_point' | 'buyer_address';
   cancellationPolicy: BookingCancellationPolicy;
   maxParticipantsPerBooking: number;
   requiresParticipantNames: boolean;
@@ -105,6 +107,23 @@ export interface BookingSummary {
   } | null;
   /** Aviso de nova data (D16, 4A): até 7 dias depois, o cancelamento devolve tudo. */
   rescheduledAt: string | null;
+  /** Onde o comprador está, quando a oferta busca no endereço (D20). */
+  pickupAddress: string | null;
+  checkIn: { at: string; method: CheckInMethod; participantsPresent: number } | null;
+  /** "Cheguei" do prestador (D20). */
+  arrivedAt: string | null;
+  providerAbsence: {
+    reportedAt: string;
+    respondBy: string;
+    answer: 'was_there' | 'admitted' | null;
+    resolution: 'refunded' | 'withdrawn' | 'admin' | null;
+  } | null;
+  serviceConfirmation: {
+    askedAt: string;
+    answerBy: string;
+    answer: 'yes' | 'no' | null;
+    resolution: 'confirmed' | 'admin' | 'refunded' | null;
+  } | null;
   createdAt: string;
   /** Só na visão do parceiro vendedor. */
   buyerId?: string;
@@ -137,6 +156,7 @@ export interface CreateBookingPayload {
   slotId: string;
   lines: Array<{ priceOptionId: string; quantity: number }>;
   participants: Array<{ name: string }>;
+  pickupAddress?: string;
   idempotencyKey: string;
   locale: 'pt-BR' | 'en' | 'fr';
   acceptedTermsVersion: string;
@@ -159,3 +179,43 @@ export interface CancelBookingResponse {
   refundPercent: number;
   refundAmountMinor: number;
 }
+
+export type CheckInMethod = 'code' | 'qr' | 'no_code';
+export type NoCodeReason = 'no_phone' | 'refused' | 'other';
+
+/** Código de check-in do comprador; `code` só no dia do serviço (D20). */
+export interface CheckInCodeView {
+  code: string | null;
+  visibleFrom: string;
+  validUntil: string;
+  checkedInAt: string | null;
+}
+
+/** QR e código de 8 caracteres da entrada de atração (D20). */
+export interface EntryPassView {
+  qrToken: string | null;
+  code: string | null;
+  visibleFrom: string;
+  validUntil: string;
+  checkedInAt: string | null;
+}
+
+export interface CodeCheckInPayload {
+  code: string;
+  participantsPresent: number;
+  /** Hora do aparelho quando o código foi digitado sem internet. */
+  capturedAt?: string;
+}
+
+export interface EntryCheckInPayload {
+  qrToken?: string;
+  code?: string;
+  participantsPresent: number;
+  capturedAt?: string;
+}
+
+export interface ArrivalLocation {
+  lat: number;
+  lng: number;
+  accuracyM?: number;
+}

=== src/domain/bookings/utils/bookingErrorMessage.ts — diff ===
@@ -13,6 +13,15 @@ const KNOWN_CODES = [
   'CANCELLATION_NOT_ALLOWED',
   'TERMS_NOT_ACCEPTED',
   'SELLER_ACCOUNT_NOT_ELIGIBLE',
+  'CHECK_IN_NOT_APPLICABLE',
+  'CHECK_IN_WINDOW_CLOSED',
+  'INVALID_CHECK_IN_CODE',
+  'CHECK_IN_LOCKED',
+  'NO_SHOW_TOO_EARLY',
+  'ABSENCE_REPORT_NOT_ALLOWED',
+  'NOTHING_TO_ANSWER',
+  'INVALID_ENTRY_PASS',
+  'CLAIM_ALREADY_EXISTS',
   'INTERNAL_ERROR',
 ] as const;

=== src/domain/bookings/utils/checkInPrefix.ts — ARQUIVO NOVO, conteúdo completo ===
import type { OfferKind } from '../types/bookings';

/** Alfabeto do código: sem 0/O e 1/I/L, como no backend (D20). */
export const CHECK_IN_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const CHECK_IN_CODE_LENGTH = 6;
export const ENTRY_CODE_LENGTH = 8;

// Iguais nos três idiomas, como um código de voo (D20); não são traduzidos nem enviados ao servidor.
// Aluguel (ALUG) e translado (TRAN) entram quando esses tipos forem vendidos (D3).
const PREFIX: Record<OfferKind, string> = {
  tour: 'PASS',
  private_entry: 'ENTR',
};

export function checkInPrefix(kind: OfferKind): string {
  return PREFIX[kind];
}

export function codeLengthFor(kind: OfferKind): number {
  return kind === 'private_entry' ? ENTRY_CODE_LENGTH : CHECK_IN_CODE_LENGTH;
}

/** Tipos com check-in por código de 6 caracteres; a entrada usa QR e código de 8. */
export function usesCheckInCode(kind: OfferKind): boolean {
  return kind !== 'private_entry';
}

=== src/domain/bookings/utils/offerFormMapping.ts — diff ===
@@ -28,6 +28,8 @@ export function offerFormToFields(values: OfferFormValues): OfferFields {
     ...(values.meetingPoint.trim()
       ? { meetingPoint: { address: values.meetingPoint.trim() } }
       : {}),
+    // Entrada de atração é sempre no local; buscar o comprador só vale para passeio (D20).
+    pickupMode: values.kind === 'tour' ? values.pickupMode : 'meeting_point',
     cancellationPolicy: values.cancellationPolicy,
     maxParticipantsPerBooking: values.maxParticipantsPerBooking,
     requiresParticipantNames: values.requiresParticipantNames,
@@ -50,6 +52,7 @@ export function offerToFormValues(offer: PartnerOffer): OfferFormValues {
     })),
     durationMinutes: offer.durationMinutes ?? 60,
     meetingPoint: offer.meetingPoint?.address ?? '',
+    pickupMode: offer.pickupMode ?? 'meeting_point',
     cancellationPolicy: offer.cancellationPolicy,
     maxParticipantsPerBooking: offer.maxParticipantsPerBooking,
     requiresParticipantNames: offer.requiresParticipantNames,
@@ -64,6 +67,7 @@ export function emptyOfferFormValues(kind: 'tour' | 'private_entry'): OfferFormV
     priceOptions: [{ id: 'adult', label: '', amount: '' }],
     durationMinutes: 120,
     meetingPoint: '',
+    pickupMode: 'meeting_point',
     cancellationPolicy: 'flexible',
     maxParticipantsPerBooking: 8,
     requiresParticipantNames: false,

=== src/domain/bookings/utils/serviceProofTiming.ts — ARQUIVO NOVO, conteúdo completo ===
import type { BookingSummary } from '../types/bookings';
import { usesCheckInCode } from './checkInPrefix';

const MINUTE_MS = 60_000;
// Mesmos prazos do backend (D20); a UI só decide o que mostrar, quem confere é o servidor.
const PROVIDER_ABSENT_AFTER_MS = 30 * MINUTE_MS;
const NO_SHOW_WAIT_MS = 30 * MINUTE_MS;
const CHECK_IN_CLOSES_AFTER_MS = 12 * 60 * MINUTE_MS;

export function serviceEndMs(booking: BookingSummary): number {
  return (
    new Date(booking.offer.startsAt).getTime() + (booking.offer.durationMinutes ?? 0) * MINUTE_MS
  );
}

/** "O prestador não veio": 30 min depois do horário, sem check-in nem relato. */
export function canReportProviderAbsent(booking: BookingSummary, now: Date): boolean {
  const nowMs = now.getTime();
  return (
    usesCheckInCode(booking.kind) &&
    booking.status === 'confirmed' &&
    !booking.checkIn &&
    !booking.providerAbsence &&
    nowMs >= new Date(booking.offer.startsAt).getTime() + PROVIDER_ABSENT_AFTER_MS &&
    nowMs <= serviceEndMs(booking) + CHECK_IN_CLOSES_AFTER_MS
  );
}

/** Pergunta "O serviço aconteceu?" ainda aberta. */
export function isConfirmationPending(booking: BookingSummary, now: Date): boolean {
  const confirmation = booking.serviceConfirmation;
  return (
    !!confirmation &&
    !confirmation.answer &&
    !confirmation.resolution &&
    now.getTime() <= new Date(confirmation.answerBy).getTime()
  );
}

/** Hora a partir da qual o prestador pode marcar a ausência; null sem "Cheguei". */
export function noShowAvailableAt(booking: BookingSummary): Date | null {
  return booking.arrivedAt
    ? new Date(new Date(booking.arrivedAt).getTime() + NO_SHOW_WAIT_MS)
    : null;
}

=== src/domain/payment/components/admin/AdminFinanceQueues.tsx — diff ===
@@ -1,4 +1,5 @@
-import { useState } from 'react';
+import { type ReactNode, useState } from 'react';
+import type { AdminSaleClaim } from '../../types/adminFinance';
 import { useTranslation } from 'react-i18next';
 import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
 import { AdminDebtQueue } from './AdminDebtQueue';
@@ -9,7 +10,12 @@ type FinanceTab = 'claims' | 'forceMajeure' | 'debts';
 const TABS: FinanceTab[] = ['claims', 'forceMajeure', 'debts'];
 
 /** Filas financeiras do admin (D16): reclamações, força maior e dívidas dos CNPJs. */
-export function AdminFinanceQueues() {
+export function AdminFinanceQueues({
+  renderClaimEvidence,
+}: {
+  /** Slot da composição para as provas do serviço na reclamação (D20). */
+  renderClaimEvidence?: (claim: AdminSaleClaim) => ReactNode;
+} = {}) {
   const { t } = useTranslation();
   const [tab, setTab] = useState<FinanceTab>('claims');
   const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null);
@@ -41,7 +47,7 @@ export function AdminFinanceQueues() {
         </p>
       )}
       {tab === 'claims' ? (
-        <SaleClaimQueue onNotice={show} />
+        <SaleClaimQueue onNotice={show} renderEvidence={renderClaimEvidence} />
       ) : tab === 'forceMajeure' ? (
         <ForceMajeureQueue onNotice={show} />
       ) : (

=== src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx — diff ===
@@ -1,5 +1,5 @@
 import { AlertCircle, Loader2 } from 'lucide-react';
-import { useId, useState } from 'react';
+import { type ReactNode, useId, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { formatMoneyMinor } from '../../../../shared/utils/money';
 import { Dialog } from '../../../../ui/components/Dialog';
@@ -19,10 +19,13 @@ export function SaleClaimDecisionDialog({
   claim,
   onClose,
   onDecided,
+  renderEvidence,
 }: {
   claim: AdminSaleClaim | null;
   onClose: () => void;
   onDecided: (message: string) => void;
+  /** Slot da composição para as provas do serviço (D20). */
+  renderEvidence?: (claim: AdminSaleClaim) => ReactNode;
 }) {
   const { t, i18n } = useTranslation();
   const id = useId();
@@ -99,6 +102,7 @@ export function SaleClaimDecisionDialog({
                 })}`}
             </p>
           </div>
+          {renderEvidence?.(claim)}
           <p className="text-[12px] text-ink/60">{t('adminFinance.claims.decideDescription')}</p>
           <fieldset className="space-y-2">
             <legend className="text-xs font-bold text-ink mb-1.5">

=== src/domain/payment/components/admin/SaleClaimQueue.tsx — diff ===
@@ -1,4 +1,4 @@
-import { useState } from 'react';
+import { type ReactNode, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { formatMoneyMinor } from '../../../../shared/utils/money';
 import { StatusText } from '../../../../ui/components/StatusText';
@@ -12,8 +12,10 @@ import { formatBusinessDay } from '../../../../shared/utils/businessDateTime';
 
 export function SaleClaimQueue({
   onNotice,
+  renderEvidence,
 }: {
   onNotice: (message: string, error?: boolean) => void;
+  renderEvidence?: (claim: AdminSaleClaim) => ReactNode;
 }) {
   const { t, i18n } = useTranslation();
   const queue = useAdminFinanceQueue(listAdminSaleClaimsUseCase);
@@ -59,6 +61,7 @@ export function SaleClaimQueue({
       <SaleClaimDecisionDialog
         key={deciding?.id ?? 'none'}
         claim={deciding}
+        renderEvidence={renderEvidence}
         onClose={() => setDeciding(null)}
         onDecided={(message) => {
           setDeciding(null);

=== src/domain/payment/components/receivables/payoutStatus.ts — diff ===
@@ -4,6 +4,7 @@ export type PayoutStatusKey =
   | 'pending'
   | 'claim'
   | 'dispute'
+  | 'service_proof'
   | 'released'
   | 'fully_refunded'
   | 'dispute_lost';
@@ -12,6 +13,7 @@ const TONE: Record<PayoutStatusKey, string> = {
   pending: 'bg-info-soft text-info border-info-line',
   claim: 'bg-warn-soft text-warn border-warn-line',
   dispute: 'bg-warn-soft text-warn border-warn-line',
+  service_proof: 'bg-warn-soft text-warn border-warn-line',
   released: 'bg-success-soft text-success border-success-line',
   fully_refunded: 'bg-surface text-ink/70 border-line',
   dispute_lost: 'bg-danger-soft text-danger border-danger-line',
@@ -23,7 +25,8 @@ export function payoutStatusKey(entry: PayoutEntryView): PayoutStatusKey {
     return entry.canceledReason === 'dispute_lost' ? 'dispute_lost' : 'fully_refunded';
   }
   if (entry.status === 'on_hold') {
-    return entry.holdReasons.includes('claim') ? 'claim' : 'dispute';
+    if (entry.holdReasons.includes('claim')) return 'claim';
+    return entry.holdReasons.includes('dispute') ? 'dispute' : 'service_proof';
   }
   return 'pending';
 }

=== src/domain/payment/types/adminFinance.ts — diff ===
@@ -16,6 +16,8 @@ export interface AdminSaleClaim extends BuyerSaleClaim, SellerSummary {
   refundableMinor: number;
   /** Teto do reembolso parcial; a taxa de serviço só volta no integral. */
   maxPartialRefundMinor: number;
+  /** Provas do serviço da venda (D20); quem sabe ler é a composição, não o payment. */
+  serviceEvidence?: unknown;
 }
 
 export type SaleClaimOutcome = 'release' | 'refund_full' | 'refund_partial';

=== src/domain/payment/types/receivables.ts — diff ===
@@ -1,6 +1,7 @@
 /** Extrato e dívidas do parceiro (D14, D16), como a API devolve. */
 export type PayoutEntryStatus = 'pending' | 'on_hold' | 'released' | 'canceled';
-export type PayoutHoldReason = 'dispute' | 'claim';
+/** `service_proof`: o passeio espera o check-in ou a confirmação do comprador (D20). */
+export type PayoutHoldReason = 'dispute' | 'claim' | 'service_proof';
 
 export interface PayoutEntryView {
   id: string;

=== src/shared/i18n/bookingsResources.ts — diff ===
@@ -191,6 +191,15 @@ export interface BookingsTranslation {
     CANCELLATION_NOT_ALLOWED: string;
     TERMS_NOT_ACCEPTED: string;
     SELLER_ACCOUNT_NOT_ELIGIBLE: string;
+    CHECK_IN_NOT_APPLICABLE: string;
+    CHECK_IN_WINDOW_CLOSED: string;
+    INVALID_CHECK_IN_CODE: string;
+    CHECK_IN_LOCKED: string;
+    NO_SHOW_TOO_EARLY: string;
+    ABSENCE_REPORT_NOT_ALLOWED: string;
+    NOTHING_TO_ANSWER: string;
+    INVALID_ENTRY_PASS: string;
+    CLAIM_ALREADY_EXISTS: string;
     INTERNAL_ERROR: string;
   };
 }
@@ -397,6 +406,16 @@ export const bookingsPtBR: BookingsTranslation = {
     CANCELLATION_NOT_ALLOWED: 'Esta reserva não pode ser cancelada.',
     TERMS_NOT_ACCEPTED: 'Aceite os termos para continuar.',
     SELLER_ACCOUNT_NOT_ELIGIBLE: 'O parceiro ainda não pode receber pagamentos online.',
+    CHECK_IN_NOT_APPLICABLE: 'Esta reserva não usa este tipo de check-in.',
+    CHECK_IN_WINDOW_CLOSED: 'O check-in deste horário não está aberto agora.',
+    INVALID_CHECK_IN_CODE: 'Código incorreto. Confira com o comprador.',
+    CHECK_IN_LOCKED: 'Muitos códigos errados. Tente de novo em 15 minutos.',
+    NO_SHOW_TOO_EARLY: 'Toque em "Cheguei" e espere 30 min antes de marcar a ausência.',
+    ABSENCE_REPORT_NOT_ALLOWED:
+      'Só é possível relatar 30 min depois do horário, se o check-in não foi feito.',
+    NOTHING_TO_ANSWER: 'Não há nada para responder nesta reserva.',
+    INVALID_ENTRY_PASS: 'QR Code inválido para este horário.',
+    CLAIM_ALREADY_EXISTS: 'Já existe uma reclamação para esta compra.',
     INTERNAL_ERROR: 'Algo deu errado. Tente novamente em instantes.',
   },
 };
@@ -600,6 +619,16 @@ export const bookingsEn: BookingsTranslation = {
     CANCELLATION_NOT_ALLOWED: 'This booking cannot be canceled.',
     TERMS_NOT_ACCEPTED: 'Accept the terms to continue.',
     SELLER_ACCOUNT_NOT_ELIGIBLE: 'This partner cannot receive online payments yet.',
+    CHECK_IN_NOT_APPLICABLE: 'This booking does not use this kind of check-in.',
+    CHECK_IN_WINDOW_CLOSED: 'Check-in for this time slot is not open now.',
+    INVALID_CHECK_IN_CODE: 'Wrong code. Check it with the buyer.',
+    CHECK_IN_LOCKED: 'Too many wrong codes. Try again in 15 minutes.',
+    NO_SHOW_TOO_EARLY: 'Tap "I’m here" and wait 30 min before marking a no-show.',
+    ABSENCE_REPORT_NOT_ALLOWED:
+      'You can report it 30 min after the start time, if no check-in was done.',
+    NOTHING_TO_ANSWER: 'There is nothing to answer in this booking.',
+    INVALID_ENTRY_PASS: 'This QR code is not valid for this time slot.',
+    CLAIM_ALREADY_EXISTS: 'There is already a claim for this purchase.',
     INTERNAL_ERROR: 'Something went wrong. Please try again shortly.',
   },
 };
@@ -810,6 +839,16 @@ export const bookingsFr: BookingsTranslation = {
     CANCELLATION_NOT_ALLOWED: 'Cette réservation ne peut pas être annulée.',
     TERMS_NOT_ACCEPTED: 'Acceptez les conditions pour continuer.',
     SELLER_ACCOUNT_NOT_ELIGIBLE: 'Ce partenaire ne peut pas encore recevoir de paiements en ligne.',
+    CHECK_IN_NOT_APPLICABLE: 'Cette réservation n’utilise pas ce type d’enregistrement.',
+    CHECK_IN_WINDOW_CLOSED: 'L’enregistrement de ce créneau n’est pas ouvert maintenant.',
+    INVALID_CHECK_IN_CODE: 'Code incorrect. Vérifiez avec l’acheteur.',
+    CHECK_IN_LOCKED: 'Trop de codes erronés. Réessayez dans 15 minutes.',
+    NO_SHOW_TOO_EARLY: 'Touchez « Je suis arrivé » et attendez 30 min avant de marquer l’absence.',
+    ABSENCE_REPORT_NOT_ALLOWED:
+      'Le signalement est possible 30 min après l’horaire, sans enregistrement fait.',
+    NOTHING_TO_ANSWER: 'Il n’y a rien à répondre pour cette réservation.',
+    INVALID_ENTRY_PASS: 'Ce QR code n’est pas valable pour ce créneau.',
+    CLAIM_ALREADY_EXISTS: 'Une réclamation existe déjà pour cet achat.',
     INTERNAL_ERROR: 'Un problème est survenu. Réessayez dans un instant.',
   },
 };

=== src/shared/i18n/receivablesResources.ts — diff ===
@@ -27,6 +27,7 @@ export interface ReceivablesTranslation {
       pending: string;
       claim: string;
       dispute: string;
+      service_proof: string;
       released: string;
       fully_refunded: string;
       dispute_lost: string;
@@ -127,6 +128,7 @@ export const receivablesPtBR: ReceivablesTranslation = {
       pending: 'Aguardando liberação',
       claim: 'Retido: reclamação em análise',
       dispute: 'Retido: contestação no cartão',
+      service_proof: 'Retido: aguardando o check-in ou a confirmação do comprador',
       released: 'Repassado',
       fully_refunded: 'Reembolsado ao comprador',
       dispute_lost: 'Contestação perdida',
@@ -222,6 +224,7 @@ export const receivablesEn: ReceivablesTranslation = {
       pending: 'Awaiting release',
       claim: 'On hold: complaint under review',
       dispute: 'On hold: card dispute',
+      service_proof: 'On hold: waiting for the check-in or the buyer’s confirmation',
       released: 'Paid out',
       fully_refunded: 'Refunded to the buyer',
       dispute_lost: 'Dispute lost',
@@ -322,6 +325,7 @@ export const receivablesFr: ReceivablesTranslation = {
       pending: 'En attente de déblocage',
       claim: 'Retenu : réclamation en cours',
       dispute: 'Retenu : contestation de carte',
+      service_proof: 'Retenu : en attente de l’enregistrement ou de la confirmation de l’acheteur',
       released: 'Versé',
       fully_refunded: 'Remboursé à l’acheteur',
       dispute_lost: 'Contestation perdue',

=== src/shared/i18n/resources.ts — diff ===
@@ -68,6 +68,12 @@ import {
   adminPanelFr,
   adminPanelPtBR,
 } from './adminPanelResources';
+import {
+  type ServiceProofTranslation,
+  serviceProofEn,
+  serviceProofFr,
+  serviceProofPtBR,
+} from './serviceProofResources';
 import {
   type TicketSessionsTranslation,
   ticketSessionsEn,
@@ -119,6 +125,7 @@ export interface TranslationResource {
   myReviews: MyReviewsTranslation;
   reviewReports: ReviewReportsTranslation;
   adminPanel: AdminPanelTranslation;
+  serviceProof: ServiceProofTranslation;
   adminFinance: AdminFinanceTranslation;
   ticketSessions: TicketSessionsTranslation;
   salesPolicy: SalesPolicyTranslation;
@@ -349,6 +356,7 @@ const ptBR: TranslationResource = {
   myReviews: myReviewsPtBR,
   reviewReports: reviewReportsPtBR,
   adminPanel: adminPanelPtBR,
+  serviceProof: serviceProofPtBR,
   adminFinance: adminFinancePtBR,
   ticketSessions: ticketSessionsPtBR,
   salesPolicy: salesPolicyPtBR,
@@ -639,6 +647,7 @@ const en: TranslationResource = {
   myReviews: myReviewsEn,
   reviewReports: reviewReportsEn,
   adminPanel: adminPanelEn,
+  serviceProof: serviceProofEn,
   adminFinance: adminFinanceEn,
   ticketSessions: ticketSessionsEn,
   salesPolicy: salesPolicyEn,
@@ -923,6 +932,7 @@ const fr: TranslationResource = {
   myReviews: myReviewsFr,
   reviewReports: reviewReportsFr,
   adminPanel: adminPanelFr,
+  serviceProof: serviceProofFr,
   adminFinance: adminFinanceFr,
   ticketSessions: ticketSessionsFr,
   salesPolicy: salesPolicyFr,

=== src/shared/i18n/serviceProofResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos da prova do serviço nas reservas (D20): código, QR, Cheguei, ausência e confirmação. pt-BR é a fonte. */
type Reasons = { no_phone: string; refused: string; other: string };

export interface ServiceProofTranslation {
  pass: {
    codeTitle: string;
    entryTitle: string;
    codeHint: string;
    entryHint: string;
    warning: string;
    notYet: string;
    checkedIn: string;
    loadError: string;
    retry: string;
    qrAlt: string;
    copyLabel: string;
  };
  buyer: {
    providerAbsent: string;
    providerAbsentTitle: string;
    providerAbsentMessage: string;
    providerAbsentConfirm: string;
    keep: string;
    absenceSent: string;
    absenceAdmin: string;
    absenceRefunded: string;
    absenceWithdrawn: string;
    questionTitle: string;
    questionMessage: string;
    yes: string;
    no: string;
    noTitle: string;
    noMessageRefund: string;
    noMessageReview: string;
    noConfirm: string;
    confirmed: string;
    denied: string;
    refunded: string;
  };
  checkout: {
    pickupLabel: string;
    pickupHint: string;
    pickupPlaceholder: string;
  };
  partner: {
    checkIn: string;
    entry: string;
    sheetTitle: string;
    entrySheetTitle: string;
    codeLabel: string;
    entryCodeLabel: string;
    character: string;
    participantsLabel: string;
    submit: string;
    scan: string;
    scanning: string;
    stopScan: string;
    scanUnsupported: string;
    cameraDenied: string;
    success_one: string;
    success_other: string;
    savedOffline: string;
    offlineValid: string;
    offlineInvalid: string;
    pending_one: string;
    pending_other: string;
    arrived: string;
    arrivedAt: string;
    locationDenied: string;
    noShow: string;
    noShowAt: string;
    noCode: string;
    noCodeMessage: string;
    noCodeReason: string;
    reasons: Reasons;
    noCodeConfirm: string;
    absenceTitle: string;
    absenceMessage: string;
    wasThere: string;
    admitted: string;
    admittedTitle: string;
    admittedMessage: string;
    admittedConfirm: string;
    pickupAt: string;
    checkedIn_one: string;
    checkedIn_other: string;
    checkedInNoCode: string;
  };
  evidence: {
    title: string;
    checkIn: string;
    methods: { code: string; qr: string; no_code: string };
    noCheckIn: string;
    arrival: string;
    noArrival: string;
    map: string;
    absence: string;
    answers: { was_there: string; admitted: string; none: string };
    confirmation: string;
    confirmationAnswers: { yes: string; no: string; none: string };
    noShow: string;
    pickup: string;
    noCodeReason: string;
  };
  offerEditor: {
    pickupLegend: string;
    meetingPoint: string;
    buyerAddress: string;
  };
}

export const serviceProofPtBR: ServiceProofTranslation = {
  pass: {
    codeTitle: 'Código de check-in',
    entryTitle: 'Sua entrada',
    codeHint: 'Informe este código ao prestador, pessoalmente, na hora do serviço.',
    entryHint: 'Mostre o QR Code na portaria. Se a leitura falhar, informe o código.',
    warning:
      'Nunca informe o código por telefone ou mensagem. Ninguém do Use Guide pede este código.',
    notYet: 'Seu código aparece no dia do serviço, a partir de {{date}}.',
    checkedIn: 'Check-in feito em {{date}}.',
    loadError: 'Não foi possível carregar o código.',
    retry: 'Tentar de novo',
    qrAlt: 'QR Code da entrada',
    copyLabel: 'Código {{code}}',
  },
  buyer: {
    providerAbsent: 'O prestador não veio',
    providerAbsentTitle: 'O prestador não veio?',
    providerAbsentMessage:
      'O prestador tem 2 h para responder. Sem resposta, você recebe o valor pago de volta, com a taxa de serviço.',
    providerAbsentConfirm: 'Enviar relato',
    keep: 'Voltar',
    absenceSent: 'Relato enviado. O prestador tem até {{date}} para responder.',
    absenceAdmin: 'O prestador diz que esteve no local. Nossa equipe decide em até 5 dias.',
    absenceRefunded: 'O prestador não compareceu. Você recebe o valor pago de volta.',
    absenceWithdrawn: 'O prestador chegou e o check-in foi feito.',
    questionTitle: 'O serviço aconteceu?',
    questionMessage: 'Responda até {{date}}. Sem resposta, você recebe o valor pago de volta.',
    yes: 'Sim, aconteceu',
    no: 'Não aconteceu',
    noTitle: 'O serviço não aconteceu?',
    noMessageRefund: 'Você recebe o valor pago de volta.',
    noMessageReview:
      'Nossa equipe vai analisar o caso em até 5 dias. O valor pago pode voltar para você.',
    noConfirm: 'Confirmar',
    confirmed: 'Obrigado. O serviço foi confirmado.',
    denied: 'Resposta enviada.',
    refunded: 'Você recebe o valor pago de volta.',
  },
  checkout: {
    pickupLabel: 'Onde você está hospedado?',
    pickupHint:
      'O prestador busca você neste endereço. Só ele vê, e o endereço é apagado depois do serviço.',
    pickupPlaceholder: 'Nome da pousada ou endereço',
  },
  partner: {
    checkIn: 'Fazer check-in',
    entry: 'Portaria',
    sheetTitle: 'Check-in',
    entrySheetTitle: 'Portaria',
    codeLabel: 'Código do comprador',
    entryCodeLabel: 'Código da entrada',
    character: 'Caractere {{n}} de {{total}}',
    participantsLabel: 'Pessoas presentes',
    submit: 'Confirmar check-in',
    scan: 'Ler QR Code',
    scanning: 'Aponte a câmera para o QR Code',
    stopScan: 'Parar câmera',
    scanUnsupported: 'Este navegador não lê QR Code. Digite o código que aparece abaixo do QR.',
    cameraDenied: 'Sem acesso à câmera. Digite o código que aparece abaixo do QR.',
    success_one: 'Check-in feito: {{count}} pessoa.',
    success_other: 'Check-in feito: {{count}} pessoas.',
    savedOffline: 'Sem internet: o check-in foi guardado e será enviado quando a conexão voltar.',
    offlineValid:
      'QR válido, conferido sem internet. A entrada será enviada quando a conexão voltar.',
    offlineInvalid: 'QR inválido para este horário.',
    pending_one: '{{count}} check-in aguardando internet',
    pending_other: '{{count}} check-ins aguardando internet',
    arrived: 'Cheguei',
    arrivedAt: 'Chegada às {{time}}',
    locationDenied: 'Sem acesso à localização: a chegada foi registrada só com a hora.',
    noShow: 'Cliente não apareceu',
    noShowAt: 'Ausência disponível às {{time}}',
    noCode: 'Cliente sem código',
    noCodeMessage:
      'O serviço segue por sua conta e risco. O comprador vai confirmar se o serviço aconteceu.',
    noCodeReason: 'Motivo',
    reasons: {
      no_phone: 'Sem celular ou sem bateria',
      refused: 'Não quis informar',
      other: 'Outro',
    },
    noCodeConfirm: 'Registrar',
    absenceTitle: 'O comprador diz que você não veio',
    absenceMessage:
      'Responda até {{date}}. Sem resposta, o comprador recebe o reembolso integral e vale a multa de 20%.',
    wasThere: 'Eu estava lá',
    admitted: 'Não compareci',
    admittedTitle: 'Confirmar que não compareceu?',
    admittedMessage: 'O comprador recebe o reembolso integral e a multa de 20% é cobrada.',
    admittedConfirm: 'Confirmar',
    pickupAt: 'Buscar em: {{address}}',
    checkedIn_one: 'Check-in às {{time}} · {{count}} pessoa',
    checkedIn_other: 'Check-in às {{time}} · {{count}} pessoas',
    checkedInNoCode: 'Sem código às {{time}} · aguardando o comprador',
  },
  evidence: {
    title: 'Provas do serviço',
    checkIn: 'Check-in: {{date}} · {{method}} · {{present}} de {{total}} pessoas',
    methods: { code: 'com código', qr: 'pelo QR Code', no_code: 'sem código' },
    noCheckIn: 'Sem check-in',
    arrival: '"Cheguei": {{date}}',
    noArrival: 'Sem "Cheguei"',
    map: 'Ver local no mapa',
    absence: 'Relato de ausência: {{date}} · {{answer}}',
    answers: {
      was_there: 'o prestador diz que esteve lá',
      admitted: 'o prestador admitiu a falta',
      none: 'sem resposta',
    },
    confirmation: 'Comprador: {{answer}}',
    confirmationAnswers: {
      yes: 'o serviço aconteceu',
      no: 'o serviço não aconteceu',
      none: 'sem resposta',
    },
    noShow: 'Ausência marcada pelo prestador',
    pickup: 'Endereço de busca: {{address}}',
    noCodeReason: 'Motivo do check-in sem código: {{reason}}',
  },
  offerEditor: {
    pickupLegend: 'Onde o serviço começa',
    meetingPoint: 'No ponto de encontro',
    buyerAddress: 'Buscar o comprador onde ele está',
  },
};

export const serviceProofEn: ServiceProofTranslation = {
  pass: {
    codeTitle: 'Check-in code',
    entryTitle: 'Your entry',
    codeHint: 'Tell this code to the provider, in person, when the service starts.',
    entryHint: 'Show the QR code at the entrance. If it cannot be read, tell them the code.',
    warning: 'Never share the code by phone or message. No one at Use Guide asks for this code.',
    notYet: 'Your code appears on the day of the service, from {{date}}.',
    checkedIn: 'Checked in on {{date}}.',
    loadError: 'Could not load the code.',
    retry: 'Try again',
    qrAlt: 'Entry QR code',
    copyLabel: 'Code {{code}}',
  },
  buyer: {
    providerAbsent: 'The provider did not show up',
    providerAbsentTitle: 'The provider did not show up?',
    providerAbsentMessage:
      'The provider has 2 h to respond. Without a response, you get the amount paid back, including the service fee.',
    providerAbsentConfirm: 'Send report',
    keep: 'Back',
    absenceSent: 'Report sent. The provider has until {{date}} to respond.',
    absenceAdmin: 'The provider says they were there. Our team decides within 5 days.',
    absenceRefunded: 'The provider did not show up. You get the amount paid back.',
    absenceWithdrawn: 'The provider arrived and the check-in was done.',
    questionTitle: 'Did the service happen?',
    questionMessage: 'Answer by {{date}}. Without an answer, you get the amount paid back.',
    yes: 'Yes, it happened',
    no: 'It did not happen',
    noTitle: 'The service did not happen?',
    noMessageRefund: 'You get the amount paid back.',
    noMessageReview:
      'Our team will review the case within 5 days. You may get the amount paid back.',
    noConfirm: 'Confirm',
    confirmed: 'Thank you. The service is confirmed.',
    denied: 'Answer sent.',
    refunded: 'You get the amount paid back.',
  },
  checkout: {
    pickupLabel: 'Where are you staying?',
    pickupHint:
      'The provider picks you up at this address. Only they can see it, and it is deleted after the service.',
    pickupPlaceholder: 'Name of the guesthouse or address',
  },
  partner: {
    checkIn: 'Check in',
    entry: 'Entrance',
    sheetTitle: 'Check-in',
    entrySheetTitle: 'Entrance',
    codeLabel: "Buyer's code",
    entryCodeLabel: 'Entry code',
    character: 'Character {{n}} of {{total}}',
    participantsLabel: 'People present',
    submit: 'Confirm check-in',
    scan: 'Scan QR code',
    scanning: 'Point the camera at the QR code',
    stopScan: 'Stop camera',
    scanUnsupported: 'This browser cannot read QR codes. Type the code shown below the QR.',
    cameraDenied: 'No camera access. Type the code shown below the QR.',
    success_one: 'Checked in: {{count}} person.',
    success_other: 'Checked in: {{count}} people.',
    savedOffline:
      'No internet: the check-in was saved and will be sent when the connection is back.',
    offlineValid: 'Valid QR, checked offline. The entry will be sent when the connection is back.',
    offlineInvalid: 'This QR is not valid for this time slot.',
    pending_one: '{{count}} check-in waiting for internet',
    pending_other: '{{count}} check-ins waiting for internet',
    arrived: "I'm here",
    arrivedAt: 'Arrived at {{time}}',
    locationDenied: 'No location access: the arrival was saved with the time only.',
    noShow: 'Customer did not show up',
    noShowAt: 'No-show available at {{time}}',
    noCode: 'Customer without code',
    noCodeMessage:
      'The service goes ahead at your own risk. The buyer will confirm whether the service happened.',
    noCodeReason: 'Reason',
    reasons: {
      no_phone: 'No phone or no battery',
      refused: 'Did not want to tell',
      other: 'Other',
    },
    noCodeConfirm: 'Save',
    absenceTitle: 'The buyer says you did not show up',
    absenceMessage:
      'Respond by {{date}}. Without a response, the buyer gets a full refund and the 20% penalty applies.',
    wasThere: 'I was there',
    admitted: 'I did not show up',
    admittedTitle: 'Confirm that you did not show up?',
    admittedMessage: 'The buyer gets a full refund and the 20% penalty is charged.',
    admittedConfirm: 'Confirm',
    pickupAt: 'Pick up at: {{address}}',
    checkedIn_one: 'Checked in at {{time}} · {{count}} person',
    checkedIn_other: 'Checked in at {{time}} · {{count}} people',
    checkedInNoCode: 'Without code at {{time}} · waiting for the buyer',
  },
  evidence: {
    title: 'Proof of service',
    checkIn: 'Check-in: {{date}} · {{method}} · {{present}} of {{total}} people',
    methods: { code: 'with code', qr: 'by QR code', no_code: 'without code' },
    noCheckIn: 'No check-in',
    arrival: '"I\'m here": {{date}}',
    noArrival: 'No "I\'m here"',
    map: 'See place on the map',
    absence: 'No-show report: {{date}} · {{answer}}',
    answers: {
      was_there: 'the provider says they were there',
      admitted: 'the provider admitted not showing up',
      none: 'no response',
    },
    confirmation: 'Buyer: {{answer}}',
    confirmationAnswers: {
      yes: 'the service happened',
      no: 'the service did not happen',
      none: 'no answer',
    },
    noShow: 'No-show marked by the provider',
    pickup: 'Pick-up address: {{address}}',
    noCodeReason: 'Reason for check-in without code: {{reason}}',
  },
  offerEditor: {
    pickupLegend: 'Where the service starts',
    meetingPoint: 'At the meeting point',
    buyerAddress: 'Pick up the buyer where they are',
  },
};

export const serviceProofFr: ServiceProofTranslation = {
  pass: {
    codeTitle: 'Code d’enregistrement',
    entryTitle: 'Votre entrée',
    codeHint: 'Donnez ce code au prestataire, en personne, au moment du service.',
    entryHint: 'Montrez le QR code à l’entrée. Si la lecture échoue, donnez le code.',
    warning:
      'Ne communiquez jamais le code par téléphone ou par message. Personne chez Use Guide ne vous le demande.',
    notYet: 'Votre code apparaît le jour du service, à partir de {{date}}.',
    checkedIn: 'Enregistrement fait le {{date}}.',
    loadError: 'Impossible de charger le code.',
    retry: 'Réessayer',
    qrAlt: 'QR code de l’entrée',
    copyLabel: 'Code {{code}}',
  },
  buyer: {
    providerAbsent: 'Le prestataire n’est pas venu',
    providerAbsentTitle: 'Le prestataire n’est pas venu ?',
    providerAbsentMessage:
      'Le prestataire a 2 h pour répondre. Sans réponse, vous êtes remboursé du montant payé, frais de service compris.',
    providerAbsentConfirm: 'Envoyer le signalement',
    keep: 'Retour',
    absenceSent: 'Signalement envoyé. Le prestataire a jusqu’au {{date}} pour répondre.',
    absenceAdmin: 'Le prestataire dit qu’il était sur place. Notre équipe décide sous 5 jours.',
    absenceRefunded: 'Le prestataire n’est pas venu. Vous êtes remboursé du montant payé.',
    absenceWithdrawn: 'Le prestataire est arrivé et l’enregistrement a été fait.',
    questionTitle: 'Le service a-t-il eu lieu ?',
    questionMessage:
      'Répondez avant le {{date}}. Sans réponse, vous êtes remboursé du montant payé.',
    yes: 'Oui, il a eu lieu',
    no: 'Il n’a pas eu lieu',
    noTitle: 'Le service n’a pas eu lieu ?',
    noMessageRefund: 'Vous êtes remboursé du montant payé.',
    noMessageReview:
      'Notre équipe examinera le cas sous 5 jours. Le montant payé pourra vous être remboursé.',
    noConfirm: 'Confirmer',
    confirmed: 'Merci. Le service est confirmé.',
    denied: 'Réponse envoyée.',
    refunded: 'Vous êtes remboursé du montant payé.',
  },
  checkout: {
    pickupLabel: 'Où logez-vous ?',
    pickupHint:
      'Le prestataire vient vous chercher à cette adresse. Lui seul la voit, et elle est supprimée après le service.',
    pickupPlaceholder: 'Nom de la pousada ou adresse',
  },
  partner: {
    checkIn: 'Enregistrer',
    entry: 'Entrée',
    sheetTitle: 'Enregistrement',
    entrySheetTitle: 'Entrée',
    codeLabel: 'Code de l’acheteur',
    entryCodeLabel: 'Code de l’entrée',
    character: 'Caractère {{n}} sur {{total}}',
    participantsLabel: 'Personnes présentes',
    submit: 'Confirmer l’enregistrement',
    scan: 'Lire le QR code',
    scanning: 'Pointez la caméra vers le QR code',
    stopScan: 'Arrêter la caméra',
    scanUnsupported: 'Ce navigateur ne lit pas les QR codes. Saisissez le code affiché sous le QR.',
    cameraDenied: 'Pas d’accès à la caméra. Saisissez le code affiché sous le QR.',
    success_one: 'Enregistrement fait : {{count}} personne.',
    success_other: 'Enregistrement fait : {{count}} personnes.',
    savedOffline:
      'Pas d’internet : l’enregistrement a été gardé et sera envoyé au retour de la connexion.',
    offlineValid: 'QR valide, vérifié hors ligne. L’entrée sera envoyée au retour de la connexion.',
    offlineInvalid: 'Ce QR n’est pas valable pour ce créneau.',
    pending_one: '{{count}} enregistrement en attente d’internet',
    pending_other: '{{count}} enregistrements en attente d’internet',
    arrived: 'Je suis arrivé',
    arrivedAt: 'Arrivée à {{time}}',
    locationDenied:
      'Pas d’accès à la position : l’arrivée a été enregistrée avec l’heure seulement.',
    noShow: 'Le client n’est pas venu',
    noShowAt: 'Absence possible à {{time}}',
    noCode: 'Client sans code',
    noCodeMessage:
      'Le service continue à vos risques. L’acheteur confirmera si le service a eu lieu.',
    noCodeReason: 'Motif',
    reasons: {
      no_phone: 'Sans téléphone ou sans batterie',
      refused: 'N’a pas voulu le donner',
      other: 'Autre',
    },
    noCodeConfirm: 'Enregistrer',
    absenceTitle: 'L’acheteur dit que vous n’êtes pas venu',
    absenceMessage:
      'Répondez avant le {{date}}. Sans réponse, l’acheteur est remboursé intégralement et la pénalité de 20 % s’applique.',
    wasThere: 'J’étais sur place',
    admitted: 'Je ne suis pas venu',
    admittedTitle: 'Confirmer que vous n’êtes pas venu ?',
    admittedMessage: 'L’acheteur est remboursé intégralement et la pénalité de 20 % est facturée.',
    admittedConfirm: 'Confirmer',
    pickupAt: 'Prise en charge : {{address}}',
    checkedIn_one: 'Enregistré à {{time}} · {{count}} personne',
    checkedIn_other: 'Enregistré à {{time}} · {{count}} personnes',
    checkedInNoCode: 'Sans code à {{time}} · en attente de l’acheteur',
  },
  evidence: {
    title: 'Preuves du service',
    checkIn: 'Enregistrement : {{date}} · {{method}} · {{present}} sur {{total}} personnes',
    methods: { code: 'avec code', qr: 'par QR code', no_code: 'sans code' },
    noCheckIn: 'Pas d’enregistrement',
    arrival: '« Je suis arrivé » : {{date}}',
    noArrival: 'Pas de « Je suis arrivé »',
    map: 'Voir le lieu sur la carte',
    absence: 'Signalement d’absence : {{date}} · {{answer}}',
    answers: {
      was_there: 'le prestataire dit qu’il était sur place',
      admitted: 'le prestataire a reconnu son absence',
      none: 'sans réponse',
    },
    confirmation: 'Acheteur : {{answer}}',
    confirmationAnswers: {
      yes: 'le service a eu lieu',
      no: 'le service n’a pas eu lieu',
      none: 'sans réponse',
    },
    noShow: 'Absence marquée par le prestataire',
    pickup: 'Adresse de prise en charge : {{address}}',
    noCodeReason: 'Motif de l’enregistrement sans code : {{reason}}',
  },
  offerEditor: {
    pickupLegend: 'Où le service commence',
    meetingPoint: 'Au point de rendez-vous',
    buyerAddress: 'Aller chercher l’acheteur là où il est',
  },
};

=== src/ui/components/CodeBoxesInput.tsx — ARQUIVO NOVO, conteúdo completo ===
import { type ClipboardEvent, type KeyboardEvent, useRef } from 'react';
import { cn } from '../../shared/utils/cn';

interface CodeBoxesInputProps {
  /** Prefixo fixo da tela (ex.: `PASS`), só para leitura; não faz parte do valor. */
  prefix: string;
  length: number;
  /** Caracteres aceitos; o resto é recusado enquanto a pessoa digita. */
  alphabet: string;
  value: string;
  onChange: (value: string) => void;
  /** Chamado quando a última caixa é preenchida. */
  onComplete?: (value: string) => void;
  label: string;
  /** Rótulo de cada caixa para leitor de tela, ex.: "Caractere 1 de 6". */
  boxLabel: (index: number) => string;
  disabled?: boolean;
}

/** Código em caixas, como o de verificação de apps (D20): maiúsculas, avanço e colar inteiro. */
export function CodeBoxesInput({
  prefix,
  length,
  alphabet,
  value,
  onChange,
  onComplete,
  label,
  boxLabel,
  disabled,
}: CodeBoxesInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const chars = value.padEnd(length, ' ').slice(0, length).split('');

  const clean = (raw: string) =>
    raw
      .toUpperCase()
      .replace(new RegExp(`^${prefix}:`), '')
      .split('')
      .filter((char) => alphabet.includes(char))
      .join('');

  const update = (next: string, focusIndex: number) => {
    const trimmed = next.slice(0, length);
    onChange(trimmed);
    refs.current[Math.min(focusIndex, length - 1)]?.focus();
    if (trimmed.length === length) onComplete?.(trimmed);
  };

  const typeAt = (index: number, raw: string) => {
    const typed = clean(raw).slice(-1);
    if (!typed) return;
    const current = value.slice(0, index);
    update(`${current}${typed}${value.slice(index + 1)}`.trimEnd(), index + 1);
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !chars[index]?.trim() && index > 0) {
      event.preventDefault();
      update(value.slice(0, index - 1), index - 1);
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = clean(event.clipboardData.getData('text'));
    if (pasted) update(pasted, pasted.length);
  };

  return (
    <fieldset className="space-y-2 min-w-0 w-full" disabled={disabled}>
      <legend className="text-[13px] font-semibold text-ink/80">{label}</legend>
      <div className="flex items-center gap-1 sm:gap-2">
        <span
          className="font-display text-[15px] font-bold text-ink/70 shrink-0"
          aria-hidden="true"
        >
          {prefix}:
        </span>
        {chars.map((char, index) => (
          <input
            key={index}
            ref={(element) => {
              refs.current[index] = element;
            }}
            value={char.trim()}
            onChange={(event) => typeAt(index, event.target.value)}
            onKeyDown={(event) => onKeyDown(index, event)}
            onPaste={onPaste}
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="one-time-code"
            autoCorrect="off"
            spellCheck={false}
            maxLength={2}
            aria-label={boxLabel(index)}
            className={cn(
              // Caixas dividem a largura: 8 caixas cabem no celular de 360 px sem rolar para o lado.
              'flex-1 min-w-0 max-w-11 h-12 rounded-xl bg-surface border border-line text-center font-display text-lg font-bold text-ink uppercase',
              'focus-visible:ring-2 focus-visible:ring-teal-400/50 focus:border-accent-line outline-none'
            )}
          />
        ))}
      </div>
    </fieldset>
  );
}

=== src/ui/hooks/useQrScanner.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useRef, useState } from 'react';

type Detector = { detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>> };
type DetectorCtor = new (options: { formats: string[] }) => Detector;

export type QrScannerState = 'idle' | 'scanning' | 'unsupported' | 'denied';

/**
 * Leitura de QR pela câmera com o BarcodeDetector do navegador, sem biblioteca nova. Safari e
 * Firefox ainda não têm o leitor: aí o estado vira `unsupported` e a tela pede o código curto.
 * Referência: https://developer.mozilla.org/docs/Web/API/BarcodeDetector
 */
export function useQrScanner(onDetected: (value: string) => void) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const [state, setState] = useState<QrScannerState>('idle');

  const stop = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
    setState((current) => (current === 'scanning' ? 'idle' : current));
  }, []);

  const start = useCallback(async () => {
    const Ctor = (globalThis as { BarcodeDetector?: DetectorCtor }).BarcodeDetector;
    if (!Ctor || !navigator.mediaDevices?.getUserMedia) {
      setState('unsupported');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setState('scanning');
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      const detector = new Ctor({ formats: ['qr_code'] });
      const tick = async () => {
        if (!streamRef.current) return;
        const found = await detector.detect(video).catch(() => []);
        const value = found[0]?.rawValue;
        if (value) {
          stop();
          onDetected(value);
          return;
        }
        frameRef.current = requestAnimationFrame(() => void tick());
      };
      void tick();
    } catch {
      setState('denied');
    }
  }, [onDetected, stop]);

  useEffect(() => stop, [stop]);

  return { videoRef, state, start, stop };
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run src/app/compositions/AdminPanelComposition.tsx src/domain/bookings/adapters/httpBookingsAdapter.ts src/domain/bookings/adapters/localPendingCheckInsAdapter.ts src/domain/bookings/adapters/webCryptoEntryPassVerifier.ts src/domain/bookings/application/usecases/answerProviderAbsenceUseCase.ts src/domain/bookings/application/usecases/answerServiceConfirmationUseCase.ts src/domain/bookings/application/usecases/checkInByCodeUseCase.ts src/domain/bookings/application/usecases/checkInEntryUseCase.ts src/domain/bookings/application/usecases/checkInWithoutCodeUseCase.ts src/domain/bookings/application/usecases/getCheckInCodeUseCase.ts src/domain/bookings/application/usecases/getEntryPassUseCase.ts src/domain/bookings/application/usecases/getEntryVerificationKeysUseCase.ts src/domain/bookings/application/usecases/recordArrivalUseCase.ts src/domain/bookings/application/usecases/reportProviderAbsentUseCase.ts src/domain/bookings/components/admin/ServiceEvidenceList.tsx src/domain/bookings/components/buyer/BookingCheckInPass.tsx src/domain/bookings/components/buyer/BookingFlow.tsx src/domain/bookings/components/buyer/BookingPurchaseDetails.test.tsx src/domain/bookings/components/buyer/BookingPurchaseDetails.tsx src/domain/bookings/components/buyer/BookingServiceActions.tsx src/domain/bookings/components/buyer/BuyerBookingCard.tsx src/domain/bookings/components/buyer/EntryQrImage.tsx src/domain/bookings/components/partner/BookingServiceControls.tsx src/domain/bookings/components/partner/NoCodeCheckInDialog.tsx src/domain/bookings/components/partner/PartnerBookingsList.tsx src/domain/bookings/components/partner/PartnerOfferEditor.tsx src/domain/bookings/components/partner/PartnerOffersManager.tsx src/domain/bookings/components/partner/PartnerSlotsManager.tsx src/domain/bookings/components/partner/SlotCheckInSheet.tsx src/domain/bookings/hooks/useBookingCheckInPass.ts src/domain/bookings/hooks/useOfferBookings.ts src/domain/bookings/hooks/useSlotCheckIn.ts src/domain/bookings/index.ts src/domain/bookings/ports/bookingsApiPort.ts src/domain/bookings/schemas/offerFormSchema.ts src/domain/bookings/types/bookings.ts src/domain/bookings/utils/bookingErrorMessage.ts src/domain/bookings/utils/checkInPrefix.ts src/domain/bookings/utils/offerFormMapping.ts src/domain/bookings/utils/serviceProofTiming.ts src/domain/payment/components/admin/AdminFinanceQueues.tsx src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx src/domain/payment/components/admin/SaleClaimQueue.tsx src/domain/payment/components/receivables/payoutStatus.ts src/domain/payment/types/adminFinance.ts src/domain/payment/types/receivables.ts src/shared/i18n/bookingsResources.ts src/shared/i18n/receivablesResources.ts src/shared/i18n/resources.ts src/shared/i18n/serviceProofResources.ts src/ui/components/CodeBoxesInput.tsx src/ui/hooks/useQrScanner.ts` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
