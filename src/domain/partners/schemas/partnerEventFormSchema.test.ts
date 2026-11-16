import { describe, expect, it } from 'vitest';
import { partnerEventFormSchema } from './partnerEventFormSchema';

const valid = {
  name: 'Luau na Duna',
  eventCategory: 'Festa',
  date: '2026-12-01T22:00:00.000Z',
  endDate: '2026-12-02T03:00:00.000Z',
  location: 'Jericoacoara',
  googleMapsLink: 'https://maps.app.goo.gl/x',
  images: ['https://example.com/a.jpg'],
};

describe('partnerEventFormSchema', () => {
  it('aceita o evento com os campos obrigatórios e entrada gratuita por padrão', () => {
    const parsed = partnerEventFormSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.entryType).toBe('gratuito');
  });

  it('as mensagens são chaves de tradução, uma por campo', () => {
    const parsed = partnerEventFormSchema.safeParse({ ...valid, name: ' ', images: [] });
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues.map((issue) => issue.message)).toEqual([
      'partnerCatalog.actions.required.name',
      'partnerCatalog.actions.required.photo',
    ]);
  });

  it('categoria "Outro" pede a categoria escrita', () => {
    const parsed = partnerEventFormSchema.safeParse({ ...valid, eventCategory: 'Outro' });
    expect(parsed.error?.issues[0]?.message).toBe('partnerCatalog.actions.required.customCategory');
  });

  it('campos extras não entram no evento (o servidor recusa os que sobrarem)', () => {
    const parsed = partnerEventFormSchema.safeParse({ ...valid, ownerId: 'x', isVerified: true });
    expect(parsed.success && 'ownerId' in parsed.data).toBe(false);
    expect(parsed.success && 'isVerified' in parsed.data).toBe(false);
  });
});
