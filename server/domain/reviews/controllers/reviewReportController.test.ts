import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ report: vi.fn(), mine: vi.fn(), open: vi.fn(), decide: vi.fn() }));
vi.mock('../usecases/reportReviewResponseUseCase', () => ({
  reportReviewResponseUseCase: m.report,
}));
vi.mock('../usecases/listMyReviewReportsUseCase', () => ({ listMyReviewReportsUseCase: m.mine }));
vi.mock('../usecases/listOpenReviewReportsUseCase', () => ({
  listOpenReviewReportsUseCase: m.open,
}));
vi.mock('../usecases/decideReviewReportUseCase', () => ({ decideReviewReportUseCase: m.decide }));

import { ReviewReportError } from '../errors/reviewReportError';
import { ReviewReportController } from './reviewReportController';

function response() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}
const AUTHOR = { uid: 'u1', admin: false, emailVerified: true, authTime: 0 };
const ADMIN = { uid: 'admin-1', admin: true, emailVerified: true, authTime: 0 };
const request = (overrides: Partial<AuthenticatedRequest>) =>
  ({
    query: {},
    body: {},
    params: {},
    user: AUTHOR,
    ...overrides,
  }) as never as AuthenticatedRequest;

describe('ReviewReportController (D19)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('denunciar: sem login 401; motivo fora da lista ou campo extra 400; uid vem do token', async () => {
    const anonymous = response();
    await ReviewReportController.report(
      request({ user: undefined }),
      anonymous as unknown as Response
    );
    expect(anonymous.status).toHaveBeenCalledWith(401);
    for (const body of [
      { reviewId: 'r1', reason: 'spam' },
      { reviewId: 'r1', reason: 'offensive', reporterUid: 'outra' },
    ]) {
      const res = response();
      await ReviewReportController.report(request({ body }), res as unknown as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    }
    m.report.mockResolvedValue({ id: 'x', status: 'open' });
    const ok = response();
    await ReviewReportController.report(
      request({ body: { reviewId: 'r1', reason: 'offensive' } }),
      ok as unknown as Response
    );
    expect(m.report).toHaveBeenCalledWith('u1', {
      reviewId: 'r1',
      reason: 'offensive',
      details: undefined,
    });
    expect(ok.status).toHaveBeenCalledWith(201);
  });

  it('erro do domínio sai com o código estável', async () => {
    m.report.mockRejectedValue(new ReviewReportError('REPORT_LIMIT_REACHED', 'Limite.'));
    const res = response();
    await ReviewReportController.report(
      request({ body: { reviewId: 'r1', reason: 'other' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'REPORT_LIMIT_REACHED', message: 'Limite.' },
    });
  });

  it('fila e decisão só para admin; a fila não mostra quem denunciou', async () => {
    const denied = response();
    await ReviewReportController.listOpen(request({}), denied as unknown as Response);
    expect(denied.status).toHaveBeenCalledWith(403);
    m.open.mockResolvedValue([
      { id: 'rep1', reporterUid: 'u1', responseText: 'x', status: 'open' },
    ]);
    const res = response();
    await ReviewReportController.listOpen(request({ user: ADMIN }), res as unknown as Response);
    const payload = res.json.mock.calls[0]?.[0];
    expect(payload.data[0]).not.toHaveProperty('reporterUid');
    const notAdmin = response();
    await ReviewReportController.decide(
      request({ params: { reportId: 'rep1' }, body: { outcome: 'upheld' } }),
      notAdmin as unknown as Response
    );
    expect(notAdmin.status).toHaveBeenCalledWith(403);
    m.decide.mockResolvedValue({ id: 'rep1', status: 'upheld', responseRemoved: true });
    const decided = response();
    await ReviewReportController.decide(
      request({ user: ADMIN, params: { reportId: 'rep1' }, body: { outcome: 'upheld' } }),
      decided as unknown as Response
    );
    expect(m.decide).toHaveBeenCalledWith('admin-1', 'rep1', 'upheld');
    expect(decided.status).toHaveBeenCalledWith(200);
  });
});
