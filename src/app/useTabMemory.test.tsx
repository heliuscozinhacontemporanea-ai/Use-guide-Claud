import { renderHook } from '@testing-library/react';
import type { Location } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useTabMemory } from './useTabMemory';

const at = (pathname: string, search: string) =>
  ({ pathname, search, hash: '', state: null, key: pathname + search }) as Location;

describe('useTabMemory (P23)', () => {
  it('cada aba guarda a pílula e o anúncio abertos, só com item e tipo', () => {
    const { result, rerender } = renderHook(({ location }) => useTabMemory(location), {
      initialProps: { location: at('/passeios', '?item=t1&type=item&menu=1') },
    });
    rerender({ location: at('/pousadas', '') });
    expect(result.current('experiences')).toEqual({
      routeKey: 'tours',
      search: '?item=t1&type=item',
    });
    expect(result.current('services')).toEqual({ routeKey: 'stays', search: '' });
    expect(result.current('explore')).toBeNull();
  });

  it('a página de dicas pertence à Explorar e rotas fora do mapa não mudam a memória', () => {
    const { result, rerender } = renderHook(({ location }) => useTabMemory(location), {
      initialProps: { location: at('/en/travel-guide', '') },
    });
    rerender({ location: at('/admin', '') });
    expect(result.current('explore')).toEqual({ routeKey: 'guide', search: '' });
  });
});
