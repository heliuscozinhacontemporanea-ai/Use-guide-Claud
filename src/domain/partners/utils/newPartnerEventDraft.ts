import { newEventSessionDraft } from '../../events';
import type { PartnerContentEditorState } from '../types/partnerContent';

/** Evento novo no editor, já com uma sessão em branco. */
export function newPartnerEventDraft(ownerId: string): PartnerContentEditorState {
  return {
    id: '',
    name: '',
    description: '',
    category: 'event',
    location: '',
    ownerId,
    image: '',
    images: [],
    operationalInfo: {},
    sessions: [newEventSessionDraft()],
  };
}
