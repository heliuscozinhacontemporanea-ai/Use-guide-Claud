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
): Promise<undefined | Response> {
  const token = req.header('X-Firebase-AppCheck');
  if (!token) {
    if (isAppCheckRequired()) {
      return res.status(401).json({
        error: { code: 'APP_CHECK_REQUIRED', message: 'App Check obrigatório.' },
      });
    }
    next();
    return undefined;
  }
  try {
    const claims = await getAppCheck().verifyToken(token);
    (req as Request & { appCheck?: unknown }).appCheck = claims;
    next();
    return undefined;
  } catch {
    return res.status(401).json({
      error: { code: 'APP_CHECK_INVALID', message: 'App Check inválido.' },
    });
  }
}
