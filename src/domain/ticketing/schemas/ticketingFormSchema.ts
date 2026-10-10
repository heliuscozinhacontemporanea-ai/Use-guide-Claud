import { z } from 'zod';

export const createTicketTypeFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Informe o nome do lote/ingresso').max(120),
    description: z.string().trim().max(500).optional(),
    kind: z.enum(['paid', 'free', 'courtesy', 'half_entry']),
    priceMajor: z.number().min(0, 'O preço não pode ser negativo').max(100000),
    quantity: z.number().int().min(1, 'Quantidade mínima é 1').max(100000),
    minPerOrder: z.number().int().min(1).max(20),
    maxPerOrder: z.number().int().min(1).max(50),
    salesStartsAt: z.string().optional(),
    salesEndsAt: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.maxPerOrder < data.minPerOrder) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxPerOrder'],
        message: 'A quantidade máxima não pode ser menor que a mínima.',
      });
    }
    if ((data.kind === 'paid' || data.kind === 'half_entry') && data.priceMajor <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['priceMajor'],
        message: 'Ingressos pagos exigem preço maior que zero.',
      });
    }
  });

export type CreateTicketTypeFormData = z.infer<typeof createTicketTypeFormSchema>;

export const ticketCheckoutFormSchema = z.object({
  buyerName: z.string().trim().min(2, 'Informe seu nome completo').max(140),
  buyerEmail: z.string().trim().email('Informe um e-mail válido').max(180),
  buyerDocument: z
    .string()
    .trim()
    .regex(/^\d{11}$|^\d{14}$/, 'Informe apenas os números do CPF (11 dígitos) ou CNPJ (14 dígitos)'),
  promoCode: z.string().trim().max(40).optional(),
  paymentMethod: z.enum(['pix', 'credit_card']),
});

export type TicketCheckoutFormData = z.infer<typeof ticketCheckoutFormSchema>;

export const transferTicketFormSchema = z.object({
  recipientName: z.string().trim().min(2, 'Informe o nome do destinatário').max(140),
  recipientEmail: z.string().trim().email('Informe um e-mail válido').max(180),
});

export type TransferTicketFormData = z.infer<typeof transferTicketFormSchema>;

export const refundRequestFormSchema = z.object({
  reason: z.string().trim().min(3, 'Descreva o motivo do cancelamento').max(500),
});

export type RefundRequestFormData = z.infer<typeof refundRequestFormSchema>;

export const checkInFormSchema = z.object({
  codeOrTicketId: z.string().trim().min(4, 'Informe o código QR ou ID do ingresso').max(250),
});

export type CheckInFormData = z.infer<typeof checkInFormSchema>;
