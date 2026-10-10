import { describe, expect, it } from 'vitest';
import { isAppCheckRequired } from './appCheckMiddleware';

describe('isAppCheckRequired', () => {
  it('exige App Check em produção quando a variável não foi definida', () => {
    expect(isAppCheckRequired({ NODE_ENV: 'production' })).toBe(true);
  });

  it('não exige em desenvolvimento/AI Studio quando a variável não foi definida', () => {
    expect(isAppCheckRequired({ NODE_ENV: 'development' })).toBe(false);
    expect(isAppCheckRequired({})).toBe(false);
  });

  it('respeita valor explícito em qualquer ambiente', () => {
    expect(isAppCheckRequired({ NODE_ENV: 'development', APP_CHECK_REQUIRED: 'true' })).toBe(true);
    expect(isAppCheckRequired({ NODE_ENV: 'production', APP_CHECK_REQUIRED: 'false' })).toBe(false);
  });
});
