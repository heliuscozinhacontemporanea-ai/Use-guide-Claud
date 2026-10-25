import { acceptPartnerTermsUseCase } from '../../../domain/partners';
import {
  getPartnerTermsApplicationUseCase,
  type PartnerTermsView,
} from './getPartnerTermsApplicationUseCase';

export async function acceptPartnerTermsApplicationUseCase(
  ownerUid: string,
  version: string
): Promise<PartnerTermsView> {
  await acceptPartnerTermsUseCase(ownerUid, version);
  return getPartnerTermsApplicationUseCase(ownerUid);
}
