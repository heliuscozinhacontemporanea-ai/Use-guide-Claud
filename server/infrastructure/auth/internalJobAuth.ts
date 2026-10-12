import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

/**
 * Autentica jobs internos (Cloud Scheduler/Functions) pelo header X-Internal-Job-Key.
 * Legado até a migração para token OIDC (AGENTS.md §7.9); a chave fica no Secret Manager.
 */
export function verifyInternalJobKey(req: Request, res: Response, next: NextFunction) {
  const configuredKey = process.env.INTERNAL_JOB_KEY;
  if (!configuredKey) {
    return res
      .status(503)
      .json({
        error: { code: 'INTERNAL_JOB_NOT_CONFIGURED', message: 'Job interno não configurado.' },
      });
  }
  const configured = Buffer.from(configuredKey, 'utf8');
  const provided = Buffer.from(String(req.headers['x-internal-job-key'] || ''), 'utf8');
  if (configured.length !== provided.length || !timingSafeEqual(configured, provided)) {
    return res
      .status(401)
      .json({ error: { code: 'UNAUTHENTICATED', message: 'Chave de job interno inválida.' } });
  }
  return next();
}
