import { debtService } from '../factory';

/** Quem chama garante o papel de admin. */
export function getForceMajeureProofPathUseCase(debtId: string): Promise<string | null> {
  return debtService.getForceMajeureProofPath(debtId);
}
