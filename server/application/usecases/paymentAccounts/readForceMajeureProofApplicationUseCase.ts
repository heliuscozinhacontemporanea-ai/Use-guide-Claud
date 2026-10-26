import { readVerificationFileUseCase } from '../../../domain/media';
import { getForceMajeureProofPathUseCase } from '../../../domain/payment';

/** Admin abre a prova pelo backend: o arquivo nunca ganha URL pública nem assinada. */
export async function readForceMajeureProofApplicationUseCase(
  adminUid: string,
  debtId: string
): Promise<{ data: Buffer; contentType: string } | null> {
  const path = await getForceMajeureProofPathUseCase(debtId);
  if (!path) return null;
  // Auditoria (AGENTS.md §7.10 A09): quem abriu qual prova, sem dado pessoal no log.
  console.info('[audit] force_majeure_proof_read', { adminUid, debtId });
  return readVerificationFileUseCase(path);
}
