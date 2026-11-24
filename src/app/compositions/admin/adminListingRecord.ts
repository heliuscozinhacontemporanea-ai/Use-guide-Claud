import type { GuideItem } from '../../../domain/guide';
import type { PartnerContentRecord } from '../../../domain/partners';

/** O anúncio do catálogo no formato das páginas do editor do parceiro (escolhas da F4). */
export function toListingRecord(item: GuideItem): PartnerContentRecord {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category,
    image: item.image,
    images: item.images,
    location: item.location,
    instagramLink: item.instagramLink,
    websiteLink: item.websiteLink,
    bookingLink: item.bookingLink,
    phone: item.phone,
    googleMapsLink: item.googleMapsLink,
    address: item.address,
    state: item.state,
    city: item.city,
    timeZone: item.timeZone,
    tags: item.tags,
    ownerId: item.ownerId,
    operationalInfo: item.operationalInfo,
    declinedLinks: item.declinedLinks,
    publication: item.publication,
    isActive: item.isActive,
  };
}
