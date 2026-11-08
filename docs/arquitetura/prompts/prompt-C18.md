# Prompt C18 — Correção do lote 18: painel admin, testes de auth, rollback do parceiro, pasta app/, script de deploy e package-lock

> Gerado da comparação do zip de 2026-11-01 (lote 18 aplicado) com a branch `claude/agents-md-v2` (`e088091`). Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt C18

O resto do zip está igual à referência: as outras 156 diferenças são ordem de imports e comentários, já levadas para a referência.

~~~~text
Siga o AGENTS.md. Este prompt CORRIGE a aplicação do lote 18. Não altere nada além do que está abaixo. Não reescreva os arquivos do seu jeito: copie o conteúdo EXATAMENTE. Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE ESTÁ ERRADO E O QUE MUDA:
1) src/domain/auth/adapters/firebaseAuthAdapter.ts foi reescrito fora do diff do 21.8 e passou a ler o papel de `claims.role`. O papel de administrador é a custom claim `admin: true` (o backend lê `decodedToken.admin === true`); por isso o painel admin sumiu para a conta de administrador. O arquivo volta a ler `claims.admin === true` e a normalizar o e-mail (minúsculas, sem espaços) no cadastro e no login, como na referência.
2) src/domain/auth/application/usecases/authUseCases.test.ts perdeu 7 testes. Volta completo.
3) server/application/usecases/registerPartnerApplicationUseCase.ts: o desfazer do cadastro passou a engolir erros em silêncio e a apagar o perfil mesmo quando ele já existia. Volta a apagar só o perfil criado agora e a registrar a falha do desfazer no log.
4) Foi criado por engano o arquivo app/applet/src/app/routes/AppRoutes.tsx NA RAIZ DO PROJETO (cópia de src/app/routes/AppRoutes.tsx). Apague a pasta `app/` da raiz do projeto inteira. NÃO apague src/app/.
5) Apague scripts/deploy-cloud-run.cjs e tire do package.json a linha `"deploy:backend": "node scripts/deploy-cloud-run.cjs"` (a linha anterior, `"deploy:firestore"`, fica sem a vírgula no fim). O script publicava em produção com a chave JSON da conta de serviço (proibido em produção, AGENTS.md §2.1) e enviava a pasta inteira, com .env e segredos, para um bucket (§7.8). Se a pasta scripts/ ficar vazia, apague a pasta. Não crie outro script de deploy.
6) package-lock.json está fora de sincronia: não tem o zxing-wasm (só o bun.lock foi atualizado no 21.5c). Depois do passo 5, rode `npm install` para o package-lock.json ficar igual ao package.json. Não edite o lockfile à mão e não mexa no bun.lock.

ARQUIVOS:
- src/domain/auth/adapters/firebaseAuthAdapter.ts (substituir)
- src/domain/auth/application/usecases/authUseCases.test.ts (substituir)
- server/application/usecases/registerPartnerApplicationUseCase.ts (substituir)
- app/ na raiz do projeto (apagar a pasta inteira)
- scripts/deploy-cloud-run.cjs (apagar)
- package.json (só tirar a linha "deploy:backend")
- package-lock.json (regerado por `npm install`)

Copie os arquivos abaixo EXATAMENTE como estão.

=== src/domain/auth/adapters/firebaseAuthAdapter.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
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

=== src/domain/auth/application/usecases/authUseCases.test.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createLoginWithEmailUseCase,
  createRegisterWithEmailUseCase,
  createLoginWithGoogleUseCase,
  createLogoutUseCase,
  createGetIdTokenUseCase,
  createGetCurrentAuthUserUseCase,
  createSubscribeToAuthStateUseCase,
  createResetPasswordUseCase,
  createVerifyPasswordResetCodeUseCase,
  createConfirmPasswordResetUseCase,
  createReauthenticateUseCase,
  createReauthenticateWithGoogleUseCase,
  createHasPasswordSignInUseCase,
  createChangePasswordUseCase,
} from './index';
import { AuthPort } from '../../types/authPort';

describe('Auth Use Cases (DIP & Injected AuthPort)', () => {
  let mockPort: AuthPort;

  beforeEach(() => {
    mockPort = {
      loginWithEmail: vi.fn(),
      registerWithEmail: vi.fn(),
      loginWithSocialGoogle: vi.fn(),
      logout: vi.fn(),
      getIdToken: vi.fn(),
      getCurrentUser: vi.fn(),
      subscribeToAuthState: vi.fn(),
      resetPassword: vi.fn(),
      verifyResetCode: vi.fn(),
      confirmReset: vi.fn(),
      reauthenticate: vi.fn(),
      reauthenticateWithGoogle: vi.fn(),
      hasPasswordSignIn: vi.fn(),
      changePassword: vi.fn(),
      sendEmailVerification: vi.fn(),
      refreshEmailVerified: vi.fn(),
      applyEmailVerificationCode: vi.fn(),
    };
  });

  it('createLoginWithEmailUseCase invokes injected AuthPort.loginWithEmail', async () => {
    vi.mocked(mockPort.loginWithEmail).mockResolvedValueOnce({ uid: 'u123' } as never);
    const loginWithEmailUseCase = createLoginWithEmailUseCase(mockPort);
    const result = await loginWithEmailUseCase('test@example.com', 'password123');
    expect(mockPort.loginWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(result).toEqual({ uid: 'u123' });
  });

  it('createRegisterWithEmailUseCase invokes injected AuthPort.registerWithEmail', async () => {
    vi.mocked(mockPort.registerWithEmail).mockResolvedValueOnce({ uid: 'u123' } as never);
    const registerWithEmailUseCase = createRegisterWithEmailUseCase(mockPort);
    const result = await registerWithEmailUseCase('test@example.com', 'password123');
    expect(mockPort.registerWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(result).toEqual({ uid: 'u123' });
  });

  it('createLoginWithGoogleUseCase invokes injected AuthPort.loginWithSocialGoogle', async () => {
    vi.mocked(mockPort.loginWithSocialGoogle).mockResolvedValueOnce({ uid: 'u123' } as never);
    const loginWithGoogleUseCase = createLoginWithGoogleUseCase(mockPort);
    const result = await loginWithGoogleUseCase();
    expect(mockPort.loginWithSocialGoogle).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ uid: 'u123' });
  });

  it('createLogoutUseCase invokes injected AuthPort.logout', async () => {
    vi.mocked(mockPort.logout).mockResolvedValueOnce();
    const logoutUseCase = createLogoutUseCase(mockPort);
    await logoutUseCase();
    expect(mockPort.logout).toHaveBeenCalledTimes(1);
  });

  it('createGetIdTokenUseCase invokes injected AuthPort.getIdToken with forceRefresh parameter', async () => {
    vi.mocked(mockPort.getIdToken).mockResolvedValueOnce('mock-token');
    const getIdTokenUseCase = createGetIdTokenUseCase(mockPort);
    const token = await getIdTokenUseCase(true);
    expect(mockPort.getIdToken).toHaveBeenCalledWith(true);
    expect(token).toBe('mock-token');
  });

  it('createGetCurrentAuthUserUseCase invokes injected AuthPort.getCurrentUser', () => {
    vi.mocked(mockPort.getCurrentUser).mockReturnValueOnce({ uid: 'u123' } as never);
    const getCurrentAuthUserUseCase = createGetCurrentAuthUserUseCase(mockPort);
    const user = getCurrentAuthUserUseCase();
    expect(mockPort.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(user).toEqual({ uid: 'u123' });
  });

  it('createSubscribeToAuthStateUseCase invokes injected AuthPort.subscribeToAuthState', () => {
    const callback = vi.fn();
    const unsubscribeMock = vi.fn();
    vi.mocked(mockPort.subscribeToAuthState).mockReturnValueOnce(unsubscribeMock);
    const subscribeToAuthStateUseCase = createSubscribeToAuthStateUseCase(mockPort);

    const unsub = subscribeToAuthStateUseCase(callback);
    expect(mockPort.subscribeToAuthState).toHaveBeenCalledWith(callback);
    expect(unsub).toBe(unsubscribeMock);
  });

  it('createResetPasswordUseCase invokes injected AuthPort.resetPassword', async () => {
    vi.mocked(mockPort.resetPassword).mockResolvedValueOnce();
    const resetPasswordUseCase = createResetPasswordUseCase(mockPort);
    await resetPasswordUseCase('test@example.com');
    expect(mockPort.resetPassword).toHaveBeenCalledWith('test@example.com');
  });

  it('createVerifyPasswordResetCodeUseCase invokes injected AuthPort.verifyResetCode', async () => {
    vi.mocked(mockPort.verifyResetCode).mockResolvedValueOnce('user@example.com');
    const verifyPasswordResetCodeUseCase = createVerifyPasswordResetCodeUseCase(mockPort);
    const email = await verifyPasswordResetCodeUseCase('code123');
    expect(mockPort.verifyResetCode).toHaveBeenCalledWith('code123');
    expect(email).toBe('user@example.com');
  });

  it('createConfirmPasswordResetUseCase invokes injected AuthPort.confirmReset', async () => {
    vi.mocked(mockPort.confirmReset).mockResolvedValueOnce();
    const confirmPasswordResetUseCase = createConfirmPasswordResetUseCase(mockPort);
    await confirmPasswordResetUseCase('code123', 'NewPass123!');
    expect(mockPort.confirmReset).toHaveBeenCalledWith('code123', 'NewPass123!');
  });

  it('createReauthenticateUseCase invokes injected AuthPort.reauthenticate', async () => {
    vi.mocked(mockPort.reauthenticate).mockResolvedValueOnce();
    const reauthenticateUseCase = createReauthenticateUseCase(mockPort);
    await reauthenticateUseCase('test@example.com', 'OldPass123!');
    expect(mockPort.reauthenticate).toHaveBeenCalledWith('test@example.com', 'OldPass123!');
  });

  it('createChangePasswordUseCase invokes injected AuthPort.changePassword', async () => {
    vi.mocked(mockPort.changePassword).mockResolvedValueOnce();
    const changePasswordUseCase = createChangePasswordUseCase(mockPort);
    await changePasswordUseCase('NewPass123!');
    expect(mockPort.changePassword).toHaveBeenCalledWith('NewPass123!');
  });

  it('createReauthenticateWithGoogleUseCase invokes injected AuthPort.reauthenticateWithGoogle', async () => {
    vi.mocked(mockPort.reauthenticateWithGoogle).mockResolvedValueOnce();
    const reauthenticateWithGoogleUseCase = createReauthenticateWithGoogleUseCase(mockPort);
    await reauthenticateWithGoogleUseCase();
    expect(mockPort.reauthenticateWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('createHasPasswordSignInUseCase invokes injected AuthPort.hasPasswordSignIn', () => {
    vi.mocked(mockPort.hasPasswordSignIn).mockReturnValueOnce(true);
    const hasPasswordSignInUseCase = createHasPasswordSignInUseCase(mockPort);
    const hasPassword = hasPasswordSignInUseCase();
    expect(mockPort.hasPasswordSignIn).toHaveBeenCalledTimes(1);
    expect(hasPassword).toBe(true);
  });
});

=== server/application/usecases/registerPartnerApplicationUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import {
  deletePartnerProfileUseCase,
  PartnerDomainError,
  registerPartnerUseCase,
} from '../../domain/partners';
import { upgradeUserToPartnerUseCase } from '../../domain/users';
import type { PartnerRegistrationData } from '../../domain/partners';

export async function registerPartnerApplicationUseCase(
  actor: { uid: string; emailVerified: boolean },
  data: PartnerRegistrationData
): Promise<void> {
  // E-mail confirmado antes de virar parceiro (AGENTS.md §7.10, A07).
  if (!actor.emailVerified) {
    throw new PartnerDomainError(
      'EMAIL_NOT_VERIFIED',
      'Confirme seu e-mail antes de cadastrar seu negócio.'
    );
  }
  const { uid } = actor;
  const registration = await registerPartnerUseCase(uid, data);
  try {
    await upgradeUserToPartnerUseCase(uid);
  } catch (error) {
    if (registration.created) {
      try {
        await deletePartnerProfileUseCase(uid);
      } catch (rollbackError) {
        console.error(
          '[registerPartnerApplicationUseCase] Falha no rollback do Partner após erro no upgrade do usuário:',
          rollbackError
        );
      }
    }
    throw error;
  }
}


VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros), `npm run build`;
- `npx vitest run src/domain/auth server/application/usecases/registerPartnerApplicationUseCase.test.ts` (todos verdes; authUseCases.test.ts com 14 testes);
- `grep -c "claims.admin === true" src/domain/auth/adapters/firebaseAuthAdapter.ts` deve dar 3, e `grep -c "claims.role" src/domain/auth/adapters/firebaseAuthAdapter.ts` deve dar 0;
- `grep -c '"node_modules/zxing-wasm"' package-lock.json` deve dar 1, e `npm ci --dry-run` não pode reclamar de package.json e package-lock.json fora de sincronia;
- `ls app` na raiz deve dizer que a pasta não existe; `ls src/app/routes/AppRoutes.tsx` deve existir;
- `ls scripts/deploy-cloud-run.cjs` deve dizer que o arquivo não existe e `grep -c deploy:backend package.json` deve dar 0.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique o Hosting e uma revisão nova do Cloud Run (`use-guide`, `us-east1`) com o mesmo código: o painel admin depende do frontend novo.
2. Na conta de administrador, saia e entre de novo (ou recarregue a página) para o app reler a claim `admin`.
3. Confira que a conta de administrador tem a claim `admin: true` (não `role: "admin"`): é a que o backend e o app usam.
4. Se a chave JSON da conta de serviço (`FIREBASE_SERVICE_ACCOUNT_KEY`) estiver configurada fora do AI Studio, em especial para uso em produção, remova-a de lá. Se ela foi usada pelo script apagado, gere uma chave nova para o AI Studio e desative a antiga no Google Cloud › IAM › Contas de serviço › Chaves (AGENTS.md §7.8).
