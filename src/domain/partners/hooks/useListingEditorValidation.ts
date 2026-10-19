import { useCallback, useState } from 'react';
import { useUI } from '../../../shared/stores/useUIStore';
import { step1Schema, step2Schema, step3Schema, step4Schema } from '../schemas/partnerSchema';
import type { FormState } from '../types/partsForm';

export type ListingEditorErrors = { [key: string]: string };

type SectionSchema = typeof step2Schema | typeof step3Schema | typeof step4Schema;

function collectErrors(schema: SectionSchema, formData: FormState): ListingEditorErrors | null {
  const parsed = schema.safeParse(formData);
  if (parsed.success) return null;
  const errors: ListingEditorErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0]?.toString();
    if (field) errors[field] = issue.message;
  }
  return errors;
}

function isIdentityValid(formData: FormState): boolean {
  return step1Schema.safeParse(formData).success;
}

/** Validação do editor de cadastro: as mesmas regras da inscrição, seção por seção. */
export function useListingEditorValidation(formData: FormState) {
  const { showToast } = useUI();
  const [errors, setErrors] = useState<ListingEditorErrors>({});

  const validateSection = useCallback(
    (schema: SectionSchema): boolean => {
      const found = collectErrors(schema, formData);
      setErrors(found ?? {});
      return found === null;
    },
    [formData]
  );

  const validateAll = useCallback(
    (phoneIsValid: boolean): boolean => {
      if (!isIdentityValid(formData)) {
        showToast('Preencha o nome e a descrição do cadastro.', 'error');
        return false;
      }
      if (!phoneIsValid || !validateSection(step2Schema)) {
        showToast('Verifique o telefone e os links em Contato e Localização.', 'error');
        return false;
      }
      if (!validateSection(step3Schema)) {
        showToast('Preencha as informações obrigatórias da categoria.', 'error');
        return false;
      }
      if (!validateSection(step4Schema)) {
        showToast('Preencha as regras em Operação e Regras.', 'error');
        return false;
      }
      if (formData.category !== 'producer' && formData.images.length === 0) {
        showToast('Adicione pelo menos uma foto.', 'error');
        return false;
      }
      return true;
    },
    [formData, showToast, validateSection]
  );

  return { errors, setErrors, validateAll };
}
