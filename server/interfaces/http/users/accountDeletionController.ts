import type { Response } from 'express';
import { AccountClosureBlockedError } from '../../../application/usecases/accountClosure/accountClosureBlockedError';
import { deleteUserAccountApplicationUseCase } from '../../../application/usecases/deleteUserAccountApplicationUseCase';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

/** Excluir a conta: passa por todos os domínios pela camada de aplicação (AGENTS.md §7.5). */
export class AccountDeletionController {
  static async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Faça login.' } });
    }
    try {
      await deleteUserAccountApplicationUseCase(uid);
      return res
        .status(200)
        .json({ status: 'success', message: 'Conta e dados associados excluídos com sucesso' });
    } catch (error) {
      // Vendas em andamento prendem a conta (travas de 2026-11-16): a tela diz o que resolver.
      if (error instanceof AccountClosureBlockedError) {
        return res.status(409).json({
          error: { code: error.code, message: error.message, blockers: error.blockers },
        });
      }
      console.error('[AccountDeletionController.deleteAccount Error]:', error);
      return res.status(500).json({
        error: { code: 'ACCOUNT_DELETION_FAILED', message: 'Não foi possível excluir a conta.' },
      });
    }
  }
}
