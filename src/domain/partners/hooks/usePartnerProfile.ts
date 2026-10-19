import { useState, useEffect } from 'react';
import { subscribeToPartnerProfileUseCase } from '../application/usecases/subscribeToPartnerProfileUseCase';
import { subscribeToAuthStateUseCase, type UserSession } from '../../auth';
import { getCurrentUserUseCase } from '../../user';
import { PartnerProfile } from '../types/partner';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null | undefined;
    email?: string | null | undefined;
    emailVerified?: boolean | null | undefined;
    isAnonymous?: boolean | null | undefined;
  };
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  currentUser?: Pick<UserSession, 'uid'> | null
): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
    },
    operationType,
    path,
  };

  console.error('Firestore Error [Domain Profile]:', JSON.stringify(errInfo));
}

export function usePartnerProfile(loadedProfile?: PartnerProfile) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthStateUseCase((session) => {
      setUser(session);
      setUserLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [userProfileData, setUserProfileData] =
    useState<Awaited<ReturnType<typeof getCurrentUserUseCase>>>(null);

  useEffect(() => {
    if (userLoading || !user) {
      setUserProfileData(null);
      return;
    }

    let active = true;

    getCurrentUserUseCase()
      .then((profile) => {
        if (active) {
          setUserProfileData(profile);
        }
      })
      .catch((error) => {
        if (active) {
          console.error('[usePartnerProfile] Erro ao carregar perfil do usuário:', error);
        }
      });

    return () => {
      active = false;
    };
  }, [user?.uid, userLoading]);

  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(
    loadedProfile || null
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState<'loading' | 'ready' | 'empty'>('loading');

  useEffect(() => {
    if (userLoading || !user) {
      return;
    }

    const targetPartnerId = user.uid;
    setProfileStatus('loading');
    setProfileError(null);

    const path = `publicPartners/${targetPartnerId}`;

    const unsubscribe = subscribeToPartnerProfileUseCase(
      targetPartnerId,
      (publicPartner) => {
        if (!publicPartner) {
          if (loadedProfile) {
            setPartnerProfile(loadedProfile);
            setProfileStatus('ready');
            return;
          }

          setPartnerProfile(null);
          setProfileStatus('empty');
          return;
        }

        const businesses = publicPartner.businesses ?? loadedProfile?.businesses ?? [];
        const firstBusiness = businesses[0];

        const partnerProfileData: PartnerProfile = {
          ...(loadedProfile ?? {}),
          id: targetPartnerId,
          businessId: firstBusiness?.businessId ?? loadedProfile?.businessId ?? null,
          businessName: firstBusiness?.businessName ?? loadedProfile?.businessName ?? '',
          businesses,
          cpfCnpj: loadedProfile?.cpfCnpj,
          firstName: userProfileData?.firstName ?? loadedProfile?.firstName ?? '',
          lastName: userProfileData?.lastName ?? loadedProfile?.lastName ?? '',
          email: userProfileData?.email ?? loadedProfile?.email ?? '',
          phone: userProfileData?.phone ?? loadedProfile?.phone,
          phoneDdi: loadedProfile?.phoneDdi,
          instagram: loadedProfile?.instagram,
          website: loadedProfile?.website,
          bookingLinks: loadedProfile?.bookingLinks,
          googleMaps: loadedProfile?.googleMaps,
          address: loadedProfile?.address,
          region: loadedProfile?.region,
          images: loadedProfile?.images,
          isVerified: publicPartner.isVerified,
          verifiedUntil: publicPartner.verifiedUntil,
          verificationType: loadedProfile?.verificationType ?? null,
          isVerificationSuspended: publicPartner.isVerificationSuspended,
          hasUsedTrial: loadedProfile?.hasUsedTrial ?? false,
          status: publicPartner.status,
        };

        setPartnerProfile(partnerProfileData);
        setProfileStatus('ready');
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path, user);
        setProfileError('Não foi possível carregar os dados do parceiro agora.');

        if (loadedProfile) {
          setPartnerProfile(loadedProfile);
          setProfileStatus('ready');
          return;
        }

        setPartnerProfile(null);
        setProfileStatus('empty');
      }
    );

    return () => unsubscribe();
  }, [user, userLoading, loadedProfile, userProfileData]);

  const isVerified = !!(
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
    isLoading,
    setIsLoading,
    isUploading,
    setIsUploading,
    profileError,
    isVerified,
  };
}
