import { renderHook } from '@testing-library/react';
import type { Location } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useTabMemory } from './useTabMemory';

const at = (pathname: string, search: string) =>
  ({ pathname, search, hash: '', state: null, key: pathname + search }) as Location;

describe('useTabMemory (P23)', () => {
  it('guarda só a página aberta (item e tipo) de cada aba', () => {
    const { result, rerender } = renderHook(({ location }) => useTabMemory(location), {
      initialProps: { location: at('/passeios', '?item=t1&type=item&menu=1') },
    });
    rerender({ location: at('/eventos', '') });
    expect(result.current('/passeios')).toBe('?item=t1&type=item');
    expect(result.current('/eventos')).toBe('');
    expect(result.current('/mapa')).toBe('');
  });
});
