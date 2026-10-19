import type { PartnerContentItemInput } from '../../types/partnerContent';
import { toE164 } from '../../../../shared/utils/phone';
import type { PartnerSubmissionData } from '../../types/partner';

function toGuideItemCategory(value: string): PartnerContentItemInput['category'] {
  switch (value) {
    case 'hotel':
      return 'hotel';
    case 'restaurant':
      return 'restaurant';
    case 'sight':
      return 'sight';
    case 'tour':
      return 'tour';
    case 'transfer':
      return 'transfer';
    case 'rental':
      return 'rental';
    case 'producer':
      return 'producer';
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
  if (formData.category === 'tour') {
    const hours = Number((formData.tourDurationHours ?? '').replace(',', '.'));
    return {
      durationMinutes: Number.isFinite(hours) && hours > 0 ? Math.round(hours * 60) : undefined,
      meetingPoint: formData.meetingPoint,
      itinerary: formData.itinerary,
      includes: formData.tourIncludes,
      languages: formData.languages,
    };
  }
  if (formData.category === 'transfer') {
    return {
      transferRoutes: (formData.transferRoutes ?? []).filter(
        (route) => route.from.trim() && route.to.trim()
      ),
      vehicleTypes: formData.transferVehicles,
      maxPassengers: positiveInt(formData.maxPassengers),
      luggageInfo: formData.luggageInfo,
      languages: formData.languages,
    };
  }
  if (formData.category === 'rental') {
    return {
      vehicleTypes: formData.rentalVehicles,
      minRentalHours: positiveInt(formData.minRentalHours),
      depositRequired: formData.depositRequired ?? undefined,
      driverLicenseRequired: formData.driverLicenseRequired ?? undefined,
      includes: formData.rentalIncludes,
      operatingHours: formData.operatingHours,
      languages: formData.languages,
    };
  }
  return undefined;
}

function positiveInt(value: string | undefined): number | undefined {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function mapPartnerSubmissionToGuideItem(
  formData: PartnerSubmissionData,
  imageUrls: string[]
): PartnerContentItemInput {
  if (!formData.region?.trim()) {
    throw new Error('Região é obrigatória');
  }
  const category = toGuideItemCategory(formData.category);
  // Perfil de produtor pode não ter fotos; estabelecimentos precisam de ao menos uma.
  if (imageUrls.length === 0 && category !== 'producer') {
    throw new Error('Ao menos uma imagem é obrigatória');
  }

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
    phone: toE164(formData.phoneDdi, formData.phone),
    googleMapsLink: formData.googleMaps,
    address: formData.address,
    operationalInfo: buildOperationalInfo(formData),
  };
}
