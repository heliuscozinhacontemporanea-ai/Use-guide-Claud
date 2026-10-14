import type { AuthenticatedUserContext } from '../security/authenticatedUserContext';
import {
  getEventListingByIdUseCase,
  updateEventListingUseCase,
  type UpdateEventListingInput,
} from '../../domain/events';
import { updateBusinessUseCase } from '../../domain/partners';
import { updateEventListingSafelyApplicationUseCase } from './updateEventListingSafelyApplicationUseCase';

export async function updatePartnerEventApplicationUseCase(
  user: AuthenticatedUserContext,
  id: string,
  data: UpdateEventListingInput
): Promise<void> {
  const previous = await getEventListingByIdUseCase(id);
  if (!previous) {
    throw new Error('Evento não encontrado.');
  }

  const ownerId = previous.ownerId;
  if (typeof ownerId !== 'string' || !ownerId) {
    throw new Error('Proprietário do evento não encontrado.');
  }

  const updatePayload: UpdateEventListingInput = {
    ...data,
    title: data.name,
    coverImage: data.image,
  };

  await updateEventListingSafelyApplicationUseCase(user, id, updatePayload);

  if (data.name && data.name !== previous.name) {
    try {
      await updateBusinessUseCase(ownerId, {
        businessId: id,
        businessName: data.name,
        type: 'event',
      });
    } catch (error) {
      try {
        await updateEventListingUseCase(user, id, {
          name: previous.name,
          title: previous.title,
        });
      } catch (rollbackError) {
        console.error(
          '[updatePartnerEventApplicationUseCase] Falha no rollback do evento:',
          rollbackError
        );
      }

      throw error;
    }
  }
}
