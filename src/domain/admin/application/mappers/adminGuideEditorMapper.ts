import type {
  CreateEventListingInput,
  UpdateEventListingInput,
} from '../../../events';
import type {
  GuideCreateItemInput,
  GuideUpdateItemInput,
  GuideItem,
} from '../../../guide';

export function toGuideItemInput(
  data: GuideItem
): GuideCreateItemInput {
  return {
    name: data.name,
    description: data.description,
    category: data.category === 'event'
      ? 'tips'
      : data.category,
    image: data.image,
    images: data.images ?? [],
    location: data.location,
    googleMapsType: data.googleMapsType,
    mapLink: data.mapLink,
    instagramLink: data.instagramLink,
    websiteLink: data.websiteLink,
    bookingLink: data.bookingLink,
    phone: data.phone,
    googleMapsLink: data.googleMapsLink,
    address: data.address,
    tags: data.tags,
    operationalInfo: data.operationalInfo,
    isActive: data.isActive,
  };
}

export function toGuideItemUpdateInput(
  data: GuideItem
): GuideUpdateItemInput {
  const input = toGuideItemInput(data);
  return {
    ...input,
  };
}

export function toGuideEventInput(
  data: GuideItem
): CreateEventListingInput {
  if (
    !data.date ||
    !data.endDate ||
    !data.eventCategory
  ) {
    throw new Error(
      'Data, horário e categoria do evento são obrigatórios'
    );
  }
  return {
    name: data.name,
    description: data.description,
    image: data.image,
    images: data.images ?? [],
    location: data.location,
    date: data.date,
    endDate: data.endDate,
    eventCategory: data.eventCategory,
    customCategory: data.customCategory,
    instagramLink: data.instagramLink,
    websiteLink: data.websiteLink,
    bookingLink: data.bookingLink,
    phone: data.phone,
    googleMapsLink: data.googleMapsLink,
    address: data.address,
    isActive: data.isActive,
  };
}

export function toGuideEventUpdateInput(
  data: GuideItem
): UpdateEventListingInput {
  const input = toGuideEventInput(data);
  return {
    ...input,
  };
}
