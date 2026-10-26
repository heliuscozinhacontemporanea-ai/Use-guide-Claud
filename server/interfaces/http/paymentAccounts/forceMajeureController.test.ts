import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({
  declare: vi.fn(),
  proof: vi.fn(),
  decide: vi.fn(),
  list: vi.fn(),
  isOwn: vi.fn(),
  documents: vi.fn(),
  declareDomain: vi.fn(),
}));

vi.mock('../../../domain/media', () => ({
  isOwnVerificationFileUseCase: m.isOwn,
  readVerificationFileUseCase: vi.fn(),
}));
vi.mock('../../../domain/partners', () => ({ listOwnerSalesDocumentsUseCase: m.documents }));
vi.mock('../../../domain/payment', async () => {
  const { PaymentDomainError } = await import(
    '../../../domain/payment/services/stripePaymentService'
  );
  return {
    PaymentDomainError,
    declareForceMajeureUseCase: m.declareDomain,
    decideForceMajeureUseCase: m.decide,
    listForceMajeureReviewsUseCase: m.list,
    getForceMajeureProofPathUseCase: vi.fn(),
  };
});

import { ForceMajeureController } from './forceMajeureController';

function response() {
  const res = { status: vi.fn(), json: vi.fn(), send: vi.fn(), setHeader: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

const OWNER = { uid: 'owner-1', admin: false };
const ADMIN = { uid: 'admin-1', admin: true };
const BODY = {
  reason: 'Vento acima de 40 nós, travessia proibida.',
  proofPath: 'verification/owner-1/prova.pdf',
};

function request(overrides: Partial<AuthenticatedRequest>): AuthenticatedRequest {
  return {
    query: {},
    body: BODY,
    params: { debtId: 'debt_x' },
    user: OWNER,
    ...overrides,
  } as never;
}

describe('ForceMajeureController (D16 3A)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.documents.mockResolvedValue([{ accountKey: 'key-1' }]);
  });

  it('prova de outra conta: 400 sem declarar', async () => {
    m.isOwn.mockReturnValue(false);
    const res = response();
    await ForceMajeureController.declare(
      request({ body: { ...BODY, proofPath: 'verification/owner-2/x.pdf' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(m.declareDomain).not.toHaveBeenCalled();
  });

  it('declara com os CNPJs de quem está logado', async () => {
    m.isOwn.mockReturnValue(true);
    m.declareDomain.mockResolvedValue({ id: 'debt_x', status: 'suspended' });
    const res = response();
    await ForceMajeureController.declare(request({}), res as unknown as Response);
    expect(m.isOwn).toHaveBeenCalledWith('owner-1', BODY.proofPath);
    expect(m.declareDomain).toHaveBeenCalledWith('debt_x', ['key-1'], {
      ...BODY,
      declaredBy: 'owner-1',
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('motivo curto ou campo extra: 400', async () => {
    for (const body of [
      { ...BODY, reason: 'chuva' },
      { ...BODY, status: 'approved' },
    ]) {
      const res = response();
      await ForceMajeureController.declare(request({ body }), res as unknown as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    }
  });

  it('fila, prova e decisão: só admin', async () => {
    for (const handler of [
      ForceMajeureController.listReviews,
      ForceMajeureController.readProof,
      ForceMajeureController.decide,
    ]) {
      const res = response();
      await handler(request({ body: { approve: true } }), res as unknown as Response);
      expect(res.status).toHaveBeenCalledWith(403);
    }
    m.decide.mockResolvedValue({ id: 'debt_x', status: 'waived', dueAt: 'd' });
    const ok = response();
    await ForceMajeureController.decide(
      request({ user: ADMIN as never, body: { approve: true } }),
      ok as unknown as Response
    );
    expect(m.decide).toHaveBeenCalledWith('debt_x', 'admin-1', true);
  });

  it('prova inexistente: 404', async () => {
    const res = response();
    await ForceMajeureController.readProof(
      request({ user: ADMIN as never }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
