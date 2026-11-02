import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useUIStore } from '../shared/stores/useUIStore';

/**
 * Link com `?item=` de um item que não está no catálogo (apagado, despublicado ou id errado): avisa e
 * tira o parâmetro da URL, em vez de mostrar a lista sem explicação.
 */
export function useMissingItemNotice({
  itemId,
  found,
  catalogReady,
}: {
  itemId: string | null;
  found: boolean;
  catalogReady: boolean;
}) {
  const { t } = useTranslation();
  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!itemId || found || !catalogReady) return;
    useUIStore.getState().showToast(t('pages.itemUnavailable'), 'info');
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('item');
        next.delete('type');
        return next;
      },
      { replace: true }
    );
  }, [itemId, found, catalogReady, setSearchParams, t]);
}
