import { PartnerProfile } from '../types/partner';
import { usePartnerLayoutState } from './usePartnerLayoutState';
import { usePartnerProfile } from './usePartnerProfile';
import {
  getEmptyFormData,
  mapItemToFormData,
  isValidUrl,
} from '../application/mappers/partnerFormMapper';
import { usePartnerItems } from './usePartnerItems';

export { getEmptyFormData, mapItemToFormData, isValidUrl };

export function usePartnerPanelActions(profileData?: PartnerProfile) {
  const layout = usePartnerLayoutState();

  const profile = usePartnerProfile(profileData, (autoTab) => {
    layout.setActiveTab(autoTab);
  });

  const items = usePartnerItems({
    user: profile.user,
    activeTab: layout.activeTab,
    setActiveTab: layout.setActiveTab,
    isEditing: layout.isEditing,
    setIsEditing: layout.setIsEditing,
    editorFormData: profile.editorFormData,
    setEditorFormData: profile.setEditorFormData,
    isVerified: profile.isVerified,
    partnerProfile: profile.partnerProfile,
    setCurrentStep: layout.setCurrentStep,
    setIsSelectingCategory: layout.setIsSelectingCategory,
    setShowDeleteConfirm: layout.setShowDeleteConfirm,
    setIsLoading: profile.setIsLoading,
    setIsUploading: profile.setIsUploading,
    validateAll: profile.validateAll,
  });

  return {
    user: profile.user,
    userLoading: profile.userLoading,
    partnerProfile: profile.partnerProfile,
    profileStatus: profile.profileStatus,
    isVerified: profile.isVerified,
    isEventProducer: profile.isEventProducer,

    activeTab: layout.activeTab,
    setActiveTab: layout.setActiveTab,
    isEditing: layout.isEditing,
    setIsEditing: layout.setIsEditing,
    isSelectingCategory: layout.isSelectingCategory,
    showDeleteConfirm: layout.showDeleteConfirm,
    setShowDeleteConfirm: layout.setShowDeleteConfirm,
    currentStep: layout.currentStep,
    setCurrentStep: layout.setCurrentStep,

    isLoading: profile.isLoading,
    isUploading: profile.isUploading,
    editorFormData: profile.editorFormData,
    setEditorFormData: profile.setEditorFormData,
    errors: profile.errors,
    setErrors: profile.setErrors,

    dataLoading: items.dataLoading,
    currentList: items.currentList,
    itemsList: items.itemsList,
    eventsList: items.eventsList,

    handleDelete: items.handleDelete,
    handleToggleActive: items.handleToggleActive,
    handleImageUpload: items.handleImageUpload,
    handleSaveEvent: items.handleSaveEvent,
    handleSaveItem: items.handleSaveItem,
    handleInitNewItem: items.handleInitNewItem,
    handleEditItem: items.handleEditItem,
  };
}
