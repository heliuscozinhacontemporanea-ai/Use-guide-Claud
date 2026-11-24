import type { NextFunction, Response } from 'express';
import { resolveGuideUserContextApplicationUseCase } from '../../../application/usecases/resolveGuideUserContextApplicationUseCase';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

/** Papel de quem chama (admin, parceiro ativo ou usuário), lido no servidor, nunca do corpo (§7.3). */
export async function resolveGuideContext(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> {
  if (!req.user) {
    return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Faça login.' } });
  }
  try {
    req.guideUserContext = await resolveGuideUserContextApplicationUseCase(req.user);
    next();
    return undefined;
  } catch (error) {
    console.error('[resolveGuideContext Error]:', error);
    return res.status(500).json({
      error: {
        code: 'GUIDE_CONTEXT_FAILED',
        message: 'Não foi possível conferir sua conta agora.',
      },
    });
  }
}
