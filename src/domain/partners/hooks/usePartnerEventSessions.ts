import { useEffect, useState } from 'react';
import {
  type EventSessionsLoadState,
  getEventListingByIdUseCase,
  listEventOccurrencesUseCase,
} from '../../events';
import type { PartnerContentEditorState } from '../types/partnerContent';

export type LoadedEventDetails = Pick<
  PartnerContentEditorState,
  'sessions' | 'salesPolicy' | 'publishedCancellationPolicy' | 'entryType'
>;

/**
 * Lê as sessões salvas e as regras de venda do evento aberto no editor. Enquanto não estiverem prontas,
 * o evento não pode ser salvo: sem a lista real, a gravação trataria as sessões existentes como removidas.
 */
export function usePartnerEventSessions(
  eventId: string | undefined,
  onLoaded: (details: LoadedEventDetails) => void
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
    Promise.all([listEventOccurrencesUseCase(eventId), getEventListingByIdUseCase(eventId)])
      .then(([occurrences, listing]) => {
        if (!active) return;
        setSavedIds(occurrences.map((occurrence) => occurrence.id));
        onLoaded({
          sessions: occurrences.map((occurrence) => ({
            id: occurrence.id,
            startsAt: occurrence.startsAt,
            endsAt: occurrence.endsAt,
            capacity: occurrence.capacity,
            ...(occurrence.salesEndsAt ? { salesEndsAt: occurrence.salesEndsAt } : {}),
          })),
          ...(listing
            ? {
                salesPolicy: listing.salesPolicy,
                entryType: listing.entryType,
                // Depois de publicar, a política só fica mais flexível (D14).
                publishedCancellationPolicy:
                  listing.status === 'draft' ? undefined : listing.salesPolicy.cancellationPolicy,
              }
            : {}),
        });
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
