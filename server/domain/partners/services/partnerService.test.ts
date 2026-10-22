import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PartnerService } from './partnerService';
import { PartnerPort } from '../ports/partnerPort';

function createPartnerPortMock(): PartnerPort {
  return {
    registerPartner: vi.fn(),
    updatePartnerVerificationProfile: vi.fn(),
    getPartnerProfile: vi.fn(),
    updatePartnerStatus: vi.fn(),
    getAllPartnerIds: vi.fn(),
    getAllPartners: vi.fn(),
    deletePartnerProfile: vi.fn(),
    activateTrialAtomically: vi.fn(),
    restoreTrialStateAtomically: vi.fn(),
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

  describe('updatePartnerVerificationProfile', () => {
    it('deve delegar a verificação para o PartnerPort', async () => {
      await service.updatePartnerVerificationProfile('partner-123', {
        isVerified: true,
        verifiedUntil: '2026-12-31T23:59:59.000Z',
        verificationType: 'annual',
        isVerificationSuspended: false,
      });

      expect(partnerPort.updatePartnerVerificationProfile).toHaveBeenCalledWith('partner-123', {
        isVerified: true,
        verifiedUntil: '2026-12-31T23:59:59.000Z',
        verificationType: 'annual',
        isVerificationSuspended: false,
      });
    });

    it('deve lançar erro se partnerId for vazio', async () => {
      await expect(
        service.updatePartnerVerificationProfile('', {
          isVerified: true,
          verifiedUntil: null,
          verificationType: null,
          isVerificationSuspended: false,
        })
      ).rejects.toThrow('ID do parceiro é obrigatório para verificação');

      expect(partnerPort.updatePartnerVerificationProfile).not.toHaveBeenCalled();
    });

    it('deve lançar erro se isVerified=true mas verifiedUntil estiver ausente', async () => {
      await expect(
        service.updatePartnerVerificationProfile('partner-123', {
          isVerified: true,
          verifiedUntil: null,
          verificationType: 'annual',
          isVerificationSuspended: false,
        })
      ).rejects.toThrow('verifiedUntil é obrigatório quando o parceiro está verificado');
    });

    it('deve lançar erro se isVerified=true mas verificationType estiver ausente', async () => {
      await expect(
        service.updatePartnerVerificationProfile('partner-123', {
          isVerified: true,
          verifiedUntil: '2026-12-31T23:59:59.000Z',
          verificationType: null,
          isVerificationSuspended: false,
        })
      ).rejects.toThrow('verificationType é obrigatório quando o parceiro está verificado');
    });

    it('deve lançar erro se isVerified=false mas verifiedUntil não for null', async () => {
      await expect(
        service.updatePartnerVerificationProfile('partner-123', {
          isVerified: false,
          verifiedUntil: '2026-12-31T23:59:59.000Z',
          verificationType: null,
          isVerificationSuspended: false,
        })
      ).rejects.toThrow('verifiedUntil deve ser null quando o parceiro não está verificado');
    });

    it('deve lançar erro se isVerified=false mas verificationType não for null', async () => {
      await expect(
        service.updatePartnerVerificationProfile('partner-123', {
          isVerified: false,
          verifiedUntil: null,
          verificationType: 'annual',
          isVerificationSuspended: false,
        })
      ).rejects.toThrow('verificationType deve ser null quando o parceiro não está verificado');
    });
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

  describe('restoreTrialState', () => {
    it('deve delegar a restauração atômica para o port', async () => {
      const state = {
        hasUsedTrial: false,
        isVerified: false,
        verifiedUntil: null,
        verificationType: null,
        isVerificationSuspended: false,
      };

      await service.restoreTrialState('partner-123', state);

      expect(partnerPort.restoreTrialStateAtomically).toHaveBeenCalledWith('partner-123', state);
    });

    it('deve lançar erro se partnerId for vazio', async () => {
      const state = {
        hasUsedTrial: false,
        isVerified: false,
        verifiedUntil: null,
        verificationType: null,
        isVerificationSuspended: false,
      };

      await expect(service.restoreTrialState('', state)).rejects.toThrow(
        'ID do parceiro é obrigatório'
      );
    });
  });
});
