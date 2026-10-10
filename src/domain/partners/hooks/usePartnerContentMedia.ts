import { useCallback, useState } from 'react';
import { useUI } from '../../../shared/stores/useUIStore';
import { uploadImageUseCase } from '../../media';
import type { PartnerContentEditorState, PartnerContentRecord } from '../types/partnerContent';

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export interface UsePartnerContentMediaProps {
  isEditing: PartnerContentEditorState | null;
  setIsEditing: (item: PartnerContentEditorState | null) => void;
  activeTab: 'items' | 'events' | 'reports';
  setIsUploading?: (val: boolean) => void;
}

export function usePartnerContentMedia({
  isEditing,
  setIsEditing,
  activeTab,
  setIsUploading,
}: UsePartnerContentMediaProps) {
  const { showToast } = useUI();
  const [localUploading, setLocalUploading] = useState(false);

  const setUploadingState = useCallback(
    (uploading: boolean) => {
      setLocalUploading(uploading);
      if (setIsUploading) {
        setIsUploading(uploading);
      }
    },
    [setIsUploading]
  );

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0 || !isEditing) return;

      const currentImages = isEditing.images || [];
      if (currentImages.length >= 5) {
        showToast('Você já atingiu o limite de 5 fotos.', 'error');
        return;
      }

      const filesArray = Array.from(files);
      const filesToUpload = filesArray.slice(0, 5 - currentImages.length);

      setUploadingState(true);
      try {
        const folderName = activeTab === 'items' ? 'guia_local' : 'agenda_eventos';
        const uploadPromises = filesToUpload.map((file: File) =>
          uploadImageUseCase(file, folderName)
        );
        const uploadedUrls = await Promise.all(uploadPromises);

        const newImages = [...currentImages, ...uploadedUrls];
        setIsEditing({
          ...isEditing,
          images: newImages,
          image: isEditing.image || uploadedUrls[0] || '',
        });
      } catch (error: unknown) {
        showToast(`Erro no upload: ${getErrorMessage(error, 'Falha ao enviar imagem')}`, 'error');
      } finally {
        setUploadingState(false);
        e.target.value = '';
      }
    },
    [isEditing, setIsEditing, activeTab, setUploadingState, showToast]
  );

  const handleRemoveImage = useCallback(
    (indexToRemove: number) => {
      if (!isEditing || !isEditing.images) return;
      const updatedImages = isEditing.images.filter((_, idx) => idx !== indexToRemove);
      setIsEditing({
        ...isEditing,
        images: updatedImages,
        image: updatedImages[0] || '',
      });
    },
    [isEditing, setIsEditing]
  );

  const handleReorderImages = useCallback(
    (newImages: string[]) => {
      if (!isEditing) return;
      setIsEditing({
        ...isEditing,
        images: newImages,
        image: newImages[0] || '',
      });
    },
    [isEditing, setIsEditing]
  );

  return {
    isUploading: localUploading,
    handleImageUpload,
    handleRemoveImage,
    handleReorderImages,
  };
}
