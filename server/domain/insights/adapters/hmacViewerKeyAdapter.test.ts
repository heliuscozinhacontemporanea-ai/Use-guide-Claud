import { afterEach, describe, expect, it, vi } from 'vitest';
import { InsightsUnavailableError } from '../errors/insightsErrors';
import { HmacViewerKeyAdapter } from './hmacViewerKeyAdapter';

const KEY = 'k'.repeat(32);

describe('HmacViewerKeyAdapter', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('gera a mesma chave para o mesmo visitante e não expõe o valor original', () => {
    vi.stubEnv('INSIGHTS_VIEWER_KEY', KEY);
    const adapter = new HmacViewerKeyAdapter();
    const key = adapter.keyFor('ip:203.0.113.9|view|items|item-1');
    expect(key).toBe(adapter.keyFor('ip:203.0.113.9|view|items|item-1'));
    expect(key).not.toContain('203.0.113.9');
    expect(key).not.toBe(adapter.keyFor('ip:203.0.113.10|view|items|item-1'));
  });

  it('falha na primeira chamada sem chave ou com chave curta', () => {
    vi.stubEnv('INSIGHTS_VIEWER_KEY', 'curta');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => new HmacViewerKeyAdapter().keyFor('u:1')).toThrow(InsightsUnavailableError);
  });
});
