import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../shared/stores/useUIStore';
import type { UserSession } from '../../auth';
import {
  type EventSessionsLoadState,
  eventDateRangeFromSessions,
  saveEventSessionsUseCase,
  validateEventSessions,
} from '../../events';
import { createPartnerContentEventUseCase } from '../application/usecases/createPartnerContentEventUseCase';
import { deletePartnerContentEventUseCase } from '../application/usecases/deletePartnerContentEventUseCase';
import { updatePartnerContentEventUseCase } from '../application/usecases/updatePartnerContentEventUseCase';
import { updatePartnerContentItemUseCase } from '../application/usecases/updatePartnerContentItemUseCase';
import { partnerEventFormSchema } from '../schemas/partnerEventFormSchema';
import type { PartnerContentEditorState, PartnerContentEventInput } from '../types/partnerContent';

// Códigos que o servidor devolve nestas rotas e que a pessoa consegue resolver (§10.2, §12.5).
const KNOWN_CODES: Record<string, string> = {
  EVENT_HAS_SALES: 'partnerCatalog.actions.hasSales',
  CONTACT_IN_TEXT: 'partnerGuide.page.contactInText',
};

function codeOf(error: unknown): string | undefined {
  return error instanceof Error ? KNOWN_CODES[error.message] : undefined;
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
  isEditing: PartnerContentEditorState | null;
  setShowDeleteConfirm: (val: boolean) => void;
  setIsLoading: (val: boolean) => void;
}

/**
 * Salvar e excluir o evento aberto no editor, e pausar um estabelecimento no guia. Salvar e excluir
 * devolvem se deu certo: quem chama fecha as páginas do editor, que descartam o rascunho ao sair.
 */
export function usePartnerContentActions({
  user,
  isEditing,
  setShowDeleteConfirm,
  setIsLoading,
}: UsePartnerContentActionsProps) {
  const { t } = useTranslation();
  const { showToast } = useUI();

  const handleDeleteEvent = useCallback(async (): Promise<boolean> => {
    if (!isEditing?.id) return false;
    setIsLoading(true);
    try {
      await deletePartnerContentEventUseCase(isEditing.id);
      setShowDeleteConfirm(false);
      showToast(t('partnerCatalog.actions.deleted'), 'success');
      return true;
    } catch (error: unknown) {
      setShowDeleteConfirm(false);
      showToast(t(codeOf(error) ?? 'partnerCatalog.actions.deleteFailed'), 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isEditing, setIsLoading, setShowDeleteConfirm, showToast, t]);

  // Só os estabelecimentos são pausados no guia ("Pausar no guia", na página dele).
  const handleToggleActive = useCallback(
    async (itemId: string, currentActiveState: boolean) => {
      try {
        await updatePartnerContentItemUseCase(itemId, { isActive: !currentActiveState });
        showToast(
          t(
            currentActiveState ? 'partnerCatalog.actions.paused' : 'partnerCatalog.actions.resumed'
          ),
          'success'
        );
      } catch {
        showToast(t('partnerCatalog.actions.toggleFailed'), 'error');
      }
    },
    [showToast, t]
  );

  const handleSaveEvent = useCallback(
    async ({ sessionsLoadState, savedSessionIds }: SaveEventSessionsContext): Promise<boolean> => {
      if (!isEditing || !user?.uid) return false;

      if (sessionsLoadState === 'loading' || sessionsLoadState === 'error') {
        showToast(t('partnerCatalog.actions.sessionsLoading'), 'error');
        return false;
      }
      const sessions = isEditing.sessions ?? [];
      // TODO: B69 — a validação das sessões (domínio events) ainda devolve a frase em português.
      const sessionsError = validateEventSessions(sessions);
      if (sessionsError) {
        showToast(sessionsError, 'error');
        return false;
      }
      const { date, endDate } = eventDateRangeFromSessions(sessions);

      if (!isEditing.id && !isEditing.establishmentId?.trim()) {
        showToast(t('partnerCatalog.actions.establishmentRequired'), 'error');
        return false;
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
        const issue = parsedEvent.error.issues[0];
        showToast(
          issue?.message.startsWith('partnerCatalog.')
            ? t(issue.message)
            : t('partnerCatalog.actions.required.generic'),
          'error'
        );
        return false;
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
        showToast(t('partnerCatalog.actions.saved'), 'success');
        return true;
      } catch (error: unknown) {
        showToast(t(codeOf(error) ?? 'partnerCatalog.actions.saveFailed'), 'error');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isEditing, user?.uid, setIsLoading, showToast, t]
  );

  return {
    handleDeleteEvent,
    handleToggleActive,
    handleSaveEvent,
  };
}
