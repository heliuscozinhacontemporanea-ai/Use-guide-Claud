import { describe, expect, it } from 'vitest';
import { resolveTrustProxyHops } from './trustProxy';

describe('resolveTrustProxyHops', () => {
  it('usa o valor configurado', () => {
    expect(resolveTrustProxyHops('2', true)).toBe(2);
    expect(resolveTrustProxyHops(' 0 ', false)).toBe(0);
  });

  it('em desenvolvimento, sem valor, confia no proxy do AI Studio', () => {
    expect(resolveTrustProxyHops(undefined, false)).toBe(1);
  });

  it('em produção, exige o valor', () => {
    expect(() => resolveTrustProxyHops(undefined, true)).toThrow('TRUST_PROXY_HOPS');
  });

  it('recusa valores que não são número de proxies', () => {
    expect(() => resolveTrustProxyHops('true', false)).toThrow();
    expect(() => resolveTrustProxyHops('-1', false)).toThrow();
  });
});
