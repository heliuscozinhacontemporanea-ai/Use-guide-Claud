import type { AuthenticatedUserContext } from '../security/authenticatedUserContext';
import { getItemByIdUseCase, deleteGuideItemUseCase } from '../../domain/guide';
import {
  deleteListingVerificationUseCase,
  linkBusinessUseCase,
  unlinkBusinessUseCase,
} from '../../domain/partners';
import { deleteVerificationFiles } from './listingVerification/deleteVerificationFiles';

function isNotFoundError(error: unknown): boolean {
  if (!error) return false;
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 'NOT_FOUND'
  ) {
    return true;
  }
  if (error instanceof Error && error.message.toLowerCase().includes('não encontrado')) {
    return true;
  }
  return false;
}

export async function deletePartnerItemApplicationUseCase(
  user: AuthenticatedUserContext,
  id: string
): Promise<void> {
  const existing = await getItemByIdUseCase(id);

  if (!existing) {
    return;
  }

  const ownerId = existing.ownerId;

  if (typeof ownerId !== 'string' || !ownerId) {
    throw new Error('Proprietário do item não encontrado.');
  }

  await unlinkBusinessUseCase(ownerId, id);

  try {
    await deleteGuideItemUseCase(user, id);
  } catch (error) {
    if (!isNotFoundError(error)) {
      try {
        await linkBusinessUseCase(ownerId, {
          businessId: id,
          businessName: existing.name || '',
          type: 'item',
        });
      } catch (rollbackError) {
        console.error(
          '[deletePartnerItemApplicationUseCase] Falha no rollback do vínculo Partner:',
          rollbackError
        );
      }
    }

    throw error;
  }

  // Documento e arquivos de verificação saem junto com o estabelecimento (LGPD, §7.5).
  await deleteVerificationFiles(await deleteListingVerificationUseCase(id));
}
