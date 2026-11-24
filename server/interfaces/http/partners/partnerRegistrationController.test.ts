import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registerPartnerApplicationUseCase } from '../../../application/usecases/registerPartnerApplicationUseCase';
import { PartnerDomainError } from '../../../domain/partners';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { PartnerRegistrationController } from './partnerRegistrationController';

vi.mock('../../../application/usecases/registerPartnerApplicationUseCase', () => ({
  registerPartnerApplicationUseCase: vi.fn(),
}));

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

const request = (body: unknown, emailVerified = true) =>
  ({ user: { uid: 'ana', emailVerified }, body }) as unknown as AuthenticatedRequest;

describe('PartnerRegistrationController ("Seja parceiro")', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sem login responde 401', async () => {
    const res = response();
    await PartnerRegistrationController.registerOrUpgrade(
      { body: {} } as AuthenticatedRequest,
      res as unknown as Response
    );
    expect(res.statusCode).toBe(401);
  });

  it('recusa termos não aceitos e campo extra (allowlist, §7.3)', async () => {
    for (const body of [
      { formData: { termsAccepted: false } },
      { formData: { termsAccepted: true, cpfCnpj: '529.982.247-25' } },
    ]) {
      const res = response();
      await PartnerRegistrationController.registerOrUpgrade(
        request(body),
        res as unknown as Response
      );
      expect(res.statusCode).toBe(400);
    }
    expect(registerPartnerApplicationUseCase).not.toHaveBeenCalled();
  });

  it('cadastra só com o aceite dos termos e o e-mail verificado vindo do token', async () => {
    const res = response();
    await PartnerRegistrationController.registerOrUpgrade(
      request({ formData: { termsAccepted: true } }),
      res as unknown as Response
    );
    expect(registerPartnerApplicationUseCase).toHaveBeenCalledWith(
      { uid: 'ana', emailVerified: true },
      { termsAccepted: true }
    );
    expect(res.statusCode).toBe(200);
  });

  it('e-mail sem confirmar: 403 com o código que a tela usa', async () => {
    vi.mocked(registerPartnerApplicationUseCase).mockRejectedValueOnce(
      new PartnerDomainError('EMAIL_NOT_VERIFIED', 'Confirme o e-mail.')
    );
    const res = response();
    await PartnerRegistrationController.registerOrUpgrade(
      request({ formData: { termsAccepted: true } }, false),
      res as unknown as Response
    );
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({
      error: { code: 'EMAIL_NOT_VERIFIED', message: 'Confirme o e-mail.' },
    });
  });

  it('erro interno não devolve a mensagem da falha (§10.2)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(registerPartnerApplicationUseCase).mockRejectedValueOnce(new Error('Firestore down'));
    const res = response();
    await PartnerRegistrationController.registerOrUpgrade(
      request({ formData: { termsAccepted: true } }),
      res as unknown as Response
    );
    expect(res.statusCode).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('Firestore');
  });
});
