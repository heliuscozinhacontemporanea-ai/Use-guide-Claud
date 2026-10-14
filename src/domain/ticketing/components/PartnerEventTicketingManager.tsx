import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Camera,
  CheckCircle2,
  CloudOff,
  Download,
  Loader2,
  Plus,
  QrCode,
  RefreshCw,
  Ticket as TicketIcon,
  Trash2,
  Users,
  Wallet,
  Wifi,
} from 'lucide-react';
import { useEventOccurrences, type EventOccurrence } from '../../events';
import { PartnerStripeConnectPortal } from '../../payment';
import { GlassCard } from '../../../ui/components/GlassCard';
import { createOfflineCheckInSessionUseCase } from '../application/usecases/createOfflineCheckInSessionUseCase';
import { createTicketTypeUseCase } from '../application/usecases/createTicketTypeUseCase';
import { deleteOrArchiveTicketTypeUseCase } from '../application/usecases/deleteOrArchiveTicketTypeUseCase';
import { syncOfflineCheckInsUseCase } from '../application/usecases/syncOfflineCheckInsUseCase';
import { updateTicketTypeUseCase } from '../application/usecases/updateTicketTypeUseCase';
import { usePartnerEventSales, usePartnerMerchantAccount } from '../hooks/usePartnerEventSales';
import { useManagementTicketTypes } from '../hooks/useTicketTypes';
import { formatMoneyMinorBrl } from '../types/ticketing';
import {
  getOfflineManifestBundle,
  listPendingOfflineCheckInEvents,
  removeSyncedOfflineCheckInEvents,
  saveOfflineManifestBundle,
  verifyAndConsumeOfflineQrToken,
  type StoredOfflineManifestBundle,
} from '../utils/offlineCheckInStorage';

interface PartnerEventTicketingManagerProps {
  eventListingId: string;
  asAdmin?: boolean;
}

type ManagerTab =
  | 'lots'
  | 'sales'
  | 'attendees'
  | 'checkin'
  | 'refunds'
  | 'settings'
  | 'finance';

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

  const [checkInInput, setCheckInInput] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

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
  const stationIdRef = useRef<string>(
    `station_${eventListingId.slice(0, 6)}`
  );

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
          err instanceof Error
            ? err.message
            : 'Não foi possível sincronizar os check-ins agora.',
      });
    } finally {
      setSyncingOffline(false);
    }
  }, [selectedOccurrenceId, offlineBundle, refreshOfflineState, reloadSales]);

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
        message:
          err instanceof Error
            ? err.message
            : 'Falha ao preparar sessão offline.',
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
    [selectedOccurrenceId, isOnline, performCheckIn, refreshOfflineState]
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
          BarcodeDetector?: new (opts: { formats: string[] }) => {
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
        message: 'Permissão de câmera negada ou indisponível neste navegador. Use a leitura manual.',
      });
    }
  };

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
        ...(newSalesStartsAt
          ? { salesStartsAt: new Date(newSalesStartsAt).toISOString() }
          : {}),
        ...(newSalesEndsAt
          ? { salesEndsAt: new Date(newSalesEndsAt).toISOString() }
          : {}),
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
        message: nextStatus === 'paused' ? 'Vendas do lote pausadas.' : 'Lote reativado para venda.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Não foi possível atualizar o lote.',
      });
    }
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeTokenOrIdValidation(checkInInput);
  };

  const isStripeReady = Boolean(
    merchantStatus?.connected &&
      merchantStatus.chargesEnabled &&
      merchantStatus.payoutsEnabled &&
      merchantStatus.detailsSubmitted
  );

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
              })}{' '}
              • Cap: {occ.capacity}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('lots')}
          className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'lots'
              ? 'bg-white/15 text-teal-300'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <TicketIcon size={14} />
          <span>Ingressos ({ticketTypes.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'sales'
              ? 'bg-white/15 text-teal-300'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <BarChart3 size={14} />
          <span>Vendas</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('attendees')}
          className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'attendees'
              ? 'bg-white/15 text-teal-300'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Users size={14} />
          <span>Participantes ({orders.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('checkin')}
          className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'checkin'
              ? 'bg-white/15 text-teal-300'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <QrCode size={14} />
          <span>Check-in ({checkIns.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('refunds')}
          className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'refunds'
              ? 'bg-white/15 text-teal-300'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <RefreshCw size={14} />
          <span>Reembolsos ({refunds.length})</span>
        </button>
        {!asAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'finance'
                ? 'bg-white/15 text-teal-300'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Wallet size={14} />
            <span>Financeiro</span>
          </button>
        )}
      </div>

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
                onChange={(e) =>
                  setNewVisibility(e.target.value as 'public' | 'hidden' | 'restricted')
                }
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
                        ? new Date(tt.salesStartsAt).toLocaleString('pt-BR')
                        : 'Imediato'}{' '}
                      até{' '}
                      {tt.salesEndsAt
                        ? new Date(tt.salesEndsAt).toLocaleString('pt-BR')
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
      ) : activeTab === 'sales' ? (
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
              <div className="text-base font-black text-white">
                {analytics?.ticketsSold ?? 0}
              </div>
            </GlassCard>
            <GlassCard className="p-3.5 space-y-1">
              <span className="text-[11px] text-white/50">Inscrições Gratuitas</span>
              <div className="text-base font-black text-white">
                {analytics?.freeRegistrations ?? 0}
              </div>
            </GlassCard>
            <GlassCard className="p-3.5 space-y-1">
              <span className="text-[11px] text-white/50">Check-ins Realizados</span>
              <div className="text-base font-black text-emerald-300">
                {analytics?.ticketsCheckedIn ?? 0}
              </div>
            </GlassCard>
            <GlassCard className="p-3.5 space-y-1">
              <span className="text-[11px] text-white/50">Pedidos Confirmados</span>
              <div className="text-base font-black text-teal-300">
                {analytics?.ordersPaid ?? 0}
              </div>
            </GlassCard>
          </div>
        </div>
      ) : activeTab === 'attendees' ? (
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
                    {new Date(ord.createdAt).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-teal-300">
                    {formatMoneyMinorBrl(ord.totalMinor)}
                  </div>
                  <div className="text-[11px] text-white/60 uppercase">{ord.status}</div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'checkin' ? (
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
                        offlineBundle
                          ? 'bg-teal-500/20 text-teal-300'
                          : 'bg-white/10 text-white/60'
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
              <p className="text-xs text-white/60">
                Aponte a câmera para o QR Code do participante
              </p>
            </div>
          )}

          <div className="space-y-2">
            {checkIns.map((ci) => (
              <div
                key={ci.id}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-teal-300">
                    Ingresso #{ci.ticketId.slice(0, 8)}
                  </span>
                  <span className="text-white/50 ml-2">
                    ({ci.method === 'offline_sync' ? 'Sincronizado Offline' : 'Online'})
                  </span>
                </div>
                <span className="text-white/60">
                  {new Date(ci.checkedInAt).toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'refunds' ? (
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
                    {new Date(ref.createdAt).toLocaleString('pt-BR')}
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
      ) : (
        <PartnerStripeConnectPortal />
      )}
    </div>
  );
}
