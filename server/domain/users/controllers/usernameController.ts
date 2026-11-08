import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
import { UsernameError } from '../errors/usernameError';
import { findUserByUsernameUseCase } from '../usecases/findUserByUsernameUseCase';
import { suggestUsernameUseCase } from '../usecases/suggestUsernameUseCase';

const STATUS: Record<UsernameError['code'], number> = {
  USERNAME_INVALID: 400,
  USERNAME_TAKEN: 409,
  USERNAME_CHANGE_TOO_SOON: 422,
  USERNAME_NOT_FOUND: 404,
};

function sendError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof UsernameError) {
    return res
      .status(STATUS[error.code])
      .json({ error: { code: error.code, message: error.message } });
  }
  console.error(`[username.${operation}]`, error instanceof Error ? error.name : 'unknown');
  return res
    .status(500)
    .json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao processar o nome de usuário.' } });
}

function unauthenticated(res: Response): Response {
  return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Faça login.' } });
}

export class UsernameController {
  static async suggest(req: AuthenticatedRequest, res: Response) {
    const uid = req.user?.uid;
    if (!uid) return unauthenticated(res);
    const name = typeof req.query.name === 'string' ? req.query.name.slice(0, 120) : '';
    try {
      return res.status(200).json({ username: await suggestUsernameUseCase(uid, name) });
    } catch (error) {
      return sendError(res, error, 'suggest');
    }
  }

  static async find(req: AuthenticatedRequest, res: Response) {
    if (!req.user?.uid) return unauthenticated(res);
    try {
      return res
        .status(200)
        .json(await findUserByUsernameUseCase(String(req.params.username ?? '')));
    } catch (error) {
      return sendError(res, error, 'find');
    }
  }
}
