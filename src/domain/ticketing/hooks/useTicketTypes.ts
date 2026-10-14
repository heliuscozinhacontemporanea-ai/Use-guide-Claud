import { useCallback, useEffect, useState } from 'react';
import { listManagementTicketTypesUseCase } from '../application/usecases/listManagementTicketTypesUseCase';
import { listPublicTicketTypesUseCase } from '../application/usecases/listPublicTicketTypesUseCase';
import type { PublicTicketTypeProjection, TicketType } from '../types/ticketing';

export function usePublicTicketTypes(occurrenceId?: string) {
  const [ticketTypes, setTicketTypes] = useState<PublicTicketTypeProjection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!occurrenceId) {
      setTicketTypes([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await listPublicTicketTypesUseCase(occurrenceId);
      setTicketTypes(list);
    } catch (err) {
      console.error('[usePublicTicketTypes]', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os ingressos desta sessão.'
      );
    } finally {
      setLoading(false);
    }
  }, [occurrenceId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { ticketTypes, loading, error, reload };
}

export function useManagementTicketTypes(occurrenceId?: string) {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!occurrenceId) {
      setTicketTypes([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await listManagementTicketTypesUseCase(occurrenceId);
      setTicketTypes(list);
    } catch (err) {
      console.error('[useManagementTicketTypes]', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os lotes de ingressos.'
      );
    } finally {
      setLoading(false);
    }
  }, [occurrenceId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { ticketTypes, loading, error, reload };
}
