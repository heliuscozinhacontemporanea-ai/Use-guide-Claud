import { describe, expect, it } from 'vitest';
import { hasServiceProof, newCheckIns, requiresServiceProof } from './serviceProof';

const CHECK_IN = { at: 't', byUid: 'p' };

describe('prova do serviço (D20)', () => {
  it('check-in de alguma unidade com código ou QR, ou "sim" do cliente, provam', () => {
    expect(hasServiceProof({ checkIns: [{ ...CHECK_IN, unit: 1, method: 'code' }] })).toBe(true);
    expect(hasServiceProof({ checkIns: [{ ...CHECK_IN, unit: 0, method: 'qr' }] })).toBe(true);
    expect(hasServiceProof({ checkIns: [{ ...CHECK_IN, unit: 0, method: 'no_code' }] })).toBe(
      false
    );
    expect(
      hasServiceProof({
        checkIns: [{ ...CHECK_IN, unit: 0, method: 'no_code' }],
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

  it('unidade repetida ou fora da reserva não conta de novo', () => {
    const booking = {
      participantsCount: 2,
      checkIns: [{ ...CHECK_IN, unit: 0, method: 'code' as const }],
    };
    const added = newCheckIns(booking, [
      { ...CHECK_IN, unit: 0, method: 'code' },
      { ...CHECK_IN, unit: 1, method: 'code' },
      { ...CHECK_IN, unit: 1, method: 'qr' },
      { ...CHECK_IN, unit: 2, method: 'code' },
    ]);
    expect(added.map((item) => item.unit)).toEqual([1]);
  });

  it('passeio, aluguel e translado esperam a prova; entrada de atração não', () => {
    expect(requiresServiceProof('tour')).toBe(true);
    expect(requiresServiceProof('rental')).toBe(true);
    expect(requiresServiceProof('transfer')).toBe(true);
    expect(requiresServiceProof('private_entry')).toBe(false);
  });
});
