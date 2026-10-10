export interface OperatingDay {
  open: string;
  close: string;
  closed: boolean;
}

export interface PartnerImage {
  file?: File | null;
  id: string;
  preview: string;
}

export interface FormState {
  businessName: string;
  category: string;
  description: string;
  cpfCnpj: string;
  phone: string;
  phoneDdi: string;
  instagram: string;
  website: string;
  bookingLinks: string;
  googleMaps: string;
  address: string;
  region: string;
  servesBreakfast: boolean | null;
  breakfastIncluded: boolean | null;
  breakfastPrice: string;
  breakfastTypes: string[];
  amenities: string[];
  menuLink: string;
  menuFile: File | null;
  subcategory: string;
  cuisineType: string;
  mealTypes: string[];
  additionalServices: string[];
  amenitiesRestaurant: string[];
  // Step 3 fields (Sight)
  sightServices: string[];
  sightAmenities: string[];
  sightActivities: string[];
  sightAccessType: 'pago' | 'gratuito' | '';
  sightPrice: string;
  languages: string[];
  checkInFrom: string;
  checkInTo: string;
  checkOutFrom: string;
  checkOutTo: string;
  childrenAllowed: boolean | null;
  petsPolicy: string;
  petsExtraCost: string;
  operatingHours: {
    domingo: OperatingDay;
    segunda: OperatingDay;
    terça: OperatingDay;
    quarta: OperatingDay;
    quinta: OperatingDay;
    sexta: OperatingDay;
    sábado: OperatingDay;
    [key: string]: OperatingDay; // Allow indexing
  };
  photosLink: string;
  additionalInfo: string;
  termsAccepted: boolean;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  images: PartnerImage[];
}
