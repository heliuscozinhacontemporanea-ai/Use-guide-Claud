import {
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword,
  signInWithPopup as fbSignInWithPopup,
  signOut as fbSignOut,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  sendEmailVerification as fbSendEmailVerification,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  updatePassword,
} from 'firebase/auth';
import { SITE_URL } from '../../../shared/constants/siteUrl';
import { auth, googleProvider } from '../../../shared/infrastructure/firebase/firebaseAuth';
import { UserRole, UserSession, AuthIdentity } from '../types/auth';
import { AuthPort } from '../types/authPort';

/**
 * Para onde o botão "continuar" do Firebase leva depois da ação. Fora do teste local é sempre o site
 * oficial (D22): os e-mails nunca mostram o endereço do AI Studio. O link do e-mail em si é o URL de
 * ação configurado no console (Authentication › Modelos).
 */
export function authActionContinueUrl(hostname: string, origin: string): string {
  return hostname === 'localhost' || hostname === '127.0.0.1' ? origin : SITE_URL;
}

function continueUrl(): string {
  if (typeof window === 'undefined') return SITE_URL;
  return authActionContinueUrl(window.location.hostname, window.location.origin);
}

function authErrorCode(error: unknown): string | undefined {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' ? code : undefined;
}

export class FirebaseAuthAdapter implements AuthPort {
  async registerWithEmail(email: string, password: string): Promise<UserSession> {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const userCredential = await fbCreateUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );
      const { user } = userCredential;

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        role: UserRole.USER,
        isAnonymous: user.isAnonymous,
      };
    } catch (error) {
      console.error('[FirebaseAuthAdapter] registerWithEmail error:', error);
      throw error;
    }
  }

  async loginWithEmail(email: string, password: string): Promise<UserSession> {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const userCredential = await fbSignInWithEmailAndPassword(auth, normalizedEmail, password);
      const { user } = userCredential;

      let role = UserRole.USER;
      try {
        const idTokenResult = await user.getIdTokenResult();
        if (idTokenResult.claims.admin === true) {
          role = UserRole.ADMIN;
        }
      } catch (err) {
        console.warn('[FirebaseAuthAdapter] Failed to fetch role on login:', err);
      }

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        role,
        isAnonymous: user.isAnonymous,
      };
    } catch (error: unknown) {
      const code = authErrorCode(error);
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password'
      ) {
        console.warn('[FirebaseAuthAdapter] loginWithEmail invalid credentials:', code);
      } else {
        console.error('[FirebaseAuthAdapter] loginWithEmail error:', error);
      }
      throw error;
    }
  }

  async loginWithSocialGoogle(): Promise<UserSession> {
    try {
      const userCredential = await fbSignInWithPopup(auth, googleProvider);
      const { user } = userCredential;

      let role = UserRole.USER;
      try {
        const idTokenResult = await user.getIdTokenResult();
        if (idTokenResult.claims.admin === true) {
          role = UserRole.ADMIN;
        }
      } catch (err) {
        console.warn('[FirebaseAuthAdapter] Failed to fetch role on social login:', err);
      }

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Novo Usuário',
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        role,
        isAnonymous: user.isAnonymous,
      };
    } catch (error: unknown) {
      if (authErrorCode(error) !== 'auth/popup-closed-by-user') {
        console.error('[FirebaseAuthAdapter] loginWithSocialGoogle error:', error);
      }

      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await fbSignOut(auth);
    } catch (error) {
      console.error('[FirebaseAuthAdapter] logout error:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await fbSendPasswordResetEmail(auth, email, { url: continueUrl() });
    } catch (error) {
      console.error('[FirebaseAuthAdapter] resetPassword error:', error);
      throw error;
    }
  }

  async sendEmailVerification(locale: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('NOT_AUTHENTICATED');
    auth.languageCode = locale;
    try {
      await fbSendEmailVerification(user, { url: continueUrl() });
    } catch (error: unknown) {
      throw new Error(
        authErrorCode(error) === 'auth/too-many-requests' ? 'TOO_MANY_REQUESTS' : 'SEND_FAILED'
      );
    }
  }

  async refreshEmailVerified(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;
    await user.reload();
    // O backend lê `email_verified` do ID token: sem renovar, ele continuaria vendo false.
    if (user.emailVerified) await user.getIdToken(true);
    return user.emailVerified;
  }

  async applyEmailVerificationCode(code: string): Promise<void> {
    await applyActionCode(auth, code);
    if (auth.currentUser) await this.refreshEmailVerified();
  }

  async verifyResetCode(code: string): Promise<string> {
    try {
      return await verifyPasswordResetCode(auth, code);
    } catch (error) {
      console.error('[FirebaseAuthAdapter] verifyResetCode error:', error);
      throw error;
    }
  }

  async confirmReset(code: string, newPass: string): Promise<void> {
    try {
      await confirmPasswordReset(auth, code, newPass);
    } catch (error) {
      console.error('[FirebaseAuthAdapter] confirmReset error:', error);
      throw error;
    }
  }

  subscribeToAuthState(callback: (session: UserSession | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let role = UserRole.USER;
        try {
          const idTokenResult = await firebaseUser.getIdTokenResult();
          if (idTokenResult.claims.admin === true) {
            role = UserRole.ADMIN;
          }
        } catch (e) {
          console.warn('[FirebaseAuthAdapter] Error fetching role in auth state changed:', e);
        }
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          role,
          isAnonymous: firebaseUser.isAnonymous,
        });
      } else {
        callback(null);
      }
    });
  }

  async reauthenticate(email: string, currentPassword: string): Promise<void> {
    if (!auth.currentUser) throw new Error('Nenhum usuário autenticado.');
    const credential = EmailAuthProvider.credential(email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
  }

  async reauthenticateWithGoogle(): Promise<void> {
    if (!auth.currentUser) throw new Error('Nenhum usuário autenticado.');
    await reauthenticateWithPopup(auth.currentUser, googleProvider);
  }

  hasPasswordSignIn(): boolean {
    return (
      auth.currentUser?.providerData.some(
        (provider) => provider.providerId === EmailAuthProvider.PROVIDER_ID
      ) ?? false
    );
  }

  async changePassword(newPassword: string): Promise<void> {
    if (!auth.currentUser) throw new Error('Nenhum usuário autenticado.');
    await updatePassword(auth.currentUser, newPassword);
  }

  getCurrentUser(): AuthIdentity | null {
    const user = auth.currentUser;
    if (!user) return null;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous,
    };
  }

  async getIdToken(forceRefresh = false): Promise<string | null> {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken(forceRefresh);
  }
}
