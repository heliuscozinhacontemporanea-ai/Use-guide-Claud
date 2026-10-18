import { describe, expect, it } from 'vitest';
import { formatMoneyMinor } from './money';

describe('formatMoneyMinor', () => {
  it('formata centavos em BRL no idioma ativo', () => {
    expect(formatMoneyMinor(4990, 'pt-BR')).toBe('R$ 49,90');
    expect(formatMoneyMinor(29990, 'en')).toBe('R$299.90');
  });
});
