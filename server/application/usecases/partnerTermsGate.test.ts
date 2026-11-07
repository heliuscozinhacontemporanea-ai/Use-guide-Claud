import { describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ status: vi.fn() }));
vi.mock('../../domain/partners', () => ({ getPartnerTermsStatusUseCase: m.status }));

import { assertActorPartnerTerms, hasCurrentPartnerTerms } from './partnerTermsGate';

describe('aceite dos termos atuais do parceiro (etapa 5)', () => {
  it('sem o aceite, ou sem conseguir ler, conta como pendente', async () => {
    m.status.mockResolvedValueOnce({ accepted: true });
    expect(await hasCurrentPartnerTerms('p1')).toBe(true);
    m.status.mockResolvedValueOnce({ accepted: false });
    expect(await hasCurrentPartnerTerms('p1')).toBe(false);
    m.status.mockRejectedValueOnce(new Error('firestore'));
    expect(await hasCurrentPartnerTerms('p1')).toBe(false);
  });

  it('cortesia e divulgador do parceiro pedem o aceite; o admin não', async () => {
    m.status.mockResolvedValue({ accepted: false });
    await expect(assertActorPartnerTerms({ uid: 'p1' })).rejects.toMatchObject({
      code: 'PARTNER_TERMS_PENDING',
    });
    await expect(assertActorPartnerTerms({ uid: 'adm', admin: true })).resolves.toBeUndefined();
  });
});
