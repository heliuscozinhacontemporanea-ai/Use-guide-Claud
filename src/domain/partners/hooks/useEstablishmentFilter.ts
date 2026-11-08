import { useCallback, useState } from 'react';
import type { EstablishmentFilter } from '../utils/partnerHomeFilter';

// Preferência só deste aparelho (D27); sem ela o painel abre em "Todos".
const KEY = 'useguide.partner.establishmentFilter';

function read(): EstablishmentFilter {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function useEstablishmentFilter(validIds: string[]) {
  const [stored, setStored] = useState<EstablishmentFilter>(read);
  // Estabelecimento excluído ou de outra conta volta para "Todos".
  const filter = stored && validIds.includes(stored) ? stored : null;

  const setFilter = useCallback((next: EstablishmentFilter) => {
    setStored(next);
    try {
      if (next) window.localStorage.setItem(KEY, next);
      else window.localStorage.removeItem(KEY);
    } catch {
      // Navegação privada ou armazenamento bloqueado: vale só nesta sessão.
    }
  }, []);

  return { filter, setFilter };
}
