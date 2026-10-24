import { useCallback, useEffect, useState } from 'react';
import { activateListingTrialUseCase } from '../application/usecases/activateListingTrialUseCase';
import { getListingPlanUseCase } from '../application/usecases/getListingPlanUseCase';
import type { ListingPlanView } from '../types/listingPlan';
import { getListingPlanErrorMessage } from '../utils/listingPlanErrorMessage';

export function useListingPlan(itemId: string) {
  const [data, setData] = useState<ListingPlanView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getListingPlanUseCase(itemId));
    } catch (err: unknown) {
      setError(getListingPlanErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  /** Lança a mensagem já traduzida para o diálogo mostrar no toast. */
  const activateTrial = useCallback(async () => {
    setActivating(true);
    try {
      const view = await activateListingTrialUseCase(itemId);
      setData(view);
      return view;
    } catch (err: unknown) {
      throw new Error(getListingPlanErrorMessage(err));
    } finally {
      setActivating(false);
    }
  }, [itemId]);

  return { data, loading, error, activating, reload, activateTrial };
}
