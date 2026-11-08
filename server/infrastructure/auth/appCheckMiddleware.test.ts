import { describe, expect, it, vi } from 'vitest';
import { isAppCheckRequired, verifyAppCheck } from './appCheckMiddleware';

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

  it('sem o token, quando exigido, responde 401 com código estável (AGENTS.md §10.2)', async () => {
    const previous = process.env.APP_CHECK_REQUIRED;
    process.env.APP_CHECK_REQUIRED = 'true';
    const res = { status: vi.fn(), json: vi.fn() };
    res.status.mockReturnValue(res);
    const next = vi.fn();
    await verifyAppCheck({ header: () => undefined } as never, res as never, next);
    process.env.APP_CHECK_REQUIRED = previous;
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'APP_CHECK_REQUIRED', message: 'App Check obrigatório.' },
    });
  });
});
