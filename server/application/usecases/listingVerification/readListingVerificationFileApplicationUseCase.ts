import { readVerificationFileUseCase } from '../../../domain/media';
import {
  getListingVerificationFilePathUseCase,
  type ListingVerificationFiles,
} from '../../../domain/partners';

/** Admin abre o documento pelo backend: o arquivo nunca ganha URL pública nem assinada. */
export async function readListingVerificationFileApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string,
  kind: keyof ListingVerificationFiles
): Promise<{ data: Buffer; contentType: string } | null> {
  const path = await getListingVerificationFilePathUseCase(actor, itemId, kind);
  if (!path) return null;
  // Auditoria (AGENTS.md §7.10 A09): quem abriu qual documento, sem dado pessoal no log.
  console.info('[audit] verification_file_read', { adminUid: actor.uid, itemId, kind });
  return readVerificationFileUseCase(path);
}
