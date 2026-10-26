import { adminFinanceApiAdapter } from '../../factory';

/** A prova fica em pasta privada; só o admin a recebe, pelo backend. */
export function readForceMajeureProofUseCase(debtId: string): Promise<Blob> {
  return adminFinanceApiAdapter.readForceMajeureProof(debtId);
}
