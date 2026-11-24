import type { GuideItem } from '../../../domain/guide';
import type { PartnerContentEditorState } from '../../../domain/partners';

/** O evento do catálogo no formato do editor de evento do parceiro (escolhas da F4). */
export function toEventDraft(event: GuideItem): PartnerContentEditorState {
  return {
    id: event.id,
    name: event.name,
    description: event.description,
    category: 'event',
    image: event.image,
    images: event.images ?? (event.image ? [event.image] : []),
    location: event.location,
    address: event.address,
    googleMapsLink: event.googleMapsLink,
    phone: event.phone,
    instagramLink: event.instagramLink,
    websiteLink: event.websiteLink,
    establishmentId: event.establishmentId,
    eventCategory: event.eventCategory,
    customCategory: event.customCategory,
    entryType: event.entryType,
    timeZone: event.timeZone,
    state: event.state,
    city: event.city,
    ownerId: event.ownerId,
    date: event.date,
    endDate: event.endDate,
  };
}
