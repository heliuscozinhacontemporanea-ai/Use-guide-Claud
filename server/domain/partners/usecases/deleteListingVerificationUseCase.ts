import { getListingVerificationService } from '../factory';

/** Devolve os caminhos dos arquivos enviados, para quem orquestra apagá-los do Storage. */
export function deleteListingVerificationUseCase(itemId: string): Promise<string[]> {
  return getListingVerificationService().deleteForListing(itemId);
}
