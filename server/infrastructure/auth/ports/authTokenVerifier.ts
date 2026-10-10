import { AuthenticatedUser } from '../types/authenticatedUser';

export interface AuthTokenVerifierOptions {
  checkRevoked?: boolean;
}

export interface AuthTokenVerifier {
  verifyToken(token: string, options?: AuthTokenVerifierOptions): Promise<AuthenticatedUser>;
}
