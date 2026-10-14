import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirebaseAuthAdapter } from './firebaseAuthAdapter';
import * as firebaseAuth from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  verifyPasswordResetCode: vi.fn(),
  confirmPasswordReset: vi.fn(),
  onAuthStateChanged: vi.fn(),
  reauthenticateWithCredential: vi.fn(),
  reauthenticateWithPopup: vi.fn(),
  EmailAuthProvider: {
    credential: vi.fn(),
    PROVIDER_ID: 'password',
  },
  updatePassword: vi.fn(),
}));

vi.mock('../../../shared/infrastructure/firebase/firebaseAuth', () => ({
  auth: {
    currentUser: {
      uid: 'user-123',
      getIdToken: vi.fn().mockResolvedValue('id-token-xyz'),
      getIdTokenResult: vi.fn().mockResolvedValue({ claims: {} }),
      providerData: [{ providerId: 'password' }],
    },
  },
  googleProvider: {},
}));

describe('FirebaseAuthAdapter', () => {
  let adapter: FirebaseAuthAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new FirebaseAuthAdapter();
  });

  it('loginWithEmail com credenciais válidas', async () => {
    const mockUserCredential = {
      user: {
        uid: 'user-123',
        email: 'test@example.com',
        displayName: 'John Doe',
        getIdToken: vi.fn().mockResolvedValue('token-abc'),
        getIdTokenResult: vi.fn().mockResolvedValue({ claims: {} }),
      },
    };
    vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValueOnce(
      mockUserCredential as any
    );

    const session = await adapter.loginWithEmail('test@example.com', 'password123');
    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password123'
    );
    expect(session.uid).toBe('user-123');
    expect(session.email).toBe('test@example.com');
  });

  it('logout encerra sessão no Firebase', async () => {
    vi.mocked(firebaseAuth.signOut).mockResolvedValueOnce();
    await adapter.logout();
    expect(firebaseAuth.signOut).toHaveBeenCalledTimes(1);
  });

  it('getIdToken retorna o ID token do usuário autenticado', async () => {
    const token = await adapter.getIdToken(true);
    expect(token).toBe('id-token-xyz');
  });

  it('resetPassword dispara envio de e-mail de recuperação', async () => {
    vi.mocked(firebaseAuth.sendPasswordResetEmail).mockResolvedValueOnce();
    await adapter.resetPassword('user@example.com');
    expect(firebaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.anything(),
      'user@example.com',
      expect.any(Object)
    );
  });

  it('loginWithSocialGoogle propaga erro quando popup é cancelado pelo usuário', async () => {
    const cancelError = new Error('Popup closed') as any;
    cancelError.code = 'auth/popup-closed-by-user';
    vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce(cancelError);

    await expect(adapter.loginWithSocialGoogle()).rejects.toThrow('Popup closed');
  });

  it('loginWithSocialGoogle propaga erro de popup bloqueado sem tentar redirecionamento', async () => {
    const blockedError = new Error('Popup blocked') as any;
    blockedError.code = 'auth/popup-blocked';
    vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce(blockedError);

    await expect(adapter.loginWithSocialGoogle()).rejects.toThrow('Popup blocked');
  });

  it('loginWithSocialGoogle propaga auth/unauthorized-domain sem tentar alterar config', async () => {
    const domainError = new Error('Domain not authorized') as any;
    domainError.code = 'auth/unauthorized-domain';
    vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce(domainError);

    await expect(adapter.loginWithSocialGoogle()).rejects.toMatchObject({
      code: 'auth/unauthorized-domain',
    });
  });

  it('verifyResetCode verifica código válido com sucesso', async () => {
    vi.mocked(firebaseAuth.verifyPasswordResetCode).mockResolvedValueOnce('user@example.com');
    const email = await adapter.verifyResetCode('valid-oob-code');
    expect(email).toBe('user@example.com');
  });

  it('verifyResetCode propaga erro se código for inválido ou expirado', async () => {
    const invalidError = new Error('Invalid code') as any;
    invalidError.code = 'auth/invalid-action-code';
    vi.mocked(firebaseAuth.verifyPasswordResetCode).mockRejectedValueOnce(invalidError);

    await expect(adapter.verifyResetCode('invalid-code')).rejects.toThrow('Invalid code');
  });

  it('reauthenticate executa reautenticação com senha', async () => {
    vi.mocked(firebaseAuth.EmailAuthProvider.credential).mockReturnValueOnce({} as any);
    vi.mocked(firebaseAuth.reauthenticateWithCredential).mockResolvedValueOnce({} as any);
    await adapter.reauthenticate('user@example.com', 'password123');
    expect(firebaseAuth.reauthenticateWithCredential).toHaveBeenCalled();
  });

  it('reauthenticateWithGoogle dispara popup com googleProvider', async () => {
    vi.mocked(firebaseAuth.reauthenticateWithPopup).mockResolvedValueOnce({} as any);
    await adapter.reauthenticateWithGoogle();
    expect(firebaseAuth.reauthenticateWithPopup).toHaveBeenCalled();
  });

  it('hasPasswordSignIn retorna true quando providerData inclui password', () => {
    expect(adapter.hasPasswordSignIn()).toBe(true);
  });

  it('changePassword atualiza a senha do usuário autenticado', async () => {
    vi.mocked(firebaseAuth.updatePassword).mockResolvedValueOnce();
    await adapter.changePassword('newPass123!');
    expect(firebaseAuth.updatePassword).toHaveBeenCalledWith(expect.anything(), 'newPass123!');
  });
});
