import { z } from 'zod';
import { parseReaisToMinor } from '../utils/money';

// As mensagens são chaves de tradução; o formulário mostra t(mensagem) (AGENTS.md §12.5).
const required = 'bookings.validation.required';
const tooLong = 'bookings.validation.tooLong';
const integer = 'bookings.validation.integer';

const optionalText = (max: number) => z.string().trim().max(max, tooLong);

export const offerFormSchema = z.object({
  kind: z.enum(['tour', 'private_entry']),
  title: z.object({
    'pt-BR': z.string().trim().min(1, required).max(120, tooLong),
    en: optionalText(120),
    fr: optionalText(120),
  }),
  description: z.object({
    'pt-BR': optionalText(5000),
    en: optionalText(5000),
    fr: optionalText(5000),
  }),
  priceOptions: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().trim().min(1, required).max(60, tooLong),
        amount: z
          .string()
          .refine(
            (value) => (parseReaisToMinor(value) ?? 0) > 0,
            'bookings.validation.priceInvalid'
          ),
      })
    )
    .min(1, 'bookings.validation.atLeastOnePrice')
    .max(10),
  durationMinutes: z.coerce.number().int(integer).min(15, integer).max(1440, integer),
  meetingPoint: optionalText(300),
  freeCancellationHoursBefore: z.coerce.number().int(integer).min(0, integer).max(720, integer),
  refundPercentAfterDeadline: z.enum(['0', '50', '100']),
  maxParticipantsPerBooking: z.coerce.number().int(integer).min(1, integer).max(50, integer),
  requiresParticipantNames: z.boolean(),
});

export type OfferFormInput = z.input<typeof offerFormSchema>;
export type OfferFormValues = z.output<typeof offerFormSchema>;
