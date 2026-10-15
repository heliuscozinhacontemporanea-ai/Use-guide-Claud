import { describe, expect, it } from 'vitest';
import { resolvePlatformFeePercent } from './platformFee';

describe('resolvePlatformFeePercent', () => {
  it('usa 10% quando a variável não está configurada', () => {
    expect(resolvePlatformFeePercent(undefined)).toBe(10);
    expect(resolvePlatformFeePercent('')).toBe(10);
  });

  it('aceita o número com ou sem o símbolo de porcentagem', () => {
    expect(resolvePlatformFeePercent('12')).toBe(12);
    expect(resolvePlatformFeePercent(' 7.5% ')).toBe(7.5);
    expect(resolvePlatformFeePercent('0')).toBe(0);
  });

  it('falha com valor inválido em vez de cobrar uma taxa padrão', () => {
    expect(() => resolvePlatformFeePercent('dez')).toThrow('USE_GUIDE_PLATFORM_FEE_PERCENT');
    expect(() => resolvePlatformFeePercent('150')).toThrow();
    expect(() => resolvePlatformFeePercent('-1')).toThrow();
  });
});
