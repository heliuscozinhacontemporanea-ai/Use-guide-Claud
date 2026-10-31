# Prompt 21.6b — Carteira e portaria do evento com código INGR, leitor zxing e conferência sem internet

> Lote 18, gerado dos commits de referência `7b032b9..86c0985` da branch `claude/agents-md-v2`. Aplique na ordem do lote (A7, 21.1 a 21.7d), um por vez. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 21.6b — Carteira e portaria do evento com código INGR, leitor zxing e conferência sem internet

Telas aprovadas em 2026-10-30.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras de negócio estão nas decisões D20 e D21 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A7).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) Carteira: o QR do ingresso volta a aparecer (a tela lia um campo que o servidor não manda) e mostra INGR:código no dia, com o aviso contra golpe.
2) Portaria do evento reescrita: leitor zxing-wasm, código de 8 caracteres, resultado com o nome do titular; textos em pt-BR, en e fr e cores do tema.
3) Sem internet: confere a assinatura Ed25519 com as chaves do manifesto; o código não vale sem internet. O hook de 322 linhas vira useOfflineTicketSession e useTicketGate.
4) Alfabeto do código em src/shared/constants, usado por reservas e ingressos.

ARQUIVOS (crie, altere ou apague exatamente estes):
- server/domain/ticketing/usecases/getTicketQrTokenUseCase.ts (alterar)
- server/domain/ticketing/usecases/reissueTicketQrTokenUseCase.ts (alterar)
- src/domain/bookings/utils/checkInPrefix.ts (alterar)
- src/domain/ticketing/adapters/httpTicketingAdapter.ts (alterar)
- src/domain/ticketing/components/PartnerEventTicketingManager.test.tsx (alterar)
- src/domain/ticketing/components/PartnerEventTicketingManager.tsx (alterar)
- src/domain/ticketing/components/UserTicketsHistoryView.tsx (alterar)
- src/domain/ticketing/components/manager/CheckInTab.tsx (alterar)
- src/domain/ticketing/components/manager/OfflineSessionCard.tsx (criar)
- src/domain/ticketing/components/manager/TicketGateCard.tsx (criar)
- src/domain/ticketing/components/wallet/WalletTicketCard.tsx (alterar)
- src/domain/ticketing/hooks/useOfflineCheckIn.ts (apagar)
- src/domain/ticketing/hooks/useOfflineTicketSession.ts (criar)
- src/domain/ticketing/hooks/usePartnerEventSales.ts (alterar)
- src/domain/ticketing/hooks/useTicketGate.ts (criar)
- src/domain/ticketing/hooks/useTicketWalletActions.ts (alterar)
- src/domain/ticketing/ports/ticketingPort.ts (alterar)
- src/domain/ticketing/types/ticketing.ts (alterar)
- src/domain/ticketing/utils/offlineCheckInStorage.ts (alterar)
- src/domain/ticketing/utils/offlineTicketVerifier.test.ts (criar)
- src/domain/ticketing/utils/offlineTicketVerifier.ts (criar)
- src/domain/ticketing/utils/ticketCode.ts (criar)
- src/shared/constants/checkInCode.ts (criar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/i18n/ticketGateResources.ts (criar)
- src/shared/i18n/ticketWalletResources.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== server/domain/ticketing/usecases/getTicketQrTokenUseCase.ts — diff ===
@@ -8,6 +8,8 @@ export async function getTicketQrTokenUseCase(
   ticketId: string;
   token: string;
   expiresAt: string;
+  code: string | null;
+  codeVisibleFrom: string | null;
 }> {
   return checkInService.generateTicketPresentationQr(actor, ticketId);
 }

=== server/domain/ticketing/usecases/reissueTicketQrTokenUseCase.ts — diff ===
@@ -8,6 +8,8 @@ export async function reissueTicketQrTokenUseCase(
   ticketId: string;
   token: string;
   expiresAt: string;
+  code: string | null;
+  codeVisibleFrom: string | null;
 }> {
   return checkInService.generateTicketPresentationQr(actor, ticketId);
 }

=== src/domain/bookings/utils/checkInPrefix.ts — diff ===
@@ -1,7 +1,6 @@
 import type { OfferKind } from '../types/bookings';
 
-/** Alfabeto do código: sem 0/O e 1/I/L, como no backend (D20). */
-export const CHECK_IN_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
+export { CHECK_IN_ALPHABET } from '../../../shared/constants/checkInCode';
 export const CHECK_IN_CODE_LENGTH = 6;
 export const ENTRY_CODE_LENGTH = 8;

=== src/domain/ticketing/adapters/httpTicketingAdapter.ts — diff ===
@@ -12,6 +12,7 @@ import type {
   PublicTicketTypeProjection,
   Refund,
   Ticket,
+  TicketQrPass,
   TicketOrder,
   TicketOrderItem,
   TicketType,
@@ -207,25 +208,19 @@ export class HttpTicketingAdapter implements TicketingPort {
     return parseJsonOrThrow<Ticket[]>(res, 'Não foi possível carregar seus ingressos.');
   }
 
-  async getTicketQrToken(ticketId: string): Promise<{
-    ticket: Ticket;
-    rawQrToken: string;
-  }> {
+  async getTicketQrToken(ticketId: string): Promise<TicketQrPass> {
     const res = await firebaseApiFetch(
       `/api/ticketing/tickets/${encodeURIComponent(ticketId)}/qr`,
       { method: 'GET' },
       { requireAuth: true }
     );
-    return parseJsonOrThrow<{ ticket: Ticket; rawQrToken: string }>(
+    return parseJsonOrThrow<TicketQrPass>(
       res,
       'Não foi possível gerar o QR Code assinado do ingresso.'
     );
   }
 
-  async reissueTicketQrToken(ticketId: string): Promise<{
-    ticket: Ticket;
-    rawQrToken: string;
-  }> {
+  async reissueTicketQrToken(ticketId: string): Promise<TicketQrPass> {
     const res = await firebaseApiFetch(
       `/api/ticketing/tickets/${encodeURIComponent(ticketId)}/qr/reissue`,
       {
@@ -235,10 +230,7 @@ export class HttpTicketingAdapter implements TicketingPort {
       },
       { requireAuth: true }
     );
-    return parseJsonOrThrow<{ ticket: Ticket; rawQrToken: string }>(
-      res,
-      'Não foi possível reemitir o QR Code do ingresso.'
-    );
+    return parseJsonOrThrow<TicketQrPass>(res, 'Não foi possível reemitir o QR Code do ingresso.');
   }
 
   async requestRefund(
@@ -285,6 +277,8 @@ export class HttpTicketingAdapter implements TicketingPort {
     occurrenceId: string;
     ticketId?: string;
     qrToken?: string;
+    /** Código de 8 caracteres do ingresso, quando o QR não lê (D20). */
+    code?: string;
   }): Promise<{ ticket: Ticket; checkIn: EventCheckIn }> {
     const res = await firebaseApiFetch(
       '/api/ticketing/check-in',
@@ -329,6 +323,7 @@ export class HttpTicketingAdapter implements TicketingPort {
       clientEventId: string;
       ticketId: string;
       qrToken: string;
+      qrVersion: number;
       checkedInAt: string;
     }>;
   }): Promise<{ results: OfflineCheckInSyncResult[] }> {

=== src/domain/ticketing/components/PartnerEventTicketingManager.test.tsx — diff ===
@@ -44,7 +44,9 @@ describe('PartnerEventTicketingManager (divisão em abas, sem mudar comportament
       screen.getByText('Nenhum pedido ou participante registrado para este evento.')
     ).toBeTruthy();
     fireEvent.click(screen.getByRole('button', { name: /Check-in/ }));
-    expect(screen.getByText('Preparar Check-in Offline')).toBeTruthy();
+    expect(
+      screen.getByRole('button', { name: /Preparar sem internet|Prepare offline/ })
+    ).toBeTruthy();
     fireEvent.click(screen.getByRole('button', { name: /Reembolsos/ }));
     expect(
       screen.getByText('Nenhuma solicitação de reembolso registrada para este evento.')

=== src/domain/ticketing/components/PartnerEventTicketingManager.tsx — diff ===
@@ -1,7 +1,6 @@
 import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
 import { type ReactNode, useEffect, useState } from 'react';
 import { type EventOccurrence, useEventOccurrences } from '../../events';
-import { useOfflineCheckIn } from '../hooks/useOfflineCheckIn';
 import { usePartnerEventSales } from '../hooks/usePartnerEventSales';
 import { useTicketLotForm } from '../hooks/useTicketLotForm';
 import { useManagementTicketTypes } from '../hooks/useTicketTypes';
@@ -63,13 +62,6 @@ export function PartnerEventTicketingManager({
   const [feedback, setFeedback] = useState<ManagerFeedback | null>(null);
 
   const lotForm = useTicketLotForm({ selectedOccurrenceId, reloadLots, setFeedback });
-  const checkIn = useOfflineCheckIn({
-    eventListingId,
-    selectedOccurrenceId,
-    performCheckIn,
-    reloadSales,
-    setFeedback,
-  });
 
   const selectedOccurrence = occurrences.find((occ) => occ.id === selectedOccurrenceId);
   const paidOrders = orders.filter(
@@ -166,9 +158,10 @@ export function PartnerEventTicketingManager({
         <AttendeesTab orders={orders} />
       ) : activeTab === 'checkin' ? (
         <CheckInTab
-          checkIn={checkIn}
+          occurrenceId={selectedOccurrenceId}
           checkIns={checkIns}
-          selectedOccurrenceId={selectedOccurrenceId}
+          performCheckIn={performCheckIn}
+          reloadSales={reloadSales}
         />
       ) : activeTab === 'refunds' ? (
         <RefundsTab refunds={refunds} />

=== src/domain/ticketing/components/UserTicketsHistoryView.tsx — diff ===
@@ -110,9 +110,7 @@ export function UserTicketsHistoryView({ onBack }: UserTicketsHistoryViewProps =
             <WalletTicketCard
               key={ticket.id}
               ticket={ticket}
-              qrDataUrl={
-                actions.qrPreview?.ticketId === ticket.id ? actions.qrPreview.dataUrl : undefined
-              }
+              qr={actions.qrPreview?.ticketId === ticket.id ? actions.qrPreview : undefined}
               canTransfer={canTransferTicket(
                 ticket,
                 orders.find((order) => order.id === ticket.orderId),

=== src/domain/ticketing/components/manager/CheckInTab.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { useOfflineTicketSession } from '../../hooks/useOfflineTicketSession';
import type { usePartnerEventSales } from '../../hooks/usePartnerEventSales';
import { useTicketGate } from '../../hooks/useTicketGate';
import type { EventCheckIn } from '../../types/ticketing';
import { OfflineSessionCard } from './OfflineSessionCard';
import { TicketGateCard } from './TicketGateCard';

/** Aba de check-in do evento: portaria, sessão sem internet e entradas já feitas. */
export function CheckInTab({
  occurrenceId,
  checkIns,
  performCheckIn,
  reloadSales,
}: {
  occurrenceId: string;
  checkIns: EventCheckIn[];
  performCheckIn: ReturnType<typeof usePartnerEventSales>['performCheckIn'];
  reloadSales: () => Promise<void> | void;
}) {
  const { t, i18n } = useTranslation();
  const session = useOfflineTicketSession(occurrenceId, reloadSales);
  const gate = useTicketGate({
    occurrenceId,
    performCheckIn: async (id, input) => {
      const result = await performCheckIn(id, input);
      await session.refresh();
      return result;
    },
    onOfflineRecorded: session.refresh,
  });

  return (
    <div className="space-y-4">
      <TicketGateCard gate={gate} />
      <OfflineSessionCard session={session} />
      {checkIns.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-ink">{t('ticketGate.recent')}</h3>
          <ul className="space-y-2">
            {checkIns.map((checkIn) => (
              <li
                key={checkIn.id}
                className="p-3 rounded-xl bg-surface border border-line flex flex-wrap items-center justify-between gap-2 text-[13px]"
              >
                <span className="text-ink">
                  {t('ticketGate.ticketRef', { id: checkIn.ticketId.slice(0, 8) })}
                  <span className="text-ink/70">
                    {' · '}
                    {t(
                      checkIn.method === 'offline_sync'
                        ? 'ticketGate.method.offline'
                        : 'ticketGate.method.online'
                    )}
                  </span>
                </span>
                <span className="text-ink/70">
                  {formatBusinessDateTime(checkIn.checkedInAt, i18n.language)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

=== src/domain/ticketing/components/manager/OfflineSessionCard.tsx — ARQUIVO NOVO, conteúdo completo ===
import { CloudOff, Download, Wifi } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import type { useOfflineTicketSession } from '../../hooks/useOfflineTicketSession';

/** Estado da internet e sessão sem internet da portaria: preparar o manifesto e enviar o que ficou guardado. */
export function OfflineSessionCard({
  session,
}: {
  session: ReturnType<typeof useOfflineTicketSession>;
}) {
  const { t } = useTranslation();
  const { isOnline, bundle, pending, preparing, syncing, notice } = session;

  return (
    <section className="p-4 rounded-[20px] bg-surface border border-line space-y-3">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-10 h-10 shrink-0 rounded-xl flex items-center justify-center',
            isOnline ? 'bg-success-soft text-success' : 'bg-warn-soft text-warn'
          )}
        >
          {isOnline ? (
            <Wifi size={18} aria-hidden="true" />
          ) : (
            <CloudOff size={18} aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-semibold text-ink">
            {t(isOnline ? 'ticketGate.online' : 'ticketGate.offlineMode')}
          </p>
          <p className="text-[13px] text-ink/70">
            {bundle
              ? t('ticketGate.prepared', { count: bundle.tickets.length })
              : t('ticketGate.notPrepared')}
          </p>
        </div>
      </div>
      <p className="text-[13px] text-ink/70">{t('ticketGate.offlineHint')}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          disabled={!isOnline || preparing}
          onClick={() => void session.prepare()}
          className={`${BUTTON_SECONDARY} inline-flex items-center gap-1.5`}
        >
          <Download size={16} aria-hidden="true" />
          {t(bundle ? 'ticketGate.prepareAgain' : 'ticketGate.prepare')}
        </button>
        {pending > 0 && (
          <TextButton
            tone="accent"
            disabled={!isOnline || syncing}
            onClick={() => void session.sync()}
          >
            {t('ticketGate.sync', { count: pending })}
          </TextButton>
        )}
      </div>
      {notice && (
        <p role="status">
          <StatusText
            tone={
              notice.kind === 'error' || (notice.kind === 'synced' && notice.conflicts > 0)
                ? 'warn'
                : 'success'
            }
          >
            {notice.kind === 'prepared'
              ? t('ticketGate.preparedNotice', { count: notice.count })
              : notice.kind === 'synced'
                ? notice.conflicts > 0
                  ? t('ticketGate.syncedConflicts', { count: notice.conflicts })
                  : t('ticketGate.synced', { count: notice.count })
                : notice.message || t('ticketGate.failed')}
          </StatusText>
        </p>
      )}
    </section>
  );
}

=== src/domain/ticketing/components/manager/TicketGateCard.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Camera } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CHECK_IN_ALPHABET } from '../../../../shared/constants/checkInCode';
import { cn } from '../../../../shared/utils/cn';
import { CodeBoxesInput } from '../../../../ui/components/CodeBoxesInput';
import { StatusText } from '../../../../ui/components/StatusText';
import { useQrScanner } from '../../../../ui/hooks/useQrScanner';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import type { useTicketGate } from '../../hooks/useTicketGate';
import { TICKET_CODE_LENGTH, TICKET_CODE_PREFIX } from '../../utils/ticketCode';

/** Portaria: ler o QR com a câmera ou digitar o código de 8 caracteres (D20). */
export function TicketGateCard({ gate }: { gate: ReturnType<typeof useTicketGate> }) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const { submit, sending, result } = gate;
  const onQr = useCallback((qrToken: string) => void submit({ qrToken }), [submit]);
  const scanner = useQrScanner(onQr);

  const confirm = async () => {
    if (await submit({ code })) setCode('');
  };

  return (
    <section className="p-4 rounded-[20px] bg-surface border border-line space-y-5">
      <div className="space-y-2">
        {/* O vídeo fica montado: a câmera liga nele assim que a permissão sai. */}
        <video
          ref={scanner.videoRef}
          muted
          playsInline
          className={cn(
            'w-full max-w-sm mx-auto aspect-square rounded-2xl bg-ink/10 object-cover',
            scanner.state !== 'scanning' && 'hidden'
          )}
        />
        {scanner.state === 'scanning' ? (
          <>
            <p className="text-[13px] text-ink/70 text-center">{t('ticketGate.scanning')}</p>
            <button type="button" onClick={scanner.stop} className={`${BUTTON_SECONDARY} w-full`}>
              {t('ticketGate.stopScan')}
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
            {t(scanner.state === 'loading' ? 'ticketGate.scanLoading' : 'ticketGate.scan')}
          </button>
        )}
        {(scanner.state === 'unsupported' || scanner.state === 'denied') && (
          <p className="text-[13px] text-warn">
            {t(
              scanner.state === 'denied' ? 'ticketGate.cameraDenied' : 'ticketGate.scanUnsupported'
            )}
          </p>
        )}
      </div>

      <CodeBoxesInput
        prefix={TICKET_CODE_PREFIX}
        length={TICKET_CODE_LENGTH}
        alphabet={CHECK_IN_ALPHABET}
        value={code}
        onChange={setCode}
        label={t('ticketGate.codeLabel')}
        boxLabel={(index) => t('ticketGate.character', { n: index + 1, total: TICKET_CODE_LENGTH })}
        disabled={sending}
      />

      {result && (
        <p role="status">
          <StatusText tone={result.tone}>{result.message}</StatusText>
        </p>
      )}

      <button
        type="button"
        onClick={() => void confirm()}
        disabled={sending || code.length !== TICKET_CODE_LENGTH}
        className={`${BUTTON_PRIMARY} w-full`}
      >
        {t('ticketGate.submit')}
      </button>
    </section>
  );
}

=== src/domain/ticketing/components/wallet/WalletTicketCard.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { QrCode, RefreshCw, Send, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../../ui/components/GlassCard';
import { cn } from '../../../../shared/utils/cn';
import type { TicketQrPreview } from '../../hooks/useTicketWalletActions';
import type { Ticket } from '../../types/ticketing';
import { TICKET_CODE_PREFIX } from '../../utils/ticketCode';

interface WalletTicketCardProps {
  ticket: Ticket;
  qr?: TicketQrPreview;
  canTransfer: boolean;
  busy: boolean;
  onShowQr: () => void;
  onReissueQr: () => void;
  onTransfer: () => void;
}

const ACTION =
  'min-h-11 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50';

export function WalletTicketCard({
  ticket,
  qr,
  canTransfer,
  busy,
  onShowQr,
  onReissueQr,
  onTransfer,
}: WalletTicketCardProps) {
  const { t, i18n } = useTranslation();
  const startsAt = ticket.eventSnapshot?.startsAt;
  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      timeZone: 'America/Fortaleza',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  return (
    <GlassCard className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-accent">
            {ticket.ticketTypeSnapshot?.name || t('ticketCheckout.issued.defaultType')}
          </p>
          <h4 className="text-sm font-bold text-ink break-words">
            {ticket.eventSnapshot?.title || ticket.holderName}
          </h4>
          <p className="text-xs text-ink/70 break-all">
            {ticket.holderName} • {ticket.holderEmail}
          </p>
          {startsAt && (
            <p className="text-xs text-ink/70 mt-0.5">
              {t('ticketWallet.session', { date: formatDate(startsAt) })}
            </p>
          )}
        </div>
        <span
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-bold shrink-0',
            ticket.status === 'issued'
              ? 'bg-accent-soft text-accent'
              : ticket.status === 'checked_in'
                ? 'bg-success-soft text-success'
                : 'bg-ink/[0.06] text-ink/70'
          )}
        >
          {t(`ticketWallet.ticketStatus.${ticket.status}`, { defaultValue: ticket.status })}
        </span>
      </div>

      {qr && (
        <div className="space-y-3">
          <div className="mx-auto w-full max-w-[240px] aspect-square rounded-2xl bg-white p-3">
            <img
              src={qr.dataUrl}
              width={240}
              height={240}
              alt={t('ticketCheckout.issued.qrAlt', { id: ticket.id.slice(0, 8) })}
              className="w-full h-full"
            />
          </div>
          {qr.code ? (
            <>
              <p
                className="text-center font-display text-[26px] font-bold tracking-[0.12em] tabular-nums text-ink select-all break-all"
                aria-label={t('ticketWallet.code.label', { code: qr.code.split('').join(' ') })}
              >
                {TICKET_CODE_PREFIX}:{qr.code}
              </p>
              <p className="text-[13px] text-ink/70 text-center">{t('ticketWallet.code.hint')}</p>
              <p className="flex items-start gap-2 text-[13px] text-warn">
                <ShieldAlert size={16} className="shrink-0 mt-px" aria-hidden="true" />
                {t('ticketWallet.code.warning')}
              </p>
            </>
          ) : (
            qr.codeVisibleFrom && (
              <p className="text-[13px] text-ink/70 text-center">
                {t('ticketWallet.code.notYet', { date: formatDate(qr.codeVisibleFrom) })}
              </p>
            )
          )}
        </div>
      )}

      {(ticket.status === 'issued' || canTransfer) && (
        <div className="flex items-center gap-2 pt-2 border-t border-line flex-wrap">
          {ticket.status === 'issued' && (
            <button
              type="button"
              disabled={busy}
              onClick={onShowQr}
              className={cn(
                ACTION,
                'flex-1 bg-surface border border-line hover:bg-accent-soft text-ink'
              )}
            >
              <QrCode size={14} className="text-teal-400" aria-hidden="true" />
              {t('ticketWallet.actions.showQr')}
            </button>
          )}
          {ticket.status === 'issued' && qr && (
            <button
              type="button"
              disabled={busy}
              onClick={onReissueQr}
              className={cn(
                ACTION,
                'bg-surface border border-line hover:bg-accent-soft text-ink/80'
              )}
            >
              <RefreshCw size={13} aria-hidden="true" />
              {t('ticketWallet.actions.reissueQr')}
            </button>
          )}
          {canTransfer && (
            <button
              type="button"
              onClick={onTransfer}
              className={cn(ACTION, 'flex-1 bg-accent-soft border border-accent-line text-accent')}
            >
              <Send size={14} aria-hidden="true" />
              {t('ticketWallet.actions.transfer')}
            </button>
          )}
        </div>
      )}
    </GlassCard>
  );
}

=== src/domain/ticketing/hooks/useOfflineCheckIn.ts — APAGUE este arquivo ===

=== src/domain/ticketing/hooks/useOfflineTicketSession.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { createOfflineCheckInSessionUseCase } from '../application/usecases/createOfflineCheckInSessionUseCase';
import { syncOfflineCheckInsUseCase } from '../application/usecases/syncOfflineCheckInsUseCase';
import {
  getOfflineManifestBundle,
  listPendingOfflineCheckInEvents,
  removeSyncedOfflineCheckInEvents,
  saveOfflineManifestBundle,
  type StoredOfflineManifestBundle,
} from '../utils/offlineCheckInStorage';

export type OfflineSessionNotice =
  | { kind: 'prepared'; count: number }
  | { kind: 'synced'; count: number; conflicts: number }
  | { kind: 'error'; message: string };

/** Sessão sem internet da portaria: manifesto no aparelho e envio dos check-ins quando o sinal volta. */
export function useOfflineTicketSession(
  occurrenceId: string,
  onSynced: () => Promise<void> | void
) {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );
  const [bundle, setBundle] = useState<StoredOfflineManifestBundle | null>(null);
  const [pending, setPending] = useState(0);
  const [preparing, setPreparing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState<OfflineSessionNotice | null>(null);

  const refresh = useCallback(async () => {
    if (!occurrenceId) return;
    try {
      const [stored, events] = await Promise.all([
        getOfflineManifestBundle(occurrenceId),
        listPendingOfflineCheckInEvents(occurrenceId),
      ]);
      setBundle(stored);
      setPending(events.length);
    } catch {
      // Sem IndexedDB (modo privado), a portaria funciona só com internet.
    }
  }, [occurrenceId]);

  const sync = useCallback(async () => {
    if (!occurrenceId || !bundle) return;
    const events = await listPendingOfflineCheckInEvents(occurrenceId);
    if (events.length === 0) return;
    setSyncing(true);
    try {
      const { results } = await syncOfflineCheckInsUseCase({
        occurrenceId,
        sessionId: bundle.sessionId,
        stationId: bundle.stationId,
        items: events.map((event) => ({
          clientEventId: event.clientEventId,
          ticketId: event.ticketId,
          qrToken: event.rawToken || event.ticketId,
          qrVersion: event.qrVersion,
          checkedInAt: event.scannedAt,
        })),
      });
      await removeSyncedOfflineCheckInEvents(results.map((item) => item.clientEventId));
      await refresh();
      await onSynced();
      setNotice({
        kind: 'synced',
        count: results.length,
        conflicts: results.filter((item) => item.status !== 'synced').length,
      });
    } catch (error: unknown) {
      setNotice({ kind: 'error', message: error instanceof Error ? error.message : '' });
    } finally {
      setSyncing(false);
    }
  }, [bundle, occurrenceId, onSynced, refresh]);

  const prepare = useCallback(async () => {
    if (!occurrenceId) return;
    setPreparing(true);
    try {
      const { session, manifest } = await createOfflineCheckInSessionUseCase({
        occurrenceId,
        stationId: `station_${crypto.randomUUID().slice(0, 8)}`,
        ttlHours: 24,
      });
      await saveOfflineManifestBundle({
        occurrenceId,
        eventListingId: session.eventListingId,
        sessionId: session.id,
        stationId: session.stationId,
        issuedAt: session.issuedAt,
        expiresAt: session.expiresAt,
        keys: manifest.keys,
        tickets: manifest.tickets,
      });
      await refresh();
      setNotice({ kind: 'prepared', count: manifest.tickets.length });
    } catch (error: unknown) {
      setNotice({ kind: 'error', message: error instanceof Error ? error.message : '' });
    } finally {
      setPreparing(false);
    }
  }, [occurrenceId, refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      void sync();
    };
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [sync]);

  return { isOnline, bundle, pending, preparing, syncing, notice, prepare, sync, refresh };
}

=== src/domain/ticketing/hooks/usePartnerEventSales.ts — diff ===
@@ -56,14 +56,9 @@ export function usePartnerEventSales(
   }, [reload]);
 
   const performCheckIn = useCallback(
-    async (targetOccurrenceId: string, codeOrTicketId: string) => {
+    async (targetOccurrenceId: string, input: { qrToken: string } | { code: string }) => {
       setError(null);
-      const trimmed = codeOrTicketId.trim();
-      const isQrToken = trimmed.startsWith('ug_tkt_') || trimmed.startsWith('ugt2.');
-      const res = await checkInTicketUseCase({
-        occurrenceId: targetOccurrenceId,
-        ...(isQrToken ? { qrToken: trimmed } : { ticketId: trimmed }),
-      });
+      const res = await checkInTicketUseCase({ occurrenceId: targetOccurrenceId, ...input });
       await reload();
       return res;
     },

=== src/domain/ticketing/hooks/useTicketGate.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { EventCheckIn, Ticket } from '../types/ticketing';
import { verifyAndConsumeOfflineQrToken } from '../utils/offlineTicketVerifier';

export interface GateResult {
  tone: 'success' | 'warn' | 'danger';
  message: string;
}

type GateInput = { qrToken: string } | { code: string };

// `fetch` sem rede rejeita com TypeError; erro do servidor chega como Error com a mensagem.
function isNetworkFailure(error: unknown): boolean {
  return !navigator.onLine || error instanceof TypeError;
}

/**
 * Portaria do evento: QR ou código de 8 caracteres com internet; sem internet, só o QR, conferido
 * pela assinatura no aparelho. O código nunca vale sem internet (D20, §7.7).
 */
export function useTicketGate({
  occurrenceId,
  performCheckIn,
  onOfflineRecorded,
}: {
  occurrenceId: string;
  performCheckIn: (
    occurrenceId: string,
    input: GateInput
  ) => Promise<{ ticket: Ticket; checkIn: EventCheckIn }>;
  onOfflineRecorded: () => Promise<void> | void;
}) {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<GateResult | null>(null);

  const offline = useCallback(
    async (input: GateInput): Promise<GateResult> => {
      if (!('qrToken' in input)) {
        return { tone: 'warn', message: t('ticketGate.codeNeedsInternet') };
      }
      const verified = await verifyAndConsumeOfflineQrToken({
        rawToken: input.qrToken,
        occurrenceId,
      });
      if (!verified.valid) {
        return { tone: 'danger', message: t(`ticketGate.offline.${verified.reason}`) };
      }
      await onOfflineRecorded();
      return { tone: 'success', message: t('ticketGate.offlineSaved') };
    },
    [occurrenceId, onOfflineRecorded, t]
  );

  const submit = useCallback(
    async (input: GateInput): Promise<boolean> => {
      if (!occurrenceId) return false;
      setSending(true);
      setResult(null);
      try {
        const { ticket } = await performCheckIn(occurrenceId, input);
        setResult({
          tone: 'success',
          message: t('ticketGate.success', {
            name: ticket.holderName || t('ticketGate.holderFallback'),
            type: ticket.ticketTypeSnapshot?.name || t('ticketCheckout.issued.defaultType'),
          }),
        });
        return true;
      } catch (error: unknown) {
        if (isNetworkFailure(error)) {
          const outcome = await offline(input);
          setResult(outcome);
          return outcome.tone === 'success';
        }
        setResult({
          tone: 'danger',
          message: error instanceof Error && error.message ? error.message : t('ticketGate.failed'),
        });
        return false;
      } finally {
        setSending(false);
      }
    },
    [occurrenceId, offline, performCheckIn, t]
  );

  return { submit, sending, result };
}

=== src/domain/ticketing/hooks/useTicketWalletActions.ts — diff ===
@@ -2,7 +2,7 @@ import QRCode from 'qrcode';
 import { useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { createTicketOrderPaymentIntentUseCase } from '../application/usecases/createTicketOrderPaymentIntentUseCase';
-import type { Ticket, TicketOrder } from '../types/ticketing';
+import type { Ticket, TicketOrder, TicketQrPass } from '../types/ticketing';
 import type { useUserTicketsAndOrders } from './useUserTickets';
 
 type WalletData = ReturnType<typeof useUserTicketsAndOrders>;
@@ -12,6 +12,14 @@ export interface WalletFeedback {
   message: string;
 }
 
+/** QR e código de 8 caracteres de um ingresso aberto na carteira (D20). */
+export interface TicketQrPreview {
+  ticketId: string;
+  dataUrl: string;
+  code: string | null;
+  codeVisibleFrom: string | null;
+}
+
 export interface ResumingOrder {
   order: TicketOrder;
   clientSecret: string;
@@ -23,7 +31,7 @@ export function useTicketWalletActions(wallet: WalletData) {
   const { t } = useTranslation();
   const [busy, setBusy] = useState(false);
   const [feedback, setFeedback] = useState<WalletFeedback | null>(null);
-  const [qrPreview, setQrPreview] = useState<{ ticketId: string; dataUrl: string } | null>(null);
+  const [qrPreview, setQrPreview] = useState<TicketQrPreview | null>(null);
   const [resumingOrder, setResumingOrder] = useState<ResumingOrder | null>(null);
   const [transferTicket, setTransferTicket] = useState<Ticket | null>(null);
 
@@ -39,21 +47,29 @@ export function useTicketWalletActions(wallet: WalletData) {
     }
   };
 
-  const previewQr = async (ticketId: string, rawQrToken: string) => {
-    const dataUrl = await QRCode.toDataURL(rawQrToken, { width: 240, margin: 1 });
-    setQrPreview({ ticketId, dataUrl });
+  // Correção média (M): o QR assinado é longo e precisa continuar legível com o brilho baixo.
+  const previewQr = async (pass: TicketQrPass) => {
+    const dataUrl = await QRCode.toDataURL(pass.token, {
+      errorCorrectionLevel: 'M',
+      width: 480,
+      margin: 1,
+    });
+    setQrPreview({
+      ticketId: pass.ticketId,
+      dataUrl,
+      code: pass.code,
+      codeVisibleFrom: pass.codeVisibleFrom,
+    });
   };
 
   const showQr = (ticket: Ticket) =>
     run(async () => {
-      const { rawQrToken } = await wallet.getSignedQrToken(ticket.id);
-      await previewQr(ticket.id, rawQrToken);
+      await previewQr(await wallet.getSignedQrToken(ticket.id));
     }, 'ticketWallet.errors.qr');
 
   const reissueQr = (ticket: Ticket) =>
     run(async () => {
-      const { rawQrToken } = await wallet.reissueSignedQrToken(ticket.id);
-      await previewQr(ticket.id, rawQrToken);
+      await previewQr(await wallet.reissueSignedQrToken(ticket.id));
       setFeedback({ type: 'success', message: t('ticketWallet.feedback.qrReissued') });
     }, 'ticketWallet.errors.qrReissue');

=== src/domain/ticketing/ports/ticketingPort.ts — diff ===
@@ -6,6 +6,7 @@ import type {
   PublicTicketTypeProjection,
   Refund,
   Ticket,
+  TicketQrPass,
   TicketOrder,
   TicketOrderItem,
   TicketType,
@@ -95,14 +96,8 @@ export interface TicketingPort {
     serverNow?: string;
   }>;
   listUserTickets(): Promise<Ticket[]>;
-  getTicketQrToken(ticketId: string): Promise<{
-    ticket: Ticket;
-    rawQrToken: string;
-  }>;
-  reissueTicketQrToken(ticketId: string): Promise<{
-    ticket: Ticket;
-    rawQrToken: string;
-  }>;
+  getTicketQrToken(ticketId: string): Promise<TicketQrPass>;
+  reissueTicketQrToken(ticketId: string): Promise<TicketQrPass>;
   requestRefund(
     orderId: string,
     input: { ticketId?: string; reason: string; idempotencyKey: string }
@@ -119,6 +114,8 @@ export interface TicketingPort {
     occurrenceId: string;
     ticketId?: string;
     qrToken?: string;
+    /** Código de 8 caracteres do ingresso, quando o QR não lê (D20). */
+    code?: string;
   }): Promise<{ ticket: Ticket; checkIn: EventCheckIn }>;
   createOfflineCheckInSession(input: {
     occurrenceId: string;
@@ -133,6 +130,7 @@ export interface TicketingPort {
       clientEventId: string;
       ticketId: string;
       qrToken: string;
+      qrVersion: number;
       checkedInAt: string;
     }>;
   }): Promise<{ results: OfflineCheckInSyncResult[] }>;

=== src/domain/ticketing/types/ticketing.ts — diff ===
@@ -227,6 +227,15 @@ export interface EventSalesAnalytics {
   ordersPending: number;
 }
 
+/** QR assinado do ingresso e código de 8 caracteres, que só aparece no dia da sessão (D20). */
+export interface TicketQrPass {
+  ticketId: string;
+  token: string;
+  expiresAt: string;
+  code: string | null;
+  codeVisibleFrom: string | null;
+}
+
 export interface OfflineCheckInSessionResponse {
   session: {
     id: string;
@@ -240,12 +249,14 @@ export interface OfflineCheckInSessionResponse {
     status: 'active' | 'expired' | 'revoked';
     keyId: string;
   };
-  publicKeyPem: string;
-  manifest: Array<{
-    ticketIdHash: string;
-    qrVersion: number;
-    status: 'issued' | 'checked_in';
-  }>;
+  manifest: {
+    sessionId: string;
+    occurrenceId: string;
+    expiresAt: string;
+    /** Chave atual e, na rotação, a anterior: o aparelho confere o QR sem internet. */
+    keys: Array<{ kid: string; publicKeyJwk: JsonWebKey }>;
+    tickets: Array<{ ticketIdHash: string; qrVersion: number }>;
+  };
 }
 
 export interface OfflineCheckInSyncResult {

=== src/domain/ticketing/utils/offlineCheckInStorage.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
export interface StoredOfflineManifestBundle {
  occurrenceId: string;
  eventListingId: string;
  sessionId: string;
  stationId: string;
  issuedAt: string;
  expiresAt: string;
  /** Chaves públicas Ed25519 aceitas (atual e, na rotação, a anterior). */
  keys: Array<{ kid: string; publicKeyJwk: JsonWebKey }>;
  tickets: Array<{ ticketIdHash: string; qrVersion: number }>;
}

export interface StoredOfflineCheckInEvent {
  clientEventId: string;
  sessionId: string;
  occurrenceId: string;
  ticketId: string;
  ticketIdHash: string;
  qrVersion: number;
  scannedAt: string;
  rawToken?: string;
}

const DB_NAME = 'use_guide_offline_checkin_db';
const DB_VERSION = 1;
const STORE_MANIFEST = 'offline_ticket_manifest';
const STORE_EVENTS = 'offline_checkin_events';
const STORE_USED = 'offline_used_tickets';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_MANIFEST)) {
        db.createObjectStore(STORE_MANIFEST, { keyPath: 'occurrenceId' });
      }
      if (!db.objectStoreNames.contains(STORE_EVENTS)) {
        db.createObjectStore(STORE_EVENTS, { keyPath: 'clientEventId' });
      }
      if (!db.objectStoreNames.contains(STORE_USED)) {
        db.createObjectStore(STORE_USED, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveOfflineManifestBundle(
  bundle: StoredOfflineManifestBundle
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    // O manifesto só traz ingressos ainda não usados: quem já entrou fica de fora (servidor).
    const tx = db.transaction(STORE_MANIFEST, 'readwrite');
    tx.objectStore(STORE_MANIFEST).put(bundle);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getOfflineManifestBundle(
  occurrenceId: string
): Promise<StoredOfflineManifestBundle | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MANIFEST, 'readonly');
    const req = tx.objectStore(STORE_MANIFEST).get(occurrenceId);
    req.onsuccess = () => {
      db.close();
      resolve((req.result as StoredOfflineManifestBundle) || null);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function isTicketMarkedUsedOffline(
  occurrenceId: string,
  ticketIdHash: string
): Promise<boolean> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_USED, 'readonly');
    const req = tx.objectStore(STORE_USED).get(`${occurrenceId}:${ticketIdHash}`);
    req.onsuccess = () => {
      db.close();
      resolve(Boolean(req.result));
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function recordOfflineCheckInEvent(event: StoredOfflineCheckInEvent): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_EVENTS, STORE_USED], 'readwrite');
    tx.objectStore(STORE_EVENTS).put(event);
    tx.objectStore(STORE_USED).put({
      key: `${event.occurrenceId}:${event.ticketIdHash}`,
      occurrenceId: event.occurrenceId,
      ticketIdHash: event.ticketIdHash,
      usedAt: event.scannedAt,
    });
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function listPendingOfflineCheckInEvents(
  occurrenceId?: string
): Promise<StoredOfflineCheckInEvent[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_EVENTS, 'readonly');
    const req = tx.objectStore(STORE_EVENTS).getAll();
    req.onsuccess = () => {
      db.close();
      const all = (req.result as StoredOfflineCheckInEvent[]) || [];
      resolve(occurrenceId ? all.filter((e) => e.occurrenceId === occurrenceId) : all);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function removeSyncedOfflineCheckInEvents(clientEventIds: string[]): Promise<void> {
  if (clientEventIds.length === 0) return;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_EVENTS, 'readwrite');
    const store = tx.objectStore(STORE_EVENTS);
    for (const id of clientEventIds) {
      store.delete(id);
    }
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function sha256HexBrowser(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

=== src/domain/ticketing/utils/offlineTicketVerifier.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { generateKeyPairSync, sign } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = vi.hoisted(() => ({
  bundle: null as unknown,
  used: false,
  recorded: [] as unknown[],
}));

vi.mock('./offlineCheckInStorage', async () => {
  const actual =
    await vi.importActual<typeof import('./offlineCheckInStorage')>('./offlineCheckInStorage');
  return {
    sha256HexBrowser: actual.sha256HexBrowser,
    getOfflineManifestBundle: vi.fn(async () => storage.bundle),
    isTicketMarkedUsedOffline: vi.fn(async () => storage.used),
    recordOfflineCheckInEvent: vi.fn(async (event: unknown) => {
      storage.recorded.push(event);
    }),
  };
});

import { sha256HexBrowser } from './offlineCheckInStorage';
import { verifyAndConsumeOfflineQrToken } from './offlineTicketVerifier';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');

function token(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify({ v: 1, kid: 'tq1', ...payload })).toString('base64url');
  return `UGT1.${body}.${sign(null, Buffer.from(body), privateKey).toString('base64url')}`;
}

const VALID = { tid: 'tkt_1', occ: 'occ_1', qv: 2, exp: Math.floor(Date.now() / 1000) + 3600 };

describe('conferência do QR do ingresso sem internet (D20, B36)', () => {
  beforeEach(async () => {
    storage.used = false;
    storage.recorded = [];
    storage.bundle = {
      occurrenceId: 'occ_1',
      sessionId: 'sess_1',
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
      keys: [{ kid: 'tq1', publicKeyJwk: publicKey.export({ format: 'jwk' }) }],
      tickets: [{ ticketIdHash: await sha256HexBrowser('tkt_1'), qrVersion: 2 }],
    };
  });

  it('aceita o QR assinado e guarda a entrada para enviar depois', async () => {
    const result = await verifyAndConsumeOfflineQrToken({
      rawToken: token(VALID),
      occurrenceId: 'occ_1',
    });
    expect(result.valid).toBe(true);
    expect(storage.recorded).toHaveLength(1);
  });

  it('recusa QR adulterado, de outra sessão, substituído ou já usado', async () => {
    const [prefix, , signature] = token(VALID).split('.');
    const forged = Buffer.from(
      JSON.stringify({ v: 1, kid: 'tq1', ...VALID, tid: 'tkt_9' })
    ).toString('base64url');
    const cases: Array<[string, string]> = [
      [`${prefix}.${forged}.${signature}`, 'signature'],
      [token({ ...VALID, occ: 'occ_2' }), 'otherSession'],
      [token({ ...VALID, qv: 1 }), 'revoked'],
      ['ug_tkt_abc', 'format'],
    ];
    for (const [rawToken, reason] of cases) {
      await expect(
        verifyAndConsumeOfflineQrToken({ rawToken, occurrenceId: 'occ_1' })
      ).resolves.toEqual({ valid: false, reason });
    }
    storage.used = true;
    await expect(
      verifyAndConsumeOfflineQrToken({ rawToken: token(VALID), occurrenceId: 'occ_1' })
    ).resolves.toEqual({ valid: false, reason: 'used' });
    expect(storage.recorded).toHaveLength(0);
  });
});

=== src/domain/ticketing/utils/offlineTicketVerifier.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  getOfflineManifestBundle,
  isTicketMarkedUsedOffline,
  recordOfflineCheckInEvent,
  sha256HexBrowser,
  type StoredOfflineCheckInEvent,
} from './offlineCheckInStorage';

/** Motivo de recusa, traduzido na tela (`ticketGate.offline.<motivo>`). */
export type OfflineRejection =
  | 'notPrepared'
  | 'sessionExpired'
  | 'format'
  | 'signature'
  | 'expired'
  | 'otherSession'
  | 'notInManifest'
  | 'revoked'
  | 'used'
  | 'unsupported';

interface TicketQrContent {
  kid: string;
  tid: string;
  occ: string;
  qv: number;
  exp: number;
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/**
 * Confere a assinatura Ed25519 do QR com as chaves do manifesto, no aparelho, e marca o ingresso
 * como usado nesta estação até sincronizar. Navegador sem Ed25519 no WebCrypto devolve `unsupported`.
 * Referência: https://developer.mozilla.org/docs/Web/API/SubtleCrypto/verify#ed25519
 */
export async function verifyAndConsumeOfflineQrToken(params: {
  rawToken: string;
  occurrenceId: string;
}): Promise<
  { valid: true; event: StoredOfflineCheckInEvent } | { valid: false; reason: OfflineRejection }
> {
  const bundle = await getOfflineManifestBundle(params.occurrenceId);
  if (!bundle) return { valid: false, reason: 'notPrepared' };
  if (Date.now() > new Date(bundle.expiresAt).getTime()) {
    return { valid: false, reason: 'sessionExpired' };
  }
  const token = params.rawToken.trim();
  const [prefix, body, signature, extra] = token.split('.');
  if (prefix !== 'UGT1' || !body || !signature || extra !== undefined) {
    return { valid: false, reason: 'format' };
  }
  let content: TicketQrContent;
  try {
    content = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body))) as TicketQrContent;
  } catch {
    return { valid: false, reason: 'format' };
  }
  const key = bundle.keys.find((candidate) => candidate.kid === content.kid);
  if (!key || !globalThis.crypto?.subtle) return { valid: false, reason: 'unsupported' };
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
    if (!valid) return { valid: false, reason: 'signature' };
  } catch {
    return { valid: false, reason: 'unsupported' };
  }
  if (content.exp * 1000 < Date.now()) return { valid: false, reason: 'expired' };
  if (content.occ !== params.occurrenceId) return { valid: false, reason: 'otherSession' };

  const ticketIdHash = await sha256HexBrowser(content.tid);
  const entry = bundle.tickets.find((ticket) => ticket.ticketIdHash === ticketIdHash);
  if (!entry) return { valid: false, reason: 'notInManifest' };
  if (entry.qrVersion !== content.qv) return { valid: false, reason: 'revoked' };
  if (await isTicketMarkedUsedOffline(params.occurrenceId, ticketIdHash)) {
    return { valid: false, reason: 'used' };
  }
  const event: StoredOfflineCheckInEvent = {
    clientEventId: crypto.randomUUID(),
    sessionId: bundle.sessionId,
    occurrenceId: params.occurrenceId,
    ticketId: content.tid,
    ticketIdHash,
    qrVersion: content.qv,
    scannedAt: new Date().toISOString(),
    rawToken: token,
  };
  await recordOfflineCheckInEvent(event);
  return { valid: true, event };
}

=== src/domain/ticketing/utils/ticketCode.ts — ARQUIVO NOVO, conteúdo completo ===
/** Código do ingresso junto do QR: 8 caracteres com o prefixo `INGR` só na tela (D20). */
export const TICKET_CODE_PREFIX = 'INGR';
export const TICKET_CODE_LENGTH = 8;

=== src/shared/constants/checkInCode.ts — ARQUIVO NOVO, conteúdo completo ===
/** Alfabeto dos códigos de check-in: sem 0/O e 1/I/L, igual ao backend (D20). */
export const CHECK_IN_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

=== src/shared/i18n/resources.ts — diff ===
@@ -104,6 +104,12 @@ import {
   ticketWalletFr,
   ticketWalletPtBR,
 } from './ticketWalletResources';
+import {
+  type TicketGateTranslation,
+  ticketGateEn,
+  ticketGateFr,
+  ticketGatePtBR,
+} from './ticketGateResources';
 import { type LegalTranslation, legalEn, legalFr, legalPtBR } from './legalResources';
 import {
   type VerificationTranslation,
@@ -131,6 +137,7 @@ export interface TranslationResource {
   salesPolicy: SalesPolicyTranslation;
   ticketCheckout: TicketCheckoutTranslation;
   ticketWallet: TicketWalletTranslation;
+  ticketGate: TicketGateTranslation;
   legal: LegalTranslation;
   verification: VerificationTranslation;
   common: {
@@ -362,6 +369,7 @@ const ptBR: TranslationResource = {
   salesPolicy: salesPolicyPtBR,
   ticketCheckout: ticketCheckoutPtBR,
   ticketWallet: ticketWalletPtBR,
+  ticketGate: ticketGatePtBR,
   legal: legalPtBR,
   verification: verificationPtBR,
   common: {
@@ -653,6 +661,7 @@ const en: TranslationResource = {
   salesPolicy: salesPolicyEn,
   ticketCheckout: ticketCheckoutEn,
   ticketWallet: ticketWalletEn,
+  ticketGate: ticketGateEn,
   legal: legalEn,
   verification: verificationEn,
   common: {
@@ -938,6 +947,7 @@ const fr: TranslationResource = {
   salesPolicy: salesPolicyFr,
   ticketCheckout: ticketCheckoutFr,
   ticketWallet: ticketWalletFr,
+  ticketGate: ticketGateFr,
   legal: legalFr,
   verification: verificationFr,
   common: {

=== src/shared/i18n/ticketGateResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos da portaria de eventos: QR, código INGR e sessão sem internet (D20). pt-BR é a fonte. */
type OfflineReason =
  | 'notPrepared'
  | 'sessionExpired'
  | 'format'
  | 'signature'
  | 'expired'
  | 'otherSession'
  | 'notInManifest'
  | 'revoked'
  | 'used'
  | 'unsupported';

export interface TicketGateTranslation {
  scan: string;
  scanLoading: string;
  scanning: string;
  stopScan: string;
  scanUnsupported: string;
  cameraDenied: string;
  codeLabel: string;
  character: string;
  submit: string;
  success: string;
  holderFallback: string;
  failed: string;
  codeNeedsInternet: string;
  offlineSaved: string;
  offline: Record<OfflineReason, string>;
  online: string;
  offlineMode: string;
  prepared_one: string;
  prepared_other: string;
  notPrepared: string;
  offlineHint: string;
  prepare: string;
  prepareAgain: string;
  sync_one: string;
  sync_other: string;
  preparedNotice_one: string;
  preparedNotice_other: string;
  synced_one: string;
  synced_other: string;
  syncedConflicts_one: string;
  syncedConflicts_other: string;
  recent: string;
  ticketRef: string;
  method: { online: string; offline: string };
}

export const ticketGatePtBR: TicketGateTranslation = {
  scan: 'Ler QR Code',
  scanLoading: 'Abrindo a câmera…',
  scanning: 'Aponte a câmera para o QR Code do ingresso',
  stopScan: 'Parar câmera',
  scanUnsupported: 'Não foi possível abrir o leitor. Digite o código que aparece abaixo do QR.',
  cameraDenied: 'Sem acesso à câmera. Digite o código que aparece abaixo do QR.',
  codeLabel: 'Código do ingresso',
  character: 'Caractere {{n}} de {{total}}',
  submit: 'Confirmar check-in',
  success: 'Entrada liberada: {{name}} · {{type}}.',
  holderFallback: 'Ingresso válido',
  failed: 'Não foi possível validar o ingresso.',
  codeNeedsInternet: 'Sem internet o código não vale. Leia o QR Code.',
  offlineSaved:
    'QR válido, conferido sem internet. A entrada será enviada quando a conexão voltar.',
  offline: {
    notPrepared: 'Sem internet e sem sessão preparada: prepare o check-in sem internet antes.',
    sessionExpired: 'A sessão sem internet venceu. Conecte-se e prepare de novo.',
    format: 'Este QR não é um ingresso do Use Guide.',
    signature: 'QR adulterado ou falso.',
    expired: 'Este QR venceu.',
    otherSession: 'Este ingresso é de outra sessão do evento.',
    notInManifest: 'Ingresso já usado ou cancelado.',
    revoked: 'Este QR foi substituído (ingresso transferido).',
    used: 'Este ingresso já entrou por este aparelho.',
    unsupported: 'Este aparelho não confere QR sem internet. Use outro ou aguarde o sinal.',
  },
  online: 'Com internet',
  offlineMode: 'Sem internet',
  prepared_one: 'Pronto para funcionar sem internet · {{count}} ingresso',
  prepared_other: 'Pronto para funcionar sem internet · {{count}} ingressos',
  notPrepared: 'Check-in sem internet não preparado',
  offlineHint:
    'Prepare antes de abrir os portões. Sem sinal, o QR é conferido no aparelho e as entradas são enviadas depois.',
  prepare: 'Preparar sem internet',
  prepareAgain: 'Atualizar lista',
  sync_one: 'Enviar {{count}} entrada guardada',
  sync_other: 'Enviar {{count}} entradas guardadas',
  preparedNotice_one: 'Pronto: {{count}} ingresso salvo no aparelho.',
  preparedNotice_other: 'Pronto: {{count}} ingressos salvos no aparelho.',
  synced_one: '{{count}} entrada enviada.',
  synced_other: '{{count}} entradas enviadas.',
  syncedConflicts_one: '{{count}} entrada já tinha sido feita em outro aparelho.',
  syncedConflicts_other: '{{count}} entradas já tinham sido feitas em outro aparelho.',
  recent: 'Entradas feitas',
  ticketRef: 'Ingresso #{{id}}',
  method: { online: 'com internet', offline: 'enviada depois' },
};

export const ticketGateEn: TicketGateTranslation = {
  scan: 'Scan QR code',
  scanLoading: 'Opening the camera…',
  scanning: 'Point the camera at the ticket QR code',
  stopScan: 'Stop camera',
  scanUnsupported: 'The reader could not open. Type the code shown below the QR.',
  cameraDenied: 'No camera access. Type the code shown below the QR.',
  codeLabel: 'Ticket code',
  character: 'Character {{n}} of {{total}}',
  submit: 'Confirm check-in',
  success: 'Entry allowed: {{name}} · {{type}}.',
  holderFallback: 'Valid ticket',
  failed: 'Could not validate the ticket.',
  codeNeedsInternet: 'Without internet the code is not valid. Scan the QR code.',
  offlineSaved: 'Valid QR, checked offline. The entry will be sent when the connection is back.',
  offline: {
    notPrepared: 'No internet and no prepared session: prepare offline check-in first.',
    sessionExpired: 'The offline session expired. Connect and prepare it again.',
    format: 'This QR is not a Use Guide ticket.',
    signature: 'Tampered or fake QR.',
    expired: 'This QR has expired.',
    otherSession: 'This ticket is for another session of the event.',
    notInManifest: 'Ticket already used or canceled.',
    revoked: 'This QR was replaced (ticket transferred).',
    used: 'This ticket already entered on this device.',
    unsupported: 'This device cannot check QR codes offline. Use another one or wait for signal.',
  },
  online: 'Online',
  offlineMode: 'Offline',
  prepared_one: 'Ready to work offline · {{count}} ticket',
  prepared_other: 'Ready to work offline · {{count}} tickets',
  notPrepared: 'Offline check-in not prepared',
  offlineHint:
    'Prepare before opening the gates. Without signal, the QR is checked on the device and entries are sent later.',
  prepare: 'Prepare offline',
  prepareAgain: 'Update list',
  sync_one: 'Send {{count}} saved entry',
  sync_other: 'Send {{count}} saved entries',
  preparedNotice_one: 'Ready: {{count}} ticket saved on the device.',
  preparedNotice_other: 'Ready: {{count}} tickets saved on the device.',
  synced_one: '{{count}} entry sent.',
  synced_other: '{{count}} entries sent.',
  syncedConflicts_one: '{{count}} entry had already been made on another device.',
  syncedConflicts_other: '{{count}} entries had already been made on another device.',
  recent: 'Entries made',
  ticketRef: 'Ticket #{{id}}',
  method: { online: 'online', offline: 'sent later' },
};

export const ticketGateFr: TicketGateTranslation = {
  scan: 'Lire le QR code',
  scanLoading: 'Ouverture de la caméra…',
  scanning: 'Pointez la caméra vers le QR code du billet',
  stopScan: 'Arrêter la caméra',
  scanUnsupported: 'Le lecteur n’a pas pu s’ouvrir. Saisissez le code affiché sous le QR.',
  cameraDenied: 'Pas d’accès à la caméra. Saisissez le code affiché sous le QR.',
  codeLabel: 'Code du billet',
  character: 'Caractère {{n}} sur {{total}}',
  submit: 'Confirmer l’entrée',
  success: 'Entrée autorisée : {{name}} · {{type}}.',
  holderFallback: 'Billet valide',
  failed: 'Impossible de valider le billet.',
  codeNeedsInternet: 'Sans internet, le code n’est pas valable. Lisez le QR code.',
  offlineSaved: 'QR valide, vérifié hors ligne. L’entrée sera envoyée au retour de la connexion.',
  offline: {
    notPrepared: 'Pas d’internet ni de session préparée : préparez d’abord l’entrée hors ligne.',
    sessionExpired: 'La session hors ligne a expiré. Connectez-vous et préparez-la à nouveau.',
    format: 'Ce QR n’est pas un billet Use Guide.',
    signature: 'QR modifié ou faux.',
    expired: 'Ce QR a expiré.',
    otherSession: 'Ce billet est pour une autre séance de l’événement.',
    notInManifest: 'Billet déjà utilisé ou annulé.',
    revoked: 'Ce QR a été remplacé (billet transféré).',
    used: 'Ce billet est déjà entré avec cet appareil.',
    unsupported:
      'Cet appareil ne vérifie pas les QR hors ligne. Utilisez-en un autre ou attendez le réseau.',
  },
  online: 'En ligne',
  offlineMode: 'Hors ligne',
  prepared_one: 'Prêt à fonctionner hors ligne · {{count}} billet',
  prepared_other: 'Prêt à fonctionner hors ligne · {{count}} billets',
  notPrepared: 'Entrée hors ligne non préparée',
  offlineHint:
    'Préparez avant d’ouvrir les portes. Sans réseau, le QR est vérifié sur l’appareil et les entrées sont envoyées ensuite.',
  prepare: 'Préparer hors ligne',
  prepareAgain: 'Mettre à jour la liste',
  sync_one: 'Envoyer {{count}} entrée gardée',
  sync_other: 'Envoyer {{count}} entrées gardées',
  preparedNotice_one: 'Prêt : {{count}} billet enregistré sur l’appareil.',
  preparedNotice_other: 'Prêt : {{count}} billets enregistrés sur l’appareil.',
  synced_one: '{{count}} entrée envoyée.',
  synced_other: '{{count}} entrées envoyées.',
  syncedConflicts_one: '{{count}} entrée avait déjà été faite sur un autre appareil.',
  syncedConflicts_other: '{{count}} entrées avaient déjà été faites sur un autre appareil.',
  recent: 'Entrées faites',
  ticketRef: 'Billet #{{id}}',
  method: { online: 'en ligne', offline: 'envoyée ensuite' },
};

=== src/shared/i18n/ticketWalletResources.ts — diff ===
@@ -19,7 +19,7 @@ export interface TicketWalletTranslation {
   emptyUpcoming: string;
   emptyPast: string;
   session: string;
-  qrSigned: string;
+  code: { label: string; hint: string; warning: string; notYet: string };
   order: string;
   ticketCount_one: string;
   ticketCount_other: string;
@@ -47,7 +47,13 @@ export const ticketWalletPtBR: TicketWalletTranslation = {
   emptyUpcoming: 'Nenhum ingresso para os próximos eventos.',
   emptyPast: 'Nenhum ingresso de eventos passados.',
   session: 'Sessão: {{date}}',
-  qrSigned: 'QR assinado • v{{version}}',
+  code: {
+    label: 'Código {{code}}',
+    hint: 'Mostre o QR Code na entrada. Se a leitura falhar, informe o código.',
+    warning:
+      'Nunca informe o código por telefone ou mensagem. Ninguém do Use Guide pede este código.',
+    notYet: 'O código aparece no dia do evento, a partir de {{date}}.',
+  },
   order: 'Pedido #{{id}}',
   ticketCount_one: '{{count}} ingresso',
   ticketCount_other: '{{count}} ingressos',
@@ -100,7 +106,12 @@ export const ticketWalletEn: TicketWalletTranslation = {
   emptyUpcoming: 'No tickets for upcoming events.',
   emptyPast: 'No tickets for past events.',
   session: 'Session: {{date}}',
-  qrSigned: 'Signed QR • v{{version}}',
+  code: {
+    label: 'Code {{code}}',
+    hint: 'Show the QR code at the entrance. If it cannot be read, tell them the code.',
+    warning: 'Never share the code by phone or message. No one at Use Guide asks for this code.',
+    notYet: 'The code appears on the day of the event, from {{date}}.',
+  },
   order: 'Order #{{id}}',
   ticketCount_one: '{{count}} ticket',
   ticketCount_other: '{{count}} tickets',
@@ -153,7 +164,13 @@ export const ticketWalletFr: TicketWalletTranslation = {
   emptyUpcoming: 'Aucun billet pour les prochains événements.',
   emptyPast: 'Aucun billet pour les événements passés.',
   session: 'Séance : {{date}}',
-  qrSigned: 'QR signé • v{{version}}',
+  code: {
+    label: 'Code {{code}}',
+    hint: 'Montrez le QR code à l’entrée. Si la lecture échoue, donnez le code.',
+    warning:
+      'Ne communiquez jamais le code par téléphone ou par message. Personne chez Use Guide ne vous le demande.',
+    notYet: 'Le code apparaît le jour de l’événement, à partir de {{date}}.',
+  },
   order: 'Commande n° {{id}}',
   ticketCount_one: '{{count}} billet',
   ticketCount_other: '{{count}} billets',

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/domain/ticketing/usecases/getTicketQrTokenUseCase.ts server/domain/ticketing/usecases/reissueTicketQrTokenUseCase.ts src/domain/bookings/utils/checkInPrefix.ts src/domain/ticketing/adapters/httpTicketingAdapter.ts src/domain/ticketing/components/PartnerEventTicketingManager.test.tsx src/domain/ticketing/components/PartnerEventTicketingManager.tsx src/domain/ticketing/components/UserTicketsHistoryView.tsx src/domain/ticketing/components/manager/CheckInTab.tsx src/domain/ticketing/components/manager/OfflineSessionCard.tsx src/domain/ticketing/components/manager/TicketGateCard.tsx src/domain/ticketing/components/wallet/WalletTicketCard.tsx src/domain/ticketing/hooks/useOfflineTicketSession.ts src/domain/ticketing/hooks/usePartnerEventSales.ts src/domain/ticketing/hooks/useTicketGate.ts src/domain/ticketing/hooks/useTicketWalletActions.ts src/domain/ticketing/ports/ticketingPort.ts src/domain/ticketing/types/ticketing.ts src/domain/ticketing/utils/offlineCheckInStorage.ts src/domain/ticketing/utils/offlineTicketVerifier.test.ts src/domain/ticketing/utils/offlineTicketVerifier.ts src/domain/ticketing/utils/ticketCode.ts src/shared/constants/checkInCode.ts src/shared/i18n/resources.ts src/shared/i18n/ticketGateResources.ts src/shared/i18n/ticketWalletResources.ts` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
