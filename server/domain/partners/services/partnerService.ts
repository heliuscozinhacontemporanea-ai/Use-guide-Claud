import { PartnerDomainError } from '../errors/partnerDomainError';
import { PartnerPort } from '../ports/partnerPort';
import type {
  PartnerBusiness,
  PartnerProfileDocument,
  PartnerRegistrationData,
  PartnerStatus,
  PartnerTrialState,
  PartnerVerificationData,
  RegisterPartnerResult,
} from '../types/partnerTypes';

export class PartnerService {
  constructor(private readonly partnerPort: PartnerPort) {}

  async registerPartner(
    uid: string,
    data: PartnerRegistrationData
  ): Promise<RegisterPartnerResult> {
    if (!uid?.trim()) {
      throw new PartnerDomainError(
        'INVALID_ARGUMENT',
        'UID do usuário é obrigatório para cadastrar como parceiro'
      );
    }
    if (data.termsAccepted !== true) {
      throw new PartnerDomainError(
        'INVALID_ARGUMENT',
        'É necessário aceitar os termos de parceria'
      );
    }
    return this.partnerPort.registerPartner(uid, data);
  }

  async updatePartnerVerificationProfile(
    partnerId: string,
    verification: PartnerVerificationData
  ): Promise<void> {
    if (!partnerId?.trim()) {
      throw new PartnerDomainError(
        'INVALID_ARGUMENT',
        'ID do parceiro é obrigatório para verificação'
      );
    }

    if (verification.isVerified) {
      if (!verification.verifiedUntil) {
        throw new PartnerDomainError(
          'INVALID_ARGUMENT',
          'verifiedUntil é obrigatório quando o parceiro está verificado'
        );
      }

      if (!verification.verificationType) {
        throw new PartnerDomainError(
          'INVALID_ARGUMENT',
          'verificationType é obrigatório quando o parceiro está verificado'
        );
      }
    } else {
      if (verification.verifiedUntil !== null) {
        throw new PartnerDomainError(
          'INVALID_ARGUMENT',
          'verifiedUntil deve ser null quando o parceiro não está verificado'
        );
      }

      if (verification.verificationType !== null) {
        throw new PartnerDomainError(
          'INVALID_ARGUMENT',
          'verificationType deve ser null quando o parceiro não está verificado'
        );
      }
    }

    await this.partnerPort.updatePartnerVerificationProfile(partnerId, verification);
  }

  async getProfile(partnerId: string): Promise<PartnerProfileDocument | null> {
    if (!partnerId?.trim()) {
      throw new PartnerDomainError('INVALID_ARGUMENT', 'ID do parceiro é obrigatório');
    }
    return this.partnerPort.getPartnerProfile(partnerId);
  }

  async updatePartnerStatus(
    actor: { uid: string; admin?: boolean },
    partnerId: string,
    status: PartnerStatus
  ): Promise<void> {
    if (!partnerId?.trim()) {
      throw new PartnerDomainError('INVALID_ARGUMENT', 'ID do parceiro é obrigatório');
    }
    if (!actor.admin) {
      throw new PartnerDomainError(
        'FORBIDDEN',
        'Somente administradores podem alterar o status do parceiro'
      );
    }
    await this.partnerPort.updatePartnerStatus(partnerId, status);
  }

  async getAllPartnerIds(): Promise<string[]> {
    return this.partnerPort.getAllPartnerIds();
  }

  async getAllPartners(): Promise<PartnerProfileDocument[]> {
    return this.partnerPort.getAllPartners();
  }

  async deletePartnerProfile(partnerId: string): Promise<void> {
    if (!partnerId?.trim()) return;
    return this.partnerPort.deletePartnerProfile(partnerId);
  }

  async activateTrial(actor: { uid: string; admin?: boolean }, partnerId: string): Promise<string> {
    if (!partnerId?.trim()) {
      throw new PartnerDomainError('INVALID_ARGUMENT', 'ID do parceiro é obrigatório');
    }
    if (!actor.admin && actor.uid !== partnerId) {
      throw new PartnerDomainError(
        'FORBIDDEN',
        'Não autorizado a ativar trial para outro parceiro'
      );
    }

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    const verifiedUntil = expirationDate.toISOString();

    await this.partnerPort.activateTrialAtomically(partnerId, verifiedUntil);
    return verifiedUntil;
  }

  async restoreTrialState(partnerId: string, state: PartnerTrialState): Promise<void> {
    if (!partnerId?.trim()) {
      throw new PartnerDomainError('INVALID_ARGUMENT', 'ID do parceiro é obrigatório');
    }

    return this.partnerPort.restoreTrialStateAtomically(partnerId, state);
  }

  async linkBusiness(partnerId: string, business: PartnerBusiness): Promise<void> {
    if (!partnerId || !business?.businessId) {
      throw new PartnerDomainError(
        'INVALID_ARGUMENT',
        'partnerId e businessId são obrigatórios para associação'
      );
    }
    await this.partnerPort.linkBusiness(partnerId, business);
  }

  async updateBusiness(partnerId: string, business: PartnerBusiness): Promise<void> {
    if (!partnerId || !business?.businessId) {
      throw new PartnerDomainError(
        'INVALID_ARGUMENT',
        'partnerId e businessId são obrigatórios para atualização de negócio'
      );
    }
    await this.partnerPort.updateBusiness(partnerId, business);
  }

  async unlinkBusiness(partnerId: string, businessId: string): Promise<void> {
    if (!partnerId || !businessId) {
      throw new PartnerDomainError(
        'INVALID_ARGUMENT',
        'partnerId e businessId são obrigatórios para desassociação'
      );
    }
    await this.partnerPort.unlinkBusiness(partnerId, businessId);
  }
}
