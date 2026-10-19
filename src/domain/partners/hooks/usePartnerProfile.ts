import { useState, useEffect, useRef } from 'react';
import { subscribeToPartnerProfileUseCase } from '../application/usecases/subscribeToPartnerProfileUseCase';
import { subscribeToAuthStateUseCase, type UserSession } from '../../auth';
import { getCurrentUserUseCase } from '../../user';
import { PartnerProfile } from '../types/partner';
import { FormState } from '../types/partsForm';
import { isValidCpfCnpj } from '../../../shared/utils/documentValidator';
import { useUI } from '../../../shared/stores/useUIStore';
import {
  getEmptyFormData,
  mapItemToFormData,
  isValidUrl,
} from '../application/mappers/partnerFormMapper';
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
} from '../schemas/partnerSchema';

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

  const { showToast } = useUI();
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(
    loadedProfile || null
  );

  const [editorFormData, setEditorFormData] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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


  const isStep1Valid = (): boolean => {
    if (!editorFormData?.category) return false;
    if (editorFormData.cpfCnpj) {
      return step1Schema.safeParse(editorFormData).success;
    }
    return Boolean(editorFormData.businessName?.trim() && editorFormData.description?.trim());
  };

  const validateStep2 = (phoneIsValid: boolean): boolean => {
    if (!editorFormData) return false;
    if (!phoneIsValid) {
      return false;
    }
    const parsed = step2Schema.safeParse(editorFormData);
    if (!parsed.success) {
      const newErrors: { [key: string]: string } = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]?.toString();
        if (field) {
          newErrors[field] = issue.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!editorFormData) return false;
    const parsed = step3Schema.safeParse(editorFormData);
    if (!parsed.success) {
      const newErrors: { [key: string]: string } = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]?.toString();
        if (field) {
          newErrors[field] = issue.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep4 = (): boolean => {
    if (!editorFormData) return false;
    const parsed = step4Schema.safeParse(editorFormData);
    if (!parsed.success) {
      const newErrors: { [key: string]: string } = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]?.toString();
        if (field) {
          newErrors[field] = issue.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const validateAll = (phoneValidateFn: () => boolean): boolean => {
    if (!editorFormData) return false;
    if (!isStep1Valid()) {
      showToast(
        'Por favor, preencha o Nome, Descrição e CPF/CNPJ na Identidade da Empresa.',
        'error'
      );
      return false;
    }
    const phoneIsValid = phoneValidateFn();
    if (!validateStep2(phoneIsValid)) {
      showToast(
        'Por favor, verifique se o telefone e os links informados em Contato e Localização estão corretos.',
        'error'
      );
      return false;
    }
    if (!validateStep3()) {
      showToast(
        'Por favor, preencha todas as informações obrigatórias de Comodidades e Detalhes específicas do seu segmento.',
        'error'
      );
      return false;
    }
    if (!validateStep4()) {
      showToast('Por favor, preencha as regras em Operação e Regras.', 'error');
      return false;
    }
    if (!editorFormData.images || editorFormData.images.length === 0) {
      showToast('Por favor, adicione pelo menos uma foto para o estabelecimento.', 'error');
      return false;
    }
    return true;
  };

  return {
    user,
    userLoading,
    partnerProfile,
    setPartnerProfile,
    profileStatus,
    editorFormData,
    setEditorFormData,
    errors,
    setErrors,
    isLoading,
    setIsLoading,
    isUploading,
    setIsUploading,
    profileError,
    isVerified,
    isStep1Valid,
    validateStep2,
    validateStep3,
    validateStep4,
    validateAll,
  };
}
