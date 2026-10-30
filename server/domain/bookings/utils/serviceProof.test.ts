import { describe, expect, it } from 'vitest';
import { hasServiceProof, requiresServiceProof } from './serviceProof';

const CHECK_IN = { at: 't', byUid: 'p', participantsPresent: 1 };

describe('prova do serviço (D20)', () => {
  it('check-in com código ou "sim" do comprador provam; "Cliente sem código" sozinho não', () => {
    expect(hasServiceProof({ checkIn: { ...CHECK_IN, method: 'code' } })).toBe(true);
    expect(hasServiceProof({ checkIn: { ...CHECK_IN, method: 'no_code' } })).toBe(false);
    expect(
      hasServiceProof({
        checkIn: { ...CHECK_IN, method: 'no_code' },
        serviceConfirmation: {
          askedAt: 't',
          answerBy: 't',
          reason: 'no_code',
          resolution: 'confirmed',
        },
      })
    ).toBe(true);
    expect(
      hasServiceProof({
        serviceConfirmation: {
          askedAt: 't',
          answerBy: 't',
          reason: 'no_record',
          resolution: 'refunded',
        },
      })
    ).toBe(false);
    expect(hasServiceProof({})).toBe(false);
  });

  it('passeio, aluguel e translado esperam a prova; entrada de atração não', () => {
    expect(requiresServiceProof('tour')).toBe(true);
    expect(requiresServiceProof('rental')).toBe(true);
    expect(requiresServiceProof('transfer')).toBe(true);
    expect(requiresServiceProof('private_entry')).toBe(false);
  });
});
