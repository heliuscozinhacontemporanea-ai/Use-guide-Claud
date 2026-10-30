import { z } from 'zod';
import {
  BOOKING_CANCELLATION_POLICIES,
  TRANSFER_CANCELLATION_POLICIES,
} from '../../../../shared/kernel/cancellationPolicy';

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
  pickupMode: z.enum(['meeting_point', 'buyer_address']).optional(),
  sellingUnit: z.enum(['person', 'group']).optional(),
  groupMaxPeople: z.number().int().min(2).max(50).optional(),
  // Opções da plataforma (D14); o serviço confere se a opção vale para o tipo da oferta.
  cancellationPolicy: z.enum([...BOOKING_CANCELLATION_POLICIES, ...TRANSFER_CANCELLATION_POLICIES]),
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
    acceptedTermsVersion: z.string().trim().min(1).max(40),
    pickupAddress: z.string().trim().min(3).max(300).optional(),
  })
  .strict();

export const RescheduleSlotSchema = z
  .object({
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime().optional(),
    reason: z.string().trim().min(3).max(300),
  })
  .strict();

export const CheckInByCodeSchema = z
  .object({
    // Aceita minúsculas, espaço e hífen; o serviço normaliza e confere o alfabeto.
    code: z.string().trim().min(6).max(12),
    capturedAt: isoDateTime.optional(),
  })
  .strict();

export const ProviderArrivalSchema = z
  .object({
    // Opcional: o navegador pode negar a localização, e o "Cheguei" vale mesmo assim (D20).
    location: z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        accuracyM: z.number().min(0).max(100_000).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const CheckInWithoutCodeSchema = z
  .object({
    // Mesma lista de NO_CODE_REASONS no domínio de reservas.
    reason: z.enum(['no_phone', 'refused', 'other']),
  })
  .strict();

export const ProviderAbsenceAnswerSchema = z
  .object({ answer: z.enum(['was_there', 'admitted']) })
  .strict();

export const ServiceConfirmationAnswerSchema = z.object({ answer: z.enum(['yes', 'no']) }).strict();

export const EntryCheckInSchema = z
  .object({
    qrToken: z.string().trim().min(20).max(1000).optional(),
    // Aceita o prefixo `ENTR:`, minúsculas, espaço e hífen; o serviço normaliza.
    code: z.string().trim().min(8).max(16).optional(),
    capturedAt: isoDateTime.optional(),
  })
  .strict()
  .refine((body) => Boolean(body.qrToken) !== Boolean(body.code), {
    message: 'Envie o QR Code ou o código, não os dois.',
  });

export const ParticipantNameSchema = z.object({ name: z.string().trim().min(2).max(80) }).strict();

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
