import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { ticketingHttpError } from '../errors/ticketingHttpError';

export function getActor(req: AuthenticatedRequest) {
  return {
    uid: req.user?.uid || '',
    admin: req.user?.admin === true,
    role: req.user?.admin === true ? 'admin' : 'user',
    emailVerified: req.user?.emailVerified === true,
  };
}

/** Formato único de erro (§10.2): `code` estável e mensagem segura para a pessoa. */
export function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

export function handleTicketingError(res: Response, error: unknown): Response {
  const known = ticketingHttpError(error);
  if (known) return sendError(res, known.status, known.code, known.message);
  console.error('[TicketingController]', error instanceof Error ? error.name : 'unknown');
  return sendError(res, 500, 'INTERNAL_ERROR', 'Erro interno no serviço de ingressos.');
}
