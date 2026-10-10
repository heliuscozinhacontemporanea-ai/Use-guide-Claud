import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AuthenticatedUser } from './authenticatedRequest';
import { AuthTokenVerifier, AuthTokenVerifierOptions } from './ports/authTokenVerifier';
import { defaultAuthTokenVerifier } from './adapters/firebaseAuthTokenVerifier';

export type { AuthenticatedRequest, AuthenticatedUser };

export function extractBearerToken(authHeader: unknown): string | null {
  if (typeof authHeader !== 'string') return null;
  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  return match?.[1]?.trim() || null;
}

let tokenVerifier: AuthTokenVerifier = defaultAuthTokenVerifier;

export function setAuthTokenVerifier(verifier: AuthTokenVerifier): void {
  tokenVerifier = verifier;
}

export function resetAuthTokenVerifier(): void {
  tokenVerifier = defaultAuthTokenVerifier;
}

export interface AuthVerificationOptions {
  checkRevoked?: boolean;
}

export async function verifyAuthToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
  options: AuthVerificationOptions = {}
) {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Não autorizado: Token ausente ou malformatado' });
    }

    const user = await tokenVerifier.verifyToken(token, options);
    req.user = user;
    return next();
  } catch (error) {
    console.error('[Verify Auth Token Error]:', error);
    return res.status(401).json({ error: 'Não autorizado: Token inválido ou expirado' });
  }
}

export async function verifyAdminToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  return verifyAuthToken(
    req,
    res,
    () => {
      if (req.user?.admin !== true) {
        return res
          .status(403)
          .json({ error: 'Acesso proibido: Requer privilégios de administrador' });
      }
      return next();
    },
    { checkRevoked: true }
  );
}

export const MAX_AUTH_AGE_SECONDS = 300;

export async function requireRecentAuthentication(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: 'REAUTHENTICATION_REQUIRED' });
  }

  try {
    const verifiedUser = await tokenVerifier.verifyToken(token, { checkRevoked: true });
    if (!req.user || verifiedUser.uid !== req.user.uid) {
      return res.status(401).json({ error: 'REAUTHENTICATION_REQUIRED' });
    }

    const authTime = verifiedUser.authTime;
    if (typeof authTime !== 'number' || !Number.isFinite(authTime)) {
      return res.status(401).json({ error: 'REAUTHENTICATION_REQUIRED' });
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const age = nowSeconds - authTime;
    if (authTime > nowSeconds || age > MAX_AUTH_AGE_SECONDS) {
      return res.status(401).json({ error: 'REAUTHENTICATION_REQUIRED' });
    }

    req.user = verifiedUser;
    return next();
  } catch (error) {
    console.error('[Recent Authentication Error]:', error);
    return res.status(401).json({ error: 'REAUTHENTICATION_REQUIRED' });
  }
}
