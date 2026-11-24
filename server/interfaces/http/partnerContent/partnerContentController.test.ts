import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';

const m = vi.hoisted(() => ({
  deleteItem: vi.fn(),
  deleteOccurrence: vi.fn(),
  update: vi.fn(),
  listOrders: vi.fn(),
}));
vi.mock('../../../application/usecases/deletePartnerItemApplicationUseCase', () => ({
  deletePartnerItemApplicationUseCase: m.deleteItem,
}));
vi.mock('../../../application/usecases/deleteEventOccurrenceSafelyApplicationUseCase', () => ({
  deleteEventOccurrenceSafelyApplicationUseCase: m.deleteOccurrence,
}));
vi.mock('../../../application/usecases/updateEventOccurrenceSafelyApplicationUseCase', () => ({
  updateEventOccurrenceSafelyApplicationUseCase: m.update,
}));
vi.mock('../../../domain/ticketing', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../domain/ticketing')>()),
  listEventOrdersForPartnerOrAdminUseCase: m.listOrders,
}));

import {
  CapacityBelowSoldError,
  OccurrenceDateLockedError,
  OccurrenceHasSalesError,
} from '../../../domain/events';
import { GuideDomainError } from '../../../domain/guide';
import { PartnerContentController } from './partnerContentController';

function response() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
  };
  return res;
}

const request = (params: object, body: object = {}) =>
  ({
    params,
    body,
    guideUserContext: { uid: 'partner-1', admin: false, role: 'partner' },
  }) as unknown as AuthenticatedRequest;

describe('PartnerContentController: travas de excluir (D27, D34)', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ['LISTING_HAS_BOOKINGS', 'Este anúncio tem reservas ativas.'],
    ['LISTING_HAS_EVENTS', 'Este anúncio tem eventos ligados.'],
  ] as const)('anúncio preso por %s: 409 com o código', async (code, message) => {
    m.deleteItem.mockRejectedValue(new GuideDomainError(code, message));
    const res = response();
    await PartnerContentController.deleteItem(
      request({ id: 'item-1' }),
      res as unknown as Response
    );
    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ error: { code, message } });
  });

  it('anúncio de outro parceiro: 403', async () => {
    m.deleteItem.mockRejectedValue(new GuideDomainError('FORBIDDEN', 'Sem permissão'));
    const res = response();
    await PartnerContentController.deleteItem(
      request({ id: 'item-1' }),
      res as unknown as Response
    );
    expect(res.statusCode).toBe(403);
  });

  it('sessão com vendas: 409 SESSION_HAS_SALES', async () => {
    m.deleteOccurrence.mockRejectedValue(new OccurrenceHasSalesError());
    const res = response();
    await PartnerContentController.deleteEventOccurrence(
      request({ id: 'ev-1', occurrenceId: 'occ-1' }),
      res as unknown as Response
    );
    expect(res.statusCode).toBe(409);
    expect(res.body).toMatchObject({ error: { code: 'SESSION_HAS_SALES' } });
  });

  it.each([
    [new OccurrenceDateLockedError(), 'SESSION_DATE_LOCKED'],
    [new CapacityBelowSoldError(), 'CAPACITY_BELOW_SOLD'],
  ])('editar sessão vendida: 422 com o código', async (error, code) => {
    m.update.mockRejectedValue(error);
    const res = response();
    await PartnerContentController.updateEventOccurrence(
      request({ id: 'ev-1', occurrenceId: 'occ-1' }, { capacity: 1 }),
      res as unknown as Response
    );
    expect(res.statusCode).toBe(422);
    expect(res.body).toMatchObject({ error: { code } });
  });
});

describe('PartnerContentController.listEventOrders: dados do comprador (§7.9, decisão 1e.2)', () => {
  const ORDER = {
    id: 'o1',
    eventListingId: 'ev1',
    occurrenceId: 'occ1',
    status: 'paid',
    totalMinor: 10300,
    buyerId: 'buyer-1',
    buyerSnapshot: { name: 'Ana Souza Lima', email: 'ana@exemplo.com' },
    paymentIntentId: 'pi_123',
    idempotencyKey: 'idem-1',
    createdAt: '2026-11-04T12:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    m.listOrders.mockResolvedValue([ORDER]);
  });

  it('parceiro recebe só os dados da venda: sem nome, e-mail, uid nem ids de pagamento', async () => {
    const res = response();
    await PartnerContentController.listEventOrders(
      request({ id: 'ev1' }),
      res as unknown as Response
    );
    expect(res.statusCode).toBe(200);
    const body = JSON.stringify(res.body);
    for (const leak of ['ana@exemplo.com', 'Ana Souza', 'buyer-1', 'pi_123', 'idem-1']) {
      expect(body).not.toContain(leak);
    }
    expect(res.body).toMatchObject({
      data: [{ id: 'o1', occurrenceId: 'occ1', status: 'paid', totalMinor: 10300 }],
    });
  });

  it('admin continua vendo o pedido inteiro', async () => {
    const res = response();
    await PartnerContentController.listEventOrders(
      {
        params: { id: 'ev1' },
        body: {},
        guideUserContext: { uid: 'root', admin: true, role: 'admin' },
      } as unknown as AuthenticatedRequest,
      res as unknown as Response
    );
    expect(res.body).toMatchObject({ data: [ORDER] });
  });
});
