export { registerPartnerUseCase } from './usecases/registerPartnerUseCase';
export { getPartnerProfileUseCase } from './usecases/getPartnerProfileUseCase';
export { getAllPartnersUseCase } from './usecases/getAllPartnersUseCase';
export { getAllPartnerIdsUseCase } from './usecases/getAllPartnerIdsUseCase';
export { updatePartnerVerificationProfileUseCase } from './usecases/updatePartnerVerificationProfileUseCase';
export { updatePartnerStatusUseCase } from './usecases/updatePartnerStatusUseCase';
export { activatePartnerTrialUseCase } from './usecases/activatePartnerTrialUseCase';
export { restorePartnerTrialStateUseCase } from './usecases/restorePartnerTrialStateUseCase';
export { linkBusinessUseCase } from './usecases/linkBusinessUseCase';
export { updateBusinessUseCase } from './usecases/updateBusinessUseCase';
export { unlinkBusinessUseCase } from './usecases/unlinkBusinessUseCase';
export { deletePartnerProfileUseCase } from './usecases/deletePartnerProfileUseCase';

export type {
  PartnerStatus,
  PartnerVerificationType,
  PartnerBusinessType,
  PartnerBusiness,
  PartnerRegistrationData,
  PartnerVerificationData,
  PartnerTrialState,
  PartnerProfileDocument,
  PartnerPersistenceDocument,
  PartnerProfileDTO,
  PublicPartnerProfileDTO,
} from './types/partnerTypes';

export { PartnerDomainError } from './errors/partnerDomainError';
export { hasActivePlanVerification, resolveAdminVerification } from './utils/adminVerification';
