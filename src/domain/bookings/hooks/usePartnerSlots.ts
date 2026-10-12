import { useCallback, useEffect, useState } from 'react';
import { cancelSlotUseCase } from '../application/usecases/cancelSlotUseCase';
import { createSlotsUseCase } from '../application/usecases/createSlotsUseCase';
import { listPartnerSlotsUseCase } from '../application/usecases/listPartnerSlotsUseCase';
import type { CreateSlotsPayload, PartnerSlot } from '../types/bookings';
import { addDays } from '../utils/dates';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

/** Horários de uma semana (início em `weekStart`, domingo 00:00 em Fortaleza). */
export function usePartnerSlots(offerId: string, weekStart: Date) {
  const [data, setData] = useState<PartnerSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fromIso = weekStart.toISOString();
  const toIso = addDays(weekStart, 7).toISOString();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listPartnerSlotsUseCase(offerId, fromIso, toIso));
    } catch (err: unknown) {
      setError(getBookingErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [offerId, fromIso, toIso]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const create = useCallback(
    async (payload: CreateSlotsPayload) => {
      const created = await createSlotsUseCase(offerId, payload);
      await reload();
      return created;
    },
    [offerId, reload]
  );

  const cancel = useCallback(
    async (slotId: string) => {
      const result = await cancelSlotUseCase(offerId, slotId);
      await reload();
      return result;
    },
    [offerId, reload]
  );

  return { data, loading, error, reload, create, cancel };
}
