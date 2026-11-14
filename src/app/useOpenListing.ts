import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { GuideItem } from '../domain/guide';
import { useMissingItemNotice } from './useMissingItemNotice';

/**
 * Anúncio aberto na aba, guardado na URL (`?item=&type=`): o link pode ser compartilhado e o voltar
 * do sistema fecha o anúncio (DESIGN.md P19).
 */
export function useOpenListing({
  items,
  events,
  catalogReady,
}: {
  items: GuideItem[];
  events: GuideItem[];
  catalogReady: boolean;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const itemId = searchParams.get('item');
  const itemType = searchParams.get('type');
  // Anúncio aberto por um toque nesta tela (no cartão ou na busca). Some quando o anúncio fecha:
  // ao voltar para a aba, o anúncio é restaurado da URL e não cresce do cartão (veja `growsFromCard`).
  // `seen`: a URL já mostrou o anúncio tocado; só depois disso a saída dele da URL apaga o toque.
  const [tap, setTap] = useState<{ id: string; seen: boolean } | null>(null);
  if (tap && !tap.seen && itemId === tap.id) setTap({ id: tap.id, seen: true });
  else if (tap?.seen && itemId !== tap.id) setTap(null);

  const selectedItem = useMemo(() => {
    if (!itemId) return null;
    if (itemType === 'event') return events.find((event) => event.id === itemId) ?? null;
    if (itemType === 'item') return items.find((item) => item.id === itemId) ?? null;
    return null;
  }, [itemId, itemType, items, events]);

  useMissingItemNotice({ itemId, found: selectedItem !== null, catalogReady });

  const setSelectedItem = (item: GuideItem | null) => {
    setTap(item ? { id: item.id, seen: false } : null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (item) {
        next.set('item', item.id);
        next.set('type', item.category === 'event' ? 'event' : 'item');
      } else {
        next.delete('item');
        next.delete('type');
      }
      return next;
    });
  };

  /**
   * A foto cresce do cartão só quando a pessoa acabou de tocar nele. Restaurado (link, voltar, troca de
   * aba), o cartão monta depois do anúncio e tomaria a foto para si: ela encolhia até o cartão e sumia.
   */
  const growsFromCard = selectedItem !== null && selectedItem.id === tap?.id;

  return { selectedItem, setSelectedItem, growsFromCard };
}
