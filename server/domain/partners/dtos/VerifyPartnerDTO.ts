import type { VerifyPartnerInput } from '../schemas/partnerSchema';

export class VerifyPartnerDTO {
  private constructor(
    public readonly partnerId: string,
    public readonly isVerified: boolean
  ) {}

  static fromValidatedInput(input: VerifyPartnerInput): VerifyPartnerDTO {
    return new VerifyPartnerDTO(input.partnerId, input.isVerified);
  }
}
