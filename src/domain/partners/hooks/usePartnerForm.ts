import { useCallback, useEffect, useState } from 'react';
import { subscribeToAuthStateUseCase, type UserSession } from '../../auth';
import { usePartnerRegistrationMedia } from './usePartnerRegistrationMedia';
import {
  mapPartnerRegistrationPayload,
  usePartnerRegistrationSubmission,
} from './usePartnerRegistrationSubmission';
import { usePartnerRegistrationValidation } from './usePartnerRegistrationValidation';

export { mapPartnerRegistrationPayload };

export function usePartnerForm(_categories: string[], setCurrentStep?: (step: number) => void) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthStateUseCase((session) => {
      setCurrentUser(session);
    });
    return () => unsubscribe();
  }, []);

  const {
    methods,
    formData,
    setFormData,
    errors,
    setErrors,
    isStep1Valid,
    validateStep2,
    validateStep3,
    validateStep4,
    validateStep5,
    resetValidation,
  } = usePartnerRegistrationValidation({ currentUser });

  const { isUploading, uploadError, uploadPartnerImages } = usePartnerRegistrationMedia();

  const { isSubmitting, submitError, submitRegistration, resetSubmission } =
    usePartnerRegistrationSubmission({
      methods,
      currentUser,
      uploadPartnerImages,
      setValidationErrors: setErrors,
      setCurrentStep,
    });

  const resetForm = useCallback(() => {
    resetValidation();
    resetSubmission();
  }, [resetValidation, resetSubmission]);

  return {
    methods,
    formData,
    setFormData,
    errors,
    setErrors,
    isSubmitting,
    isUploading,
    uploadError,
    submitError,
    currentUser,
    showPassword,
    setShowPassword,
    isStep1Valid,
    validateStep2,
    validateStep3,
    validateStep4,
    validateStep5,
    handleSubmit: submitRegistration,
    resetForm,
  };
}
