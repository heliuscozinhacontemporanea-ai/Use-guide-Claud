import type { AuthenticatedUserContext } from '../security/authenticatedUserContext';
import { getEventListingByIdUseCase } from '../../domain/events';
import { linkBusinessUseCase, unlinkBusinessUseCase } from '../../domain/partners';
import { deleteEventListingSafelyApplicationUseCase } from './eventLifecycleOrchestrationUseCases';

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

export async function deletePartnerEventApplicationUseCase(
  user: AuthenticatedUserContext,
  id: string
): Promise<void> {
  const existing = await getEventListingByIdUseCase(id);

  if (!existing) {
    return;
  }

  const ownerId = existing.ownerId;

  if (typeof ownerId !== 'string' || !ownerId) {
    throw new Error('Proprietário do evento não encontrado.');
  }

  if (!user.admin && user.uid !== ownerId) {
    const err = new Error('Você não possui permissão sobre este evento.') as Error & {
      code?: string;
    };
    err.code = 'FORBIDDEN';
    throw err;
  }

  await unlinkBusinessUseCase(ownerId, id);

  try {
    await deleteEventListingSafelyApplicationUseCase(user, id);
  } catch (error) {
    if (!isNotFoundError(error)) {
      try {
        await linkBusinessUseCase(ownerId, {
          businessId: id,
          businessName: existing.name || existing.title || '',
          type: 'event',
        });
      } catch (rollbackError) {
        console.error(
          '[deletePartnerEventApplicationUseCase] Falha no rollback do vínculo Partner:',
          rollbackError
        );
      }
    }

    throw error;
  }
}
