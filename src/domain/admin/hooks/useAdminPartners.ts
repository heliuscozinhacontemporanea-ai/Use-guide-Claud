import { useCallback, useEffect, useState } from 'react';
import { getAdminPartnersUseCase } from '../application/usecases/getAdminPartnersUseCase';
import type { AdminPartnerSummary } from '../types/admin';

export function useAdminPartners(enabled: boolean) {
  const [partners, setPartners] = useState<AdminPartnerSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setPartners(await getAdminPartnersUseCase());
    } catch (err) {
      console.error('[useAdminPartners]', err);
      setError('Não foi possível carregar a lista de parceiros agora.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) void reload();
  }, [enabled, reload]);

  const patchPartner = useCallback((id: string, patch: Partial<AdminPartnerSummary>) => {
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const removePartner = useCallback((id: string) => {
    setPartners((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { partners, error, isLoading, reload, patchPartner, removePartner };
}

