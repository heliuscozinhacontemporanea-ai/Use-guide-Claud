import { describe, expect, it } from 'vitest';
import { formatMoneyMinor, formatMoneyMinorCompact } from './money';

describe('formatMoneyMinor', () => {
  it('formata centavos em BRL no idioma ativo', () => {
    expect(formatMoneyMinor(4990, 'pt-BR')).toBe('R$\u00a049,90');
    expect(formatMoneyMinor(29990, 'en')).toBe('R$299.90');
  });

  it('versão curta: centavos só quando houver', () => {
    expect(formatMoneyMinorCompact(312000, 'pt-BR')).toBe('R$\u00a03.120');
    expect(formatMoneyMinorCompact(312034, 'pt-BR')).toBe('R$\u00a03.120,34');
    expect(formatMoneyMinorCompact(312030, 'pt-BR')).toBe('R$\u00a03.120,30');
  });
});
