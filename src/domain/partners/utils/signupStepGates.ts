import type { FormState } from '../types/partsForm';

/**
 * Campos mínimos para liberar o botão "Avançar" de cada etapa da inscrição.
 * A validação completa (com mensagens) continua nos schemas de cada etapa.
 */
export function isSignupStep1Incomplete(formData: FormState): boolean {
  if (!formData.category) return true;
  if (formData.category === 'producer') return false;
  return !formData.businessName || !formData.description;
}

export function isSignupStep2Incomplete(formData: FormState): boolean {
  if (!formData.phone) return true;
  if (formData.category === 'producer') return false;
  if (!formData.region || !formData.googleMaps) return true;
  return formData.category === 'hotel' && !formData.bookingLinks;
}

export function isSignupStep3Incomplete(formData: FormState): boolean {
  if (formData.category === 'hotel') {
    return (
      formData.servesBreakfast === null ||
      (formData.servesBreakfast && formData.breakfastIncluded === null) ||
      (formData.servesBreakfast && formData.breakfastIncluded === false && !formData.breakfastPrice)
    );
  }
  if (formData.category === 'restaurant') return !formData.subcategory;
  if (formData.category === 'sight') {
    return (
      !formData.sightAccessType || (formData.sightAccessType === 'pago' && !formData.sightPrice)
    );
  }
  return false;
}

export function isSignupStep4Incomplete(formData: FormState): boolean {
  if (formData.category !== 'hotel') return false;
  const petsNeedCost = formData.petsPolicy === 'Sim' || formData.petsPolicy === 'Mediante pedido';
  return (
    !formData.checkInFrom ||
    !formData.checkInTo ||
    !formData.checkOutFrom ||
    !formData.checkOutTo ||
    formData.childrenAllowed === null ||
    !formData.petsPolicy ||
    (petsNeedCost && !formData.petsExtraCost)
  );
}

function isPasswordWeak(password: string): boolean {
  return (
    password.length < 8 ||
    password.length > 20 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password)
  );
}

/** Quem já está logado não preenche nome, e-mail e senha. */
export function isSignupStep5Incomplete(formData: FormState, hasSession: boolean): boolean {
  if (!formData.termsAccepted) return true;
  if (formData.images.length === 0 && formData.category !== 'producer') return true;
  if (hasSession) return false;
  return (
    !formData.firstName ||
    !formData.email ||
    !formData.password ||
    isPasswordWeak(formData.password) ||
    formData.password !== formData.confirmPassword
  );
}
