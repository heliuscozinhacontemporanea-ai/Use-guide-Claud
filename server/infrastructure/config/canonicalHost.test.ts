import { describe, expect, it } from 'vitest';
import { isDirectCloudRunHost } from './canonicalHost';

describe('isDirectCloudRunHost', () => {
  it('reconhece o endereço direto do Cloud Run', () => {
    expect(isDirectCloudRunHost('use-guide-377157973786.us-east1.run.app')).toBe(true);
    expect(isDirectCloudRunHost('USE-GUIDE-yxewu5d4na-ue.a.run.app:443')).toBe(true);
  });

  it('não redireciona o domínio oficial nem o desenvolvimento local', () => {
    expect(isDirectCloudRunHost('useguide.com.br')).toBe(false);
    expect(isDirectCloudRunHost('localhost:3000')).toBe(false);
    expect(isDirectCloudRunHost('127.0.0.1:3000')).toBe(false);
    expect(isDirectCloudRunHost('')).toBe(false);
  });

  it('com vários proxies, vale o primeiro host', () => {
    expect(isDirectCloudRunHost('useguide.com.br, use-guide.run.app')).toBe(false);
  });
});
