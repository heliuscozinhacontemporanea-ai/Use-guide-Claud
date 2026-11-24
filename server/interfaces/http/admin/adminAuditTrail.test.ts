import { EventEmitter } from 'node:events';
import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ record: vi.fn() }));
vi.mock('../../../domain/admin', () => ({ recordAdminActionUseCase: m.record }));

import { adminAuditTrail } from './adminAuditTrail';

function run(method: string, admin: boolean | null, status = 200) {
  const res = Object.assign(new EventEmitter(), { statusCode: status }) as unknown as Response;
  const req = {
    method,
    baseUrl: '/api/partners',
    path: '/items/item-1',
    route: { path: '/items/:id' },
    params: { id: 'item-1' },
    user: admin === null ? undefined : { uid: admin ? 'admin-1' : 'partner-1', admin },
  } as unknown as AuthenticatedRequest;
  const next = vi.fn();
  adminAuditTrail(req, res, next);
  (res as unknown as EventEmitter).emit('finish');
  return next;
}

describe('adminAuditTrail (A09, F4)', () => {
  beforeEach(() => {
    m.record.mockReset().mockResolvedValue(undefined);
  });

  it('grava quem, o quê e quando nas mudanças do admin, sem o corpo do pedido', () => {
    const next = run('PUT', true);
    expect(next).toHaveBeenCalledTimes(1);
    expect(m.record).toHaveBeenCalledWith({
      actorUid: 'admin-1',
      action: 'PUT /api/partners/items/:id',
      targets: { id: 'item-1' },
      status: 200,
      at: expect.any(String),
    });
  });

  it('grava também a mudança recusada', () => {
    run('DELETE', true, 422);
    expect(m.record).toHaveBeenCalledWith(expect.objectContaining({ status: 422 }));
  });

  it('não grava leitura, parceiro nem pedido sem login', () => {
    run('GET', true);
    run('POST', false);
    run('POST', null);
    expect(m.record).not.toHaveBeenCalled();
  });

  it('falha ao gravar não derruba a resposta', async () => {
    m.record.mockRejectedValue(new Error('firestore fora'));
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const next = run('POST', true, 201);
    await Promise.resolve();
    await Promise.resolve();
    expect(next).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith('[adminAuditTrail] Ação de admin sem registro', {
      name: 'Error',
    });
    error.mockRestore();
  });
});
