import { z } from 'zod';

const isoDateTime = z.string().datetime({ offset: true });
const documentId = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
const idempotencyKey = z.string().min(8).max(150);
const locale = z.enum(['pt-BR', 'en', 'fr']);

const localizedText = (max: number) =>
  z
    .object({
      'pt-BR': z.string().trim().min(1).max(max),
      en: z.string().trim().max(max).optional(),
      fr: z.string().trim().max(max).optional(),
    })
    .strict();

const priceOption = z
  .object({
    id: z.string().regex(/^[a-z0-9_-]{1,40}$/),
    label: localizedText(60),
    unitAmountMinor: z.number().int().positive().max(10_000_000),
    minQuantity: z.number().int().min(1).max(50).optional(),
    maxQuantity: z.number().int().min(1).max(50).optional(),
  })
  .strict();

const offerFields = {
  title: localizedText(120),
  description: localizedText(5000).optional(),
  pricing: z
    .object({ currency: z.literal('BRL'), priceOptions: z.array(priceOption).min(1).max(10) })
    .strict(),
  durationMinutes: z
    .number()
    .int()
    .min(15)
    .max(24 * 60)
    .optional(),
  meetingPoint: z
    .object({
      address: z.string().trim().min(3).max(300),
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
      instructions: localizedText(500).optional(),
    })
    .strict()
    .optional(),
  cancellationPolicy: z
    .object({
      freeCancellationHoursBefore: z
        .number()
        .int()
        .min(0)
        .max(24 * 30),
      refundPercentAfterDeadline: z.union([z.literal(0), z.literal(50), z.literal(100)]),
    })
    .strict(),
  maxParticipantsPerBooking: z.number().int().min(1).max(50),
  requiresParticipantNames: z.boolean(),
};

export const CreateOfferSchema = z
  .object({
    guideItemId: documentId,
    kind: z.enum(['tour', 'private_entry', 'rental', 'transfer']),
    ...offerFields,
  })
  .strict();

export const UpdateOfferSchema = z.object(offerFields).partial().strict();

export const OfferStatusSchema = z
  .object({ status: z.enum(['published', 'paused', 'archived']) })
  .strict();

export const CreateSlotsSchema = z.discriminatedUnion('mode', [
  z
    .object({
      mode: z.literal('list'),
      capacity: z.number().int().min(1).max(500),
      slots: z
        .array(z.object({ startsAt: isoDateTime, endsAt: isoDateTime.optional() }).strict())
        .min(1)
        .max(200),
    })
    .strict(),
  z
    .object({
      mode: z.literal('recurrence'),
      capacity: z.number().int().min(1).max(500),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
      times: z
        .array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/))
        .min(1)
        .max(12),
    })
    .strict(),
]);

export const CreateBookingSchema = z
  .object({
    offerId: documentId,
    slotId: documentId,
    lines: z
      .array(
        z
          .object({
            priceOptionId: z.string().min(1).max(40),
            quantity: z.number().int().min(1).max(50),
          })
          .strict()
      )
      .min(1)
      .max(10),
    participants: z
      .array(z.object({ name: z.string().max(80) }).strict())
      .max(50)
      .default([]),
    idempotencyKey: idempotencyKey.optional(),
    locale,
  })
  .strict();

export const CancelBookingSchema = z.object({ reason: z.string().max(300).optional() }).strict();

export const SlotWindowQuerySchema = z
  .object({ from: isoDateTime, to: isoDateTime })
  .strict()
  .refine((value) => new Date(value.to).getTime() > new Date(value.from).getTime(), {
    message: 'to deve ser depois de from',
  })
  .refine(
    (value) => new Date(value.to).getTime() - new Date(value.from).getTime() <= 62 * 86_400_000,
    { message: 'janela máxima de 62 dias' }
  );

export const PageQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
    cursor: documentId.optional(),
  })
  .strict();

export const IdempotencyKeyHeaderSchema = idempotencyKey;
export const DocumentIdSchema = documentId;
