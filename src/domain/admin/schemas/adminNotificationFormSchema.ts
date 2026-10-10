import { z } from 'zod';

export const adminNotificationFormSchema = z
  .object({
    recipientMode: z.enum(['single', 'multiple', 'all']),
    selectedPartnerIds: z.array(z.string().trim().min(1)),
    title: z.string().trim().min(1, 'Informe o título.').max(100),
    message: z.string().trim().min(1, 'Informe a mensagem.').max(500),
  })
  .superRefine((data, ctx) => {
    if (data.recipientMode !== 'all' && data.selectedPartnerIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['selectedPartnerIds'],
        message: 'Selecione ao menos um parceiro.',
      });
    }
  });

export type AdminNotificationFormValues = z.infer<typeof adminNotificationFormSchema>;
