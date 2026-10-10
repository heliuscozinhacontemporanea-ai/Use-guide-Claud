import { z } from 'zod';

export const sendAdminMessageSchema = z
  .object({
    recipientIds: z.union([z.array(z.string().trim().min(1).max(128)).min(1), z.literal('all')]),
    title: z
      .string()
      .trim()
      .min(1, 'Título é obrigatório')
      .max(100, 'Título deve ter no máximo 100 caracteres'),
    message: z
      .string()
      .trim()
      .min(1, 'Mensagem é obrigatória')
      .max(500, 'Mensagem deve ter no máximo 500 caracteres'),
  })
  .strict();

export const updateNotificationSettingsSchema = z
  .object({
    reviewNotifications: z.boolean().optional(),
    planExpiringNotifications: z.boolean().optional(),
  })
  .strict();

export type SendAdminMessageInput = z.infer<typeof sendAdminMessageSchema>;
export type UpdateNotificationSettingsInput = z.infer<typeof updateNotificationSettingsSchema>;
