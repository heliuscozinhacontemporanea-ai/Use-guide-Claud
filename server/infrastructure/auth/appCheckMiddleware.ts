import { getAppCheck } from 'firebase-admin/app-check';
import type { NextFunction, Request, Response } from 'express';

// Fail-closed em produção: só desliga com APP_CHECK_REQUIRED=false explícito.
export function isAppCheckRequired(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.APP_CHECK_REQUIRED === 'true') return true;
  if (env.APP_CHECK_REQUIRED === 'false') return false;
  return env.NODE_ENV === 'production';
}

export async function verifyAppCheck(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  const token = req.header('X-Firebase-AppCheck');
  if (!token) {
    if (isAppCheckRequired()) {
      return res.status(401).json({
        error: 'App Check obrigatório',
      });
    }
    return next();
  }
  try {
    const claims = await getAppCheck().verifyToken(token);
    (req as Request & { appCheck?: unknown }).appCheck = claims;
    return next();
  } catch {
    return res.status(401).json({
      error: 'App Check inválido',
    });
  }
}
