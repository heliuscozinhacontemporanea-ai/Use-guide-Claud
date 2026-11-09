import type React from 'react';
import { useFormContext } from 'react-hook-form';
import { SignupAccount } from './review/SignupAccount';
import { type SignupImage, SignupPhotos } from './review/SignupPhotos';
import { SignupReview } from './review/SignupReview';
import { SignupTerms } from './review/SignupTerms';

interface Step5MediaProps {
  // biome-ignore lint/suspicious/noExplicitAny: o formulário do cadastro ainda não é tipado de ponta a ponta (débito do cadastro antigo).
  formData: any;
  // biome-ignore lint/suspicious/noExplicitAny: idem.
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors?: { [key: string]: string };
  setErrors?: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  currentUser: unknown;
  categories: { id: string; label: string }[];
  setCurrentStep: (step: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  /** No editor de cadastro (já logado e com termos aceitos): só as fotos. */
  hideReview?: boolean;
}

/** Último passo do cadastro (V2): revisão, fotos, conta (sem login) e termos. */
export function Step5Media({
  formData: propFormData,
  setFormData,
  errors: propErrors = {},
  currentUser,
  setCurrentStep,
  fileInputRef,
  hideReview = false,
}: Step5MediaProps) {
  const formContext = useFormContext();
  const formData = formContext ? formContext.watch() : propFormData;
  const rhfErrors = formContext ? formContext.formState.errors : {};
  const errorOf = (field: string): string | undefined =>
    propErrors[field] || rhfErrors[field]?.message?.toString();
  const update = (field: string, value: unknown) => {
    if (formContext) formContext.setValue(field, value, { shouldValidate: true });
    setFormData((prev: Record<string, unknown>) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {!hideReview && <SignupReview formData={formData} onEdit={setCurrentStep} />}
      {formData.category !== 'producer' && (
        <SignupPhotos
          images={(formData.images ?? []) as SignupImage[]}
          onChange={(images) => update('images', images)}
          fileInputRef={fileInputRef}
          error={errorOf('images')}
        />
      )}
      {!hideReview && !currentUser && (
        <SignupAccount
          values={formData}
          onChange={(field, value) => update(field, value)}
          errorOf={errorOf}
        />
      )}
      {!hideReview && (
        <SignupTerms
          accepted={formData.termsAccepted === true}
          onChange={(accepted) => update('termsAccepted', accepted)}
          error={errorOf('termsAccepted')}
        />
      )}
    </div>
  );
}
