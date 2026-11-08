import { useCallback, useEffect, useState } from 'react';
import { savePartnerHomeCardsUseCase } from '../application/usecases/savePartnerHomeCardsUseCase';
import { isPartnerHomeCardId, type PartnerHomeCardId } from '../types/partnerHomeCards';

/** Cartões do Início: os salvos na conta e o rascunho do modo Personalizar (seção 6.1). */
export function usePartnerHomeCards(saved: string[] | undefined) {
  const [cards, setCards] = useState<PartnerHomeCardId[]>([]);
  const [draft, setDraft] = useState<PartnerHomeCardId[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (saved) setCards(saved.filter(isPartnerHomeCardId));
  }, [saved]);

  const startEditing = useCallback(() => {
    setError(null);
    setDraft(cards);
  }, [cards]);

  const cancel = useCallback(() => setDraft(null), []);

  const finish = useCallback(async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const stored = await savePartnerHomeCardsUseCase(draft);
      setCards(stored.filter(isPartnerHomeCardId));
      setDraft(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'INTERNAL_ERROR');
    } finally {
      setSaving(false);
    }
  }, [draft]);

  return {
    cards,
    draft,
    editing: draft !== null,
    setDraft,
    startEditing,
    cancel,
    finish,
    saving,
    error,
  };
}
