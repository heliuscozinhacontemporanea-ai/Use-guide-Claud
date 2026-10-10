import { useCallback, useState } from 'react';
import { getImageUploadErrorMessage, uploadImageUseCase } from '../../media';
import type { PartnerImage } from '../types/partsForm';

export function usePartnerRegistrationMedia() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadPartnerImages = useCallback(async (images: PartnerImage[]): Promise<string[]> => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const uploadedUrls = await Promise.all(
        images.map((img) => {
          if (img.file) {
            return uploadImageUseCase(img.file, 'partners');
          }
          if (img.preview) {
            return Promise.resolve(img.preview);
          }
          throw new Error('Imagem inválida para upload');
        })
      );
      setIsUploading(false);
      return uploadedUrls;
    } catch (err: unknown) {
      setIsUploading(false);
      setUploadError(getImageUploadErrorMessage(err));
      throw err;
    }
  }, []);

  return {
    isUploading,
    uploadError,
    uploadPartnerImages,
  };
}
