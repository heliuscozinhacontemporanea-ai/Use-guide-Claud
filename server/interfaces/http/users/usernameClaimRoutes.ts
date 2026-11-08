import { type Response, Router } from 'express';
import { claimUsernameApplicationUseCase } from '../../../application/usecases/notifications/claimUsernameApplicationUseCase';
import { UsernameError } from '../../../domain/users';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { usernameSchema } from './schemas/usernameSchema';

const STATUS: Record<UsernameError['code'], number> = {
  USERNAME_INVALID: 400,
  USERNAME_TAKEN: 409,
  USERNAME_CHANGE_TOO_SOON: 422,
  USERNAME_NOT_FOUND: 404,
};

async function claim(req: AuthenticatedRequest, res: Response): Promise<Response> {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Faça login.' } });
  }
  const parsed = usernameSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: 'Nome de usuário inválido.' } });
  }
  try {
    return res
      .status(200)
      .json({ username: await claimUsernameApplicationUseCase(uid, parsed.data.username) });
  } catch (error) {
    if (error instanceof UsernameError) {
      return res
        .status(STATUS[error.code])
        .json({ error: { code: error.code, message: error.message } });
    }
    console.error('[username.claim]', error instanceof Error ? error.name : 'unknown');
    return res
      .status(500)
      .json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao processar o nome de usuário.' } });
  }
}

/** PUT /api/users/me/username: a troca avisa a conta, então passa pela camada application. */
export const usernameClaimRouter = Router();
usernameClaimRouter.put('/me/username', verifyAuthToken, claim);
