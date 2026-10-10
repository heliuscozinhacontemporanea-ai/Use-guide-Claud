import { z } from 'zod';

const optionalUrl = z
  .string()
  .url()
  .or(z.literal(''))
  .optional();

const operationalInfoSchema = z
  .object({
    tags: z.array(z.string().trim().min(1)).optional(),
    cuisineType: z.string().trim().max(200).optional(),
    subcategory: z.string().trim().max(200).optional(),
    amenities: z
      .union([
        z.array(z.string().trim().min(1)),
        z.string().trim().max(5000),
      ])
      .optional(),
    amenitiesRestaurant: z
      .union([
        z.array(z.string().trim().min(1)),
        z.string().trim().max(5000),
      ])
      .optional(),
    additionalServices: z
      .union([
        z.array(z.string().trim().min(1)),
        z.string().trim().max(5000),
      ])
      .optional(),
    mealTypes: z
      .union([
        z.array(z.string().trim().min(1)),
        z.string().trim().max(5000),
      ])
      .optional(),
    activities: z
      .union([
        z.array(z.string().trim().min(1)),
        z.string().trim().max(5000),
      ])
      .optional(),
    services: z
      .union([
        z.array(z.string().trim().min(1)),
        z.string().trim().max(5000),
      ])
      .optional(),
    languages: z
      .union([
        z.array(z.string().trim().min(1)),
        z.string().trim().max(1000),
      ])
      .optional(),
    menuLink: optionalUrl,
    access: z.string().trim().max(500).optional(),
    price: z.string().trim().max(200).optional(),
    breakfast: z
      .object({
        serves: z.boolean().optional(),
        types: z.array(z.string().trim().min(1)).optional(),
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
  .strict()
  .optional();

export const adminGuideItemFormSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10000),
  category: z.enum([
    'restaurant',
    'sight',
    'tour',
    'tips',
    'hotel',
  ]),
  image: z.string().url().or(z.literal('')),
  images: z.array(z.string().url()).max(5),
  location: z.string().trim().min(1).max(100),
  googleMapsType: z.string().trim().max(100).optional(),
  mapLink: optionalUrl,
  instagramLink: optionalUrl,
  websiteLink: optionalUrl,
  bookingLink: optionalUrl,
  whatsappLink: z.string().trim().max(100).optional(),
  googleMapsLink: optionalUrl,
  address: z.string().trim().max(500).optional(),
  tags: z
    .array(z.string().trim().min(1).max(100))
    .max(50)
    .optional(),
  operationalInfo: operationalInfoSchema,
  isActive: z.boolean().optional(),
});

export const adminGuideEventFormSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10000),
  image: z.string().url().or(z.literal('')),
  images: z.array(z.string().url()).max(5),
  location: z.string().trim().min(1).max(100),
  date: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true }),
  eventCategory: z.string().trim().min(1).max(100),
  customCategory: z.string().trim().max(200).optional(),
  googleMapsType: z.string().trim().max(100).optional(),
  mapLink: optionalUrl,
  instagramLink: optionalUrl,
  websiteLink: optionalUrl,
  bookingLink: optionalUrl,
  whatsappLink: z.string().trim().max(100).optional(),
  googleMapsLink: optionalUrl,
  address: z.string().trim().max(500).optional(),
  tags: z
    .array(z.string().trim().min(1).max(100))
    .max(50)
    .optional(),
  operationalInfo: operationalInfoSchema,
  isActive: z.boolean().optional(),
});

export type AdminGuideItemFormValues = z.infer<typeof adminGuideItemFormSchema>;
export type AdminGuideEventFormValues = z.infer<typeof adminGuideEventFormSchema>;
