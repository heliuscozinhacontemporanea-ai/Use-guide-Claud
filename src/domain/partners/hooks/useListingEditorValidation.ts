import { useCallback, useState } from 'react';
import { step1Schema, step2Schema, step3Schema, step4Schema } from '../schemas/partnerSchema';
import type { FormState } from '../types/partsForm';

export type ListingEditorErrors = { [key: string]: string };

const SECTIONS = [step1Schema, step2Schema, step3Schema, step4Schema] as const;

/**
 * Validação do editor de cadastro: as mesmas regras da inscrição, todas de uma vez, para o
 * editor mostrar cada erro no seu campo. As mensagens são chaves de tradução (§12.5).
 */
export function useListingEditorValidation(formData: FormState) {
  const [errors, setErrors] = useState<ListingEditorErrors>({});

  const validateAll = useCallback(
    (phoneIsValid: boolean): ListingEditorErrors | null => {
      const found: ListingEditorErrors = {};
      for (const schema of SECTIONS) {
        const parsed = schema.safeParse(formData);
        if (parsed.success) continue;
        for (const issue of parsed.error.issues) {
          const field = issue.path[0]?.toString();
          if (field && !found[field]) found[field] = issue.message;
        }
      }
      if (formData.category !== 'producer' && formData.images.length === 0) {
        found.images = 'partnerSignup.errors.photosRequired';
      }
      // Formato inválido: o próprio campo de telefone mostra a mensagem.
      if (!phoneIsValid && !found.phone) found.phone = '';
      setErrors(found);
      return Object.keys(found).length > 0 || !phoneIsValid ? found : null;
    },
    [formData]
  );

  return { errors, setErrors, validateAll };
}
