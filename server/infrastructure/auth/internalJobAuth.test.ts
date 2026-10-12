import type { NextFunction, Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifyInternalJobKey } from './internalJobAuth';

function run(headerValue?: string) {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const next = vi.fn() as NextFunction;
  const req = { headers: headerValue ? { 'x-internal-job-key': headerValue } : {} } as Request;
  verifyInternalJobKey(req, { status } as unknown as Response, next);
  return { status, next };
}

describe('verifyInternalJobKey', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('503 sem chave configurada', () => {
    vi.stubEnv('INTERNAL_JOB_KEY', '');
    expect(run('qualquer').status).toHaveBeenCalledWith(503);
  });

  it('401 com chave errada ou de tamanho diferente', () => {
    vi.stubEnv('INTERNAL_JOB_KEY', 'a'.repeat(32));
    expect(run('b'.repeat(32)).status).toHaveBeenCalledWith(401);
    expect(run('a').status).toHaveBeenCalledWith(401);
    expect(run().status).toHaveBeenCalledWith(401);
  });

  it('segue com a chave correta', () => {
    vi.stubEnv('INTERNAL_JOB_KEY', 'a'.repeat(32));
    const { next, status } = run('a'.repeat(32));
    expect(next).toHaveBeenCalled();
    expect(status).not.toHaveBeenCalled();
  });
});
