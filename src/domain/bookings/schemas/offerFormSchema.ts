import { z } from 'zod';
import {
  BOOKING_CANCELLATION_POLICIES,
  TRANSFER_CANCELLATION_POLICIES,
} from '../../../shared/utils/cancellationPolicy';
import { parseReaisToMinor } from '../utils/money';

// As mensagens são chaves de tradução; o formulário mostra t(mensagem) (AGENTS.md §12.5).
const required = 'bookings.validation.required';
const tooLong = 'bookings.validation.tooLong';
const integer = 'bookings.validation.integer';

const optionalText = (max: number) => z.string().trim().max(max, tooLong);

// Um texto só, sem abas por idioma (F3, D34): a tradução automática da D5 fica pendente.
export const offerFormSchema = z
  .object({
    kind: z.enum(['tour', 'private_entry']),
    title: z.string().trim().min(1, required).max(120, tooLong),
    description: optionalText(5000),
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
    durationHours: z.coerce.number().int(integer).min(0, integer).max(24, integer),
    durationMins: z.coerce.number().int(integer).min(0, integer).max(59, integer),
    meetingPoint: optionalText(300),
    pickupMode: z.enum(['meeting_point', 'buyer_address']),
    cancellationPolicy: z.enum([
      ...BOOKING_CANCELLATION_POLICIES,
      ...TRANSFER_CANCELLATION_POLICIES,
    ]),
    maxParticipantsPerBooking: z.coerce.number().int(integer).min(1, integer).max(50, integer),
    requiresParticipantNames: z.boolean(),
    sellingUnit: z.enum(['person', 'group']),
    // Sempre validado (o campo tem valor padrão); só vai para a API na venda por grupo.
    groupMaxPeople: z.coerce.number().int(integer).min(2, integer).max(50, integer),
  })
  .superRefine((values, ctx) => {
    const total = values.durationHours * 60 + values.durationMins;
    if (total < 15 || total > 1440) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['durationHours'],
        message: 'bookings.validation.durationRange',
      });
    }
  });

export type OfferFormInput = z.input<typeof offerFormSchema>;
export type OfferFormValues = z.output<typeof offerFormSchema>;
