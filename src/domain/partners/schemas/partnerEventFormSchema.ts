import { z } from 'zod';

export const eventEntryTypeSchema = z.enum([
  'pago',
  'gratuito',
]);
export type EventEntryType = z.infer<typeof eventEntryTypeSchema>;

export const partnerEventFormSchema = z
  .object({
    name: z.string().trim().min(1, 'O nome do evento é obrigatório.').max(100),
    description: z.string().max(400).optional(),
    eventCategory: z.string().trim().min(1, 'A categoria do evento é obrigatória.'),
    customCategory: z.string().optional(),
    establishmentId: z.string().optional(),
    date: z.string().trim().min(1, 'A data e hora de início são obrigatórias.'),
    endDate: z.string().trim().min(1, 'A data e hora de término são obrigatórias.'),
    location: z.string().trim().min(1, 'A região é obrigatória.'),
    googleMapsLink: z.string().trim().min(1, 'O link do Google Maps (Local) é obrigatório.'),
    images: z.array(z.string()).min(1, 'Ao menos uma imagem é obrigatória.'),
    image: z.string().optional(),
    entryType: eventEntryTypeSchema.default('gratuito'),
    whatsappLink: z.string().optional(),
    websiteLink: z.string().optional(),
    instagramLink: z.string().optional(),
    address: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.eventCategory === 'Outro' && !data.customCategory?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customCategory'],
        message: 'Por favor, especifique a categoria do evento.',
      });
    }
  });

export type PartnerEventFormValues = z.infer<typeof partnerEventFormSchema>;
