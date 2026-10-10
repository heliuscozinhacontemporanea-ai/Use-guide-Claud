import type { UserSession } from '../../auth';
import type { PartnerProfile } from '../types/partner';
import type { PartnerContentEditorState, PartnerContentRecord } from '../types/partnerContent';
import type { FormState } from '../types/partsForm';
import { usePartnerContentActions } from './usePartnerContentActions';
import { usePartnerContentCatalog } from './usePartnerContentCatalog';
import { usePartnerContentEditor } from './usePartnerContentEditor';
import { usePartnerContentMedia } from './usePartnerContentMedia';

export interface UsePartnerItemsProps {
  user: UserSession | null;
  activeTab: 'items' | 'events' | 'reports';
  setActiveTab?: (tab: 'items' | 'events' | 'reports') => void;
  isEditing: PartnerContentEditorState | null;
  setIsEditing: (item: PartnerContentEditorState | null) => void;
  editorFormData: FormState | null;
  setEditorFormData: (data: FormState | null) => void;
  isVerified?: boolean;
  partnerProfile?: PartnerProfile | null;
  setCurrentStep: (step: number) => void;
  setIsSelectingCategory: (val: boolean) => void;
  setShowDeleteConfirm: (val: boolean) => void;
  setIsLoading: (val: boolean) => void;
  setIsUploading: (val: boolean) => void;
  validateAll: (phoneValidateFn: () => boolean) => boolean;
}

export function usePartnerItems({
  user,
  activeTab,
  isEditing,
  setIsEditing,
  editorFormData,
  setEditorFormData,
  partnerProfile,
  setCurrentStep,
  setIsSelectingCategory,
  setShowDeleteConfirm,
  setIsLoading,
  setIsUploading,
  validateAll,
}: UsePartnerItemsProps) {
  const {
    itemsList,
    eventsList,
    itemsLoading,
    eventsLoading,
    dataLoading,
    currentList,
    error: catalogError,
  } = usePartnerContentCatalog({
    userId: user?.uid,
    activeTab,
  });

  const { handleInitNewItem, handleEditItem, handleCancelEdit } = usePartnerContentEditor({
    setIsEditing,
    setEditorFormData,
    setCurrentStep,
    setIsSelectingCategory,
    partnerCpfCnpj: partnerProfile?.cpfCnpj,
  });

  const { isUploading, handleImageUpload, handleRemoveImage, handleReorderImages } =
    usePartnerContentMedia({
      isEditing,
      setIsEditing,
      activeTab,
      setIsUploading,
    });

  const { handleDelete, handleToggleActive, handleSaveEvent, handleSaveItem } =
    usePartnerContentActions({
      user,
      partnerProfile,
      activeTab,
      isEditing,
      setIsEditing,
      editorFormData,
      setEditorFormData,
      setShowDeleteConfirm,
      setIsLoading,
      validateAll,
    });

  return {
    itemsList,
    eventsList,
    itemsLoading,
    eventsLoading,
    dataLoading,
    currentList,
    catalogError,
    isUploading,
    handleDelete,
    handleToggleActive,
    handleImageUpload,
    handleRemoveImage,
    handleReorderImages,
    handleSaveEvent,
    handleSaveItem,
    handleInitNewItem,
    handleEditItem,
    handleCancelEdit,
  };
}
