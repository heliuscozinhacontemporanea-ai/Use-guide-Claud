import type { PartnerContentRecord } from '../../types/partnerContent';
import type { FormState } from '../../types/partsForm';

export const getEmptyFormData = (category = ''): FormState => ({
  businessName: '',
  category,
  description: '',
  cpfCnpj: '',
  phone: '',
  phoneDdi: '+55',
  instagram: '',
  website: '',
  bookingLinks: '',
  googleMaps: '',
  address: '',
  region: '',
  servesBreakfast: null,
  breakfastIncluded: null,
  breakfastPrice: '',
  breakfastTypes: [],
  amenities: [],
  menuLink: '',
  menuFile: null,
  subcategory: '',
  cuisineType: '',
  mealTypes: [],
  additionalServices: [],
  amenitiesRestaurant: [],
  sightServices: [],
  sightAmenities: [],
  sightActivities: [],
  sightAccessType: '',
  sightPrice: '',
  languages: [],
  checkInFrom: '',
  checkInTo: '',
  checkOutFrom: '',
  checkOutTo: '',
  childrenAllowed: null,
  petsPolicy: '',
  petsExtraCost: '',
  operatingHours: {
    domingo: { open: '08:00', close: '22:00', closed: false },
    segunda: { open: '08:00', close: '22:00', closed: false },
    terça: { open: '08:00', close: '22:00', closed: false },
    quarta: { open: '08:00', close: '22:00', closed: false },
    quinta: { open: '08:00', close: '22:00', closed: false },
    sexta: { open: '08:00', close: '22:00', closed: false },
    sábado: { open: '08:00', close: '22:00', closed: false },
  },
  photosLink: '',
  additionalInfo: '',
  termsAccepted: true,
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  images: [],
});

const ensureArray = (val: string[] | string | undefined): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val];
};

export const mapItemToFormData = (item: PartnerContentRecord, partnerCpfCnpj = ''): FormState => {
  const opInfo = item.operationalInfo ?? {};
  const access = opInfo.access;
  const sightAccessType: 'pago' | 'gratuito' | '' =
    access === 'pago' || access === 'gratuito' ? access : '';

  return {
    businessName: item.name || '',
    category: item.category || '',
    description: item.description || '',
    cpfCnpj: partnerCpfCnpj,
    phone: item.whatsappLink || '',
    phoneDdi: '+55',
    instagram: item.instagramLink || '',
    website: item.websiteLink || '',
    bookingLinks: item.bookingLink || '',
    googleMaps: item.googleMapsLink || '',
    address: item.address || '',
    region: (() => {
      if (item.location === 'jeri') return 'Jericoacoara';
      if (item.location === 'prea') return 'Praia do Preá';
      if (item.location === 'barrinha') return 'Barrinha de Baixo';
      return item.location || '';
    })(),
    servesBreakfast: opInfo.breakfast?.serves ?? null,
    breakfastIncluded: opInfo.breakfast?.included ?? null,
    breakfastPrice: opInfo.breakfast?.price || '',
    breakfastTypes: opInfo.breakfast?.types || [],
    amenities: item.category === 'hotel' ? ensureArray(opInfo.amenities) : [],
    menuLink: opInfo.menuLink || '',
    menuFile: null,
    subcategory: opInfo.subcategory || '',
    cuisineType: opInfo.cuisineType || '',
    mealTypes: ensureArray(opInfo.mealTypes),
    additionalServices: ensureArray(opInfo.additionalServices),
    amenitiesRestaurant: item.category === 'restaurant' ? ensureArray(opInfo.amenities) : [],
    sightServices: ensureArray(opInfo.services),
    sightAmenities: item.category === 'sight' ? ensureArray(opInfo.amenities) : [],
    sightActivities: ensureArray(opInfo.activities),
    sightAccessType,
    sightPrice: opInfo.price || '',
    languages: ensureArray(opInfo.languages),
    checkInFrom: opInfo.checkIn?.from || '',
    checkInTo: opInfo.checkIn?.to || '',
    checkOutFrom: opInfo.checkOut?.from || '',
    checkOutTo: opInfo.checkOut?.to || '',
    childrenAllowed: opInfo.childrenAllowed ?? null,
    petsPolicy: opInfo.petsPolicy || '',
    petsExtraCost: opInfo.petsExtraCost || '',
    operatingHours: {
      domingo: { open: '08:00', close: '22:00', closed: false },
      segunda: { open: '08:00', close: '22:00', closed: false },
      terça: { open: '08:00', close: '22:00', closed: false },
      quarta: { open: '08:00', close: '22:00', closed: false },
      quinta: { open: '08:00', close: '22:00', closed: false },
      sexta: { open: '08:00', close: '22:00', closed: false },
      sábado: { open: '08:00', close: '22:00', closed: false },
      ...(opInfo.operatingHours || {}),
    },
    photosLink: '',
    additionalInfo: '',
    termsAccepted: true,
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    images: (item.images || []).map((url: string) => ({
      id: url,
      preview: url,
      file: undefined,
    })),
  };
};

export const isValidUrl = (url: string): boolean => {
  if (!url) return true;
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.includes('.');
  } catch {
    return false;
  }
};
