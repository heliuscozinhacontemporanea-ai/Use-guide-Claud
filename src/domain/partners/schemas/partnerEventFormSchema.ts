import { z } from 'zod';

export const eventEntryTypeSchema = z.enum(['pago', 'gratuito']);
export type EventEntryType = z.infer<typeof eventEntryTypeSchema>;

// Mensagens são chaves de tradução: a tela mostra `t(issue.message)` (AGENTS.md §12.5).
export const partnerEventFormSchema = z
  .object({
    name: z.string().trim().min(1, 'partnerCatalog.actions.required.name').max(100),
    description: z.string().max(400).optional(),
    eventCategory: z.string().trim().min(1, 'partnerCatalog.actions.required.category'),
    customCategory: z.string().optional(),
    establishmentId: z.string().optional(),
    date: z.string().trim().min(1, 'partnerCatalog.actions.required.sessions'),
    endDate: z.string().trim().min(1, 'partnerCatalog.actions.required.sessions'),
    location: z.string().trim().min(1, 'partnerCatalog.actions.required.region'),
    googleMapsLink: z.string().trim().min(1, 'partnerCatalog.actions.required.maps'),
    images: z.array(z.string()).min(1, 'partnerCatalog.actions.required.photo'),
    image: z.string().optional(),
    entryType: eventEntryTypeSchema.default('gratuito'),
    phone: z.string().optional(),
    websiteLink: z.string().optional(),
    instagramLink: z.string().optional(),
    address: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.eventCategory === 'Outro' && !data.customCategory?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customCategory'],
        message: 'partnerCatalog.actions.required.customCategory',
      });
    }
  });

export type PartnerEventFormValues = z.infer<typeof partnerEventFormSchema>;
