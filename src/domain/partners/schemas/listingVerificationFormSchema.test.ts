import { describe, expect, it } from 'vitest';
import {
  documentVerificationFormSchema,
  EMPTY_DOCUMENT_VERIFICATION_FORM,
} from './listingVerificationFormSchema';

const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
const messages = (values: object) => {
  const result = documentVerificationFormSchema.safeParse({
    ...EMPTY_DOCUMENT_VERIFICATION_FORM,
    ...values,
  });
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe('documentVerificationFormSchema (D12)', () => {
  it('CNPJ exige Cartão CNPJ, identidade e vínculo', () => {
    expect(messages({ document: '11.222.333/0001-81' })).toEqual([
      'verification.validation.holderRoleRequired',
      'verification.validation.identityRequired',
      'verification.validation.cnpjCardRequired',
    ]);
    expect(
      messages({
        document: '11.222.333/0001-81',
        holderRole: 'owner',
        identity: file,
        cnpjCard: file,
      })
    ).toEqual([]);
  });

  it('representante precisa da autorização de um sócio', () => {
    expect(
      messages({
        document: '11.222.333/0001-81',
        holderRole: 'representative',
        identity: file,
        cnpjCard: file,
      })
    ).toEqual(['verification.validation.authorizationRequired']);
  });

  it('CPF não exige Cartão CNPJ e deixa a identidade para o servidor (CPF já conferido)', () => {
    expect(
      messages({ documentType: 'cpf', document: '529.982.247-25', holderRole: 'owner' })
    ).toEqual([]);
  });

  it('recusa documento inválido com a mensagem do tipo escolhido', () => {
    expect(
      messages({ documentType: 'cpf', document: '111.111.111-11', holderRole: 'owner' })
    ).toEqual(['verification.validation.documentInvalidCpf']);
  });
});
