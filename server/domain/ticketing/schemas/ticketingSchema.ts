import { z } from 'zod';

export const ticketTypeKindSchema = z.enum(['paid', 'free', 'courtesy', 'half_entry']);

export const ticketTypeStatusSchema = z.enum([
  'draft',
  'on_sale',
  'paused',
  'sold_out',
  'ended',
  'archived',
]);

export const createTicketTypeSchema = z
  .object({
    occurrenceId: z.string().trim().min(1),
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(1000).optional(),
    kind: ticketTypeKindSchema,
    priceMinor: z.number().int().min(0),
    currency: z.literal('BRL').default('BRL'),
    quantity: z.number().int().positive().max(100000),
    minPerOrder: z.number().int().positive().max(50).default(1),
    maxPerOrder: z.number().int().positive().max(50).default(10),
    salesStartsAt: z.string().datetime({ offset: true }).optional(),
    salesEndsAt: z.string().datetime({ offset: true }).optional(),
    status: ticketTypeStatusSchema.default('on_sale'),
    visibility: z.enum(['public', 'hidden', 'restricted']).default('public'),
    requiresEligibilityProof: z.boolean().optional(),
    sortOrder: z.number().int().min(0).default(0),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.maxPerOrder < data.minPerOrder) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxPerOrder'],
        message: 'A quantidade máxima por pedido não pode ser menor que a mínima.',
      });
    }
    if ((data.kind === 'free' || data.kind === 'courtesy') && data.priceMinor !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['priceMinor'],
        message: 'Ingressos gratuitos ou cortesia devem ter valor zero.',
      });
    }
    if ((data.kind === 'paid' || data.kind === 'half_entry') && data.priceMinor <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['priceMinor'],
        message: 'Ingressos pagos devem possuir preço maior que zero.',
      });
    }
  });

export const updateTicketTypeSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(1000).optional(),
    priceMinor: z.number().int().min(0).optional(),
    quantity: z.number().int().positive().max(100000).optional(),
    minPerOrder: z.number().int().positive().max(50).optional(),
    maxPerOrder: z.number().int().positive().max(50).optional(),
    salesStartsAt: z.string().datetime({ offset: true }).optional(),
    salesEndsAt: z.string().datetime({ offset: true }).optional(),
    status: ticketTypeStatusSchema.optional(),
    visibility: z.enum(['public', 'hidden', 'restricted']).optional(),
    requiresEligibilityProof: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .strict();

export const createTicketOrderSchema = z
  .object({
    occurrenceId: z.string().trim().min(1),
    items: z
      .array(
        z
          .object({
            ticketTypeId: z.string().trim().min(1),
            quantity: z.number().int().positive().max(50),
            holders: z
              .array(
                z
                  .object({
                    name: z.string().trim().min(1).max(120),
                    email: z.string().email(),
                  })
                  .strict()
              )
              .optional(),
          })
          .strict()
      )
      .min(1),
    buyer: z
      .object({
        name: z.string().trim().min(1).max(120),
        email: z.string().email(),
      })
      .strict(),
    promoCode: z.string().trim().max(80).optional(),
    promoterCode: z.string().trim().max(80).optional(),
    idempotencyKey: z.string().trim().min(1).max(150),
  })
  .strict();

export const requestTicketRefundSchema = z
  .object({
    reason: z.string().trim().min(1).max(500),
    ticketId: z.string().trim().min(1).optional(),
    idempotencyKey: z.string().trim().min(1).max(150),
  })
  .strict();

export const transferTicketSchema = z
  .object({
    recipientEmail: z.string().email(),
    recipientName: z.string().trim().min(1).max(120).optional(),
    toUserId: z.string().trim().min(1).optional(),
  })
  .strict();

export const checkInTicketSchema = z
  .object({
    occurrenceId: z.string().trim().min(1),
    ticketId: z.string().trim().min(1).optional(),
    qrToken: z.string().trim().min(8).max(512).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.ticketId && !data.qrToken) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['qrToken'],
        message: 'Informe o token do QR Code ou o ID do ingresso.',
      });
    }
  });

export const createPromoCodeSchema = z
  .object({
    eventListingId: z.string().trim().min(1),
    code: z.string().trim().min(2).max(40),
    type: z.enum(['percentage', 'fixed']),
    valueMinor: z.number().int().positive().optional(),
    percentage: z.number().int().min(1).max(100).optional(),
    maxUses: z.number().int().positive().optional(),
    startsAt: z.string().datetime({ offset: true }).optional(),
    endsAt: z.string().datetime({ offset: true }).optional(),
    ticketTypeIds: z.array(z.string().trim().min(1)).optional(),
    isActive: z.boolean().default(true),
  })
  .strict();

export const joinWaitlistSchema = z
  .object({
    occurrenceId: z.string().trim().min(1),
    ticketTypeId: z.string().trim().min(1).optional(),
    quantity: z.number().int().positive().max(10).default(1),
  })
  .strict();

export const payTicketOrderSchema = z
  .object({
    idempotencyKey: z.string().trim().min(1).max(150).optional(),
  })
  .strict();

export const createOfflineCheckInSessionSchema = z
  .object({
    occurrenceId: z.string().trim().min(1),
    stationId: z.string().trim().min(1).max(120).optional(),
    ttlHours: z.number().int().min(1).max(72).optional(),
  })
  .strict();

export const syncOfflineCheckInsSchema = z
  .object({
    occurrenceId: z.string().trim().min(1).optional(),
    sessionId: z.string().trim().min(1),
    stationId: z.string().trim().min(1).max(120).optional(),
    events: z
      .array(
        z
          .object({
            clientEventId: z.string().trim().min(1).max(150),
            sessionId: z.string().trim().min(1).optional(),
            ticketId: z.string().trim().min(1),
            ticketIdHash: z.string().trim().min(1).optional(),
            occurrenceId: z.string().trim().min(1),
            qrVersion: z.number().int().min(1).default(1),
            scannedAt: z.string().datetime({ offset: true }).optional(),
            checkedInAt: z.string().datetime({ offset: true }).optional(),
          })
          .strict()
      )
      .min(1)
      .max(500)
      .optional(),
    items: z
      .array(
        z
          .object({
            clientEventId: z.string().trim().min(1).max(150),
            ticketId: z.string().trim().min(1),
            qrToken: z.string().trim().min(1).optional(),
            qrVersion: z.number().int().min(1).default(1),
            checkedInAt: z.string().datetime({ offset: true }),
          })
          .strict()
      )
      .min(1)
      .max(500)
      .optional(),
  })
  .strict();


