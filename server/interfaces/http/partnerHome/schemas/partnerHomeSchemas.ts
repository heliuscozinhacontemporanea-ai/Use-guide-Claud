import { z } from 'zod';
import { PARTNER_HOME_CARD_IDS } from '../../../../domain/partners';

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
