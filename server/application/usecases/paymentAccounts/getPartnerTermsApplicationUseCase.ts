import { getPartnerTermsStatusUseCase } from '../../../domain/partners';
import {
  type PlatformFeeConfig,
  PlatformFeeConfigError,
  resolvePlatformFeeConfig,
} from '../../../shared/kernel/platformFees';

export interface PartnerTermsView {
  currentVersion: string;
  accepted: boolean;
  acceptedAt: string | null;
  /** Taxas vigentes para o texto dos termos; `null` quando a venda está sem configuração. */
  fees: PlatformFeeConfig | null;
}

function currentFees(): PlatformFeeConfig | null {
  try {
    return resolvePlatformFeeConfig();
  } catch (error) {
    if (error instanceof PlatformFeeConfigError) return null;
    throw error;
  }
}

/** Situação do aceite dos termos do parceiro (D15) com as taxas que o texto mostra. */
export async function getPartnerTermsApplicationUseCase(
  ownerUid: string
): Promise<PartnerTermsView> {
  const status = await getPartnerTermsStatusUseCase(ownerUid);
  return {
    currentVersion: status.currentVersion,
    accepted: status.accepted,
    acceptedAt: status.accepted ? (status.acceptance?.acceptedAt ?? null) : null,
    fees: currentFees(),
  };
}
