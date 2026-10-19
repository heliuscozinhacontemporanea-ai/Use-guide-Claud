import { describe, expect, it } from 'vitest';
import { INITIAL_FORM_DATA } from '../constants/formDefaults';
import { mapPartnerRegistrationPayload } from './usePartnerRegistrationSubmission';

describe('mapPartnerRegistrationPayload', () => {
  it('envia só CPF/CNPJ e termos: a categoria pertence ao cadastro, não à conta (decisão D9)', () => {
    const payload = mapPartnerRegistrationPayload({
      ...INITIAL_FORM_DATA,
      category: 'producer',
      cpfCnpj: ' 529.982.247-25 ',
      termsAccepted: true,
    });
    // O schema do servidor é estrito: qualquer campo a mais faz a inscrição falhar com 400.
    expect(payload).toEqual({ cpfCnpj: '529.982.247-25', termsAccepted: true });
  });

  it('recusa inscrição sem aceite dos termos ou sem CPF/CNPJ', () => {
    expect(() =>
      mapPartnerRegistrationPayload({ ...INITIAL_FORM_DATA, cpfCnpj: '529.982.247-25' })
    ).toThrow();
    expect(() =>
      mapPartnerRegistrationPayload({ ...INITIAL_FORM_DATA, termsAccepted: true, cpfCnpj: ' ' })
    ).toThrow();
  });
});
