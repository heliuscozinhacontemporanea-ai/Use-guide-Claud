import { z } from 'zod';
import { PARTNER_HOME_CARD_IDS } from '../../../../domain/partners';

export const SavePartnerHomeCardsSchema = z
  .object({
    cards: z.array(z.enum(PARTNER_HOME_CARD_IDS)).max(PARTNER_HOME_CARD_IDS.length),
  })
  .strict();
