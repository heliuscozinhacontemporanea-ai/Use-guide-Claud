import { useCallback } from 'react';
import { useUI } from '../../../shared/stores/useUIStore';
import type { UserSession } from '../../auth';
import { getImageUploadErrorMessage, uploadImageUseCase } from '../../media';
import {
  createPartnerContentEventUseCase,
  createPartnerContentItemUseCase,
  deletePartnerContentEventUseCase,
  deletePartnerContentItemUseCase,
  updatePartnerContentEventUseCase,
  updatePartnerContentItemUseCase,
} from '../index';
import { mapPartnerSubmissionToGuideItem } from '../application/mappers/partnerSubmissionToGuide';
import { partnerEventFormSchema } from '../schemas/partnerEventFormSchema';
import type { PartnerProfile } from '../types/partner';
import type {
  PartnerContentEditorState,
  PartnerContentEventInput,
  PartnerContentItemInput,
} from '../types/partnerContent';
import type { FormState, PartnerImage } from '../types/partsForm';

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function toPlainRecord(value: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value));
}

export interface UsePartnerContentActionsProps {
  user: UserSession | null;
  partnerProfile?: PartnerProfile | null;
  activeTab: 'items' | 'events' | 'reports';
  isEditing: PartnerContentEditorState | null;
  setIsEditing: (item: PartnerContentEditorState | null) => void;
  editorFormData: FormState | null;
  setEditorFormData: (data: FormState | null) => void;
  setShowDeleteConfirm: (val: boolean) => void;
  setIsLoading: (val: boolean) => void;
  validateAll: (phoneValidateFn: () => boolean) => boolean;
}

export function usePartnerContentActions({
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
}: UsePartnerContentActionsProps) {
  const { showToast } = useUI();

  const handleDelete = useCallback(async () => {
    if (!isEditing?.id) return;

    setIsLoading(true);
    const coll = activeTab === 'items' ? 'items' : 'events';
    try {
      if (coll === 'items') {
        await deletePartnerContentItemUseCase(isEditing.id);
      } else {
        await deletePartnerContentEventUseCase(isEditing.id);
      }

      setIsEditing(null);
      setShowDeleteConfirm(false);
      showToast('Item excluído com sucesso!', 'success');
    } catch (error: unknown) {
      console.error('Erro ao excluir:', error);
      showToast(getErrorMessage(error, 'Erro ao excluir item'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isEditing, activeTab, setIsLoading, setIsEditing, setShowDeleteConfirm, showToast]);

  const handleToggleActive = useCallback(
    async (itemId: string, currentActiveState: boolean) => {
      const coll = activeTab === 'items' ? 'items' : 'events';
      try {
        if (coll === 'items') {
          await updatePartnerContentItemUseCase(itemId, {
            isActive: !currentActiveState,
          });
        } else {
          await updatePartnerContentEventUseCase(itemId, {
            isActive: !currentActiveState,
          });
        }
        showToast(`Item ${!currentActiveState ? 'ativado' : 'desativado'} com sucesso!`, 'success');
      } catch (error: unknown) {
        console.error('Erro ao alternar status ativo:', error);
        showToast(getErrorMessage(error, 'Erro ao atualizar status'), 'error');
      }
    },
    [activeTab, showToast]
  );

  const handleSaveEvent = useCallback(async () => {
    if (!isEditing || !user?.uid) return;

    if (!isEditing.id && !isEditing.establishmentId?.trim()) {
      showToast('Selecione o estabelecimento ou o perfil de produtor do evento.', 'error');
      return;
    }

    const parsedEvent = partnerEventFormSchema.safeParse({
      name: isEditing.name || '',
      description: isEditing.description || '',
      eventCategory: isEditing.eventCategory || '',
      customCategory: isEditing.customCategory,
      establishmentId: isEditing.establishmentId,
      date: isEditing.date || '',
      endDate: isEditing.endDate || '',
      location: isEditing.location || '',
      googleMapsLink: isEditing.googleMapsLink || '',
      images: isEditing.images ?? [],
      image: isEditing.image,
      entryType: isEditing.entryType || 'gratuito',
      phone: isEditing.phone,
      websiteLink: isEditing.websiteLink,
      instagramLink: isEditing.instagramLink,
      address: isEditing.address,
    });

    if (!parsedEvent.success) {
      const firstIssue = parsedEvent.error.issues[0];
      showToast(firstIssue?.message || 'Preencha os campos obrigatórios.', 'error');
      return;
    }

    setIsLoading(true);
    const eventId = isEditing.id;
    try {
      const data: PartnerContentEventInput = {
        name: isEditing.name || '',
        description: isEditing.description || '',
        image: isEditing.image || '',
        images: isEditing.images ?? [],
        location: isEditing.location || '',
        date: isEditing.date || '',
        endDate: isEditing.endDate || '',
        eventCategory: isEditing.eventCategory || 'geral',
        customCategory: isEditing.customCategory,
        entryType: parsedEvent.data.entryType,
        establishmentId: isEditing.establishmentId,
        instagramLink: isEditing.instagramLink,
        websiteLink: isEditing.websiteLink,
        bookingLink: isEditing.bookingLink,
        phone: isEditing.phone,
        googleMapsLink: isEditing.googleMapsLink,
        address: isEditing.address,
        tags: isEditing.tags,
        operationalInfo: isEditing.operationalInfo
          ? toPlainRecord(isEditing.operationalInfo)
          : undefined,
      };

      if (!eventId) {
        await createPartnerContentEventUseCase(data);
      } else {
        const { establishmentId: _ignored, ...updateData } = data;
        await updatePartnerContentEventUseCase(eventId, updateData);
      }
      setIsEditing(null);
      showToast('Evento salvo com sucesso!', 'success');
    } catch (error: unknown) {
      console.error('Erro ao salvar evento:', error);
      showToast(getErrorMessage(error, 'Erro ao salvar evento'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isEditing, user?.uid, setIsLoading, setIsEditing, showToast]);

  const handleSaveItem = useCallback(
    async (phoneValidateFn: () => boolean) => {
      if (!editorFormData || !user?.uid || !isEditing) return;
      if (!validateAll(phoneValidateFn)) return;

      if (!editorFormData.region?.trim()) {
        showToast('A região é obrigatória.', 'error');
        return;
      }

      setIsLoading(true);
      const itemId = isEditing.id;
      try {
        const imageUrls = await Promise.all(
          editorFormData.images.map(async (img: PartnerImage) => {
            if (img.file) {
              return await uploadImageUseCase(img.file, 'guia_local').catch((error: unknown) => {
                throw new Error(getImageUploadErrorMessage(error));
              });
            }
            return img.preview;
          })
        );

        const validUrls = imageUrls.filter((url): url is string => Boolean(url));
        if (validUrls.length === 0) {
          showToast('Ao menos uma imagem é obrigatória.', 'error');
          setIsLoading(false);
          return;
        }

        // Mesma conversão da inscrição: o editor mostra e grava exatamente os campos do formulário.
        const itemData: PartnerContentItemInput = mapPartnerSubmissionToGuideItem(
          editorFormData,
          validUrls
        );

        if (!itemId) {
          await createPartnerContentItemUseCase(itemData);
        } else {
          await updatePartnerContentItemUseCase(itemId, itemData);
        }

        setIsEditing(null);
        setEditorFormData(null);
        showToast('Estabelecimento salvo com sucesso!', 'success');
      } catch (e: unknown) {
        console.error('Erro ao salvar item:', e);
        showToast(getErrorMessage(e, 'Erro ao salvar item'), 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [
      editorFormData,
      user?.uid,
      isEditing,
      validateAll,
      setIsLoading,
      setIsEditing,
      setEditorFormData,
      showToast,
    ]
  );

  return {
    handleDelete,
    handleToggleActive,
    handleSaveEvent,
    handleSaveItem,
  };
}
