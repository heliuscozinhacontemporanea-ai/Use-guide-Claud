import { useState, useRef, useCallback, ChangeEvent } from 'react';
import type { Area, Point } from 'react-easy-crop';
import { useAuthContext } from '../../auth/context/AuthContext';
import { uploadProfilePhotoUseCase } from '../../media';
import { getCroppedImg } from '../../../shared/utils/formatters';

export function useUserPhoto(
  /** `text` é a chave de tradução do aviso. */
  onMessage?: (msg: { type: 'success' | 'error'; text: string }) => void
) {
  const { user, photoURL, setPhotoURL } = useAuthContext();
  const [isUploading, setIsUploading] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropChange = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoomValue: number) => {
    setZoom(zoomValue);
  }, []);

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handlePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setIsCropping(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmCrop = async () => {
    if (!imageToCrop || !croppedAreaPixels || !user) return;

    setIsUploading(true);
    setIsCropping(false);

    try {
      const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const newPhotoURL = await uploadProfilePhotoUseCase(user.uid, croppedImageBlob);
      setPhotoURL(newPhotoURL);

      if (onMessage) {
        onMessage({ type: 'success', text: 'account.feedback.photoSaved' });
      }
      setImageToCrop(null);
    } catch (error: unknown) {
      console.error('[useUserPhoto] Error uploading photo:', error);
      if (onMessage) {
        onMessage({ type: 'error', text: 'account.feedback.photoError' });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const cancelCropping = () => {
    setIsCropping(false);
    setImageToCrop(null);
  };

  return {
    photoURL,
    isUploading,
    imageToCrop,
    isCropping,
    setIsCropping,
    crop,
    setCrop,
    zoom,
    setZoom,
    croppedAreaPixels,
    fileInputRef,
    onCropChange,
    onZoomChange,
    onCropComplete,
    handlePhotoSelect,
    handleConfirmCrop,
    cancelCropping,
  };
}
