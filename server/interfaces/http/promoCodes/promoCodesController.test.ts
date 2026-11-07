import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ list: vi.fn(), save: vi.fn(), limits: vi.fn(), remove: vi.fn() }));
vi.mock('../../../application/usecases/promotions/listPartnerPromoCodesApplicationUseCase', () => ({
  listPartnerPromoCodesApplicationUseCase: m.list,
}));
vi.mock('../../../application/usecases/promotions/savePartnerPromoCodeApplicationUseCase', () => ({
  savePartnerPromoCodeApplicationUseCase: m.save,
}));
vi.mock('../../../domain/promotions', async () => {
  const actual = await vi.importActual<object>('../../../domain/promotions/types/promoCode');
  const { PromotionsDomainError } = await import(
    '../../../domain/promotions/errors/promotionsDomainError'
  );
  return {
    ...actual,
    PromotionsDomainError,
    updatePromoCodeLimitsUseCase: m.limits,
    deletePromoCodeUseCase: m.remove,
  };
});

import { PromotionsDomainError } from '../../../domain/promotions/errors/promotionsDomainError';
import { PromoCodesController } from './promoCodesController';

function response() {
  const res = { status: vi.fn(), json: vi.fn(), send: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.send.mockReturnValue(res);
  return res;
}

const BODY = {
  code: 'verao10',
  type: 'percentage',
  percentage: 10,
  valueMinor: null,
  targets: [{ kind: 'event', id: 'ev1', optionIds: null }],
  maxUses: 100,
  onePerAccount: true,
  maxTicketsPerOrder: null,
  startsAt: null,
  endsAt: null,
};

describe('PromoCodesController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('cria pelo uid logado, com o código em maiúsculas; campos extras e 91% são recusados', async () => {
    m.save.mockResolvedValueOnce({ id: 'pc1' });
    const ok = response();
    await PromoCodesController.create(
      { body: BODY, user: { uid: 'owner' } } as never,
      ok as unknown as Response
    );
    expect(m.save).toHaveBeenCalledWith('owner', expect.objectContaining({ code: 'VERAO10' }));
    expect(ok.status).toHaveBeenCalledWith(201);

    for (const body of [
      { ...BODY, percentage: 91 },
      { ...BODY, ownerId: 'outro' },
      { ...BODY, usedCount: 0 },
      { ...BODY, type: 'fixed', valueMinor: null },
    ]) {
      const bad = response();
      await PromoCodesController.create(
        { body, user: { uid: 'owner' } } as never,
        bad as unknown as Response
      );
      expect(bad.status).toHaveBeenCalledWith(400);
    }
    expect(m.save).toHaveBeenCalledTimes(1);
  });

  it('erros do domínio viram o código estável, sem detalhe interno', async () => {
    const cases: Array<[unknown, number, string]> = [
      [new PromotionsDomainError('PROMO_CODE_TAKEN', 'x'), 409, 'PROMO_CODE_TAKEN'],
      [new PromotionsDomainError('PROMO_TARGET_INVALID', 'x'), 404, 'PROMO_TARGET_INVALID'],
      [new Error('firestore: segredo'), 503, 'PROMO_CODES_UNAVAILABLE'],
    ];
    for (const [error, status, code] of cases) {
      m.save.mockRejectedValueOnce(error);
      const res = response();
      await PromoCodesController.create(
        { body: BODY, user: { uid: 'owner' } } as never,
        res as unknown as Response
      );
      expect(res.status).toHaveBeenCalledWith(status);
      expect(res.json).toHaveBeenCalledWith({ error: expect.objectContaining({ code }) });
      expect(JSON.stringify(res.json.mock.calls)).not.toContain('segredo');
    }
  });

  it('pausar: só os campos permitidos; excluir cupom usado responde 409', async () => {
    m.limits.mockResolvedValueOnce({
      id: 'pc1',
      code: 'VERAO10',
      type: 'percentage',
      targets: [],
      maxUses: null,
      usedCount: 3,
      firstUsedAt: 'x',
      isActive: false,
      endsAt: null,
      startsAt: null,
    });
    const ok = response();
    await PromoCodesController.updateLimits(
      { params: { id: 'pc1' }, body: { isActive: false }, user: { uid: 'owner' } } as never,
      ok as unknown as Response
    );
    expect(m.limits).toHaveBeenCalledWith('owner', 'pc1', { isActive: false });
    expect(ok.status).toHaveBeenCalledWith(200);

    const bad = response();
    await PromoCodesController.updateLimits(
      { params: { id: 'pc1' }, body: { percentage: 50 }, user: { uid: 'owner' } } as never,
      bad as unknown as Response
    );
    expect(bad.status).toHaveBeenCalledWith(400);

    m.remove.mockRejectedValueOnce(new PromotionsDomainError('PROMO_IN_USE', 'x'));
    const used = response();
    await PromoCodesController.remove(
      { params: { id: 'pc1' }, user: { uid: 'owner' } } as never,
      used as unknown as Response
    );
    expect(used.status).toHaveBeenCalledWith(409);
  });
});
