import { beforeEach, describe, expect, it, vi } from 'vitest';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('aviso de recusa do App Check', () => {
  beforeEach(() => vi.resetModules());

  it('mostra o aviso traduzido uma vez só, mesmo com várias recusas', async () => {
    const { useUIStore } = await import('../../stores/useUIStore');
    const showToast = vi.spyOn(useUIStore.getState(), 'showToast');
    const { noticeAppCheckFailure } = await import('./appCheckFailureNotice');
    const refused = { error: { code: 'APP_CHECK_REQUIRED', message: 'App Check obrigatório.' } };
    await noticeAppCheckFailure(json(401, refused));
    await noticeAppCheckFailure(json(401, refused));
    expect(showToast).toHaveBeenCalledTimes(1);
    expect(showToast.mock.calls[0]?.[0]).toMatch(/App Check/);
    expect(showToast.mock.calls[0]?.[1]).toBe('error');
  });

  it('ignora outras respostas, inclusive 401 de login', async () => {
    const { useUIStore } = await import('../../stores/useUIStore');
    const showToast = vi.spyOn(useUIStore.getState(), 'showToast');
    const { noticeAppCheckFailure } = await import('./appCheckFailureNotice');
    await noticeAppCheckFailure(json(200, { ok: true }));
    await noticeAppCheckFailure(json(401, { error: { code: 'UNAUTHENTICATED' } }));
    expect(showToast).not.toHaveBeenCalled();
  });
});
