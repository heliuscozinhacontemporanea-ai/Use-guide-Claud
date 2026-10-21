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
});
