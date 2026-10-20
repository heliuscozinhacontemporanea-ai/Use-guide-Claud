import { describe, expect, it } from 'vitest';
import { INITIAL_FORM_DATA } from '../constants/formDefaults';
import { mapPartnerRegistrationPayload } from './usePartnerRegistrationSubmission';

describe('mapPartnerRegistrationPayload', () => {
  it('envia só o aceite dos termos: categoria e documento são do estabelecimento (D9, D12)', () => {
    const payload = mapPartnerRegistrationPayload({
      ...INITIAL_FORM_DATA,
      category: 'producer',
      termsAccepted: true,
    });
    // O schema do servidor é estrito: qualquer campo a mais faz a inscrição falhar com 400.
    expect(payload).toEqual({ termsAccepted: true });
  });

  it('recusa inscrição sem aceite dos termos', () => {
    expect(() => mapPartnerRegistrationPayload(INITIAL_FORM_DATA)).toThrow();
  });
});
