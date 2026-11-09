import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { type Path, type Resolver, type UseFormReturn, useForm } from 'react-hook-form';
import type { UserSession } from '../../auth';
import { INITIAL_FORM_DATA } from '../constants/formDefaults';
import {
  partnerSubmissionSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5SchemaContext,
} from '../schemas/partnerSchema';
import type { FormState } from '../types/partsForm';

function setFieldError(methods: UseFormReturn<FormState>, field: string, message: string): void {
  methods.setError(field as Path<FormState>, {
    type: 'manual',
    message,
  });
}

type StepParse =
  | { success: true }
  | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } };

export interface UsePartnerRegistrationValidationProps {
  currentUser: UserSession | null;
}

export function usePartnerRegistrationValidation({
  currentUser,
}: UsePartnerRegistrationValidationProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const methods = useForm<FormState>({
    resolver: zodResolver(partnerSubmissionSchema) as unknown as Resolver<FormState>,
    defaultValues: INITIAL_FORM_DATA,
    mode: 'onChange',
  });

  const formData = methods.watch();

  const setFormData = useCallback(
    (updater: React.SetStateAction<FormState>) => {
      const currentValues = methods.getValues();
      const newValues = typeof updater === 'function' ? updater(currentValues) : updater;
      methods.reset(newValues, { keepDefaultValues: true });
    },
    [methods]
  );

  // Mostra os erros do passo (chaves de tradução, §12.5) no estado local e no React Hook Form.
  const validate = useCallback(
    (schema: { safeParse: (values: FormState) => StepParse }) => {
      const parsed = schema.safeParse(methods.getValues());
      if (parsed.success) {
        setErrors({});
        return true;
      }
      const newErrors: { [key: string]: string } = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field && !newErrors[field]) {
          newErrors[field] = issue.message;
          setFieldError(methods, field, issue.message);
        }
      }
      setErrors(newErrors);
      return false;
    },
    [methods]
  );

  const isStep1Valid = useCallback(() => validate(step1Schema), [validate]);
  const validateStep2 = useCallback(() => validate(step2Schema), [validate]);
  const validateStep3 = useCallback(() => validate(step3Schema), [validate]);
  const validateStep4 = useCallback(() => validate(step4Schema), [validate]);
  const validateStep5 = useCallback(
    () => validate(step5SchemaContext({ currentUser })),
    [validate, currentUser]
  );

  const resetValidation = useCallback(() => {
    methods.reset(INITIAL_FORM_DATA);
    setErrors({});
  }, [methods]);

  return {
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
  };
}
