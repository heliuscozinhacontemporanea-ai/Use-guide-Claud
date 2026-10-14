import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../shared/i18n';
import { SideMenu } from './SideMenu';
import { UserRole } from '../../domain/auth/types/auth';

const authContextState = vi.hoisted(() => ({
  user: null as any,
  loading: false,
  photoURL: null as string | null,
  profile: null as any,
}));

vi.mock('../../domain/auth/context/AuthContext', () => ({
  useAuthContext: () => authContextState,
}));

vi.mock('../../domain/auth', () => ({
  hasPasswordSignInUseCase: vi.fn().mockReturnValue(true),
  logoutUseCase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../domain/favorites', () => ({
  FavoritesList: ({ onBack }: { onBack: () => void }) => (
    <div>
      <span>favorites-view</span>
      <button onClick={onBack}>voltar-fav</button>
    </div>
  ),
}));

vi.mock('../../domain/bookings', () => ({
  MyBookingsView: ({ onBack }: { onBack: () => void }) => (
    <div>
      <span>my-bookings-view</span>
      <button onClick={onBack}>voltar-bookings</button>
    </div>
  ),
}));

vi.mock('../../domain/ticketing', () => ({
  UserTicketsHistoryView: ({ onBack }: { onBack: () => void }) => (
    <div>
      <span>user-tickets-view</span>
      <button onClick={onBack}>voltar-tickets</button>
    </div>
  ),
}));

vi.mock('../../domain/content', () => ({
  AboutView: ({ onBack }: { onBack: () => void }) => (
    <div>
      <span>about-view</span>
      <button onClick={onBack}>voltar-about</button>
    </div>
  ),
  SupportView: ({ onBack }: { onBack: () => void }) => (
    <div>
      <span>support-view</span>
      <button onClick={onBack}>voltar-support</button>
    </div>
  ),
}));

vi.mock('../../domain/user', () => ({
  useUserProfile: (onDelete: () => void) => ({
    userData: { firstName: 'Maria', lastName: 'Silva', phone: '11999999999' },
    setUserData: vi.fn(),
    passwordData: { current: '', new: '', confirm: '' },
    setPasswordData: vi.fn(),
    showPasswords: { current: false, new: false, confirm: false },
    setShowPasswords: vi.fn(),
    isLoading: false,
    message: null,
    setMessage: vi.fn(),
    updateProfile: vi.fn(),
    updatePassword: vi.fn(),
    deleteAccount: vi.fn(),
  }),
  useUserPhoto: (onMsg: (m: any) => void) => ({
    photoURL: null,
    isUploading: false,
    imageToCrop: null,
    isCropping: false,
    crop: { x: 0, y: 0 },
    zoom: 1,
    setZoom: vi.fn(),
    fileInputRef: { current: null },
    onCropChange: vi.fn(),
    onZoomChange: vi.fn(),
    onCropComplete: vi.fn(),
    handlePhotoSelect: vi.fn(),
    handleConfirmCrop: vi.fn(),
    cancelCropping: vi.fn(),
  }),
  ChangePasswordView: () => <div>change-password-view</div>,
  ImageCropperView: () => <div>cropper-view</div>,
  MainMenuView: ({
    onFavoritesOpen,
    onSettingsClick,
    onAboutOpen,
    onSupportOpen,
  }: any) => (
    <div>
      <span>main-menu-view</span>
      <button onClick={onFavoritesOpen}>open-favorites</button>
      <button onClick={onAboutOpen}>open-about</button>
      <button onClick={onSupportOpen}>open-support</button>
    </div>
  ),
  AccountView: ({ onBack }: { onBack: () => void }) => (
    <div>
      <span>account-view</span>
      <button onClick={onBack}>voltar-account</button>
    </div>
  ),
  SettingsView: ({ onBack, onOpenLanguage, onOpenAppearance }: any) => (
    <div>
      <span>settings-view</span>
      <button onClick={onBack}>voltar-settings</button>
      <button onClick={onOpenLanguage}>open-lang</button>
      <button onClick={onOpenAppearance}>open-appear</button>
    </div>
  ),
  LanguageSettingsView: ({ onBack }: { onBack: () => void }) => (
    <div>
      <span>language-view</span>
      <button onClick={onBack}>voltar-lang</button>
    </div>
  ),
  AppearanceSettingsView: ({ onBack }: { onBack: () => void }) => (
    <div>
      <span>appearance-view</span>
      <button onClick={onBack}>voltar-appear</button>
    </div>
  ),
}));

function renderSideMenu(initialUrl = '/?menu=1') {
  return render(
    <MemoryRouter initialEntries={[initialUrl]}>
      <SideMenu onPartnersOpen={vi.fn()} onAdminOpen={vi.fn()} />
    </MemoryRouter>
  );
}

describe('SideMenu', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    authContextState.user = {
      uid: 'user-1',
      email: 'user@test.com',
      displayName: 'Maria Silva',
      role: UserRole.USER,
    };
  });

  it('renderiza MainMenuView quando menu=1', () => {
    renderSideMenu('/?menu=1');
    expect(screen.getByText('main-menu-view')).toBeTruthy();
  });

  it('renderiza FavoritesList quando menu=favorites', () => {
    renderSideMenu('/?menu=favorites');
    expect(screen.getByText('favorites-view')).toBeTruthy();
  });

  it('renderiza MyBookingsView quando menu=bookings', () => {
    renderSideMenu('/?menu=bookings');
    expect(screen.getByText('my-bookings-view')).toBeTruthy();
  });

  it('renderiza UserTicketsHistoryView quando menu=tickets', () => {
    renderSideMenu('/?menu=tickets');
    expect(screen.getByText('user-tickets-view')).toBeTruthy();
  });

  it('renderiza AboutView quando menu=about', () => {
    renderSideMenu('/?menu=about');
    expect(screen.getByText('about-view')).toBeTruthy();
  });

  it('renderiza SupportView quando menu=support', () => {
    renderSideMenu('/?menu=support');
    expect(screen.getByText('support-view')).toBeTruthy();
  });

  it('redireciona para main se deslogado ao tentar acessar tela privada', () => {
    authContextState.user = null;
    renderSideMenu('/?menu=favorites');
    expect(screen.getByText('main-menu-view')).toBeTruthy();
  });
});
