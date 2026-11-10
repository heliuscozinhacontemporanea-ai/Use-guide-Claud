import { describe, expect, it } from 'vitest';
import { partnerSignupErrorsPtBR } from '../../../shared/i18n/partnerSignupErrorResources';
import { INITIAL_FORM_DATA } from '../constants/formDefaults';
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5SchemaContext,
} from './partnerSchema';

const CATEGORIES = ['hotel', 'restaurant', 'sight', 'tour', 'transfer', 'rental', 'producer'];
const PREFIX = 'partnerSignup.errors.';

function messagesFor(category: string) {
  const form = { ...INITIAL_FORM_DATA, category, servesBreakfast: true, breakfastIncluded: false };
  const schemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5SchemaContext({})];
  return schemas.flatMap((schema) => {
    const parsed = schema.safeParse(form);
    return parsed.success ? [] : parsed.error.issues.map((issue) => issue.message);
  });
}

describe('mensagens do cadastro de parceiro', () => {
  it.each(CATEGORIES)('em %s, o formulário vazio só gera chaves traduzidas', (category) => {
    const messages = messagesFor(category);
    expect(messages.length).toBeGreaterThan(0);
    for (const message of messages) {
      expect(message.startsWith(PREFIX)).toBe(true);
      expect(partnerSignupErrorsPtBR).toHaveProperty(message.slice(PREFIX.length));
    }
  });

  it('a hospedagem sem link de reserva aponta o campo', () => {
    const parsed = step2Schema.safeParse({ ...INITIAL_FORM_DATA, category: 'hotel' });
    const issue = parsed.success
      ? undefined
      : parsed.error.issues.find((item) => item.path[0] === 'bookingLinks');
    expect(issue?.message).toBe('partnerSignup.errors.bookingRequired');
  });

  it('anúncio que vende recusa contato no texto; vitrine aceita (C2/B37)', () => {
    const tour = step1Schema.safeParse({
      ...INITIAL_FORM_DATA,
      category: 'tour',
      businessName: 'Buggy',
      description: 'Reserve pelo (88) 99999-0000',
    });
    expect(tour.success ? [] : tour.error.issues.map((issue) => issue.message)).toEqual([
      'partnerSignup.errors.contactInText',
    ]);
    const restaurant = step1Schema.safeParse({
      ...INITIAL_FORM_DATA,
      category: 'restaurant',
      businessName: 'Cantinho',
      description: 'Reserve pelo (88) 99999-0000',
    });
    expect(restaurant.success).toBe(true);
    expect(partnerSignupErrorsPtBR).toHaveProperty('contactInText');
  });
});
