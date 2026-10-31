# Prompt 21.5c — Telas por pessoa ou grupo, nomes opcionais e leitor zxing-wasm

> Lote 18, gerado dos commits de referência `a9a5dd2..bf8cd48` da branch `claude/agents-md-v2`. Aplique na ordem do lote (A7, 21.1 a 21.7d), um por vez. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 21.5c — Telas por pessoa ou grupo, nomes opcionais e leitor zxing-wasm

Telas aprovadas em 2026-10-30.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras de negócio estão nas decisões D20 e D21 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A7).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

PASSO 0 — dependência: rode `npm install zxing-wasm@2.2.4 --save-exact` (gera o package-lock.json; não edite o lockfile à mão).

O QUE MUDA:
1) Cliente: um código ou QR por pessoa (seletor de entradas) ou um por grupo; nome do estabelecimento no cartão; nome por entrada adicionado depois e trocado uma vez até 24 h antes.
2) Textos ao cliente sem falar de dinheiro antes da ação; "cliente" e "parceiro" nas telas do parceiro e do admin (pt-BR, en, fr).
3) Parceiro: check-in sem "pessoas presentes"; o resultado diz qual pessoa ou grupo entrou, com o nome, e avisa código já usado; "Cliente sem código" vale para a reserva.
4) Anúncio: venda por pessoa ou por grupo com tamanho máximo; checkout de grupo e nomes opcionais.
5) Leitor de QR com zxing-wasm 2.2.4 carregado sob demanda, com o .wasm servido do próprio domínio; CSP do server.ts com 'wasm-unsafe-eval'.

ARQUIVOS (crie, altere ou apague exatamente estes):
- package.json (alterar)
- server.ts (alterar)
- server/domain/bookings/services/bookingCheckInService.ts (alterar)
- server/domain/bookings/services/bookingEntryService.ts (alterar)
- server/interfaces/http/bookings/bookingResponses.ts (alterar)
- server/interfaces/http/bookings/bookingsController.test.ts (alterar)
- src/domain/bookings/adapters/httpBookingsAdapter.ts (alterar)
- src/domain/bookings/adapters/localPendingCheckInsAdapter.ts (alterar)
- src/domain/bookings/application/usecases/checkInByCodeUseCase.ts (alterar)
- src/domain/bookings/application/usecases/checkInEntryUseCase.ts (alterar)
- src/domain/bookings/application/usecases/checkInWithoutCodeUseCase.ts (alterar)
- src/domain/bookings/application/usecases/setParticipantNameUseCase.ts (criar)
- src/domain/bookings/components/admin/ServiceEvidenceList.tsx (alterar)
- src/domain/bookings/components/buyer/BookingCheckInPass.tsx (alterar)
- src/domain/bookings/components/buyer/BookingFlow.tsx (alterar)
- src/domain/bookings/components/buyer/BookingPurchaseDetails.test.tsx (alterar)
- src/domain/bookings/components/buyer/BookingServiceActions.tsx (alterar)
- src/domain/bookings/components/buyer/BuyerBookingCard.tsx (alterar)
- src/domain/bookings/components/buyer/ParticipantNameDialog.tsx (criar)
- src/domain/bookings/components/buyer/ParticipantsForm.tsx (alterar)
- src/domain/bookings/components/buyer/QuantitySelector.tsx (alterar)
- src/domain/bookings/components/buyer/UnitPicker.tsx (criar)
- src/domain/bookings/components/partner/BookingServiceControls.tsx (alterar)
- src/domain/bookings/components/partner/NoCodeCheckInDialog.tsx (alterar)
- src/domain/bookings/components/partner/OfferSellingUnitFields.tsx (criar)
- src/domain/bookings/components/partner/PartnerBookingsList.tsx (alterar)
- src/domain/bookings/components/partner/PartnerOfferEditor.tsx (alterar)
- src/domain/bookings/components/partner/SlotCheckInSheet.tsx (alterar)
- src/domain/bookings/hooks/useBookingCheckInPass.ts (alterar)
- src/domain/bookings/hooks/useOfferBookings.ts (alterar)
- src/domain/bookings/hooks/useSlotCheckIn.ts (alterar)
- src/domain/bookings/ports/bookingsApiPort.ts (alterar)
- src/domain/bookings/schemas/offerFormSchema.ts (alterar)
- src/domain/bookings/types/bookings.ts (alterar)
- src/domain/bookings/utils/bookingErrorMessage.ts (alterar)
- src/domain/bookings/utils/bookingsFrontendUtils.test.ts (alterar)
- src/domain/bookings/utils/offerFormMapping.ts (alterar)
- src/domain/bookings/utils/serviceProofTiming.ts (alterar)
- src/domain/bookings/utils/unitLabel.ts (criar)
- src/shared/i18n/bookingsResources.ts (alterar)
- src/shared/i18n/serviceProofResources.ts (alterar)
- src/ui/hooks/useQrScanner.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== package.json — diff ===
@@ -67,7 +67,8 @@
     "tailwindcss": "^4.3.3",
     "vite": "^8.3.2",
     "zod": "^4.6.5",
-    "zustand": "^5.0.15"
+    "zustand": "^5.0.15",
+    "zxing-wasm": "2.2.4"
   },
   "devDependencies": {
     "@biomejs/biome": "^2.5.15",

=== server.ts — diff ===
@@ -65,6 +65,8 @@ async function startServer() {
             scriptSrc: [
               "'self'",
               "'unsafe-inline'",
+              // Leitor de QR da portaria (zxing-wasm, D20): compila o .wasm servido do próprio domínio.
+              "'wasm-unsafe-eval'",
               'https://apis.google.com',
               'https://*.firebaseapp.com',
               'https://js.stripe.com',

=== server/domain/bookings/services/bookingCheckInService.ts — diff ===
@@ -27,6 +27,8 @@ export interface UnitCode {
   code: string | null;
   /** Nome da pessoa, quando a oferta pede nomes (D20). */
   name: string | null;
+  /** O nome só pode ser trocado uma vez (D20). */
+  nameChanged: boolean;
   checkedInAt: string | null;
 }
 
@@ -88,6 +90,7 @@ export class BookingCheckInService {
         unit,
         code: open && !used.has(unit) ? deriveCheckInCode(booking.id, undefined, unit) : null,
         name: participants[unit]?.name || null,
+        nameChanged: Boolean(participants[unit]?.nameChangedAt),
         checkedInAt: used.get(unit) ?? null,
       })),
       visibleFrom: new Date(visibleFromMs).toISOString(),

=== server/domain/bookings/services/bookingEntryService.ts — diff ===
@@ -36,6 +36,8 @@ export interface EntryPass {
   code: string | null;
   /** Nome da pessoa na entrada nominal (D20). */
   name: string | null;
+  /** O nome só pode ser trocado uma vez (D20). */
+  nameChanged: boolean;
   checkedInAt: string | null;
 }
 
@@ -88,6 +90,7 @@ export class BookingEntryService {
           qrToken: visible ? this.sign(booking, slot, unit, name, closesAtMs) : null,
           code: visible ? deriveCheckInCode(booking.id, ENTRY_CODE_LENGTH, unit) : null,
           name,
+          nameChanged: Boolean(participants[unit]?.nameChangedAt),
           checkedInAt: used.get(unit) ?? null,
         };
       }),

=== server/interfaces/http/bookings/bookingResponses.ts — diff ===
@@ -46,6 +46,7 @@ export function toBuyerBooking(booking: Booking) {
     businessName: booking.offerSnapshot.businessName ?? null,
     sellingUnit: booking.offerSnapshot.sellingUnit ?? 'person',
     groupMaxPeople: booking.offerSnapshot.groupMaxPeople ?? null,
+    requiresParticipantNames: booking.offerSnapshot.requiresParticipantNames ?? false,
     arrivedAt: booking.arrival?.at ?? null,
     providerAbsence: booking.providerAbsence
       ? {

=== server/interfaces/http/bookings/bookingsController.test.ts — diff ===
@@ -203,7 +203,7 @@ describe('BookingsController', () => {
 
   it('código de check-in sai sem cache e só com os campos da visão (D20)', async () => {
     vi.mocked(getBookingCheckInCodeUseCase).mockResolvedValue({
-      codes: [{ unit: 0, code: 'K7M4QX', name: null, checkedInAt: null }],
+      codes: [{ unit: 0, code: 'K7M4QX', name: null, nameChanged: false, checkedInAt: null }],
       visibleFrom: '2026-11-10T03:00:00.000Z',
       validUntil: '2026-11-11T01:00:00.000Z',
     });

=== src/domain/bookings/adapters/httpBookingsAdapter.ts — diff ===
@@ -9,6 +9,7 @@ import type {
   CodeCheckInPayload,
   EntryCheckInPayload,
   EntryPassView,
+  UnitCheckInResult,
   NoCodeReason,
   CreateBookingPayload,
   CreateBookingResponse,
@@ -38,7 +39,7 @@ async function call<T>(
   return data as T;
 }
 
-function json(method: 'POST' | 'PATCH', body: unknown): RequestInit {
+function json(method: 'POST' | 'PUT' | 'PATCH', body: unknown): RequestInit {
   return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
 }
 
@@ -160,7 +161,7 @@ export class HttpBookingsAdapter implements BookingsApiPort {
     offerId: string,
     slotId: string,
     payload: CodeCheckInPayload
-  ): Promise<BookingSummary> {
+  ): Promise<UnitCheckInResult> {
     return call(`${slotPath(offerId, slotId)}/check-ins`, json('POST', payload));
   }
 
@@ -168,7 +169,7 @@ export class HttpBookingsAdapter implements BookingsApiPort {
     offerId: string,
     slotId: string,
     payload: EntryCheckInPayload
-  ): Promise<BookingSummary> {
+  ): Promise<UnitCheckInResult> {
     return call(`${slotPath(offerId, slotId)}/entry-check-ins`, json('POST', payload));
   }
 
@@ -196,7 +197,7 @@ export class HttpBookingsAdapter implements BookingsApiPort {
   async checkInWithoutCode(
     offerId: string,
     bookingId: string,
-    payload: { participantsPresent: number; reason: NoCodeReason }
+    payload: { reason: NoCodeReason }
   ): Promise<BookingSummary> {
     return call(
       `${offerBookingPath(offerId, bookingId)}/check-in-without-code`,
@@ -204,6 +205,14 @@ export class HttpBookingsAdapter implements BookingsApiPort {
     );
   }
 
+  async setParticipantName(
+    bookingId: string,
+    unit: number,
+    name: string
+  ): Promise<{ unit: number; name: string; changed: boolean }> {
+    return call(`${bookingPath(bookingId)}/participants/${unit}`, json('PUT', { name }));
+  }
+
   async answerProviderAbsence(
     offerId: string,
     bookingId: string,

=== src/domain/bookings/adapters/localPendingCheckInsAdapter.ts — diff ===
@@ -5,7 +5,7 @@ export interface PendingCheckIn {
   slotId: string;
   kind: 'code' | 'entry';
   /** O QR lido ou o código digitado, com a hora do aparelho. */
-  payload: { code?: string; qrToken?: string; participantsPresent: number; capturedAt: string };
+  payload: { code?: string; qrToken?: string; capturedAt: string };
 }
 
 const KEY = 'useguide.pendingCheckIns';

=== src/domain/bookings/application/usecases/checkInByCodeUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { bookingsApi } from '../../factory';
import type { UnitCheckInResult, CodeCheckInPayload } from '../../types/bookings';

export async function checkInByCodeUseCase(
  offerId: string,
  slotId: string,
  payload: CodeCheckInPayload
): Promise<UnitCheckInResult> {
  return bookingsApi.checkInByCode(offerId, slotId, payload);
}

=== src/domain/bookings/application/usecases/checkInEntryUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { bookingsApi } from '../../factory';
import type { UnitCheckInResult, EntryCheckInPayload } from '../../types/bookings';

export async function checkInEntryUseCase(
  offerId: string,
  slotId: string,
  payload: EntryCheckInPayload
): Promise<UnitCheckInResult> {
  return bookingsApi.checkInEntry(offerId, slotId, payload);
}

=== src/domain/bookings/application/usecases/checkInWithoutCodeUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { bookingsApi } from '../../factory';
import type { BookingSummary, NoCodeReason } from '../../types/bookings';

export async function checkInWithoutCodeUseCase(
  offerId: string,
  bookingId: string,
  payload: { reason: NoCodeReason }
): Promise<BookingSummary> {
  return bookingsApi.checkInWithoutCode(offerId, bookingId, payload);
}

=== src/domain/bookings/application/usecases/setParticipantNameUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { bookingsApi } from '../../factory';

export async function setParticipantNameUseCase(
  bookingId: string,
  unit: number,
  name: string
): Promise<{ unit: number; name: string; changed: boolean }> {
  return bookingsApi.setParticipantName(bookingId, unit, name);
}

=== src/domain/bookings/components/admin/ServiceEvidenceList.tsx — diff ===
@@ -8,8 +8,9 @@ export interface BookingServiceEvidence {
   checkIn: {
     at: string;
     method: 'code' | 'qr' | 'no_code';
-    participantsPresent: number;
-    participantsCount: number;
+    /** Unidades (pessoas ou grupos) com check-in, de quantas foram vendidas (D20). */
+    used: number;
+    total: number;
     noCodeReason: 'no_phone' | 'refused' | 'other' | null;
   } | null;
   arrival: { at: string; location: { lat: number; lng: number; accuracyM?: number } | null } | null;
@@ -41,8 +42,8 @@ export function ServiceEvidenceList({ evidence }: { evidence: BookingServiceEvid
       ? t('serviceProof.evidence.checkIn', {
           date: date(checkIn.at),
           method: t(`serviceProof.evidence.methods.${checkIn.method}`),
-          present: checkIn.participantsPresent,
-          total: checkIn.participantsCount,
+          used: checkIn.used,
+          total: checkIn.total,
         })
       : t('serviceProof.evidence.noCheckIn')
   );

=== src/domain/bookings/components/buyer/BookingCheckInPass.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { TextButton } from '../../../../ui/components/TextButton';
import { useBookingCheckInPass } from '../../hooks/useBookingCheckInPass';
import type { BookingSummary } from '../../types/bookings';
import { checkInPrefix } from '../../utils/checkInPrefix';
import { canEditUnitName, unitLabel } from '../../utils/unitLabel';
import { EntryQrImage } from './EntryQrImage';
import { ParticipantNameDialog } from './ParticipantNameDialog';
import { UnitPicker } from './UnitPicker';

/**
 * Código de check-in ou entrada de cada pessoa ou grupo da reserva (D20). O código só existe no
 * dia do serviço e é dito pessoalmente; o aviso contra golpe fica sempre junto.
 */
export function BookingCheckInPass({ booking }: { booking: BookingSummary }) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, reload, saveName } = useBookingCheckInPass(booking, true);
  const [selected, setSelected] = useState(0);
  const [editing, setEditing] = useState(false);
  const entry = booking.kind === 'private_entry';
  const date = (iso: string) => formatBusinessDateTime(iso, i18n.language);

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
  const pass = data?.passes.find((item) => item.unit === selected) ?? data?.passes[0];
  if (!data || !pass) return null;
  const total = data.passes.length;
  const label = unitLabel(t, booking, pass.unit, pass.name);
  const editable = canEditUnitName(booking, pass, new Date());

  return (
    <div className="space-y-3">
      {total > 1 && (
        <UnitPicker
          units={data.passes.map((item) => ({
            unit: item.unit,
            label: unitLabel(t, booking, item.unit, item.name),
            used: Boolean(item.checkedInAt),
          }))}
          selected={pass.unit}
          onSelect={setSelected}
        />
      )}
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[13px] font-semibold text-ink/80">
          {t(entry ? 'serviceProof.pass.entryTitle' : 'serviceProof.pass.codeTitle')}
          {total > 1 && ` · ${t('serviceProof.pass.unitOf', { n: pass.unit + 1, total })}`}
        </p>
        {booking.sellingUnit === 'group' && booking.groupMaxPeople && (
          <p className="text-[12px] text-ink/70">
            {t('serviceProof.units.group', { max: booking.groupMaxPeople })}
          </p>
        )}
      </div>

      {booking.requiresParticipantNames && (
        <div className="flex items-center justify-between gap-2 min-h-11">
          <p className="text-[15px] font-semibold text-ink truncate">{label}</p>
          {editable ? (
            <TextButton tone="accent" onClick={() => setEditing(true)}>
              {t(pass.name ? 'serviceProof.pass.changeName' : 'serviceProof.pass.addName')}
            </TextButton>
          ) : (
            pass.nameChanged && (
              <span className="text-[12px] text-ink/70">{t('serviceProof.pass.nameLocked')}</span>
            )
          )}
        </div>
      )}

      {pass.checkedInAt ? (
        <p className="text-[13px] text-success">
          {t('serviceProof.pass.checkedIn', { date: date(pass.checkedInAt) })}
        </p>
      ) : !pass.code ? (
        <p className="text-[13px] text-ink/70">
          {t('serviceProof.pass.notYet', { date: date(data.visibleFrom) })}
        </p>
      ) : (
        <>
          {entry && pass.qrToken && (
            <EntryQrImage value={pass.qrToken} alt={t('serviceProof.pass.qrAlt')} />
          )}
          <p
            className="text-center font-display text-[28px] font-bold tracking-[0.14em] tabular-nums text-ink select-all break-all"
            aria-label={t('serviceProof.pass.copyLabel', { code: pass.code.split('').join(' ') })}
          >
            {checkInPrefix(booking.kind)}:{pass.code}
          </p>
          <p className="text-[13px] text-ink/70 text-center">
            {t(entry ? 'serviceProof.pass.entryHint' : 'serviceProof.pass.codeHint')}
          </p>
          <p className="flex items-start gap-2 text-[13px] text-warn">
            <ShieldAlert size={16} className="shrink-0 mt-px" aria-hidden="true" />
            {t('serviceProof.pass.warning')}
          </p>
        </>
      )}

      {editing && (
        <ParticipantNameDialog
          initialName={pass.name ?? ''}
          onClose={() => setEditing(false)}
          onSave={(name) => saveName(pass.unit, name)}
        />
      )}
    </div>
  );
}

=== src/domain/bookings/components/buyer/BookingFlow.tsx — diff ===
@@ -37,6 +37,7 @@ export function BookingFlow({
   const [termsAccepted, setTermsAccepted] = useState(false);
   const [pickupAddress, setPickupAddress] = useState('');
   const needsPickup = offer.pickupMode === 'buyer_address';
+  const group = offer.sellingUnit === 'group';
   const pickupReady = !needsPickup || pickupAddress.trim().length >= 3;
   const participants = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
   const maxParticipants = Math.min(offer.maxParticipantsPerBooking, slot?.available ?? 0);
@@ -60,7 +61,8 @@ export function BookingFlow({
       onRequireLogin();
       return;
     }
-    setStep(offer.requiresParticipantNames ? 'participants' : 'checkout');
+    // Grupo não tem nome por pessoa: o cliente decide quem leva (D20).
+    setStep(offer.requiresParticipantNames && !group ? 'participants' : 'checkout');
   };
 
   const restart = () => {
@@ -115,6 +117,7 @@ export function BookingFlow({
           maxParticipants={maxParticipants}
           value={quantities}
           onChange={setQuantities}
+          groupMaxPeople={group ? offer.groupMaxPeople : undefined}
         />
       )}
       {slot && participants > 0 && needsPickup && (
@@ -132,13 +135,13 @@ export function BookingFlow({
             aria-describedby={`${pickupId}-hint`}
             className={INPUT}
           />
-          <p id={`${pickupId}-hint`} className="text-[12px] text-ink/60">
+          <p id={`${pickupId}-hint`} className="text-[12px] text-ink/70">
             {t('serviceProof.checkout.pickupHint')}
           </p>
         </div>
       )}
       {slot && participants > 0 && !isAuthenticated && (
-        <p className="text-xs text-white/70">{t('bookings.buyer.loginRequired')}</p>
+        <p className="text-xs text-ink/70">{t('bookings.buyer.loginRequired')}</p>
       )}
       {slot && participants > 0 && (
         <TermsAcceptanceField

=== src/domain/bookings/components/buyer/BookingPurchaseDetails.test.tsx — diff ===
@@ -30,7 +30,11 @@ function booking(overrides: Partial<BookingSummary> = {}): BookingSummary {
     cancellation: null,
     rescheduledAt: null,
     pickupAddress: null,
-    checkIn: null,
+    checkIns: [],
+    businessName: null,
+    sellingUnit: 'person',
+    groupMaxPeople: null,
+    requiresParticipantNames: false,
     arrivedAt: null,
     providerAbsence: null,
     serviceConfirmation: null,

=== src/domain/bookings/components/buyer/BookingServiceActions.tsx — diff ===
@@ -35,6 +35,7 @@ export function BookingServiceActions({
   const [sending, setSending] = useState(false);
   const now = new Date();
   const date = (iso: string) => formatBusinessDateTime(iso, i18n.language);
+  const business = booking.businessName || t('serviceProof.buyer.businessFallback');
 
   const run = async (action: () => Promise<unknown>, success: string) => {
     setSending(true);
@@ -51,8 +52,8 @@ export function BookingServiceActions({
 
   const askAbsent = () =>
     setConfirm({
-      title: t('serviceProof.buyer.providerAbsentTitle'),
-      message: t('serviceProof.buyer.providerAbsentMessage'),
+      title: t('serviceProof.buyer.providerAbsentTitle', { business }),
+      message: t('serviceProof.buyer.providerAbsentMessage', { business }),
       confirmLabel: t('serviceProof.buyer.providerAbsentConfirm'),
       cancelLabel: t('serviceProof.buyer.keep'),
       tone: 'danger',
@@ -62,6 +63,7 @@ export function BookingServiceActions({
         void run(
           () => reportProviderAbsentUseCase(booking.id),
           t('serviceProof.buyer.absenceSent', {
+            business,
             date: date(new Date(Date.now() + 2 * 3_600_000).toISOString()),
           })
         );
@@ -70,12 +72,11 @@ export function BookingServiceActions({
 
   const askNo = () => {
     // Sem registro do serviço o reembolso é na hora; depois do "Cliente sem código", vai ao admin.
-    const refundNow = !booking.checkIn;
+    // A pergunta não fala de dinheiro (D20, textos neutros): só o resultado, depois da resposta.
+    const refundNow = booking.checkIns.length === 0;
     setConfirm({
       title: t('serviceProof.buyer.noTitle'),
-      message: t(
-        refundNow ? 'serviceProof.buyer.noMessageRefund' : 'serviceProof.buyer.noMessageReview'
-      ),
+      message: t('serviceProof.buyer.noMessage'),
       confirmLabel: t('serviceProof.buyer.noConfirm'),
       cancelLabel: t('serviceProof.buyer.keep'),
       tone: 'danger',
@@ -136,14 +137,14 @@ export function BookingServiceActions({
             : 'absenceSent';
     content = (
       <StatusText tone={absence.resolution === 'refunded' ? 'success' : 'warn'}>
-        {t(`serviceProof.buyer.${key}`, { date: date(absence.respondBy) })}
+        {t(`serviceProof.buyer.${key}`, { business, date: date(absence.respondBy) })}
       </StatusText>
     );
   } else if (canReportProviderAbsent(booking, now)) {
     content = (
       <div className="flex justify-center">
         <TextButton tone="danger" disabled={sending} onClick={askAbsent}>
-          {t('serviceProof.buyer.providerAbsent')}
+          {t('serviceProof.buyer.providerAbsent', { business })}
         </TextButton>
       </div>
     );

=== src/domain/bookings/components/buyer/BuyerBookingCard.tsx — diff ===
@@ -66,10 +66,15 @@ export function BuyerBookingCard({
           <p className="text-[15px] font-semibold text-ink leading-snug break-words">
             {booking.offer.title}
           </p>
+          {booking.businessName && (
+            <p className="text-[13px] text-ink/70 truncate">{booking.businessName}</p>
+          )}
           <p className="text-sm text-ink/70 mt-0.5">
             {upcoming
               ? `${formatSlotDateTime(booking.offer.startsAt, i18n.language)} · ${t(
-                  'bookings.bookingsList.participants',
+                  booking.sellingUnit === 'group'
+                    ? 'serviceProof.units.groups'
+                    : 'bookings.bookingsList.participants',
                   { count: booking.participantsCount }
                 )}`
               : `${formatBusinessWeekday(booking.offer.startsAt, i18n.language)} · ${price}`}
@@ -84,9 +89,9 @@ export function BuyerBookingCard({
           })}
         </p>
       )}
-      {/* Código ou entrada da reserva paga, até o check-in, também durante o serviço (D20). */}
+      {/* Códigos ou entradas da reserva paga, até o check-in de todas, também durante o serviço (D20). */}
       {booking.status === 'confirmed' &&
-        !booking.checkIn &&
+        booking.checkIns.length < booking.participantsCount &&
         (upcoming ||
           fortalezaDateKey(booking.offer.startsAt) ===
             fortalezaDateKey(new Date().toISOString())) && (

=== src/domain/bookings/components/buyer/ParticipantNameDialog.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { BUTTON_PRIMARY, INPUT } from '../../../../ui/styles/controls';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';

/** Nome de uma entrada nominal (D20); o servidor confere a regra de troca única. */
export function ParticipantNameDialog({
  initialName,
  onClose,
  onSave,
}: {
  initialName: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const id = useId();
  const [name, setName] = useState(initialName);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmed = name.trim();

  const save = async () => {
    setSending(true);
    setError(null);
    try {
      await onSave(trimmed);
      onClose();
    } catch (err: unknown) {
      setError(getBookingErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t('serviceProof.pass.nameTitle')}
      description={t('serviceProof.pass.nameHint')}
    >
      <form
        className="space-y-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <div className="space-y-1.5">
          <label htmlFor={id} className="text-[13px] font-semibold text-ink/80">
            {t('serviceProof.pass.nameLabel')}
          </label>
          <input
            id={id}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            autoComplete="name"
            className={INPUT}
          />
        </div>
        {error && (
          <p role="alert" className="text-[13px] text-danger">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={sending || trimmed.length < 2 || trimmed === initialName}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {t('serviceProof.pass.nameSave')}
        </button>
      </form>
    </Dialog>
  );
}

=== src/domain/bookings/components/buyer/ParticipantsForm.tsx — diff ===
@@ -3,10 +3,12 @@ import { useMemo } from 'react';
 import { useForm } from 'react-hook-form';
 import { useTranslation } from 'react-i18next';
 import { participantsFormSchema } from '../../schemas/participantsFormSchema';
+import { TextButton } from '../../../../ui/components/TextButton';
 import { BUTTON_PRIMARY, INPUT } from '../../../../ui/styles/controls';
 
 interface ParticipantsFormProps {
   count: number;
+  /** Lista vazia: o cliente informa os nomes depois, em Compras (D20). */
   onSubmit: (names: string[]) => void;
 }
 
@@ -29,26 +31,32 @@ export function ParticipantsForm({ count, onSubmit }: ParticipantsFormProps) {
       noValidate
     >
       <fieldset className="space-y-2">
-        <legend className="text-xs font-semibold text-white/70">
+        <legend className="text-xs font-semibold text-ink/70">
           {t('bookings.buyer.participantsLegend')}
         </legend>
         {Array.from({ length: count }, (_, index) => (
           <label key={index} className="block space-y-1">
-            <span className="text-xs text-white/70">
+            <span className="text-xs text-ink/70">
               {t('bookings.buyer.participantName', { index: index + 1 })}
             </span>
             <input {...register(`names.${index}`)} autoComplete="name" className={INPUT} />
             {errors.names?.[index]?.message && (
-              <span role="alert" className="text-xs text-red-300">
+              <span role="alert" className="text-xs text-danger">
                 {t(errors.names[index]?.message ?? '')}
               </span>
             )}
           </label>
         ))}
       </fieldset>
-      <button type="submit" className={BUTTON_PRIMARY}>
-        {t('bookings.buyer.continue')}
-      </button>
+      <p className="text-xs text-ink/70">{t('serviceProof.checkout.namesHint')}</p>
+      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
+        <button type="submit" className={BUTTON_PRIMARY}>
+          {t('bookings.buyer.continue')}
+        </button>
+        <TextButton tone="ink" onClick={() => onSubmit([])}>
+          {t('serviceProof.checkout.namesLater')}
+        </TextButton>
+      </div>
     </form>
   );
 }

=== src/domain/bookings/components/buyer/QuantitySelector.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
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
  /** Venda por grupo (D20): cada unidade é um grupo de até este número de pessoas. */
  groupMaxPeople?: number;
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
  groupMaxPeople,
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
      <legend className="text-xs font-semibold text-ink/70">
        {t(groupMaxPeople ? 'serviceProof.checkout.groupLegend' : 'bookings.buyer.quantityLegend')}
      </legend>
      {groupMaxPeople && (
        <p className="text-xs text-ink/70">
          {t('serviceProof.checkout.groupNote', { max: groupMaxPeople })}
        </p>
      )}
      {options.map((option) => {
        const quantity = value[option.id] ?? 0;
        const label = labelOf(option, i18n.language);
        const canIncrease =
          total < maxParticipants &&
          (option.maxQuantity === undefined || quantity < option.maxQuantity);
        return (
          <div
            key={option.id}
            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-line"
          >
            <div>
              <p className="text-sm font-semibold text-ink">{label}</p>
              <p className="text-xs text-ink/70">
                {formatMinor(option.unitAmountMinor, i18n.language)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={t('bookings.buyer.decrease', { label })}
                disabled={quantity === 0}
                onClick={() => onChange({ ...value, [option.id]: quantity - 1 })}
                className="w-11 h-11 rounded-xl bg-ink/[0.06] text-ink flex items-center justify-center disabled:opacity-40 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <Minus size={16} aria-hidden="true" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-ink" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                aria-label={t('bookings.buyer.increase', { label })}
                disabled={!canIncrease}
                onClick={() => onChange({ ...value, [option.id]: quantity + 1 })}
                className="w-11 h-11 rounded-xl bg-ink/[0.06] text-ink flex items-center justify-center disabled:opacity-40 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        );
      })}
      {!groupMaxPeople && (
        <p className="text-xs text-ink/70">
          {t('bookings.buyer.maxParticipants', { count: maxParticipants })}
        </p>
      )}
      <p className="flex justify-between text-sm font-bold text-ink">
        <span>{t('bookings.buyer.totalLabel')}</span>
        <span>{formatMinor(totalMinor, i18n.language)}</span>
      </p>
    </fieldset>
  );
}

=== src/domain/bookings/components/buyer/UnitPicker.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';

/** Escolha da entrada quando a reserva tem mais de uma, como cartões de embarque (D20). */
export function UnitPicker({
  units,
  selected,
  onSelect,
}: {
  units: Array<{ unit: number; label: string; used: boolean }>;
  selected: number;
  onSelect: (unit: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="group"
      aria-label={t('serviceProof.pass.unitsLabel')}
      className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
    >
      {units.map((item) => (
        <button
          key={item.unit}
          type="button"
          aria-pressed={item.unit === selected}
          onClick={() => onSelect(item.unit)}
          className={cn(
            'press shrink-0 inline-flex items-center gap-1.5 min-h-11 max-w-[12rem] px-4 rounded-full text-sm font-semibold focus-visible:ring-2 focus-visible:ring-teal-400/50',
            item.unit === selected ? 'bg-ink text-app' : 'bg-ink/[0.06] text-ink/80'
          )}
        >
          {item.used && <Check size={14} className="shrink-0" aria-hidden="true" />}
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

=== src/domain/bookings/components/partner/BookingServiceControls.tsx — diff ===
@@ -16,7 +16,7 @@ import { NoCodeCheckInDialog } from './NoCodeCheckInDialog';
 export interface ServiceControlActions {
   recordArrival: (bookingId: string) => Promise<boolean>;
   markNoShow: (bookingId: string) => Promise<void>;
-  checkInWithoutCode: (bookingId: string, present: number, reason: NoCodeReason) => Promise<void>;
+  checkInWithoutCode: (bookingId: string, reason: NoCodeReason) => Promise<void>;
   answerAbsence: (bookingId: string, answer: 'was_there' | 'admitted') => Promise<void>;
 }
 
@@ -47,15 +47,20 @@ export function BookingServiceControls({
     }
   };
 
-  if (booking.checkIn) {
+  const [first] = booking.checkIns;
+  if (first) {
+    const total = booking.participantsCount;
     return (
-      <StatusText tone={booking.checkIn.method === 'no_code' ? 'warn' : 'success'}>
-        {booking.checkIn.method === 'no_code'
-          ? t('serviceProof.partner.checkedInNoCode', { time: time(booking.checkIn.at) })
-          : t('serviceProof.partner.checkedIn', {
-              time: time(booking.checkIn.at),
-              count: booking.checkIn.participantsPresent,
-            })}
+      <StatusText tone={first.method === 'no_code' ? 'warn' : 'success'}>
+        {first.method === 'no_code'
+          ? t('serviceProof.partner.checkedInNoCode', { time: time(first.at) })
+          : total > 1
+            ? t('serviceProof.partner.checkedInUnits', {
+                time: time(first.at),
+                used: booking.checkIns.length,
+                total,
+              })
+            : t('serviceProof.partner.checkedIn', { time: time(first.at) })}
       </StatusText>
     );
   }
@@ -151,10 +156,9 @@ export function BookingServiceControls({
       </div>
       {noCode && (
         <NoCodeCheckInDialog
-          booking={booking}
           onClose={() => setNoCode(false)}
-          onConfirm={async (present, reason) => {
-            await run(() => actions.checkInWithoutCode(booking.id, present, reason));
+          onConfirm={async (reason) => {
+            await run(() => actions.checkInWithoutCode(booking.id, reason));
             setNoCode(false);
           }}
         />

=== src/domain/bookings/components/partner/NoCodeCheckInDialog.tsx — diff ===
@@ -3,19 +3,17 @@ import { useTranslation } from 'react-i18next';
 import { Dialog } from '../../../../ui/components/Dialog';
 import { RadioCardGroup } from '../../../../ui/components/RadioCardGroup';
 import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
-import type { BookingSummary, NoCodeReason } from '../../types/bookings';
+import type { NoCodeReason } from '../../types/bookings';
 
 const REASONS: NoCodeReason[] = ['no_phone', 'refused', 'other'];
 
-/** "Cliente sem código": por conta e risco do prestador, até o comprador confirmar (D20). */
+/** "Cliente sem código": vale para toda a reserva, por conta e risco do parceiro, até o cliente confirmar (D20). */
 export function NoCodeCheckInDialog({
-  booking,
   onClose,
   onConfirm,
 }: {
-  booking: BookingSummary;
   onClose: () => void;
-  onConfirm: (participantsPresent: number, reason: NoCodeReason) => Promise<void>;
+  onConfirm: (reason: NoCodeReason) => Promise<void>;
 }) {
   const { t } = useTranslation();
   const [reason, setReason] = useState<NoCodeReason>('no_phone');
@@ -24,7 +22,7 @@ export function NoCodeCheckInDialog({
   const confirm = async () => {
     setSending(true);
     try {
-      await onConfirm(booking.participantsCount, reason);
+      await onConfirm(reason);
     } finally {
       setSending(false);
     }

=== src/domain/bookings/components/partner/OfferSellingUnitFields.tsx — ARQUIVO NOVO, conteúdo completo ===
import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormRegister,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { RadioCardGroup } from '../../../../ui/components/RadioCardGroup';
import { INPUT } from '../../../../ui/styles/controls';
import type { OfferFormInput } from '../../schemas/offerFormSchema';

/** Venda por pessoa ou por grupo e nome por entrada (D20). Entrada de atração é sempre por pessoa. */
export function OfferSellingUnitFields({
  kind,
  control,
  register,
  errors,
}: {
  kind: OfferFormInput['kind'];
  control: Control<OfferFormInput>;
  register: UseFormRegister<OfferFormInput>;
  errors: FieldErrors<OfferFormInput>;
}) {
  const { t } = useTranslation();
  const unit = useWatch({ control, name: 'sellingUnit' });
  const group = kind === 'tour' && unit === 'group';

  return (
    <div className="space-y-3">
      {kind === 'tour' && (
        <Controller
          control={control}
          name="sellingUnit"
          render={({ field }) => (
            <RadioCardGroup
              name={field.name}
              legend={t('serviceProof.offerEditor.sellingUnitLegend')}
              options={[
                {
                  value: 'person',
                  title: t('serviceProof.offerEditor.perPerson'),
                  description: t('serviceProof.offerEditor.perPersonHint'),
                },
                {
                  value: 'group',
                  title: t('serviceProof.offerEditor.perGroup'),
                  description: t('serviceProof.offerEditor.perGroupHint'),
                },
              ]}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      )}
      {group ? (
        <label className="block space-y-1">
          <span className="text-xs text-ink/70">{t('serviceProof.offerEditor.groupMaxLabel')}</span>
          <input
            type="number"
            inputMode="numeric"
            {...register('groupMaxPeople')}
            className={INPUT}
          />
          {errors.groupMaxPeople?.message && (
            <span role="alert" className="text-xs text-danger">
              {t(errors.groupMaxPeople.message)}
            </span>
          )}
        </label>
      ) : (
        <label className="flex items-start gap-3 min-h-11">
          <input
            type="checkbox"
            {...register('requiresParticipantNames')}
            className="w-5 h-5 mt-0.5 accent-teal-400"
          />
          <span className="space-y-0.5">
            <span className="block text-sm text-ink/80">
              {t('bookings.editor.requireNamesLabel')}
            </span>
            <span className="block text-xs text-ink/70">
              {t('serviceProof.offerEditor.requireNamesHint')}
            </span>
          </span>
        </label>
      )}
    </div>
  );
}

=== src/domain/bookings/components/partner/PartnerBookingsList.tsx — diff ===
@@ -51,7 +51,7 @@ export function PartnerBookingsList({ offerId }: { offerId: string }) {
                   {t('serviceProof.partner.pickupAt', { address: booking.pickupAddress })}
                 </p>
               )}
-              {(serviceDay || booking.checkIn) && (
+              {(serviceDay || booking.checkIns.length > 0) && (
                 <BookingServiceControls booking={booking} actions={bookings} onNotice={setNotice} />
               )}
             </li>

=== src/domain/bookings/components/partner/PartnerOfferEditor.tsx — diff ===
@@ -14,6 +14,7 @@ import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
 import { offerFormToFields } from '../../utils/offerFormMapping';
 import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT } from '../../../../ui/styles/controls';
 import { OfferPriceFields } from './OfferPriceFields';
+import { OfferSellingUnitFields } from './OfferSellingUnitFields';
 import { OfferTextFields } from './OfferTextFields';
 
 interface PartnerOfferEditorProps {
@@ -57,10 +58,10 @@ export function PartnerOfferEditor({
 
   const numberField = (name: 'durationMinutes' | 'maxParticipantsPerBooking', label: string) => (
     <label className="block space-y-1">
-      <span className="text-xs text-white/70">{label}</span>
+      <span className="text-xs text-ink/70">{label}</span>
       <input type="number" inputMode="numeric" {...register(name)} className={INPUT} />
       {errors[name]?.message && (
-        <span role="alert" className="text-xs text-red-300">
+        <span role="alert" className="text-xs text-danger">
           {t(errors[name]?.message ?? '')}
         </span>
       )}
@@ -69,7 +70,7 @@ export function PartnerOfferEditor({
 
   return (
     <form onSubmit={submit} className="space-y-5" noValidate>
-      <h3 className="text-base font-bold text-white">
+      <h3 className="text-base font-bold text-ink">
         {mode === 'create' ? t('bookings.editor.titleNew') : t('bookings.editor.titleEdit')}
       </h3>
       <OfferTextFields register={register} errors={errors} />
@@ -79,7 +80,7 @@ export function PartnerOfferEditor({
         {numberField('maxParticipantsPerBooking', t('bookings.editor.maxParticipantsLabel'))}
       </div>
       <label className="block space-y-1">
-        <span className="text-xs text-white/70">{t('bookings.editor.meetingPointLabel')}</span>
+        <span className="text-xs text-ink/70">{t('bookings.editor.meetingPointLabel')}</span>
         <input {...register('meetingPoint')} className={INPUT} />
       </label>
       {defaultValues.kind === 'tour' && (
@@ -115,16 +116,14 @@ export function PartnerOfferEditor({
         )}
       />
       <p className="text-xs text-ink/70">{t('salesPolicy.withdrawalNoFee')}</p>
-      <label className="flex items-center gap-3 min-h-11">
-        <input
-          type="checkbox"
-          {...register('requiresParticipantNames')}
-          className="w-5 h-5 accent-teal-400"
-        />
-        <span className="text-sm text-white/80">{t('bookings.editor.requireNamesLabel')}</span>
-      </label>
+      <OfferSellingUnitFields
+        kind={defaultValues.kind}
+        control={control}
+        register={register}
+        errors={errors}
+      />
       {submitError && (
-        <p role="alert" className="text-xs text-red-300">
+        <p role="alert" className="text-xs text-danger">
           {submitError}
         </p>
       )}

=== src/domain/bookings/components/partner/SlotCheckInSheet.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { Camera } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CodeBoxesInput } from '../../../../ui/components/CodeBoxesInput';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { cn } from '../../../../shared/utils/cn';
import { useQrScanner } from '../../../../ui/hooks/useQrScanner';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { useSlotCheckIn } from '../../hooks/useSlotCheckIn';
import type { BookingSummary, OfferKind, PartnerSlot } from '../../types/bookings';
import { CHECK_IN_ALPHABET, checkInPrefix, codeLengthFor } from '../../utils/checkInPrefix';
import { formatSlotTime } from '../../utils/dates';

/** Check-in do horário pelo código do cliente, ou portaria da entrada pelo QR e código (D20). */
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
  const { submit, sending, result, pending } = useSlotCheckIn(offerId, slot.id, kind, onCheckedIn);

  const onQr = useCallback(
    (qrToken: string) => {
      void submit({ qrToken });
    },
    [submit]
  );
  const scanner = useQrScanner(onQr);

  const confirm = async () => {
    if (await submit({ code })) setCode('');
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
            {/* O vídeo fica montado: a câmera liga nele assim que a permissão sai. */}
            <video
              ref={scanner.videoRef}
              muted
              playsInline
              className={cn(
                'w-full aspect-square rounded-2xl bg-ink/10 object-cover',
                scanner.state !== 'scanning' && 'hidden'
              )}
            />
            {scanner.state === 'scanning' ? (
              <>
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
                disabled={sending || scanner.state === 'loading'}
                className={`${BUTTON_SECONDARY} w-full inline-flex items-center justify-center gap-2`}
              >
                <Camera size={16} aria-hidden="true" />
                {t(
                  scanner.state === 'loading'
                    ? 'serviceProof.partner.scanLoading'
                    : 'serviceProof.partner.scan'
                )}
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

=== src/domain/bookings/hooks/useBookingCheckInPass.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { useCallback, useEffect, useState } from 'react';
import { getCheckInCodeUseCase } from '../application/usecases/getCheckInCodeUseCase';
import { getEntryPassUseCase } from '../application/usecases/getEntryPassUseCase';
import { setParticipantNameUseCase } from '../application/usecases/setParticipantNameUseCase';
import type { BookingSummary, EntryPassView } from '../types/bookings';

/** Códigos (6) ou QR e código da entrada (8) de cada unidade da reserva confirmada (D20). */
export function useBookingCheckInPass(booking: BookingSummary, enabled: boolean) {
  const [data, setData] = useState<EntryPassView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      if (booking.kind === 'private_entry') {
        setData(await getEntryPassUseCase(booking.id));
      } else {
        const { codes, ...window } = await getCheckInCodeUseCase(booking.id);
        setData({ ...window, passes: codes.map((code) => ({ ...code, qrToken: null })) });
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [booking.id, booking.kind]);

  useEffect(() => {
    if (enabled) void load();
  }, [enabled, load]);

  // O QR leva o nome assinado: depois de salvar, a entrada é recarregada do servidor.
  const saveName = useCallback(
    async (unit: number, name: string) => {
      await setParticipantNameUseCase(booking.id, unit, name);
      await load();
    },
    [booking.id, load]
  );

  return { data, loading, error, reload: load, saveName };
}

=== src/domain/bookings/hooks/useOfferBookings.ts — diff ===
@@ -73,8 +73,8 @@ export function useOfferBookings(offerId: string) {
   );
 
   const checkInWithoutCode = useCallback(
-    async (bookingId: string, participantsPresent: number, reason: NoCodeReason) =>
-      replace(await checkInWithoutCodeUseCase(offerId, bookingId, { participantsPresent, reason })),
+    async (bookingId: string, reason: NoCodeReason) =>
+      replace(await checkInWithoutCodeUseCase(offerId, bookingId, { reason })),
     [offerId, replace]
   );

=== src/domain/bookings/hooks/useSlotCheckIn.ts — diff ===
@@ -5,8 +5,10 @@ import { saveEntryKeys, verifyEntryPassOffline } from '../adapters/webCryptoEntr
 import { checkInByCodeUseCase } from '../application/usecases/checkInByCodeUseCase';
 import { checkInEntryUseCase } from '../application/usecases/checkInEntryUseCase';
 import { getEntryVerificationKeysUseCase } from '../application/usecases/getEntryVerificationKeysUseCase';
-import type { BookingSummary, OfferKind } from '../types/bookings';
+import type { BookingSummary, OfferKind, UnitCheckInResult } from '../types/bookings';
 import { getBookingErrorMessage } from '../utils/bookingErrorMessage';
+import { formatSlotTime } from '../utils/dates';
+import { unitLabel } from '../utils/unitLabel';
 
 export interface CheckInResult {
   tone: 'success' | 'warn' | 'danger';
@@ -25,40 +27,62 @@ export function useSlotCheckIn(
   kind: OfferKind,
   onCheckedIn?: (booking: BookingSummary) => void
 ) {
-  const { t } = useTranslation();
+  const { t, i18n } = useTranslation();
   const entry = kind === 'private_entry';
   const [sending, setSending] = useState(false);
   const [result, setResult] = useState<CheckInResult | null>(null);
   const [pending, setPending] = useState(() => pendingCheckIns.list(offerId).length);
 
   const send = useCallback(
-    (payload: {
-      code?: string;
-      qrToken?: string;
-      participantsPresent: number;
-      capturedAt?: string;
-    }) =>
+    (payload: { code?: string; qrToken?: string; capturedAt?: string }) =>
       entry
         ? checkInEntryUseCase(offerId, slotId, payload)
         : checkInByCodeUseCase(offerId, slotId, {
             code: payload.code ?? '',
-            participantsPresent: payload.participantsPresent,
             ...(payload.capturedAt ? { capturedAt: payload.capturedAt } : {}),
           }),
     [entry, offerId, slotId]
   );
 
+  // Cada código vale uma pessoa ou um grupo (D20): a tela diz qual entrou, com o nome na entrada nominal.
+  const describe = useCallback(
+    (checkIn: UnitCheckInResult): CheckInResult => {
+      if (checkIn.alreadyCheckedIn) {
+        return {
+          tone: 'warn',
+          message: t('serviceProof.partner.alreadyUsed', {
+            time: formatSlotTime(checkIn.checkedInAt, i18n.language),
+          }),
+        };
+      }
+      const label = unitLabel(t, checkIn.booking, checkIn.unit);
+      const total = checkIn.booking.participantsCount;
+      return {
+        tone: 'success',
+        message: checkIn.name
+          ? t('serviceProof.partner.successNamed', { name: checkIn.name })
+          : t('serviceProof.partner.success', {
+              unit:
+                total > 1
+                  ? `${label} · ${t('serviceProof.pass.unitOf', { n: checkIn.unit + 1, total })}`
+                  : label,
+            }),
+      };
+    },
+    [i18n.language, t]
+  );
+
   const sync = useCallback(async () => {
     for (const item of pendingCheckIns.list(offerId)) {
       try {
-        const booking = await (item.kind === 'entry'
+        const checkIn = await (item.kind === 'entry'
           ? checkInEntryUseCase(item.offerId, item.slotId, item.payload)
           : checkInByCodeUseCase(item.offerId, item.slotId, {
               ...item.payload,
               code: item.payload.code ?? '',
             }));
         pendingCheckIns.remove(item.id);
-        onCheckedIn?.(booking);
+        onCheckedIn?.(checkIn.booking);
       } catch (error: unknown) {
         if (isNetworkFailure(error)) break;
         // Recusado pelo servidor (código errado, fora do prazo): sai da fila e o prestador vê o motivo.
@@ -82,14 +106,13 @@ export function useSlotCheckIn(
   }, [entry, offerId, sync]);
 
   const submit = useCallback(
-    async (input: { code?: string; qrToken?: string; participantsPresent: number }) => {
+    async (input: { code?: string; qrToken?: string }) => {
       setSending(true);
       setResult(null);
       try {
-        const booking = await send(input);
-        const count = booking.checkIn?.participantsPresent ?? input.participantsPresent;
-        setResult({ tone: 'success', message: t('serviceProof.partner.success', { count }) });
-        onCheckedIn?.(booking);
+        const checkIn = await send(input);
+        setResult(describe(checkIn));
+        onCheckedIn?.(checkIn.booking);
         return true;
       } catch (error: unknown) {
         if (!isNetworkFailure(error)) {
@@ -123,7 +146,7 @@ export function useSlotCheckIn(
         setSending(false);
       }
     },
-    [entry, offerId, onCheckedIn, send, slotId, t]
+    [describe, entry, offerId, onCheckedIn, send, slotId, t]
   );
 
   return { submit, sending, result, pending, clearResult: () => setResult(null) };

=== src/domain/bookings/ports/bookingsApiPort.ts — diff ===
@@ -7,6 +7,7 @@ import type {
   CodeCheckInPayload,
   EntryCheckInPayload,
   EntryPassView,
+  UnitCheckInResult,
   NoCodeReason,
   CreateBookingPayload,
   CreateBookingResponse,
@@ -51,12 +52,12 @@ export interface BookingsApiPort {
     offerId: string,
     slotId: string,
     payload: CodeCheckInPayload
-  ): Promise<BookingSummary>;
+  ): Promise<UnitCheckInResult>;
   checkInEntry(
     offerId: string,
     slotId: string,
     payload: EntryCheckInPayload
-  ): Promise<BookingSummary>;
+  ): Promise<UnitCheckInResult>;
   getEntryVerificationKeys(
     offerId: string
   ): Promise<Array<{ kid: string; publicKeyJwk: JsonWebKey }>>;
@@ -68,8 +69,13 @@ export interface BookingsApiPort {
   checkInWithoutCode(
     offerId: string,
     bookingId: string,
-    payload: { participantsPresent: number; reason: NoCodeReason }
+    payload: { reason: NoCodeReason }
   ): Promise<BookingSummary>;
+  setParticipantName(
+    bookingId: string,
+    unit: number,
+    name: string
+  ): Promise<{ unit: number; name: string; changed: boolean }>;
   answerProviderAbsence(
     offerId: string,
     bookingId: string,

=== src/domain/bookings/schemas/offerFormSchema.ts — diff ===
@@ -45,6 +45,9 @@ export const offerFormSchema = z.object({
   cancellationPolicy: z.enum([...BOOKING_CANCELLATION_POLICIES, ...TRANSFER_CANCELLATION_POLICIES]),
   maxParticipantsPerBooking: z.coerce.number().int(integer).min(1, integer).max(50, integer),
   requiresParticipantNames: z.boolean(),
+  sellingUnit: z.enum(['person', 'group']),
+  // Sempre validado (o campo tem valor padrão); só vai para a API na venda por grupo.
+  groupMaxPeople: z.coerce.number().int(integer).min(2, integer).max(50, integer),
 });
 
 export type OfferFormInput = z.input<typeof offerFormSchema>;

=== src/domain/bookings/types/bookings.ts — diff ===
@@ -25,8 +25,15 @@ export interface OfferFields {
   cancellationPolicy: BookingCancellationPolicy;
   maxParticipantsPerBooking: number;
   requiresParticipantNames: boolean;
+  /** Um código por pessoa ou um por grupo (D20); grupo diz quantas pessoas cabem. */
+  sellingUnit?: SellingUnit;
+  groupMaxPeople?: number;
+  /** Nome do estabelecimento mostrado ao cliente (D20). */
+  businessName?: string;
 }
 
+export type SellingUnit = 'person' | 'group';
+
 export interface PartnerOffer extends OfferFields {
   id: string;
   guideItemId: string;
@@ -109,7 +116,12 @@ export interface BookingSummary {
   rescheduledAt: string | null;
   /** Onde o comprador está, quando a oferta busca no endereço (D20). */
   pickupAddress: string | null;
-  checkIn: { at: string; method: CheckInMethod; participantsPresent: number } | null;
+  /** Check-in por unidade (pessoa ou grupo) (D20). */
+  checkIns: Array<{ unit: number; at: string; method: CheckInMethod }>;
+  businessName: string | null;
+  sellingUnit: SellingUnit;
+  groupMaxPeople: number | null;
+  requiresParticipantNames: boolean;
   /** "Cheguei" do prestador (D20). */
   arrivedAt: string | null;
   providerAbsence: {
@@ -183,26 +195,39 @@ export interface CancelBookingResponse {
 export type CheckInMethod = 'code' | 'qr' | 'no_code';
 export type NoCodeReason = 'no_phone' | 'refused' | 'other';
 
-/** Código de check-in do comprador; `code` só no dia do serviço (D20). */
-export interface CheckInCodeView {
+/** Código de uma unidade (pessoa ou grupo); `code` só no dia do serviço e antes do check-in (D20). */
+export interface UnitCode {
+  unit: number;
   code: string | null;
+  name: string | null;
+  nameChanged: boolean;
+  checkedInAt: string | null;
+}
+
+export interface CheckInCodeView {
+  codes: UnitCode[];
   visibleFrom: string;
   validUntil: string;
-  checkedInAt: string | null;
 }
 
-/** QR e código de 8 caracteres da entrada de atração (D20). */
-export interface EntryPassView {
+/** QR e código de 8 caracteres de uma entrada de atração (D20). */
+export interface EntryPass {
+  unit: number;
   qrToken: string | null;
   code: string | null;
+  name: string | null;
+  nameChanged: boolean;
+  checkedInAt: string | null;
+}
+
+export interface EntryPassView {
+  passes: EntryPass[];
   visibleFrom: string;
   validUntil: string;
-  checkedInAt: string | null;
 }
 
 export interface CodeCheckInPayload {
   code: string;
-  participantsPresent: number;
   /** Hora do aparelho quando o código foi digitado sem internet. */
   capturedAt?: string;
 }
@@ -210,10 +235,18 @@ export interface CodeCheckInPayload {
 export interface EntryCheckInPayload {
   qrToken?: string;
   code?: string;
-  participantsPresent: number;
   capturedAt?: string;
 }
 
+/** Resultado do check-in de uma unidade: o nome confere a entrada nominal; repetida não entra de novo. */
+export interface UnitCheckInResult {
+  booking: BookingSummary;
+  unit: number;
+  name: string | null;
+  alreadyCheckedIn: boolean;
+  checkedInAt: string;
+}
+
 export interface ArrivalLocation {
   lat: number;
   lng: number;

=== src/domain/bookings/utils/bookingErrorMessage.ts — diff ===
@@ -22,6 +22,7 @@ const KNOWN_CODES = [
   'NOTHING_TO_ANSWER',
   'INVALID_ENTRY_PASS',
   'CLAIM_ALREADY_EXISTS',
+  'NAME_CHANGE_NOT_ALLOWED',
   'INTERNAL_ERROR',
 ] as const;

=== src/domain/bookings/utils/bookingsFrontendUtils.test.ts — diff ===
@@ -1,8 +1,10 @@
+import type { TFunction } from 'i18next';
 import { describe, expect, it } from 'vitest';
 import { buildSlotsPayload } from '../components/partner/SlotCreationForm';
 import { fortalezaDateKey, fortalezaInputToIso, startOfFortalezaWeek } from './dates';
 import { formatMinor, minorToReaisInput, parseReaisToMinor } from './money';
 import { emptyOfferFormValues, offerFormToFields } from './offerFormMapping';
+import { canEditUnitName, unitLabel } from './unitLabel';
 
 describe('dinheiro', () => {
   it('converte reais digitados em centavos inteiros', () => {
@@ -88,3 +90,60 @@ describe('criação de horários', () => {
     });
   });
 });
+
+describe('venda por pessoa ou grupo (D20)', () => {
+  const tour = { ...emptyOfferFormValues('tour'), title: { 'pt-BR': 'Buggy', en: '', fr: '' } };
+
+  it('grupo envia o tamanho e desliga os nomes; entrada de atração é sempre por pessoa', () => {
+    const group = offerFormToFields({
+      ...tour,
+      sellingUnit: 'group',
+      groupMaxPeople: 4,
+      requiresParticipantNames: true,
+    });
+    expect(group).toMatchObject({
+      sellingUnit: 'group',
+      groupMaxPeople: 4,
+      requiresParticipantNames: false,
+    });
+    const entry = offerFormToFields({
+      ...emptyOfferFormValues('private_entry'),
+      sellingUnit: 'group',
+      requiresParticipantNames: true,
+    });
+    expect(entry).toMatchObject({ sellingUnit: 'person', requiresParticipantNames: true });
+    expect(entry).not.toHaveProperty('groupMaxPeople');
+  });
+});
+
+describe('unidade da reserva (D20)', () => {
+  const t = ((key: string, options?: { n?: number }) =>
+    key === 'serviceProof.units.person' ? `Pessoa ${options?.n}` : 'Grupo') as unknown as TFunction;
+  const booking = {
+    requiresParticipantNames: true,
+    offer: { startsAt: '2026-11-10T12:00:00.000Z' },
+  } as Parameters<typeof canEditUnitName>[0];
+  const pass = { name: null, nameChanged: false, checkedInAt: null };
+
+  it('rótulo usa o nome, "Pessoa n" ou o grupo', () => {
+    expect(unitLabel(t, { sellingUnit: 'person', participantsCount: 3 }, 1)).toBe('Pessoa 2');
+    expect(unitLabel(t, { sellingUnit: 'person', participantsCount: 3 }, 1, 'Ana')).toBe('Ana');
+    expect(unitLabel(t, { sellingUnit: 'group', participantsCount: 1 }, 0)).toBe('Grupo');
+    expect(unitLabel(t, { sellingUnit: 'group', participantsCount: 2 }, 1)).toBe('Grupo 2');
+  });
+
+  it('primeiro nome é livre; troca só uma vez e até 24 h antes; nada depois do check-in', () => {
+    const early = new Date('2026-11-08T12:00:00.000Z');
+    const late = new Date('2026-11-09T13:00:00.000Z');
+    expect(canEditUnitName(booking, pass, late)).toBe(true);
+    expect(canEditUnitName(booking, { ...pass, name: 'Ana' }, early)).toBe(true);
+    expect(canEditUnitName(booking, { ...pass, name: 'Ana' }, late)).toBe(false);
+    expect(canEditUnitName(booking, { ...pass, name: 'Ana', nameChanged: true }, early)).toBe(
+      false
+    );
+    expect(canEditUnitName(booking, { ...pass, checkedInAt: 'x' }, early)).toBe(false);
+    expect(canEditUnitName({ ...booking, requiresParticipantNames: false }, pass, early)).toBe(
+      false
+    );
+  });
+});

=== src/domain/bookings/utils/offerFormMapping.ts — diff ===
@@ -13,6 +13,7 @@ function toLocalized(value: { 'pt-BR': string; en: string; fr: string }): Locali
 /** Converte o formulário (valores em reais digitados) no corpo da API (centavos inteiros). */
 export function offerFormToFields(values: OfferFormValues): OfferFields {
   const description = toLocalized(values.description);
+  const group = values.kind === 'tour' && values.sellingUnit === 'group';
   return {
     title: toLocalized(values.title),
     ...(description['pt-BR'] ? { description } : {}),
@@ -28,11 +29,15 @@ export function offerFormToFields(values: OfferFormValues): OfferFields {
     ...(values.meetingPoint.trim()
       ? { meetingPoint: { address: values.meetingPoint.trim() } }
       : {}),
-    // Entrada de atração é sempre no local; buscar o comprador só vale para passeio (D20).
+    // Entrada de atração é sempre no local e por pessoa; buscar o cliente e vender por grupo só no passeio (D20).
     pickupMode: values.kind === 'tour' ? values.pickupMode : 'meeting_point',
     cancellationPolicy: values.cancellationPolicy,
     maxParticipantsPerBooking: values.maxParticipantsPerBooking,
-    requiresParticipantNames: values.requiresParticipantNames,
+    ...(group
+      ? { sellingUnit: 'group', groupMaxPeople: values.groupMaxPeople }
+      : { sellingUnit: 'person' }),
+    // Grupo não tem nome por pessoa: o cliente decide quem leva.
+    requiresParticipantNames: !group && values.requiresParticipantNames,
   };
 }
 
@@ -56,6 +61,8 @@ export function offerToFormValues(offer: PartnerOffer): OfferFormValues {
     cancellationPolicy: offer.cancellationPolicy,
     maxParticipantsPerBooking: offer.maxParticipantsPerBooking,
     requiresParticipantNames: offer.requiresParticipantNames,
+    sellingUnit: offer.sellingUnit ?? 'person',
+    groupMaxPeople: offer.groupMaxPeople ?? 4,
   };
 }
 
@@ -71,5 +78,7 @@ export function emptyOfferFormValues(kind: 'tour' | 'private_entry'): OfferFormV
     cancellationPolicy: 'flexible',
     maxParticipantsPerBooking: 8,
     requiresParticipantNames: false,
+    sellingUnit: 'person',
+    groupMaxPeople: 4,
   };
 }

=== src/domain/bookings/utils/serviceProofTiming.ts — diff ===
@@ -19,7 +19,7 @@ export function canReportProviderAbsent(booking: BookingSummary, now: Date): boo
   return (
     usesCheckInCode(booking.kind) &&
     booking.status === 'confirmed' &&
-    !booking.checkIn &&
+    booking.checkIns.length === 0 &&
     !booking.providerAbsence &&
     nowMs >= new Date(booking.offer.startsAt).getTime() + PROVIDER_ABSENT_AFTER_MS &&
     nowMs <= serviceEndMs(booking) + CHECK_IN_CLOSES_AFTER_MS

=== src/domain/bookings/utils/unitLabel.ts — ARQUIVO NOVO, conteúdo completo ===
import type { TFunction } from 'i18next';
import type { BookingSummary } from '../types/bookings';

const DAY_MS = 24 * 60 * 60_000;

/** Rótulo de uma unidade da reserva: o nome, "Pessoa 2" ou "Grupo" (D20). */
export function unitLabel(
  t: TFunction,
  booking: Pick<BookingSummary, 'sellingUnit' | 'participantsCount'>,
  unit: number,
  name?: string | null
): string {
  if (name) return name;
  if (booking.sellingUnit === 'group') {
    const tag = t('serviceProof.units.groupTag');
    return booking.participantsCount > 1 ? `${tag} ${unit + 1}` : tag;
  }
  return t('serviceProof.units.person', { n: unit + 1 });
}

/** Mesma regra do backend: o primeiro nome é livre; trocar, uma vez e até 24 h antes. */
export function canEditUnitName(
  booking: Pick<BookingSummary, 'requiresParticipantNames' | 'offer'>,
  pass: { name: string | null; nameChanged: boolean; checkedInAt: string | null },
  now: Date
): boolean {
  if (!booking.requiresParticipantNames || pass.checkedInAt) return false;
  if (!pass.name) return true;
  return !pass.nameChanged && now.getTime() < new Date(booking.offer.startsAt).getTime() - DAY_MS;
}

=== src/shared/i18n/bookingsResources.ts — diff ===
@@ -199,6 +199,7 @@ export interface BookingsTranslation {
     ABSENCE_REPORT_NOT_ALLOWED: string;
     NOTHING_TO_ANSWER: string;
     INVALID_ENTRY_PASS: string;
+    NAME_CHANGE_NOT_ALLOWED: string;
     CLAIM_ALREADY_EXISTS: string;
     INTERNAL_ERROR: string;
   };
@@ -302,7 +303,7 @@ export const bookingsPtBR: BookingsTranslation = {
     durationLabel: 'Duração (minutos)',
     meetingPointLabel: 'Ponto de encontro',
     maxParticipantsLabel: 'Máximo de participantes por reserva',
-    requireNamesLabel: 'Pedir o nome de cada participante',
+    requireNamesLabel: 'Pedir o nome de cada pessoa',
     save: 'Salvar',
     cancel: 'Cancelar',
     saveFailed: 'Não foi possível salvar a oferta.',
@@ -415,6 +416,8 @@ export const bookingsPtBR: BookingsTranslation = {
       'Só é possível relatar 30 min depois do horário, se o check-in não foi feito.',
     NOTHING_TO_ANSWER: 'Não há nada para responder nesta reserva.',
     INVALID_ENTRY_PASS: 'QR Code inválido para este horário.',
+    NAME_CHANGE_NOT_ALLOWED:
+      'O nome desta entrada já foi trocado ou a troca fechou (até 24 h antes).',
     CLAIM_ALREADY_EXISTS: 'Já existe uma reclamação para esta compra.',
     INTERNAL_ERROR: 'Algo deu errado. Tente novamente em instantes.',
   },
@@ -516,7 +519,7 @@ export const bookingsEn: BookingsTranslation = {
     durationLabel: 'Duration (minutes)',
     meetingPointLabel: 'Meeting point',
     maxParticipantsLabel: 'Maximum participants per booking',
-    requireNamesLabel: 'Ask for each participant’s name',
+    requireNamesLabel: 'Ask for each person’s name',
     save: 'Save',
     cancel: 'Cancel',
     saveFailed: 'The offer could not be saved.',
@@ -628,6 +631,8 @@ export const bookingsEn: BookingsTranslation = {
       'You can report it 30 min after the start time, if no check-in was done.',
     NOTHING_TO_ANSWER: 'There is nothing to answer in this booking.',
     INVALID_ENTRY_PASS: 'This QR code is not valid for this time slot.',
+    NAME_CHANGE_NOT_ALLOWED:
+      'The name on this entry was already changed or changes are closed (up to 24 h before).',
     CLAIM_ALREADY_EXISTS: 'There is already a claim for this purchase.',
     INTERNAL_ERROR: 'Something went wrong. Please try again shortly.',
   },
@@ -734,7 +739,7 @@ export const bookingsFr: BookingsTranslation = {
     durationLabel: 'Durée (minutes)',
     meetingPointLabel: 'Point de rendez-vous',
     maxParticipantsLabel: 'Nombre maximum de participants par réservation',
-    requireNamesLabel: 'Demander le nom de chaque participant',
+    requireNamesLabel: 'Demander le nom de chaque personne',
     save: 'Enregistrer',
     cancel: 'Annuler',
     saveFailed: 'Impossible d’enregistrer l’offre.',
@@ -848,6 +853,8 @@ export const bookingsFr: BookingsTranslation = {
       'Le signalement est possible 30 min après l’horaire, sans enregistrement fait.',
     NOTHING_TO_ANSWER: 'Il n’y a rien à répondre pour cette réservation.',
     INVALID_ENTRY_PASS: 'Ce QR code n’est pas valable pour ce créneau.',
+    NAME_CHANGE_NOT_ALLOWED:
+      'Le nom de cette entrée a déjà été changé ou le délai est passé (jusqu’à 24 h avant).',
     CLAIM_ALREADY_EXISTS: 'Une réclamation existe déjà pour cet achat.',
     INTERNAL_ERROR: 'Un problème est survenu. Réessayez dans un instant.',
   },

=== src/shared/i18n/serviceProofResources.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
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
    unitsLabel: string;
    unitOf: string;
    addName: string;
    changeName: string;
    nameTitle: string;
    nameLabel: string;
    nameHint: string;
    nameSave: string;
    nameSaved: string;
    nameLocked: string;
  };
  units: {
    person: string;
    group: string;
    groupTag: string;
    groups_one: string;
    groups_other: string;
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
    noMessage: string;
    noConfirm: string;
    confirmed: string;
    denied: string;
    refunded: string;
    businessFallback: string;
  };
  checkout: {
    pickupLabel: string;
    pickupHint: string;
    pickupPlaceholder: string;
    namesLater: string;
    namesHint: string;
    groupNote: string;
    groupLegend: string;
  };
  partner: {
    checkIn: string;
    entry: string;
    sheetTitle: string;
    entrySheetTitle: string;
    codeLabel: string;
    entryCodeLabel: string;
    character: string;
    submit: string;
    scan: string;
    scanning: string;
    scanLoading: string;
    stopScan: string;
    scanUnsupported: string;
    cameraDenied: string;
    success: string;
    successNamed: string;
    alreadyUsed: string;
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
    checkedIn: string;
    checkedInUnits: string;
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
    sellingUnitLegend: string;
    perPerson: string;
    perPersonHint: string;
    perGroup: string;
    perGroupHint: string;
    groupMaxLabel: string;
    requireNamesHint: string;
  };
}

export const serviceProofPtBR: ServiceProofTranslation = {
  pass: {
    codeTitle: 'Código de check-in',
    entryTitle: 'Sua entrada',
    codeHint: 'Informe este código pessoalmente, na hora do serviço.',
    entryHint: 'Mostre o QR Code na portaria. Se a leitura falhar, informe o código.',
    warning:
      'Nunca informe o código por telefone ou mensagem. Ninguém do Use Guide pede este código.',
    notYet: 'Seu código aparece no dia do serviço, a partir de {{date}}.',
    checkedIn: 'Check-in feito em {{date}}.',
    loadError: 'Não foi possível carregar o código.',
    retry: 'Tentar de novo',
    qrAlt: 'QR Code da entrada',
    copyLabel: 'Código {{code}}',
    unitsLabel: 'Escolha a entrada',
    unitOf: '{{n}} de {{total}}',
    addName: 'Adicionar nome',
    changeName: 'Trocar nome',
    nameTitle: 'Nome nesta entrada',
    nameLabel: 'Nome completo',
    nameHint:
      'Na entrada, a pessoa mostra um documento com foto. O nome pode ser trocado uma vez, até 24 h antes.',
    nameSave: 'Salvar nome',
    nameSaved: 'Nome salvo.',
    nameLocked: 'Nome já trocado',
  },
  units: {
    person: 'Pessoa {{n}}',
    group: 'Grupo de até {{max}} pessoas',
    groupTag: 'Grupo',
    groups_one: '{{count}} grupo',
    groups_other: '{{count}} grupos',
  },
  buyer: {
    providerAbsent: '{{business}} não apareceu',
    providerAbsentTitle: '{{business}} não apareceu?',
    providerAbsentMessage: 'Avisamos agora. {{business}} tem 2 h para responder ao seu relato.',
    providerAbsentConfirm: 'Enviar relato',
    keep: 'Voltar',
    absenceSent: 'Relato enviado. {{business}} tem até {{date}} para responder.',
    absenceAdmin: '{{business}} diz que esteve no local. Nossa equipe decide em até 5 dias.',
    absenceRefunded: 'O relato foi aceito. Você recebe o valor pago de volta.',
    absenceWithdrawn: '{{business}} chegou e o check-in foi feito.',
    questionTitle: 'O serviço aconteceu?',
    questionMessage: 'Responda até {{date}}.',
    yes: 'Sim, aconteceu',
    no: 'Não aconteceu',
    noTitle: 'O serviço não aconteceu?',
    noMessage: 'Sua resposta é registrada e não pode ser mudada depois.',
    noConfirm: 'Confirmar',
    confirmed: 'Obrigado. O serviço foi confirmado.',
    denied: 'Resposta enviada. Nossa equipe analisa o caso em até 5 dias.',
    refunded: 'Resposta registrada. Você recebe o valor pago de volta.',
    businessFallback: 'A equipe',
  },
  checkout: {
    pickupLabel: 'Onde você está hospedado?',
    pickupHint: 'Só quem vai buscar você vê este endereço, e ele é apagado depois do serviço.',
    pickupPlaceholder: 'Nome da pousada ou endereço',
    namesLater: 'Informar depois',
    namesHint: 'Você pode informar os nomes depois, em Compras, até o dia.',
    groupNote: 'Cada grupo leva até {{max}} pessoas e recebe um código.',
    groupLegend: 'Grupos',
  },
  partner: {
    checkIn: 'Fazer check-in',
    entry: 'Portaria',
    sheetTitle: 'Check-in',
    entrySheetTitle: 'Portaria',
    codeLabel: 'Código do cliente',
    entryCodeLabel: 'Código da entrada',
    character: 'Caractere {{n}} de {{total}}',
    submit: 'Confirmar check-in',
    scan: 'Ler QR Code',
    scanning: 'Aponte a câmera para o QR Code',
    scanLoading: 'Abrindo a câmera…',
    stopScan: 'Parar câmera',
    scanUnsupported: 'Não foi possível abrir o leitor. Digite o código que aparece abaixo do QR.',
    cameraDenied: 'Sem acesso à câmera. Digite o código que aparece abaixo do QR.',
    success: 'Check-in feito · {{unit}}.',
    successNamed: 'Check-in feito: {{name}}. Confira o documento com foto.',
    alreadyUsed: 'Este código já foi usado às {{time}}.',
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
      'O serviço segue por sua conta e risco. O cliente vai confirmar se o serviço aconteceu.',
    noCodeReason: 'Motivo',
    reasons: {
      no_phone: 'Sem celular ou sem bateria',
      refused: 'Não quis informar',
      other: 'Outro',
    },
    noCodeConfirm: 'Registrar',
    absenceTitle: 'O cliente diz que você não compareceu',
    absenceMessage:
      'Responda até {{date}}. Sem resposta, o cliente recebe o reembolso integral e vale a multa de 20%.',
    wasThere: 'Eu estava lá',
    admitted: 'Não compareci',
    admittedTitle: 'Confirmar que não compareceu?',
    admittedMessage: 'O cliente recebe o reembolso integral e a multa de 20% é cobrada.',
    admittedConfirm: 'Confirmar',
    pickupAt: 'Buscar em: {{address}}',
    checkedIn: 'Check-in às {{time}}',
    checkedInUnits: 'Check-in às {{time}} · {{used}} de {{total}}',
    checkedInNoCode: 'Sem código às {{time}} · aguardando o cliente',
  },
  evidence: {
    title: 'Provas do serviço',
    checkIn: 'Check-in: {{date}} · {{method}} · {{used}} de {{total}}',
    methods: { code: 'com código', qr: 'pelo QR Code', no_code: 'sem código' },
    noCheckIn: 'Sem check-in',
    arrival: '"Cheguei": {{date}}',
    noArrival: 'Sem "Cheguei"',
    map: 'Ver local no mapa',
    absence: 'Relato de ausência: {{date}} · {{answer}}',
    answers: {
      was_there: 'o parceiro diz que esteve lá',
      admitted: 'o parceiro admitiu a falta',
      none: 'sem resposta',
    },
    confirmation: 'Cliente: {{answer}}',
    confirmationAnswers: {
      yes: 'o serviço aconteceu',
      no: 'o serviço não aconteceu',
      none: 'sem resposta',
    },
    noShow: 'Ausência marcada pelo parceiro',
    pickup: 'Endereço de busca: {{address}}',
    noCodeReason: 'Motivo do check-in sem código: {{reason}}',
  },
  offerEditor: {
    pickupLegend: 'Onde o serviço começa',
    meetingPoint: 'No ponto de encontro',
    buyerAddress: 'Buscar o cliente onde ele está',
    sellingUnitLegend: 'Como você vende',
    perPerson: 'Por pessoa',
    perPersonHint: 'Cada pessoa recebe um código.',
    perGroup: 'Por grupo',
    perGroupHint: 'Um código para o grupo inteiro, como um buggy ou um barco.',
    groupMaxLabel: 'Máximo de pessoas por grupo',
    requireNamesHint: 'O nome aparece em cada entrada e a portaria confere com documento com foto.',
  },
};

export const serviceProofEn: ServiceProofTranslation = {
  pass: {
    codeTitle: 'Check-in code',
    entryTitle: 'Your entry',
    codeHint: 'Tell this code in person, when the service starts.',
    entryHint: 'Show the QR code at the entrance. If it cannot be read, tell them the code.',
    warning: 'Never share the code by phone or message. No one at Use Guide asks for this code.',
    notYet: 'Your code appears on the day of the service, from {{date}}.',
    checkedIn: 'Checked in on {{date}}.',
    loadError: 'Could not load the code.',
    retry: 'Try again',
    qrAlt: 'Entry QR code',
    copyLabel: 'Code {{code}}',
    unitsLabel: 'Choose the entry',
    unitOf: '{{n}} of {{total}}',
    addName: 'Add name',
    changeName: 'Change name',
    nameTitle: 'Name on this entry',
    nameLabel: 'Full name',
    nameHint:
      'At the entrance, the person shows a photo ID. The name can be changed once, up to 24 h before.',
    nameSave: 'Save name',
    nameSaved: 'Name saved.',
    nameLocked: 'Name already changed',
  },
  units: {
    person: 'Person {{n}}',
    group: 'Group of up to {{max}} people',
    groupTag: 'Group',
    groups_one: '{{count}} group',
    groups_other: '{{count}} groups',
  },
  buyer: {
    providerAbsent: '{{business}} did not show up',
    providerAbsentTitle: '{{business}} did not show up?',
    providerAbsentMessage:
      'We will let them know now. {{business}} has 2 h to respond to your report.',
    providerAbsentConfirm: 'Send report',
    keep: 'Back',
    absenceSent: 'Report sent. {{business}} has until {{date}} to respond.',
    absenceAdmin: '{{business}} says they were there. Our team decides within 5 days.',
    absenceRefunded: 'Your report was accepted. You get the amount paid back.',
    absenceWithdrawn: '{{business}} arrived and the check-in was done.',
    questionTitle: 'Did the service happen?',
    questionMessage: 'Answer by {{date}}.',
    yes: 'Yes, it happened',
    no: 'It did not happen',
    noTitle: 'The service did not happen?',
    noMessage: 'Your answer is saved and cannot be changed later.',
    noConfirm: 'Confirm',
    confirmed: 'Thank you. The service was confirmed.',
    denied: 'Answer sent. Our team reviews the case within 5 days.',
    refunded: 'Answer saved. You get the amount paid back.',
    businessFallback: 'The team',
  },
  checkout: {
    pickupLabel: 'Where are you staying?',
    pickupHint: 'Only whoever picks you up sees this address, and it is deleted after the service.',
    pickupPlaceholder: 'Name of the guesthouse or address',
    namesLater: 'Add later',
    namesHint: 'You can add the names later, in Purchases, until the day.',
    groupNote: 'Each group takes up to {{max}} people and gets one code.',
    groupLegend: 'Groups',
  },
  partner: {
    checkIn: 'Check in',
    entry: 'Entrance',
    sheetTitle: 'Check-in',
    entrySheetTitle: 'Entrance',
    codeLabel: "Customer's code",
    entryCodeLabel: 'Entry code',
    character: 'Character {{n}} of {{total}}',
    submit: 'Confirm check-in',
    scan: 'Scan QR code',
    scanning: 'Point the camera at the QR code',
    scanLoading: 'Opening the camera…',
    stopScan: 'Stop camera',
    scanUnsupported: 'The reader could not open. Type the code shown below the QR.',
    cameraDenied: 'No camera access. Type the code shown below the QR.',
    success: 'Checked in · {{unit}}.',
    successNamed: 'Checked in: {{name}}. Check the photo ID.',
    alreadyUsed: 'This code was already used at {{time}}.',
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
      'The service goes ahead at your own risk. The customer will confirm whether the service happened.',
    noCodeReason: 'Reason',
    reasons: {
      no_phone: 'No phone or no battery',
      refused: 'Did not want to tell',
      other: 'Other',
    },
    noCodeConfirm: 'Save',
    absenceTitle: 'The customer says you did not show up',
    absenceMessage:
      'Respond by {{date}}. Without a response, the customer gets a full refund and the 20% penalty applies.',
    wasThere: 'I was there',
    admitted: 'I did not show up',
    admittedTitle: 'Confirm that you did not show up?',
    admittedMessage: 'The customer gets a full refund and the 20% penalty is charged.',
    admittedConfirm: 'Confirm',
    pickupAt: 'Pick up at: {{address}}',
    checkedIn: 'Checked in at {{time}}',
    checkedInUnits: 'Checked in at {{time}} · {{used}} of {{total}}',
    checkedInNoCode: 'Without code at {{time}} · waiting for the customer',
  },
  evidence: {
    title: 'Proof of service',
    checkIn: 'Check-in: {{date}} · {{method}} · {{used}} of {{total}}',
    methods: { code: 'with code', qr: 'by QR code', no_code: 'without code' },
    noCheckIn: 'No check-in',
    arrival: '"I\'m here": {{date}}',
    noArrival: 'No "I\'m here"',
    map: 'See place on the map',
    absence: 'No-show report: {{date}} · {{answer}}',
    answers: {
      was_there: 'the partner says they were there',
      admitted: 'the partner admitted not showing up',
      none: 'no response',
    },
    confirmation: 'Customer: {{answer}}',
    confirmationAnswers: {
      yes: 'the service happened',
      no: 'the service did not happen',
      none: 'no answer',
    },
    noShow: 'No-show marked by the partner',
    pickup: 'Pick-up address: {{address}}',
    noCodeReason: 'Reason for check-in without code: {{reason}}',
  },
  offerEditor: {
    pickupLegend: 'Where the service starts',
    meetingPoint: 'At the meeting point',
    buyerAddress: 'Pick up the customer where they are',
    sellingUnitLegend: 'How you sell',
    perPerson: 'Per person',
    perPersonHint: 'Each person gets a code.',
    perGroup: 'Per group',
    perGroupHint: 'One code for the whole group, like a buggy or a boat.',
    groupMaxLabel: 'Maximum people per group',
    requireNamesHint: 'The name shows on each entry and the staff checks it against a photo ID.',
  },
};

export const serviceProofFr: ServiceProofTranslation = {
  pass: {
    codeTitle: 'Code d’enregistrement',
    entryTitle: 'Votre entrée',
    codeHint: 'Donnez ce code en personne, au moment du service.',
    entryHint: 'Montrez le QR code à l’entrée. Si la lecture échoue, donnez le code.',
    warning:
      'Ne communiquez jamais le code par téléphone ou par message. Personne chez Use Guide ne vous le demande.',
    notYet: 'Votre code apparaît le jour du service, à partir de {{date}}.',
    checkedIn: 'Enregistrement fait le {{date}}.',
    loadError: 'Impossible de charger le code.',
    retry: 'Réessayer',
    qrAlt: 'QR code de l’entrée',
    copyLabel: 'Code {{code}}',
    unitsLabel: 'Choisissez l’entrée',
    unitOf: '{{n}} sur {{total}}',
    addName: 'Ajouter un nom',
    changeName: 'Changer le nom',
    nameTitle: 'Nom sur cette entrée',
    nameLabel: 'Nom complet',
    nameHint:
      'À l’entrée, la personne présente une pièce d’identité avec photo. Le nom peut être changé une fois, jusqu’à 24 h avant.',
    nameSave: 'Enregistrer le nom',
    nameSaved: 'Nom enregistré.',
    nameLocked: 'Nom déjà changé',
  },
  units: {
    person: 'Personne {{n}}',
    group: 'Groupe de {{max}} personnes maximum',
    groupTag: 'Groupe',
    groups_one: '{{count}} groupe',
    groups_other: '{{count}} groupes',
  },
  buyer: {
    providerAbsent: '{{business}} n’est pas venu',
    providerAbsentTitle: '{{business}} n’est pas venu ?',
    providerAbsentMessage:
      'Nous prévenons tout de suite. {{business}} a 2 h pour répondre à votre signalement.',
    providerAbsentConfirm: 'Envoyer le signalement',
    keep: 'Retour',
    absenceSent: 'Signalement envoyé. {{business}} a jusqu’au {{date}} pour répondre.',
    absenceAdmin: '{{business}} dit avoir été sur place. Notre équipe décide sous 5 jours.',
    absenceRefunded: 'Votre signalement a été accepté. Vous êtes remboursé du montant payé.',
    absenceWithdrawn: '{{business}} est arrivé et l’enregistrement a été fait.',
    questionTitle: 'Le service a-t-il eu lieu ?',
    questionMessage: 'Répondez avant le {{date}}.',
    yes: 'Oui, il a eu lieu',
    no: 'Il n’a pas eu lieu',
    noTitle: 'Le service n’a pas eu lieu ?',
    noMessage: 'Votre réponse est enregistrée et ne pourra pas être modifiée.',
    noConfirm: 'Confirmer',
    confirmed: 'Merci. Le service est confirmé.',
    denied: 'Réponse envoyée. Notre équipe examine le cas sous 5 jours.',
    refunded: 'Réponse enregistrée. Vous êtes remboursé du montant payé.',
    businessFallback: 'L’équipe',
  },
  checkout: {
    pickupLabel: 'Où logez-vous ?',
    pickupHint:
      'Seule la personne qui vient vous chercher voit cette adresse, supprimée après le service.',
    pickupPlaceholder: 'Nom de la pousada ou adresse',
    namesLater: 'Plus tard',
    namesHint: 'Vous pouvez indiquer les noms plus tard, dans Achats, jusqu’au jour même.',
    groupNote: 'Chaque groupe compte jusqu’à {{max}} personnes et reçoit un code.',
    groupLegend: 'Groupes',
  },
  partner: {
    checkIn: 'Enregistrer',
    entry: 'Entrée',
    sheetTitle: 'Enregistrement',
    entrySheetTitle: 'Entrée',
    codeLabel: 'Code du client',
    entryCodeLabel: 'Code de l’entrée',
    character: 'Caractère {{n}} sur {{total}}',
    submit: 'Confirmer l’enregistrement',
    scan: 'Lire le QR code',
    scanning: 'Pointez la caméra vers le QR code',
    scanLoading: 'Ouverture de la caméra…',
    stopScan: 'Arrêter la caméra',
    scanUnsupported: 'Le lecteur n’a pas pu s’ouvrir. Saisissez le code affiché sous le QR.',
    cameraDenied: 'Pas d’accès à la caméra. Saisissez le code affiché sous le QR.',
    success: 'Enregistrement fait · {{unit}}.',
    successNamed: 'Enregistrement fait : {{name}}. Vérifiez la pièce d’identité.',
    alreadyUsed: 'Ce code a déjà été utilisé à {{time}}.',
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
      'Le service continue à vos risques. Le client confirmera si le service a eu lieu.',
    noCodeReason: 'Motif',
    reasons: {
      no_phone: 'Sans téléphone ou sans batterie',
      refused: 'N’a pas voulu le donner',
      other: 'Autre',
    },
    noCodeConfirm: 'Enregistrer',
    absenceTitle: 'Le client dit que vous n’êtes pas venu',
    absenceMessage:
      'Répondez avant le {{date}}. Sans réponse, le client est remboursé intégralement et la pénalité de 20 % s’applique.',
    wasThere: 'J’étais sur place',
    admitted: 'Je ne suis pas venu',
    admittedTitle: 'Confirmer que vous n’êtes pas venu ?',
    admittedMessage: 'Le client est remboursé intégralement et la pénalité de 20 % est facturée.',
    admittedConfirm: 'Confirmer',
    pickupAt: 'Prise en charge : {{address}}',
    checkedIn: 'Enregistré à {{time}}',
    checkedInUnits: 'Enregistré à {{time}} · {{used}} sur {{total}}',
    checkedInNoCode: 'Sans code à {{time}} · en attente du client',
  },
  evidence: {
    title: 'Preuves du service',
    checkIn: 'Enregistrement : {{date}} · {{method}} · {{used}} sur {{total}}',
    methods: { code: 'avec code', qr: 'par QR code', no_code: 'sans code' },
    noCheckIn: 'Pas d’enregistrement',
    arrival: '« Je suis arrivé » : {{date}}',
    noArrival: 'Pas de « Je suis arrivé »',
    map: 'Voir le lieu sur la carte',
    absence: 'Signalement d’absence : {{date}} · {{answer}}',
    answers: {
      was_there: 'le partenaire dit qu’il était sur place',
      admitted: 'le partenaire a reconnu son absence',
      none: 'sans réponse',
    },
    confirmation: 'Client : {{answer}}',
    confirmationAnswers: {
      yes: 'le service a eu lieu',
      no: 'le service n’a pas eu lieu',
      none: 'sans réponse',
    },
    noShow: 'Absence marquée par le partenaire',
    pickup: 'Adresse de prise en charge : {{address}}',
    noCodeReason: 'Motif de l’enregistrement sans code : {{reason}}',
  },
  offerEditor: {
    pickupLegend: 'Où le service commence',
    meetingPoint: 'Au point de rendez-vous',
    buyerAddress: 'Aller chercher le client là où il est',
    sellingUnitLegend: 'Comment vous vendez',
    perPerson: 'Par personne',
    perPersonHint: 'Chaque personne reçoit un code.',
    perGroup: 'Par groupe',
    perGroupHint: 'Un code pour tout le groupe, comme un buggy ou un bateau.',
    groupMaxLabel: 'Nombre maximum de personnes par groupe',
    requireNamesHint:
      'Le nom apparaît sur chaque entrée et l’accueil le vérifie avec une pièce d’identité.',
  },
};

=== src/ui/hooks/useQrScanner.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { useCallback, useEffect, useRef, useState } from 'react';

export type QrScannerState = 'idle' | 'loading' | 'scanning' | 'unsupported' | 'denied';

type ReadQr = (frame: ImageData) => Promise<string | null>;

// Lado maior do quadro enviado ao leitor: QR de portaria fica grande na câmera, e quadro menor
// decodifica mais rápido em celular simples (teste de velocidade da D20).
const MAX_FRAME_SIDE = 720;

let readerPromise: Promise<ReadQr> | null = null;

/**
 * Carrega o `zxing-wasm` só quando a portaria abre o leitor (D20). O `.wasm` sai do próprio
 * domínio: o padrão da biblioteca buscaria no jsDelivr, que a CSP não libera.
 */
function loadReader(): Promise<ReadQr> {
  readerPromise ??= Promise.all([
    import('zxing-wasm/reader'),
    import('zxing-wasm/reader/zxing_reader.wasm?url'),
  ])
    .then(([zxing, wasm]) => {
      zxing.prepareZXingModule({
        overrides: {
          locateFile: (path: string, prefix: string) =>
            path.endsWith('.wasm') ? wasm.default : prefix + path,
        },
      });
      return async (frame: ImageData) => {
        const [result] = await zxing.readBarcodes(frame, {
          formats: ['QRCode'],
          tryHarder: true,
          maxNumberOfSymbols: 1,
        });
        return result?.isValid ? result.text : null;
      };
    })
    .catch((error: unknown) => {
      readerPromise = null;
      throw error;
    });
  return readerPromise;
}

/** Leitura de QR pela câmera em qualquer navegador, com o leitor `zxing-wasm` (D20). */
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
    setState((current) => (current === 'scanning' || current === 'loading' ? 'idle' : current));
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unsupported');
      return;
    }
    setState('loading');
    let read: ReadQr;
    try {
      read = await loadReader();
    } catch {
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
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        stop();
        setState('unsupported');
        return;
      }
      const tick = async () => {
        if (!streamRef.current) return;
        const scale = Math.min(1, MAX_FRAME_SIDE / Math.max(video.videoWidth, video.videoHeight));
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        let value: string | null = null;
        if (canvas.width > 0 && canvas.height > 0) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          value = await read(context.getImageData(0, 0, canvas.width, canvas.height)).catch(
            () => null
          );
        }
        if (value && streamRef.current) {
          stop();
          onDetected(value);
          return;
        }
        frameRef.current = requestAnimationFrame(() => void tick());
      };
      void tick();
    } catch {
      stop();
      setState('denied');
    }
  }, [onDetected, stop]);

  useEffect(() => stop, [stop]);

  return { videoRef, state, start, stop };
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server.ts server/domain/bookings/services/bookingCheckInService.ts server/domain/bookings/services/bookingEntryService.ts server/interfaces/http/bookings/bookingResponses.ts server/interfaces/http/bookings/bookingsController.test.ts src/domain/bookings/adapters/httpBookingsAdapter.ts src/domain/bookings/adapters/localPendingCheckInsAdapter.ts src/domain/bookings/application/usecases/checkInByCodeUseCase.ts src/domain/bookings/application/usecases/checkInEntryUseCase.ts src/domain/bookings/application/usecases/checkInWithoutCodeUseCase.ts src/domain/bookings/application/usecases/setParticipantNameUseCase.ts src/domain/bookings/components/admin/ServiceEvidenceList.tsx src/domain/bookings/components/buyer/BookingCheckInPass.tsx src/domain/bookings/components/buyer/BookingFlow.tsx src/domain/bookings/components/buyer/BookingPurchaseDetails.test.tsx src/domain/bookings/components/buyer/BookingServiceActions.tsx src/domain/bookings/components/buyer/BuyerBookingCard.tsx src/domain/bookings/components/buyer/ParticipantNameDialog.tsx src/domain/bookings/components/buyer/ParticipantsForm.tsx src/domain/bookings/components/buyer/QuantitySelector.tsx src/domain/bookings/components/buyer/UnitPicker.tsx src/domain/bookings/components/partner/BookingServiceControls.tsx src/domain/bookings/components/partner/NoCodeCheckInDialog.tsx src/domain/bookings/components/partner/OfferSellingUnitFields.tsx src/domain/bookings/components/partner/PartnerBookingsList.tsx src/domain/bookings/components/partner/PartnerOfferEditor.tsx src/domain/bookings/components/partner/SlotCheckInSheet.tsx src/domain/bookings/hooks/useBookingCheckInPass.ts src/domain/bookings/hooks/useOfferBookings.ts src/domain/bookings/hooks/useSlotCheckIn.ts src/domain/bookings/ports/bookingsApiPort.ts src/domain/bookings/schemas/offerFormSchema.ts src/domain/bookings/types/bookings.ts src/domain/bookings/utils/bookingErrorMessage.ts src/domain/bookings/utils/bookingsFrontendUtils.test.ts src/domain/bookings/utils/offerFormMapping.ts src/domain/bookings/utils/serviceProofTiming.ts src/domain/bookings/utils/unitLabel.ts src/shared/i18n/bookingsResources.ts src/shared/i18n/serviceProofResources.ts src/ui/hooks/useQrScanner.ts` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique uma revisão nova do Cloud Run (`use-guide`, `us-east1`) e o Hosting com o mesmo código. A CSP nova ('wasm-unsafe-eval') só vale depois dessa publicação; sem ela o leitor de QR não abre.
