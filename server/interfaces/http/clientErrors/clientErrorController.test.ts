import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { writeClientError } from '../../../infrastructure/logging/clientErrorLog';
import { ClientErrorController } from './clientErrorController';

vi.mock('../../../infrastructure/logging/clientErrorLog', () => ({ writeClientError: vi.fn() }));

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
    send() {
      return res;
    },
  };
  return res;
}

const request = (body: unknown) =>
  ({
    body,
    get: (name: string) => (name === 'user-agent' ? 'Mozilla/5.0 (iPhone)' : undefined),
  }) as unknown as Request;

const VALID = {
  kind: 'error',
  name: 'TypeError',
  message: 'Falha no pedido 123456789 de ana@exemplo.com',
  stack:
    'TypeError: Falha de ana@exemplo.com\n    at pay (https://useguide.com.br/assets/i.js?t=eyJa.eyJb.c:1:2345)',
  route: '/eventos',
};

describe('ClientErrorController (erros do navegador)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('grava o erro limpo de dado pessoal e responde 204', () => {
    const res = response();
    ClientErrorController.report(request(VALID), res as unknown as Response);
    expect(res.statusCode).toBe(204);
    const event = vi.mocked(writeClientError).mock.calls[0]?.[0];
    expect(event).toMatchObject({
      kind: 'error',
      name: 'TypeError',
      message: 'Falha no pedido [num] de [email]',
      route: '/eventos',
      userAgent: 'Mozilla/5.0 (iPhone)',
    });
    expect(JSON.stringify(event)).not.toMatch(/ana@|123456789|eyJa/);
    expect(event?.stack).toContain('i.js:1:2345');
  });

  it('caminho com parâmetros: fica só o caminho', () => {
    ClientErrorController.report(
      request({ ...VALID, route: '/eventos?email=a@b.co#x' }),
      response() as unknown as Response
    );
    expect(vi.mocked(writeClientError).mock.calls[0]?.[0].route).toBe('/eventos');
  });

  it('recusa campo extra, tipo desconhecido, texto grande e rota sem barra (400)', () => {
    for (const body of [
      { ...VALID, uid: 'u1' },
      { ...VALID, kind: 'console' },
      { ...VALID, message: 'x'.repeat(501) },
      { ...VALID, route: 'https://outro.site/x' },
      {},
    ]) {
      const res = response();
      ClientErrorController.report(request(body), res as unknown as Response);
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: { code: 'VALIDATION_ERROR', message: expect.any(String) },
      });
    }
    expect(writeClientError).not.toHaveBeenCalled();
  });
});
