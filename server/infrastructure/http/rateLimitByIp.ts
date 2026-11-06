import type { NextFunction, Request, Response } from 'express';
import { consumeRateLimit } from '../firebase/firestoreRateLimiter';

/**
 * Limite por IP (AGENTS.md §7.4) para rotas abertas sem login. O IP vem de `req.ip`, resolvido
 * pelo `trust proxy` do servidor. Falha do armazenamento deixa passar, como no limite por conta.
 */
export function rateLimitByIp(name: string, limit: number, windowMs: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const allowed = await consumeRateLimit(`${name}:ip:${ip}`, limit, windowMs).catch(() => true);
    if (allowed) return next();
    return res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Muitas tentativas. Tente de novo em alguns minutos.',
      },
    });
  };
}
