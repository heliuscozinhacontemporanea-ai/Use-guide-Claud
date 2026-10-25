import { partnerService } from '../factory';

/** Lança `PartnerDomainError` (`PARTNER_TERMS_NOT_ACCEPTED`) sem o aceite da versão atual (D15). */
export function assertPartnerTermsAcceptedUseCase(partnerId: string): Promise<void> {
  return partnerService.assertTermsAccepted(partnerId);
}
