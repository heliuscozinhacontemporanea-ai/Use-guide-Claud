import { z } from 'zod';
import { PANEL_TOUR_ACTIONS, PARTNER_HOME_CARD_IDS } from '../../../../domain/partners';

export const SavePartnerHomeCardsSchema = z
  .object({
    cards: z.array(z.enum(PARTNER_HOME_CARD_IDS)).max(PARTNER_HOME_CARD_IDS.length),
  })
  .strict();

// Até seis semanas: o calendário do mês mostra de segunda a domingo.
const MAX_RANGE_MS = 43 * 24 * 60 * 60_000;

export const PartnerAgendaQuerySchema = z
  .object({ from: z.string().datetime(), to: z.string().datetime() })
  .strict()
  .refine(({ from, to }) => {
    const range = new Date(to).getTime() - new Date(from).getTime();
    return range > 0 && range <= MAX_RANGE_MS;
  });

export const PartnerEventParamsSchema = z
  .object({ eventId: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/) })
  .strict();

export const PartnerReportsQuerySchema = z
  .object({ period: z.enum(['7d', '30d', '12m']) })
  .strict();

export const PartnerEventOrdersQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
    cursor: z
      .string()
      .regex(/^[A-Za-z0-9_-]{1,200}$/)
      .optional(),
    q: z.string().max(60).optional(),
    filter: z.enum(['all', 'refunds']).default('all'),
  })
  .strict();

export const PanelTourActionSchema = z.object({ action: z.enum(PANEL_TOUR_ACTIONS) }).strict();
