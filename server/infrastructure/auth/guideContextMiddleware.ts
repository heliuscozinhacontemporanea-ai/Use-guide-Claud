import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authenticatedRequest';
import { resolveGuideUserContextApplicationUseCase } from '../../application/usecases/resolveGuideUserContextApplicationUseCase';

export async function resolveGuideContext(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  try {
    req.guideUserContext = await resolveGuideUserContextApplicationUseCase(req.user);
    return next();
  } catch (error) {
    console.error('[resolveGuideContext Error]:', error);
    return res.status(500).json({ error: 'Erro ao resolver contexto do usuário' });
  }
}
