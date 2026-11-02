import { describe, expect, it } from 'vitest';
import { isKnownPagePath } from './isKnownPagePath';

describe('isKnownPagePath', () => {
  it('aceita as páginas do app em todos os idiomas e as rotas fora do mapa', () => {
    for (const path of [
      '/',
      '/eventos',
      '/en/events',
      '/fr/evenements',
      '/eventos/',
      '/admin',
      '/conta/acao',
      '/checkout/result',
    ]) {
      expect(isKnownPagePath(path)).toBe(true);
    }
  });

  it('recusa caminhos que não existem', () => {
    for (const path of [
      '/reset-password',
      '/evento',
      '/en/qualquer-coisa',
      '/toString',
      '/__proto__',
    ]) {
      expect(isKnownPagePath(path)).toBe(false);
    }
  });
});
