import type { Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { ListingClaimError } from '../../../domain/partners';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ submit: vi.fn(), review: vi.fn() }));
vi.mock('../../../application/usecases/listingClaims/submitListingClaimApplicationUseCase', () => ({
  submitListingClaimApplicationUseCase: m.submit,
}));
vi.mock('../../../application/usecases/listingClaims/reviewListingClaimApplicationUseCase', () => ({
  reviewListingClaimApplicationUseCase: m.review,
}));

import { ListingClaimController } from './listingClaimController';

function response() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res as unknown as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
}

const body = {
  documentType: 'cnpj',
  document: '11.222.333/0001-81',
  holderRole: 'owner',
  files: { cnpjCard: 'a', identity: 'b' },
};

function request(extra: Partial<AuthenticatedRequest>): AuthenticatedRequest {
  return {
    user: { uid: 'ana', emailVerified: true, admin: false },
    params: { itemId: 'item-1' },
    body,
    ...extra,
  } as unknown as AuthenticatedRequest;
}

describe('ListingClaimController (D35)', () => {
  it('201 com o pedido; campo a mais ou sem login não passam', async () => {
    m.submit.mockResolvedValue({ claimId: 'item-1_ana', status: 'pending' });
    const ok = response();
    await ListingClaimController.submit(request({}), ok);
    expect(ok.status).toHaveBeenCalledWith(201);

    const extra = response();
    await ListingClaimController.submit(request({ body: { ...body, status: 'approved' } }), extra);
    expect(extra.status).toHaveBeenCalledWith(400);
    expect(extra.json).toHaveBeenCalledWith({
      error: { code: 'VALIDATION_ERROR', message: expect.any(String) },
    });

    const anonymous = response();
    await ListingClaimController.submit(request({ user: undefined }), anonymous);
    expect(anonymous.status).toHaveBeenCalledWith(401);
  });

  it('erro do domínio sai com o código; erro inesperado não vaza a mensagem', async () => {
    m.review.mockRejectedValueOnce(new ListingClaimError('FORBIDDEN', 'Somente administradores.'));
    const forbidden = response();
    await ListingClaimController.review(
      request({ params: { claimId: 'item-1_bruno' }, body: { decision: 'approve' } }),
      forbidden
    );
    expect(forbidden.status).toHaveBeenCalledWith(403);
    expect(forbidden.json).toHaveBeenCalledWith({
      error: { code: 'FORBIDDEN', message: 'Somente administradores.' },
    });

    m.review.mockRejectedValueOnce(new Error('firestore: segredo interno'));
    const failed = response();
    await ListingClaimController.review(
      request({ params: { claimId: 'item-1_ana' }, body: { decision: 'approve' } }),
      failed
    );
    expect(failed.status).toHaveBeenCalledWith(500);
    expect(JSON.stringify(failed.json.mock.calls)).not.toContain('segredo');
  });
});
