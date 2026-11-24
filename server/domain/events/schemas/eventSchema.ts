import { z } from 'zod';
import { EVENT_CANCELLATION_POLICIES } from '../../../shared/kernel/cancellationPolicy';

// Criar e editar evento passam pelas rotas do parceiro, também para o admin (escolhas da F4); aqui
// fica só a política de venda, usada pelo schema do parceiro.
export const eventSalesPolicySchema = z
  .object({
    cancellationPolicy: z.enum(EVENT_CANCELLATION_POLICIES),
    serviceFeeMode: z.enum(['pass_to_buyer', 'absorb']),
    allowTicketTransfer: z.boolean(),
    ticketTransferCutoffHours: z.number().int().min(0).max(720),
  })
  .strict();
