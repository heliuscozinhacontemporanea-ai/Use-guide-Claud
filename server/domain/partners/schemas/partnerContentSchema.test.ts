import { describe, expect, it } from 'vitest';
import { createPartnerItemSchema, updatePartnerItemSchema } from './partnerContentSchema';

const item = {
  name: 'Buggy do Preá',
  description: 'Passeios de buggy pelas dunas.',
  category: 'tour',
  image: '',
  images: [],
  location: 'Preá',
};

describe('createPartnerItemSchema', () => {
  // O cadastro de parceiro manda estado e cidade desde a F1 do fuso (D28); recusar quebrava a inscrição.
  it('aceita estado e cidade do estabelecimento', () => {
    const parsed = createPartnerItemSchema.safeParse({
      ...item,
      state: 'CE',
      city: 'Jijoca de Jericoacoara',
    });
    expect(parsed.success).toBe(true);
    expect(updatePartnerItemSchema.safeParse({ state: 'AM', city: 'Manaus' }).success).toBe(true);
  });

  it('recusa estado fora da lista e o fuso vindo do cliente', () => {
    expect(createPartnerItemSchema.safeParse({ ...item, state: 'XX', city: 'Lá' }).success).toBe(
      false
    );
    expect(createPartnerItemSchema.safeParse({ ...item, timeZone: 'America/Manaus' }).success).toBe(
      false
    );
  });
});
