import type { PartnerContentItemInput } from '../../types/partnerContent';
import type { PartnerSubmissionData } from '../../types/partner';

function toGuideItemCategory(value: string): PartnerContentItemInput['category'] {
  switch (value) {
    case 'hotel':
      return 'hotel';
    case 'restaurant':
      return 'restaurant';
    case 'sight':
      return 'sight';
    default:
      throw new Error('Categoria de Partner incompatível com conteúdo do Guide.');
  }
}

function buildOperationalInfo(formData: PartnerSubmissionData) {
  if (formData.category === 'hotel') {
    return {
      childrenAllowed: formData.childrenAllowed ?? undefined,
      petsPolicy: formData.petsPolicy,
      petsExtraCost: formData.petsExtraCost,
      checkIn: {
        from: formData.checkInFrom ?? '',
        to: formData.checkInTo ?? '',
      },
      checkOut: {
        from: formData.checkOutFrom ?? '',
        to: formData.checkOutTo ?? '',
      },
      languages: formData.languages,
      amenities: formData.amenities,
      breakfast: {
        serves: formData.servesBreakfast ?? undefined,
        included: formData.breakfastIncluded ?? undefined,
        price: formData.breakfastPrice,
        types: formData.breakfastTypes,
      },
    };
  }
  if (formData.category === 'restaurant') {
    return {
      subcategory: formData.subcategory,
      cuisineType: formData.cuisineType,
      mealTypes: formData.mealTypes,
      additionalServices: formData.additionalServices,
      amenities: formData.amenitiesRestaurant,
      operatingHours: formData.operatingHours,
      languages: formData.languages,
      menuLink: formData.menuLink,
    };
  }
  if (formData.category === 'sight') {
    return {
      activities: formData.sightActivities,
      services: formData.sightServices,
      amenities: formData.sightAmenities,
      access: formData.sightAccessType,
      price: formData.sightPrice,
      operatingHours: formData.operatingHours,
      languages: formData.languages,
    };
  }
  return undefined;
}

export function mapPartnerSubmissionToGuideItem(
  formData: PartnerSubmissionData,
  imageUrls: string[]
): PartnerContentItemInput {
  if (!formData.region?.trim()) {
    throw new Error('Região é obrigatória');
  }
  if (imageUrls.length === 0) {
    throw new Error('Ao menos uma imagem é obrigatória');
  }

  const category = toGuideItemCategory(formData.category);

  return {
    name: formData.businessName,
    description: formData.description,
    category,
    image: imageUrls[0] || '',
    images: imageUrls,
    location: formData.region.trim(),
    instagramLink: formData.instagram,
    websiteLink: formData.website,
    bookingLink: formData.bookingLinks,
    whatsappLink: formData.phone,
    googleMapsLink: formData.googleMaps,
    address: formData.address,
    operationalInfo: buildOperationalInfo(formData),
    isActive: true,
  };
}
