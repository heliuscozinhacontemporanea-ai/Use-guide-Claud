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
