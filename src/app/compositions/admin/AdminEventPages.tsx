import { useEffect, useMemo, useRef } from 'react';
import { Trans } from 'react-i18next';
import { useAuthContext } from '../../../domain/auth';
import { EventSessionsField } from '../../../domain/events';
import {
  type EventEditorSection,
  PartnerEventEditor,
  type PartnerContentEditorState,
  usePartnerContentActions,
  usePartnerContentMedia,
  usePartnerEventSessions,
} from '../../../domain/partners';
import { PartnerEventTicketingManager } from '../../../domain/ticketing';
import { isUseGuideOwner } from '../../../shared/constants/useGuideOwner';
import { INFO_NOTE_STRONG, InfoNote } from '../../../ui/components/InfoNote';
import { toListingRecord } from './adminListingRecord';
import {
  clearAdminEvent,
  mergeAdminEventDraft,
  setAdminEvent,
  useAdminEvent,
} from './adminEventStore';
import { useAdminGuideItems } from './adminGuideStore';
import { adminPages } from './adminStack';

/** Os anúncios do Use Guide, que podem receber evento do Use Guide (escolhas da F4). */
function useUseGuidePlaces() {
  const items = useAdminGuideItems();
  return useMemo(
    () => items.filter((item) => isUseGuideOwner(item.ownerId) && item.category !== 'tips'),
    [items]
  );
}

/**
 * O editor do evento aberto pelo admin: as linhas (página `event`) ou uma seção (`event-section`). As
 * duas usam o mesmo rascunho; "Salvar", na barra, grava o evento e fecha o editor, como no parceiro.
 */
function AdminEventEditor({
  section,
  registerSave,
}: {
  section: EventEditorSection | null;
  registerSave?: (save: (() => void) | null) => void;
}) {
  const { user } = useAuthContext();
  const event = useAdminEvent();
  const places = useUseGuidePlaces();
  const draft = event.draft;
  const useGuide = isUseGuideOwner(draft?.ownerId);
  const setDraft = (next: PartnerContentEditorState | null) => setAdminEvent({ draft: next });
  const actions = usePartnerContentActions({
    user,
    isEditing: draft,
    setShowDeleteConfirm: (deleteConfirm) => setAdminEvent({ deleteConfirm }),
    setIsLoading: () => undefined,
    useGuide,
  });
  const media = usePartnerContentMedia({
    isEditing: draft,
    setIsEditing: setDraft,
    activeTab: 'events',
    setIsUploading: (isUploading) => setAdminEvent({ isUploading }),
  });

  const save = async () => {
    const saved = await actions.handleSaveEvent({
      sessionsLoadState: event.sessionsLoadState,
      savedSessionIds: event.savedSessionIds,
    });
    if (saved) {
      clearAdminEvent();
      adminPages.clear();
    }
  };
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    if (!registerSave) return;
    registerSave(() => void saveRef.current());
    return () => registerSave(null);
  }, [registerSave]);

  if (!draft) return null;
  const establishmentName = places.find((place) => place.id === draft.establishmentId)?.name;
  return (
    <PartnerEventEditor
      item={draft}
      onChange={setDraft}
      section={section}
      onOpenSection={(next, title) =>
        adminPages.push({ view: 'event-section', section: next, title })
      }
      isUploading={event.isUploading}
      onImageUpload={(input) => void media.handleImageUpload(input)}
      businesses={
        useGuide
          ? places.map((place) => ({
              businessId: place.id,
              businessName: place.name,
              type: 'item',
            }))
          : draft.establishmentId && establishmentName
            ? [{ businessId: draft.establishmentId, businessName: establishmentName, type: 'item' }]
            : []
      }
      establishments={places.map(toListingRecord)}
      sessionsLoadState={draft.id ? event.sessionsLoadState : 'ready'}
      lockedSessionIds={event.lockedSessionIds}
      renderSessionsField={(props) => <EventSessionsField {...props} />}
      renderEventTicketingManager={(eventListingId) => (
        <PartnerEventTicketingManager
          eventListingId={eventListingId}
          asAdmin
          place={{ timeZone: draft.timeZone, city: draft.city }}
        />
      )}
      showDeleteConfirm={event.deleteConfirm}
      onRequestDelete={(deleteConfirm) => setAdminEvent({ deleteConfirm })}
      onConfirmDelete={async () => {
        if (await actions.handleDeleteEvent()) {
          clearAdminEvent();
          adminPages.clear();
        }
      }}
      useGuide={useGuide}
      header={
        <InfoNote>
          <Trans
            i18nKey={
              useGuide ? 'adminPanel.events.ownerUseGuide' : 'adminPanel.events.ownerPartner'
            }
            components={{ b: INFO_NOTE_STRONG }}
          />
        </InfoNote>
      }
    />
  );
}

/** Página das linhas do evento: lê as sessões salvas uma vez, para todas as seções. */
export function AdminEventPage({
  registerSave,
}: {
  registerSave: (save: (() => void) | null) => void;
}) {
  const event = useAdminEvent();
  const sessions = usePartnerEventSessions(event.draft?.id || undefined, mergeAdminEventDraft);
  useEffect(() => {
    setAdminEvent({
      sessionsLoadState: sessions.loadState,
      savedSessionIds: sessions.savedIds,
      lockedSessionIds: sessions.lockedIds,
    });
  }, [sessions.loadState, sessions.savedIds, sessions.lockedIds]);
  return <AdminEventEditor section={null} registerSave={registerSave} />;
}

export function AdminEventSectionPage({ section }: { section: EventEditorSection }) {
  return <AdminEventEditor section={section} />;
}
