import type { NextFunction, Request, Response } from 'express';
import { consumeRateLimit } from '../firebase/firestoreRateLimiter';

/**
 * Limite por conta (AGENTS.md §7.4) para rotas autenticadas. Usar depois de `verifyAuthToken`.
 * Falha do armazenamento deixa passar: o limite protege contra varredura, não é autorização.
 */
export function rateLimitByUser(name: string, limit: number, windowMs: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const uid = (req as Request & { user?: { uid?: string } }).user?.uid;
    if (!uid) return next();
    const allowed = await consumeRateLimit(`${name}:${uid}`, limit, windowMs).catch(() => true);
    if (allowed) return next();
    return res.status(429).json({
      error: { code: 'RATE_LIMITED', message: 'Muitas tentativas. Tente de novo em alguns minutos.' },
    });
  };
}
