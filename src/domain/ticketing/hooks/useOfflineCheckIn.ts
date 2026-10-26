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
