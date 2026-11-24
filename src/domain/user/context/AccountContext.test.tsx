import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole, type UserSession } from '../../auth/types/auth';
import type { UserProfile } from '../types/user';
import { AccountProvider, useAccount } from './AccountContext';

const auth = vi.hoisted(() => ({
  value: { user: null as UserSession | null, loading: true },
}));
const getCurrentUserUseCase = vi.hoisted(() => vi.fn());

vi.mock('../../auth', async () => ({
  ...(await vi.importActual<typeof import('../../auth/types/auth')>('../../auth/types/auth')),
  useAuthContext: () => auth.value,
}));
vi.mock('../application/usecases/getCurrentUserUseCase', () => ({ getCurrentUserUseCase }));

function session(uid: string, role = UserRole.USER): UserSession {
  return {
    uid,
    email: `${uid}@exemplo.com`,
    displayName: uid,
    photoURL: `https://google/${uid}.jpg`,
    emailVerified: true,
    role,
    isAnonymous: false,
  };
}

function profile(uid: string, extra: Partial<UserProfile> = {}): UserProfile {
  return { uid, email: `${uid}@exemplo.com`, firstName: uid, ...extra };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

let account: ReturnType<typeof useAccount>;
function Consumer() {
  account = useAccount();
  return (
    <span data-testid="state">
      {account.loading
        ? 'loading'
        : `${account.user?.uid ?? 'no-user'}|${account.profile?.firstName ?? 'no-profile'}|${account.user?.role ?? '-'}`}
    </span>
  );
}

function renderAccount() {
  const view = render(
    <AccountProvider>
      <Consumer />
    </AccountProvider>
  );
  return {
    state: () => screen.getByTestId('state').textContent,
    signIn: (next: UserSession | null) => {
      auth.value = { user: next, loading: false };
      view.rerender(
        <AccountProvider>
          <Consumer />
        </AccountProvider>
      );
    },
  };
}

describe('Conta: sessão do auth com o perfil do user (B77)', () => {
  beforeEach(() => {
    getCurrentUserUseCase.mockReset();
    auth.value = { user: null, loading: true };
  });

  it('carrega até a sessão e o perfil chegarem; parceiro vem do perfil', async () => {
    const view = renderAccount();
    expect(view.state()).toBe('loading');
    getCurrentUserUseCase.mockResolvedValueOnce(profile('ana', { role: 'partner' }));
    await act(async () => view.signIn(session('ana')));
    expect(view.state()).toBe('ana|ana|partner');
  });

  it('admin vem das claims, mesmo com perfil de usuário', async () => {
    const view = renderAccount();
    getCurrentUserUseCase.mockResolvedValueOnce(profile('root', { role: 'user' }));
    await act(async () => view.signIn(session('root', UserRole.ADMIN)));
    expect(view.state()).toBe('root|root|admin');
  });

  it('o perfil de quem saiu não aparece se chegar atrasado', async () => {
    const view = renderAccount();
    const late = deferred<UserProfile | null>();
    getCurrentUserUseCase.mockReturnValueOnce(late.promise);
    act(() => view.signIn(session('ana')));
    expect(view.state()).toBe('loading');
    act(() => view.signIn(null));
    expect(view.state()).toBe('no-user|no-profile|-');
    await act(async () => late.resolve(profile('ana')));
    expect(view.state()).toBe('no-user|no-profile|-');
  });

  it('troca rápida de conta: o perfil da primeira não entra na segunda', async () => {
    const view = renderAccount();
    const first = deferred<UserProfile | null>();
    getCurrentUserUseCase
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce(profile('bruno'));
    act(() => view.signIn(session('ana')));
    await act(async () => view.signIn(session('bruno')));
    expect(view.state()).toBe('bruno|bruno|user');
    await act(async () => first.resolve(profile('ana', { role: 'partner' })));
    expect(view.state()).toBe('bruno|bruno|user');
  });

  it('no cadastro, a leitura de antes do nome gravado não apaga a de depois', async () => {
    const view = renderAccount();
    const beforeName = deferred<UserProfile | null>();
    getCurrentUserUseCase
      .mockReturnValueOnce(beforeName.promise)
      .mockResolvedValueOnce(profile('ana', { firstName: 'Ana' }));
    act(() => view.signIn(session('ana')));
    await act(async () => account.refreshProfile());
    expect(view.state()).toBe('ana|Ana|user');
    await act(async () => beforeName.resolve(profile('ana', { firstName: undefined })));
    expect(view.state()).toBe('ana|Ana|user');
  });

  it('falha ao ler o perfil não trava o app carregando', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const view = renderAccount();
    getCurrentUserUseCase.mockRejectedValueOnce(new Error('rede'));
    await act(async () => view.signIn(session('ana')));
    expect(view.state()).toBe('ana|no-profile|user');
  });

  it('foto: a enviada agora, depois a do perfil, depois a do Google', async () => {
    const view = renderAccount();
    getCurrentUserUseCase.mockResolvedValueOnce(profile('ana', { photoURL: 'https://perfil.jpg' }));
    await act(async () => view.signIn(session('ana')));
    expect(account.photoURL).toBe('https://perfil.jpg');
    act(() => account.setPhotoURL('https://nova.jpg'));
    expect(account.photoURL).toBe('https://nova.jpg');
    expect(account.user?.photoURL).toBe('https://nova.jpg');
    getCurrentUserUseCase.mockResolvedValueOnce(profile('bruno'));
    await act(async () => view.signIn(session('bruno')));
    expect(account.photoURL).toBe('https://google/bruno.jpg');
  });
});
