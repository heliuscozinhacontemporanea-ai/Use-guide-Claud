import { describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ status: vi.fn() }));
vi.mock('../../domain/partners', () => ({ getPartnerTermsStatusUseCase: m.status }));

import { hasCurrentPartnerTerms } from './partnerTermsStatus';

describe('aceite dos termos atuais do parceiro', () => {
  it('sem o aceite, ou sem conseguir ler, conta como pendente', async () => {
    m.status.mockResolvedValueOnce({ accepted: true });
    expect(await hasCurrentPartnerTerms('p1')).toBe(true);
    m.status.mockResolvedValueOnce({ accepted: false });
    expect(await hasCurrentPartnerTerms('p1')).toBe(false);
    m.status.mockRejectedValueOnce(new Error('firestore'));
    expect(await hasCurrentPartnerTerms('p1')).toBe(false);
  });
});
