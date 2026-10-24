import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { subscribeToAuthStateUseCase, UserRole, type UserSession } from '../../auth';
import { getCurrentUserUseCase } from '../../user';
import { subscribeToPartnerProfileUseCase } from '../application/usecases/subscribeToPartnerProfileUseCase';
import type { PartnerProfile, PublicPartnerProfile } from '../types/partner';
import { usePartnerProfile } from './usePartnerProfile';

vi.mock('../../auth', () => ({
  subscribeToAuthStateUseCase: vi.fn(),
  UserRole: {
    ADMIN: 'admin',
    PARTNER: 'partner',
    USER: 'user',
  },
}));

vi.mock('../../user', () => ({
  getCurrentUserUseCase: vi.fn(),
}));

vi.mock('../application/usecases/subscribeToPartnerProfileUseCase', () => ({
  subscribeToPartnerProfileUseCase: vi.fn(),
}));

vi.mock('../../../shared/stores/useUIStore', () => ({
  useUI: () => ({
    showToast: vi.fn(),
  }),
}));

describe('usePartnerProfile', () => {
  let authCallback: ((session: UserSession | null) => void) | null = null;
  let partnerProfileCallback: ((profile: PublicPartnerProfile | null) => void) | null = null;
  let partnerProfileErrorCallback: ((error: Error) => void) | null | undefined = null;

  const mockPartnerUser: UserSession = {
    uid: 'partner-user-1',
    email: 'partner@example.com',
    role: UserRole.PARTNER,
    emailVerified: true,
    displayName: 'Partner User',
    photoURL: null,
    isAnonymous: false,
  };

  const mockLoadedProfile: PartnerProfile = {
    id: 'partner-user-1',
    businessName: 'Pousada Sol',
    businessId: 'bus-1',
    businesses: [{ businessId: 'bus-1', businessName: 'Pousada Sol', type: 'item' }],
    verificationType: 'annual',
    isVerified: true,
    verifiedUntil: '2026-12-31T23:59:59.000Z',
    isVerificationSuspended: false,
    hasUsedTrial: true,
    status: 'active',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authCallback = null;
    partnerProfileCallback = null;
    partnerProfileErrorCallback = null;

    vi.mocked(subscribeToAuthStateUseCase).mockImplementation((cb) => {
      authCallback = cb;
      return vi.fn();
    });

    vi.mocked(subscribeToPartnerProfileUseCase).mockImplementation(
      (_partnerId, onNext, onError) => {
        partnerProfileCallback = onNext;
        partnerProfileErrorCallback = onError;
        return vi.fn();
      }
    );

    vi.mocked(getCurrentUserUseCase).mockResolvedValue(null);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('escuta auth state via subscribeToAuthStateUseCase e para Partner comum realiza subscription publicPartners/{partnerId}', async () => {
    const { result } = renderHook(() => usePartnerProfile(mockLoadedProfile));

    expect(subscribeToAuthStateUseCase).toHaveBeenCalledTimes(1);

    await act(async () => {
      authCallback?.(mockPartnerUser);
    });

    expect(subscribeToPartnerProfileUseCase).toHaveBeenCalledWith(
      'partner-user-1',
      expect.any(Function),
      expect.any(Function)
    );

    const mockPublicPartner: PublicPartnerProfile = {
      id: 'partner-user-1',
      businesses: [{ businessId: 'bus-1', businessName: 'Pousada Sol Atualizada', type: 'item' }],
      isVerified: true,
      verifiedUntil: '2026-12-31T23:59:59.000Z',
      isVerificationSuspended: false,
      status: 'active',
    };

    await act(async () => {
      partnerProfileCallback?.(mockPublicPartner);
    });

    expect(result.current.partnerProfile?.businessName).toBe('Pousada Sol Atualizada');
    expect(result.current.profileStatus).toBe('ready');
  });

  it('publicPartner NÃO contém cpfCnpj e verificationType, confirmando que esses dados continuam vindos do perfil carregado', async () => {
    const { result } = renderHook(() => usePartnerProfile(mockLoadedProfile));

    await act(async () => {
      authCallback?.(mockPartnerUser);
    });

    const mockPublicPartner: PublicPartnerProfile = {
      id: 'partner-user-1',
      businesses: [{ businessId: 'bus-1', businessName: 'Pousada Sol', type: 'item' }],
      isVerified: true,
      verifiedUntil: '2027-01-01T00:00:00.000Z',
      isVerificationSuspended: false,
      status: 'active',
    };

    expect(mockPublicPartner).not.toHaveProperty('verificationType');

    await act(async () => {
      partnerProfileCallback?.(mockPublicPartner);
    });

    expect(result.current.partnerProfile?.verificationType).toBe('annual');
    expect(result.current.partnerProfile?.verifiedUntil).toBe('2027-01-01T00:00:00.000Z');
  });

  it('Firestore subscription error -> define profileError, faz fallback para o perfil carregado e não lança exceção incontrolável', async () => {
    const { result } = renderHook(() => usePartnerProfile(mockLoadedProfile));

    await act(async () => {
      authCallback?.(mockPartnerUser);
    });

    const firestoreError = new Error('PERMISSION_DENIED');

    expect(() => {
      act(() => {
        partnerProfileErrorCallback?.(firestoreError);
      });
    }).not.toThrow();

    expect(result.current.profileError).toBe(
      'Não foi possível carregar os dados do parceiro agora.'
    );
    expect(result.current.partnerProfile).toEqual(mockLoadedProfile);
    expect(result.current.profileStatus).toBe('ready');
  });
});
