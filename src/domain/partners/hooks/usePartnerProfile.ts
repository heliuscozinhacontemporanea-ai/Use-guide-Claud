import { useState, useEffect } from 'react';
import { subscribeToPartnerProfileUseCase } from '../application/usecases/subscribeToPartnerProfileUseCase';
import { subscribeToAuthStateUseCase, UserRole, type UserSession } from '../../auth';
import { getCurrentUserUseCase } from '../../user';
import { PartnerProfile, PublicPartnerProfile } from '../types/partner';

export type PartnerProfileStatus = 'loading' | 'ready' | 'missing' | 'unauthenticated';

export function usePartnerProfile(loadedProfile?: PartnerProfile) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthStateUseCase(async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setUserLoading(false);
        return;
      }

      try {
        const userDoc = await getCurrentUserUseCase();
        const role =
          currentUser.role === UserRole.ADMIN
            ? UserRole.ADMIN
            : userDoc?.role === 'partner'
              ? UserRole.PARTNER
              : currentUser.role || UserRole.USER;
        setUser({ ...currentUser, role });
      } catch (err) {
        console.error('Erro ao buscar role:', err);
        setUser({ ...currentUser, role: currentUser.role || UserRole.USER });
      } finally {
        setUserLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(
    loadedProfile ?? null
  );
  const [profileStatus, setProfileStatus] = useState<PartnerProfileStatus>(
    loadedProfile ? 'ready' : 'loading'
  );
  const [profileError, setProfileError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const userId = user?.uid ?? null;
  const userRole = user?.role ?? null;

  useEffect(() => {
    if (userLoading) {
      return;
    }

    if (!userId) {
      setPartnerProfile(null);
      setProfileError(null);
      setProfileStatus('unauthenticated');
      return;
    }

    if (userRole === UserRole.ADMIN && !loadedProfile) {
      setProfileError(null);
      setPartnerProfile({
        id: userId,
        businessName: 'Admin',
        businessId: 'admin-virtual',
        businesses: [],
        isVerified: true,
        verifiedUntil: null,
        verificationType: 'admin',
        isVerificationSuspended: false,
        hasUsedTrial: false,
        status: 'active',
      });
      setProfileStatus('ready');
      return;
    }

    if (loadedProfile) {
      setPartnerProfile(loadedProfile);
      setProfileStatus('ready');
    } else {
      setProfileStatus('loading');
    }

    const unsub = subscribeToPartnerProfileUseCase(
      userId,
      (publicProfile: PublicPartnerProfile | null) => {
        setProfileError(null);
        if (publicProfile) {
          const primaryBusiness = publicProfile.businesses?.[0];
          setPartnerProfile((prev) => {
            const base = prev ?? loadedProfile;
            return {
              id: publicProfile.id,
              businessName: primaryBusiness?.businessName ?? base?.businessName ?? '',
              businessId: primaryBusiness?.businessId ?? base?.businessId ?? '',
              businesses: publicProfile.businesses,
              region: base?.region,
              verificationType: base?.verificationType ?? null,
              hasUsedTrial: base?.hasUsedTrial ?? false,
              isVerified: publicProfile.isVerified,
              verifiedUntil: publicProfile.verifiedUntil,
              isVerificationSuspended: publicProfile.isVerificationSuspended,
              status: publicProfile.status,
            };
          });
          setProfileStatus('ready');
        } else if (loadedProfile) {
          setPartnerProfile(loadedProfile);
          setProfileStatus('ready');
        } else {
          setPartnerProfile(null);
          setProfileStatus('missing');
        }
      },
      (error) => {
        console.error('Firestore Error (partnerProfile):', error);
        setProfileError('Não foi possível carregar os dados do parceiro agora.');
        if (loadedProfile) {
          setPartnerProfile(loadedProfile);
          setProfileStatus('ready');
        } else {
          setProfileStatus('missing');
        }
      }
    );

    return () => unsub();
  }, [userLoading, userId, userRole, loadedProfile]);

  const isVerified = Boolean(
    partnerProfile?.isVerified &&
      !partnerProfile?.isVerificationSuspended &&
      (!partnerProfile?.verifiedUntil || new Date(partnerProfile.verifiedUntil) > new Date())
  );

  return {
    user,
    userLoading,
    partnerProfile,
    setPartnerProfile,
    profileStatus,
    profileError,
    isLoading,
    setIsLoading,
    isUploading,
    setIsUploading,
    isVerified,
  };
}
