import { useEffect } from 'react';
import { rememberPromoterLink } from '../domain/ticketing';

/**
 * Link de divulgador (`?d=<@>-<código>`, D27): guarda no aparelho por 7 dias para a compra e tira o
 * parâmetro da barra, para não ir junto quando a pessoa compartilhar a página.
 */
export function PromoterLinkCapture() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const param = url.searchParams.get('d');
    if (!param) return;
    rememberPromoterLink(param);
    url.searchParams.delete('d');
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  }, []);
  return null;
}
