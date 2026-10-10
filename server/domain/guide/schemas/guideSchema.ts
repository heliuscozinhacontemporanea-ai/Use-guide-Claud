import { z } from 'zod';

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
  whatsappLink: z.string().trim().max(100).optional(),
  address: z.string().trim().max(500).optional(),
  tags: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
  operationalInfo: operationalInfoSchema.optional(),
  isActive: z.boolean().optional(),
};

export const createItemSchema = z
  .object({
    ...commonFields,
    category: z.enum(['restaurant', 'sight', 'tour', 'tips', 'hotel']),
  })
  .strict();

export const updateItemSchema = createItemSchema.partial().strict();
