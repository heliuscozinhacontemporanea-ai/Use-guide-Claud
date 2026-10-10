import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { useForm, type Path, type Resolver, type UseFormReturn } from 'react-hook-form';
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

function setFieldError(
  methods: UseFormReturn<FormState>,
  field: string,
  message: string
): void {
  methods.setError(field as Path<FormState>, {
    type: 'manual',
    message,
  });
}

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

  const isStep1Valid = useCallback(() => {
    const currentValues = methods.getValues();
    const parsed = step1Schema.safeParse(currentValues);
    if (!parsed.success) {
      const newErrors: { [key: string]: string } = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]?.toString();
        if (field) {
          newErrors[field] = issue.message;
          setFieldError(methods, field, issue.message);
        }
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [methods]);

  const validateStep2 = useCallback(() => {
    const currentValues = methods.getValues();
    const parsed = step2Schema.safeParse(currentValues);
    if (!parsed.success) {
      const newErrors: { [key: string]: string } = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]?.toString();
        if (field) {
          newErrors[field] = issue.message;
          setFieldError(methods, field, issue.message);
        }
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [methods]);

  const validateStep3 = useCallback(() => {
    const currentValues = methods.getValues();
    const parsed = step3Schema.safeParse(currentValues);
    if (!parsed.success) {
      const newErrors: { [key: string]: string } = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]?.toString();
        if (field) {
          newErrors[field] = issue.message;
          setFieldError(methods, field, issue.message);
        }
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [methods]);

  const validateStep4 = useCallback(() => {
    const currentValues = methods.getValues();
    const parsed = step4Schema.safeParse(currentValues);
    if (!parsed.success) {
      const newErrors: { [key: string]: string } = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]?.toString();
        if (field) {
          newErrors[field] = issue.message;
          setFieldError(methods, field, issue.message);
        }
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [methods]);

  const validateStep5 = useCallback(() => {
    const currentValues = methods.getValues();
    const schema = step5SchemaContext({ currentUser });
    const parsed = schema.safeParse(currentValues);
    if (!parsed.success) {
      const newErrors: { [key: string]: string } = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]?.toString();
        if (field) {
          newErrors[field] = issue.message;
          setFieldError(methods, field, issue.message);
        }
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [methods, currentUser]);

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
