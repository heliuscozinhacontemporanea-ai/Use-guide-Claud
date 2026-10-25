import { PARTNER_TERMS_VERSION } from '../../../shared/kernel/legalTerms';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PartnerService } from './partnerService';
import { PartnerPort } from '../ports/partnerPort';

function createPartnerPortMock(): PartnerPort {
  return {
    registerPartner: vi.fn(),
    getPartnerProfile: vi.fn(),
    updatePartnerStatus: vi.fn(),
    getAllPartnerIds: vi.fn(),
    getAllPartners: vi.fn(),
    deletePartnerProfile: vi.fn(),
    linkBusiness: vi.fn(),
    updateBusiness: vi.fn(),
    unlinkBusiness: vi.fn(),
    getTermsAcceptance: vi.fn().mockResolvedValue(null),
    recordTermsAcceptance: vi.fn(),
  };
}

describe('PartnerService', () => {
  let partnerPort: PartnerPort;
  let service: PartnerService;

  beforeEach(() => {
    vi.clearAllMocks();
    partnerPort = createPartnerPortMock();
    service = new PartnerService(partnerPort);
  });

  describe('registerPartner', () => {
    it('deve chamar registerPartner no port só com o aceite dos termos', async () => {
      await service.registerPartner('user-1', { termsAccepted: true });

      expect(partnerPort.registerPartner).toHaveBeenCalledWith('user-1', { termsAccepted: true });
    });

    it('deve lançar erro se termsAccepted for false', async () => {
      await expect(
        service.registerPartner('user-1', { termsAccepted: false as never })
      ).rejects.toThrow('É necessário aceitar os termos de parceria');
    });
  });

  describe('termos do parceiro (D15)', () => {
    it('sem aceite da versão atual, bloqueia; aceitar grava versão e data', async () => {
      await expect(service.assertTermsAccepted('p1')).rejects.toMatchObject({
        code: 'PARTNER_TERMS_NOT_ACCEPTED',
      });
      await expect(service.acceptTerms('p1', '2020-01-01')).rejects.toThrow(/desatualizada/);
      const now = new Date('2026-10-25T12:00:00.000Z');
      const status = await service.acceptTerms('p1', PARTNER_TERMS_VERSION, now);
      expect(status.accepted).toBe(true);
      expect(partnerPort.recordTermsAcceptance).toHaveBeenCalledWith('p1', {
        version: PARTNER_TERMS_VERSION,
        acceptedAt: '2026-10-25T12:00:00.000Z',
      });
      vi.mocked(partnerPort.getTermsAcceptance).mockResolvedValue({
        version: PARTNER_TERMS_VERSION,
        acceptedAt: '2026-10-25T12:00:00.000Z',
      });
      await expect(service.assertTermsAccepted('p1')).resolves.toBeUndefined();
    });
  });
});
