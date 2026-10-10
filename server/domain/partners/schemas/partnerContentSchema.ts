import { z } from 'zod';
import { eventRefundPolicySchema } from '../../events/schemas/eventSchema';

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

export const createPartnerItemSchema = z
  .object({
    ...commonFields,
    category: z.enum(['restaurant', 'sight', 'tour', 'tips', 'hotel']),
  })
  .strict();

export const updatePartnerItemSchema = createPartnerItemSchema.partial().strict();

export const eventEntryTypeSchema = z.enum(['pago', 'gratuito']);
export type EventEntryType = z.infer<typeof eventEntryTypeSchema>;

const eventFields = {
  ...commonFields,
  date: z.string().datetime({
    offset: true,
  }),
  endDate: z.string().datetime({
    offset: true,
  }),
  eventCategory: z.string().trim().min(1).max(100),
  customCategory: z.string().trim().max(200).optional(),
  entryType: eventEntryTypeSchema.optional(),
  refundPolicy: eventRefundPolicySchema.optional(),
  maxTicketsPerUserPerOccurrence: z.number().int().min(1).max(100).optional(),
};

export const createPartnerEventOccurrenceSchema = z
  .object({
    startsAt: z.string().datetime({ offset: true }),
    endsAt: z.string().datetime({ offset: true }),
    capacity: z.coerce.number().int().min(1).max(100000).default(100),
    salesStartsAt: z.string().datetime({ offset: true }).optional(),
    salesEndsAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (new Date(data.endsAt).getTime() <= new Date(data.startsAt).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A data de término deve ser posterior à data de início',
        path: ['endsAt'],
      });
    }
  });

export const updatePartnerEventOccurrenceSchema = z
  .object({
    startsAt: z.string().datetime({ offset: true }).optional(),
    endsAt: z.string().datetime({ offset: true }).optional(),
    capacity: z.coerce.number().int().min(1).max(100000).optional(),
    salesStartsAt: z.string().datetime({ offset: true }).optional(),
    salesEndsAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const createPartnerEventSchema = z
  .object({
    ...eventFields,
    establishmentId: z.string().trim().min(1).optional(),
    occurrences: z.array(createPartnerEventOccurrenceSchema).min(1).max(100).optional(),
  })
  .strict()
  .superRefine((data, context) => {
    if (new Date(data.endDate).getTime() < new Date(data.date).getTime()) {
      context.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'A data de término deve ser igual ou posterior à data de início',
      });
    }
    if (data.eventCategory.toLowerCase() === 'outro' && !data.customCategory?.trim()) {
      context.addIssue({
        code: 'custom',
        path: ['customCategory'],
        message: 'A categoria personalizada é obrigatória',
      });
    }
  });

export const updatePartnerEventSchema = z
  .object(eventFields)
  .partial()
  .strict();
