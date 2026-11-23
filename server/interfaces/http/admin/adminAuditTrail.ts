import type { NextFunction, Response } from 'express';
import { recordAdminActionUseCase } from '../../../domain/admin';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
import { currentLogContext } from '../../../infrastructure/logging/structuredLog';

const MUTATIONS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function stringParams(params: unknown): Record<string, string> {
  if (!params || typeof params !== 'object') return {};
  return Object.fromEntries(
    Object.entries(params).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string'
    )
  );
}

/**
 * Registro de auditoria das mudanças feitas por admin nas rotas de anúncio e de evento (AGENTS.md
 * §7.10, A09; escolhas da F4). Grava depois da resposta, também quando a mudança foi recusada; a
 * falha ao gravar só vai para o log e não muda a resposta.
 */
export function adminAuditTrail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!MUTATIONS.has(req.method)) {
    next();
    return;
  }
  const requestId = currentLogContext()?.requestId;
  res.on('finish', () => {
    const user = req.user;
    if (user?.admin !== true) return;
    const pattern = typeof req.route?.path === 'string' ? req.route.path : req.path;
    void recordAdminActionUseCase({
      actorUid: user.uid,
      action: `${req.method} ${req.baseUrl}${pattern}`,
      targets: stringParams(req.params),
      status: res.statusCode,
      ...(requestId ? { requestId } : {}),
      at: new Date().toISOString(),
    }).catch((error: unknown) => {
      console.error('[adminAuditTrail] Ação de admin sem registro', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
    });
  });
  next();
}
