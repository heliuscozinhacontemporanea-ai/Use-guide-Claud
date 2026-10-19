import { useEffect, useState } from 'react';
import {
  type EventSessionDraft,
  type EventSessionsLoadState,
  listEventOccurrencesUseCase,
} from '../../events';

/**
 * Lê as sessões salvas do evento aberto no editor. Enquanto não estiverem prontas, o evento não pode
 * ser salvo: sem a lista real, a gravação trataria as sessões existentes como removidas.
 */
export function usePartnerEventSessions(
  eventId: string | undefined,
  onLoaded: (sessions: EventSessionDraft[]) => void
) {
  const [loadState, setLoadState] = useState<EventSessionsLoadState>('idle');
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: lê de novo só quando outro evento é aberto.
  useEffect(() => {
    setSavedIds([]);
    if (!eventId) {
      setLoadState('idle');
      return;
    }
    let active = true;
    setLoadState('loading');
    listEventOccurrencesUseCase(eventId)
      .then((occurrences) => {
        if (!active) return;
        setSavedIds(occurrences.map((occurrence) => occurrence.id));
        onLoaded(
          occurrences.map((occurrence) => ({
            id: occurrence.id,
            startsAt: occurrence.startsAt,
            endsAt: occurrence.endsAt,
            capacity: occurrence.capacity,
          }))
        );
        setLoadState('ready');
      })
      .catch((error: unknown) => {
        console.error('[usePartnerEventSessions]', error);
        if (active) setLoadState('error');
      });
    return () => {
      active = false;
    };
  }, [eventId]);

  return { loadState, savedIds };
}
