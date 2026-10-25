import { useCallback } from 'react';
import { useUI } from '../../../shared/stores/useUIStore';
import type { UserSession } from '../../auth';
import {
  type EventSessionsLoadState,
  eventDateRangeFromSessions,
  saveEventSessionsUseCase,
  validateEventSessions,
} from '../../events';
import {
  createPartnerContentEventUseCase,
  deletePartnerContentEventUseCase,
  deletePartnerContentItemUseCase,
  updatePartnerContentEventUseCase,
  updatePartnerContentItemUseCase,
} from '../index';
import { partnerEventFormSchema } from '../schemas/partnerEventFormSchema';
import type { PartnerContentEditorState, PartnerContentEventInput } from '../types/partnerContent';

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function toPlainRecord(value: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value));
}

export interface SaveEventSessionsContext {
  sessionsLoadState: EventSessionsLoadState;
  /** Sessões que existiam quando o editor abriu. */
  savedSessionIds: string[];
}

export interface UsePartnerContentActionsProps {
  user: UserSession | null;
  activeTab: 'items' | 'events' | 'reports';
  isEditing: PartnerContentEditorState | null;
  setIsEditing: (item: PartnerContentEditorState | null) => void;
  setShowDeleteConfirm: (val: boolean) => void;
  setIsLoading: (val: boolean) => void;
}

export function usePartnerContentActions({
  user,
  activeTab,
  isEditing,
  setIsEditing,
  setShowDeleteConfirm,
  setIsLoading,
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

  const handleSaveEvent = useCallback(
    async ({ sessionsLoadState, savedSessionIds }: SaveEventSessionsContext) => {
      if (!isEditing || !user?.uid) return;

      if (sessionsLoadState === 'loading' || sessionsLoadState === 'error') {
        showToast('Aguarde o carregamento das sessões do evento antes de salvar.', 'error');
        return;
      }
      const sessions = isEditing.sessions ?? [];
      const sessionsError = validateEventSessions(sessions);
      if (sessionsError) {
        showToast(sessionsError, 'error');
        return;
      }
      const { date, endDate } = eventDateRangeFromSessions(sessions);

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
        date,
        endDate,
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
          date,
          endDate,
          eventCategory: isEditing.eventCategory || 'geral',
          customCategory: isEditing.customCategory,
          entryType: parsedEvent.data.entryType,
          ...(isEditing.salesPolicy ? { salesPolicy: isEditing.salesPolicy } : {}),
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
          await createPartnerContentEventUseCase({
            ...data,
            occurrences: sessions.map(({ startsAt, endsAt, capacity }) => ({
              startsAt,
              endsAt,
              capacity,
            })),
          });
        } else {
          const { establishmentId: _ignored, ...updateData } = data;
          await updatePartnerContentEventUseCase(eventId, updateData);
          await saveEventSessionsUseCase({
            eventListingId: eventId,
            scope: 'partner',
            savedIds: savedSessionIds,
            sessions,
          });
        }
        setIsEditing(null);
        showToast('Evento salvo com sucesso!', 'success');
      } catch (error: unknown) {
        console.error('Erro ao salvar evento:', error);
        showToast(getErrorMessage(error, 'Erro ao salvar evento'), 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [isEditing, user?.uid, setIsLoading, setIsEditing, showToast]
  );

  return {
    handleDelete,
    handleToggleActive,
    handleSaveEvent,
  };
}
