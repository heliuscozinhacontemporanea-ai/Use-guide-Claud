import { z } from 'zod';
import { E164_MESSAGE, E164_PATTERN } from '../../../shared/kernel/phone';

const optionalUrl = z.string().url().or(z.literal('')).optional();

const stringArraySchema = z.array(z.string().trim().min(1));

const operationalInfoSchema = z
  .object({
    tags: stringArraySchema.optional(),
    cuisineType: z.string().trim().max(200).optional(),
    subcategory: z.string().trim().max(200).optional(),
    amenities: z.union([stringArraySchema, z.string().trim().max(5000)]).optional(),
    amenitiesRestaurant: z.union([stringArraySchema, z.string().trim().max(5000)]).optional(),
    additionalServices: z.union([stringArraySchema, z.string().trim().max(5000)]).optional(),
    mealTypes: z.union([stringArraySchema, z.string().trim().max(5000)]).optional(),
    activities: z.union([stringArraySchema, z.string().trim().max(5000)]).optional(),
    services: z.union([stringArraySchema, z.string().trim().max(5000)]).optional(),
    languages: z.union([stringArraySchema, z.string().trim().max(1000)]).optional(),
    menuLink: optionalUrl,
    access: z.string().trim().max(500).optional(),
    price: z.string().trim().max(200).optional(),
    breakfast: z
      .object({
        serves: z.boolean().optional(),
        types: stringArraySchema.optional(),
        included: z.boolean().optional(),
        price: z.string().trim().max(200).optional(),
      })
      .strict()
      .optional(),
    checkIn: z
      .object({
        from: z.string().trim().min(1),
        to: z.string().trim().min(1),
      })
      .strict()
      .optional(),
    checkOut: z
      .object({
        from: z.string().trim().min(1),
        to: z.string().trim().min(1),
      })
      .strict()
      .optional(),
    // Passeio, translado e aluguel (decisão D9).
    durationMinutes: z.number().int().min(15).max(10080).optional(),
    meetingPoint: z.string().trim().max(300).optional(),
    itinerary: z.string().trim().max(2000).optional(),
    includes: stringArraySchema.max(30).optional(),
    transferRoutes: z
      .array(
        z
          .object({
            from: z.string().trim().min(1).max(100),
            to: z.string().trim().min(1).max(100),
          })
          .strict()
      )
      .max(30)
      .optional(),
    vehicleTypes: stringArraySchema.max(20).optional(),
    maxPassengers: z.number().int().min(1).max(100).optional(),
    luggageInfo: z.string().trim().max(500).optional(),
    minRentalHours: z.number().int().min(1).max(720).optional(),
    depositRequired: z.boolean().optional(),
    driverLicenseRequired: z.boolean().optional(),
    childrenAllowed: z.boolean().optional(),
    petsPolicy: z.string().trim().max(1000).optional(),
    petsExtraCost: z.string().trim().max(200).optional(),
    operatingHours: z
      .record(
        z.string(),
        z
          .object({
            open: z.string(),
            close: z.string(),
            closed: z.boolean(),
          })
          .strict()
      )
      .optional(),
  })
  .strict();

const commonFields = {
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10000),
  image: z.string().url().or(z.literal('')),
  images: z.array(z.string().url()).max(5),
  location: z.string().trim().min(1).max(100),
  googleMapsType: z.string().trim().max(100).optional(),
  mapLink: optionalUrl,
  instagramLink: optionalUrl,
  websiteLink: optionalUrl,
  bookingLink: optionalUrl,
  googleMapsLink: optionalUrl,
  phone: z.string().trim().regex(E164_PATTERN, E164_MESSAGE).optional(),
  address: z.string().trim().max(500).optional(),
  tags: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
  operationalInfo: operationalInfoSchema.optional(),
  isActive: z.boolean().optional(),
};

export const createItemSchema = z
  .object({
    ...commonFields,
    category: z.enum([
      'restaurant',
      'sight',
      'tour',
      'tips',
      'hotel',
      'transfer',
      'rental',
      'producer',
    ]),
  })
  .strict();

export const updateItemSchema = createItemSchema.partial().strict();
