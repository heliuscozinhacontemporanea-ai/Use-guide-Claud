import { PartnerProfile } from '../types/partner';
import { usePartnerLayoutState } from './usePartnerLayoutState';
import { usePartnerProfile } from './usePartnerProfile';
import { usePartnerItems } from './usePartnerItems';

export function usePartnerPanelActions(profileData?: PartnerProfile) {
  const layout = usePartnerLayoutState();

  const profile = usePartnerProfile(profileData);

  const items = usePartnerItems({
    user: profile.user,
    activeTab: layout.activeTab,
    setActiveTab: layout.setActiveTab,
    isEditing: layout.isEditing,
    setIsEditing: layout.setIsEditing,
    isVerified: profile.isVerified,
    partnerProfile: profile.partnerProfile,
    setShowDeleteConfirm: layout.setShowDeleteConfirm,
    setIsLoading: profile.setIsLoading,
    setIsUploading: profile.setIsUploading,
  });

  return {
    user: profile.user,
    userLoading: profile.userLoading,
    partnerProfile: profile.partnerProfile,
    profileStatus: profile.profileStatus,
    isVerified: profile.isVerified,

    activeTab: layout.activeTab,
    setActiveTab: layout.setActiveTab,
    isEditing: layout.isEditing,
    setIsEditing: layout.setIsEditing,
    showDeleteConfirm: layout.showDeleteConfirm,
    setShowDeleteConfirm: layout.setShowDeleteConfirm,

    isLoading: profile.isLoading,
    isUploading: profile.isUploading,

    dataLoading: items.dataLoading,
    currentList: items.currentList,
    itemsList: items.itemsList,
    eventsList: items.eventsList,

    handleDelete: items.handleDelete,
    handleToggleActive: items.handleToggleActive,
    handleImageUpload: items.handleImageUpload,
    handleSaveEvent: items.handleSaveEvent,
  };
}
