import type { PartnerVerificationType } from '../types/partnerTypes';
import type { VerifyPartnerInput } from '../schemas/partnerSchema';

export class VerifyPartnerDTO {
  private constructor(
    public readonly partnerId: string,
    public readonly isVerified: boolean,
    public readonly verifiedUntil: string | null,
    public readonly verificationType: PartnerVerificationType
  ) {}

  static fromValidatedInput(input: VerifyPartnerInput): VerifyPartnerDTO {
    return new VerifyPartnerDTO(
      input.partnerId,
      Boolean(input.isVerified),
      input.verifiedUntil ?? null,
      (input.verificationType as PartnerVerificationType) ?? null
    );
  }
}
