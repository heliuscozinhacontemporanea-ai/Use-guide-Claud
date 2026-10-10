import { z } from 'zod';
import { unmaskCurrency } from '../../../shared/utils/currencyMask';

export const adminOccurrenceFormSchema = z
  .object({
    id: z.string().optional(),
    startsAt: z.string().trim().min(1, 'Erro: A data/hora de início é obrigatória.'),
    endsAt: z.string().trim().min(1, 'Erro: A data/hora de término é obrigatória.'),
    salesStartsAt: z.string().optional(),
    salesEndsAt: z.string().optional(),
    capacity: z.coerce.number().int().positive('Erro: A capacidade deve ser maior que zero.'),
  })
  .superRefine((occ, ctx) => {
    const startMs = new Date(occ.startsAt).getTime();
    const endMs = new Date(occ.endsAt).getTime();
    if (Number.isFinite(startMs) && Number.isFinite(endMs) && endMs <= startMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endsAt'],
        message: 'Erro: O horário de término deve ser posterior ao início.',
      });
    }
  });

export type AdminOccurrenceForm = z.infer<typeof adminOccurrenceFormSchema>;

export const adminGuideEditorFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Erro: O nome do item é obrigatório.').max(100),
    description: z.string().trim().min(1, 'Erro: A descrição do item é obrigatória.'),
    category: z.string().trim().min(1),
    location: z.string().trim().min(1),
    image: z
      .string()
      .trim()
      .min(1, 'Erro: Você deve escolher uma das imagens como CAPA antes de salvar.'),
    images: z.array(z.string()).default([]),
    date: z.string().optional(),
    endDate: z.string().optional(),
    occurrences: z.array(adminOccurrenceFormSchema).optional(),
    eventCategory: z.string().optional(),
    customCategory: z.string().optional(),
    googleMapsLink: z.string().optional(),
    instagramLink: z.string().optional(),
    whatsappLink: z.string().optional(),
    websiteLink: z.string().optional(),
    bookingLink: z.string().optional(),
    operationalInfo: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.images.includes(data.image)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['image'],
        message: 'Erro: Você deve escolher uma das imagens como CAPA antes de salvar.',
      });
    }
    if (data.operationalInfo?.access === 'pago') {
      const priceValue = unmaskCurrency(String(data.operationalInfo?.price || ''));
      if (priceValue <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['operationalInfo'],
          message: 'Erro: Insira um valor de preço válido maior que zero.',
        });
      }
    }
    if (data.category === 'event') {
      const hasOccurrences = Array.isArray(data.occurrences) && data.occurrences.length > 0;
      if (!hasOccurrences && !data.date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['occurrences'],
          message: 'Erro: Adicione ao menos uma ocorrência com data do evento.',
        });
      }
    }
  });

export type AdminGuideEditorSchemaValues = z.infer<typeof adminGuideEditorFormSchema>;
