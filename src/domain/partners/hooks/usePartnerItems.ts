import type { UserSession } from '../../auth';
import type { PartnerContentEditorState } from '../types/partnerContent';
import { usePartnerContentActions } from './usePartnerContentActions';
import { usePartnerContentCatalog } from './usePartnerContentCatalog';
import { usePartnerContentMedia } from './usePartnerContentMedia';

export interface UsePartnerItemsProps {
  user: UserSession | null;
  activeTab: 'items' | 'events' | 'reports';
  isEditing: PartnerContentEditorState | null;
  setIsEditing: (item: PartnerContentEditorState | null) => void;
  setShowDeleteConfirm: (val: boolean) => void;
  setIsLoading: (val: boolean) => void;
  setIsUploading: (val: boolean) => void;
}

export function usePartnerItems({
  user,
  activeTab,
  isEditing,
  setIsEditing,
  setShowDeleteConfirm,
  setIsLoading,
  setIsUploading,
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

  const { isUploading, handleImageUpload, handleRemoveImage, handleReorderImages } =
    usePartnerContentMedia({
      isEditing,
      setIsEditing,
      activeTab,
      setIsUploading,
    });

  const { handleDelete, handleToggleActive, handleSaveEvent } = usePartnerContentActions({
    user,
    activeTab,
    isEditing,
    setIsEditing,
    setShowDeleteConfirm,
    setIsLoading,
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
  };
}
