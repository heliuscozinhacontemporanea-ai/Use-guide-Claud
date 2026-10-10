import { useCallback } from 'react';
import {
  getEmptyFormData,
  mapItemToFormData,
} from '../application/mappers/partnerFormMapper';
import type {
  PartnerContentCategory,
  PartnerContentEditorState,
  PartnerContentRecord,
} from '../types/partnerContent';
import type { FormState } from '../types/partsForm';

function isPartnerContentCategory(
  value: string
): value is PartnerContentCategory {
  switch (value) {
    case 'restaurant':
    case 'sight':
    case 'tour':
    case 'tips':
    case 'hotel':
    case 'event':
      return true;
    default:
      return false;
  }
}

function toPartnerContentCategory(
  value: string
): PartnerContentCategory {
  if (!isPartnerContentCategory(value)) {
    throw new Error(
      'Categoria de conteúdo Partner inválida.'
    );
  }

  return value;
}

export interface UsePartnerContentEditorProps {
  setIsEditing: (
    item: PartnerContentEditorState | null
  ) => void;
  setEditorFormData: (
    data: FormState | null
  ) => void;
  setCurrentStep: (step: number) => void;
  setIsSelectingCategory: (value: boolean) => void;
  partnerCpfCnpj?: string;
}

export function usePartnerContentEditor({
  setIsEditing,
  setEditorFormData,
  setCurrentStep,
  setIsSelectingCategory,
  partnerCpfCnpj,
}: UsePartnerContentEditorProps) {
  const handleInitNewItem = useCallback(
    (catId: string) => {
      const category =
        toPartnerContentCategory(catId);

      const emptyForm =
        getEmptyFormData(catId);

      setEditorFormData(emptyForm);
      setCurrentStep(1);

      setIsEditing({
        id: '',
        name: '',
        description: '',
        category,
        image: '',
        location: '',
      });

      setIsSelectingCategory(false);
    },
    [
      setEditorFormData,
      setCurrentStep,
      setIsEditing,
      setIsSelectingCategory,
    ]
  );

  const handleEditItem = useCallback(
    (item: PartnerContentRecord) => {
      const mapped = mapItemToFormData(
        item,
        partnerCpfCnpj
      );

      setEditorFormData(mapped);
      setCurrentStep(1);
      setIsEditing(item);
    },
    [
      setEditorFormData,
      setCurrentStep,
      setIsEditing,
      partnerCpfCnpj,
    ]
  );

  const handleCancelEdit = useCallback(() => {
    setIsEditing(null);
    setEditorFormData(null);
    setIsSelectingCategory(false);
  }, [
    setIsEditing,
    setEditorFormData,
    setIsSelectingCategory,
  ]);

  return {
    handleInitNewItem,
    handleEditItem,
    handleCancelEdit,
  };
}
