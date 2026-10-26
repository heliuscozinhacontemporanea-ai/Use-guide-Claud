import { uploadVerificationFileUseCase } from '../../../media';
import { receivablesApiAdapter } from '../../factory';
import type { AccountDebtView } from '../../types/receivables';

/** A prova vai para a pasta privada do parceiro antes da declaração (D16, 3A). */
export async function declareForceMajeureUseCase(
  debtId: string,
  declaration: { reason: string; proof: File }
): Promise<AccountDebtView> {
  const { fileId } = await uploadVerificationFileUseCase(declaration.proof);
  return receivablesApiAdapter.declareForceMajeure(debtId, {
    reason: declaration.reason.trim(),
    proofPath: fileId,
  });
}
