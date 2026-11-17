import type React from 'react';
import { useFormContext } from 'react-hook-form';
import type { FormState } from '../../../types/partsForm';

/** A inscrição guarda o formulário sempre preenchido; o editor do painel pode estar vazio (null). */
export type FormStateSetter =
  | React.Dispatch<React.SetStateAction<FormState>>
  | React.Dispatch<React.SetStateAction<FormState | null>>;

export interface DetailsSectionProps {
  formData: FormState;
  setFormData: FormStateSetter;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

/** Leitura e escrita dos campos de detalhe, iguais na inscrição e no editor do painel. */
export function useDetailsForm({
  formData: propFormData,
  setFormData,
  errors,
  setErrors,
}: DetailsSectionProps) {
  const formContext = useFormContext<FormState>();
  const formData = formContext ? formContext.watch() : propFormData;
  const rhfErrors = formContext ? formContext.formState.errors : {};

  const getFieldError = (field: string): string | undefined =>
    errors[field] ||
    (rhfErrors as Record<string, { message?: unknown }>)[field]?.message?.toString();

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const updateFieldValue = (field: string, value: unknown) => {
    if (formContext) {
      formContext.setValue(field as keyof FormState, value as never, { shouldValidate: true });
    }
    (setFormData as React.Dispatch<React.SetStateAction<FormState | null>>)((prev) =>
      prev ? { ...prev, [field]: value } : prev
    );
    clearError(field);
  };

  const toggleInList = (field: keyof FormState, value: string) => {
    const current = (formData[field] as string[] | undefined) ?? [];
    updateFieldValue(
      field,
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  return { formData, getFieldError, updateFieldValue, toggleInList };
}
