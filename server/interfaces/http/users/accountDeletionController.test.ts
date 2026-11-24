import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountClosureBlockedError } from '../../../application/usecases/accountClosure/accountClosureBlockedError';
import { deleteUserAccountApplicationUseCase } from '../../../application/usecases/deleteUserAccountApplicationUseCase';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { AccountDeletionController } from './accountDeletionController';

vi.mock('../../../application/usecases/deleteUserAccountApplicationUseCase', () => ({
  deleteUserAccountApplicationUseCase: vi.fn(),
}));

describe('AccountDeletionController (excluir conta)', () => {
  let res: Response;
  let statusMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    res = { status: statusMock, json: jsonMock } as unknown as Response;
  });

  it('sem login responde 401 no formato de erro (§10.2)', async () => {
    await AccountDeletionController.deleteAccount({} as AuthenticatedRequest, res);
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: { code: 'UNAUTHENTICATED', message: expect.any(String) },
    });
    expect(deleteUserAccountApplicationUseCase).not.toHaveBeenCalled();
  });

  it('sem vendas: exclui pela camada de aplicação e responde 200', async () => {
    vi.mocked(deleteUserAccountApplicationUseCase).mockResolvedValueOnce(undefined);
    const req = { user: { uid: 'user-1' } } as unknown as AuthenticatedRequest;
    await AccountDeletionController.deleteAccount(req, res);
    expect(deleteUserAccountApplicationUseCase).toHaveBeenCalledWith('user-1');
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      status: 'success',
      message: 'Conta e dados associados excluídos com sucesso',
    });
  });

  it('conta com vendas em andamento: 409 com o código e os motivos (travas de 2026-11-16)', async () => {
    vi.mocked(deleteUserAccountApplicationUseCase).mockRejectedValueOnce(
      new AccountClosureBlockedError(['sessions', 'payouts'])
    );
    const req = { user: { uid: 'p1' } } as unknown as AuthenticatedRequest;
    await AccountDeletionController.deleteAccount(req, res);
    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        code: 'ACCOUNT_HAS_ACTIVE_SALES',
        message: expect.any(String),
        blockers: ['sessions', 'payouts'],
      },
    });
  });

  it('erro interno: 500 com código estável, sem o detalhe da falha', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(deleteUserAccountApplicationUseCase).mockRejectedValueOnce(
      new Error('Cascade deletion crash')
    );
    const req = { user: { uid: 'user-1' } } as unknown as AuthenticatedRequest;
    await AccountDeletionController.deleteAccount(req, res);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: { code: 'ACCOUNT_DELETION_FAILED', message: 'Não foi possível excluir a conta.' },
    });
    expect(JSON.stringify(jsonMock.mock.calls)).not.toContain('Cascade');
  });
});
