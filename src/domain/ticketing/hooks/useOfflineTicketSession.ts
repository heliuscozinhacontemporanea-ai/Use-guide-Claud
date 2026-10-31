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
