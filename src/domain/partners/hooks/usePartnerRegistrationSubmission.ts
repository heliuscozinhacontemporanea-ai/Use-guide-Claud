import { useCallback, useState } from 'react';
import type { Path, UseFormReturn } from 'react-hook-form';
import { registerWithEmailUseCase, type UserSession } from '../../auth';
import { mapPartnerSubmissionToGuideItem } from '../application/mappers/partnerSubmissionToGuide';
import { createOrUpdatePartnerProfileUseCase } from '../application/usecases/createOrUpdatePartnerProfileUseCase';
import { createPartnerContentItemUseCase } from '../application/usecases/createPartnerContentItemUseCase';
import { partnerSubmissionSchema } from '../schemas/partnerSchema';
import type { PartnerRegistrationPayload } from '../types/partner';
import type { FormState } from '../types/partsForm';

function isFirebaseAuthError(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === code
  );
}

export function mapPartnerRegistrationPayload(formData: FormState): PartnerRegistrationPayload {
  if (formData.termsAccepted !== true) {
    throw new Error('Você precisa aceitar os termos de parceria.');
  }

  const cpfCnpj = formData.cpfCnpj.trim();

  if (!cpfCnpj) {
    throw new Error('CPF/CNPJ é obrigatório.');
  }

  return {
    cpfCnpj,
    termsAccepted: true,
  };
}

export interface UsePartnerRegistrationSubmissionProps {
  methods: UseFormReturn<FormState>;
  currentUser: UserSession | null;
  uploadPartnerImages: (images: FormState['images']) => Promise<string[]>;
  setValidationErrors: (errors: { [key: string]: string }) => void;
  setCurrentStep?: (step: number) => void;
}

export function usePartnerRegistrationSubmission({
  methods,
  currentUser,
  uploadPartnerImages,
  setValidationErrors,
  setCurrentStep,
}: UsePartnerRegistrationSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitRegistration = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const values = methods.getValues();
    const parsed = partnerSubmissionSchema.safeParse(values);
    if (!parsed.success) {
      const formattedErrors: { [key: string]: string } = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0].toString()] = issue.message;
          methods.setError(issue.path[0].toString() as Path<FormState>, {
            message: issue.message,
          });
        }
      });
      setValidationErrors(formattedErrors);
      setIsSubmitting(false);
      const firstError =
        parsed.error.issues[0]?.message || 'Corrija os erros no formulário antes de enviar.';
      setSubmitError(firstError);
      throw new Error(firstError);
    }

    try {
      if (!currentUser) {
        if (!values.email || !values.password) {
          throw new Error('E-mail e senha são obrigatórios para cadastro.');
        }
        await registerWithEmailUseCase(values.email, values.password);
      }

      const registrationPayload = mapPartnerRegistrationPayload(values);
      await createOrUpdatePartnerProfileUseCase(registrationPayload);

      const imageUrls = await uploadPartnerImages(values.images);

      // O primeiro cadastro (estabelecimento ou perfil de produtor) nasce junto com o parceiro.
      await createPartnerContentItemUseCase(mapPartnerSubmissionToGuideItem(values, imageUrls));

      if (setCurrentStep) setCurrentStep(6);
      setIsSubmitting(false);
    } catch (error: unknown) {
      console.error('Registration error:', error);
      if (setCurrentStep) setCurrentStep(5);

      let errorMessage = 'Erro ao realizar cadastro. Tente novamente.';
      if (
        isFirebaseAuthError(error, 'auth/email-already-in-use') ||
        (error instanceof Error && error.message.includes('auth/email-already-in-use'))
      ) {
        errorMessage =
          'Este e-mail já está sendo utilizado por outro parceiro. Por favor, use um e-mail diferente ou faça login.';
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      setSubmitError(errorMessage);
      setIsSubmitting(false);
      throw error;
    }
  }, [methods, currentUser, uploadPartnerImages, setValidationErrors, setCurrentStep]);

  const resetSubmission = useCallback(() => {
    setSubmitError(null);
    setIsSubmitting(false);
  }, []);

  return {
    isSubmitting,
    submitError,
    submitRegistration,
    resetSubmission,
  };
}
