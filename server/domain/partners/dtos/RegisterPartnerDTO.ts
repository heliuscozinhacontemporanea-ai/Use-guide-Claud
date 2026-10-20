import type { PartnerRegistrationData } from '../types/partnerTypes';
import type { RegisterPartnerInput } from '../schemas/partnerSchema';

export class RegisterPartnerDTO {
  private constructor(public readonly formData: PartnerRegistrationData) {}

  static fromValidatedInput(input: RegisterPartnerInput): RegisterPartnerDTO {
    return new RegisterPartnerDTO({ termsAccepted: input.formData.termsAccepted });
  }
}
