# Prompt 18.4e.3.0 — Painel de ingressos dividido em abas, sem mudar comportamento

> Lote 17, gerado do commit de referência `a24f664` da branch `claude/agents-md-v2`. Aplique depois do 18.4e.2. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4e.3.0 — Painel de ingressos dividido em abas, sem mudar comportamento

Preparação do 18.4e.3 (AGENTS.md §13: arquivo acima de 400 linhas é dividido ao tocar).

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md.

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Este prompt NÃO muda comportamento, texto nem estilo: só move código. Nenhuma dependência nova.

O QUE MUDA:
1) src/domain/ticketing/components/PartnerEventTicketingManager.tsx (1111 linhas) passa a ser só o container (sessão escolhida, aba ativa, aviso de conta, mensagens) e usa os arquivos novos.
2) Abas em src/domain/ticketing/components/manager/: ManagerTabBar, LotsTab, SalesTab, AttendeesTab, CheckInTab, RefundsTab, mais os tipos ManagerTab e ManagerFeedback.
3) Hooks novos: useTicketLotForm (formulário e ações dos lotes) e useOfflineCheckIn (check-in online e offline, sincronização e câmera).
4) Teste novo navegando por todas as abas.
5) docs/arquitetura/debitos.md: novo B31 (texto fixo em português e cores fixas nas abas movidas; correção no 19.x).

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- src/domain/ticketing/components/PartnerEventTicketingManager.test.tsx (criar)
- src/domain/ticketing/components/PartnerEventTicketingManager.tsx (alterar)
- src/domain/ticketing/components/manager/AttendeesTab.tsx (criar)
- src/domain/ticketing/components/manager/CheckInTab.tsx (criar)
- src/domain/ticketing/components/manager/LotsTab.tsx (criar)
- src/domain/ticketing/components/manager/ManagerTabBar.tsx (criar)
- src/domain/ticketing/components/manager/RefundsTab.tsx (criar)
- src/domain/ticketing/components/manager/SalesTab.tsx (criar)
- src/domain/ticketing/components/manager/managerFeedback.ts (criar)
- src/domain/ticketing/components/manager/managerTabs.ts (criar)
- src/domain/ticketing/hooks/useOfflineCheckIn.ts (criar)
- src/domain/ticketing/hooks/useTicketLotForm.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -21,6 +21,7 @@
 | B26 | Aviso de conta financeira no painel de ingressos (`usePartnerMerchantAccount`): considera pronto quando **algum** CNPJ da conta está pronto para receber, não o CNPJ do evento. Nas reservas, resolvido no 18.4e.2 (aviso e botão de publicar por estabelecimento) | D14 (conta por documento) | baixo — só o aviso na tela; a venda e a publicação conferem a conta do CNPJ certo no backend (`assertListingCanSellUseCase` + `assertPaymentAccountReadyUseCase`) | Prompt 18.4e.3: aviso por evento; `PartnerEventTicketingManager` (1111 linhas) dividido ao tocar |
 | B28 | `bookings/components/partner/OfferTextFields.tsx` (abas pt-BR/en/fr com tradução à mão) e editor de evento do parceiro (texto só em português) | D5 e AGENTS.md §12.6 (editar no idioma ativo, tradução automática) | médio — visitante em inglês ou francês vê o português, e o parceiro digita traduções que a D5 proíbe | 19.1: `LocalizedText`, `MachineTranslationPort` e outbox; o editor mostra o idioma de Configurações e o salvo vira o original |
 | B30 | `server/domain/payment/services/saleClaimService.ts` e `server/interfaces/http/saleClaims/`: o reembolso decidido numa reclamação não muda o status do pedido de ingresso nem da reserva; e a abertura de reclamação não tem rate limit (o app ainda não tem rate limit com armazenamento compartilhado) | §11.8 (o comprador vê o estado real da compra) e §7.4 (rate limit em rotas de pagamento) | baixo — uma reclamação por venda e só do próprio comprador; a carteira mostra "pago" depois do reembolso até a tela do 18.4f mostrar o status da reclamação | 18.4f: a carteira e Minhas reservas mostram o status da reclamação; rate limit junto com o das outras rotas de pagamento |
+| B31 | `src/domain/ticketing/components/manager/*` (abas do painel de ingressos: lotes, vendas, participantes, check-in, reembolsos) e `hooks/useTicketLotForm.ts`, `hooks/useOfflineCheckIn.ts` | §12 (texto fixo em português, sem `useTranslation`) e §11.1 (cores fixas do tema escuro, `text-white`, `bg-black/40`) | médio — no tema claro dependem das sobrescritas globais (B25) e em `en`/`fr` aparecem em português | 19.x: chaves no namespace do ingresso e tokens `--ug-*`, aba por aba; a divisão do 18.4e.3.0 deixou cada aba num arquivo |
 
 ## Resolvidos

=== src/domain/ticketing/components/PartnerEventTicketingManager.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../events', () => ({
  useEventOccurrences: () => ({
    occurrences: [
      { id: 'occ-1', startsAt: '2026-12-20T22:00:00.000Z', capacity: 100, status: 'scheduled' },
    ],
    loading: false,
  }),
}));
vi.mock('../../payment', () => ({ PartnerStripeConnectPortal: () => <div>portal</div> }));
vi.mock('../hooks/useTicketTypes', () => ({
  useManagementTicketTypes: () => ({ ticketTypes: [], loading: false, reload: vi.fn() }),
}));
vi.mock('../hooks/usePartnerEventSales', () => ({
  usePartnerEventSales: () => ({
    analytics: null,
    orders: [],
    checkIns: [],
    refunds: [],
    loading: false,
    reload: vi.fn(),
    performCheckIn: vi.fn(),
  }),
  usePartnerMerchantAccount: () => ({ status: { readyForSales: true } }),
}));
vi.mock('../utils/offlineCheckInStorage', () => ({
  getOfflineManifestBundle: vi.fn().mockResolvedValue(null),
  listPendingOfflineCheckInEvents: vi.fn().mockResolvedValue([]),
  removeSyncedOfflineCheckInEvents: vi.fn(),
  saveOfflineManifestBundle: vi.fn(),
  verifyAndConsumeOfflineQrToken: vi.fn(),
}));

import { PartnerEventTicketingManager } from './PartnerEventTicketingManager';

describe('PartnerEventTicketingManager (divisão em abas, sem mudar comportamento)', () => {
  it('cada aba mostra o próprio conteúdo', async () => {
    render(<PartnerEventTicketingManager eventListingId="ev-1" />);
    expect(await screen.findByText('Novo Lote / Tipo de Ingresso')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Vendas/ }));
    expect(screen.getByText('Ingressos Pagos')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Participantes/ }));
    expect(
      screen.getByText('Nenhum pedido ou participante registrado para este evento.')
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Check-in/ }));
    expect(screen.getByText('Preparar Check-in Offline')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Reembolsos/ }));
    expect(
      screen.getByText('Nenhuma solicitação de reembolso registrada para este evento.')
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Financeiro/ }));
    expect(screen.getByText('portal')).toBeTruthy();
  });

  it('admin não vê a aba Financeiro', () => {
    render(<PartnerEventTicketingManager eventListingId="ev-1" asAdmin />);
    expect(screen.queryByRole('button', { name: /Financeiro/ })).toBeNull();
  });
});

=== src/domain/ticketing/components/PartnerEventTicketingManager.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { AlertCircle, CheckCircle2, Loader2, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type EventOccurrence, useEventOccurrences } from '../../events';
import { PartnerStripeConnectPortal } from '../../payment';
import { GlassCard } from '../../../ui/components/GlassCard';
import { useOfflineCheckIn } from '../hooks/useOfflineCheckIn';
import { usePartnerEventSales, usePartnerMerchantAccount } from '../hooks/usePartnerEventSales';
import { useTicketLotForm } from '../hooks/useTicketLotForm';
import { useManagementTicketTypes } from '../hooks/useTicketTypes';
import { AttendeesTab } from './manager/AttendeesTab';
import { CheckInTab } from './manager/CheckInTab';
import { LotsTab } from './manager/LotsTab';
import { ManagerTabBar } from './manager/ManagerTabBar';
import type { ManagerFeedback } from './manager/managerFeedback';
import type { ManagerTab } from './manager/managerTabs';
import { RefundsTab } from './manager/RefundsTab';
import { SalesTab } from './manager/SalesTab';

interface PartnerEventTicketingManagerProps {
  eventListingId: string;
  asAdmin?: boolean;
}

export function PartnerEventTicketingManager({
  eventListingId,
  asAdmin = false,
}: PartnerEventTicketingManagerProps) {
  const { occurrences, loading: occLoading } = useEventOccurrences(eventListingId);
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ManagerTab>('lots');

  useEffect(() => {
    if (!selectedOccurrenceId && occurrences.length > 0 && occurrences[0]) {
      setSelectedOccurrenceId(occurrences[0].id);
    }
  }, [occurrences, selectedOccurrenceId]);

  const {
    ticketTypes,
    loading: lotsLoading,
    reload: reloadLots,
  } = useManagementTicketTypes(selectedOccurrenceId || undefined);

  const {
    analytics,
    orders,
    checkIns,
    refunds,
    loading: salesLoading,
    reload: reloadSales,
    performCheckIn,
  } = usePartnerEventSales(eventListingId, selectedOccurrenceId || undefined, asAdmin);

  const { status: merchantStatus } = usePartnerMerchantAccount(!asAdmin);

  const [feedback, setFeedback] = useState<ManagerFeedback | null>(null);

  const lotForm = useTicketLotForm({ selectedOccurrenceId, reloadLots, setFeedback });
  const checkIn = useOfflineCheckIn({
    eventListingId,
    selectedOccurrenceId,
    performCheckIn,
    reloadSales,
    setFeedback,
  });

  const isStripeReady = merchantStatus?.readyForSales === true;

  return (
    <div className="space-y-4">
      {!asAdmin && merchantStatus && !isStripeReady && (
        <GlassCard className="p-4 border-amber-500/30 bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-amber-300">
              Vendas online indisponíveis. Conclua a configuração financeira.
            </div>
            <p className="text-xs text-white/70">
              Para vender ingressos pagos com repasse automático via Stripe Connect, finalize o
              onboarding na aba Financeiro. Eventos gratuitos funcionam imediatamente.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className="min-h-11 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Wallet size={14} />
            <span>Abrir Financeiro</span>
          </button>
        </GlassCard>
      )}

      {occurrences.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {occurrences.map((occ: EventOccurrence) => (
            <button
              key={occ.id}
              type="button"
              onClick={() => setSelectedOccurrenceId(occ.id)}
              className={`min-h-11 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedOccurrenceId === occ.id
                  ? 'bg-teal-400 text-slate-950'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {new Date(occ.startsAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Fortaleza',
              })}{' '}
              • Cap: {occ.capacity}
            </button>
          ))}
        </div>
      )}

      <ManagerTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        asAdmin={asAdmin}
        counts={{
          lots: ticketTypes.length,
          attendees: orders.length,
          checkIns: checkIns.length,
          refunds: refunds.length,
        }}
      />

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-teal-500/10 border-teal-500/30 text-teal-200'
              : 'bg-red-500/10 border-red-500/30 text-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={15} className="shrink-0 text-teal-400" />
          ) : (
            <AlertCircle size={15} className="shrink-0 text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {occLoading || lotsLoading || salesLoading ? (
        <div className="p-6 flex items-center justify-center gap-2 text-xs text-white/60">
          <Loader2 size={16} className="animate-spin text-teal-400" />
          <span>Carregando dados operacionais...</span>
        </div>
      ) : activeTab === 'lots' ? (
        <LotsTab
          form={lotForm}
          ticketTypes={ticketTypes}
          selectedOccurrenceId={selectedOccurrenceId}
        />
      ) : activeTab === 'sales' ? (
        <SalesTab analytics={analytics} />
      ) : activeTab === 'attendees' ? (
        <AttendeesTab orders={orders} />
      ) : activeTab === 'checkin' ? (
        <CheckInTab
          checkIn={checkIn}
          checkIns={checkIns}
          selectedOccurrenceId={selectedOccurrenceId}
        />
      ) : activeTab === 'refunds' ? (
        <RefundsTab refunds={refunds} />
      ) : (
        <PartnerStripeConnectPortal />
      )}
    </div>
  );
}

=== src/domain/ticketing/components/manager/AttendeesTab.tsx — ARQUIVO NOVO, conteúdo completo ===
import { formatMoneyMinorBrl, type TicketOrder } from '../../types/ticketing';

export function AttendeesTab({ orders }: { orders: TicketOrder[] }) {
  return (
    <div className="space-y-2">
      {orders.length === 0 ? (
        <p className="text-xs text-white/50 p-4 text-center">
          Nenhum pedido ou participante registrado para este evento.
        </p>
      ) : (
        orders.map((ord) => (
          <div
            key={ord.id}
            className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
          >
            <div>
              <div className="font-bold text-white">
                {ord.buyerSnapshot.name} ({ord.buyerSnapshot.email})
              </div>
              <div className="text-white/50">
                Pedido #{ord.id.slice(0, 8)} •{' '}
                {new Date(ord.createdAt).toLocaleString('pt-BR', {
                  timeZone: 'America/Fortaleza',
                })}
              </div>
            </div>
            <div className="text-right">
              <div className="font-black text-teal-300">{formatMoneyMinorBrl(ord.totalMinor)}</div>
              <div className="text-[11px] text-white/60 uppercase">{ord.status}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

=== src/domain/ticketing/components/manager/CheckInTab.tsx — ARQUIVO NOVO, conteúdo completo ===
import { AlertTriangle, Camera, CloudOff, Download, Loader2, RefreshCw, Wifi } from 'lucide-react';
import { GlassCard } from '../../../../ui/components/GlassCard';
import type { OfflineCheckIn } from '../../hooks/useOfflineCheckIn';
import type { EventCheckIn } from '../../types/ticketing';

export function CheckInTab({
  checkIn,
  checkIns,
  selectedOccurrenceId,
}: {
  checkIn: OfflineCheckIn;
  checkIns: EventCheckIn[];
  selectedOccurrenceId: string;
}) {
  const {
    checkInInput,
    setCheckInInput,
    checkingIn,
    isOnline,
    offlineBundle,
    pendingOfflineCount,
    preparingOffline,
    syncingOffline,
    syncConflicts,
    cameraActive,
    videoRef,
    handleSyncOfflineCheckIns,
    handlePrepareOfflineSession,
    toggleCameraScanner,
    handleCheckInSubmit,
  } = checkIn;

  return (
    <div className="space-y-4">
      <GlassCard className="p-4 space-y-3 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isOnline
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              }`}
            >
              {isOnline ? <Wifi size={18} /> : <CloudOff size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white">
                  {isOnline ? 'Operando Online' : 'Modo Offline Ativo'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    offlineBundle ? 'bg-teal-500/20 text-teal-300' : 'bg-white/10 text-white/60'
                  }`}
                >
                  {offlineBundle
                    ? `Offline preparado (${offlineBundle.tickets.length} ingressos)`
                    : 'Offline não preparado'}
                </span>
              </div>
              <p className="text-[11px] text-white/60 mt-0.5">
                Se o mesmo ingresso for validado simultaneamente em outra estação offline, o
                conflito será resolvido na sincronização.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={!isOnline || preparingOffline || !selectedOccurrenceId}
              onClick={() => void handlePrepareOfflineSession()}
              className="min-h-11 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
            >
              {preparingOffline ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} className="text-teal-400" />
              )}
              <span>Preparar Check-in Offline</span>
            </button>

            {pendingOfflineCount > 0 && (
              <button
                type="button"
                disabled={!isOnline || syncingOffline}
                onClick={() => void handleSyncOfflineCheckIns()}
                className="min-h-11 px-3.5 rounded-xl bg-teal-400 hover:bg-teal-300 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                {syncingOffline ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                <span>Sincronizar ({pendingOfflineCount})</span>
              </button>
            )}
          </div>
        </div>

        {syncConflicts.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1 text-xs text-amber-200">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle size={14} />
              <span>Conflitos de Sincronização Detectados</span>
            </div>
            {syncConflicts.map((c, idx) => (
              <p key={idx} className="text-[11px] text-white/80">
                • {c}
              </p>
            ))}
          </div>
        )}
      </GlassCard>

      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleCheckInSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            value={checkInInput}
            onChange={(e) => setCheckInInput(e.target.value)}
            placeholder="Cole o token QR assinado (ugt2...) ou ID do ingresso"
            className="flex-1 min-h-11 px-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
          />
          <button
            type="submit"
            disabled={checkingIn || !selectedOccurrenceId}
            className="min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
          >
            Validar Entrada
          </button>
        </form>

        <button
          type="button"
          onClick={() => void toggleCameraScanner()}
          className="min-h-11 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
        >
          <Camera size={15} className="text-teal-400" />
          <span>{cameraActive ? 'Fechar Câmera' : 'Ler com Câmera'}</span>
        </button>
      </div>

      {cameraActive && (
        <div className="p-3 rounded-2xl bg-black/70 border border-teal-500/30 space-y-2 text-center">
          <video
            ref={videoRef}
            className="w-full max-w-sm mx-auto rounded-xl border border-white/10 aspect-square object-cover"
            muted
            playsInline
          />
          <p className="text-xs text-white/60">Aponte a câmera para o QR Code do participante</p>
        </div>
      )}

      <div className="space-y-2">
        {checkIns.map((ci) => (
          <div
            key={ci.id}
            className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
          >
            <div>
              <span className="font-bold text-teal-300">Ingresso #{ci.ticketId.slice(0, 8)}</span>
              <span className="text-white/50 ml-2">
                ({ci.method === 'offline_sync' ? 'Sincronizado Offline' : 'Online'})
              </span>
            </div>
            <span className="text-white/60">
              {new Date(ci.checkedInAt).toLocaleString('pt-BR', {
                timeZone: 'America/Fortaleza',
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

=== src/domain/ticketing/components/manager/LotsTab.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Plus, Trash2 } from 'lucide-react';
import type { TicketLotForm } from '../../hooks/useTicketLotForm';
import { formatMoneyMinorBrl, type TicketType } from '../../types/ticketing';

export function LotsTab({
  form,
  ticketTypes,
  selectedOccurrenceId,
}: {
  form: TicketLotForm;
  ticketTypes: TicketType[];
  selectedOccurrenceId: string;
}) {
  const {
    newName,
    setNewName,
    newDescription,
    setNewDescription,
    newKind,
    setNewKind,
    newPriceReais,
    setNewPriceReais,
    newQuantity,
    setNewQuantity,
    newMinPerOrder,
    setNewMinPerOrder,
    newMaxPerOrder,
    setNewMaxPerOrder,
    newSalesStartsAt,
    setNewSalesStartsAt,
    newSalesEndsAt,
    setNewSalesEndsAt,
    newVisibility,
    setNewVisibility,
    newRequiresEligibility,
    setNewRequiresEligibility,
    newSortOrder,
    setNewSortOrder,
    creatingLot,
    handleCreateLot,
    handleDeleteLot,
    handleToggleLotPause,
  } = form;

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleCreateLot}
        className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3"
      >
        <div className="text-xs font-bold text-white/80 uppercase tracking-wider">
          Novo Lote / Tipo de Ingresso
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome (ex: 1º Lote, VIP)"
            className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
          />
          <select
            value={newKind}
            onChange={(e) => setNewKind(e.target.value as 'paid' | 'free')}
            className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
          >
            <option value="paid">Ingresso Pago</option>
            <option value="free">Inscrição Gratuita</option>
          </select>
          <input
            type="number"
            step="0.01"
            disabled={newKind === 'free'}
            value={newKind === 'free' ? '0' : newPriceReais}
            onChange={(e) => setNewPriceReais(e.target.value)}
            placeholder="Preço (R$)"
            className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50 disabled:opacity-40"
          />
          <input
            type="number"
            min={1}
            required
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            placeholder="Quantidade total"
            className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Descrição do lote (opcional)"
            className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
          />
          <select
            value={newVisibility}
            onChange={(e) => setNewVisibility(e.target.value as 'public' | 'hidden' | 'restricted')}
            className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
          >
            <option value="public">Visibilidade: Público</option>
            <option value="hidden">Visibilidade: Oculto</option>
            <option value="restricted">Visibilidade: Restrito</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={1}
              value={newMinPerOrder}
              onChange={(e) => setNewMinPerOrder(e.target.value)}
              placeholder="Mín/pedido"
              title="Mínimo por pedido"
              className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
            />
            <input
              type="number"
              min={1}
              value={newMaxPerOrder}
              onChange={(e) => setNewMaxPerOrder(e.target.value)}
              placeholder="Máx/pedido"
              title="Máximo por pedido"
              className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
            />
          </div>
          <input
            type="number"
            value={newSortOrder}
            onChange={(e) => setNewSortOrder(e.target.value)}
            placeholder="Ordem (0)"
            title="Ordem de exibição"
            className="min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
          <div>
            <label className="text-[11px] text-white/60 block mb-1">Início das vendas</label>
            <input
              type="datetime-local"
              value={newSalesStartsAt}
              onChange={(e) => setNewSalesStartsAt(e.target.value)}
              className="w-full min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[11px] text-white/60 block mb-1">Fim das vendas</label>
            <input
              type="datetime-local"
              value={newSalesEndsAt}
              onChange={(e) => setNewSalesEndsAt(e.target.value)}
              className="w-full min-h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-white/80 pt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={newRequiresEligibility}
              onChange={(e) => setNewRequiresEligibility(e.target.checked)}
              className="w-4 h-4 accent-teal-400"
            />
            <span>Exige comprovante de meia-entrada/elegibilidade</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={creatingLot || !selectedOccurrenceId}
          className="min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={15} />
          <span>Adicionar Lote</span>
        </button>
      </form>

      <div className="space-y-2">
        {ticketTypes.map((tt) => (
          <div
            key={tt.id}
            className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white">{tt.name}</span>
                <span className="text-xs font-black text-teal-300">
                  {formatMoneyMinorBrl(tt.priceMinor)}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-white/70 uppercase">
                  {tt.status}
                </span>
              </div>
              <div className="text-xs text-white/60">
                Vendidos: {tt.soldCount} / {tt.quantity} • Reservados: {tt.reservedCount} • Mín{' '}
                {tt.minPerOrder} / Máx {tt.maxPerOrder}
              </div>
              {(tt.salesStartsAt || tt.salesEndsAt) && (
                <div className="text-[11px] text-white/50">
                  Janela:{' '}
                  {tt.salesStartsAt
                    ? new Date(tt.salesStartsAt).toLocaleString('pt-BR', {
                        timeZone: 'America/Fortaleza',
                      })
                    : 'Imediato'}{' '}
                  até{' '}
                  {tt.salesEndsAt
                    ? new Date(tt.salesEndsAt).toLocaleString('pt-BR', {
                        timeZone: 'America/Fortaleza',
                      })
                    : 'Início da sessão'}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleToggleLotPause(tt.id, tt.status)}
                className="min-h-11 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/80 cursor-pointer"
              >
                {tt.status === 'paused' ? 'Reativar' : 'Pausar'}
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteLot(tt.id)}
                aria-label={`Remover lote ${tt.name}`}
                className="w-11 h-11 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50 cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

=== src/domain/ticketing/components/manager/ManagerTabBar.tsx — ARQUIVO NOVO, conteúdo completo ===
import { BarChart3, QrCode, RefreshCw, Ticket as TicketIcon, Users, Wallet } from 'lucide-react';
import type { ManagerTab } from './managerTabs';

export function ManagerTabBar({
  activeTab,
  setActiveTab,
  asAdmin,
  counts,
}: {
  activeTab: ManagerTab;
  setActiveTab: (tab: ManagerTab) => void;
  asAdmin: boolean;
  counts: { lots: number; attendees: number; checkIns: number; refunds: number };
}) {
  return (
    <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
      <button
        type="button"
        onClick={() => setActiveTab('lots')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'lots' ? 'bg-white/15 text-teal-300' : 'text-white/60 hover:text-white'
        }`}
      >
        <TicketIcon size={14} />
        <span>Ingressos ({counts.lots})</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('sales')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'sales' ? 'bg-white/15 text-teal-300' : 'text-white/60 hover:text-white'
        }`}
      >
        <BarChart3 size={14} />
        <span>Vendas</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('attendees')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'attendees' ? 'bg-white/15 text-teal-300' : 'text-white/60 hover:text-white'
        }`}
      >
        <Users size={14} />
        <span>Participantes ({counts.attendees})</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('checkin')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'checkin' ? 'bg-white/15 text-teal-300' : 'text-white/60 hover:text-white'
        }`}
      >
        <QrCode size={14} />
        <span>Check-in ({counts.checkIns})</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('refunds')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'refunds' ? 'bg-white/15 text-teal-300' : 'text-white/60 hover:text-white'
        }`}
      >
        <RefreshCw size={14} />
        <span>Reembolsos ({counts.refunds})</span>
      </button>
      {!asAdmin && (
        <button
          type="button"
          onClick={() => setActiveTab('finance')}
          className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'finance' ? 'bg-white/15 text-teal-300' : 'text-white/60 hover:text-white'
          }`}
        >
          <Wallet size={14} />
          <span>Financeiro</span>
        </button>
      )}
    </div>
  );
}

=== src/domain/ticketing/components/manager/RefundsTab.tsx — ARQUIVO NOVO, conteúdo completo ===
import { formatMoneyMinorBrl, type Refund } from '../../types/ticketing';

export function RefundsTab({ refunds }: { refunds: Refund[] }) {
  return (
    <div className="space-y-2">
      {refunds.length === 0 ? (
        <p className="text-xs text-white/50 p-4 text-center">
          Nenhuma solicitação de reembolso registrada para este evento.
        </p>
      ) : (
        refunds.map((ref) => (
          <div
            key={ref.id}
            className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
          >
            <div>
              <div className="font-bold text-white">
                Pedido #{ref.orderId.slice(0, 8)} • {formatMoneyMinorBrl(ref.amountMinor)}
              </div>
              <div className="text-white/60">{ref.reason}</div>
              <div className="text-[11px] text-white/50">
                {new Date(ref.createdAt).toLocaleString('pt-BR', {
                  timeZone: 'America/Fortaleza',
                })}
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                ref.status === 'succeeded'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : ref.status === 'failed'
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {ref.status === 'succeeded'
                ? 'Reembolso concluído'
                : ref.status === 'failed'
                  ? 'Falha no reembolso'
                  : 'Reembolso em processamento'}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

=== src/domain/ticketing/components/manager/SalesTab.tsx — ARQUIVO NOVO, conteúdo completo ===
import { GlassCard } from '../../../../ui/components/GlassCard';
import { type EventSalesAnalytics, formatMoneyMinorBrl } from '../../types/ticketing';

export function SalesTab({ analytics }: { analytics: EventSalesAnalytics | null }) {
  return (
    <div className="space-y-4">
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <GlassCard className="p-3.5 space-y-1">
            <span className="text-[11px] text-white/50">Receita Bruta</span>
            <div className="text-sm font-black text-white">
              {formatMoneyMinorBrl(analytics.grossSalesMinor)}
            </div>
          </GlassCard>
          <GlassCard className="p-3.5 space-y-1">
            <span className="text-[11px] text-white/50">Descontos</span>
            <div className="text-sm font-black text-amber-300">
              {formatMoneyMinorBrl(analytics.discountsMinor)}
            </div>
          </GlassCard>
          <GlassCard className="p-3.5 space-y-1">
            <span className="text-[11px] text-white/50">Comissão Use Guide</span>
            <div className="text-sm font-black text-white/80">
              {formatMoneyMinorBrl(analytics.platformFeesMinor)}
            </div>
          </GlassCard>
          <GlassCard className="p-3.5 space-y-1">
            <span className="text-[11px] text-white/50">Taxas Stripe</span>
            <div className="text-sm font-black text-white/80">
              {formatMoneyMinorBrl(analytics.paymentFeesMinor)}
            </div>
          </GlassCard>
          <GlassCard className="p-3.5 space-y-1">
            <span className="text-[11px] text-white/50">Reembolsos</span>
            <div className="text-sm font-black text-red-300">
              {formatMoneyMinorBrl(analytics.refundsMinor)}
            </div>
          </GlassCard>
          <GlassCard className="p-3.5 space-y-1">
            <span className="text-[11px] text-white/50">Receita Líquida</span>
            <div className="text-sm font-black text-teal-300">
              {formatMoneyMinorBrl(analytics.netSalesMinor)}
            </div>
          </GlassCard>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <GlassCard className="p-3.5 space-y-1">
          <span className="text-[11px] text-white/50">Ingressos Pagos</span>
          <div className="text-base font-black text-white">{analytics?.ticketsSold ?? 0}</div>
        </GlassCard>
        <GlassCard className="p-3.5 space-y-1">
          <span className="text-[11px] text-white/50">Inscrições Gratuitas</span>
          <div className="text-base font-black text-white">{analytics?.freeRegistrations ?? 0}</div>
        </GlassCard>
        <GlassCard className="p-3.5 space-y-1">
          <span className="text-[11px] text-white/50">Check-ins Realizados</span>
          <div className="text-base font-black text-emerald-300">
            {analytics?.ticketsCheckedIn ?? 0}
          </div>
        </GlassCard>
        <GlassCard className="p-3.5 space-y-1">
          <span className="text-[11px] text-white/50">Pedidos Confirmados</span>
          <div className="text-base font-black text-teal-300">{analytics?.ordersPaid ?? 0}</div>
        </GlassCard>
      </div>
    </div>
  );
}

=== src/domain/ticketing/components/manager/managerFeedback.ts — ARQUIVO NOVO, conteúdo completo ===
export interface ManagerFeedback {
  type: 'success' | 'error';
  message: string;
}

=== src/domain/ticketing/components/manager/managerTabs.ts — ARQUIVO NOVO, conteúdo completo ===
export type ManagerTab =
  | 'lots'
  | 'sales'
  | 'attendees'
  | 'checkin'
  | 'refunds'
  | 'settings'
  | 'finance';

=== src/domain/ticketing/hooks/useOfflineCheckIn.ts — ARQUIVO NOVO, conteúdo completo ===
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createOfflineCheckInSessionUseCase } from '../application/usecases/createOfflineCheckInSessionUseCase';
import { syncOfflineCheckInsUseCase } from '../application/usecases/syncOfflineCheckInsUseCase';
import type { ManagerFeedback } from '../components/manager/managerFeedback';
import {
  getOfflineManifestBundle,
  listPendingOfflineCheckInEvents,
  removeSyncedOfflineCheckInEvents,
  saveOfflineManifestBundle,
  type StoredOfflineManifestBundle,
  verifyAndConsumeOfflineQrToken,
} from '../utils/offlineCheckInStorage';
import type { usePartnerEventSales } from './usePartnerEventSales';

/** Check-in online e offline (manifesto assinado no aparelho, sincronização e câmera). */
export function useOfflineCheckIn({
  eventListingId,
  selectedOccurrenceId,
  performCheckIn,
  reloadSales,
  setFeedback,
}: {
  eventListingId: string;
  selectedOccurrenceId: string;
  performCheckIn: ReturnType<typeof usePartnerEventSales>['performCheckIn'];
  reloadSales: () => Promise<void> | void;
  setFeedback: (feedback: ManagerFeedback | null) => void;
}) {
  const [checkInInput, setCheckInInput] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  // Offline Check-in state
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [offlineBundle, setOfflineBundle] = useState<StoredOfflineManifestBundle | null>(null);
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(0);
  const [preparingOffline, setPreparingOffline] = useState(false);
  const [syncingOffline, setSyncingOffline] = useState(false);
  const [syncConflicts, setSyncConflicts] = useState<string[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const stationIdRef = useRef<string>(`station_${eventListingId.slice(0, 6)}`);

  const refreshOfflineState = useCallback(async () => {
    if (!selectedOccurrenceId) return;
    try {
      const [bundle, pending] = await Promise.all([
        getOfflineManifestBundle(selectedOccurrenceId),
        listPendingOfflineCheckInEvents(selectedOccurrenceId),
      ]);
      setOfflineBundle(bundle);
      setPendingOfflineCount(pending.length);
    } catch {
      // IndexedDB indisponível no contexto atual
    }
  }, [selectedOccurrenceId]);

  useEffect(() => {
    void refreshOfflineState();
  }, [refreshOfflineState]);

  const handleSyncOfflineCheckIns = useCallback(async () => {
    if (!selectedOccurrenceId || !offlineBundle) return;
    const pending = await listPendingOfflineCheckInEvents(selectedOccurrenceId);
    if (pending.length === 0) return;

    setSyncingOffline(true);
    setFeedback(null);
    try {
      const res = await syncOfflineCheckInsUseCase({
        occurrenceId: selectedOccurrenceId,
        sessionId: offlineBundle.sessionId,
        stationId: offlineBundle.stationId,
        items: pending.map((ev) => ({
          clientEventId: ev.clientEventId,
          ticketId: ev.ticketId,
          qrToken: ev.rawToken || ev.ticketId,
          checkedInAt: ev.scannedAt,
        })),
      });

      const syncedIds: string[] = [];
      const conflicts: string[] = [];

      for (const item of res.results) {
        syncedIds.push(item.clientEventId);
        if (item.status !== 'synced') {
          conflicts.push(
            `Ingresso #${item.ticketId.slice(0, 8)}: ${
              item.reason || 'O ingresso já foi utilizado ou alterado em outra estação.'
            }`
          );
        }
      }

      await removeSyncedOfflineCheckInEvents(syncedIds);
      await refreshOfflineState();
      await reloadSales();
      setSyncConflicts(conflicts);
      setFeedback({
        type: conflicts.length > 0 ? 'error' : 'success',
        message:
          conflicts.length > 0
            ? `Sincronização concluída com ${conflicts.length} conflito(s).`
            : `${syncedIds.length} check-in(s) offline sincronizados com sucesso!`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err instanceof Error ? err.message : 'Não foi possível sincronizar os check-ins agora.',
      });
    } finally {
      setSyncingOffline(false);
    }
  }, [selectedOccurrenceId, offlineBundle, refreshOfflineState, reloadSales, setFeedback]);

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      void handleSyncOfflineCheckIns();
    };
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [handleSyncOfflineCheckIns]);

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) {
        window.clearInterval(scanTimerRef.current);
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => {
          t.stop();
        });
      }
    };
  }, []);

  const handlePrepareOfflineSession = async () => {
    if (!selectedOccurrenceId) return;
    setPreparingOffline(true);
    setFeedback(null);
    try {
      const response = await createOfflineCheckInSessionUseCase({
        occurrenceId: selectedOccurrenceId,
        stationId: stationIdRef.current,
        ttlHours: 24,
      });

      const bundle: StoredOfflineManifestBundle = {
        occurrenceId: selectedOccurrenceId,
        eventListingId,
        sessionId: response.session.id,
        stationId: response.session.stationId,
        issuedAt: response.session.issuedAt,
        expiresAt: response.session.expiresAt,
        publicKeyPem: response.publicKeyPem,
        tickets: response.manifest,
      };

      await saveOfflineManifestBundle(bundle);
      await refreshOfflineState();
      setFeedback({
        type: 'success',
        message: `Sessão offline preparada (${response.manifest.length} ingressos elegíveis salvos no dispositivo).`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Falha ao preparar sessão offline.',
      });
    } finally {
      setPreparingOffline(false);
    }
  };

  const executeTokenOrIdValidation = useCallback(
    async (rawInput: string) => {
      if (!selectedOccurrenceId || !rawInput.trim()) return;
      setCheckingIn(true);
      setFeedback(null);
      const code = rawInput.trim();

      try {
        if (isOnline) {
          const res = await performCheckIn(selectedOccurrenceId, code);
          setCheckInInput('');
          setFeedback({
            type: 'success',
            message: `Check-in online confirmado: ${res.ticket.holderName} (${
              res.ticket.ticketTypeSnapshot?.name || 'Ingresso'
            })`,
          });
        } else {
          const offlineResult = await verifyAndConsumeOfflineQrToken({
            rawToken: code,
            occurrenceId: selectedOccurrenceId,
          });
          if (!offlineResult.valid) {
            setFeedback({
              type: 'error',
              message: offlineResult.reason || 'QR Code inválido para check-in offline.',
            });
          } else {
            setCheckInInput('');
            await refreshOfflineState();
            setFeedback({
              type: 'success',
              message: `Check-in offline registrado (#${offlineResult.event?.ticketId.slice(0, 8)}). Sincronize quando a conexão retornar.`,
            });
          }
        }
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err instanceof Error ? err.message : 'Falha ao validar ingresso.',
        });
      } finally {
        setCheckingIn(false);
      }
    },
    [selectedOccurrenceId, isOnline, performCheckIn, refreshOfflineState, setFeedback]
  );

  const toggleCameraScanner = async () => {
    if (cameraActive) {
      if (scanTimerRef.current) window.clearInterval(scanTimerRef.current);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => {
          t.stop();
        });
      }
      setCameraActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      }, 100);

      const BarcodeDetectorCtor = (
        window as unknown as {
          BarcodeDetector?: new (opts: {
            formats: string[];
          }) => {
            detect: (el: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
          };
        }
      ).BarcodeDetector;

      if (BarcodeDetectorCtor) {
        const detector = new BarcodeDetectorCtor({ formats: ['qr_code'] });
        scanTimerRef.current = window.setInterval(async () => {
          if (!videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0 && codes[0]?.rawValue) {
              const detected = codes[0].rawValue;
              if (scanTimerRef.current) window.clearInterval(scanTimerRef.current);
              stream.getTracks().forEach((t) => {
                t.stop();
              });
              setCameraActive(false);
              await executeTokenOrIdValidation(detected);
            }
          } catch {
            // Frame ainda não pronto
          }
        }, 500);
      }
    } catch {
      setFeedback({
        type: 'error',
        message:
          'Permissão de câmera negada ou indisponível neste navegador. Use a leitura manual.',
      });
    }
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeTokenOrIdValidation(checkInInput);
  };

  return {
    checkInInput,
    setCheckInInput,
    checkingIn,
    isOnline,
    offlineBundle,
    pendingOfflineCount,
    preparingOffline,
    syncingOffline,
    syncConflicts,
    cameraActive,
    videoRef,
    handleSyncOfflineCheckIns,
    handlePrepareOfflineSession,
    toggleCameraScanner,
    handleCheckInSubmit,
  };
}

export type OfflineCheckIn = ReturnType<typeof useOfflineCheckIn>;

=== src/domain/ticketing/hooks/useTicketLotForm.ts — ARQUIVO NOVO, conteúdo completo ===
import type React from 'react';
import { useState } from 'react';
import { businessDateTimeToIso } from '../../../shared/utils/businessDateTime';
import { createTicketTypeUseCase } from '../application/usecases/createTicketTypeUseCase';
import { deleteOrArchiveTicketTypeUseCase } from '../application/usecases/deleteOrArchiveTicketTypeUseCase';
import { updateTicketTypeUseCase } from '../application/usecases/updateTicketTypeUseCase';
import type { ManagerFeedback } from '../components/manager/managerFeedback';

/** Formulário e ações dos lotes de uma sessão (painel de ingressos do parceiro). */
export function useTicketLotForm({
  selectedOccurrenceId,
  reloadLots,
  setFeedback,
}: {
  selectedOccurrenceId: string;
  reloadLots: () => Promise<void> | void;
  setFeedback: (feedback: ManagerFeedback | null) => void;
}) {
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newKind, setNewKind] = useState<'paid' | 'free'>('paid');
  const [newPriceReais, setNewPriceReais] = useState('50');
  const [newQuantity, setNewQuantity] = useState('100');
  const [newMinPerOrder, setNewMinPerOrder] = useState('1');
  const [newMaxPerOrder, setNewMaxPerOrder] = useState('5');
  const [newSalesStartsAt, setNewSalesStartsAt] = useState('');
  const [newSalesEndsAt, setNewSalesEndsAt] = useState('');
  const [newVisibility, setNewVisibility] = useState<'public' | 'hidden' | 'restricted'>('public');
  const [newRequiresEligibility, setNewRequiresEligibility] = useState(false);
  const [newSortOrder, setNewSortOrder] = useState('0');
  const [creatingLot, setCreatingLot] = useState(false);

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOccurrenceId || !newName.trim()) return;
    setCreatingLot(true);
    setFeedback(null);

    try {
      const priceMinor =
        newKind === 'free' ? 0 : Math.round(Number(newPriceReais.replace(',', '.')) * 100);
      const quantity = Math.max(1, Number.parseInt(newQuantity, 10) || 1);
      const minPerOrder = Math.max(1, Number.parseInt(newMinPerOrder, 10) || 1);
      const maxPerOrder = Math.max(minPerOrder, Number.parseInt(newMaxPerOrder, 10) || 5);
      const sortOrder = Number.parseInt(newSortOrder, 10) || 0;

      await createTicketTypeUseCase({
        occurrenceId: selectedOccurrenceId,
        name: newName.trim(),
        ...(newDescription.trim() ? { description: newDescription.trim() } : {}),
        kind: newKind,
        priceMinor,
        quantity,
        minPerOrder,
        maxPerOrder,
        ...(newSalesStartsAt ? { salesStartsAt: businessDateTimeToIso(newSalesStartsAt) } : {}),
        ...(newSalesEndsAt ? { salesEndsAt: businessDateTimeToIso(newSalesEndsAt) } : {}),
        visibility: newVisibility,
        requiresEligibilityProof: newRequiresEligibility,
        sortOrder,
      });

      setNewName('');
      setNewDescription('');
      await reloadLots();
      setFeedback({ type: 'success', message: 'Lote de ingresso criado com sucesso!' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao criar lote.',
      });
    } finally {
      setCreatingLot(false);
    }
  };

  const handleDeleteLot = async (ticketTypeId: string) => {
    try {
      const res = await deleteOrArchiveTicketTypeUseCase(ticketTypeId);
      await reloadLots();
      setFeedback({
        type: 'success',
        message:
          res.mode === 'archived'
            ? 'Lote arquivado (possui vendas registradas).'
            : 'Lote removido.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Não foi possível remover o lote.',
      });
    }
  };

  const handleToggleLotPause = async (lotId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'paused' ? 'on_sale' : 'paused';
      await updateTicketTypeUseCase(lotId, { status: nextStatus });
      await reloadLots();
      setFeedback({
        type: 'success',
        message:
          nextStatus === 'paused' ? 'Vendas do lote pausadas.' : 'Lote reativado para venda.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Não foi possível atualizar o lote.',
      });
    }
  };

  return {
    newName,
    setNewName,
    newDescription,
    setNewDescription,
    newKind,
    setNewKind,
    newPriceReais,
    setNewPriceReais,
    newQuantity,
    setNewQuantity,
    newMinPerOrder,
    setNewMinPerOrder,
    newMaxPerOrder,
    setNewMaxPerOrder,
    newSalesStartsAt,
    setNewSalesStartsAt,
    newSalesEndsAt,
    setNewSalesEndsAt,
    newVisibility,
    setNewVisibility,
    newRequiresEligibility,
    setNewRequiresEligibility,
    newSortOrder,
    setNewSortOrder,
    creatingLot,
    handleCreateLot,
    handleDeleteLot,
    handleToggleLotPause,
  };
}

export type TicketLotForm = ReturnType<typeof useTicketLotForm>;

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run src/domain/ticketing/components/PartnerEventTicketingManager.test.tsx src/domain/ticketing/components/PartnerEventTicketingManager.tsx src/domain/ticketing/components/manager/AttendeesTab.tsx src/domain/ticketing/components/manager/CheckInTab.tsx src/domain/ticketing/components/manager/LotsTab.tsx src/domain/ticketing/components/manager/ManagerTabBar.tsx src/domain/ticketing/components/manager/RefundsTab.tsx src/domain/ticketing/components/manager/SalesTab.tsx src/domain/ticketing/components/manager/managerFeedback.ts src/domain/ticketing/components/manager/managerTabs.ts src/domain/ticketing/hooks/useOfflineCheckIn.ts src/domain/ticketing/hooks/useTicketLotForm.ts` (todos verdes). Não precisa rodar a suíte inteira.
- abra o painel de ingressos de um evento e confira que as abas continuam iguais.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
