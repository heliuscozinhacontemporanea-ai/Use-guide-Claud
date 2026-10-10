import { adminAuth } from '../../firebase/adminClient';
import { AuthTokenVerifier, AuthTokenVerifierOptions } from '../ports/authTokenVerifier';
import { AuthenticatedUser } from '../types/authenticatedUser';

export class FirebaseAuthTokenVerifier implements AuthTokenVerifier {
  async verifyToken(token: string, options?: AuthTokenVerifierOptions): Promise<AuthenticatedUser> {
    const checkRevoked = options?.checkRevoked ?? false;
    const decodedToken = await adminAuth.verifyIdToken(token, checkRevoked);

    return {
      uid: decodedToken.uid,
      ...(decodedToken.email && { email: decodedToken.email }),
      emailVerified: decodedToken.email_verified ?? false,
      admin: decodedToken.admin === true,
      authTime: decodedToken.auth_time,
    };
  }
}

export const defaultAuthTokenVerifier = new FirebaseAuthTokenVerifier();
