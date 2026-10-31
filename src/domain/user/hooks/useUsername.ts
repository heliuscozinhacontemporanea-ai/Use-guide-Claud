import { useCallback, useEffect, useState } from 'react';
import { claimUsernameUseCase } from '../application/usecases/claimUsernameUseCase';
import { getCurrentUserUseCase } from '../application/usecases/getCurrentUserUseCase';
import { suggestUsernameUseCase } from '../application/usecases/suggestUsernameUseCase';

/** @ da conta: o atual ou, se ainda não tem, uma sugestão a partir do nome (D21). */
export function useUsername() {
  const [current, setCurrent] = useState<string | null>(null);
  const [changedAt, setChangedAt] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const profile = await getCurrentUserUseCase();
      setCurrent(profile?.username ?? null);
      setChangedAt(profile?.usernameChangedAt ?? null);
      if (!profile?.username) {
        const name = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();
        setSuggestion(await suggestUsernameUseCase(name));
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async (username: string) => {
    const saved = await claimUsernameUseCase(username);
    setCurrent(saved);
    setChangedAt(new Date().toISOString());
    return saved;
  }, []);

  return { current, changedAt, suggestion, loading, error, reload: load, save };
}
