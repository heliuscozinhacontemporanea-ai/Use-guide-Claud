import { z } from 'zod';
import { EVENT_CANCELLATION_POLICIES } from '../../../shared/kernel/cancellationPolicy';
import { E164_MESSAGE, E164_PATTERN } from '../../../shared/kernel/phone';

const optionalUrl = z.string().url().or(z.literal('')).optional();

export const eventLocationSchema = z
  .object({
    name: z.string().trim().max(200).optional(),
    address: z.string().trim().max(500).optional(),
    googleMapsLink: optionalUrl,
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  })
  .strict();

export const eventSalesPolicySchema = z
  .object({
    cancellationPolicy: z.enum(EVENT_CANCELLATION_POLICIES),
    serviceFeeMode: z.enum(['pass_to_buyer', 'absorb']),
    allowTicketTransfer: z.boolean(),
    ticketTransferCutoffHours: z.number().int().min(0).max(720),
  })
  .strict();

export const createEventOccurrenceSchema = z
  .object({
    startsAt: z.string().datetime({ offset: true }),
    endsAt: z.string().datetime({ offset: true }),
    capacity: z.number().int().positive('A capacidade da ocorrência deve ser maior que zero.'),
    salesStartsAt: z.string().datetime({ offset: true }).optional(),
    salesEndsAt: z.string().datetime({ offset: true }).optional(),
    locationOverride: eventLocationSchema.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const startMs = new Date(data.startsAt).getTime();
    const endMs = new Date(data.endsAt).getTime();
    if (endMs <= startMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endsAt'],
        message: 'A data/hora de término deve ser posterior ao início.',
      });
    }
    if (data.salesStartsAt && data.salesEndsAt) {
      const salesStartMs = new Date(data.salesStartsAt).getTime();
      const salesEndMs = new Date(data.salesEndsAt).getTime();
      if (salesEndMs <= salesStartMs) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['salesEndsAt'],
          message: 'O fim das vendas deve ser posterior ao início das vendas.',
        });
      }
    }
    if (data.salesEndsAt) {
      const salesEndMs = new Date(data.salesEndsAt).getTime();
      if (salesEndMs > startMs) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['salesEndsAt'],
          message: 'O encerramento das vendas não pode ultrapassar o início da ocorrência.',
        });
      }
    }
  });

export const updateEventOccurrenceSchema = z
  .object({
    startsAt: z.string().datetime({ offset: true }).optional(),
    endsAt: z.string().datetime({ offset: true }).optional(),
    capacity: z.number().int().positive().optional(),
    salesStartsAt: z.string().datetime({ offset: true }).optional(),
    salesEndsAt: z.string().datetime({ offset: true }).optional(),
    locationOverride: eventLocationSchema.optional(),
    cancellationReason: z.string().trim().max(500).optional(),
    postponementReason: z.string().trim().max(500).optional(),
  })
  .strict();

export const createEventListingSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    name: z.string().trim().min(1).max(200).optional(),
    summary: z.string().trim().max(400).optional(),
    description: z.string().trim().max(10000),
    category: z.string().trim().min(1).max(100).optional(),
    eventCategory: z.string().trim().min(1).max(100).optional(),
    customCategory: z.string().trim().max(200).optional(),
    establishmentId: z.string().trim().min(1).optional(),
    coverImage: optionalUrl,
    image: optionalUrl,
    images: z.array(z.string().url()).max(5),
    visibility: z.enum(['public', 'unlisted', 'private']).optional(),
    status: z.enum(['draft', 'published', 'paused', 'archived']).optional(),
    isActive: z.boolean().optional(),
    location: z.union([z.string().trim().min(1).max(200), eventLocationSchema]),
    address: z.string().trim().max(500).optional(),
    googleMapsLink: optionalUrl,
    phone: z.string().trim().regex(E164_PATTERN, E164_MESSAGE).optional(),
    websiteLink: optionalUrl,
    instagramLink: optionalUrl,
    bookingLink: optionalUrl,
    salesPolicy: eventSalesPolicySchema.optional(),
    ageRestriction: z
      .object({
        minAge: z.number().int().min(0).max(100).optional(),
        maxAge: z.number().int().min(0).max(120).optional(),
      })
      .strict()
      .optional(),
    entryType: z.enum(['pago', 'gratuito']).optional(),
    date: z.string().datetime({ offset: true }).optional(),
    endDate: z.string().datetime({ offset: true }).optional(),
    occurrences: z.array(createEventOccurrenceSchema).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.title && !data.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['name'],
        message: 'O nome/título do evento é obrigatório.',
      });
    }
  });

export const updateEventListingSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    name: z.string().trim().min(1).max(200).optional(),
    summary: z.string().trim().max(400).optional(),
    description: z.string().trim().max(10000).optional(),
    category: z.string().trim().min(1).max(100).optional(),
    eventCategory: z.string().trim().min(1).max(100).optional(),
    customCategory: z.string().trim().max(200).optional(),
    coverImage: optionalUrl,
    image: optionalUrl,
    images: z.array(z.string().url()).max(5).optional(),
    visibility: z.enum(['public', 'unlisted', 'private']).optional(),
    status: z.enum(['draft', 'published', 'paused', 'archived']).optional(),
    isActive: z.boolean().optional(),
    location: z.union([z.string().trim().min(1).max(200), eventLocationSchema]).optional(),
    address: z.string().trim().max(500).optional(),
    googleMapsLink: optionalUrl,
    phone: z.string().trim().regex(E164_PATTERN, E164_MESSAGE).optional(),
    websiteLink: optionalUrl,
    instagramLink: optionalUrl,
    bookingLink: optionalUrl,
    salesPolicy: eventSalesPolicySchema.optional(),
    ageRestriction: z
      .object({
        minAge: z.number().int().min(0).max(100).optional(),
        maxAge: z.number().int().min(0).max(120).optional(),
      })
      .strict()
      .optional(),
    entryType: z.enum(['pago', 'gratuito']).optional(),
    date: z.string().datetime({ offset: true }).optional(),
    endDate: z.string().datetime({ offset: true }).optional(),
  })
  .strict();
