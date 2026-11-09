import { describe, expect, it } from 'vitest';
import { panelTimeZone } from './panelTimeZone';

describe('panelTimeZone', () => {
  it('é o fuso do primeiro estabelecimento que tem fuso', () => {
    expect(
      panelTimeZone([{}, { timeZone: 'America/Manaus' }, { timeZone: 'America/Fortaleza' }])
    ).toBe('America/Manaus');
  });

  it('sem estabelecimento, é o da plataforma (Brasília)', () => {
    expect(panelTimeZone([])).toBe('America/Sao_Paulo');
  });
});
